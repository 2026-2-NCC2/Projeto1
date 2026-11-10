import { brl, dataCurta, dataHora } from '../utils/formato'
import Badge from './ui/Badge'
import { IconCalendario, IconLocal } from './ui/Icones'
import { dadoRotuloCls } from './ui/estilos'

// uma compra de ingressos: parte de cima com o evento, picote tracejado e o "canhoto" com o codigo
// compra = { tipo_nome, quantidade, valor_total, codigo, criado_em, evento_titulo, evento_data, evento_endereco }
export default function IngressoCard({ compra }) {
  return (
    <article className="relative overflow-hidden border-[1.5px] border-black border-t-[5px] border-t-gel-fogo bg-folha text-tinta shadow-brutal" aria-label={`Ingressos do evento ${compra.evento_titulo}`}>
      <div className="px-5 pb-4 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="m-0 text-lg font-black leading-tight tracking-[-0.015em]">{compra.evento_titulo}</h3>
            <p className="m-0 mt-1 text-sm font-semibold text-tinta/70">{compra.quantidade} × {compra.tipo_nome}</p>
          </div>
          <Badge label="Válido" variant="ativo" />
        </div>
        <ul className="m-0 mt-3 list-none space-y-1 p-0 text-sm text-tinta/70">
          <li className="flex items-center gap-2"><IconCalendario tamanho={15} /> {dataCurta(compra.evento_data)}</li>
          {compra.evento_endereco && <li className="flex items-center gap-2"><IconLocal tamanho={15} /> <span className="min-w-0 break-words">{compra.evento_endereco}</span></li>}
        </ul>
      </div>
      <div className="border-t-[1.5px] border-dashed border-tinta/40" aria-hidden="true" />
      <div className="flex flex-wrap items-center justify-between gap-3 bg-papel px-5 py-3">
        <div>
          <p className={`${dadoRotuloCls} m-0`}>Código</p>
          <p className="m-0 font-mono text-[15px] font-semibold tracking-[0.12em]">{compra.codigo}</p>
        </div>
        <div className="text-right">
          <p className="tabular m-0 font-bold">{brl(compra.valor_total)}</p>
          <p className="m-0 text-xs text-tinta/60">Comprado em {dataHora(compra.criado_em)}</p>
        </div>
      </div>
    </article>
  )
}
