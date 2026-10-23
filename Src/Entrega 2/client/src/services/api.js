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

export async function deletarUsuario(id){
  const response = await authFetch(`/deleteUsers/${id}`, { method: 'DELETE' })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const erro = new Error(data.erro || 'Erro ao deletar.')
    erro.status = response.status
    throw erro
  }
  return data
}
/*
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
*/

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
 let usuario
 try { usuario=JSON.parse(localStorage.getItem('usuario')) } catch { usuario=null }
 const response=await fetch(`${api_url}${path}`, {...options,headers:{'Content-Type':'application/json',...(usuario?.token?{Authorization:`Bearer ${usuario.token}`}:{})}})
 const data=await response.json().catch(()=>({}))
 if(!response.ok)throw new Error(data.erro || 'Não foi possível acessar o servidor.')
 return data
}
