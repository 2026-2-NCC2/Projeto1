# Fluxo de cadastro de eventos

Execute `npm ci` e `npm run dev`. Abra `/PainelDeEventos` e clique em **Criar Evento**, ou acesse `/criar-evento/evento`.

As quatro telas originais estão em `src/features/eventRegistration/`. As páginas e rotas da implementação preliminar foram removidas. O estado do formulário dura apenas enquanto o fluxo está aberto; concluir exibe uma mensagem visual e não grava dados ou chama uma API.

Arquivos alterados: `src/pages/PainelDeEventos.jsx`, `src/routes/index.jsx` e a nova pasta `src/features/eventRegistration/`. Os demais arquivos do projeto foram mantidos.
