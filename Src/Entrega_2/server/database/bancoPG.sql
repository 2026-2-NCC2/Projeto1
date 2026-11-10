-- Cria as tabelas no schema public. NAO apaga nada.
-- Banco novo: rode so este arquivo. Para recomecar do zero, rode antes reset.sql (apaga TUDO).

-- =========================================================================
-- 0. CRIAÇÃO DOS TIPOS ENUM (Globais e fortemente tipados)
-- =========================================================================
CREATE TYPE tipo_perfil AS ENUM ('cliente', 'organizador', 'fornecedor', 'administrador');
CREATE TYPE tipo_status_aprovacao AS ENUM ('pendente', 'aprovado', 'rejeitado');
CREATE TYPE tipo_status_publicacao AS ENUM ('rascunho', 'publicado', 'encerrado', 'cancelado');
CREATE TYPE tipo_nivel_permissao AS ENUM ('suporte', 'gestor', 'master');
CREATE TYPE tipo_status_proposta AS ENUM ('enviada', 'em_analise', 'selecionada', 'recusada');
CREATE TYPE tipo_status_solicitacao AS ENUM ('enviada', 'aceita', 'recusada');

-- =========================================================================
-- 1. TABELAS DE USUÁRIOS E PERFIS
-- =========================================================================
CREATE TABLE usuario (
    id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    idade INT NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil tipo_perfil NOT NULL,
    data_criacao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP -- [MELHORIA] TIMESTAMPTZ para suporte a fusos horários
);

