import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// le o usuario salvo no localStorage, usado so pra inicializar o estado (sobrevive a um refresh)
function lerSessaoSalva() {
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    const token = localStorage.getItem('token')
    if (!usuario || !token) return { usuario: null, token: null }
    return { usuario, token }
  } catch {
    return { usuario: null, token: null }
  }
}

// envolve o app inteiro (ver main.jsx) e guarda o usuario logado em ESTADO do React
// qualquer componente que usar useAuth() re-renderiza automaticamente quando login/logout acontece
export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(lerSessaoSalva)

  // chamado depois que o POST /api/login retorna com sucesso
    function login({ usuario, token }) {

    localStorage.setItem('usuario', JSON.stringify(usuario))
    localStorage.setItem('token', token)
    setSessao({ usuario, token })
  }

  function logout() {
    localStorage.removeItem('usuario')
    localStorage.removeItem('token')
    setSessao({ usuario: null, token: null })
  }

  const value = {
    usuario: sessao.usuario,
    token: sessao.token,
    perfil: sessao.usuario?.perfil ?? null,
    logado: Boolean(sessao.usuario && sessao.token),
    login,
    logout,
  } 

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// hook pra consumir o contexto em qualquer componente (ex: const { perfil, logout } = useAuth())
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa ser usado dentro de um <AuthProvider>')
  return context
}