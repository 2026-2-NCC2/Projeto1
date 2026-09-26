import { Outlet } from 'react-router-dom'
import Header from './Header'

// layout que envolve todas as paginas do site
export default function AppLayout() {
  return (
    <>
      {/* cabecalho que aparece em todas as paginas */}
      <Header />
      {/* aqui entra a pagina da rota atual (landing, login, cadastro...) */}
      <Outlet />
    </>
  )
}