
## Preparar o banco

Use MySQL 8. Antes de alterar um banco existente, faça uma cópia dele.

- **Banco existente:** selecione `trocaticket` e execute **uma vez** `server/migrations/001_propostas.sql`. Ela adiciona o valor unitário dos itens e as tabelas de sessões e solicitações. Não execute `banco.sql` sobre o banco existente.
- **Instalação nova:** execute `server/banco.sql`, que já contém as tabelas novas. Não execute a migração novamente. Opcionalmente, execute `server/seed.sql` para criar as contas de teste já presentes no projeto.
- Copie `server/.env.example` para `server/.env` e configure as credenciais locais.

## Iniciar

Recomendado: Node.js 24 LTS.

Na pasta `server`:

```bash
npm ci
npm run dev
```

Na pasta `client`, em outro terminal:

```bash
npm ci
npm run dev
```

A API continua em `http://localhost:3000/api`. Entre novamente em cada conta: o login agora gera uma sessão; o login antigo salvo no navegador não possui o token necessário para as ações protegidas.

## Percorrer o fluxo

1. Entre como organizador, abra o painel e escolha **Criar Evento**. Complete as etapas e adicione itens de custo na etapa 4. Ao finalizar, o evento e seus itens são gravados em uma transação e o evento é publicado.
2. Entre como fornecedor. No painel, escolha **Ver custos e enviar proposta**. Apenas o fornecedor recebe a lista de itens pela API.
3. Selecione um ou mais itens. Informe o produto/serviço, quantidade, valor unitário e uma mensagem de até 1.000 caracteres. O total é calculado a partir das linhas.
4. Envie a proposta e acompanhe-a em **Propostas enviadas**, no menu superior.
5. Entre com o organizador **dono do evento** e abra **Propostas recebidas**. Confira produtos, valores e mensagem e clique em **Aceitar proposta** ou **Recusar proposta**.
6. Volte à conta do fornecedor e recarregue a tela para ver a resposta. A listagem também tem filtro por status. A resposta é definitiva neste fluxo; uma proposta respondida não pode ser sobrescrita.

O fornecedor pode oferecer uma quantidade parcial até o limite solicitado para cada item. Os valores devem ser positivos e ter até duas casas decimais. Os custos independentes (taxas/licenças) continuam sendo salvos, mas não são itens de fornecimento. Itens antigos terão valor estimado unitário zero após a migração, pois a tabela original não guardava esse valor.

## Permissões e persistência

A API valida o token de sessão e consulta o perfil real no banco. IDs e perfis enviados pelo navegador não autorizam ações. Somente fornecedores podem ler os itens de eventos publicados e enviar propostas. Fornecedores veem suas próprias propostas; organizadores veem as propostas dos seus próprios eventos e somente eles podem respondê-las. Clientes e administradores não acessam esse fluxo. Criar, editar e excluir eventos exige o perfil de organizador, e edição/exclusão verificam a propriedade.

O painel agora lê eventos reais da API. Os exemplos antigos em memória foram removidos. Não há propostas simuladas nem troca artificial de perfis. Os produtos ofertados ficam nas tabelas `solicitacao_fornecimento` e `produto_solicitacao`; a tabela antiga `proposta` foi preservada para compatibilidade com os dados existentes.

## Validação realizada

- Build de produção do frontend concluído.
- ESLint sem erros nos componentes novos e nas páginas de painel, itens e cadastro alteradas.
- Cinco testes HTTP com banco simulado passaram: acesso aos custos, isolamento por perfil, validação de propostas, transação de envio e resposta exclusiva do dono sem sobrescrita.
- Não foi possível executar uma integração com MySQL real neste ambiente. Execute o percurso acima após importar o SQL na sua instalação.

Para executar os testes HTTP (Node.js 24), dentro de `server`:

```bash
npm test
```

Esses testes usam um banco simulado e não precisam das credenciais de MySQL.
