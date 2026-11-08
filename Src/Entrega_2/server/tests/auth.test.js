// Testes HTTP do cadastro, login e aprovação com banco simulado (T04/T15, RF01-RF04).
// Não substituem uma execução no Postgres real.
import { registerHooks } from 'node:module'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'

process.env.JWT_SECRET = 'segredo-de-teste'

// "Banco" em memória: só o que as rotas de auth e aprovação consultam.
const hashSenha = await bcrypt.hash('123456', 4)
const usuarios = [
    { id_usuario: 1, nome: 'Admin', email: 'admin@trocaticket.com', username: 'admin', senha: hashSenha, perfil: 'administrador' },
    { id_usuario: 3, nome: 'Org Pendente', email: 'org.pendente@x.com', username: 'orgp', senha: hashSenha, perfil: 'organizador' },
    { id_usuario: 4, nome: 'Org Aprovado', email: 'Org.Aprovado@x.com', username: 'orga', senha: hashSenha, perfil: 'organizador' },
    { id_usuario: 6, nome: 'Forn Rejeitado', email: 'forn.rej@x.com', username: 'fornr', senha: hashSenha, perfil: 'fornecedor' },
    { id_usuario: 7, nome: 'Forn Aprovado', email: 'forn.ok@x.com', username: 'forna', senha: hashSenha, perfil: 'fornecedor' },
]
// Cadastros aguardando a confirmação do e-mail (tabela cadastro_pendente)
const pendentes = []
const organizadores = { 3: { status_aprovacao: 'pendente', cnpj: '11222333000181' }, 4: { status_aprovacao: 'aprovado', cnpj: '11444777000161' } }
const fornecedores = { 6: { status_aprovacao: 'rejeitado', cnpj: '33000167000101' }, 7: { status_aprovacao: 'aprovado', cnpj: '98765432000198' } }
let inserts = []
let commits = 0
let rollbacks = 0
let proximoId = 100
let forcarErroDeUnique = null // simula corrida: o INSERT estoura o UNIQUE do banco
let forcarErro500 = false

