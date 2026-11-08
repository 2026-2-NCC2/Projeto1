import { Link } from 'react-router-dom'
import { btn } from '../components/ui/estilos'
import Semicirculos from '../components/ui/Semicirculos'

// pagina de erro 404, aparece quando a rota nao existe (rota "*" em routes/index.jsx)
// tres gelatinas apagadas: a luz que deveria estar aqui nao acendeu
function NotFound() {
  return (
    <main className="relative flex min-h-[calc(100svh-68px)] flex-col items-center justify-center gap-5 overflow-x-clip fundo-luz px-4 py-16 text-center text-white">
      <Semicirculos posicoes={[{ lado: 'esq', topo: 'top-[30%]', cor: 'bg-gel-fogo', tamanho: 'g' }, { lado: 'dir', topo: 'top-[62%]', cor: 'bg-gel-indigo', tamanho: 'm' }]} />
      <div className="flex items-end gap-2" aria-hidden="true">
        <span className="h-20 w-8 rounded-none bg-gel-indigo/30" />
        <span className="h-28 w-8 rounded-none bg-gel-magenta/30" />
        <span className="h-16 w-8 rounded-none bg-gel-ceu/30" />
      </div>
      <p className="tabular text-[clamp(4.5rem,14vw,8rem)] font-black leading-none tracking-[-0.025em]">404</p>
      <h1 className="text-2xl font-black">Página não encontrada</h1>
      <p className="max-w-sm text-[15px] text-white/65">O endereço que você acessou não existe ou foi alterado.</p>
      <Link to="/" className={`${btn('primario', 'lg')} mt-2`}>
        Voltar ao início
      </Link>
    </main>
  )
}

export default NotFound
