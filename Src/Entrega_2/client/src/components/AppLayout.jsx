import { Outlet, ScrollRestoration } from 'react-router-dom'
import Header from './Header'

// layout que envolve todas as paginas do site
export default function AppLayout() {
  return (
    <>
      {/* link escondido que aparece no primeiro Tab: pula o menu e vai direto pro conteudo */}
      <a
        href="#conteudo"
        className="fixed left-4 top-3 z-50 -translate-y-24 border-[1.5px] border-black bg-gel-indigo px-4 py-2 text-sm font-bold text-tinta no-underline transition-transform focus-visible:translate-y-0"
      >
        Pular para o conteúdo
      </a>
      {/* cabecalho que aparece em todas as paginas */}
      <Header />
      {/* ao trocar de pagina volta pro topo (e ao usar "voltar" do navegador, devolve a posicao de antes).
          a chave e so o caminho: trocar de aba (?tab=) na mesma pagina nao faz a tela pular */}
      <ScrollRestoration getKey={(location) => location.pathname} />
      {/* aqui entra a pagina da rota atual (landing, login, cadastro...) */}
      <div id="conteudo" tabIndex={-1} className="outline-none">
        <Outlet />
      </div>
    </>
  )
}