function resolver(texto, args) {
    if (texto.includes('FROM usuario') && texto.includes('lower(email)') && texto.includes('username =')) {
        const [email, username] = args
        return usuarios.filter((u) => u.email.toLowerCase() === email || u.username === username).map(({ email, username }) => ({ email, username }))
    }
    if (/SELECT 1 AS existe FROM (organizador|fornecedor) WHERE cnpj/.test(texto)) {
        const base = texto.includes('FROM organizador') ? organizadores : fornecedores
        return Object.values(base).some((c) => c.cnpj === args[0]) ? [{ existe: 1 }] : []
    }
    if (texto.includes('FROM usuario') && texto.includes('WHERE lower(email)')) {
        if (forcarErro500) throw new Error('falha simulada do banco')
        return usuarios.filter((u) => u.email.toLowerCase() === args[0]).map(({ id_usuario, nome, email, senha, perfil }) => ({ id_usuario, nome, email, senha, perfil }))
    }
    if (texto.trim().startsWith('INSERT INTO cadastro_pendente')) { // POST /cadastro (upsert por e-mail)
        // args: nome, idade, username, email, senha, perfil, empresa, cnpj, área, hash do token, expiração, limite do reenvio
        const [nome, idade, username, email, senha, perfil, empresa, cnpj, area, hash, expira, limite] = args
        const novo = { nome, idade, username, email, senha, perfil, nome_organizacao: empresa, cnpj, area_atuacao: area, token_verificacao: hash, token_expira: expira }
        const i = pendentes.findIndex((p) => p.email === email)
        if (i >= 0 && !(pendentes[i].token_expira < limite)) return [] // o WHERE do DO UPDATE barrou (menos de 1 min)
        if (i >= 0) pendentes[i] = novo; else pendentes.push(novo)
        inserts.push({ tabela: 'cadastro_pendente', args })
        return [{ id_pendente: pendentes.length }]
    }
    if (texto.includes('DELETE FROM cadastro_pendente WHERE token_expira <')) return [] // faxina dos vencidos há dias
    if (texto.includes('DELETE FROM cadastro_pendente') && texto.includes('RETURNING *')) { // POST /verificar-email
        const i = pendentes.findIndex((p) => p.token_verificacao === args[0] && p.token_expira > new Date())
        return i >= 0 ? pendentes.splice(i, 1) : []
    }
    if (texto.includes('DELETE FROM cadastro_pendente WHERE token_verificacao')) { // limpeza depois de um 409
        const i = pendentes.findIndex((p) => p.token_verificacao === args[0])
        if (i >= 0) pendentes.splice(i, 1)
        return []
    }
    if (texto.includes('UPDATE cadastro_pendente')) { // POST /reenviar-verificacao
        const [hash, expira, email, limite] = args
        const p = pendentes.find((x) => x.email === email && x.token_expira < limite)
        if (!p) return []
        p.token_verificacao = hash; p.token_expira = expira
        return [{ nome: p.nome }]
    }
    if (texto.includes('SELECT senha FROM cadastro_pendente')) { // login de quem ainda não confirmou
        const p = pendentes.find((x) => x.email === args[0])
        return p ? [{ senha: p.senha }] : []
    }
    if (texto.includes('SELECT status_aprovacao FROM')) {
        const base = texto.includes('FROM organizador') ? organizadores : fornecedores
        const [id] = args
        return base[id] ? [{ status_aprovacao: base[id].status_aprovacao }] : []
    }
    if (texto.trim().startsWith('INSERT INTO usuario')) {
        if (forcarErroDeUnique) { const e = new Error('unique'); Object.assign(e, forcarErroDeUnique); throw e }
        inserts.push({ tabela: 'usuario', args })
        // args: nome, idade, username, email, senha, perfil
        usuarios.push({ id_usuario: ++proximoId, nome: args[0], username: args[2], email: args[3], senha: args[4], perfil: args[5] })
        return [{ id_usuario: proximoId }]
    }
    if (texto.trim().startsWith('INSERT INTO')) { inserts.push({ tabela: texto.match(/INSERT INTO (\w+)/)[1], args }); return [] }
    if (texto.trim().startsWith('UPDATE')) {
        const base = texto.includes('UPDATE organizador') ? organizadores : fornecedores
        const [status, id] = args
        if (!base[id]) return Object.assign([], { count: 0 })
        base[id].status_aprovacao = status
        return Object.assign([], { count: 1 })
    }
    if (texto.includes('UNION ALL')) return []
    throw new Error(`SQL inesperado: ${texto}`)
}

function montarSql() {
    function sqlFn(partes, ...valores) {
        if (typeof partes === 'string') return { __fragmento: true, texto: partes, args: [] } // sql('tabela'): nome de tabela/coluna entra no texto
        let texto = partes[0]
        const args = []
        valores.forEach((v, i) => {
            if (v && v.__fragmento) { texto += v.texto; args.push(...v.args) } else { texto += '?'; args.push(v) }
            texto += partes[i + 1]
        })
        return {
            __fragmento: true, texto, args,
            then(ok, falha) { Promise.resolve().then(() => resolver(texto, args)).then(ok, falha) },
        }
    }
    sqlFn.begin = async (fn) => {
        try { const r = await fn(sqlFn); commits++; return r } catch (e) { rollbacks++; throw e }
    }
    return sqlFn
}
globalThis.__testSql = montarSql()
registerHooks({ resolve(spec, ctx, next) { if (spec.endsWith('/config/db.js')) return { url: 'data:text/javascript,export default globalThis.__testSql', shortCircuit: true }; return next(spec, ctx) } })

