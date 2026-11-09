# Modelagem do Banco de Dados – TrocaTicket

Banco de dados em **PostgreSQL**, schema `public`. Todas as tabelas têm **Row Level Security (RLS)** habilitado.

## Anexos

![Diagrama do Banco de Dados](/Imagens/Imagens/BancodeDados1.jpeg)
![Diagrama do Banco de Dados](/Imagens/Imagens/BancodeDados2.jpeg)
![Diagrama do Banco de Dados](/Imagens/Imagens/BancodeDados3.jpeg)

## Tipos ENUM

- **tipo_perfil**: `cliente`, `organizador`, `fornecedor`, `administrador`.
- **tipo_status_aprovacao**: `pendente`, `aprovado`, `rejeitado`.
- **tipo_status_publicacao**: `rascunho`, `publicado`, `encerrado`, `cancelado`.
- **tipo_nivel_permissao**: `suporte`, `gestor`, `master`.
- **tipo_status_proposta**: `enviada`, `em_analise`, `selecionada`, `recusada`.
- **tipo_status_solicitacao**: `enviada`, `aceita`, `recusada`.

## Tabelas e Atributos

**usuario**
Armazena os dados de acesso e o perfil de todos os usuários do sistema.
- **id_usuario** (PK, INT, IDENTITY): Identificador único.
- **nome** (VARCHAR(150)): Nome completo.
- **idade** (INT): Idade do usuário.
- **username** (VARCHAR(50), UNIQUE): Nome de usuário para login.
- **email** (VARCHAR(150), UNIQUE): E-mail do usuário.
- **senha** (VARCHAR(255)): Senha (hash).
- **perfil** (ENUM tipo_perfil): Tipo de perfil (cliente, organizador, fornecedor ou administrador).
- **data_criacao** (TIMESTAMPTZ): Data de criação da conta (padrão: agora).

---

**organizador**
Especialização de **usuario** para quem cria e gerencia eventos.
- **id_organizador** (PK, FK → usuario.id_usuario, INT): Identificador do organizador. `ON DELETE CASCADE`.
- **nome_organizacao** (VARCHAR(150)): Nome da organização.
- **cnpj** (CHAR(14), UNIQUE): CNPJ da organização, sem pontuação.
- **status_aprovacao** (ENUM tipo_status_aprovacao): Situação do cadastro (padrão: `pendente`).

---

**fornecedor**
Especialização de **usuario** para quem oferece produtos ou serviços para os eventos.
- **id_fornecedor** (PK, FK → usuario.id_usuario, INT): Identificador do fornecedor. `ON DELETE CASCADE`.
- **nome_organizacao** (VARCHAR(150)): Nome da empresa.
- **cnpj** (CHAR(14), UNIQUE): CNPJ da empresa, sem pontuação.
- **area_atuacao** (VARCHAR(80)): Área de atuação (ex: buffet, som, decoração).
- **status_aprovacao** (ENUM tipo_status_aprovacao): Situação do cadastro (padrão: `pendente`).

---

**administrador**
Especialização de **usuario** para quem administra a plataforma.
- **id_administrador** (PK, FK → usuario.id_usuario, INT): Identificador do administrador. `ON DELETE CASCADE`.
- **nivel_permissao** (ENUM tipo_nivel_permissao): Nível de permissão na plataforma (padrão: `suporte`).

---

**evento**
Eventos criados pelos organizadores.
- **id_evento** (PK, INT, IDENTITY): Identificador do evento.
- **id_organizador_fk** (FK → organizador.id_organizador): Organizador responsável. `ON DELETE CASCADE`.
- **titulo_evento** (VARCHAR(150)): Título do evento.
- **data_evento** (DATE): Data do evento.
- **data_inicio** (TIMESTAMPTZ): Data e hora de início.
- **data_fim** (TIMESTAMPTZ): Data e hora de término (`CHECK data_fim >= data_inicio`).
- **endereco** (VARCHAR(200)): Local do evento.
- **publico_minimo** (INT): Público mínimo esperado.
- **publico_maximo** (INT): Público máximo esperado.
- **qtd_lote_minimo** (NUMERIC(10,2)): Quantidade mínima do lote.
- **qtd_lote_maximo** (NUMERIC(10,2)): Quantidade máxima do lote.
- **status_publicacao** (ENUM tipo_status_publicacao): Situação do evento (padrão: `rascunho`).
- **margem_lucro_percentual** (DECIMAL(5,2)): Margem de lucro desejada, em % (padrão: 0).
- **ticket_estimado** (DECIMAL(10,2)): Valor estimado do ingresso.
- **created_at** (TIMESTAMPTZ): Data de cadastro do evento.

---

**itemcusto**
Itens que o evento precisa contratar e que podem receber propostas de fornecedores.
- **id_item_custo** (PK, INT, IDENTITY): Identificador do item.
- **id_evento_fk** (FK → evento.id_evento): Evento ao qual o item pertence. `ON DELETE CASCADE`.
- **categoria** (VARCHAR(80)): Categoria do item (ex: alimentação, estrutura).
- **descricao_detalhada** (VARCHAR(255)): Descrição do que é necessário.
- **quantidade** (INT): Quantidade necessária (padrão: 1).
- **valor_unitario** (DECIMAL(12,2)): Valor unitário estimado (padrão: 0).

