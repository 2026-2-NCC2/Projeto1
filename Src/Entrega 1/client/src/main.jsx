import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/trocaticket.css'
import LandingPage from './components/LandingPage.jsx'
import Cadastro from './components/ValidacaoEmail.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Cadastro/>
  </StrictMode>,
)
