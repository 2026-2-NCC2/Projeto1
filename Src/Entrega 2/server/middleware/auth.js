import { createHash, randomBytes } from 'node:crypto'
import pool from '../config/db.js'
export async function criarSessao(id) {
 const token = randomBytes(32).toString('hex')
 await pool.query('INSERT INTO sessao (token_hash,id_usuario_fk,expira_em) VALUES (?,?,DATE_ADD(NOW(), INTERVAL 7 DAY))', [createHash('sha256').update(token).digest('hex'),id])
 return token
}
export async function autenticar(req,res,next) {
 try {
  const token = req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1]
  if (!token) return res.status(401).json({erro:'Entre novamente para continuar.'})
  const [rows] = await pool.query('SELECT u.id_usuario,u.perfil FROM sessao s JOIN usuario u ON u.id_usuario=s.id_usuario_fk WHERE s.token_hash=? AND s.expira_em>NOW()', [createHash('sha256').update(token).digest('hex')])
  if (!rows.length) return res.status(401).json({erro:'Sessão expirada. Entre novamente.'})
  req.usuario=rows[0]; next()
 } catch (e) { next(e) }
}
export const permitir = (...perfis) => (req,res,next) => perfis.includes(req.usuario.perfil) ? next() : res.status(403).json({erro:'Seu perfil não tem acesso a esta ação.'})
