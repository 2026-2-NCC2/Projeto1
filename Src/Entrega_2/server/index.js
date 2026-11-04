import app from './app.js'
import { testarConexao } from './config/db.js'

// Servidor local (npm start / npm run dev). Na Vercel quem roda é o api/index.js.
// em produção a plataforma de hospedagem define a porta pela variável PORT; localmente continua 3000
const port = process.env.PORT || 3000

// Testa o banco ao iniciar; se falhar, encerra com a dica do erro
await testarConexao({ encerrarSeFalhar: true })

app.listen(port, () => {
    console.log(`backend rodando na porta ${port}`)
})
