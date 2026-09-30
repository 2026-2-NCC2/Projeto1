import express from 'express'
import cors from 'cors'
import pool from './config/db.js'
import authRoutes from './routes/authRoutes.js'

const app = express()
const port = 3000

// Middleware: permite que o frontend (outra porta) acesse o backend
app.use(cors())
// Middleware: permite ler o corpo da requisição como JSON
// Sem isso, req.body chega undefined
app.use(express.json())

// Rota de teste
app.get('/', (req, res) => {
    res.send('servidor rodando')
})

// Rota de listar usuários (útil pra testar no Postman)
app.get('/usuarios', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM usuario')
        res.json(resultado[0]) // [0] são as linhas, [1] são os metadados
    } catch (erro) {
        console.error('ERRO NO MYSQL:', erro)
        res.status(500).send('Erro ao buscar usuários.')
    }
})

// Registra todas as rotas de auth com o prefixo /api
app.use('/api', authRoutes)

app.listen(port, () => {
    console.log(`backend rodando na porta ${port}`)
})