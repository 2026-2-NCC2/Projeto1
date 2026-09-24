import { createBrowserRouter} from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import ValidacaoEmail from '../pages/ValidacaoEmail'
import NotFound from '../pages/NotFound'
import Cadastro from '../pages/Cadastro'
import Login from '../pages/Login'
import PainelDeEventos from '../pages/PainelDeEventos'
import AprovacaoCadastros from '../pages/adminPages/AprovacaoCadastros'

export const router = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage/>,
    },
    {
        path: "/validation",
        element: <ValidacaoEmail/>,
    },
    {
        path: "*",
        element: <NotFound/>,
    },
    {
        path:"/Cadastro",
        element:<Cadastro/>,
    },
    {
        path: "/Login",
        element: <Login/>,
    },
    {
        path: "/PainelDeEventos",
        element: <PainelDeEventos/>,
    },
    {
        path: "/AprovacaoCadastros",
        element: <AprovacaoCadastros/>,
    },
    {
        path: '/evento',
        element: <EventFlow />,
      },
      {
        path: '/publico-lotes',
        element: <EventFlow />,
      },
      {
        path: '/custos-independentes',
        element: <EventFlow />,
      },
      {
        path: '/itens-custos',
        element: <EventFlow />,
      },
      {
        path: '*',
        element: <Navigate to="/evento" replace />,
      },
])