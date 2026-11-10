// Compra de ingressos e saldo do cliente (pagamento SIMULADO: nenhum gateway real, nenhum dinheiro real).
// Depende das tabelas `compra` e `movimentacao_saldo` da proposta docs/database-changes-proposal.md.
// Regras que o servidor garante (o front-end só mostra):
//  - o total é calculado aqui, com o preço do banco;
//  - não vende mais do que a capacidade do evento;
//  - saldo e compra mudam juntos, numa transação (sql.begin);
//  - o cliente só enxerga o que é dele (o id vem do token).
import { randomBytes } from 'node:crypto'
import { Router } from 'express'
import sql from '../config/db.js'
import { autenticar, permitir } from '../middlewares/autenticacao.js'

const router = Router()
router.use(['/eventos/:id/ingressos', '/compras', '/saldo'], autenticar, permitir('cliente'))

const TIPOS = { lote_inicial: 'Lote inicial', segundo_lote: 'Segundo lote' } // os dois preços que o evento já tem
const MAX_POR_COMPRA = 10
const RECARGA_MIN = 10
const RECARGA_MAX = 5000

// Dinheiro em centavos (inteiro) para não ter erro de arredondamento
const centavos = (valor) => Math.round(Number(valor) * 100)
const reais = (c) => c / 100

// Erro de regra de negócio: vira resposta HTTP com a mensagem
class ErroNegocio extends Error {
    constructor(status, mensagem, extras = {}) {
        super(mensagem)
        this.status = status
        this.extras = extras
    }
}

const rota = (funcao) => async (req, res, next) => {
    try {
        await funcao(req, res)
    } catch (erro) {
        if (erro instanceof ErroNegocio) return res.status(erro.status).json({ erro: erro.message, ...erro.extras })
        next(erro)
    }
}

const lerId = (valor) => (/^\d{1,9}$/.test(String(valor)) && Number(valor) > 0 ? Number(valor) : null)

// Preço de cada tipo à venda no evento (em reais). Tipo sem preço não é vendido.
function precosDoEvento(evento) {
    const precos = {}
    if (centavos(evento.lote_inicial) > 0) precos.lote_inicial = reais(centavos(evento.lote_inicial))
    if (centavos(evento.segundo_lote) > 0) precos.segundo_lote = reais(centavos(evento.segundo_lote))
    return precos
}

async function ingressosVendidos(tx, idEvento) {
    const [linha] = await tx`SELECT COALESCE(SUM(quantidade), 0) AS total FROM compra WHERE id_evento_fk = ${idEvento}`
    return Number(linha.total)
}

// saldo = soma dos créditos (recarga) menos os débitos (compra). Não existe número para alterar direto.
async function saldoEmCentavos(tx, idUsuario) {
    const [linha] = await tx`
        SELECT COALESCE(SUM(CASE WHEN tipo = 'recarga' THEN valor ELSE -valor END), 0) AS saldo
        FROM movimentacao_saldo WHERE id_usuario_fk = ${idUsuario}
    `
    return centavos(linha.saldo)
}

const compraParaJson = (c) => ({
    ...c,
    valor_unitario: Number(c.valor_unitario),
    valor_total: Number(c.valor_total),
    tipo_nome: TIPOS[c.tipo],
    status: 'Aprovada',
})

// ── ingressos disponíveis de um evento ────────────────────────────────────────
router.get('/eventos/:id/ingressos', rota(async (req, res) => {
    const idEvento = lerId(req.params.id)
    const [evento] = idEvento ? await sql`
            SELECT e.id_evento, e.titulo_evento, e.publico_maximo, e.status_publicacao, e.endereco,
                TO_CHAR(e.data_inicio, 'YYYY-MM-DD') AS data, (e.data_fim < NOW()) AS encerrado,
                COALESCE(e.ticket_estimado, e.qtd_lote_minimo) AS lote_inicial, e.qtd_lote_maximo AS segundo_lote
            FROM evento e WHERE e.id_evento = ${idEvento}
        ` : []
    if (!evento || evento.status_publicacao !== 'publicado') throw new ErroNegocio(404, 'Evento não encontrado.')

    const precos = precosDoEvento(evento)
    const capacidade = Number(evento.publico_maximo) || 0
    const disponiveis = Math.max(0, capacidade - (await ingressosVendidos(sql, idEvento)))

    let motivo = null
    if (evento.encerrado) motivo = 'Este evento já terminou.'
    else if (Object.keys(precos).length === 0) motivo = 'O organizador ainda não definiu o preço dos ingressos.'
    else if (disponiveis === 0) motivo = 'Os ingressos deste evento estão esgotados.'

    res.json({
        tipos: Object.entries(precos).map(([tipo, preco]) => ({ tipo, nome: TIPOS[tipo], preco })),
        disponiveis,
        max_por_compra: Math.min(MAX_POR_COMPRA, disponiveis),
        venda_aberta: motivo === null,
        motivo,
    })
}))

