# Fluxo de cadastro de eventos

Abra `/PainelDeEventos` e clique em **Criar Evento**, ou acesse `/criar-evento/evento` (rota só para o perfil organizador).

O formulário tem 4 etapas (`evento`, `publico-lotes`, `custos-independentes`, `itens-custos`), implementadas em `src/components/EventRegistration.jsx` e nas telas de `src/pages/` (`EventBasics`, `AudienceLots`, `IndependentCosts`, `CostItems`). Os dados ficam em memória enquanto o fluxo está aberto; na etapa 4 abre-se uma revisão e, ao confirmar, o frontend envia o evento para `POST /api/eventos`, que grava o evento e seus itens em uma única transação.
