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
import ProtectedRoute from '../components/ProtectedRoute'
import Propostas from '../pages/Propostas'

// todas as rotas do site
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/validation', element: <ValidacaoEmail /> },
      { path: '/Cadastro', element: <Cadastro /> },
      { path: '/Login', element: <Login /> },
      { path: '/PainelDeEventos', element: <PainelDeEventos /> },

      // propostas — fornecedor (enviadas) e organizador (recebidas)
      { path: '/propostas', element: <ProtectedRoute roles={['fornecedor', 'organizador']}><Propostas /></ProtectedRoute> },
      
      // admin — so perfil 'administrador'
      { path: '/AprovarCadastros', element: <ProtectedRoute roles={['administrador']}><AprovarCadastros /></ProtectedRoute> },
      { path: '/AdminDashboard', element: <ProtectedRoute roles={['administrador']}><AdminDashboard /></ProtectedRoute> },

      // criar evento — so perfil 'organizador'
      {
        path: '/criar-evento/:etapa?',
        element: <ProtectedRoute roles={['organizador']}><EventRegistration /></ProtectedRoute>,
      },


      { path: '*', element: <NotFound /> },
    ],
  },
])