const { default: authRoutes } = await import('../routes/authRoutes.js')
const { default: adminRoutes } = await import('../routes/adminRoutes.js')
const { tratarErros } = await import('../middlewares/erros.js')
const app = express()
app.use(express.json())
app.use('/api', authRoutes)
app.use('/api', adminRoutes)
// o mesmo tratador de erros que o index.js usa
app.use(tratarErros)
const server = app.listen(0, '127.0.0.1')
await new Promise((r) => server.once('listening', r))
after(() => server.close())
const base = `http://127.0.0.1:${server.address().port}/api`
const post = (caminho, corpo, token) => fetch(base + caminho, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(corpo) })
const patch = (caminho, corpo, token) => fetch(base + caminho, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(corpo) })

const novoOrganizador = { nome: 'Nova Pessoa', username: 'nova', email: 'Nova@Empresa.com', idade: 30, senha: 'abcdef', confirmarSenha: 'abcdef', perfil: 'organizador', empresa: 'Empresa Nova', cnpj: '11.222.333/0001-81' }
organizadores[3].cnpj = '99999999999999' // libera o CNPJ acima para o cenário de sucesso

// Sem RESEND_API_KEY (como aqui), o servidor imprime o link no console; é dele que o teste tira o token.
async function capturarLinks(fn) {
    const guardado = console.log
    const linhas = []
    console.log = (...a) => linhas.push(a.map(String).join(' '))
    try { await fn() } finally { console.log = guardado }
    return linhas.map((l) => l.match(/verificar-email\?token=([0-9a-f]{64})/)?.[1]).filter(Boolean)
}
const sha256 = (t) => crypto.createHash('sha256').update(t).digest('hex')
// cadastra e devolve { resposta, tokens } com os tokens dos e-mails enviados nessa chamada
async function cadastrar(corpo) {
    let resposta
    const tokens = await capturarLinks(async () => { resposta = await post('/cadastro', corpo) })
    return { resposta, tokens }
}

test('cadastro de organizador válido: só grava o pendente; a conta nasce ao confirmar o e-mail', async () => {
    inserts = []; commits = 0
    const { resposta: r, tokens } = await cadastrar(novoOrganizador)
    assert.equal(r.status, 201)
    assert.equal((await r.json()).emailEnviado, true)
    assert.equal(tokens.length, 1)
    // nada em usuario/organizador ainda
    assert.deepEqual(inserts.map((i) => i.tabela), ['cadastro_pendente'])
    assert.equal(usuarios.some((u) => u.username === 'nova'), false)
    const [pendente] = inserts
    assert.equal(pendente.args[3], 'nova@empresa.com') // e-mail minúsculo
    assert.equal(pendente.args[6], 'Empresa Nova')
    assert.equal(pendente.args[7], '11222333000181') // CNPJ sem máscara
    assert.equal(pendente.args[8], null) // área de atuação só vale para fornecedor
    assert.notEqual(pendente.args[4], 'abcdef') // senha vai criptografada
    assert.equal(pendente.args[9], sha256(tokens[0])) // no banco vai o hash do token, não o token
    assert.ok(pendente.args[10] > new Date())

    // confirmar: usuario e organizador na mesma transação
    inserts = []; commits = 0
    const c = await post('/verificar-email', { token: tokens[0] })
    assert.equal(c.status, 200)
    assert.equal((await c.json()).perfil, 'organizador')
    assert.deepEqual(inserts.map((i) => i.tabela), ['usuario', 'organizador'])
    assert.equal(inserts[0].args[3], 'nova@empresa.com')
    assert.equal(inserts[1].args[2], '11222333000181')
    assert.equal(commits, 1)
    assert.equal(pendentes.some((p) => p.email === 'nova@empresa.com'), false)
    // conta criada, mas organizador ainda precisa da aprovação do admin
    const l = await post('/login', { email: 'nova@empresa.com', senha: 'abcdef' })
    assert.equal(l.status, 403); assert.equal((await l.json()).status_aprovacao, 'pendente')
})

