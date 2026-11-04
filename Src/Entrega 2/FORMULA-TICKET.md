# Cálculo do ticket (RF13) — fórmula, premissas e arredondamento

O enunciado exige que fórmulas, hipóteses e critérios de arredondamento estejam documentados. Este arquivo é essa documentação. Todo o cálculo está em `server/services/ticket.js` (o front só exibe o resultado de `GET /api/eventos/:id/ticket`).

## Fórmula

```
Custo total  = Custo fixo + (Custo variável por participante × Público)
Ticket-alvo  = Custo total / [ Público × (1 − Margem) ]
Ticket de equilíbrio = Custo total / Público          (é o ticket-alvo com margem 0)
```

- **Margem** = margem de lucro sobre a **receita** (a sugerida no enunciado, seção 5.1). Vai de 0% a 99,99%. Com 20%, de cada R$ 100 arrecadados R$ 20 são lucro.
- **Público**: calculado em dois cenários, **público mínimo** e **público máximo** do evento (RF13). Se o público mínimo não foi informado, o cenário mínimo aparece como indisponível (não há divisão por zero).

## De onde vêm os custos (consolidação — RF07 e RF12)

| Componente | Origem | Entra como |
|---|---|---|
| Itens de custo | tabela `itemcusto` | Fixo |
| Itens com proposta **aceita** | `produto_solicitacao` + `solicitacao_fornecimento` (status `aceita`) | A quantidade coberta custa o **preço da proposta**; o restante da quantidade pedida continua na **estimativa** do organizador |
| Custos independentes (Fiscal, Operacional, Licença, Taxa, Serviço, Outro) | `custoindependente` | Fixo |
| Custos independentes do tipo **Variável** | `custoindependente` | **Valor por participante** (multiplicado pelo público) |

Propostas ainda não respondidas ou recusadas **não** entram no custo.

## Arredondamento

- Resultado arredondado **para cima** no centavo (`arredondarParaCima`, em `server/services/ticket.js`). Arredondar para baixo faria o evento fechar no prejuízo.
- Margem guardada com 2 casas decimais (coluna `evento.margem_lucro_percentual`).

## Exemplo

Custo fixo R$ 10.000, custo variável R$ 5 por pessoa, margem 20%, público 1.000:

```
Custo total = 10.000 + 5 × 1.000 = 15.000
Equilíbrio  = 15.000 / 1.000            = R$ 15,00
Ticket-alvo = 15.000 / (1.000 × 0,80)   = R$ 18,75
```

## Premissas assumidas (o grupo pode trocar)

Estas três decisões ainda não tinham sido fechadas pelo grupo; adotei as do enunciado/usuais:

1. Margem sobre a **receita** (não sobre o custo). Para margem sobre o custo seria `Ticket = Custo total × (1 + Margem) / Público`.
2. Custo **variável** = valor **por participante**.
3. Arredondamento **para cima** no centavo.

Para mudar qualquer uma, basta alterar `calcularTicket` / `consolidarCustos` em `server/services/ticket.js` e os testes em `server/tests/ticket.test.js`.

## Como usar

- **Margem**: campo "Margem de lucro (%)" na etapa "Público e lotes" ao criar o evento; depois, pode ser ajustada no detalhe do evento (`PATCH /api/eventos/:id/margem`).
- **Custo variável**: na etapa "Custos independentes", escolha o tipo **Variável** e informe o valor **por participante**.
- **Ticket**: detalhe do evento no painel do organizador (só o dono do evento; o administrador também pode consultar pela API).
- O "Lote inicial" mostrado nos cards continua sendo o preço de venda digitado pelo organizador. O ticket calculado é outra informação e **não sobrescreve** o lote.
