// Testes HTTP do cadastro, login e aprovação com banco simulado (T04/T15, RF01-RF04).
// Não substituem uma execução no Postgres real.
import { registerHooks } from 'node:module'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

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
    if (texto.includes('SELECT status_aprovacao FROM')) {
        const base = texto.includes('FROM organizador') ? organizadores : fornecedores
        const [id] = args
        return base[id] ? [{ status_aprovacao: base[id].status_aprovacao }] : []
    }
    if (texto.trim().startsWith('INSERT INTO usuario')) {
        if (forcarErroDeUnique) { const e = new Error('unique'); Object.assign(e, forcarErroDeUnique); throw e }
        inserts.push({ tabela: 'usuario', args })
        return [{ id_usuario: ++proximoId }]
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

test('cadastro de organizador válido: grava usuario e organizador na mesma transação, com e-mail minúsculo e CNPJ sem máscara', async () => {
    inserts = []; commits = 0
    const r = await post('/cadastro', novoOrganizador)
    assert.equal(r.status, 201)
    assert.deepEqual(inserts.map((i) => i.tabela), ['usuario', 'organizador'])
    assert.equal(inserts[0].args[3], 'nova@empresa.com')
    assert.equal(inserts[1].args[2], '11222333000181')
    assert.notEqual(inserts[0].args[4], 'abcdef') // senha vai criptografada
    assert.equal(commits, 1)
})

test('cadastro de fornecedor válido grava a área de atuação', async () => {
    inserts = []
    const r = await post('/cadastro', { ...novoOrganizador, username: 'forn1', email: 'forn1@x.com', perfil: 'fornecedor', cnpj: '98.765.432/0001-98', areaAtuacao: 'Som e Luz' })
    // 98.765.432/0001-98 já existe nos fornecedores simulados: 409 por CNPJ.
    // 11.444.777/0001-61 só existe na tabela de organizadores: para fornecedor é livre.
    assert.equal(r.status, 409)
    assert.equal((await r.json()).campo, 'cnpj')
    const ok = await post('/cadastro', { ...novoOrganizador, username: 'forn1', email: 'forn1@x.com', perfil: 'fornecedor', cnpj: '11.444.777/0001-61', areaAtuacao: 'Som e Luz' })
    assert.equal(ok.status, 201)
    assert.deepEqual(inserts.map((i) => i.tabela), ['usuario', 'fornecedor'])
    assert.equal(inserts[1].args[3], 'Som e Luz')
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

test('cadastro: corrida no banco (UNIQUE) também vira 409', async () => {
    forcarErroDeUnique = { code: '23505', detail: 'Key (username)=(corrida) already exists.' }
    const r = await post('/cadastro', { ...novoOrganizador, username: 'corrida', email: 'corrida@x.com' })
    assert.equal(r.status, 409)
    forcarErroDeUnique = null
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
