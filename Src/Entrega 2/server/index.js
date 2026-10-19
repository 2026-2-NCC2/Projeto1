import express from 'express'
import cors from 'cors'
import pool from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import eventoRoutes from './routes/eventoRoutes.js'
import propostaRoutes from './routes/propostaRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
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

// Registra todas as rotas de auth com o prefixo /api
app.use('/api', authRoutes)

// Registra as rotas de evento com o prefixo /api
app.use('/api', eventoRoutes)

// Registra as rotas relacionadas ao admin com o prefixo /api
app.use('/api', adminRoutes)

app.use('/api/propostas', propostaRoutes)
app.use((erro, req, res, next) => {
 console.error(erro)
 res.status(500).json({erro:'Não foi possível concluir a operação. Tente novamente.'})
})

app.listen(port, () => {
    console.log(`backend rodando na porta ${port}`)
})

