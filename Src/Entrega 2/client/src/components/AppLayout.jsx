import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import './Layout.css'

// layout que envolve todas as paginas do site: navbar, conteudo e rodape
export default function AppLayout() {
  return (
    <div className="layout">
      {/* barra de navegacao que aparece em todas as paginas */}
      <Navbar />
      <main className="layout__main">
        {/* aqui entra a pagina da rota atual (landing, login, cadastro...) */}
        <Outlet />
      </main>
      {/* rodape azul igual em todas as paginas */}
      <footer className="layout__footer">
        <p>© 2026 TrocaTicket · FECAP · Projeto Interdisciplinar 2º Semestre</p>
      </footer>
    </div>
  )
}
