// etiqueta de status/tipo: uma amostrinha da gelatina + o texto
// cada status tem sempre a mesma gelatina no site inteiro
const COR = {
  verde: 'bg-gel-verde',
  rubi: 'bg-gel-rubi',
  ambar: 'bg-gel-ambar',
  indigo: 'bg-gel-indigo',
  fogo: 'bg-gel-fogo',
  ceu: 'bg-gel-ceu',
  magenta: 'bg-gel-magenta',
  neutra: 'bg-tinta/30',
}

const VARIANTS = {
  pendente: 'ambar',
  aprovado: 'verde',
  rejeitado: 'rubi',
  ativo: 'verde',
  inativo: 'neutra',
  publicado: 'verde',
  rascunho: 'ambar',
  encerrado: 'neutra',
  cancelado: 'rubi',
  enviada: 'ambar',
  aceita: 'verde',
  recusada: 'rubi',
  administrador: 'indigo',
  organizador: 'indigo',
  fornecedor: 'ceu',
  cliente: 'magenta',
}

// label = texto / variant = qual cor (se nao vier, tenta pelo proprio texto) / escuro = versao pra fundo escuro
export default function Badge({ label, variant, escuro = false, className = '' }) {
  // so a primeira letra maiuscula (ex: "aguardando resposta" vira "Aguardando resposta")
  const texto = label ? String(label).charAt(0).toUpperCase() + String(label).slice(1) : label
  const cor = COR[VARIANTS[variant] || VARIANTS[label?.toLowerCase()] || 'neutra']
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-none border-[1.5px] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em] ${
        escuro ? 'border-white/60 bg-palco/70 text-white' : 'border-tinta bg-papel text-tinta'
      } ${className}`}
    >
      <span className={`size-2 rounded-none ${cor}`} aria-hidden="true" />
      {texto}
    </span>
  )
}
