import { Router } from 'express'
import pool from '../config/db.js'
import bcrypt from 'bcrypt'

const router = Router()

router.post('/cadastro', async (req, res) => {
    const { nome, email, senha, perfil } = req.body

    if (!nome || !email || !senha || !perfil) {
        return res.status(400).json({ erro: 'Nome, email, senha e perfil são obrigatórios.' })
    }

    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10)

        const [resultado] = await pool.query(
            `INSERT INTO usuario (nome, email, senha, perfil) VALUES (?, ?, ?, ?)`,
            [nome, email, senhaCriptografada, perfil]
        )

        return res.status(201).json({ ok: true, id: resultado.insertId })

    } catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ erro: 'E-mail já cadastrado.' })
        }
        console.error(erro)
        return res.status(500).json({ erro: 'Erro interno.' })
    }
})

router.delete("/deleteUsers/:id", async (req,res) =>{
    const {id} = req.params

    try{

        const [resultado] = await pool.query(
            `DELETE FROM usuario WHERE id_usuario= ?`,
            [id]
        )

        if (resultado.affectedRows===0){
            return res.status(404).json({ erro: 'Usuário não encontrado.' })
        }

        return res.status(200).json({ ok: true, mensagem: 'Usuário excluído com sucesso.' })
    }
    catch(erro){

        return res.status(500).json({ erro: 'Erro interno ao excluir usuário.' })

    }
})

export default router
