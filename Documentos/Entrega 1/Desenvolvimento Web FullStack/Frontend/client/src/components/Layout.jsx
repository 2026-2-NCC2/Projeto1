// casca da pagina: cabecalho em cima e o conteudo embaixo
export function PageShell({ children }) {
  return (
    <div>
      <Header />
      {/* ocupa a tela toda menos a altura do cabecalho (72px) */}
      <main className="min-h-[calc(100vh-72px)]">{children}</main>
    </div>
  );
}