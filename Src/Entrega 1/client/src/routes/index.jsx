import { createBrowserRouter } from 'react-router-dom'

import AppLayout from '../components/AppLayout'
import LandingPage from '../pages/LandingPage'
import ValidacaoEmail from '../pages/ValidacaoEmail'
import NotFound from '../pages/NotFound'
import Cadastro from '../pages/Cadastro'
import TelaDeEscolha from '../pages/TelaDeEscolha'
import Login from '../pages/Login'
import PainelDeEventos from '../pages/PainelDeEventos'
import AprovacaoCadastros from '../pages/adminPages/AprovacaoCadastros'
import EventRegistration from '../features/eventRegistration/EventRegistration.jsx'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/validation', element: <ValidacaoEmail /> },
      { path: '/Cadastro', element: <Cadastro /> },
      { path: '/TelaDeEscolha', element: <TelaDeEscolha /> },
      { path: '/Login', element: <Login /> },
      { path: '/PainelDeEventos', element: <PainelDeEventos /> },
      { path: '/AprovacaoCadastros', element: <AprovacaoCadastros /> },
      {
        path: '/criar-evento/:etapa?',
        element: <EventRegistration />,
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])