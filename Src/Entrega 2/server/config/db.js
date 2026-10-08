import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: 'localhost',
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_SECRET,
    database: process.env.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

// Testa a conexão ao iniciar o servidor
async function testConnection() {
    try {
        const connection = await pool.getConnection()
        console.log('Banco conectado com sucesso!')
        connection.release()
    } catch (error) {
        console.error('Erro ao conectar:', error.message)
        process.exit(1)
    }
}

testConnection()

export default pool