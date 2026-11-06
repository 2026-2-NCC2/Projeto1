// coisas usadas em varias telas (propostas, custos do fornecedor, ticket e perfil)

// formata numero como dinheiro (ex: 890 vira "R$ 890,00")
export const brl = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)

// classe padrao dos campos (input, select, textarea)
export const campo =
  'w-full border-[1.5px] border-tt-azul-marinho bg-tt-branco px-3 py-2 text-sm text-tt-azul-marinho outline-none transition-colors focus:border-tt-roxo-vivo'

// classe do botao principal escuro
export const botao =
  'border-[1.5px] border-tt-azul-marinho bg-tt-laranja-principal px-4 py-2.5 text-sm font-bold text-tt-azul-marinho transition-colors hover:bg-tt-laranja-vivo disabled:opacity-50 disabled:cursor-wait'
