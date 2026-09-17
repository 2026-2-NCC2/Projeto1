import { createBrowserRouter} from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import ValidacaoEmail from '../pages/ValidacaoEmail'
import NotFound from '../pages/NotFound'

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
])