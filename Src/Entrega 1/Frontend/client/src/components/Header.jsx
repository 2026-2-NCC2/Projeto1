import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/branding/logos/logo_navbar_web.png'

export default function Header() {
  const { pathname } = useLocation()

  const paginaDeConta = ['/Cadastro', '/Login', '/TelaDeEscolha'].includes(pathname)
  const criandoEvento = pathname.startsWith('/criar-evento')
  const noPainel = pathname === '/PainelDeEventos'
  const areaDoOrganizador = noPainel || criandoEvento

  return (
    <header className="bg-[#0d1b2e] text-white">
      <div className="mx-auto flex min-h-16 max-w-[1200px] items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 text-white no-underline">
          <img src={logo} alt="" className="h-9 w-9 object-contain" />
          <span className="text-lg font-extrabold">
            Troca<span className="text-[#7ED957]">Ticket</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
        {pathname === '/' && (
            <Link
            to="/PainelDeEventos"
            className="mr-175 font-bold text-white/80 hover:text-white"
             >
         Eventos
          </Link>
        )}    
          {paginaDeConta && (
            <Link to="/" className="text-white/80 hover:text-white">
              Voltar ao início
            </Link>
          )}

          {criandoEvento && (
            <Link to="/PainelDeEventos" className="text-white/80 hover:text-white">
              Voltar ao painel
            </Link>
          )}

          {noPainel && (
            <Link to="/" className="text-white/80 hover:text-white">
              Início
            </Link>
          )}

          {areaDoOrganizador && (
            <div className="flex items-center gap-1">
              <span className="font-semibold text-white">Organizador</span>
              <Link to="/" className="text-[#7ED957] hover:text-[#a5ef82]">
                (Sair)
              </Link>
            </div>
          )}

          {!paginaDeConta && !criandoEvento && !noPainel && (
            <>
              <Link to="/Login" className="text-white/80 hover:text-white">
                Entrar
              </Link>
              <Link
                to="/Cadastro"
                className="rounded-lg bg-[#7ED957] px-4 py-2 font-bold text-[#0d1b2e]"
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}