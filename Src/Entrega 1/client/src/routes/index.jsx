import { createBrowserRouter} from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import ValidacaoEmail from '../pages/ValidacaoEmail'
import NotFound from '../pages/NotFound'
import Cadastro from '../pages/Cadastro'
import TelaDeEscolha from '../pages/TelaDeEscolha'
import Login from '../pages/Login'
import PainelDeEventos from '../pages/PainelDeEventos'

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
        path: "/TelaDeEscolha",
        element: <TelaDeEscolha/>,
    },
    {
        path: "/Login",
        element: <Login/>,
    },
    {
        path: "/PainelDeEventos",
        element: <PainelDeEventos/>,
    },
])