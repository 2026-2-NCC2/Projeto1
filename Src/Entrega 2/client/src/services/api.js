// endereco do back-end (servidor Node que roda na porta 3000)
const api_url = "http://localhost:3000/api"

// lança um erro com status e a mensagem vinda do backend, pra quem chamar poder tratar por status
// cadastra um usuario novo: manda os dados pro back-end e devolve a resposta
export async function cadastrarUsuario(dados) {
  // fetch = faz a requisicao pro servidor
  const response = await fetch(`${api_url}/cadastro`, {
    // POST = enviando dados novos
    method: 'POST',
    // avisa que o corpo vai em JSON
    headers: { 'Content-Type': 'application/json' },
    // transforma o objeto em texto JSON
    body: JSON.stringify(dados),
  })

  // le a resposta em JSON (se vier vazia ou quebrada, usa um objeto vazio)
  const data = await response.json().catch(() => ({}))

  // response.ok = status 200 a 299; se nao for, deu erro
  if (!response.ok) {
    // usa a mensagem do back-end ou uma padrao
    const erro = new Error(data.erro || 'Erro ao cadastrar.')
    // guarda o status (ex: 409 e-mail ja existe) pra tela tratar
    erro.status = response.status
    // throw = dispara o erro pra quem chamou (cai no catch de la)
    throw erro
  }

  // deu certo: devolve os dados
  return data
}

// faz login: manda e-mail e senha e recebe o usuario
export async function loginUsuario(dados) {
  // mesma ideia do cadastro, mas na rota /login
  const response = await fetch(`${api_url}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })

  const data = await response.json().catch(() => ({}))

  // senha errada, usuario nao existe etc.
  if (!response.ok) {
    const erro = new Error(data.erro || 'Erro ao entrar.')
    erro.status = response.status
    throw erro
  }

  // deu certo: devolve { id_usuario, nome, email, perfil }
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