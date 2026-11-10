// Testes da compra de ingressos e do saldo do cliente (pagamento SIMULADO).
// Usam um banco simulado em memória (mesma ideia dos outros testes): não substituem o Postgres real,
// e as tabelas `compra` e `movimentacao_saldo` ainda dependem da migration de docs/database-changes-proposal.md.
import { registerHooks } from 'node:module'
import { test, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import jwt from 'jsonwebtoken'

process.env.JWT_SECRET = 'segredo-de-teste'
const assinar = (id, perfil) => jwt.sign({ id_usuario: id, perfil }, process.env.JWT_SECRET)
const tokens = { ana: assinar(1, 'cliente'), bia: assinar(2, 'cliente'), org: assinar(8, 'organizador') }

// ── banco simulado: só as consultas que as rotas fazem ───────────────────────
let evento, compras, movs
function zerar() {
    evento = { id_evento: 1, titulo_evento: 'Festival', publico_maximo: 5, status_publicacao: 'publicado', endereco: 'Av. Paulista', data: '2026-12-20', encerrado: false, lote_inicial: '50.00', segundo_lote: '80.00' }
    compras = []
    movs = []
}
const saldoDe = (uid) => movs.filter((m) => m.uid === uid).reduce((s, m) => s + (m.tipo === 'recarga' ? m.valor : -m.valor), 0)
const nomes = { 1: { nome: 'Ana', username: 'ana' }, 2: { nome: 'Bia', username: 'bia' } }

function consulta(texto, a) {
    const t = texto.replace(/\s+/g, ' ').trim()
    if (/FROM evento e WHERE e\.id_evento = \?/.test(t)) return Number(a[0]) === 1 ? [evento] : []
    if (/SUM\(quantidade\), 0\) AS total FROM compra/.test(t)) return [{ total: compras.reduce((s, c) => s + c.quantidade, 0) }]
    if (/SUM\(CASE WHEN tipo = 'recarga'/.test(t)) return [{ saldo: saldoDe(a[0]) }]
    if (/SELECT nome, username FROM usuario/.test(t)) return [nomes[a[0]]]
    if (/SELECT id_usuario FROM usuario/.test(t)) return [{ id_usuario: a[0] }]
    if (t.startsWith('INSERT INTO compra')) {
        const c = { id: compras.length + 1, uid: a[0], quantidade: a[3], tipo: a[2], valor_unitario: a[4], valor_total: a[5], metodo: a[6], codigo: a[7], criado_em: new Date() }
        compras.push(c)
        return [{ id: c.id, criado_em: c.criado_em }]
    }
    if (t.startsWith('INSERT INTO movimentacao_saldo') && t.includes("'compra'")) { movs.push({ uid: a[0], tipo: 'compra', descricao: a[1], valor: a[2], saldo_resultante: a[3], criado_em: new Date() }); return [] }
    if (t.startsWith('INSERT INTO movimentacao_saldo')) { movs.push({ uid: a[0], tipo: 'recarga', descricao: 'Adição de saldo (simulada)', valor: a[1], saldo_resultante: a[2], criado_em: new Date() }); return [] }
    if (/FROM compra c JOIN evento e .* c\.metodo = 'cartao'/.test(t)) return compras.filter((c) => c.uid === a[0] && c.metodo === 'cartao').reverse().map((c) => ({ ...c, titulo_evento: 'Festival' }))
    if (/FROM compra c JOIN evento e/.test(t)) return compras.filter((c) => c.uid === a[0]).reverse().map((c) => ({ ...c, evento_titulo: 'Festival' }))
    if (/FROM movimentacao_saldo WHERE id_usuario_fk = \? ORDER BY/.test(t)) return movs.filter((m) => m.uid === a[0]).reverse().map((m, i) => ({ id: i, ...m }))
    throw new Error(`SQL inesperado: ${t}`)
}
const sqlFalso = (partes, ...valores) => {
    const texto = partes.reduce((acc, p, i) => acc + (i ? '?' : '') + p, '')
    return { then: (ok, falha) => Promise.resolve().then(() => consulta(texto, valores)).then(ok, falha) }
}
sqlFalso.begin = (fn) => fn(sqlFalso)
globalThis.__testSql = sqlFalso
registerHooks({ resolve(spec, ctx, next) { if (spec.endsWith('/config/db.js')) return { url: 'data:text/javascript,export default globalThis.__testSql', shortCircuit: true }; return next(spec, ctx) } })
const { default: compra } = await import('../routes/compraRoutes.js')
const app = express(); app.use(express.json()); app.use('/api', compra)
app.use((e, req, res, next) => res.status(500).json({ erro: e.message }))
const server = app.listen(0, '127.0.0.1'); await new Promise((r) => server.once('listening', r))
after(() => server.close())
const base = `http://127.0.0.1:${server.address().port}/api`
async function pedir(caminho, quem, metodo = 'GET', corpo) {
    const r = await fetch(base + caminho, { method: metodo, headers: { 'Content-Type': 'application/json', ...(quem ? { Authorization: `Bearer ${tokens[quem]}` } : {}) }, ...(corpo ? { body: JSON.stringify(corpo) } : {}) })
    return { status: r.status, corpo: await r.json() }
}
const comprar = (quem, extra = {}) => pedir('/compras', quem, 'POST', { eventoId: 1, tipo: 'lote_inicial', quantidade: 2, metodo: 'cartao', resultado: 'aprovado', ...extra })
beforeEach(zerar)

// ── testes ───────────────────────────────────────────────────────────────────
test('só cliente logado acessa as rotas', async () => {
    for (const rota of ['/saldo', '/compras', '/eventos/1/ingressos']) {
        assert.equal((await pedir(rota)).status, 401, rota)
        assert.equal((await pedir(rota, 'org')).status, 403, rota)
    }
    assert.equal((await pedir('/compras', null, 'POST', {})).status, 401)
    assert.equal((await pedir('/compras', 'org', 'POST', {})).status, 403)
})

test('lista os tipos de ingresso com preço e quantidade disponível', async () => {
    const r = await pedir('/eventos/1/ingressos', 'ana')
    assert.equal(r.status, 200)
    assert.deepEqual(r.corpo.tipos, [{ tipo: 'lote_inicial', nome: 'Lote inicial', preco: 50 }, { tipo: 'segundo_lote', nome: 'Segundo lote', preco: 80 }])
    assert.equal(r.corpo.disponiveis, 5)
    assert.equal(r.corpo.venda_aberta, true)
    assert.equal((await pedir('/eventos/99/ingressos', 'ana')).status, 404)
    evento.status_publicacao = 'rascunho'
    assert.equal((await pedir('/eventos/1/ingressos', 'ana')).status, 404)
})

test('compra aprovada: total calculado no servidor (valores do front são ignorados) e ingresso registrado', async () => {
    const r = await comprar('ana', { valor_total: 1, valor_unitario: 1, preco: 1 })
    assert.equal(r.status, 201)
    assert.equal(r.corpo.resultado, 'aprovado')
    assert.equal(r.corpo.compra.valor_total, 100) // 2 x R$ 50,00 do banco
    assert.equal(r.corpo.compra.comprador_username, 'ana')
    assert.equal(r.corpo.compra.status, 'Aprovada')
    assert.match(r.corpo.compra.codigo, /^[0-9A-F]{12}$/)
    assert.equal(compras.length, 1)
    const lista = (await pedir('/compras', 'ana')).corpo
    assert.equal(lista.length, 1)
    assert.equal(lista[0].tipo_nome, 'Lote inicial')
    assert.equal((await pedir('/eventos/1/ingressos', 'ana')).corpo.disponiveis, 3)
})

test('validações: tipo, quantidade, método, resultado e evento', async () => {
    for (const extra of [{ tipo: 'vip' }, { quantidade: 0 }, { quantidade: -1 }, { quantidade: 1.5 }, { quantidade: '2' }, { quantidade: 11 }, { metodo: 'boleto' }, { resultado: 'talvez' }, { eventoId: 'abc' }]) {
        assert.equal((await comprar('ana', extra)).status, 400, JSON.stringify(extra))
    }
    assert.equal((await comprar('ana', { eventoId: 99 })).status, 404)
    evento.segundo_lote = null
    assert.equal((await comprar('ana', { tipo: 'segundo_lote' })).status, 400) // sem preço, não vende
    evento.encerrado = true
    assert.equal((await comprar('ana')).status, 409)
    assert.equal(compras.length, 0)
})

test('não vende mais do que a capacidade do evento', async () => {
    assert.equal((await comprar('ana', { quantidade: 4 })).status, 201)
    const r = await comprar('bia', { quantidade: 2 }) // só resta 1
    assert.equal(r.status, 409)
    assert.equal(r.corpo.disponiveis, 1)
    assert.equal((await comprar('bia', { quantidade: 1 })).status, 201)
    const esgotado = await comprar('bia', { quantidade: 1 })
    assert.equal(esgotado.status, 409)
    assert.match(esgotado.corpo.erro, /esgotados/)
    assert.equal(compras.length, 2)
})

test('pagamento recusado não registra compra nem ingresso', async () => {
    const r = await comprar('ana', { resultado: 'recusado' })
    assert.equal(r.status, 200)
    assert.equal(r.corpo.resultado, 'recusado')
    assert.equal(r.corpo.simulacao, true)
    assert.equal(compras.length, 0)
    assert.equal((await pedir('/compras', 'ana')).corpo.length, 0)
    assert.equal((await pedir('/eventos/1/ingressos', 'ana')).corpo.disponiveis, 5)
})

test('saldo: adicionar, recusar, validar valor e histórico', async () => {
    assert.equal((await pedir('/saldo', 'ana')).corpo.saldo, 0)
    for (const valor of ['5', 'abc', '5001', '-10', '', '10,123']) assert.equal((await pedir('/saldo/adicionar', 'ana', 'POST', { valor })).status, 400, valor)
    assert.equal((await pedir('/saldo/adicionar', 'ana', 'POST', { valor: '50', resultado: 'talvez' })).status, 400)

    const recusada = await pedir('/saldo/adicionar', 'ana', 'POST', { valor: '200', resultado: 'recusado' })
    assert.equal(recusada.corpo.resultado, 'recusado')
    assert.equal(recusada.corpo.saldo, 0)
    assert.equal(movs.length, 0)

    const ok = await pedir('/saldo/adicionar', 'ana', 'POST', { valor: '200,50', resultado: 'aprovado', saldo: 99999 })
    assert.equal(ok.status, 201)
    assert.equal(ok.corpo.saldo, 200.5)
    const estado = (await pedir('/saldo', 'ana')).corpo
    assert.equal(estado.saldo, 200.5)
    assert.deepEqual(estado.movimentacoes.map((m) => [m.tipo, m.valor, m.saldo_resultante]), [['recarga', 200.5, 200.5]])
})

test('compra com saldo: recusa se não tiver saldo, debita se tiver', async () => {
    const sem = await comprar('ana', { metodo: 'saldo', resultado: 'aprovado' }) // o "resultado" não força aprovação do saldo
    assert.equal(sem.corpo.resultado, 'recusado')
    assert.match(sem.corpo.motivo, /Saldo insuficiente/)
    assert.equal(compras.length, 0)
    assert.equal(movs.length, 0)

    await pedir('/saldo/adicionar', 'ana', 'POST', { valor: '150' })
    const ok = await comprar('ana', { metodo: 'saldo' }) // R$ 100,00
    assert.equal(ok.corpo.resultado, 'aprovado')
    const estado = (await pedir('/saldo', 'ana')).corpo
    assert.equal(estado.saldo, 50)
    assert.deepEqual(estado.movimentacoes.map((m) => [m.tipo, m.valor, m.saldo_resultante]), [['compra', 100, 50], ['recarga', 150, 150]])

    const outra = await comprar('ana', { metodo: 'saldo' }) // só sobraram R$ 50,00
    assert.equal(outra.corpo.resultado, 'recusado')
    assert.equal((await pedir('/saldo', 'ana')).corpo.saldo, 50)
})

test('cada cliente só vê as próprias compras e o próprio saldo', async () => {
    await comprar('ana')
    await pedir('/saldo/adicionar', 'ana', 'POST', { valor: '100' })
    assert.equal((await pedir('/compras', 'bia')).corpo.length, 0)
    assert.equal((await pedir('/saldo', 'bia')).corpo.saldo, 0)
    assert.equal((await pedir('/saldo', 'bia')).corpo.movimentacoes.length, 0)
    assert.equal((await comprar('bia', { metodo: 'saldo' })).corpo.resultado, 'recusado') // o saldo da Ana não é da Bia
})

test('o histórico mostra também a compra paga no cartão, sem mudar o saldo', async () => {
    await pedir('/saldo/adicionar', 'ana', 'POST', { valor: '100' })
    await new Promise((r) => setTimeout(r, 5)) // datas diferentes, para a ordem do histórico ser previsível
    await comprar('ana', { metodo: 'cartao', quantidade: 2 }) // R$ 100,00 no cartão
    const { corpo } = await pedir('/saldo', 'ana')
    assert.equal(corpo.saldo, 100) // o cartão não mexe no saldo
    assert.deepEqual(corpo.movimentacoes.map((m) => [m.tipo, m.valor, m.saldo_resultante]), [['compra_cartao', 100, null], ['recarga', 100, 100]])
    assert.match(corpo.movimentacoes[0].descricao, /Festival.*2 ingressos.*cartão/)
    assert.equal((await pedir('/saldo', 'bia')).corpo.movimentacoes.length, 0)
})