test('cadastro de fornecedor válido grava a área de atuação ao confirmar', async () => {
    inserts = []
    const dados = { ...novoOrganizador, username: 'forn1', email: 'forn1@x.com', perfil: 'fornecedor', areaAtuacao: 'Som e Luz' }
    // 98.765.432/0001-98 já existe nos fornecedores simulados: 409 por CNPJ.
    // 11.444.777/0001-61 só existe na tabela de organizadores: para fornecedor é livre.
    const dup = await post('/cadastro', { ...dados, cnpj: '98.765.432/0001-98' })
    assert.equal(dup.status, 409)
    assert.equal((await dup.json()).campo, 'cnpj')
    assert.equal(inserts.length, 0)
    const { resposta: ok, tokens } = await cadastrar({ ...dados, cnpj: '11.444.777/0001-61' })
    assert.equal(ok.status, 201)
    assert.deepEqual(inserts.map((i) => i.tabela), ['cadastro_pendente'])
    assert.equal(inserts[0].args[8], 'Som e Luz')
    inserts = []
    assert.equal((await post('/verificar-email', { token: tokens[0] })).status, 200)
    assert.deepEqual(inserts.map((i) => i.tabela), ['usuario', 'fornecedor'])
    assert.equal(inserts[1].args[3], 'Som e Luz')
})

test('cadastro de cliente: pendente sem dados de empresa', async () => {
    inserts = []
    const { resposta: r } = await cadastrar({ nome: 'Cli', username: 'cli1', email: 'cli1@x.com', idade: 20, senha: 'abcdef', confirmarSenha: 'abcdef', perfil: 'cliente' })
    assert.equal(r.status, 201)
    assert.deepEqual(inserts[0].args.slice(6, 9), [null, null, null])
})

test('cadastro: o servidor recusa o que o front-end deixaria passar (CNPJ, e-mail, senha, vazios)', async () => {
    inserts = []
    const casos = [
        [{ cnpj: '11.222.333/0001-82' }, 'cnpj'],
        [{ email: 'sem-arroba' }, 'email'],
        [{ senha: '123', confirmarSenha: '123' }, 'senha'],
        [{ confirmarSenha: 'diferente' }, 'confirmarSenha'],
        [{ nome: '   ' }, 'nome'],
        [{ empresa: '' }, 'empresa'],
        [{ idade: 12.5 }, 'idade'],
        [{ perfil: 'administrador' }, 'perfil'],
    ]
    for (const [mudanca, campo] of casos) {
        const r = await post('/cadastro', { ...novoOrganizador, ...mudanca })
        assert.equal(r.status, 400, campo)
        const corpo = await r.json()
        assert.ok(corpo.campos[campo], `campo ${campo}`)
        assert.ok(typeof corpo.erro === 'string' && corpo.erro.length > 0)
    }
    assert.equal((await post('/cadastro', {})).status, 400)
    assert.equal(inserts.length, 0)
})

test('cadastro duplicado: e-mail (qualquer caixa), username e CNPJ dão 409 com o campo certo', async () => {
    inserts = []
    let r = await post('/cadastro', { ...novoOrganizador, email: 'ADMIN@trocaticket.com', username: 'livre', cnpj: '11.222.333/0001-81' })
    assert.equal(r.status, 409); assert.equal((await r.json()).campo, 'email')
    r = await post('/cadastro', { ...novoOrganizador, email: 'livre@x.com', username: 'admin' })
    assert.equal(r.status, 409); assert.equal((await r.json()).campo, 'username')
    r = await post('/cadastro', { ...novoOrganizador, email: 'livre@x.com', username: 'livre', cnpj: '11.444.777/0001-61' })
    assert.equal(r.status, 409); assert.equal((await r.json()).campo, 'cnpj')
    assert.equal(inserts.length, 0)
})

