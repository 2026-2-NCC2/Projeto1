// Classes Tailwind compartilhadas entre Cadastro, Login e TelaDeEscolha
export const ui = {
  page: 'min-h-screen bg-navy flex flex-col',
  container: 'flex-1 flex items-center justify-center px-4 py-12',
  card: 'bg-white rounded-2xl w-full max-w-[440px] p-5 sm:p-10 shadow-[0_8px_24px_rgba(0,0,0,0.2)]',
  title: 'text-2xl font-extrabold text-navy mt-0 mb-2',
  subtitle: 'text-sm text-muted mb-6',
  campo: 'flex flex-col gap-1 mb-4',
  label: 'text-sm font-medium text-navy text-left',
  erro: 'text-xs font-medium text-red-600',
  botoes: 'grid grid-cols-2 gap-4 items-center mt-2',
  btnPrimary:
    'w-full py-3 bg-verde text-navy font-bold text-[15px] rounded-md cursor-pointer transition-colors hover:bg-verde-hover disabled:bg-borda disabled:text-[#A0AEC0] disabled:cursor-not-allowed',
  btnVoltar:
    'block w-full py-3 text-center text-white font-semibold text-sm bg-[#001029] rounded-md cursor-pointer transition-colors hover:bg-black',
  footerLink: 'text-center mt-5 text-sm text-muted [&_a]:text-navy [&_a]:font-semibold [&_a]:underline',
}

export const inputClass = (erro) =>
  `w-full px-3.5 py-2.5 border-[1.5px] rounded-md text-sm text-navy bg-white outline-none transition-colors focus:border-navy ${
    erro ? 'border-red-600' : 'border-borda'
  }`
