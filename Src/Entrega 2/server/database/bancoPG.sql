-- Limpeza segura do ambiente caso o script precise ser rodado novamente
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;

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
    CONSTRAINT fk_proposta_itemcusto KEY (id_item_custo_fk) REFERENCES itemcusto(id_item_custo) ON DELETE CASCADE,
    CONSTRAINT uq_fornecedor_item UNIQUE (id_fornecedor_fk, id_item_custo_fk)
);

CREATE TABLE solicitacao_fornecimento (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_evento_fk INT NOT NULL,
    id_fornecedor_fk INT NOT NULL,
    mensagem VARCHAR(1000) NOT NULL,
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
-- 4. ÍNDICES DE PERFORMANCE (Recomendados para o Postgres)
-- =========================================================================
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_evento_data ON evento(data_evento);
CREATE INDEX idx_proposta_status ON proposta(status_proposta);