test('confirmação: corrida no banco (UNIQUE) vira 409, desfaz a transação e descarta o pendente', async () => {
    const { tokens } = await cadastrar({ nome: 'Corrida', username: 'corrida', email: 'corrida@x.com', idade: 20, senha: 'abcdef', confirmarSenha: 'abcdef', perfil: 'cliente' })
    forcarErroDeUnique = { code: '23505', detail: 'Key (username)=(corrida) already exists.' }
    const antes = rollbacks
    const r = await post('/verificar-email', { token: tokens[0] })
    forcarErroDeUnique = null
    assert.equal(r.status, 409)
    assert.equal(rollbacks, antes + 1)
    assert.equal(pendentes.some((p) => p.email === 'corrida@x.com'), false)
    assert.equal(usuarios.some((u) => u.username === 'corrida'), false)
    assert.equal((await post('/verificar-email', { token: tokens[0] })).status, 400)
})

test('login: perfis aprovados entram; pendente e rejeitado recebem 403; admin entra', async () => {
    let r = await post('/login', { email: 'ORG.APROVADO@x.com', senha: '123456' }) // e-mail salvo com maiúsculas
    assert.equal(r.status, 200)
    const corpo = await r.json()
    assert.equal(jwt.verify(corpo.token, process.env.JWT_SECRET).perfil, 'organizador')
    assert.equal(corpo.usuario.senha, undefined)

    r = await post('/login', { email: 'org.pendente@x.com', senha: '123456' })
    assert.equal(r.status, 403); assert.equal((await r.json()).status_aprovacao, 'pendente')
    r = await post('/login', { email: 'forn.rej@x.com', senha: '123456' })
    assert.equal(r.status, 403); assert.equal((await r.json()).status_aprovacao, 'rejeitado')
    assert.equal((await post('/login', { email: 'forn.ok@x.com', senha: '123456' })).status, 200)
    assert.equal((await post('/login', { email: 'admin@trocaticket.com', senha: '123456' })).status, 200)
})

test('login: senha errada, e-mail inexistente e tipos inválidos não vazam informação', async () => {
    let r = await post('/login', { email: 'admin@trocaticket.com', senha: 'errada1' })
    assert.equal(r.status, 401)
    const msgSenha = (await r.json()).erro
    r = await post('/login', { email: 'ninguem@x.com', senha: '123456' })
    assert.equal(r.status, 401); assert.equal((await r.json()).erro, msgSenha)
    assert.equal((await post('/login', { email: 'a@b.com' })).status, 400)
    assert.equal((await post('/login', { email: ['a@b.com'], senha: 123456 })).status, 400)
})