// ── comprar ───────────────────────────────────────────────────────────────────
// Uma chamada só: valida, calcula, "paga" (simulado) e grava, tudo numa transação.
// metodo: 'saldo' (o servidor confere o saldo de verdade) ou 'cartao' (o `resultado` escolhido na tela decide).
// Pagamento recusado NÃO grava nada: nenhuma compra, nenhum ingresso, nenhum débito.
router.post('/compras', rota(async (req, res) => {
    const idUsuario = req.usuario.id_usuario
    const { eventoId, tipo, quantidade, metodo, resultado = 'aprovado' } = req.body ?? {}
    const idEvento = lerId(eventoId)

    if (!idEvento) throw new ErroNegocio(400, 'Evento inválido.')
    if (!Object.hasOwn(TIPOS, tipo)) throw new ErroNegocio(400, 'Tipo de ingresso inválido.')
    if (!Number.isInteger(quantidade) || quantidade < 1) throw new ErroNegocio(400, 'A quantidade precisa ser um número inteiro de pelo menos 1.')
    if (quantidade > MAX_POR_COMPRA) throw new ErroNegocio(400, `Você pode comprar no máximo ${MAX_POR_COMPRA} ingressos por compra.`)
    if (!['saldo', 'cartao'].includes(metodo)) throw new ErroNegocio(400, 'Método de pagamento inválido.')
    if (!['aprovado', 'recusado'].includes(resultado)) throw new ErroNegocio(400, 'Resultado da simulação inválido.')

    const saida = await sql.begin(async (tx) => {
        // trava o evento (duas pessoas comprando o último ingresso) e o cliente (duas compras ao mesmo tempo gastando o mesmo saldo)
        const [evento] = await tx`
            SELECT e.id_evento, e.titulo_evento, e.publico_maximo, e.status_publicacao, e.endereco,
                TO_CHAR(e.data_inicio, 'YYYY-MM-DD') AS data, (e.data_fim < NOW()) AS encerrado,
                COALESCE(e.ticket_estimado, e.qtd_lote_minimo) AS lote_inicial, e.qtd_lote_maximo AS segundo_lote
            FROM evento e WHERE e.id_evento = ${idEvento} FOR UPDATE
        `
        const [cliente] = await tx`SELECT nome, username FROM usuario WHERE id_usuario = ${idUsuario} FOR UPDATE`
        if (!evento || evento.status_publicacao !== 'publicado') throw new ErroNegocio(404, 'Evento não encontrado.')
        if (evento.encerrado) throw new ErroNegocio(409, 'Este evento já terminou.')

        const preco = precosDoEvento(evento)[tipo]
        if (!preco) throw new ErroNegocio(400, 'Este tipo de ingresso não está à venda neste evento.')

        const disponiveis = Math.max(0, (Number(evento.publico_maximo) || 0) - (await ingressosVendidos(tx, idEvento)))
        if (quantidade > disponiveis) {
            throw new ErroNegocio(409, disponiveis === 0 ? 'Os ingressos deste evento estão esgotados.' : `Só restam ${disponiveis} ingresso${disponiveis > 1 ? 's' : ''} para este evento.`, { disponiveis })
        }

        const total = centavos(preco) * quantidade // o total NUNCA vem do front-end
        const saldo = metodo === 'saldo' ? await saldoEmCentavos(tx, idUsuario) : 0

        if (metodo === 'saldo' ? saldo < total : resultado === 'recusado') {
            return { aprovado: false, motivo: metodo === 'saldo' ? 'Saldo insuficiente para concluir a compra.' : 'Pagamento recusado pela operadora (simulação).' }
        }

        const codigo = randomBytes(6).toString('hex').toUpperCase()
        const [compra] = await tx`
            INSERT INTO compra (id_usuario_fk, id_evento_fk, tipo_ingresso, quantidade, valor_unitario, valor_total, metodo, codigo)
            VALUES (${idUsuario}, ${idEvento}, ${tipo}, ${quantidade}, ${preco}, ${reais(total)}, ${metodo}, ${codigo})
            RETURNING id_compra AS id, criado_em
        `
        if (metodo === 'saldo') {
            await tx`
                INSERT INTO movimentacao_saldo (id_usuario_fk, tipo, descricao, valor, saldo_resultante)
                VALUES (${idUsuario}, 'compra', ${`Compra: ${evento.titulo_evento}`}, ${reais(total)}, ${reais(saldo - total)})
            `
        }
        return {
            aprovado: true,
            compra: {
                id: compra.id, criado_em: compra.criado_em, codigo, tipo, quantidade, metodo,
                valor_unitario: preco, valor_total: reais(total),
                evento_titulo: evento.titulo_evento, evento_data: evento.data, evento_endereco: evento.endereco,
                comprador_nome: cliente.nome, comprador_username: cliente.username,
            },
        }
    })

    if (!saida.aprovado) return res.json({ resultado: 'recusado', simulacao: true, motivo: saida.motivo })
    res.status(201).json({ resultado: 'aprovado', simulacao: true, compra: compraParaJson(saida.compra) })
}))

