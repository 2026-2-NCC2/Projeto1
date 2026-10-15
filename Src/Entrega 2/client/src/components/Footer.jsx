import { Link } from 'react-router-dom'
import logo from '../assets/branding/logos/logo_navbar_web.png'

export default function Footer() {
  return (
    <footer className="border-t border-tt-azul-marinho/12 bg-tt-branco">
      <div className="mx-auto flex w-[calc(100%_-_48px)] max-w-[1180px] items-center justify-between gap-7 py-[30px] pb-6 max-[640px]:w-[calc(100%_-_36px)] max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-4">
        <div>
          <Link to="/" aria-label="TrocaTicket, início" className="inline-flex items-center gap-[9px] text-base font-extrabold text-tt-azul-marinho no-underline">
            <img src={logo} alt="" className="size-8 object-contain" />
            <span>TrocaTicket</span>
          </Link>
          <p className="mt-2 text-xs text-tt-grafite/75">Descubra eventos e encontre experiências para viver e compartilhar.</p>
        </div>
        <nav className="flex flex-wrap gap-[22px] max-[640px]:gap-4" aria-label="Navegação do rodapé">
          <Link to="/PainelDeEventos" className="text-xs font-semibold text-tt-grafite/75 no-underline transition-colors hover:text-tt-azul-principal">Eventos</Link>
          <Link to="/Login" className="text-xs font-semibold text-tt-grafite/75 no-underline transition-colors hover:text-tt-azul-principal">Entrar</Link>
          <Link to="/Cadastro" className="text-xs font-semibold text-tt-grafite/75 no-underline transition-colors hover:text-tt-azul-principal">Criar conta</Link>
        </nav>
      </div>
      <div className="mx-auto flex min-h-[50px] w-[calc(100%_-_48px)] max-w-[1180px] items-center justify-between gap-7 border-t border-tt-azul-marinho/12 text-[10px] text-tt-grafite/60 max-[640px]:w-[calc(100%_-_36px)] max-[640px]:flex-col max-[640px]:items-start max-[640px]:justify-center max-[640px]:gap-3 max-[640px]:py-3">
        <span>© {new Date().getFullYear()} TrocaTicket. Todos os direitos reservados.</span>
        <span>Uma experiência feita para aproximar pessoas e eventos.</span>
      </div>
    </footer>
  )
}
