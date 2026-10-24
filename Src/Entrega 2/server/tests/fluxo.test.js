// Testes HTTP com banco simulado: não substituem uma execução no Postgres real.
import { registerHooks } from 'node:module'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'

const tokens={fornecedor:'a'.repeat(64),organizador:'b'.repeat(64),cliente:'c'.repeat(64),outro:'d'.repeat(64)}
let resposta='enviada'
let coberta=0
let commits=0, rollbacks=0, inserts=0

// Resolve a resposta simulada pra cada formato de query que as rotas mandam.
// `texto` é o SQL com `?` no lugar de cada valor interpolado (facilita
// comparar com os testes antigos); `args` são os valores na mesma ordem.
function resolverQuery(texto, args) {
 if(/SELECT\s+id_evento\s+FROM evento/.test(texto))return Number(args[0])===1?[{id_evento:1}]:[]
 if(texto.includes('SELECT i.*'))return [{id_item_custo:10,categoria:'Estrutura',descricao_detalhada:'Tenda',quantidade:5,valor_unitario:100,quantidade_coberta:coberta,quantidade_restante:Math.max(0,5-coberta)}]
 if(texto.includes('SELECT e.id_evento'))return args[1]===8?[{id_evento:1}]:[]
 if(texto.includes('SELECT * FROM solicitacao_fornecimento'))return [{status:resposta}]
 if(texto.includes('SELECT * FROM produto_solicitacao'))return [{id_item_custo_fk:10,quantidade:2}]
 if(texto.includes('SELECT f.id_fornecedor'))return [{id_fornecedor:7,nome_organizacao:'Empresa teste',id:1,produto:'Tenda',quantidade:2,descricao_detalhada:'Tenda'}]
 if(texto.trim().startsWith('INSERT')){
  inserts++
  if(texto.includes('solicitacao_fornecimento'))return [{id:123}]
  return [{}]
 }
 if(texto.trim().startsWith('UPDATE solicitacao')){
  resposta=args[0];if(resposta==='aceita')coberta+=2;return []
 }
 if(texto.includes('SELECT s.*')){
  assert.match(texto,/WHERE\s+(s\.id_fornecedor_fk|e\.id_organizador_fk)\s*=\s*\?/)
  return []
 }
 if(texto.includes('SELECT p.* FROM produto_solicitacao')){
  assert.match(texto,/=\s*ANY\(\?\)/)
  return []
 }
 throw new Error(`SQL inesperado: ${texto}`)
}

const isFragmento = (v) => v && typeof v === 'object' && v.__fragmento

// Dublê mínimo do `sql` do pacote `postgres`: tagged template + sql.begin +
// sql.array + composição de fragmentos (`WHERE ${condicao}` onde `condicao`
// também é um `sql\`...\``).
function montarSql() {
 function sqlFn(partes, ...valores) {
  let texto = partes[0]
  const argsFinais = []
  valores.forEach((v, i) => {
   if (isFragmento(v)) {
    texto += v.texto
    argsFinais.push(...v.args)
   } else {
    argsFinais.push(v)
    texto += '?'
   }
   texto += partes[i + 1]
  })
  const fragmento = {
   __fragmento: true,
   texto,
   args: argsFinais,
   then(resolve, reject) {
    Promise.resolve().then(() => resolve(resolverQuery(texto, argsFinais))).catch(reject)
   },
  }
  return fragmento
 }
 sqlFn.array = (lista) => lista
 sqlFn.begin = async (fn) => {
  try {
   const resultado = await fn(sqlFn)
   commits++
   return resultado
  } catch (e) {
   rollbacks++
   throw e
  }
 }
 return sqlFn
}

