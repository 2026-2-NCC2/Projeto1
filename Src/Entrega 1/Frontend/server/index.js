import express from 'express'
import pool from './config/db'
import bcrypt from 'bcrypt'

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

app.post('/api/cdastro', async (req, res) =>{
    // Pegamos as variáveis de dentro do corpo da requisição (req.body)
    const { nome, email, senha, tipo } = req.body
    // Validação básica para não enviar campos vazios ao banco
    if (!nome || !email || !senha || !tipo) {
        return res.status(400).json({ erro: 'Todos os campos (nome, email, senha, tipo) são obrigatórios.' })
    }

    try {
      
        // 2. CRIPTOGRAFIA: Gera o hash da senha de forma segura
        // O número 10 indica o "salt" (o nível de complexidade matemática da criptografia)
        const senhaCriptografada = await bcrypt.hash(senha, 10)

        // 3. QUERY MODIFICADA: Agora passamos 'senhaCriptografada' em vez da senha limpa
        const query = `
            INSERT INTO usuario (nome, idade, username, email, senha, perfil) 
            VALUES (?, ?, ?, ?, ?, ?)
        `
        const [resultado] = await pool.query(query, [nome, idade, username, email, senhaCriptografada, perfil])


        // Retorna o sucesso e o ID que o MySQL gerou automaticamente
        return res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!',
            id: resultado.insertId,
            usuario: { nome, email, tipo }
        })

    } catch (erro) {
        console.error('ERRO AO CADASTRAR NO MYSQL:', erro)
        return res.status(500).json({ erro: 'Erro interno ao salvar o usuário no banco de dados.' })
    }


})


app.listen(port, () => {
    console.log(`backend rodando na porta ${port}.`)
})



