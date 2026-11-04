// Testes do cálculo do ticket (T05 / RF13) e da consolidação de custos (RF07/RF12).
// A parte HTTP usa banco simulado: não substitui uma execução no Postgres real.
import { registerHooks } from 'node:module'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import jwt from 'jsonwebtoken'
import { calcularTicket, lerMargem } from '../services/ticket.js'

process.env.JWT_SECRET = 'segredo-de-teste'

// ── Fórmula (unitário) ───────────────────────────────────────────────────────
test('ticket: fixo 10.000 + variável 5/pessoa, 1.000 pessoas, margem 20% -> equilíbrio 15,00 e alvo 18,75', () => {
    const r = calcularTicket({ custoFixo: 10000, custoVariavel: 5, margem: 20, publico: 1000 })
    assert.deepEqual(r, { publico: 1000, custo_total: 15000, ticket_equilibrio: 15, ticket_alvo: 18.75 })
})

test('ticket: sem custo variável e margem 0, alvo = equilíbrio = custo / público', () => {
    const r = calcularTicket({ custoFixo: 10000, custoVariavel: 0, margem: 0, publico: 400 })
    assert.equal(r.ticket_equilibrio, 25)
    assert.equal(r.ticket_alvo, 25)
})

test('ticket: arredonda sempre PARA CIMA no centavo', () => {
    // 1.000,00 / 3 pessoas = 333,333... -> 333,34 (nunca 333,33, que daria prejuízo)
    assert.equal(calcularTicket({ custoFixo: 1000, custoVariavel: 0, margem: 0, publico: 3 }).ticket_equilibrio, 333.34)
    // 100,00 / (7 × 0,85) = 16,8067... -> 16,81
    assert.equal(calcularTicket({ custoFixo: 100, custoVariavel: 0, margem: 15, publico: 7 }).ticket_alvo, 16.81)
    // divisão exata não sobe: 100,00 / 4 = 25,00
    assert.equal(calcularTicket({ custoFixo: 100, custoVariavel: 0, margem: 0, publico: 4 }).ticket_alvo, 25)
})

test('ticket: margem com casas decimais (15,5%) e sem erro de ponto flutuante', () => {
    const r = calcularTicket({ custoFixo: 11150, custoVariavel: 0, margem: 15.5, publico: 200 })
    assert.equal(r.ticket_equilibrio, 55.75) // 55,75 exato não pode virar 55,76
    assert.equal(r.ticket_alvo, 65.98) // 11.150 / (200 × 0,845) = 65,976... -> 65,98
})

test('ticket: recusa público inválido e margem fora de 0 a 99,99', () => {
    const base = { custoFixo: 1000, custoVariavel: 0, margem: 10, publico: 100 }
    for (const publico of [0, -5, 1.5, NaN, undefined]) assert.throws(() => calcularTicket({ ...base, publico }), RangeError, String(publico))
    for (const margem of [-1, 100, 150, NaN, 'abc']) assert.throws(() => calcularTicket({ ...base, margem }), RangeError, String(margem))
})

test('margem: lê com vírgula ou ponto, vazio vale 0 se opcional, recusa o resto', () => {
    assert.equal(lerMargem('15,5'), 15.5)
    assert.equal(lerMargem('15.50'), 15.5)
    assert.equal(lerMargem(''), 0)
    assert.equal(lerMargem(undefined), 0)
    assert.ok(Number.isNaN(lerMargem('', false)))
    for (const ruim of ['100', '-1', '1.234', 'abc', '10%', '1.000,5']) assert.ok(Number.isNaN(lerMargem(ruim)), ruim)
    assert.equal(lerMargem('99,99'), 99.99)
})

// ── Rotas (banco simulado) ───────────────────────────────────────────────────
let evento = { id_evento: 1, id_organizador_fk: 8, titulo_evento: 'Festival', publico_minimo: 200, publico_maximo: 1000, margem_lucro_percentual: '20.00' }
let itens = []
let independentes = []
let inserts = []
let atualizacoes = []

