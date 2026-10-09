// Outlet = lugar onde o React Router coloca a pagina da rota atual
import { Outlet } from 'react-router-dom'
// barra de navegacao do topo
import Navbar from './Navbar'
// caminho de pao e o "provedor" que deixa as paginas mandarem um item extra pra ele
import Breadcrumb, { BreadcrumbProvider } from './Breadcrumb'
// botao flutuante "Ver como"
import SeletorDePerfil from './SeletorDePerfil'
// estilos do layout (coluna e rodape)
import './Layout.css'

// layout que envolve todas as paginas do site: navbar, caminho de pao, conteudo e rodape
export default function AppLayout() {
  return (
    // BreadcrumbProvider envolve tudo pra qualquer pagina conseguir falar com o caminho de pao
    <BreadcrumbProvider>
    {/* coluna com navbar, conteudo e rodape */}
    <div className="layout">
      {/* barra de navegacao que aparece em todas as paginas */}
      <Navbar />
      {/* caminho de pao pequeno (Inicio › Eventos › ...), some na pagina inicial */}
      <Breadcrumb />
      {/* conteudo principal da pagina */}
      <main className="layout__main">
        {/* aqui entra a pagina da rota atual (landing, login, cadastro...) */}
        <Outlet />
      </main>
      {/* rodape azul igual em todas as paginas */}
      <footer className="layout__footer">
        <p>© 2026 TrocaTicket · FECAP · Projeto Interdisciplinar 2º Semestre</p>
      </footer>
      {/* botao "Ver como" pra trocar de perfil sem cadastro (modo demonstracao) */}
      <SeletorDePerfil />
    </div>
    </BreadcrumbProvider>
  )
}