// ── ingressos comprados pelo cliente ──────────────────────────────────────────
router.get('/compras', rota(async (req, res) => {
    const compras = await sql`
        SELECT c.id_compra AS id, c.tipo_ingresso AS tipo, c.quantidade, c.valor_unitario, c.valor_total, c.metodo, c.codigo, c.criado_em,
            e.titulo_evento AS evento_titulo, TO_CHAR(e.data_inicio, 'YYYY-MM-DD') AS evento_data, e.endereco AS evento_endereco
        FROM compra c JOIN evento e ON e.id_evento = c.id_evento_fk
        WHERE c.id_usuario_fk = ${req.usuario.id_usuario}
        ORDER BY c.id_compra DESC
    `
    res.json(compras.map(compraParaJson))
}))

// ── saldo ─────────────────────────────────────────────────────────────────────
router.get('/saldo', rota(async (req, res) => {
    const idUsuario = req.usuario.id_usuario
    const movimentacoes = await sql`
        SELECT id_movimentacao AS id, tipo, descricao, valor, saldo_resultante, criado_em
        FROM movimentacao_saldo WHERE id_usuario_fk = ${idUsuario}
        ORDER BY id_movimentacao DESC LIMIT 50
    `
    // compra paga no cartao nao mexe no saldo (nao fica em movimentacao_saldo), mas aparece no historico
    const comprasNoCartao = await sql`
        SELECT c.id_compra AS id, c.quantidade, c.valor_total, c.criado_em, e.titulo_evento
        FROM compra c JOIN evento e ON e.id_evento = c.id_evento_fk
        WHERE c.id_usuario_fk = ${idUsuario} AND c.metodo = 'cartao'
        ORDER BY c.id_compra DESC LIMIT 50
    `
    const historico = [
        ...movimentacoes.map((m) => ({ ...m, origem: 'saldo', valor: Number(m.valor), saldo_resultante: Number(m.saldo_resultante) })),
        ...comprasNoCartao.map((c) => ({
            id: c.id, origem: 'cartao', tipo: 'compra_cartao',
            descricao: `Compra: ${c.titulo_evento} (${c.quantidade} ingresso${c.quantidade > 1 ? 's' : ''}) · pago no cartão, o saldo não muda`,
            valor: Number(c.valor_total), saldo_resultante: null, criado_em: c.criado_em,
        })),
    ].sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em)).slice(0, 50)

    res.json({
        saldo: reais(await saldoEmCentavos(sql, idUsuario)),
        limites: { minimo: RECARGA_MIN, maximo: RECARGA_MAX },
        movimentacoes: historico,
    })
}))

// Adição de saldo simulada. Recusada: não grava nada e o saldo continua igual.
router.post('/saldo/adicionar', rota(async (req, res) => {
    const idUsuario = req.usuario.id_usuario
    const { valor, resultado = 'aprovado' } = req.body ?? {}
    const texto = String(valor ?? '').trim()

    if (!/^\d+(?:[.,]\d{1,2})?$/.test(texto)) throw new ErroNegocio(400, 'Informe um valor válido em reais, com até 2 casas decimais.')
    const adicionar = centavos(texto.replace(',', '.'))
    if (adicionar < RECARGA_MIN * 100 || adicionar > RECARGA_MAX * 100) {
        throw new ErroNegocio(400, `O valor precisa estar entre R$ ${RECARGA_MIN},00 e R$ ${RECARGA_MAX.toLocaleString('pt-BR')},00.`)
    }
    if (!['aprovado', 'recusado'].includes(resultado)) throw new ErroNegocio(400, 'Resultado da simulação inválido.')

    const saida = await sql.begin(async (tx) => {
        await tx`SELECT id_usuario FROM usuario WHERE id_usuario = ${idUsuario} FOR UPDATE` // uma operação de saldo por vez
        const atual = await saldoEmCentavos(tx, idUsuario)
        if (resultado === 'recusado') return { aprovado: false, saldo: atual }

        await tx`
            INSERT INTO movimentacao_saldo (id_usuario_fk, tipo, descricao, valor, saldo_resultante)
            VALUES (${idUsuario}, 'recarga', 'Adição de saldo (simulada)', ${reais(adicionar)}, ${reais(atual + adicionar)})
        `
        return { aprovado: true, saldo: atual + adicionar }
    })

    if (!saida.aprovado) return res.json({ resultado: 'recusado', simulacao: true, motivo: 'Operação recusada pela operadora (simulação).', saldo: reais(saida.saldo) })
    res.status(201).json({ resultado: 'aprovado', simulacao: true, valor: reais(adicionar), saldo: reais(saida.saldo) })
}))

export default router
