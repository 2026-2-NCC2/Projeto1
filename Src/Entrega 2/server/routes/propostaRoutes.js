import { consultarCobertura, conflitoCobertura } from '../services/cobertura.js'
import { Router } from 'express'
import pool from '../config/db.js'
import { autenticar, permitir } from '../middleware/auth.js'
const router=Router()
router.use(autenticar,permitir('fornecedor','organizador'))
router.get('/',async(req,res,next)=>{
 try {
  const fornecedor=req.usuario.perfil==='fornecedor'
  const [rows]=await pool.query(`SELECT s.*,e.titulo_evento,f.nome_organizacao AS fornecedor,o.nome_organizacao AS organizador FROM solicitacao_fornecimento s JOIN evento e ON e.id_evento=s.id_evento_fk JOIN fornecedor f ON f.id_fornecedor=s.id_fornecedor_fk JOIN organizador o ON o.id_organizador=e.id_organizador_fk WHERE ${fornecedor?'s.id_fornecedor_fk':'e.id_organizador_fk'}=? ORDER BY s.criada_em DESC`,[req.usuario.id_usuario])
  if(!rows.length)return res.json([])
  const [produtos]=await pool.query('SELECT p.* FROM produto_solicitacao p WHERE p.id_solicitacao_fk IN (?)',[rows.map(r=>r.id)])
  res.json(rows.map(r=>({...r,produtos:produtos.filter(p=>p.id_solicitacao_fk===r.id)})))
 }catch(e){next(e)}
})
router.post('/',permitir('fornecedor'),async(req,res,next)=>{
 const {eventoId,mensagem,produtos}=req.body
 if(!Number.isInteger(Number(eventoId))||typeof mensagem!=='string'||!mensagem.trim()||mensagem.length>1000||!Array.isArray(produtos)||!produtos.length||produtos.length>100)return res.status(400).json({erro:'Informe os produtos e uma mensagem de até 1.000 caracteres.'})
 if(produtos.some(p=>!p||typeof p!=='object'))return res.status(400).json({erro:'Produtos inválidos.'})
 const ids=produtos.map(p=>Number(p.itemId))
 if(new Set(ids).size!==ids.length||produtos.some(p=>!Number.isInteger(Number(p.itemId))||typeof p.produto!=='string'||!p.produto.trim()||p.produto.length>255||!Number.isInteger(Number(p.quantidade))||Number(p.quantidade)<1||Number(p.quantidade)>1000000||!/^\d+(\.\d{1,2})?$/.test(String(p.valorUnitario))||Number(p.valorUnitario)<=0||Number(p.valorUnitario)>9999999999))return res.status(400).json({erro:'Confira os produtos, quantidades e valores positivos com até duas casas decimais.'})
 let conn
 try {
  conn=await pool.getConnection();await conn.beginTransaction()
  const [eventos]=await conn.query('SELECT id_evento FROM evento WHERE id_evento=? AND status_publicacao="publicado" FOR UPDATE',[eventoId])
  if(!eventos.length){await conn.rollback();return res.status(404).json({erro:'Evento indisponível para propostas.'})}
  const itens=await consultarCobertura(conn,eventoId)
  if(conflitoCobertura(itens,produtos)){await conn.rollback();return res.status(409).json({erro:'A quantidade oferecida ultrapassa o saldo disponível. Atualize os detalhes do evento.'})}
  const [r]=await conn.query('INSERT INTO solicitacao_fornecimento (id_evento_fk,id_fornecedor_fk,mensagem) VALUES (?,?,?)',[eventoId,req.usuario.id_usuario,mensagem.trim()])
  for(const p of produtos)await conn.query('INSERT INTO produto_solicitacao (id_solicitacao_fk,id_item_custo_fk,produto,quantidade,valor_unitario) VALUES (?,?,?,?,?)',[r.insertId,p.itemId,p.produto.trim(),p.quantidade,p.valorUnitario])
  await conn.commit();res.status(201).json({id:r.insertId})
 }catch(e){if(conn)await conn.rollback();next(e)}finally{conn?.release()}
})
router.patch('/:id',permitir('organizador'),async(req,res,next)=>{
 if(!['aceita','recusada'].includes(req.body.status))return res.status(400).json({erro:'Resposta inválida.'})
 let conn
 try {
  conn=await pool.getConnection();await conn.beginTransaction()
  // Primeiro bloqueia o evento: envios e respostas usam a mesma ordem de bloqueio.
  const [eventos]=await conn.query(`SELECT e.id_evento FROM evento e JOIN solicitacao_fornecimento s ON s.id_evento_fk=e.id_evento WHERE s.id=? AND e.id_organizador_fk=? FOR UPDATE`,[req.params.id,req.usuario.id_usuario])
  if(!eventos.length){await conn.rollback();return res.status(404).json({erro:'Proposta não encontrada.'})}
  const [propostas]=await conn.query('SELECT * FROM solicitacao_fornecimento WHERE id=? FOR UPDATE',[req.params.id])
  if(propostas[0].status!=='enviada'){await conn.rollback();return res.status(409).json({erro:'Proposta já respondida.'})}
  if(req.body.status==='aceita'){
   const itens=await consultarCobertura(conn,eventos[0].id_evento)
   const [produtos]=await conn.query('SELECT * FROM produto_solicitacao WHERE id_solicitacao_fk=?',[req.params.id])
   if(!produtos.length || conflitoCobertura(itens,produtos)){await conn.rollback();return res.status(409).json({erro:'Não foi possível aceitar: um ou mais itens ultrapassam o saldo restante do evento. Outra proposta pode já ter sido aceita.'})}
  }
  await conn.query('UPDATE solicitacao_fornecimento SET status=?,respondida_em=NOW() WHERE id=?',[req.body.status,req.params.id])
  await conn.commit();res.json({ok:true})
 }catch(e){if(conn)await conn.rollback();next(e)}finally{conn?.release()}
})
export default router
