import { createBrowserRouter } from 'react-router-dom'

// so o essencial entra no pacote inicial: layout, landing (primeira tela), protecao de rota e spinner.
// Todas as outras paginas sao baixadas sob demanda (lazy), na primeira vez que a rota e aberta.
import AppLayout from '../components/AppLayout'
import LandingPage from '../pages/LandingPage'
import ProtectedRoute from '../components/ProtectedRoute'
import Spinner from '../components/ui/Spinner'

// rota publica carregada sob demanda: o router espera o arquivo chegar antes de trocar de tela
const pagina = (importar) => async () => ({ Component: (await importar()).default })

// rota protegida carregada sob demanda: mesma ideia, ja embrulhada no ProtectedRoute
// (a checagem de perfil continua acontecendo antes de mostrar a pagina)
const paginaProtegida = (importar, roles, { chave, ...props } = {}) => async () => {
  const Pagina = (await importar()).default
  // chave: faz o React recriar a tela ao ir de uma rota pra outra que usa o mesmo componente
  return { element: <ProtectedRoute roles={roles}><Pagina key={chave} {...props} /></ProtectedRoute> }
}

// todas as rotas do site
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    // mostrado so no primeiro carregamento, enquanto o arquivo da rota inicial chega
    hydrateFallbackElement: <Spinner text="Carregando..." escuro />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/Cadastro', lazy: pagina(() => import('../pages/Cadastro')) },
      { path: '/Login', lazy: pagina(() => import('../pages/Login')) },
      { path: '/verificar-email', lazy: pagina(() => import('../pages/VerificarEmail')) },
      { path: '/PainelDeEventos', lazy: pagina(() => import('../pages/PainelDeEventos')) },

      // perfil do usuario — qualquer perfil logado
      { path: '/usuario', lazy: paginaProtegida(() => import('../pages/Usuario')) },

      // propostas — fornecedor (enviadas) e organizador (recebidas)
      { path: '/propostas', lazy: paginaProtegida(() => import('../pages/Propostas'), ['fornecedor', 'organizador']) },

      // cliente — compra de ingressos (checkout simulado), ingressos comprados e saldo
      { path: '/checkout', lazy: paginaProtegida(() => import('../pages/Checkout'), ['cliente']) },
      { path: '/ingressos', lazy: paginaProtegida(() => import('../pages/MeusIngressos'), ['cliente']) },
      { path: '/saldo', lazy: paginaProtegida(() => import('../pages/Saldo'), ['cliente']) },
      { path: '/saldo/adicionar', lazy: paginaProtegida(() => import('../pages/AdicionarSaldo'), ['cliente']) },

      // admin — so perfil 'administrador'
      { path: '/AprovarCadastros', lazy: paginaProtegida(() => import('../pages/adminPages/AprovarCadastros'), ['administrador']) },
      { path: '/AdminDashboard', lazy: paginaProtegida(() => import('../pages/adminPages/AdminDashboard.jsx'), ['administrador']) },
      { path: '/admin/usuarios', lazy: paginaProtegida(() => import('../pages/adminPages/ConsultasAdmin.jsx'), ['administrador'], { chave: 'usuarios', usuarios: true }) },
      { path: '/admin/relatorios', lazy: paginaProtegida(() => import('../pages/adminPages/ConsultasAdmin.jsx'), ['administrador'], { chave: 'relatorios' }) },

      // criar evento — so perfil 'organizador'
      { path: '/criar-evento/:etapa?', lazy: paginaProtegida(() => import('../components/EventRegistration.jsx'), ['organizador']) },

      { path: '*', lazy: pagina(() => import('../pages/NotFound')) },
    ],
  },
])
