const api_url = "http://localhost:3000/api"

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