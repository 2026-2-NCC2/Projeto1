import express from 'express'
import pool from './config/db'

const app = express()
const port = 3000

app.get('/', (req, res ) => {
    res.send('server rodando')
})

app.get('/usuarios', async (req, res) => {
    try {
        // No MySQL, o await pool.query devolve um array onde a primeira posição [linhas] são os dados do banco
        const resultado = await pool.query('SELECT * FROM usuario')
        
        console.log("Dados vindos do MySQL:", linhas) // Para checar no terminal do seu amigo
        
        // Envia as linhas encontradas para o Postman
        res.json(resultado[0]) 
    } catch (erro) {
        console.error('ERRO NO MYSQL:', erro)
        res.status(500).send('Erro ao buscar usuários no servidor.')
    }
})

app.listen(port, () => {
    console.log(`backend rodando na porta ${port}.`)
})


