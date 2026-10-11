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

// CRUD DELETE - JULIA ;)
// apaga um usuario pelo id, chamando a rota DELETE 
export async function deletarUsuario(id){

// manda a requisicao com o id na url (o backend le esse id em req.params)
const response = await fetch (`${api_url}/deleteUsers/${id}`, {method: 'delete'})

// le a resposta em json se vier vazia ou invalida usa um objeto vazio pra nao quebrar
const data = await response.json().catch(() => ({}))

// se o status nao for 2xx (ex: 404 usuario nao encontrado, 500 erro no servidor) = erro
if (!response.ok) {
  // usa a mensagem que veio do backend ou uma mensagem que precisamos colocar como padrao
  const erro = new Error(data.erro || 'Erro ao deletar.')
  
  // guarda o status no erro pra quem chamar poder tratar cada um
  erro.status = response.status
  throw erro
}
// se der certo ele vai devolver { ok: true, mensagem: 'Usuário excluído com sucesso.' }
return data
}