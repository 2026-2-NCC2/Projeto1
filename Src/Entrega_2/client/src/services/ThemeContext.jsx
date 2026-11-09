import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// Tema do site: 'dark' (padrao, o visual original) ou 'light'.
// A escolha vale pro site inteiro: ela vira o atributo data-theme no <html> (e o CSS troca as cores por variaveis)
// e fica salva no localStorage, entao sobrevive a refresh e a navegacao entre rotas.
// O script no <head> do index.html aplica o tema salvo ANTES do primeiro desenho da tela (sem flash).
const CHAVE = 'tt-tema'
const COR_BARRA = { dark: '#111017', light: '#f1eee8' } // meta theme-color (barra do navegador no celular)

const ThemeContext = createContext(null)

function lerTemaSalvo() {
  try {
    return localStorage.getItem(CHAVE) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark' // localStorage bloqueado (aba privada etc): usa o padrao
  }
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(lerTemaSalvo)

  // aplica o tema no <html> sempre que ele muda
  useEffect(() => {
    document.documentElement.dataset.theme = tema
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COR_BARRA[tema])
  }, [tema])

  // se o tema for trocado em outra aba, esta aba acompanha
  useEffect(() => {
    function aoMudarStorage(e) {
      if (e.key === CHAVE) setTema(e.newValue === 'light' ? 'light' : 'dark')
    }
    window.addEventListener('storage', aoMudarStorage)
    return () => window.removeEventListener('storage', aoMudarStorage)
  }, [])

  const alternar = useCallback(() => {
    setTema((atual) => {
      const novo = atual === 'dark' ? 'light' : 'dark'
      try { localStorage.setItem(CHAVE, novo) } catch { /* sem storage: vale so ate recarregar */ }
      return novo
    })
  }, [])

  const value = useMemo(() => ({ tema, claro: tema === 'light', alternar }), [tema, alternar])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTema() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTema precisa ser usado dentro de um <ThemeProvider>')
  return context
}
