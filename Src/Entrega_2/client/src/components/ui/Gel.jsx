import { GELS } from './estilos'

// amostra pequena de gelatina: quadradinho translucido + codigo (ex: G19)
// usada pra identificar categoria, perfil ou evento com a mesma cor em todo lugar
export default function Gel({ cor = 'indigo', mostrarCodigo = true, className = '' }) {
  const gel = GELS[cor]
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`size-3 shrink-0 rounded-none ${gel.bg}`} aria-hidden="true" />
      {mostrarCodigo && <span className="font-mono text-[11px] tracking-[0.04em] opacity-70">{gel.codigo}</span>}
    </span>
  )
}
