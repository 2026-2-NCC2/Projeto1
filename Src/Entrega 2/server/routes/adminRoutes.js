import { Router } from 'express'
import pool from '../config/db.js'
import { autenticar, permitir} from '../middleware/authM.js'


const router = Router()

router.get("/admin/cadastros", autenticar, permitir(['admin']), async (req,res)=>{
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
//Para aprovar ou rejeitar cadastros de um organizador ou fornecedor
// Apenas para adms ;)
router.patch('/admin/cadastros/:id', autenticar, permitir('administrador'), async (req, res) => {
    const { id } = req.params //direto da url
    const { status } = req.body // json enviado pelo front

    // Validacao do status so aceita 'aprovado' ou 'rejeitado'
    if (!['aprovado', 'rejeitado']. includes(status)) {
        return res.status(400).json({ erro: 'Status inválido. Use "Aprovado" ou "Rejeitado".' })}

    try { //descobrir se e organizador ou fornecedor para atualizar
        const [usuario] = await pool.query('select perfil from usuario where id_usuario = ?', [id])

        if (usuario.length === 0) {
            return res.status(404).json({ erro: 'usuario não encontrado' })
    }   
        const perfil = usuario[0].perfil

    // escolhe a tabela e a coluna de id de acordo com o perfil
        let tabela, colunaId
        if (perfil === 'organizador') {
            tabela = 'organizador'
            colunaId = 'id_organizador'

        } else if (perfil === 'fornecedor') {
            tabela = 'fornecedor'
            colunaId = 'id_fornecedor'
        
        } else { // perfil invalido
            return res.status(400).json({ erro: 'Perfil inválido' })
        }
    
    // Atualiza o status na tabela correta
    await pool.query(`UPDATE ${tabela} SET status_aprovacao = ? WHERE ${colunaId} = ?`, [status, id])
        return res.json({ ok: true, id: Number(id), status })
    } catch (erro) {
        console.error(erro)
        return res.status(500).json({ erro: 'erro no servidor' })
    }
})