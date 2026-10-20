import { Link } from 'react-router-dom'
import logo from '../assets/branding/logos/logo_navbar_web.png'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-tt-azul-marinho text-tt-branco">
      <span className="tt-blob tt-blob--violeta -right-20 -top-28 size-[360px] opacity-40" aria-hidden="true" />
      <div className="relative z-[1] mx-auto flex w-[calc(100%_-_48px)] max-w-[1180px] items-center justify-between gap-7 py-[44px] pb-8 max-[640px]:w-[calc(100%_-_36px)] max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-4">
        <div>
          <Link to="/" aria-label="TrocaTicket, início" className="inline-flex items-center gap-[9px] font-display text-base font-black text-tt-branco no-underline">
            <img src={logo} alt="" className="size-8 rounded-full bg-tt-branco object-contain" />
            <span>TrocaTicket</span>
          </Link>
          <p className="mt-2 text-xs text-tt-branco/75">Descubra eventos e encontre experiências para viver e compartilhar.</p>
        </div>
      </div>
      <div className="relative z-[1] mx-auto flex min-h-[50px] w-[calc(100%_-_48px)] max-w-[1180px] items-center justify-between gap-7 border-t border-tt-branco/30 text-[10px] text-tt-branco/70 max-[640px]:w-[calc(100%_-_36px)] max-[640px]:flex-col max-[640px]:items-start max-[640px]:justify-center max-[640px]:gap-3 max-[640px]:py-3">
        <span>© {new Date().getFullYear()} TrocaTicket. Todos os direitos reservados.</span>
        <span>Uma experiência feita para aproximar pessoas e eventos.</span>
      </div>
    </footer>
  )
}
