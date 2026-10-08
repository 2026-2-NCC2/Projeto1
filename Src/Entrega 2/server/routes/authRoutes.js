import { Router } from 'express'
import pool from '../config/db.js'
import bcrypt from 'bcrypt'

const router = Router()

router.post('/cadastro', async (req, res) => {
    const { nome, username, email, idade, senha, perfil } = req.body

    if (!nome || !email || !senha || !perfil || !idade || !username) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' })
    }

    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10)

        const [resultado] = await pool.query(
            `INSERT INTO usuario (nome, idade, username, email, senha, perfil) VALUES (?, ?, ?, ?, ?, ?)`,
            [nome, idade, username, email, senhaCriptografada, perfil]
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


router.post("/login", async (req,res)=>{

    const { email, senha } = req.body
    
    if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' })
    }

    try {
        const [resultado] = await pool.query(`SELECT id_usuario, nome, email, senha, perfil FROM usuario WHERE email=?`,
        [email]
    )

    const [usuario] = resultado

    if (!usuario) {
        return res.status(401).json({ erro: 'E-mail ou senha inválidos.' })
    }
    const senhaValida = await bcrypt.compare(senha, usuario.senha)
    if (!senhaValida) {
        return res.status(401).json({ erro: 'E-mail ou senha inválidos.' })
    }

    return res.status(200).json({
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
    })

    } catch (error) {
        console.error(erro)
        return res.status(500).json({ erro: 'Erro interno.' })
    }
    
})
export default router