function resolver(texto, args) {
    if (texto.includes('FROM evento WHERE id_evento')) return Number(args[0]) === evento.id_evento ? [evento] : []
    if (texto.includes('FROM itemcusto i')) return itens
    if (texto.includes('FROM custoindependente')) return independentes
    if (texto.trim().startsWith('UPDATE evento SET margem_lucro_percentual')) {
        atualizacoes.push(args)
        const [margem, id, dono] = args
        return Object.assign([], { count: Number(id) === evento.id_evento && dono === evento.id_organizador_fk ? 1 : 0 })
    }
    if (texto.trim().startsWith('INSERT INTO evento')) { inserts.push(args); return [{ id_evento: 55 }] }
    if (texto.trim().startsWith('INSERT')) return []
    throw new Error(`SQL inesperado: ${texto}`)
}
function montarSql() {
    function sqlFn(partes, ...valores) {
        let texto = partes[0]; const args = []
        valores.forEach((v, i) => { texto += '?' + partes[i + 1]; args.push(v) })
        return { then(ok, falha) { Promise.resolve().then(() => resolver(texto, args)).then(ok, falha) } }
    }
    sqlFn.begin = async (fn) => fn(sqlFn)
    return sqlFn
}
globalThis.__testSql = montarSql()
registerHooks({ resolve(spec, ctx, next) { if (spec.endsWith('/config/db.js')) return { url: 'data:text/javascript,export default globalThis.__testSql', shortCircuit: true }; return next(spec, ctx) } })
const { default: eventos } = await import('../routes/eventoRoutes.js')
const { tratarErros } = await import('../middlewares/erros.js')
const app = express(); app.use(express.json()); app.use('/api', eventos); app.use(tratarErros)
const server = app.listen(0, '127.0.0.1'); await new Promise((r) => server.once('listening', r)); after(() => server.close())
const base = `http://127.0.0.1:${server.address().port}/api`
const tk = (id_usuario, perfil) => jwt.sign({ id_usuario, perfil }, process.env.JWT_SECRET)
const dono = tk(8, 'organizador'), outro = tk(99, 'organizador'), admin = tk(1, 'administrador'), forn = tk(7, 'fornecedor')
const req = (metodo, caminho, token, corpo) => fetch(base + caminho, { method: metodo, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(corpo ? { body: JSON.stringify(corpo) } : {}) })

test('GET ticket: consolida itens (estimativa + proposta aceita), custos fixos e variável por participante', async () => {
    itens = [
        // item 1: 10 tendas a 100 estimados; 4 cobertas por proposta aceita a 80 -> 4×80 + 6×100 = 920
        { id_item_custo: 1, categoria: 'Estrutura', descricao_detalhada: 'Tenda', quantidade: 10, valor_unitario: '100.00', quantidade_coberta: 4, valor_coberto: '320.00' },
        // item 2: sem proposta, 2 × 3.500 = 7.000
        { id_item_custo: 2, categoria: 'Palco', descricao_detalhada: 'Palco', quantidade: 2, valor_unitario: '3500.00', quantidade_coberta: 0, valor_coberto: '0' },
        // item 3: totalmente coberto por proposta mais barata: 1 × 900 (estimativa era 1.000)
        { id_item_custo: 3, categoria: 'Som', descricao_detalhada: 'Mesa', quantidade: 1, valor_unitario: '1000.00', quantidade_coberta: 1, valor_coberto: '900.00' },
    ]
    independentes = [
        { id_custo_independente: 1, tipo_custo: 'Fiscal', descricao: 'Taxa', valor: '1180.00' },
        { id_custo_independente: 2, tipo_custo: 'Operacional', descricao: 'Limpeza', valor: '500.00' },
        { id_custo_independente: 3, tipo_custo: 'Variável', descricao: 'Copo e kit', valor: '4.00' },
    ]
    const r = await req('GET', '/eventos/1/ticket', dono)
    assert.equal(r.status, 200)
    const t = await r.json()
    assert.equal(t.custos.total_itens, 920 + 7000 + 900)
    assert.equal(t.custos.independentes_fixos, 1680)
    assert.equal(t.custos.variavel_por_participante, 4)
    assert.equal(t.custos.custo_fixo_total, 10500)
    assert.equal(t.margem_percentual, 20)
    // mínimo (200): custo = 10.500 + 4×200 = 11.300 -> 56,50 equilíbrio; /0,8 = 70,625 -> 70,63
    assert.deepEqual(t.cenarios.minimo, { disponivel: true, publico: 200, custo_total: 11300, ticket_equilibrio: 56.5, ticket_alvo: 70.63 })
    // máximo (1000): custo = 14.500 -> 14,50 equilíbrio; /0,8 = 18,125 -> 18,13
    assert.deepEqual(t.cenarios.maximo, { disponivel: true, publico: 1000, custo_total: 14500, ticket_equilibrio: 14.5, ticket_alvo: 18.13 })
    assert.match(t.formula, /Público/)
})

