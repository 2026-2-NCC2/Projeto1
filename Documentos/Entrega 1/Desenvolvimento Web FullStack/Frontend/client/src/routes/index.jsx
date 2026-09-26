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

// todas as rotas do site
export const router = createBrowserRouter([
  {
    // layout em volta de todas as paginas
    element: <AppLayout />,
    children: [
      // cada item liga um endereco a uma pagina
      { path: '/', element: <LandingPage /> },
      { path: '/validation', element: <ValidacaoEmail /> },
      { path: '/Cadastro', element: <Cadastro /> },
      { path: '/Login', element: <Login /> },
      { path: '/PainelDeEventos', element: <PainelDeEventos /> },
      // paginas do admin
      { path: '/AprovarCadastros', element: <AprovarCadastros /> },
      { path: "/AdminDashboard", element: <AdminDashboard/>},
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