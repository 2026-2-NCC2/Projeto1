import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import eventoRoutes from './routes/eventoRoutes.js'
import propostaRoutes from './routes/propostaRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { tratarErros } from './middlewares/erros.js'

// Este arquivo só monta o app (rotas e middlewares), sem chamar app.listen.
// - Localmente, o index.js importa o app e sobe o servidor na porta 3000.
// - Na Vercel, o api/index.js exporta o app como função serverless.
const app = express()

// Origens que podem chamar a API. Em produção, defina CORS_ORIGIN na Vercel
// (várias separadas por vírgula). Sem a variável, libera o frontend publicado e o Vite local.
const origensPermitidas = (process.env.CORS_ORIGIN ||
    'https://trocaticket-six.vercel.app,http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origem) => origem.trim().replace(/\/$/, ''))
    .filter(Boolean)

app.use(cors({
    origin(origem, callback) {
        // requisições sem Origin (Postman, curl, servidor-servidor) passam
        if (!origem || origensPermitidas.includes('*') || origensPermitidas.includes(origem)) {
            return callback(null, true)
        }
        callback(null, false)
    },
}))

// Middleware: permite ler o corpo da requisição como JSON
// Sem isso, req.body chega undefined
app.use(express.json())

// Rota de teste
app.get('/', (req, res) => {
    res.send('servidor rodando')
})

// Health check usado para conferir o deploy: GET /api/health
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

// Registra todas as rotas de auth com o prefixo /api
app.use('/api', authRoutes)

// Registra as rotas de evento com o prefixo /api
app.use('/api', eventoRoutes)

// Registra as rotas relacionadas ao admin com o prefixo /api
app.use('/api', adminRoutes)

app.use('/api/propostas', propostaRoutes)
app.use(tratarErros)

export default app
