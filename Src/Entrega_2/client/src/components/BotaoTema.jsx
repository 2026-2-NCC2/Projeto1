import { useTema } from '../services/ThemeContext.jsx'
import { IconLua, IconSol } from './ui/Icones'

// botao redondo do cabecalho que alterna entre modo escuro e claro.
// mostra o icone do tema PARA O QUAL vai trocar (no escuro: sol; no claro: lua).
// o title e o aria-label dizem a mesma coisa pra mouse e leitor de tela
export default function BotaoTema() {
  const { claro, alternar } = useTema()
  const rotulo = claro ? 'Mudar para o modo escuro' : 'Mudar para o modo claro'
  return (
    <button
      type="button"
      onClick={alternar}
      title={rotulo}
      aria-label={rotulo}
      className="grid size-9 shrink-0 place-items-center rounded-full border-[1.5px] border-white/30 bg-palco-3 text-white transition duration-150 ease-saida hover:-translate-y-0.5 hover:border-white/60 hover:text-acento-hover active:translate-y-0 active:scale-95"
    >
      {claro ? <IconLua tamanho={17} /> : <IconSol tamanho={17} />}
    </button>
  )
}
