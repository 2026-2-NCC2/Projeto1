import mysql from 'mysql2/promise'
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

export default pool

/*import postgres from 'postgres'
import dotenv from 'dotenv'
dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    console.error("❌ ERRO: A variável DATABASE_URL não foi encontrada no arquivo .env!")
    process.exit(1)
}

// Configuração do cliente postgres.js ajustada para o Supabase
const pool = postgres(connectionString, {
    max: 10,
    ssl: 'require', // 💡 O Supabase EXIGE conexão segura (SSL) ativa
    connect_timeout: 10 // Tempo máximo de espera para conectar (em segundos)
})

// Função para testar se a conexão está realmente funcionando
async function testConnection() {
    try {
        // Roda uma query simples de teste
        const result = await sql`SELECT 1 as conexao_ativa`
        console.log('🚀 Conectado ao Supabase com sucesso! Teste:', result[0].conexao_ativa)
    } catch (error) {
        console.error('❌ Erro crítico ao conectar ao Supabase!')
        console.error('Detalhes do erro:', error.message)
        console.error('Código do erro:', error.code)
        
        if (error.message.includes('password authentication failed')) {
            console.error('💡 Dica: Verifique se a senha do banco no seu .env está correta.')
        }
        if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
            console.error('💡 Dica: Verifique se o Host do banco no seu .env está correto ou se há bloqueio de internet.')
        }
        process.exit(1)
    }
}

testConnection()

export default pool*/
