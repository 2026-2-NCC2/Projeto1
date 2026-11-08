import { GELS } from './estilos'

// Folha de dados: o "card" do site. Fundo claro, quina arredondada, furo de rebite
// e, se receber uma gelatina, uma faixa colorida no topo.
// gel = nome da gelatina (ver GELS) / faixa = altura da faixa colorida em classes Tailwind
// as = tag usada (section, article, div...) / rebite = mostra o furo no canto
export default function Folha({
  as: Tag = 'section',
  gel,
  faixa = 'h-2',
  rebite = true,
  className = '',
  children,
  ...props
}) {
  return (
    <Tag
      className={`relative overflow-hidden rounded-none border-[1.5px] border-black bg-folha text-tinta shadow-brutal ${gel ? '' : 'border-t-[5px] border-t-gel-fogo'} ${className}`}
      {...props}
    >
      {gel && <div className={`${faixa} ${GELS[gel].bg}`} aria-hidden="true" />}
      {rebite && <span className="rebite right-4 top-4 z-[2]" aria-hidden="true" />}
      {children}
    </Tag>
  )
}

// cabecalho padrao de uma folha: titulo e texto de apoio, com uma linha fina embaixo
export function FolhaCabecalho({ titulo, sub, acoes, nivel: H = 'h2', id }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-tinta/10 px-6 pb-5 pt-6 sm:px-8">
      <div className="min-w-0 pr-8">
        <H id={id} className="text-xl font-extrabold text-tinta sm:text-2xl">{titulo}</H>
        {sub && <p className="mt-1.5 max-w-[60ch] text-sm leading-relaxed text-tinta/65">{sub}</p>}
      </div>
      {acoes}
    </div>
  )
}