-- Cadastros aguardando a confirmação do e-mail. A conta (usuario + organizador/fornecedor)
-- só é criada quando a pessoa clica no link; nesse momento a linha daqui é apagada.
-- Guardamos só o hash (SHA-256) do token; o token em si vai apenas no e-mail.
CREATE TABLE cadastro_pendente (
    id_pendente INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,  -- um pendente por e-mail: cadastrar de novo substitui o anterior
    nome VARCHAR(150) NOT NULL,
    idade INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    senha VARCHAR(255) NOT NULL,         -- já com hash bcrypt
    perfil tipo_perfil NOT NULL,
    nome_organizacao VARCHAR(150),       -- só organizador e fornecedor
    cnpj CHAR(14),                       -- só organizador e fornecedor
    area_atuacao VARCHAR(80),            -- só fornecedor
    token_verificacao CHAR(64) NOT NULL UNIQUE,
    token_expira TIMESTAMPTZ NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organizador (
    id_organizador INT PRIMARY KEY,
    nome_organizacao VARCHAR(150) NOT NULL,
    cnpj CHAR(14) UNIQUE NOT NULL, -- [MELHORIA] Mudado para CHAR(14) se armazenado limpo (sugestão: adicione CHECK se desejar)
    status_aprovacao tipo_status_aprovacao NOT NULL DEFAULT 'pendente',
    CONSTRAINT fk_organizador_usuario FOREIGN KEY (id_organizador) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE fornecedor (
    id_fornecedor INT PRIMARY KEY,
    nome_organizacao VARCHAR(150) NOT NULL,
    cnpj CHAR(14) UNIQUE NOT NULL, -- [MELHORIA] CHAR(14) otimiza espaço se não houver pontuação
    area_atuacao VARCHAR(80) NOT NULL,
    status_aprovacao tipo_status_aprovacao NOT NULL DEFAULT 'pendente',
    CONSTRAINT fk_fornecedor_usuario FOREIGN KEY (id_fornecedor) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE administrador (
    id_administrador INT PRIMARY KEY,
    nivel_permissao tipo_nivel_permissao NOT NULL DEFAULT 'suporte',
    CONSTRAINT fk_administrador_usuario FOREIGN KEY (id_administrador) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- =========================================================================
-- 2. TABELAS DE EVENTOS E CUSTOS
-- =========================================================================
CREATE TABLE evento (
    id_evento INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_organizador_fk INT NOT NULL,
    titulo_evento VARCHAR(150) NOT NULL,
    data_evento DATE NOT NULL,
    data_inicio TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, -- [MELHORIA] TIMESTAMPTZ
    data_fim TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,    -- [MELHORIA] TIMESTAMPTZ
    endereco VARCHAR(200) NOT NULL,
    publico_minimo INT,
    publico_maximo INT,
    qtd_lote_minimo NUMERIC(10,2), -- [MELHORIA] Trocado REAL por NUMERIC para exatidão matemática (evita bugs de arredondamento)
    qtd_lote_maximo NUMERIC(10,2), -- [MELHORIA] Trocado REAL por NUMERIC
    status_publicacao tipo_status_publicacao NOT NULL DEFAULT 'rascunho',
    margem_lucro_percentual DECIMAL(5,2) DEFAULT 0.00,
    ticket_estimado DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- [MELHORIA] TIMESTAMPTZ
    CONSTRAINT fk_evento_organizador FOREIGN KEY (id_organizador_fk) REFERENCES organizador(id_organizador) ON DELETE CASCADE,
    CONSTRAINT chk_datas_evento CHECK (data_fim >= data_inicio)
);

CREATE TABLE itemcusto (
    id_item_custo INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_evento_fk INT NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    descricao_detalhada VARCHAR(255) NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    valor_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_itemcusto_evento FOREIGN KEY (id_evento_fk) REFERENCES evento(id_evento) ON DELETE CASCADE
);

CREATE TABLE custoindependente (
    id_custo_independente INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_evento_fk INT NOT NULL,
    tipo_custo VARCHAR(80) NOT NULL,
    descricao VARCHAR(255),
    valor DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_custoindependente_evento FOREIGN KEY (id_evento_fk) REFERENCES evento(id_evento) ON DELETE CASCADE
);

-- =========================================================================
-- 3. TABELAS DE PROPOSTAS E SOLICITAÇÕES
-- =========================================================================
CREATE TABLE proposta (
    id_proposta INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_fornecedor_fk INT NOT NULL,
    id_item_custo_fk INT NOT NULL,
    valor_oferecido DECIMAL(12,2) NOT NULL,
    descricao_proposta TEXT,
    data_validade DATE,
    observacoes TEXT,
    status_proposta tipo_status_proposta NOT NULL DEFAULT 'enviada',
    data_envio TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- [MELHORIA] TIMESTAMPTZ
    CONSTRAINT fk_proposta_fornecedor FOREIGN KEY (id_fornecedor_fk) REFERENCES fornecedor(id_fornecedor) ON DELETE CASCADE,
    CONSTRAINT fk_proposta_itemcusto FOREIGN KEY (id_item_custo_fk) REFERENCES itemcusto(id_item_custo) ON DELETE CASCADE,
    CONSTRAINT uq_fornecedor_item UNIQUE (id_fornecedor_fk, id_item_custo_fk)
);

CREATE TABLE solicitacao_fornecimento (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_evento_fk INT NOT NULL,
    id_fornecedor_fk INT NOT NULL,
    mensagem VARCHAR(1000) NOT NULL,
    data_validade DATE NULL,           -- RF10: até quando a proposta vale (opcional)
    observacoes VARCHAR(1000) NULL,    -- RF10: observações adicionais do fornecedor (opcional)
    status tipo_status_solicitacao NOT NULL DEFAULT 'enviada',
    criada_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,  -- [MELHORIA] TIMESTAMPTZ
    respondida_em TIMESTAMPTZ NULL,                   -- [MELHORIA] TIMESTAMPTZ
    CONSTRAINT fk_solicitacao_evento FOREIGN KEY (id_evento_fk) REFERENCES evento(id_evento) ON DELETE CASCADE,
    CONSTRAINT fk_solicitacao_fornecedor FOREIGN KEY (id_fornecedor_fk) REFERENCES fornecedor(id_fornecedor) ON DELETE CASCADE
);

CREATE TABLE produto_solicitacao (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_solicitacao_fk INT NOT NULL,
    id_item_custo_fk INT NOT NULL,
    produto VARCHAR(255) NOT NULL,
    quantidade INT NOT NULL,
    valor_unitario DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_produto_solicitacao FOREIGN KEY (id_solicitacao_fk) REFERENCES solicitacao_fornecimento(id) ON DELETE CASCADE,
    CONSTRAINT fk_produto_itemcusto FOREIGN KEY (id_item_custo_fk) REFERENCES itemcusto(id_item_custo) ON DELETE CASCADE
);

-- =========================================================================
-- 4. COMPRA DE INGRESSOS E SALDO DO CLIENTE (pagamento SIMULADO)
-- Usadas por server/routes/compraRoutes.js.
-- =========================================================================

-- Compra: cada linha e uma compra APROVADA (compra recusada nao grava nada).
--   Os ingressos sao "quantidade" unidades do tipo escolhido, com um codigo unico.
CREATE TABLE IF NOT EXISTS compra (
    id_compra INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario_fk INT NOT NULL,
    id_evento_fk INT NOT NULL,
    tipo_ingresso VARCHAR(20) NOT NULL CHECK (tipo_ingresso IN ('lote_inicial', 'segundo_lote')),
    quantidade INT NOT NULL CHECK (quantidade > 0),
    valor_unitario NUMERIC(12,2) NOT NULL CHECK (valor_unitario > 0), -- preco no momento da compra
    valor_total NUMERIC(12,2) NOT NULL CHECK (valor_total > 0),
    metodo VARCHAR(10) NOT NULL CHECK (metodo IN ('saldo', 'cartao')),
    codigo CHAR(12) NOT NULL UNIQUE,
    criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_compra_usuario FOREIGN KEY (id_usuario_fk) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    -- RESTRICT: um evento com vendas nao pode ser apagado (protege as compras dos clientes)
    CONSTRAINT fk_compra_evento FOREIGN KEY (id_evento_fk) REFERENCES evento(id_evento) ON DELETE RESTRICT
);

-- Movimentacao de saldo: o saldo do cliente = soma das 'recarga' menos soma das 'compra'.
--    Nao existe coluna de saldo na tabela usuario, entao nao ha um numero para alterar direto.
CREATE TABLE IF NOT EXISTS movimentacao_saldo (
    id_movimentacao INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario_fk INT NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('recarga', 'compra')),
    descricao VARCHAR(150) NOT NULL,
    valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
    saldo_resultante NUMERIC(12,2) NOT NULL CHECK (saldo_resultante >= 0), -- saldo logo depois desta movimentacao
    criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movimentacao_usuario FOREIGN KEY (id_usuario_fk) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- =========================================================================
-- 5. ÍNDICES DE PERFORMANCE (Recomendados para o Postgres)
-- =========================================================================
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_evento_data ON evento(data_evento);
CREATE INDEX idx_proposta_status ON proposta(status_proposta);

-- O Postgres NAO cria indice automatico para chave estrangeira. Estes indices
-- aceleram os JOINs e os DELETE ... CASCADE usados pelas rotas de eventos e propostas.
-- IF NOT EXISTS: pode ser rodado de novo, inclusive no banco que ja existe, sem apagar nada.
-- Migração (RF10) para bancos já criados antes das colunas existirem. Seguro rodar de novo.
ALTER TABLE solicitacao_fornecimento ADD COLUMN IF NOT EXISTS data_validade DATE NULL;
ALTER TABLE solicitacao_fornecimento ADD COLUMN IF NOT EXISTS observacoes VARCHAR(1000) NULL;

CREATE INDEX IF NOT EXISTS idx_evento_organizador ON evento(id_organizador_fk);
CREATE INDEX IF NOT EXISTS idx_itemcusto_evento ON itemcusto(id_evento_fk);
CREATE INDEX IF NOT EXISTS idx_custoindependente_evento ON custoindependente(id_evento_fk);
CREATE INDEX IF NOT EXISTS idx_proposta_itemcusto ON proposta(id_item_custo_fk);
CREATE INDEX IF NOT EXISTS idx_solicitacao_evento ON solicitacao_fornecimento(id_evento_fk);
CREATE INDEX IF NOT EXISTS idx_solicitacao_fornecedor ON solicitacao_fornecimento(id_fornecedor_fk);
CREATE INDEX IF NOT EXISTS idx_produto_solicitacao ON produto_solicitacao(id_solicitacao_fk);
CREATE INDEX IF NOT EXISTS idx_produto_itemcusto ON produto_solicitacao(id_item_custo_fk);
CREATE INDEX IF NOT EXISTS idx_compra_usuario ON compra(id_usuario_fk);
CREATE INDEX IF NOT EXISTS idx_compra_evento ON compra(id_evento_fk);
CREATE INDEX IF NOT EXISTS idx_movimentacao_usuario ON movimentacao_saldo(id_usuario_fk);

ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizador ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrador ENABLE ROW LEVEL SECURITY;
ALTER TABLE evento ENABLE ROW LEVEL SECURITY;
ALTER TABLE itemcusto ENABLE ROW LEVEL SECURITY;
ALTER TABLE custoindependente ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposta ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacao_fornecimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto_solicitacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacao_saldo ENABLE ROW LEVEL SECURITY;
