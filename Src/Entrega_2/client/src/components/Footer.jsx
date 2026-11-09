import { Link } from 'react-router-dom'
import logo from '../assets/branding/logos/logo_navbar_web_128.png' // versao 128px (a original de 1024px pesa 1,3 MB)
import { containerCls } from './ui/estilos'

// rodape: faixa escura simples, so com a linha fina do topo

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t-2 border-gel-fogo bg-palco-2 text-white">
      <div className={`${containerCls} flex flex-wrap items-end justify-between gap-6 py-10`}>
        <div>
          <Link to="/" aria-label="TrocaTicket, início" className="inline-flex items-center gap-2.5 text-lg font-black tracking-[-0.025em] text-white no-underline">
            <img src={logo} alt="" className="size-8 object-contain" />
            <span>Troca<span className="text-acento">Ticket</span></span>
          </Link>
          <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-white/65">Descubra eventos e encontre experiências para viver e compartilhar.</p>
        </div>
      </div>
      <div className={`${containerCls} flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-5 text-xs text-white/55`}>
        <span>© {new Date().getFullYear()} TrocaTicket. Todos os direitos reservados.</span>
        <span>Uma experiência feita para aproximar pessoas e eventos.</span>
      </div>
    </footer>
  )
}
