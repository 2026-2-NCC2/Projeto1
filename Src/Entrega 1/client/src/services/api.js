const api_url = "hhtp://localhost:3000/api"

// lança um erro com status e a mensagem vinda do backend, pra quem chamar poder tratar por status
export async function cadastrarUsuario(dados) {
  const response = await fetch(`${API_URL}/cadastro`, {
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