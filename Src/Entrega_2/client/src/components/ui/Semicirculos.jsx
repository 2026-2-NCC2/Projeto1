// semicirculos decorativos presos nas bordas da pagina (herdados do visual original do site).
// o pai precisa ser "relative" e ter overflow-x-clip. So enfeite: aria-hidden e sem clique.
// posicoes = lista de { lado: 'esq' | 'dir', topo: classe top-*, cor: classe bg-*, tamanho: 'p' | 'm' | 'g' }
const TAMANHO = {
  p: 'h-11 w-[22px]',
  m: 'h-14 w-7',
  g: 'h-24 w-12',
}

const PADRAO = [
  { lado: 'esq', topo: 'top-[420px]', cor: 'bg-gel-fogo', tamanho: 'm' },
  { lado: 'dir', topo: 'top-[720px]', cor: 'bg-gel-indigo', tamanho: 'p' },
]

export default function Semicirculos({ posicoes = PADRAO }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden max-[760px]:hidden" aria-hidden="true">
      {posicoes.map((s, i) => (
        <span
          key={i}
          className={`absolute ${s.topo} ${TAMANHO[s.tamanho || 'm']} ${s.cor} ${
            s.lado === 'esq' ? 'left-0 rounded-r-full' : 'right-0 rounded-l-full'
          }`}
        />
      ))}
    </div>
  )
}