test('GET ticket: público mínimo não informado -> cenário indisponível, sem dividir por zero', async () => {
    evento = { ...evento, publico_minimo: 0 }
    const t = await (await req('GET', '/eventos/1/ticket', dono)).json()
    assert.equal(t.cenarios.minimo.disponivel, false)
    assert.match(t.cenarios.minimo.motivo, /público mínimo/)
    assert.equal(t.cenarios.maximo.disponivel, true)
    evento = { ...evento, publico_minimo: 200 }
})

test('GET ticket: evento sem custos nenhum devolve ticket 0 (sem erro)', async () => {
    itens = []; independentes = []
    const t = await (await req('GET', '/eventos/1/ticket', dono)).json()
    assert.equal(t.cenarios.maximo.ticket_alvo, 0)
})

test('GET ticket: só o organizador dono e o administrador; fornecedor, outro organizador e anônimo são barrados', async () => {
    assert.equal((await req('GET', '/eventos/1/ticket')).status, 401)
    assert.equal((await req('GET', '/eventos/1/ticket', forn)).status, 403)
    assert.equal((await req('GET', '/eventos/1/ticket', outro)).status, 404)
    assert.equal((await req('GET', '/eventos/1/ticket', admin)).status, 200)
    assert.equal((await req('GET', '/eventos/999/ticket', dono)).status, 404)
    assert.equal((await req('GET', '/eventos/abc/ticket', dono)).status, 404)
})

test('PATCH margem: grava para o dono, valida o valor e barra os outros', async () => {
    atualizacoes = []
    const ok = await req('PATCH', '/eventos/1/margem', dono, { margem: '15,5' })
    assert.equal(ok.status, 200)
    assert.deepEqual(await ok.json(), { ok: true, margem_percentual: 15.5 })
    assert.deepEqual(atualizacoes[0], [15.5, '1', 8])
    for (const margem of ['', '100', '-3', 'abc', undefined]) assert.equal((await req('PATCH', '/eventos/1/margem', dono, { margem })).status, 400, String(margem))
    assert.equal((await req('PATCH', '/eventos/1/margem', outro, { margem: '10' })).status, 404)
    assert.equal((await req('PATCH', '/eventos/1/margem', forn, { margem: '10' })).status, 403)
    assert.equal((await req('PATCH', '/eventos/1/margem', admin, { margem: '10' })).status, 403)
    assert.equal(atualizacoes.length, 2) // só a do dono e a do "outro" (que não achou o evento) chegaram ao banco
})

test('POST evento: a margem informada é gravada; vazia vale 0; inválida dá 400', async () => {
    const corpo = (margin) => ({
        eventData: { name: 'Festa', date: '2099-01-10', startTime: '20:00', endTime: '23:00', location: 'Rua A, 10', city: 'São Paulo' },
        lotData: { firstLot: '50,00', secondLot: '', minAudience: '100', maxAudience: '500', margin },
        independentCosts: [], groups: [],
    })
    inserts = []
    let r = await req('POST', '/eventos', dono, corpo('15,5'))
    assert.equal(r.status, 201)
    assert.equal((await r.json()).margem_percentual, 15.5)
    assert.equal(inserts[0].at(-1), 15.5)
    r = await req('POST', '/eventos', dono, corpo(''))
    assert.equal(r.status, 201); assert.equal(inserts[1].at(-1), 0)
    for (const ruim of ['100', 'abc', '-1']) assert.equal((await req('POST', '/eventos', dono, corpo(ruim))).status, 400, ruim)
    assert.equal(inserts.length, 2)
})
