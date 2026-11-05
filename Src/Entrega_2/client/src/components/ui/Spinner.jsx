// indicador de carregamento, o texto padrao e "Carregando..."
export default function Spinner({ text = 'Carregando...' }) {
  return (
    // role="status" avisa pro leitor de tela que algo ta carregando
    <div className="flex flex-col items-center justify-center gap-3 py-8" role="status" aria-label={text || 'Carregando'}>
      {/* bolinha girando: borda cinza com a parte de cima colorida (animate-spin e do Tailwind) */}
      <div className="size-9 animate-spin rounded-full border-[3px] border-tt-azul-marinho/12 border-t-tt-laranja-principal" />
      {/* texto embaixo, so aparece se tiver algum */}
      {text && <p className="text-sm text-tt-grafite/70">{text}</p>}
    </div>
  );
}
