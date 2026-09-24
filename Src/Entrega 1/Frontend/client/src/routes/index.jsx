import { createBrowserRouter } from 'react-router-dom'

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

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/validation', element: <ValidacaoEmail /> },
      { path: '/Cadastro', element: <Cadastro /> },
      { path: '/Login', element: <Login /> },
      { path: '/PainelDeEventos', element: <PainelDeEventos /> },
      { path: '/AprovarCadastros', element: <AprovarCadastros /> },
      { path: "/AdminDashboard", element: <AdminDashboard/>},
      {
        path: '/criar-evento/:etapa?',
        element: <EventRegistration />,
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])