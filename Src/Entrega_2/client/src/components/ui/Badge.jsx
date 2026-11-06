// liga cada status/tipo a uma cor (as cores tt-... vem do styles/index.css)
// pra adicionar um novo e so colocar mais um item aqui
const CORES = {
  sucesso: 'bg-tt-verde-claro text-tt-verde-sucesso',
  perigo: 'bg-tt-rosa-claro text-tt-rosa-principal',
  pendente: 'bg-tt-lilas-claro text-tt-roxo-principal',
  primaria: 'bg-tt-lilas-claro text-tt-azul-principal',
  destaque: 'bg-tt-verde-claro text-tt-azul-marinho',
  neutra: 'bg-tt-cinza-claro text-tt-azul-marinho',
};

const VARIANTS = {
  pendente: CORES.pendente,
  aprovado: CORES.sucesso,
  rejeitado: CORES.perigo,
  ativo: CORES.sucesso,
  inativo: CORES.neutra,
  administrador: CORES.primaria,
  organizador: CORES.primaria,
  fornecedor: CORES.destaque,
};

// etiqueta colorida reutilizavel
// label = texto que aparece / variant = qual cor usar
export default function Badge({ label, variant }) {
  // procura a cor pelo variant, se nao achar tenta pelo proprio texto, e se nada der certo fica cinza
  const cor = VARIANTS[variant] || VARIANTS[label?.toLowerCase()] || CORES.neutra;
  // capitalize deixa a primeira letra maiuscula (ex: "pendente" vira "Pendente")
  return <span className={`inline-block border-[1.5px] border-tt-azul-marinho px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${cor}`}>{label}</span>;
}
