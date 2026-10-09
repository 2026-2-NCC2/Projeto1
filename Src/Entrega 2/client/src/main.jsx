// React e StrictMode (modo que ajuda a achar erros enquanto desenvolve)
import React, { StrictMode } from 'react'
// createRoot = liga o React na pagina html
import { createRoot } from 'react-dom/client'
// RouterProvider = ativa as rotas (cada endereco mostra uma pagina)
import { RouterProvider } from 'react-router-dom'
// lista de rotas do site (fica em routes/index.jsx)
import { router } from './routes'
// estilos globais: cores, fonte e Tailwind
import './styles/index.css'
// animacoes prontas do Animate.css (ex: animate__hinge ao excluir evento)
import 'animate.css'

// ponto de entrada do app: coloca o react dentro da div "root" do index.html
createRoot(document.getElementById('root')).render(
  // StrictMode ajuda a achar problemas durante o desenvolvimento (nao aparece na tela)
  <StrictMode>
    {/* carrega as rotas, cada endereco mostra a pagina certa */}
    <RouterProvider router={router} />
  </StrictMode>,
)