# Modelagem do Banco de Dados – TrocaTicket

## Diagrama

![Diagrama do Banco de Dados](/Imagens/Diagrama.png)

## Tabelas e Atributos

**usuario**
Armazena os dados de acesso e o perfil de todos os usuários do sistema.
- **id_usuario** (PK, INT): Identificador único.
- **nome** (VARCHAR(150)): Nome completo.
- **idade** (INT): Idade do usuário.
- **username** (VARCHAR(50)): Nome de usuário para login.
- **email** (VARCHAR(150)): E-mail do usuário.
- **senha** (VARCHAR(255)): Senha (hash).
- **perfil** (ENUM): Tipo de perfil (administrador, organizador ou fornecedor).
- **data_criacao** (TIMESTAMP): Data de criação da conta.

---

**administrador**
Especialização de **usuario** para quem administra a plataforma.
- **id_administrador** (PK, FK → usuario.id_usuario, INT): Identificador do administrador.
- **nivel_permissao** (ENUM): Nível de permissão na plataforma.

---

**organizador**
Especialização de **usuario** para quem cria e gerencia eventos.
- **id_organizador** (PK, FK → usuario.id_usuario, INT): Identificador do organizador.
- **nome_organizacao** (VARCHAR(150)): Nome da organização.
- **cnpj** (VARCHAR(18)): CNPJ da organização.
- **status_aprovacao** (ENUM): Situação do cadastro (ex: pendente, aprovado, recusado).

---

**fornecedor**
Especialização de **usuario** para quem oferece produtos ou serviços para os eventos.
- **id_fornecedor** (PK, FK → usuario.id_usuario, INT): Identificador do fornecedor.
- **nome_organizacao** (VARCHAR(150)): Nome da empresa.
- **cnpj** (VARCHAR(18)): CNPJ da empresa.
- **area_atuacao** (VARCHAR(80)): Área de atuação (ex: buffet, som, decoração).
- **status_aprovacao** (ENUM): Situação do cadastro.

---

**evento**
Eventos criados pelos organizadores.
- **id_evento** (PK, INT): Identificador do evento.
- **id_organizador_fk** (FK → organizador.id_organizador): Organizador responsável.
- **titulo_evento** (VARCHAR(150)): Título do evento.
- **data_inicio** (DATE): Data de início.
- **data_fim** (DATE): Data de término.
- **endereco** (VARCHAR(200)): Local do evento.
- **publico_minimo** (INT): Público mínimo esperado.
- **publico_maximo** (INT): Público máximo esperado.
- **status_publicacao** (ENUM): Situação do evento (ex: rascunho, publicado).
- **margem_lucro_percentual** (DECIMAL(5,2)): Margem de lucro desejada, em %.
- **ticket_estimado** (DECIMAL(10,2)): Valor estimado do ingresso.
- **created_at** (TIMESTAMP): Data de cadastro do evento.

---

**itemcusto**
Itens que o evento precisa contratar e que podem receber propostas de fornecedores.
- **id_item_custo** (PK, INT): Identificador do item.
- **id_evento_fk** (FK → evento.id_evento): Evento ao qual o item pertence.
- **categoria** (VARCHAR(80)): Categoria do item (ex: alimentação, estrutura).
- **descricao_detalhada** (VARCHAR(255)): Descrição do que é necessário.
- **quantidade** (INT): Quantidade necessária.

---

**custoindependente**
Custos do evento que não dependem de fornecedores (ex: taxas, aluguel).
- **id_custo_independente** (PK, INT): Identificador do custo.
- **id_evento_fk** (FK → evento.id_evento): Evento ao qual o custo pertence.
- **tipo_custo** (VARCHAR(80)): Tipo do custo.
- **descricao** (VARCHAR(255)): Descrição do custo.
- **valor** (DECIMAL(12,2)): Valor do custo.

---

**proposta**
Propostas enviadas pelos fornecedores para os itens de custo de um evento.
- **id_proposta** (PK, INT): Identificador da proposta.
- **id_fornecedor_fk** (FK → fornecedor.id_fornecedor): Fornecedor que enviou a proposta.
- **id_item_custo_fk** (FK → itemcusto.id_item_custo): Item de custo da proposta.
- **valor_oferecido** (DECIMAL(12,2)): Valor oferecido.
- **descricao_proposta** (TEXT): Detalhes da proposta.
- **data_validade** (DATE): Validade da proposta.
- **observacoes** (TEXT): Observações adicionais.
- **status_proposta** (ENUM): Situação da proposta (ex: enviada, aceita, recusada).
- **data_envio** (TIMESTAMP): Data de envio.

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
Um fornecedor pode enviar várias propostas.
