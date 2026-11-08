import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import logo from '../assets/branding/logos/logo_navbar_web_128.png' // versao 128px (a original de 1024px pesa 1,3 MB)
import { useAuth } from '../services/AuthContext.jsx'
import { rolarAteSecao } from '../utils/rolagem'
import { btn, pilulaCls } from './ui/estilos'

// secoes de eventos do organizador (a pagina PainelDeEventos le o ?tab= da url)
const EVENTOS_ORGANIZADOR = [
  { key: 'painel', label: 'Painel de Eventos', to: '/PainelDeEventos?tab=painel' },
  { key: 'meus', label: 'Meus Eventos', to: '/PainelDeEventos?tab=meus' },
]

// ── Estilos do menu ──
// todo link tem a mesma altura; o ativo ganha um feixe laranja embaixo (detalhe) (sem mudar o tamanho do cabecalho)
const LINK_BASE =
  'relative inline-flex h-10 shrink-0 items-center whitespace-nowrap text-[13px] font-semibold no-underline transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-none after:transition-colors max-[540px]:text-xs'
const LINK_IDLE = 'text-white/65 hover:text-white after:bg-transparent'
const LINK_ACTIVE = 'text-white after:bg-gel-fogo'

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
  const { perfil, usuario, logado, logout } = useAuth()
  // nome que aparece no chip do perfil: o username; sessoes antigas (sem username salvo) usam o comeco do e-mail
  const username = usuario?.username || usuario?.email?.split('@')[0] || usuario?.nome || perfil
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const path = pathname.toLowerCase()
  const paginaDeConta = path === '/cadastro' || path === '/login'
  const criandoEvento = path.startsWith('/criar-evento')
  const noPainel = path === '/paineldeeventos'
  const activeTab = searchParams.get('tab') || 'painel'
  const isAdmin = perfil === 'administrador' // valor do enum tipo_perfil do banco

  // link contextual de "voltar" (so um deles aparece por pagina)
  const voltar = paginaDeConta
    ? { to: '/', label: 'Voltar ao início' }
    : criandoEvento
      ? { to: '/PainelDeEventos', label: 'Voltar ao painel' }
      : path !== '/'
        ? { to: '/', label: 'Início' } // em toda tela interna, menos na propria home
        : null

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-palco/90 text-white backdrop-blur-md">
      {/* desktop: uma linha de 68px em 3 colunas (logo, menu, conta).
          ate 900px: linha 1 (logo + conta) e linha 2 (menu, que rola de lado em vez de quebrar) */}
      <div className="mx-auto grid w-full max-w-[1180px] grid-cols-[1fr_auto_1fr] items-center gap-6 px-5 sm:px-8 max-[900px]:grid-cols-[1fr_auto] max-[900px]:gap-x-4 max-[900px]:gap-y-0">
        <Link to="/" className="flex h-[68px] shrink-0 items-center gap-2.5 text-[19px] font-black tracking-[-0.025em] text-white no-underline max-[900px]:h-14 max-[540px]:text-base" aria-label="TrocaTicket, início">
          <img src={logo} alt="" className="size-8 object-contain max-[540px]:size-7" />
          <span>Troca<span className="text-gel-indigo">Ticket</span></span>
        </Link>

        <nav
          className="flex min-w-0 items-center justify-center gap-6 max-[900px]:col-span-2 max-[900px]:row-start-2 max-[900px]:-mx-5 max-[900px]:justify-start max-[900px]:gap-5 max-[900px]:overflow-x-auto max-[900px]:border-t max-[900px]:border-white/8 max-[900px]:px-5 max-[900px]:[scrollbar-width:none] sm:max-[900px]:-mx-8 sm:max-[900px]:px-8"
          aria-label="Navegação principal"
        >
          {/* organizador tem duas secoes de eventos; os demais perfis tem um "Eventos" so */}
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

          {isAdmin && (
            <>
              <NavItem to="/AdminDashboard" active={path === '/admindashboard'}>Painel</NavItem>
              <NavItem to="/AprovarCadastros" active={path === '/aprovarcadastros'}>Aprovações</NavItem>
            </>
          )}

          {path === '/' && <a className={`${LINK_BASE} ${LINK_IDLE} select-none`} href="#categorias" onClick={rolarAteSecao}>Categorias</a>}
          {path === '/' && <a className={`${LINK_BASE} ${LINK_IDLE} select-none`} href="#como-funciona" onClick={rolarAteSecao}>Como funciona</a>}

          {/* no celular o "voltar" vai pra linha do menu; os que levam pra "/" ficam so no desktop (o logo ja faz isso) */}
          {voltar && voltar.to !== '/' && <NavItem to={voltar.to} className="min-[901px]:hidden">{voltar.label}</NavItem>}
        </nav>

        <nav className="flex shrink-0 items-center justify-end gap-3 max-[540px]:gap-2" aria-label="Conta">
          {voltar && <NavItem to={voltar.to} className="mr-2 max-[900px]:hidden">{voltar.label}</NavItem>}

          {logado ? (
            <>
              <Link
                to="/usuario"
                className="inline-flex h-9 items-center gap-2 rounded-full border-[1.5px] border-white/30 bg-palco-3 pl-1 pr-3.5 text-[13px] font-semibold text-white no-underline transition-colors hover:border-white/40"
                aria-label="Meu perfil"
              >
                <span className="grid size-7 place-items-center rounded-full bg-gel-indigo text-xs font-black uppercase text-tinta" aria-hidden="true">{username?.[0]}</span>
                <span className="max-w-[14ch] truncate">@{username}</span>
              </Link>
              <button type="button" onClick={() => { logout(); navigate('/') }} className={`${btn('escuro', 'sm')} ${pilulaCls}`}>
                Sair
              </button>
            </>
          ) : (
            !paginaDeConta && !criandoEvento && !noPainel && (
              <>
                <Link to="/Login" className={`${btn('escuro', 'sm')} ${pilulaCls} max-[540px]:px-3`}>Entrar</Link>
                <Link to="/Cadastro" className={`${btn('primario', 'sm')} ${pilulaCls} max-[540px]:px-3`}>Criar conta</Link>
              </>
            )
          )}
        </nav>
      </div>
    </header>
  )
}
