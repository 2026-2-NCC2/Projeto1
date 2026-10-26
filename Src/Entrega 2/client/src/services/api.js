const api_url = "http://localhost:3000/api"


function getToken() {
  return localStorage.getItem('token')
}

// fetch com o header Authorization já incluso, pra rotas protegidas pelo middleware `autenticar`
async function authFetch(path, options = {}) {
  const token = getToken()
  return fetch(`${api_url}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

// lança um erro com status e a mensagem vinda do backend, pra quem chamar poder tratar por status
export async function cadastrarUsuario(dados) {
  const response = await fetch(`${api_url}/cadastro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const erro = new Error(data.erro || 'Erro ao cadastrar.')
    erro.status = response.status
    throw erro
  }

  return data
}

export async function loginUsuario(dados) {
  const response = await fetch(`${api_url}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const erro = new Error(data.erro || 'Erro ao entrar.')
    erro.status = response.status
    throw erro
  }

  return data
}

export async function buscarCadastros(){
  const response = await authFetch('/admin/cadastros', { method: 'GET' })
  const data = await response.json().catch(()=>({}))
  if (!response.ok){
    const erro = new Error(data.erro || 'Erro ao buscar usuários.')
    erro.status = response.status
    throw erro
  }
  return data
}

export async function atualizarStatusCadastro(id, tipo, status) {
  const response = await authFetch(`/admin/cadastros/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ tipo, status }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const erro = new Error(data.erro || 'Erro ao atualizar cadastro.')
    erro.status = response.status
    throw erro
  }
  return data
}

// Todas as permissões são conferidas novamente no servidor.
export async function solicitar(path, options = {}) {
  const token = localStorage.getItem('token')
  const response = await fetch(`${api_url}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.erro || 'Não foi possível acessar o servidor.')
  return data
}