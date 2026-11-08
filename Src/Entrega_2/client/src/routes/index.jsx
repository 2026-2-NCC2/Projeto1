import { createBrowserRouter } from 'react-router-dom'

// paginas e componentes usados nas rotas
import AppLayout from '../components/AppLayout'
import LandingPage from '../pages/LandingPage'
import NotFound from '../pages/NotFound'
import Cadastro from '../pages/Cadastro'
import Login from '../pages/Login'
import PainelDeEventos from '../pages/PainelDeEventos'
import AprovarCadastros from '../pages/adminPages/AprovarCadastros'
import EventRegistration from '../components/EventRegistration.jsx'
import AdminDashboard from '../pages/adminPages/AdminDashboard.jsx'
import ConsultasAdmin from '../pages/adminPages/ConsultasAdmin.jsx'
import ProtectedRoute from '../components/ProtectedRoute'
import Propostas from '../pages/Propostas'
import Usuario from '../pages/Usuario'

// todas as rotas do site
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/Cadastro', element: <Cadastro /> },
      { path: '/Login', element: <Login /> },
      { path: '/PainelDeEventos', element: <PainelDeEventos /> },

      // perfil do usuario — qualquer perfil logado
      { path: '/usuario', element: <ProtectedRoute><Usuario /></ProtectedRoute> },

      // propostas — fornecedor (enviadas) e organizador (recebidas)
      { path: '/propostas', element: <ProtectedRoute roles={['fornecedor', 'organizador']}><Propostas /></ProtectedRoute> },
      
      // admin — so perfil 'administrador'
      { path: '/AprovarCadastros', element: <ProtectedRoute roles={['administrador']}><AprovarCadastros /></ProtectedRoute> },
      { path: '/AdminDashboard', element: <ProtectedRoute roles={['administrador']}><AdminDashboard /></ProtectedRoute> },
      { path: '/admin/usuarios', element: <ProtectedRoute roles={['administrador']}><ConsultasAdmin key="usuarios" usuarios /></ProtectedRoute> },
      { path: '/admin/relatorios', element: <ProtectedRoute roles={['administrador']}><ConsultasAdmin key="relatorios" /></ProtectedRoute> },

      // criar evento — so perfil 'organizador'
      {
        path: '/criar-evento/:etapa?',
        element: <ProtectedRoute roles={['organizador']}><EventRegistration /></ProtectedRoute>,
      },


      { path: '*', element: <NotFound /> },
    ],
  },
])
