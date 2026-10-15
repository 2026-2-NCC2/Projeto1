import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// le o usuario salvo no localStorage, usado so pra inicializar o estado (sobrevive a um refresh)
function lerUsuarioSalvo() {
  try {
    return JSON.parse(localStorage.getItem('usuario'))
  } catch {
    return null
  }
}

// envolve o app inteiro (ver main.jsx) e guarda o usuario logado em ESTADO do React
// qualquer componente que usar useAuth() re-renderiza automaticamente quando login/logout acontece
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(lerUsuarioSalvo)

  // chamado depois que o POST /api/login retorna com sucesso
  function login(dadosUsuario) {
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario))
    setUsuario(dadosUsuario)
  }

  function logout() {
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  const value = {
    usuario,
    perfil: usuario?.perfil ?? null,
    logado: Boolean(usuario),
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
