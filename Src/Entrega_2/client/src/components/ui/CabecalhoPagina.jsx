import { containerCls } from './estilos'

// faixa do topo das paginas internas, direto sobre o palco
// titulo / sub = texto de apoio / acoes = botoes na direita / voltar = link antes do titulo
// gel = classe bg-gel-* das tres faixas de luz finas embaixo (a assinatura da pagina)
export default function CabecalhoPagina({ titulo, sub, acoes, voltar, gels = ['bg-gel-indigo'], children }) {
  return (
    <header className="relative border-b border-white/10 bg-palco-2/55 backdrop-blur-[2px]">
      <div className={`${containerCls} pb-10 pt-10 sm:pb-12 sm:pt-12`}>
        {voltar}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-[clamp(2rem,4.6vw,3.5rem)] font-black leading-[0.95] tracking-[-0.025em] text-white">{titulo}</h1>
            {sub && <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-white/70">{sub}</p>}
          </div>
          {acoes && <div className="flex flex-wrap items-center gap-3">{acoes}</div>}
        </div>
        {children}
      </div>
      {/* tres feixes de luz finos encostados na linha de baixo */}
      <div className={`${containerCls} pointer-events-none absolute inset-x-0 -bottom-px flex gap-1`} aria-hidden="true">
        {gels.map((g) => <span key={g} className={`h-[3px] w-12 ${g}`} />)}
      </div>
    </header>
  )
}
