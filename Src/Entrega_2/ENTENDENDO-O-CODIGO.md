# Entendendo as partes mais difíceis do código

Resumo para o grupo estudar as partes que fogem do básico. Cada item aponta o arquivo, explica o que o código faz e o que acontece se ele for tirado.

---

## 1. Transações (`sql.begin`)

**Onde:** `server/routes/authRoutes.js` (cadastro), `eventoRoutes.js` (criar evento), `propostaRoutes.js` (enviar e responder proposta).

Uma transação junta vários comandos SQL num bloco do tipo "ou faz tudo, ou não faz nada".

```js
await sql.begin(async (sql) => {
    await sql`INSERT INTO usuario ...`
    await sql`INSERT INTO organizador ...` // se este falhar...
})                                         // ...o INSERT em usuario é desfeito (ROLLBACK)
```

- Se a função terminar sem erro, o postgres.js manda `COMMIT`.
- Se der erro em qualquer ponto (inclusive um `throw` nosso), ele manda `ROLLBACK`.

**Sem isso:** um cadastro poderia ficar pela metade, com o usuário criado mas sem a linha em `organizador`.

---

## 2. `SELECT ... FOR UPDATE` (bloqueio de linha)

**Onde:** `server/routes/propostaRoutes.js`, no `POST /` (enviar proposta) e no `PATCH /:id` (aceitar ou recusar).

**O problema:** um item precisa de 5 tendas. Duas propostas de 3 tendas são aceitas **ao mesmo tempo**. As duas consultas veem "faltam 5", as duas passam, e o evento acaba com 6 tendas aceitas.

**A solução:** `FOR UPDATE` trava a linha do evento até a transação terminar. Se outra requisição tentar travar a mesma linha, ela **espera** a primeira acabar e então já enxerga o saldo atualizado.

```sql
SELECT id_evento FROM evento WHERE id_evento = 1 FOR UPDATE
```

**Por que sempre travar o evento primeiro:** se uma rota travasse A e depois B, e outra rota travasse B e depois A, as duas poderiam ficar esperando uma pela outra para sempre (isso se chama *deadlock*). Travando sempre na mesma ordem, isso não acontece.

**Sem isso:** o sistema funciona nos testes manuais, mas pode aceitar mais do que o necessário quando duas pessoas clicam juntas.

---

## 3. Erro `23505` (UNIQUE do banco)

**Onde:** `server/routes/authRoutes.js`.

Antes de cadastrar, o código já confere se o e-mail, o username ou o CNPJ existem. Mesmo assim, duas pessoas podem se cadastrar com o mesmo e-mail no mesmo instante, e as duas passam nessa conferência. Quem barra a segunda é o `UNIQUE` da tabela, que gera o erro de código `23505`. O código transforma esse erro em uma resposta 409 com mensagem amigável.

---

## 4. Testes com banco simulado

**Onde:** `server/tests/*.test.js`. Para rodar: `npm test` dentro de `server`.

Os testes não usam o Supabase. Eles trocam o arquivo `config/db.js` por um **banco de mentira**.

1. **`registerHooks`** (do `node:module`) intercepta os `import`. Quando uma rota pede `../config/db.js`, o Node entrega no lugar dele o banco falso guardado em `globalThis.__testSql`.
2. **O banco falso é uma função** que recebe o SQL do mesmo jeito que o postgres.js (`` sql`SELECT ...` ``), junta o texto com `?` no lugar dos valores e chama `resolverQuery(texto, args)`.
3. **`resolverQuery` devolve respostas prontas** conforme o texto da consulta. Por exemplo, se o texto tem `SELECT i.*`, devolve uma tenda com 5 unidades.
4. **`sql.begin` falso** só conta quantos commits e rollbacks aconteceram, e os testes conferem essa contagem.

**Cuidado:** como o mock reconhece as consultas pelo **texto**, mudar um SELECT nas rotas pode quebrar um teste mesmo que o SQL continue certo. Nesse caso, ajustem o `resolverQuery` junto.

---

## 5. Trava contra clique duplo no frontend

**Onde:** `client/src/components/CustosFornecedor.jsx` (`useRef`) e `client/src/components/FormUI.jsx` (`event.detail`).

- **`useRef` como trava:** o `setSending(true)` só muda a tela no próximo render. Um clique duplo rápido chegaria antes disso e mandaria a proposta duas vezes. O `useRef` muda **na hora** e não causa render, então serve de trava.
- **`event.detail > 1`:** o navegador conta os cliques seguidos. O `detail` vale 2 no segundo clique de um duplo clique, e esse segundo clique é ignorado.

---

## 6. Voltar para a etapa com erro no cadastro

**Onde:** `client/src/pages/Cadastro.jsx` (`ETAPA_DO_CAMPO`).

O servidor valida tudo de novo. Se ele recusar um campo (por exemplo, "CNPJ já cadastrado"), a resposta diz **qual campo** deu erro. O objeto `ETAPA_DO_CAMPO` diz em que etapa do formulário esse campo fica, e a tela volta para lá mostrando a mensagem.

---

## 7. `@scope` no CSS do cadastro de evento

**Onde:** `client/src/components/eventRegistration.css`.

`@scope (.event-registration) { ... }` faz as regras valerem **só dentro** do elemento com essa classe. Assim, nomes genéricos como `.btn` ou `.field` não afetam o resto do site.

---

## 8. Grid responsivo do cabeçalho

**Onde:** `client/src/components/Header.jsx`.

As classes longas existem para o cabeçalho ter **sempre a mesma altura**:
- **Computador:** uma linha só, com 3 colunas (`grid-cols-[1fr_auto_1fr]`): logo, menu e conta.
- **Até 900px (`max-[900px]:`):** duas linhas. A de cima tem o logo e a conta; a de baixo tem o menu, que rola de lado em vez de quebrar linha.

`max-[900px]:` significa "só quando a tela tiver até 900px de largura".

---

## 9. Configuração do banco (`config/db.js`)

- **`prepare: !usandoPooler`:** o pooler do Supabase (porta 6543, usado na Vercel) não aceita *prepared statements*, então eles são desligados quando a URL usa essa porta.
- **`types.bigint`:** o Postgres devolve `COUNT(*)` como texto, para não perder precisão em números gigantes. Como aqui são sempre contagens pequenas, o código converte para `Number`.
- **`max: 1` na Vercel:** cada requisição pode rodar numa instância nova, e poucas conexões por instância evitam estourar o limite do banco.
