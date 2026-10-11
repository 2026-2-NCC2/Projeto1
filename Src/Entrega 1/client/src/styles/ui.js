// Classes Tailwind compartilhadas entre Cadastro, Login e TelaDeEscolha
// assim as paginas ficam com o mesmo visual e se precisar mudar e so mexer aqui
export const ui = {
  // fundo azul da pagina toda
  page: 'min-h-screen bg-tt-azul-marinho flex flex-col',
  // centraliza o card no meio da tela
  container: 'flex-1 flex items-center justify-center px-4 py-12',
  // card branco onde fica o formulario
  card: 'bg-tt-branco rounded-2xl w-full max-w-[440px] p-5 sm:p-10 shadow-[0_8px_24px_color-mix(in_srgb,var(--tt-azul-marinho)_20%,transparent)]',
  // titulo e subtitulo do card
  title: 'text-2xl font-extrabold text-tt-azul-marinho mt-0 mb-2',
  subtitle: 'text-sm text-tt-grafite/70 mb-6',
  // bloco de cada campo (label + input + erro)
  campo: 'flex flex-col gap-1 mb-4',
  label: 'text-sm font-medium text-tt-azul-marinho text-left',
  // mensagem de erro embaixo do campo
  erro: 'text-xs font-medium text-tt-rosa-principal',
  // area dos botoes, um do lado do outro
  botoes: 'grid grid-cols-2 gap-4 items-center mt-2',
  // botao verde principal, fica cinza quando desativado
  btnPrimary:
    'w-full py-3 bg-tt-laranja-principal text-tt-azul-marinho font-bold text-[15px] rounded-md cursor-pointer transition-colors hover:bg-tt-laranja-vivo disabled:bg-tt-azul-marinho/12 disabled:text-tt-grafite/45 disabled:cursor-not-allowed',
  // botao escuro de voltar
  btnVoltar:
    'block w-full py-3 text-center text-tt-branco font-semibold text-sm bg-tt-azul-marinho rounded-md cursor-pointer transition-colors hover:bg-tt-grafite',
  // texto do rodape do card, o [&_a] estiliza os links que ficam dentro dele
  footerLink: 'text-center mt-5 text-sm text-tt-grafite/70 [&_a]:text-tt-azul-marinho [&_a]:font-semibold [&_a]:underline',
}

// classe dos inputs, a borda fica vermelha se o campo tiver erro
export const inputClass = (erro) =>
  `w-full px-3.5 py-2.5 border-[1.5px] rounded-md text-sm text-tt-azul-marinho bg-tt-branco outline-none transition-colors focus:border-tt-azul-principal ${
    erro ? 'border-tt-rosa-principal' : 'border-tt-azul-marinho/12'
  }`