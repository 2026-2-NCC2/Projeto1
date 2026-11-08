import { GELS } from './estilos'

// linha de etapas continua: uma faixa so, dividida em trechos, que acendem na cor da gelatina
// de cada etapa quando ja foram visitados. Um rebite marca onde o usuario esta agora.
// itens = [{ label, gel }] / atual = indice da etapa atual (comeca do 0)
// maisAvancada = ate onde ja foi (pode voltar pra elas) / onIr(indice) = se vier, as etapas viram botoes
// bloqueado = desativa todos os botoes / escuro = versao sobre o palco
export default function Etapas({ itens, atual, maisAvancada = atual, onIr, bloqueado = false, escuro = false, rotulo = 'Etapas' }) {
  const corTexto = escuro ? 'text-white' : 'text-tinta'
  const trilho = escuro ? 'bg-white/15' : 'bg-tinta/12'
  const furo = escuro ? 'bg-palco ring-gel-fogo' : 'bg-folha ring-gel-fogo'

  return (
    <nav aria-label={rotulo}>
      <ol className="grid" style={{ gridTemplateColumns: `repeat(${itens.length}, minmax(0, 1fr))` }}>
        {itens.map((item, i) => {
          const visitada = i <= maisAvancada
          const ativa = i === atual
          const primeira = i === 0
          const ultima = i === itens.length - 1
          const Tag = onIr ? 'button' : 'div'
          return (
            <li key={item.label} className="min-w-0">
              <Tag
                {...(onIr ? { type: 'button', onClick: () => onIr(i), disabled: bloqueado || !visitada } : {})}
                aria-current={ativa ? 'step' : undefined}
                className={`group flex w-full flex-col gap-3 text-left ${corTexto} disabled:cursor-default`}
              >
                {/* trecho da faixa: sem espaco entre eles, so as pontas sao arredondadas */}
                <span className={`relative block h-2 w-full ${primeira ? 'rounded-none' : ''} ${ultima ? 'rounded-none' : ''} overflow-visible`}>
                  <span className={`absolute inset-0 ${trilho} ${primeira ? 'rounded-none' : ''} ${ultima ? 'rounded-none' : ''}`} />
                  <span
                    className={`absolute inset-0 origin-left transition-transform duration-500 ease-saida ${GELS[item.gel].bg} ${primeira ? 'rounded-none' : ''} ${ultima ? 'rounded-none' : ''} ${visitada ? 'scale-x-100' : 'scale-x-0'}`}
                  />
                  {/* rebite do "agora": fica no comeco do trecho da etapa atual */}
                  {ativa && (
                    <span className={`absolute left-0 top-1/2 z-[1] size-4 -translate-y-1/2 rounded-full ring-[3px] ${furo} ${primeira ? '' : '-translate-x-1/2'}`} aria-hidden="true" />
                  )}
                </span>
                <span className="flex min-w-0 items-baseline gap-2 pr-2">
                  <span className={`font-mono text-[11px] ${ativa ? 'opacity-100' : 'opacity-55'}`}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={`truncate text-[13px] leading-tight max-sm:text-xs ${ativa ? 'font-bold' : 'font-medium opacity-70'} ${onIr && visitada && !ativa && !bloqueado ? 'group-hover:opacity-100' : ''}`}>
                    {item.label}
                  </span>
                </span>
              </Tag>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
