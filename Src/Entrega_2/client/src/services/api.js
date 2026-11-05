// Endereço do backend. Pode ser sobrescrito por VITE_API_URL (Vercel ou .env).
// - build de produção (Vercel): API publicada em trocaticket-api.vercel.app
// - desenvolvimento (npm run dev): servidor local na porta 3000
const URL_PADRAO = import.meta.env.PROD
  ? "https://trocaticket-api.vercel.app/api"
  : "http://localhost:3000/api"

// Normaliza a URL: tira barras sobrando no fim e garante o sufixo /api.
// Assim "https://x.vercel.app/", "https://x.vercel.app" e "https://x.vercel.app/api/" viram "https://x.vercel.app/api".
// (Uma barra dupla como "//eventos" faz a Vercel redirecionar, e o navegador bloqueia redirect no preflight do CORS.)
function normalizarApiUrl(url) {
  const semBarraFinal = url.trim().replace(/\/+$/, "")
  return semBarraFinal.endsWith("/api") ? semBarraFinal : `${semBarraFinal}/api`
}

const api_url = normalizarApiUrl(import.meta.env.VITE_API_URL || URL_PADRAO)

// Único lugar que faz fetch: manda o token (se existir), lê o JSON e, se a resposta
// não for OK, lança um erro com `status` e a mensagem vinda do backend.
// Todas as permissões são conferidas novamente no servidor.
// as telas de eventos, propostas e ticket chamam essa funcao direto
export async function solicitar(path, options = {}, mensagemPadrao = 'Não foi possível acessar o servidor.') {
  const token = localStorage.getItem('token')
  const response = await fetch(`${api_url}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  // le o JSON da resposta; se o servidor nao mandar JSON (ex: erro do proxy), fica um objeto vazio
  let data
  try {
    data = await response.json()
  } catch {
    data = {}
  }

  if (!response.ok) {
    const erro = new Error(data.erro || mensagemPadrao)
    erro.status = response.status
    erro.campo = data.campo // 409: qual campo já existe ('email' | 'username' | 'cnpj')
    erro.campos = data.campos // 400: { campo: mensagem } vindo da validação do servidor
    throw erro
  }

  return data
}

export function cadastrarUsuario(dados) {
  return solicitar('/cadastro', { method: 'POST', body: JSON.stringify(dados) }, 'Erro ao cadastrar.')
}

export function loginUsuario(dados) {
  return solicitar('/login', { method: 'POST', body: JSON.stringify(dados) }, 'Erro ao entrar.')
}

export function buscarCadastros() {
  return solicitar('/admin/cadastros', { method: 'GET' }, 'Erro ao buscar usuários.')
}

export function atualizarStatusCadastro(id, tipo, status) {
  return solicitar(`/admin/cadastros/${id}`, { method: 'PATCH', body: JSON.stringify({ tipo, status }) }, 'Erro ao atualizar cadastro.')
}
