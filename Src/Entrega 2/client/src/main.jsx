import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import './styles/index.css'

// ponto de entrada do app: coloca o react dentro da div "root" do index.html
createRoot(document.getElementById('root')).render(
  // StrictMode ajuda a achar problemas durante o desenvolvimento (nao aparece na tela)
  <StrictMode>
    {/* carrega as rotas, cada endereco mostra a pagina certa */}
    <RouterProvider router={router} />
  </StrictMode>,
)