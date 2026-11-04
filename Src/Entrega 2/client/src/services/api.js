// Em produção, defina VITE_API_URL (ex: https://meu-backend.com/api). Sem ela, usa o servidor local.
const api_url = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

// Único lugar que faz fetch: manda o token (se existir), lê o JSON e, se a resposta
// não for OK, lança um erro com `status` e a mensagem vinda do backend.
// Todas as permissões são conferidas novamente no servidor.
async function requisitar(path, options = {}, mensagemPadrao = 'Não foi possível acessar o servidor.') {
  const token = localStorage.getItem('token')
  const response = await fetch(`${api_url}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const data = await response.json().catch(() => ({}))

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
  return requisitar('/cadastro', { method: 'POST', body: JSON.stringify(dados) }, 'Erro ao cadastrar.')
}

export function loginUsuario(dados) {
  return requisitar('/login', { method: 'POST', body: JSON.stringify(dados) }, 'Erro ao entrar.')
}

export function buscarCadastros() {
  return requisitar('/admin/cadastros', { method: 'GET' }, 'Erro ao buscar usuários.')
}

export function atualizarStatusCadastro(id, tipo, status) {
  return requisitar(`/admin/cadastros/${id}`, { method: 'PATCH', body: JSON.stringify({ tipo, status }) }, 'Erro ao atualizar cadastro.')
}

// usada pelas demais telas (eventos, propostas, ticket...)
export function solicitar(path, options = {}) {
  return requisitar(path, options)
}
