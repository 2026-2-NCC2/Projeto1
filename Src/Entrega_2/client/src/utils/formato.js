// formatos usados em varias telas

// formata numero como dinheiro (ex: 890 vira "R$ 890,00")
export const brl = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