---

**custoindependente**
Custos do evento que não dependem de fornecedores (ex: taxas, aluguel).
- **id_custo_independente** (PK, INT, IDENTITY): Identificador do custo.
- **id_evento_fk** (FK → evento.id_evento): Evento ao qual o custo pertence. `ON DELETE CASCADE`.
- **tipo_custo** (VARCHAR(80)): Tipo do custo.
- **descricao** (VARCHAR(255)): Descrição do custo.
- **valor** (DECIMAL(12,2)): Valor do custo.

---

**proposta**
Propostas enviadas pelos fornecedores para os itens de custo de um evento.
- **id_proposta** (PK, INT, IDENTITY): Identificador da proposta.
- **id_fornecedor_fk** (FK → fornecedor.id_fornecedor): Fornecedor que enviou a proposta. `ON DELETE CASCADE`.
- **id_item_custo_fk** (FK → itemcusto.id_item_custo): Item de custo da proposta. `ON DELETE CASCADE`.
- **valor_oferecido** (DECIMAL(12,2)): Valor oferecido.
- **descricao_proposta** (TEXT): Detalhes da proposta.
- **data_validade** (DATE): Validade da proposta.
- **observacoes** (TEXT): Observações adicionais.
- **status_proposta** (ENUM tipo_status_proposta): Situação da proposta (padrão: `enviada`).
- **data_envio** (TIMESTAMPTZ): Data de envio.
- Restrição `UNIQUE (id_fornecedor_fk, id_item_custo_fk)`: um fornecedor envia no máximo uma proposta por item.

---

**solicitacao_fornecimento**
Solicitações feitas a um fornecedor para atender um evento.
- **id** (PK, INT, IDENTITY): Identificador da solicitação.
- **id_evento_fk** (FK → evento.id_evento): Evento da solicitação. `ON DELETE CASCADE`.
- **id_fornecedor_fk** (FK → fornecedor.id_fornecedor): Fornecedor solicitado. `ON DELETE CASCADE`.
- **mensagem** (VARCHAR(1000)): Mensagem enviada ao fornecedor.
- **status** (ENUM tipo_status_solicitacao): Situação da solicitação (padrão: `enviada`).
- **criada_em** (TIMESTAMPTZ): Data de criação.
- **respondida_em** (TIMESTAMPTZ, opcional): Data da resposta do fornecedor.

---

**produto_solicitacao**
Produtos incluídos em uma solicitação de fornecimento, ligados a um item de custo.
- **id** (PK, INT, IDENTITY): Identificador do registro.
- **id_solicitacao_fk** (FK → solicitacao_fornecimento.id): Solicitação à qual o produto pertence. `ON DELETE CASCADE`.
- **id_item_custo_fk** (FK → itemcusto.id_item_custo): Item de custo relacionado. `ON DELETE CASCADE`.
- **produto** (VARCHAR(255)): Nome do produto.
- **quantidade** (INT): Quantidade solicitada.
- **valor_unitario** (DECIMAL(12,2)): Valor unitário.

---

## Relacionamentos Principais

- **usuario (1) → (1) administrador / organizador / fornecedor**
Cada perfil especializado é um usuário do sistema.

- **organizador (1) → (N) evento**
Um organizador pode criar vários eventos.

- **evento (1) → (N) itemcusto**
Um evento pode ter vários itens de custo.

- **evento (1) → (N) custoindependente**
Um evento pode ter vários custos independentes.

- **itemcusto (1) → (N) proposta**
Um item de custo pode receber várias propostas.

- **fornecedor (1) → (N) proposta**
Um fornecedor pode enviar várias propostas (no máximo uma por item de custo).

- **evento (1) → (N) solicitacao_fornecimento**
Um evento pode ter várias solicitações de fornecimento.

- **fornecedor (1) → (N) solicitacao_fornecimento**
Um fornecedor pode receber várias solicitações.

- **solicitacao_fornecimento (1) → (N) produto_solicitacao**
Uma solicitação pode conter vários produtos.

- **itemcusto (1) → (N) produto_solicitacao**
Um item de custo pode estar vinculado a vários produtos de solicitações.

## Índices

Como o PostgreSQL não cria índice automático para chaves estrangeiras, foram criados índices para acelerar JOINs e `DELETE ... CASCADE`:

- `idx_usuario_email` → usuario(email)
- `idx_evento_data` → evento(data_evento)
- `idx_proposta_status` → proposta(status_proposta)
- `idx_evento_organizador` → evento(id_organizador_fk)
- `idx_itemcusto_evento` → itemcusto(id_evento_fk)
- `idx_custoindependente_evento` → custoindependente(id_evento_fk)
- `idx_proposta_itemcusto` → proposta(id_item_custo_fk)
- `idx_solicitacao_evento` → solicitacao_fornecimento(id_evento_fk)
- `idx_solicitacao_fornecedor` → solicitacao_fornecimento(id_fornecedor_fk)
- `idx_produto_solicitacao` → produto_solicitacao(id_solicitacao_fk)
- `idx_produto_itemcusto` → produto_solicitacao(id_item_custo_fk)
