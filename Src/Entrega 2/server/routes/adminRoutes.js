import { Router } from 'express'
import pool from '../config/db.js'


const router = Router()

router.get("/admin/cadastros", async (req,res)=>{
    try{
        const [resultado] = await pool.query(`
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
        `)
        
        res.json(resultado);
    }
    catch(erro){
        console.error(erro)
        res.status(500).json({erro: "Erro no servidor"})
    }
})

export default router