globalThis.__testSql = montarSql()
registerHooks({resolve(spec,ctx,next){if(spec.endsWith('/config/db.js')||spec==='../config/db.js')return {url:'data:text/javascript,export default globalThis.__testSql',shortCircuit:true};return next(spec,ctx)}})
const {default:propostas}=await import('../routes/propostaRoutes.js')
const {default:eventos}=await import('../routes/eventoRoutes.js')
const app=express();app.use(express.json());app.use('/api/propostas',propostas);app.use('/api',eventos);app.use((e,req,res,next)=>res.status(500).json({erro:e.message}))
const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r))
after(()=>server.close())
const base=`http://127.0.0.1:${server.address().port}/api`
async function request(path,perfil,method='GET',body){return fetch(base+path,{method,headers:{'Content-Type':'application/json',...(perfil?{Authorization:`Bearer ${tokens[perfil]}`}:{})},...(body?{body:JSON.stringify(body)}:{})})}
const proposta={eventoId:1,mensagem:'Inclui entrega e montagem.',produtos:[{itemId:10,produto:'Tenda de 3 metros',quantidade:2,valorUnitario:'85.50'}]}
test('custos exigem sessão e perfil fornecedor',async()=>{
 assert.equal((await request('/eventos/1/custos')).status,401)
 for(const perfil of ['cliente','organizador'])assert.equal((await request('/eventos/1/custos',perfil)).status,403)
 const r=await request('/eventos/1/custos','fornecedor');assert.equal(r.status,200);assert.equal((await r.json())[0].descricao_detalhada,'Tenda')
 assert.equal((await request('/eventos/9/custos','fornecedor')).status,404)
})
test('propostas isolam fornecedores e organizadores e bloqueiam clientes',async()=>{
 assert.equal((await request('/propostas','cliente')).status,403)
 for(const perfil of ['fornecedor','organizador'])assert.equal((await request('/propostas',perfil)).status,200)
 assert.equal((await request('/propostas','organizador','POST',proposta)).status,403)
})
test('validação de produtos, valores, mensagem e vínculo ao evento',async()=>{
 for(const mudanca of [{produtos:[]},{mensagem:' '},{mensagem:'x'.repeat(1001)},{produtos:[{...proposta.produtos[0],valorUnitario:-1}]},{produtos:[{...proposta.produtos[0],valorUnitario:'1.001'}]},{produtos:[{...proposta.produtos[0],quantidade:1.5}]},{produtos:[proposta.produtos[0],proposta.produtos[0]]},{produtos:[{...proposta.produtos[0],itemId:999}]},{produtos:[{...proposta.produtos[0],quantidade:6}]}])assert.ok([400,409].includes((await request('/propostas','fornecedor','POST',{...proposta,...mudanca})).status))
 assert.equal((await request('/propostas','fornecedor','POST',{...proposta,eventoId:9})).status,404)
 assert.ok(rollbacks>=2)
 assert.equal(inserts,0)
})
test('envio grava cabeçalho e produto na mesma transação',async()=>{
 const r=await request('/propostas','fornecedor','POST',proposta);assert.equal(r.status,201);assert.deepEqual(await r.json(),{id:123});assert.equal(commits,1);assert.equal(inserts,2)
})
test('apenas o dono responde; resposta não pode ser sobrescrita',async()=>{
 assert.equal((await request('/propostas/123','fornecedor','PATCH',{status:'aceita'})).status,403)
 assert.equal((await request('/propostas/123','outro','PATCH',{status:'aceita'})).status,404)
 assert.equal((await request('/propostas/123','organizador','PATCH',{status:'invalido'})).status,400)
 assert.equal((await request('/propostas/123','organizador','PATCH',{status:'aceita'})).status,200)
 assert.equal((await request('/propostas/123','organizador','PATCH',{status:'recusada'})).status,409)
 resposta='enviada';assert.equal((await request('/propostas/123','organizador','PATCH',{status:'recusada'})).status,200)
})


test('saldo parcial e total; envio e aceite bloqueiam excesso sem alterar proposta',async()=>{
 coberta=3;resposta='enviada'
 let r=await request('/eventos/1/custos','fornecedor');let [item]=await r.json()
 assert.equal(item.quantidade_restante,2);assert.equal(item.quantidade_coberta,3)
 assert.equal((await request('/propostas','fornecedor','POST',{...proposta,produtos:[{...proposta.produtos[0],quantidade:3}]})).status,409)
 coberta=4
 const antes=commits
 assert.equal((await request('/propostas/123','organizador','PATCH',{status:'aceita'})).status,409)
 assert.equal(resposta,'enviada');assert.equal(commits,antes)
 assert.equal((await request('/propostas/123','organizador','PATCH',{status:'recusada'})).status,200)
 assert.equal(coberta,4)
 coberta=5
 r=await request('/eventos/1/custos','fornecedor');[item]=await r.json();assert.equal(item.quantidade_restante,0)
 assert.equal((await request('/propostas','fornecedor','POST',proposta)).status,409)
})
test('empresas confirmadas disponíveis aos dois perfis; clientes bloqueados',async()=>{
 for(const perfil of ['organizador','fornecedor']){
  const r=await request('/eventos/1/fornecedores',perfil);assert.equal(r.status,200)
  assert.equal((await r.json())[0].nome_organizacao,'Empresa teste')
 }
 assert.equal((await request('/eventos/1/fornecedores','cliente')).status,403)
})
