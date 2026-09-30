const mysql = require('mysql2/promise')
require('dotenv').config()

const pool = mysql.createPool({
    host: 'localhost',
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_SECRET,
    database: process.env.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

async function testConnection(){
    try {
        const connection = await pool.getConnection()
        console.log('Banco conectado com sucesso!')
        connection.release()
    } catch (error) {
        console.error('Erro ao conectar.', error.message)
        process.exit(1)
    }
}

testConnection()

module.exports = pool




