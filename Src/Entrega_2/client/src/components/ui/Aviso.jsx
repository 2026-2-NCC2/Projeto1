import { IconAlerta, IconCheck, IconInfo } from './Icones'

// caixa de mensagem: erro, sucesso, info ou atencao
// erro usa role="alert" (leitor de tela le na hora), os outros role="status"
// a cor fica no fundo translucido e no icone; o texto continua escuro (ou claro, no palco) pra ler bem
const TIPOS = {
  erro: { fundo: 'border-gel-rubi-forte/35 bg-gel-rubi/20', icone: 'text-gel-rubi-forte', Icone: IconAlerta, role: 'alert' },
  sucesso: { fundo: 'border-gel-verde-forte/35 bg-gel-verde/20', icone: 'text-gel-verde-forte', Icone: IconCheck, role: 'status' },
  info: { fundo: 'border-gel-indigo-forte/30 bg-gel-indigo/18', icone: 'text-gel-indigo-forte', Icone: IconInfo, role: 'status' },
  atencao: { fundo: 'border-gel-ambar/70 bg-gel-ambar/15', icone: 'text-tinta', Icone: IconAlerta, role: 'status' },
}

// no palco escuro os icones usam a versao pastel (a forte some); no claro os tokens trocam pra versao forte
const ICONE_ESCURO = { erro: 'text-acento-rubi', sucesso: 'text-acento-verde', info: 'text-acento', atencao: 'text-acento-ambar' }

// escuro = versao pra usar direto sobre o palco
export default function Aviso({ tipo = 'info', escuro = false, className = '', children }) {
  const t = TIPOS[tipo]
  return (
    <div
      role={t.role}
      className={`flex items-start gap-3 rounded-none border px-4 py-3 text-sm leading-relaxed ${t.fundo} ${escuro ? 'text-white/90' : 'text-tinta'} ${className}`}
    >
      <span className={`mt-0.5 shrink-0 ${escuro ? ICONE_ESCURO[tipo] : t.icone}`}><t.Icone /></span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