test('erros não registram e-mail nem senha no console', async () => {
    const guardado = [console.error, console.log]
    const linhas = []
    console.error = (...a) => linhas.push(a.map(String).join(' '))
    console.log = (...a) => linhas.push(a.map(String).join(' '))
    try {
        forcarErro500 = true
        const r = await post('/login', { email: 'admin@trocaticket.com', senha: 'SegredoSuperSecreto9' })
        assert.equal(r.status, 500)
        forcarErro500 = false
        // JSON malformado: o body-parser põe o corpo bruto no erro
        const ruim = await fetch(`${base}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"email":"admin@trocaticket.com","senha":"SegredoSuperSecreto9"' })
        assert.equal(ruim.status, 400)
    } finally {
        [console.error, console.log] = guardado
        forcarErro500 = false
    }
    const tudo = linhas.join('\n')
    assert.ok(!tudo.includes('SegredoSuperSecreto9'), 'a senha apareceu no log')
    assert.ok(!tudo.includes('admin@trocaticket.com'), 'o e-mail apareceu no log')
})

test('aprovação: só o administrador aprova; depois de aprovado o login libera; status inválido e id inexistente', async () => {
    const tokenAdmin = jwt.sign({ id_usuario: 1, perfil: 'administrador' }, process.env.JWT_SECRET)
    const tokenOrg = jwt.sign({ id_usuario: 4, perfil: 'organizador' }, process.env.JWT_SECRET)
    assert.equal((await patch('/admin/cadastros/3', { tipo: 'organizador', status: 'aprovado' }, tokenOrg)).status, 403)
    assert.equal((await patch('/admin/cadastros/3', { tipo: 'organizador', status: 'qualquer' }, tokenAdmin)).status, 400)
    assert.equal((await patch('/admin/cadastros/3', { tipo: 'usuario', status: 'aprovado' }, tokenAdmin)).status, 400)
    assert.equal((await patch('/admin/cadastros/999', { tipo: 'organizador', status: 'aprovado' }, tokenAdmin)).status, 404)
    assert.equal((await post('/login', { email: 'org.pendente@x.com', senha: '123456' })).status, 403)
    assert.equal((await patch('/admin/cadastros/3', { tipo: 'organizador', status: 'aprovado' }, tokenAdmin)).status, 200)
    assert.equal((await post('/login', { email: 'org.pendente@x.com', senha: '123456' })).status, 200)
    assert.equal((await patch('/admin/cadastros/3', { tipo: 'organizador', status: 'rejeitado' }, tokenAdmin)).status, 200)
    assert.equal((await post('/login', { email: 'org.pendente@x.com', senha: '123456' })).status, 403)
})

// ── Confirmação de e-mail ────────────────────────────────────────────────────
// (os helpers capturarLinks, sha256 e cadastrar ficam junto dos primeiros testes de cadastro)
const cliente = { nome: 'Cliente Novo', username: 'fluxo', email: 'Fluxo@X.com', idade: 22, senha: 'abcdef', confirmarSenha: 'abcdef', perfil: 'cliente' }
const pendenteDoFluxo = () => pendentes.find((p) => p.email === 'fluxo@x.com')
let tokenDoFluxo

test('e-mail: cadastro não cria conta; o login só avisa que falta confirmar para quem sabe a senha', async () => {
    inserts = []
    const { resposta: r, tokens } = await cadastrar(cliente)
    assert.equal(r.status, 201)
    assert.equal(tokens.length, 1)
    tokenDoFluxo = tokens[0]
    assert.equal(usuarios.some((u) => u.username === 'fluxo'), false) // conta ainda não existe
    assert.deepEqual(inserts.map((i) => i.tabela), ['cadastro_pendente'])

    let l = await post('/login', { email: 'fluxo@x.com', senha: 'abcdef' })
    assert.equal(l.status, 403)
    assert.equal((await l.json()).codigo, 'email_nao_verificado')
    // senha errada e e-mail desconhecido: o mesmo 401 de sempre, sem revelar que há um cadastro pendente
    l = await post('/login', { email: 'fluxo@x.com', senha: 'errada1' })
    assert.equal(l.status, 401)
    const msg = (await l.json()).erro
    l = await post('/login', { email: 'ninguem@x.com', senha: 'abcdef' })
    assert.equal(l.status, 401); assert.equal((await l.json()).erro, msg)
})

test('e-mail: token inválido, malformado ou desconhecido dá 400 e não cria conta', async () => {
    assert.equal((await post('/verificar-email', {})).status, 400)
    assert.equal((await post('/verificar-email', { token: 'abc' })).status, 400)
    assert.equal((await post('/verificar-email', { token: ['x'] })).status, 400)
    assert.equal((await post('/verificar-email', { token: 'a'.repeat(64) })).status, 400)
    assert.equal(usuarios.some((u) => u.username === 'fluxo'), false)
})

test('e-mail: token expirado não cria a conta e o pendente é mantido', async () => {
    const original = pendenteDoFluxo().token_expira
    pendenteDoFluxo().token_expira = new Date(Date.now() - 1000)
    assert.equal((await post('/verificar-email', { token: tokenDoFluxo })).status, 400)
    assert.equal(usuarios.some((u) => u.username === 'fluxo'), false)
    assert.ok(pendenteDoFluxo())
    pendenteDoFluxo().token_expira = original
})

test('e-mail: cadastrar de novo respeita 1 por minuto e depois substitui o pendente (senha nova, link antigo morre)', async () => {
    // logo depois do primeiro cadastro: 429 e nenhum e-mail
    let { resposta: r, tokens } = await cadastrar(cliente)
    assert.equal(r.status, 429)
    assert.equal((await r.json()).campo, 'email')
    assert.equal(tokens.length, 0)

    // passado 1 minuto: aceita, com a senha nova, e manda um link novo
    pendenteDoFluxo().token_expira = new Date(Date.now() + 23 * 60 * 60 * 1000)
    ;({ resposta: r, tokens } = await cadastrar({ ...cliente, senha: 'novasenha', confirmarSenha: 'novasenha' }))
    assert.equal(r.status, 201)
    assert.equal(tokens.length, 1)
    assert.notEqual(tokens[0], tokenDoFluxo)
    assert.equal(pendentes.filter((p) => p.email === 'fluxo@x.com').length, 1) // substituiu, não duplicou
    assert.equal((await post('/verificar-email', { token: tokenDoFluxo })).status, 400) // link antigo morreu
    tokenDoFluxo = tokens[0]
})

test('e-mail: reenvio respeita 1 por minuto, tem sempre a mesma resposta e invalida o link anterior', async () => {
    const msg = async (email) => { const r = await post('/reenviar-verificacao', { email }); assert.equal(r.status, 200); return (await r.json()).mensagem }

    // dentro do intervalo: não manda outro e-mail
    let tokens = await capturarLinks(async () => { await msg('fluxo@x.com') })
    assert.equal(tokens.length, 0)

    // passado 1 minuto: manda um link novo
    pendenteDoFluxo().token_expira = new Date(Date.now() + 23 * 60 * 60 * 1000)
    let mensagemExistente
    tokens = await capturarLinks(async () => { mensagemExistente = await msg('FLUXO@x.com') })
    assert.equal(tokens.length, 1)
    assert.notEqual(tokens[0], tokenDoFluxo)

    // cadastro inexistente e conta já criada: mesma resposta, nenhum e-mail
    const links = await capturarLinks(async () => {
        assert.equal(await msg('ninguem@x.com'), mensagemExistente)
        assert.equal(await msg('admin@trocaticket.com'), mensagemExistente)
    })
    assert.equal(links.length, 0)
    assert.equal((await post('/reenviar-verificacao', { email: 'sem-arroba' })).status, 400)
    assert.equal((await post('/reenviar-verificacao', {})).status, 400)

    // o link anterior parou de valer
    assert.equal((await post('/verificar-email', { token: tokenDoFluxo })).status, 400)
    tokenDoFluxo = tokens[0]
})

test('e-mail: confirmar cria a conta com a senha do último cadastro, libera o login e o link só vale uma vez', async () => {
    const r = await post('/verificar-email', { token: tokenDoFluxo })
    assert.equal(r.status, 200)
    assert.equal((await r.json()).perfil, 'cliente')
    assert.equal(pendenteDoFluxo(), undefined)
    assert.equal((await post('/login', { email: 'fluxo@x.com', senha: 'novasenha' })).status, 200)
    assert.equal((await post('/login', { email: 'fluxo@x.com', senha: 'abcdef' })).status, 401) // a senha do 1º cadastro não vale
    assert.equal((await post('/verificar-email', { token: tokenDoFluxo })).status, 400)
})

test('e-mail: e-mail de conta já criada continua dando 409 no cadastro', async () => {
    const { resposta: r } = await cadastrar({ ...cliente, username: 'outro' })
    assert.equal(r.status, 409)
    assert.equal((await r.json()).campo, 'email')
})
