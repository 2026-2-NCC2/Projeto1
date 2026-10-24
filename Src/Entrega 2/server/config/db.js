/*import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
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
        console.error('Erro ao conectar:', {
        message: error.message,
        code: error.code,
        errors: error.errors,
    })
        process.exit(1)
    }
}

testConnection()

export default pool*/

import postgres from 'postgres'
import dotenv from 'dotenv'
dotenv.config()

// String de conexão do Supabase: Project Settings > Database > Connection string > URI
// formato: postgresql://postgres:[SUA-SENHA]@[HOST]:5432/postgres
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    console.error('❌ ERRO: a variável DATABASE_URL não foi encontrada no arquivo .env!')
    process.exit(1)
}

const sql = postgres(connectionString, {
    max: 10,
    ssl: 'require', // o Supabase exige SSL
    connect_timeout: 10,
    // O Postgres devolve colunas BIGINT (ex.: COUNT(*)) como string, pra
    // evitar perda de precisão em números muito grandes. Nesse projeto esses
    // valores são sempre contagens pequenas (ex.: quantidade_itens), então
    // convertemos pra Number aqui.
    types: {
        bigint: {
            to: 20, // OID 20 = int8/bigint
            from: [20],
            serialize: (valor) => String(valor),
            parse: (valor) => parseInt(valor, 10),
        },
    },
})

// Testa a conexão ao iniciar o servidor
async function testConnection() {
    try {
        await sql`select 1`
        console.log('Banco (Supabase/Postgres) conectado com sucesso!')
    } catch (error) {
        console.error('Erro ao conectar:', {
            message: error.message,
            code: error.code,
        })
        if (error.message?.includes('password authentication failed')) {
            console.error('💡 Dica: verifique a senha do banco (DATABASE_URL) no seu .env.')
        }
        if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
            console.error('💡 Dica: verifique o host do banco no .env ou se há bloqueio de rede.')
        }
        process.exit(1)
    }
}

testConnection()

export default sql

