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
    max: 10, // equivalente ao connectionLimit do pool mysql2 anterior
    ssl: 'require', // o Supabase exige SSL
    connect_timeout: 10,
    // O Postgres devolve colunas BIGINT (ex.: COUNT(*)) como string, pra
    // evitar perda de precisão em números muito grandes. Nesse projeto esses
    // valores são sempre contagens pequenas (ex.: quantidade_itens), então
    // convertemos pra Number aqui — equivalente ao que o mysql2 já fazia.
    types: {
        bigint: {
            to: 20, // OID 20 = int8/bigint
            from: [20],
            serialize: (valor) => String(valor),
            parse: (valor) => parseInt(valor, 10),
        },
    },
})

// Converte os placeholders `?` (estilo mysql2, usado em todas as rotas) para
// `$1, $2, ...` (estilo pg). Se a query já foi escrita com $1 diretamente
// (caso de sintaxes específicas do Postgres, como `= ANY($1)`), ela passa
// sem alteração — isso permite manter quase todo o texto das queries como
// estava, mudando apenas o necessário em cada arquivo de rota.
function paraPlaceholdersPg(texto) {
    if (!texto.includes('?')) return texto
    let indice = 0
    return texto.replace(/\?/g, () => `$${++indice}`)
}

// Roda a query via sql.unsafe (aceita texto solto com $1,$2... + parâmetros —
// o tagged template `sql\`...\`` não serve aqui, pois as rotas montam a
// query como string) e devolve no mesmo formato de tupla que o mysql2 usava:
// - SELECT: [rows]                → ex: const [eventos] = await pool.query(...)
// - INSERT/UPDATE/DELETE: [resultHeader], onde resultHeader imita o
//   ResultSetHeader do mysql2 (affectedRows / insertId).
// Isso evita ter que reescrever cada `await pool.query(...)` nas rotas.
async function executarQuery(executor, texto, params = []) {
    const textoPg = paraPlaceholdersPg(texto)
    const resultado = await executor.unsafe(textoPg, params)

    if (resultado.command === 'SELECT' || resultado.command === 'SHOW') {
        // `resultado` do postgres.js já É um array de linhas (Result extends
        // Array), então .map/.length/destructuring funcionam como no mysql2.
        return [resultado]
    }

    // INSERT/UPDATE/DELETE. O Postgres não tem insertId automático como o
    // MySQL — por isso os INSERTs que precisam do id gerado agora usam
    // `RETURNING <coluna>`. Pegamos o valor da primeira coluna da primeira
    // linha retornada, não importa o nome dela.
    const primeiraLinha = resultado[0]
    const resultHeader = {
        affectedRows: resultado.count ?? 0,
        insertId: primeiraLinha ? Object.values(primeiraLinha)[0] : undefined,
    }
    return [resultHeader]
}

const pool = {
    query: (texto, params) => executarQuery(sql, texto, params),

    // Equivalente ao pool.getConnection() do mysql2: reserva uma conexão
    // dedicada do pool pra rodar uma transação (BEGIN/COMMIT/ROLLBACK) nela.
    async getConnection() {
        const reservada = await sql.reserve()
        return {
            query: (texto, params) => executarQuery(reservada, texto, params),
            beginTransaction: () => reservada.unsafe('BEGIN'),
            commit: () => reservada.unsafe('COMMIT'),
            rollback: () => reservada.unsafe('ROLLBACK'),
            release: () => reservada.release(),
        }
    },
}

// Testa a conexão ao iniciar o servidor (mesmo comportamento de antes)
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

export default pool
