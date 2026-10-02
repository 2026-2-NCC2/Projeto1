/*import express from 'express'
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

app.get("/usuarios", async (req,res)=>{
    try{
        const [resultado] = await pool.query("SELECT * FROM usuario;")
        res.json(resultado)
    }
    catch(erro){
        res.status(500).json({erro: "Erro no servidor"})
    }
})

// Registra todas as rotas de auth com o prefixo /api
app.use('/api', authRoutes)

app.listen(port, () => {
    console.log(`backend rodando na porta ${port}`)
})*/

import express from 'express'
import cors from 'cors'
import pool from './config/db.js' // Ele vai puxar a configuração nova do SQLite automaticamente
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

app.get("/usuarios", async (req,res)=>{
    try{
        // No SQLite com a biblioteca 'sqlite', o retorno direto já é o array de linhas, 
        // então usamos apenas "resultado" em vez de "[resultado]"
        const resultado = await pool.all("SELECT * FROM usuario;")
        res.json(resultado)
    }
    catch(erro){
        console.error(erro)
        res.status(500).json({erro: "Erro no servidor"})
    }
})

// Registra todas as rotas de auth com o prefixo /api
app.use('/api', authRoutes)

app.listen(port, () => {
    console.log(`backend rodando na porta ${port}`)
})

