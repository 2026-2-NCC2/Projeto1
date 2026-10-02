/*import mysql from 'mysql2/promise'
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

export default pool*/

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

// ==========================================
// CONEXÃO NOVA: SQLite (Para rodar na escola)
// ==========================================
const pool = await open({
    filename: './banco.db',
    driver: sqlite3.Database
});

// Ativa o suporte para as chaves estrangeiras (ON DELETE CASCADE)
await pool.run('PRAGMA foreign_keys = ON');

console.log('Conectado ao SQLite com sucesso!');

export default pool;