// coisas usadas em varias telas (propostas, custos do fornecedor, ticket e perfil)

// formata numero como dinheiro (ex: 890 vira "R$ 890,00")
export const brl = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)

// classe padrao dos campos (input, select, textarea)
export const campo =
  'w-full rounded-xl border border-tt-azul-marinho/20 bg-tt-branco px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tt-laranja-principal'

// classe do botao principal escuro
export const botao =
  'rounded-xl bg-tt-azul-marinho px-4 py-2.5 text-sm font-bold text-tt-branco hover:bg-tt-azul-principal disabled:opacity-50 disabled:cursor-wait'
