import postgres from 'postgres'
import dotenv from 'dotenv'
dotenv.config()

// String de conexão do Supabase: Project Settings > Database > Connection string > URI
// - Local: pode ser a conexão direta  postgresql://postgres:[SENHA]@db.[REF].supabase.co:5432/postgres
// - Vercel: use o POOLER (Transaction mode, porta 6543), porque a conexão direta é só IPv6
//   e a Vercel não tem IPv6:  postgresql://postgres.[REF]:[SENHA]@aws-0-[REGIAO].pooler.supabase.com:6543/postgres
const connectionString = process.env.DATABASE_URL

// Na Vercel cada requisição pode rodar em uma instância nova (serverless)
const naVercel = Boolean(process.env.VERCEL)

if (!connectionString) {
    // Não usamos process.exit aqui: na Vercel isso derrubaria a função inteira.
    // O erro aparece no log e as rotas respondem 500 pelo tratador de erros.
    console.error('❌ ERRO: a variável DATABASE_URL não foi definida (.env local ou Environment Variables da Vercel)!')
}

// O pooler do Supabase em modo transação (porta 6543) não suporta prepared statements
const usandoPooler = /:6543(\/|$)/.test(connectionString || '')

const sql = postgres(connectionString || 'postgres://indefinido@localhost/indefinido', {
    // serverless: poucas conexões por instância para não estourar o limite do banco
    max: naVercel ? 1 : 10,
    idle_timeout: naVercel ? 20 : undefined,
    prepare: !usandoPooler,
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

// Testa a conexão. Chamado pelo index.js ao subir o servidor local.
export async function testarConexao({ encerrarSeFalhar = false } = {}) {
    try {
        await sql`select 1`
        console.log('Banco (Supabase/Postgres) conectado com sucesso!')
        return true
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
        if (encerrarSeFalhar) process.exit(1)
        return false
    }
}

export default sql
