## Preparar o banco

O projeto usa **PostgreSQL (Supabase)**. Antes de alterar um banco que já tem dados, faça uma cópia dele.

- **Banco novo (vazio):** execute `server/database/bancoPG.sql`. Opcionalmente, depois execute `server/database/seed.sql` para criar contas de teste (a senha delas está no começo do arquivo).
- **Recomeçar do zero em desenvolvimento:** execute `reset.sql` (apaga TUDO), depois `bancoPG.sql` e, se quiser, `seed.sql`.
- **Banco que já existe:** não rode o `bancoPG.sql` inteiro (ele cria os tipos e as tabelas de novo e dá erro). Para ganhar os índices de desempenho, rode só as linhas `CREATE INDEX IF NOT EXISTS ...` da seção 4: elas não apagam nem alteram dados.
- `server/database/banco.sql` é a versão antiga em MySQL e não é mais usada.
- Copie `server/.env.example` para `server/.env` e preencha `DATABASE_URL` e `JWT_SECRET`.

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

A API roda em `http://localhost:3000/api`. Para outro endereço (por exemplo, em produção), crie `client/.env` com `VITE_API_URL=https://seu-backend/api`. No servidor, a porta pode ser trocada com a variável `PORT`.

## Percorrer o fluxo

1. Entre como organizador, abra o painel e escolha **Criar Evento**. Complete as etapas e adicione itens de custo na etapa 4. Ao finalizar, o evento e seus itens são gravados em uma transação e o evento é publicado.
2. Entre como fornecedor. No painel, escolha **Ver custos e enviar proposta**. Apenas o fornecedor recebe a lista de itens pela API.
3. Selecione um ou mais itens. Informe o produto/serviço, quantidade, valor unitário e uma mensagem de até 1.000 caracteres. O total é calculado a partir das linhas.
4. Envie a proposta e acompanhe-a em **Propostas enviadas**, no menu superior.
5. Entre com o organizador **dono do evento** e abra **Propostas recebidas**. Confira produtos, valores e mensagem e clique em **Aceitar proposta** ou **Recusar proposta**.
6. Volte à conta do fornecedor e recarregue a tela para ver a resposta. A resposta é definitiva neste fluxo; uma proposta respondida não pode ser sobrescrita.

O fornecedor pode oferecer uma quantidade parcial até o limite solicitado para cada item. Os valores devem ser positivos e ter até duas casas decimais. Os custos independentes (taxas/licenças) são salvos, mas não são itens de fornecimento.

## Permissões e persistência

O login devolve um token JWT (válido por 2 dias) que o navegador envia no cabeçalho `Authorization`. A API valida o token e consulta o perfil real no banco: IDs e perfis enviados pelo navegador não autorizam ações. Fornecedores veem as próprias propostas; organizadores veem as propostas dos seus eventos e somente eles podem respondê-las. Clientes e administradores não acessam esse fluxo. Criar, editar e excluir eventos exige o perfil de organizador, e edição/exclusão verificam a propriedade do evento.

Os produtos ofertados ficam nas tabelas `solicitacao_fornecimento` e `produto_solicitacao`. A tabela `proposta` (modelo anterior) continua no banco por compatibilidade.

## Testes

Dentro de `server` (Node.js 24):

```bash
npm test
```

Os testes usam um banco simulado e não precisam de credenciais. Cobrem autenticação e cadastro, fórmula do ticket, validações e o fluxo de eventos e propostas.

Dentro de `client`:

```bash
npx eslint .
npm run build
```
