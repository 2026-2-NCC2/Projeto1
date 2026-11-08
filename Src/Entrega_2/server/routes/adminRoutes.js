import { Router } from 'express'
import sql from '../config/db.js'
import { montarTicketDoEvento } from '../services/ticket.js'
import { autenticar, permitir } from '../middlewares/autenticacao.js';


const router = Router()

router.get("/admin/cadastros", autenticar, permitir("administrador"), async (req, res, next) => {
    try{
        const resultado = await sql`
            SELECT u.id_usuario AS id, u.nome, u.email, u.data_criacao,
            'organizador' AS tipo, o.nome_organizacao AS empresa, o.cnpj,
            o.status_aprovacao AS status
            FROM usuario u
            JOIN organizador o ON u.id_usuario = o.id_organizador

            UNION ALL

            SELECT u.id_usuario AS id, u.nome, u.email, u.data_criacao,
            'fornecedor' AS tipo, f.nome_organizacao AS empresa, f.cnpj,
            f.status_aprovacao AS status
            FROM usuario u
            JOIN fornecedor f ON u.id_usuario = f.id_fornecedor

            ORDER BY data_criacao DESC
        `

        res.json(resultado);
    }
    catch(erro){
        next(erro) // o tratador central (middlewares/erros.js) responde 500 sem vazar detalhes
    }
})

// PATCH /api/admin/cadastros/:id — aprova ou rejeita um cadastro
router.patch('/admin/cadastros/:id', autenticar, permitir("administrador"), async (req, res, next) => {
    const { id } = req.params
    const { tipo, status } = req.body

    // whitelist: so aceita esses valores exatos, protege contra SQL injection no nome da tabela/coluna
    if (!['organizador', 'fornecedor'].includes(tipo)) {
        return res.status(400).json({ erro: 'Tipo inválido.' })
    }
    if (!['aprovado', 'rejeitado'].includes(status)) {
        return res.status(400).json({ erro: 'Status inválido.' })
    }

    const tabela = tipo === 'organizador' ? 'organizador' : 'fornecedor'
    const coluna = tipo === 'organizador' ? 'id_organizador' : 'id_fornecedor'

    try {
        // sql(tabela)/sql(coluna) tratam o valor como identificador (nome de
        // tabela/coluna), não como parâmetro de valor — é assim que o
        // postgres.js lida com nomes dinâmicos com segurança.
        const resultado = await sql`
            UPDATE ${sql(tabela)} SET status_aprovacao = ${status} WHERE ${sql(coluna)} = ${id}
        `

        if (resultado.count === 0) {
            return res.status(404).json({ erro: 'Cadastro não encontrado.' })
        }

        res.json({ ok: true, status })
    } catch (erro) {
        next(erro)
    }
})


// Consultas gerenciais (RF14): somente leitura e exclusivas do administrador.
router.get('/admin/usuarios', autenticar, permitir('administrador'), async (req, res, next) => {
    try {
        const usuarios = await sql`
            SELECT u.id_usuario AS id, u.nome, u.email, u.perfil, u.data_criacao,
                COALESCE(o.nome_organizacao, f.nome_organizacao) AS empresa,
                COALESCE(o.status_aprovacao, f.status_aprovacao) AS status
            FROM usuario u
            LEFT JOIN organizador o ON o.id_organizador = u.id_usuario
            LEFT JOIN fornecedor f ON f.id_fornecedor = u.id_usuario
            ORDER BY u.data_criacao DESC
        `
        res.json(usuarios)
    } catch (erro) { next(erro) }
})

router.get('/admin/relatorios', autenticar, permitir('administrador'), async (req, res, next) => {
    try {
        const eventos = await sql`
            SELECT e.id_evento AS id, e.titulo_evento AS titulo, e.status_publicacao,
                e.data_inicio, o.nome_organizacao AS organizador,
                (SELECT COUNT(*) FROM solicitacao_fornecimento s WHERE s.id_evento_fk = e.id_evento) AS propostas,
                (SELECT COUNT(*) FROM solicitacao_fornecimento s WHERE s.id_evento_fk = e.id_evento AND s.status = 'aceita') AS aceitas,
                (SELECT COALESCE(SUM(p.quantidade * p.valor_unitario), 0)
                 FROM produto_solicitacao p JOIN solicitacao_fornecimento s ON s.id = p.id_solicitacao_fk
                 WHERE s.id_evento_fk = e.id_evento AND s.status = 'aceita') AS valor_aceito
            FROM evento e JOIN organizador o ON o.id_organizador = e.id_organizador_fk
            ORDER BY e.created_at DESC
        `
        res.json(eventos)
    } catch (erro) { next(erro) }
})

router.get('/admin/eventos/:id', autenticar, permitir('administrador'), async (req, res, next) => {
    if (!/^\d+$/.test(req.params.id) || Number(req.params.id) > 2147483647) {
        return res.status(400).json({ erro: 'Evento inválido.' })
    }
    try {
        const [evento] = await sql`SELECT * FROM evento WHERE id_evento = ${req.params.id}`
        if (!evento) return res.status(404).json({ erro: 'Evento não encontrado.' })
        const itens = await sql`SELECT categoria, descricao_detalhada, quantidade, valor_unitario FROM itemcusto WHERE id_evento_fk = ${req.params.id} ORDER BY id_item_custo`
        const independentes = await sql`SELECT tipo_custo, descricao, valor FROM custoindependente WHERE id_evento_fk = ${req.params.id} ORDER BY id_custo_independente`
        const propostas = await sql`
            SELECT s.id, f.nome_organizacao AS fornecedor, s.status, s.mensagem,
                COALESCE(SUM(p.quantidade * p.valor_unitario), 0) AS valor
            FROM solicitacao_fornecimento s
            JOIN fornecedor f ON f.id_fornecedor = s.id_fornecedor_fk
            LEFT JOIN produto_solicitacao p ON p.id_solicitacao_fk = s.id
            WHERE s.id_evento_fk = ${req.params.id}
            GROUP BY s.id, f.nome_organizacao ORDER BY s.criada_em DESC
        `
        const ticket = await montarTicketDoEvento(sql, evento)
        res.json({ itens, independentes, propostas, ticket })
    } catch (erro) { next(erro) }
})

export default router
