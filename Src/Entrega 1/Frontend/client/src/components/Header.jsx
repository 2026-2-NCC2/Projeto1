import { Link, useLocation, useSearchParams } from 'react-router-dom'
import logo from '../assets/branding/logos/logo_navbar_web.png'

// Abas que aparecem apenas na rota do Painel de Eventos
const PAINEL_TABS = [
  { key: 'painel', label: 'Painel de Eventos' },
  { key: 'meus',   label: 'Meus Eventos'      },
]

export default function Header() {
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const path = pathname.toLowerCase()

  const paginaDeConta     = ['/cadastro', '/login', '/teladeescolha'].includes(path)
  const criandoEvento     = path.startsWith('/criar-evento')
  const noPainel          = path === '/paineldeeventos'
  const areaDoOrganizador = noPainel || criandoEvento

  // Aba ativa — lida do query param; padrão é 'painel'
  const activeTab = searchParams.get('tab') || 'painel'

  function handleTabClick(key) {
    setSearchParams({ tab: key })
  }

  return (
    <header className="bg-[#0d1b2e] text-white">
      <div className="mx-auto flex min-h-16 max-w-[1200px] items-center justify-between px-4 md:px-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white no-underline">
          <img src={logo} alt="" className="h-9 w-9 object-contain" />
          <span className="text-lg font-extrabold">
            Troca<span className="text-[#7ED957]">Ticket</span>
          </span>
        </Link>

        {/* ── Centro: abas no painel, link Eventos na home ── */}
        {noPainel && (
          <nav className="flex gap-1">
            {PAINEL_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabClick(tab.key)}
                className={`border-b-2 px-4 py-[7px] text-[13px] cursor-pointer transition rounded-t-md ${
                  activeTab === tab.key
                    ? 'text-[#4ade80] bg-[#4ade80]/[0.12] border-[#4ade80] font-semibold'
                    : 'text-white/55 border-transparent font-normal hover:text-white/85'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        {/* Altere esta parte do seu código: */}
        {path === '/' && (
          <nav className="flex justify-start gap-1 mr-auto ml-6"> {/* 💡 Adicionado mr-auto ml-6 aqui */}
            <Link to="/PainelDeEventos" className="font-bold text-white/80 hover:text-white">
              Eventos
            </Link>
          </nav>
        )}
        {/* ── Links contextuais (lado direito) ── */}
        <nav className="flex items-center gap-4 text-sm">

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
