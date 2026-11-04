// Entrada da Vercel: o app Express inteiro roda como uma função serverless.
// O vercel.json redireciona todas as URLs (/, /api/...) para cá.
import app from '../app.js'

export default app
