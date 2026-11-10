// formatos usados em varias telas

// formata numero como dinheiro (ex: 890 vira "R$ 890,00")
export const brl = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)

// data e hora no formato brasileiro (ex: "08/11/2026 14:30"); valor vazio ou invalido vira "—"
export const dataHora = (valor) => {
  const data = valor ? new Date(valor) : null
  return data && !Number.isNaN(data.getTime()) ? data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'
}

// "2026-12-20" -> "20/12/2026"
export const dataCurta = (iso) => {
  if (!iso) return '—'
  const [a, m, d] = String(iso).split('-')
  return d ? `${d}/${m}/${a}` : '—'
}
