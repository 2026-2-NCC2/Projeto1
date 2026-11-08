import Footer from '../Footer'
import Sticker from '../Sticker'
import Semicirculos from './Semicirculos'

// moldura das telas de conta (login e cadastro): palco escuro, a folha no meio e dois adesivos em tela larga
// largura = classe max-w da folha / adesivos = [{ nome, ... }] posicionados em volta da folha
export default function CenaConta({ largura = 'max-w-[460px]', adesivos = [], children }) {
  return (
    <div className="relative flex min-h-[calc(100svh-68px)] flex-col overflow-x-clip fundo-luz">
      <Semicirculos posicoes={[{ lado: 'esq', topo: 'top-[32%]', cor: 'bg-gel-fogo', tamanho: 'm' }, { lado: 'dir', topo: 'top-[70%]', cor: 'bg-gel-indigo', tamanho: 'p' }]} />
      <div className="relative z-[1] flex flex-1 items-center justify-center px-4 py-14 sm:py-20">
        {/* o relative prende os adesivos na folha */}
        <div className={`relative w-full ${largura}`}>
          {children}
          {adesivos.map((a) => (
            <Sticker key={a.nome + a.className} {...a} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
