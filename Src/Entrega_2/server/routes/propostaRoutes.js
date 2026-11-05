import { consultarCobertura, conflitoCobertura } from '../services/cobertura.js'
import { Router } from 'express'
import sql from '../config/db.js'
import { autenticar, permitir } from '../middlewares/autenticacao.js'
const router = Router()
router.use(autenticar, permitir('fornecedor', 'organizador'))

router.get('/', async (req, res, next) => {
    try {
        const fornecedor = req.usuario.perfil === 'fornecedor'
        // Fragmento condicional: é inlinado dentro do template abaixo, não
        // vira um parâmetro de valor comum.
        const filtro = fornecedor
            ? sql`s.id_fornecedor_fk = ${req.usuario.id_usuario}`
            : sql`e.id_organizador_fk = ${req.usuario.id_usuario}`

        const rows = await sql`
            SELECT s.*, e.titulo_evento, f.nome_organizacao AS fornecedor, o.nome_organizacao AS organizador
            FROM solicitacao_fornecimento s
            JOIN evento e ON e.id_evento = s.id_evento_fk
            JOIN fornecedor f ON f.id_fornecedor = s.id_fornecedor_fk
            JOIN organizador o ON o.id_organizador = e.id_organizador_fk
            WHERE ${filtro}
            ORDER BY s.criada_em DESC
        `
        if (!rows.length) return res.json([])

        const produtos = await sql`
            SELECT p.* FROM produto_solicitacao p
            WHERE p.id_solicitacao_fk = ANY(${sql.array(rows.map((r) => r.id), 23)})
        `
        res.json(rows.map((r) => ({ ...r, produtos: produtos.filter((p) => p.id_solicitacao_fk === r.id) })))
    } catch (e) { next(e) }
})

// Confere os campos de um produto da proposta (o objeto já foi validado antes).
function produtoValido(p) {
    const quantidade = Number(p.quantidade)
    const valor = Number(p.valorUnitario)

    return (
        Number.isInteger(Number(p.itemId)) &&
        typeof p.produto === 'string' &&
        p.produto.trim() !== '' &&
        p.produto.length <= 255 &&
        Number.isInteger(quantidade) &&
        quantidade >= 1 &&
        quantidade <= 1000000 &&
        /^\d+(\.\d{1,2})?$/.test(String(p.valorUnitario)) && // até 2 casas decimais
        valor > 0 &&
        valor <= 9999999999
    )
}

router.post('/', permitir('fornecedor'), async (req, res, next) => {
    const { eventoId, mensagem, produtos } = req.body

    const mensagemValida = typeof mensagem === 'string' && mensagem.trim() !== '' && mensagem.length <= 1000
    const listaValida = Array.isArray(produtos) && produtos.length > 0 && produtos.length <= 100

    if (!Number.isInteger(Number(eventoId)) || !mensagemValida || !listaValida) {
        return res.status(400).json({ erro: 'Informe os produtos e uma mensagem de até 1.000 caracteres.' })
    }
    if (produtos.some((p) => !p || typeof p !== 'object')) {
        return res.status(400).json({ erro: 'Produtos inválidos.' })
    }

    // O mesmo item de custo não pode aparecer duas vezes na mesma proposta.
    const ids = produtos.map((p) => Number(p.itemId))
    const temItemRepetido = new Set(ids).size !== ids.length

    if (temItemRepetido || !produtos.every(produtoValido)) {
        return res.status(400).json({ erro: 'Confira os produtos, quantidades e valores positivos com até duas casas decimais.' })
    }

    try {
        const id = await sql.begin(async (sql) => {
            const [evento] = await sql`
                SELECT id_evento FROM evento WHERE id_evento = ${eventoId} AND status_publicacao = 'publicado' FOR UPDATE
            `
            if (!evento) {
                const erro = new Error('Evento indisponível para propostas.')
                erro.status = 404
                throw erro
            }

            const itens = await consultarCobertura(sql, eventoId)
            if (conflitoCobertura(itens, produtos)) {
                const erro = new Error('A quantidade oferecida ultrapassa o saldo disponível. Atualize os detalhes do evento.')
                erro.status = 409
                throw erro
            }

            const [{ id: idSolicitacao }] = await sql`
                INSERT INTO solicitacao_fornecimento (id_evento_fk, id_fornecedor_fk, mensagem)
                VALUES (${eventoId}, ${req.usuario.id_usuario}, ${mensagem.trim()})
                RETURNING id
            `

            // Salva cada produto da proposta.
            for (const p of produtos) {
                await sql`
                    INSERT INTO produto_solicitacao (id_solicitacao_fk, id_item_custo_fk, produto, quantidade, valor_unitario)
                    VALUES (${idSolicitacao}, ${p.itemId}, ${p.produto.trim()}, ${p.quantidade}, ${p.valorUnitario})
                `
            }

            return idSolicitacao
        })

        res.status(201).json({ id })
    } catch (e) {
        if (e.status) return res.status(e.status).json({ erro: e.message })
        next(e)
    }
})

router.patch('/:id', permitir('organizador'), async (req, res, next) => {
    if (!['aceita', 'recusada'].includes(req.body.status)) return res.status(400).json({ erro: 'Resposta inválida.' })

    try {
        await sql.begin(async (sql) => {
            // Primeiro bloqueia o evento: envios e respostas usam a mesma ordem de bloqueio.
            const [evento] = await sql`
                SELECT e.id_evento FROM evento e
                JOIN solicitacao_fornecimento s ON s.id_evento_fk = e.id_evento
                WHERE s.id = ${req.params.id} AND e.id_organizador_fk = ${req.usuario.id_usuario}
                FOR UPDATE
            `
            if (!evento) {
                const erro = new Error('Proposta não encontrada.')
                erro.status = 404
                throw erro
            }

            const [proposta] = await sql`
                SELECT * FROM solicitacao_fornecimento WHERE id = ${req.params.id} FOR UPDATE
            `
            if (proposta.status !== 'enviada') {
                const erro = new Error('Proposta já respondida.')
                erro.status = 409
                throw erro
            }

            if (req.body.status === 'aceita') {
                const itens = await consultarCobertura(sql, evento.id_evento)
                const produtos = await sql`
                    SELECT * FROM produto_solicitacao WHERE id_solicitacao_fk = ${req.params.id}
                `
                if (!produtos.length || conflitoCobertura(itens, produtos)) {
                    const erro = new Error('Não foi possível aceitar: um ou mais itens ultrapassam o saldo restante do evento. Outra proposta pode já ter sido aceita.')
                    erro.status = 409
                    throw erro
                }
            }

            await sql`
                UPDATE solicitacao_fornecimento SET status = ${req.body.status}, respondida_em = NOW() WHERE id = ${req.params.id}
            `
        })

        res.json({ ok: true })
    } catch (e) {
        if (e.status) return res.status(e.status).json({ erro: e.message })
        next(e)
    }
})
export default router