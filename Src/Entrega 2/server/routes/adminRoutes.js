import { Router } from 'express'
import pool from '../config/db.js'
import { autenticar, permitir } from '../middlewares/autenticacao.js';


const router = Router()

router.get("/admin/cadastros", autenticar, permitir("administrador"), async (req,res)=>{
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

// PATCH /api/admin/cadastros/:id — aprova ou rejeita um cadastro
router.patch('/admin/cadastros/:id', autenticar, permitir("administrador"), async (req, res) => {
    const { id } = req.params
    const { tipo, status } = req.body

    // whitelist: so aceita esses valores exatos, protege contra SQL injection no nome da tabela/coluna
    if (!['organizador', 'fornecedor'].includes(tipo)) {
        return res.status(400).json({ erro: 'Tipo inválido.' })
    }
    if (!['aprovado', 'rejeitado'].includes(status)) {
        return res.status(400).json({ erro: 'Status inválido.' })
    }

    const tabela = tipo === 'organizador' ? 'organizador' : 'fornecedor'
    const coluna = tipo === 'organizador' ? 'id_organizador' : 'id_fornecedor'

    try {
        const [resultado] = await pool.query(
            `UPDATE ${tabela} SET status_aprovacao = ? WHERE ${coluna} = ?`,
            [status, id]
        )

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Cadastro não encontrado.' })
        }

        res.json({ ok: true, status })
    } catch (erro) {
        console.error(erro)
        res.status(500).json({ erro: 'Erro no servidor' })
    }
})


export default router