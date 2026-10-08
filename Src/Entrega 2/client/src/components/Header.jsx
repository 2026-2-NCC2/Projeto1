import { Link, useLocation, useSearchParams } from 'react-router-dom'
import logo from '../assets/branding/logos/logo_navbar_web.png'

const PAINEL_TABS = [
  { key: 'painel', label: 'Painel de Eventos' },
  { key: 'meus', label: 'Meus Eventos' },
]

export default function Header() {
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const path = pathname.toLowerCase()
  const paginaDeConta = ['/cadastro', '/login', '/teladeescolha'].includes(path)
  const criandoEvento = path.startsWith('/criar-evento')
  const noPainel = path === '/paineldeeventos'
  const areaDoOrganizador = noPainel || criandoEvento
  const activeTab = searchParams.get('tab') || 'painel'

  function handleTabClick(key) {
    setSearchParams({ tab: key })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-tt-azul-marinho/11 bg-tt-branco/95 backdrop-blur-[12px]">
      <div className="mx-auto flex min-h-[72px] w-[calc(100%_-_48px)] max-w-[1180px] items-center justify-between gap-6 max-[900px]:w-[calc(100%_-_36px)] max-[900px]:max-w-[700px] max-[900px]:flex-wrap max-[900px]:gap-x-4 max-[900px]:gap-y-0 max-[900px]:py-3 max-[540px]:w-[calc(100%_-_28px)] max-[540px]:gap-x-3 max-[540px]:gap-y-[9px]">
        <Link to="/" className="flex shrink-0 items-center gap-[9px] text-[18px] font-extrabold tracking-[-0.04em] text-tt-azul-marinho no-underline max-[540px]:text-base" aria-label="TrocaTicket, início">
          <img src={logo} alt="" className="size-[34px] object-contain max-[540px]:size-[30px]" />
          <span>Troca<span className="text-tt-azul-principal">Ticket</span></span>
        </Link>

        <nav className="flex flex-1 items-center justify-center gap-[22px] max-[900px]:order-3 max-[900px]:w-full max-[900px]:flex-[1_0_100%] max-[900px]:justify-start max-[900px]:gap-[18px] max-[540px]:flex-wrap max-[540px]:gap-x-4 max-[540px]:gap-y-[6px]" aria-label="Navegação principal">
          <Link
            to="/PainelDeEventos"
            className={`text-[13px] font-semibold no-underline transition-colors hover:text-tt-azul-principal max-[540px]:text-xs ${noPainel ? 'py-[25px] shadow-[inset_0_-2px_var(--tt-laranja-principal)] text-tt-azul-principal max-[900px]:py-2' : 'text-tt-grafite/75'}`}
          >
            Eventos
          </Link>
          {path === '/' && <a className="text-[13px] font-semibold text-tt-grafite/75 no-underline transition-colors hover:text-tt-azul-principal max-[540px]:text-xs" href="#categorias">Categorias</a>}
          {path === '/' && <a className="text-[13px] font-semibold text-tt-grafite/75 no-underline transition-colors hover:text-tt-azul-principal max-[540px]:text-xs" href="#como-funciona">Como funciona</a>}

          {noPainel && (
            <div className="flex gap-1.5 max-[540px]:w-full" aria-label="Abas do painel">
              {PAINEL_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`cursor-pointer rounded-full border px-[11px] py-2 text-xs font-semibold max-[540px]:px-[9px] max-[540px]:py-[7px] ${activeTab === tab.key ? 'border-tt-azul-marinho/12 bg-tt-cinza-claro text-tt-azul-principal' : 'border-transparent bg-transparent text-tt-grafite/75'}`}
                  aria-pressed={activeTab === tab.key}
                  onClick={() => handleTabClick(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </nav>

        <nav className="flex shrink-0 items-center gap-4 max-[900px]:ml-auto max-[540px]:gap-[10px]" aria-label="Conta">
          {paginaDeConta && <Link className="text-[13px] font-semibold text-tt-grafite/75 no-underline hover:text-tt-azul-principal max-[540px]:text-xs" to="/">Voltar ao início</Link>}
          {criandoEvento && <Link className="text-[13px] font-semibold text-tt-grafite/75 no-underline hover:text-tt-azul-principal max-[540px]:text-xs" to="/PainelDeEventos">Voltar ao painel</Link>}
          {noPainel && <Link className="text-[13px] font-semibold text-tt-grafite/75 no-underline hover:text-tt-azul-principal max-[540px]:text-xs" to="/">Início</Link>}
          {areaDoOrganizador && (
            <span className="text-[13px] font-bold text-tt-azul-marinho">
              Organizador
              <Link to="/" className="ml-[7px] text-tt-azul-principal no-underline">(Sair)</Link>
            </span>
          )}
          {!paginaDeConta && !criandoEvento && !noPainel && (
            <>
              <Link className="text-[13px] font-semibold text-tt-grafite/75 no-underline hover:text-tt-azul-principal max-[540px]:text-xs" to="/Login">Entrar</Link>
              <Link to="/Cadastro" className="rounded-full bg-tt-azul-marinho px-[18px] py-[11px] text-[13px] font-semibold text-tt-branco no-underline transition-colors hover:bg-tt-azul-principal max-[540px]:px-3 max-[540px]:py-[9px] max-[540px]:text-xs">Criar conta</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
