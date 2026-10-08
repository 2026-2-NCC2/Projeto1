// Classes Tailwind compartilhadas entre Cadastro, Login e TelaDeEscolha
// assim as paginas ficam com o mesmo visual e se precisar mudar e so mexer aqui
export const ui = {
  // fundo cinza claro da pagina toda (igual a pagina inicial)
  page: 'min-h-screen bg-tt-cinza-claro flex flex-col',
  // centraliza o card no meio da tela
  container: 'flex-1 flex items-center justify-center px-4 py-12',
  // card branco onde fica o formulario
  card: 'bg-tt-branco rounded-[20px] border border-tt-azul-marinho/12 w-full max-w-[440px] p-5 sm:p-10 shadow-[0_12px_28px_color-mix(in_srgb,var(--tt-azul-marinho)_8%,transparent)]',
  // titulo e subtitulo do card
  title: 'text-[28px] font-extrabold tracking-[-0.04em] text-tt-azul-marinho mt-0 mb-2',
  subtitle: 'text-sm text-tt-grafite/75 mb-6',
  // bloco de cada campo (label + input + erro)
  campo: 'flex flex-col gap-1 mb-4',
  label: 'text-sm font-medium text-tt-azul-marinho text-left',
  // mensagem de erro embaixo do campo
  erro: 'text-xs font-medium text-tt-rosa-principal',
  // area dos botoes, um do lado do outro
  botoes: 'grid grid-cols-2 gap-4 items-center mt-2',
  // botao principal em pilula azul marinho (igual ao "Explorar" da pagina inicial), fica cinza quando desativado
  btnPrimary:
    'w-full py-3 bg-tt-azul-marinho text-tt-branco font-bold text-sm rounded-full cursor-pointer transition hover:-translate-y-px hover:bg-tt-azul-principal disabled:bg-tt-azul-marinho/12 disabled:text-tt-grafite/45 disabled:cursor-not-allowed',
  // botao claro de voltar, so com borda
  btnVoltar:
    'block w-full py-3 text-center text-tt-azul-marinho font-bold text-sm bg-tt-branco border border-tt-azul-marinho/12 rounded-full cursor-pointer no-underline transition-colors hover:border-tt-azul-principal hover:text-tt-azul-principal',
  // texto do rodape do card, o [&_a] estiliza os links que ficam dentro dele
  footerLink: 'text-center mt-5 text-sm text-tt-grafite/75 [&_a]:text-tt-azul-principal [&_a]:font-bold [&_a]:no-underline',
}

// classe dos inputs, a borda fica vermelha se o campo tiver erro
export const inputClass = (erro) =>
  `w-full px-3.5 py-2.5 border-[1.5px] rounded-xl text-sm text-tt-azul-marinho bg-tt-branco outline-none transition-colors focus:border-tt-azul-principal ${
    erro ? 'border-tt-rosa-principal' : 'border-tt-azul-marinho/12'
  }`