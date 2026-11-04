import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import logo from '../assets/branding/logos/logo_navbar_web.png'
import { useAuth } from '../services/AuthContext.jsx'

// secoes de eventos do organizador (a pagina PainelDeEventos le o ?tab= da url)
const EVENTOS_ORGANIZADOR = [
  { key: 'painel', label: 'Painel de Eventos', to: '/PainelDeEventos?tab=painel' },
  { key: 'meus', label: 'Meus Eventos', to: '/PainelDeEventos?tab=meus' },
]

// ── Estilos compartilhados do cabecalho ──
// Todo link do menu usa o MESMO tamanho/altura (a borda de baixo fica transparente quando o link nao esta ativo),
// assim o cabecalho nao muda de altura nem de alinhamento de uma pagina pra outra.
const LINK_BASE =
  'inline-flex min-h-9 shrink-0 items-center whitespace-nowrap border-b-2 text-[13px] font-semibold no-underline transition-colors hover:text-tt-azul-principal max-[540px]:text-xs'
const LINK_IDLE = 'border-transparent text-tt-grafite/75'
const LINK_ACTIVE = 'border-tt-laranja-principal text-tt-azul-principal'

// link do menu: o estado "ativo" (pagina atual) e sempre o mesmo visual e marca aria-current
function NavItem({ to, active = false, className = '', children }) {
  return (
    <Link
      to={to}
      className={`${LINK_BASE} ${active ? LINK_ACTIVE : LINK_IDLE} ${className}`}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </Link>
  )
}

export default function Header() {
  const navigate = useNavigate()
  const { perfil, logado, logout } = useAuth()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const path = pathname.toLowerCase()
  const paginaDeConta = ['/cadastro', '/login', '/teladeescolha'].includes(path)
  const criandoEvento = path.startsWith('/criar-evento')
  const noPainel = path === '/paineldeeventos'
  const activeTab = searchParams.get('tab') || 'painel'
  // aceita os dois valores: 'administrador' vem do enum do banco (login real),
  // 'admin' é o usado pelo modo demonstração (services/perfil.js)
  const isAdmin = ['administrador', 'admin'].includes(perfil)
  const naAreaAdmin = path === '/admindashboard' || path === '/aprovarcadastros'

  // link contextual de "voltar" (so um deles aparece por pagina)
  const voltar = paginaDeConta
    ? { to: '/', label: 'Voltar ao início' }
    : criandoEvento
      ? { to: '/PainelDeEventos', label: 'Voltar ao painel' }
      : noPainel || naAreaAdmin
        ? { to: '/', label: 'Início' }
        : null

  return (
    <header className="sticky top-0 z-20 border-b-[1.5px] border-tt-azul-marinho bg-tt-branco/95 backdrop-blur-[12px]">
      {/* desktop: uma linha de 72px. ate 900px: linha 1 (logo + conta) de 56px e linha 2 (menu) de 40px, sempre,
          o menu rola na horizontal em vez de quebrar linha, entao a altura nao depende da pagina */}
      <div className="mx-auto flex min-h-[72px] w-[calc(100%_-_48px)] max-w-[1180px] items-center gap-6 min-[901px]:grid min-[901px]:grid-cols-[1fr_auto_1fr] max-[900px]:min-h-0 max-[900px]:w-[calc(100%_-_36px)] max-[900px]:max-w-[700px] max-[900px]:flex-wrap max-[900px]:gap-x-4 max-[900px]:gap-y-0 max-[540px]:w-[calc(100%_-_28px)] max-[540px]:gap-x-3">
        <Link to="/" className="flex shrink-0 items-center gap-[9px] font-display text-[18px] font-black tracking-[-0.04em] text-tt-azul-marinho no-underline max-[900px]:min-h-14 max-[540px]:text-base" aria-label="TrocaTicket, início">
          <img src={logo} alt="" className="size-[34px] object-contain max-[540px]:size-[30px]" />
          <span>Troca<span className="text-tt-roxo-vivo">Ticket</span></span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-center gap-[22px] max-[900px]:order-3 max-[900px]:justify-start max-[900px]:min-h-10 max-[900px]:w-full max-[900px]:flex-[1_0_100%] max-[900px]:gap-[18px] max-[900px]:overflow-x-auto max-[900px]:[scrollbar-width:none] max-[540px]:gap-4" aria-label="Navegação principal">
          {/* organizador tem duas secoes de eventos, sempre visiveis em qualquer pagina; os demais perfis tem um "Eventos" so */}
          {perfil === 'organizador' ? (
            EVENTOS_ORGANIZADOR.map((item) => (
              <NavItem key={item.key} to={item.to} active={noPainel && activeTab === item.key}>{item.label}</NavItem>
            ))
          ) : (
            <NavItem to="/PainelDeEventos" active={noPainel}>Eventos</NavItem>
          )}

          {['fornecedor', 'organizador'].includes(perfil) && (
            <NavItem to="/propostas" active={path === '/propostas'}>
              {perfil === 'fornecedor' ? 'Propostas enviadas' : 'Propostas recebidas'}
            </NavItem>
          )}

          {/* Links exclusivos do administrador — antes só eram acessíveis digitando a URL */}
          {isAdmin && (
            <>
              <NavItem to="/AdminDashboard" active={path === '/admindashboard'}>Painel</NavItem>
              <NavItem to="/AprovarCadastros" active={path === '/aprovarcadastros'}>Aprovações</NavItem>
            </>
          )}

          {path === '/' && <a className={`${LINK_BASE} ${LINK_IDLE}`} href="#categorias">Categorias</a>}
          {path === '/' && <a className={`${LINK_BASE} ${LINK_IDLE}`} href="#como-funciona">Como funciona</a>}

          {/* no celular o "voltar" vai pra segunda linha, pra linha da conta nunca quebrar.
              Os que levam pra "/" ficam so no desktop: no celular o logo ja faz isso */}
          {voltar && voltar.to !== '/' && <NavItem to={voltar.to} className="min-[901px]:hidden">{voltar.label}</NavItem>}
        </nav>

        <nav className="flex shrink-0 items-center gap-4 min-[901px]:justify-self-end max-[900px]:order-2 max-[900px]:ml-auto max-[900px]:min-h-14 max-[540px]:gap-[10px]" aria-label="Conta">
          {voltar && <NavItem to={voltar.to} className="max-[900px]:hidden">{voltar.label}</NavItem>}

          {logado ? (
            <span className="whitespace-nowrap text-[13px] font-bold text-tt-azul-marinho capitalize">
              <Link to="/usuario" className="text-tt-azul-marinho no-underline hover:text-tt-roxo-vivo" aria-label="Meu perfil">{perfil}</Link>
              <button
                type="button"
                onClick={() => { logout(); navigate('/') }}
                className="ml-[7px] cursor-pointer text-tt-roxo-vivo no-underline font-semibold hover:underline"
              > (Sair)</button>
            </span>
          ) : (
            !paginaDeConta && !criandoEvento && !noPainel && (
              <>
                <NavItem to="/Login">Entrar</NavItem>
                <Link to="/Cadastro" className="whitespace-nowrap rounded-full bg-tt-azul-marinho px-[18px] py-[11px] text-[13px] font-semibold text-tt-branco no-underline transition-colors hover:bg-tt-roxo-vivo max-[540px]:px-3 max-[540px]:py-[9px] max-[540px]:text-xs">Criar conta</Link>
              </>
            )
          )}
        </nav>
      </div>
    </header>
  )
}
