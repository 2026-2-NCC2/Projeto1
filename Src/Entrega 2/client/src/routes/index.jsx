// createBrowserRouter = cria o "mapa" de enderecos do site
import { createBrowserRouter } from 'react-router-dom'

// paginas e componentes usados nas rotas
import AppLayout from '../components/AppLayout'
import LandingPage from '../pages/LandingPage'
import ValidacaoEmail from '../pages/ValidacaoEmail'
import NotFound from '../pages/NotFound'
import Cadastro from '../pages/Cadastro'
import Login from '../pages/Login'
import PainelDeEventos from '../pages/PainelDeEventos'
import AprovarCadastros from '../pages/adminPages/AprovarCadastros'
import EventRegistration from '../components/EventRegistration.jsx'
import AdminDashboard from '../pages/adminPages/AdminDashboard.jsx'
import PainelFornecedor from '../pages/PainelFornecedor.jsx'

// todas as rotas do site
export const router = createBrowserRouter([
  // rota "pai" sem endereco proprio: so serve pra colocar o layout em volta das paginas
  {
    // layout em volta de todas as paginas
    element: <AppLayout />,
    // paginas que aparecem dentro do layout
    children: [
      // cada item liga um endereco a uma pagina
      // pagina inicial
      { path: '/', element: <LandingPage /> },
      // teste de validacao de e-mail
      { path: '/validation', element: <ValidacaoEmail /> },
      // criar conta
      { path: '/Cadastro', element: <Cadastro /> },
      // entrar
      { path: '/Login', element: <Login /> },
      // lista e detalhes dos eventos
      { path: '/PainelDeEventos', element: <PainelDeEventos /> },
      // paginas do admin
      { path: '/AprovarCadastros', element: <AprovarCadastros /> },
      { path: "/AdminDashboard", element: <AdminDashboard/>},
      // pagina do fornecedor (oportunidades de servico)
      { path: '/PainelFornecedor', element: <PainelFornecedor /> },
      // formulario de criar evento, o ? deixa a etapa opcional (ex: /criar-evento ou /criar-evento/evento)
      {
        path: '/criar-evento/:etapa?',
        element: <EventRegistration />,
      },
      // qualquer rota que nao existe cai na pagina 404
      { path: '*', element: <NotFound /> },
    ],
  },
])