// Classes Tailwind compartilhadas pelo site inteiro (botoes, campos, rotulos).
// Mudou aqui, muda em todas as telas.

// ── Gelatinas ──
// cada gelatina tem codigo, nome e as classes prontas (o Tailwind precisa ver o nome inteiro da classe)
// sobre = cor do texto que tem contraste suficiente em cima da gelatina (todas pastel: texto escuro)
export const GELS = {
  fogo:    { codigo: 'G19', nome: 'Fogo',    bg: 'bg-gel-fogo',    texto: 'text-gel-fogo',    borda: 'border-gel-fogo', sobre: 'text-tinta' },
  rubi:    { codigo: 'G26', nome: 'Rubi',    bg: 'bg-gel-rubi',    texto: 'text-gel-rubi',    borda: 'border-gel-rubi', sobre: 'text-tinta' },
  indigo:  { codigo: 'G59', nome: 'Índigo',  bg: 'bg-gel-indigo',  texto: 'text-gel-indigo',  borda: 'border-gel-indigo', sobre: 'text-tinta' },
  magenta: { codigo: 'G46', nome: 'Magenta', bg: 'bg-gel-magenta', texto: 'text-gel-magenta', borda: 'border-gel-magenta', sobre: 'text-tinta' },
  ambar:   { codigo: 'G12', nome: 'Âmbar',   bg: 'bg-gel-ambar',   texto: 'text-gel-ambar',   borda: 'border-gel-ambar', sobre: 'text-tinta' },
  verde:   { codigo: 'G89', nome: 'Verde',   bg: 'bg-gel-verde',   texto: 'text-gel-verde',   borda: 'border-gel-verde', sobre: 'text-tinta' },
  ceu:     { codigo: 'G72', nome: 'Céu',     bg: 'bg-gel-ceu',     texto: 'text-gel-ceu',     borda: 'border-gel-ceu', sobre: 'text-tinta' },
}

// ordem usada pra dar uma gelatina fixa pra cada evento (o mesmo id sempre cai na mesma cor)
// so roxos e azuis: o laranja fica reservado pras acoes
const ORDEM_EVENTOS = ['indigo', 'ceu', 'magenta']
export function gelDoId(id) {
  const n = Math.abs(Number(id) || 0)
  return ORDEM_EVENTOS[n % ORDEM_EVENTOS.length]
}

// ── Botoes ──
// variante: 'primario' (lavanda) | 'claro' (contorno sobre a folha) | 'escuro' (contorno sobre o palco) | 'perigo'
// tamanho: 'md' | 'sm' | 'lg'
// borda de 1.5px em todos; no hover o botao sobe 2px e ganha uma sombra chapada laranja (o laranja e detalhe, nunca o fundo do botao)
const BTN_BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none border-[1.5px] font-bold no-underline transition duration-150 ease-saida hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--color-gel-fogo)] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:pointer-events-none disabled:opacity-45'
const BTN_VARIANTE = {
  primario: 'border-tinta bg-gel-indigo text-tinta hover:bg-gel-indigo-hover',
  claro: 'border-tinta bg-transparent text-tinta hover:bg-papel',
  escuro: 'border-white/70 bg-transparent text-white hover:border-white hover:bg-white/8',
  perigo: 'border-gel-rubi-forte bg-transparent text-gel-rubi-forte hover:bg-gel-rubi hover:text-tinta',
  tinta: 'border-tinta bg-tinta text-sobre-escuro hover:bg-tinta-hover',
}
const BTN_TAMANHO = {
  sm: 'min-h-9 px-3.5 text-[13px]',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-13 px-7 text-[15px]',
}
export const btn = (variante = 'primario', tamanho = 'md') =>
  `${BTN_BASE} ${BTN_VARIANTE[variante]} ${BTN_TAMANHO[tamanho]}`

// ── Campos ──
// sobre a folha clara (formularios)
export const campoCls = (erro = false) =>
  `w-full min-h-11 rounded-none border-[1.5px] bg-papel px-3.5 py-2.5 text-[15px] text-tinta outline-none transition duration-150 placeholder:text-tinta/45 focus:border-gel-indigo-forte focus:ring-3 focus:ring-gel-indigo/35 disabled:bg-tinta/5 ${
    erro ? 'border-gel-rubi-forte bg-gel-rubi/10' : 'border-tinta/40 hover:border-tinta'
  }`

// sobre o palco escuro (buscas e filtros das paginas internas)
export const campoEscuroCls =
  'w-full min-h-11 rounded-none border-[1.5px] border-white/30 bg-palco-3 px-3.5 py-2.5 text-sm text-white outline-none transition duration-150 placeholder:text-white/45 hover:border-white/60 focus:border-gel-indigo focus:ring-3 focus:ring-gel-indigo/30'

// rotulo de campo e textos de apoio
export const rotuloCls = 'text-[13px] font-semibold text-tinta'
export const dicaCls = 'text-xs leading-snug text-tinta/60'
export const erroCls = 'text-xs font-semibold text-gel-rubi-forte'

// rotulo pequeno de dado (ex: "Lote inicial" em cima do valor)
export const dadoRotuloCls = 'text-[11px] font-semibold uppercase tracking-[0.07em] text-tinta/55'

// link de texto sobre o palco
export const linkEscuroCls =
  'font-semibold text-white underline decoration-gel-fogo decoration-2 underline-offset-4 transition-colors hover:text-acento-hover'
// link de texto sobre a folha
export const linkClaroCls =
  'font-semibold text-tinta underline decoration-gel-fogo decoration-2 underline-offset-4 transition-colors hover:text-gel-indigo-forte'

// botoes da conta no cabecalho (Entrar, Criar conta, Sair) e o chip do perfil sao arredondados
export const pilulaCls = 'rounded-full!'

// largura padrao do conteudo das paginas
export const containerCls = 'mx-auto w-full max-w-[1180px] px-5 sm:px-8'
