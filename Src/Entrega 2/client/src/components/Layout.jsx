// ATENCAO: arquivo antigo que NAO e usado (o layout atual e o AppLayout.jsx).
// ele usa o <Header /> sem importar, entao daria erro se alguem usasse.
// casca da pagina: cabecalho em cima e o conteudo embaixo
// children = o conteudo que vai dentro da casca
export function PageShell({ children }) {
  return (
    <div>
      {/* cabecalho em cima */}
      <Header />
      {/* ocupa a tela toda menos a altura do cabecalho (72px) */}
      <main className="min-h-[calc(100vh-72px)]">{children}</main>
    </div>
  );
}