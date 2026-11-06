import { Link } from 'react-router-dom'

// pagina de erro 404, aparece quando a rota nao existe (rota "*" em routes/index.jsx)
function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center gap-4 px-4 text-center tt-canvas">
      <p className="tt-display text-[clamp(64px,12vw,120px)]">404</p>
      <h1 className="font-display text-2xl font-black">Página não encontrada</h1>
      <p className="max-w-sm text-sm text-tt-branco/75">O endereço que você acessou não existe ou foi alterado.</p>
      <Link
        to="/"
        className="border-[1.5px] border-tt-branco bg-tt-laranja-principal px-5 py-2.5 text-sm font-bold text-tt-azul-marinho no-underline transition-colors hover:bg-tt-laranja-vivo"
      >
        Voltar ao início
      </Link>
    </main>
  )
}

export default NotFound
