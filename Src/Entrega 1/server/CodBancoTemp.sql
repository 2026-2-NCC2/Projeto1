-- Removidos os comandos CREATE DATABASE e USE (o SQLite já roda direto no seu arquivo .db)

PRAGMA foreign_keys = ON;

CREATE TABLE usuario (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT, -- Ajustado para o padrão SQLite
    nome TEXT NOT NULL,
    idade INTEGER NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    perfil TEXT NOT NULL CHECK (perfil IN ('organizador', 'fornecedor', 'administrador')), -- Substituído ENUM por CHECK
    data_criacao TEXT DEFAULT CURRENT_TIMESTAMP -- Ajustado tipo de data
);

CREATE TABLE organizador (
    id_organizador INTEGER PRIMARY KEY,
    nome_organizacao TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    status_aprovacao TEXT NOT NULL DEFAULT 'pendente' CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado')),
    CONSTRAINT fk_organizador_usuario FOREIGN KEY (id_organizador) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE fornecedor (
    id_fornecedor INTEGER PRIMARY KEY,
    nome_organizacao TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    area_atuacao TEXT NOT NULL,
    status_aprovacao TEXT NOT NULL DEFAULT 'pendente' CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado')),
    CONSTRAINT fk_fornecedor_usuario FOREIGN KEY (id_fornecedor) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE administrador (
    id_administrador INTEGER PRIMARY KEY,
    nivel_permissao TEXT NOT NULL DEFAULT 'suporte' CHECK (nivel_permissao IN ('suporte', 'gestor', 'master')),
    CONSTRAINT fk_administrador_usuario FOREIGN KEY (id_administrador) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE evento (
    id_evento INTEGER PRIMARY KEY AUTOINCREMENT,
    id_organizador_fk INTEGER NOT NULL,
    titulo_evento TEXT NOT NULL,
    data_inicio TEXT NOT NULL, -- SQLite armazena datas como TEXT (YYYY-MM-DD)
    data_fim TEXT NOT NULL,
    endereco TEXT NOT NULL,
    publico_minimo INTEGER,
    publico_maximo INTEGER,
    status_publicacao TEXT NOT NULL DEFAULT 'rascunho' CHECK (status_publicacao IN ('rascunho', 'publicado', 'encerrado', 'cancelado')),
    margem_lucro_percentual REAL DEFAULT 0.00, -- DECIMAL vira REAL (ponto flutuante)
    ticket_estimado REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evento_organizador FOREIGN KEY (id_organizador_fk) REFERENCES organizador(id_organizador) ON DELETE CASCADE,
    CONSTRAINT chk_datas_evento CHECK (data_fim >= data_inicio)
);

CREATE TABLE itemcusto (
    id_item_custo INTEGER PRIMARY KEY AUTOINCREMENT,
    id_evento_fk INTEGER NOT NULL,
    categoria TEXT NOT NULL,
    descricao_detalhada TEXT NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT fk_itemcusto_evento FOREIGN KEY (id_evento_fk) REFERENCES evento(id_evento) ON DELETE CASCADE
);

CREATE TABLE custoindependente (
    id_custo_independente INTEGER PRIMARY KEY AUTOINCREMENT,
    id_evento_fk INTEGER NOT NULL,
    tipo_custo TEXT NOT NULL,
    descricao TEXT,
    valor REAL NOT NULL,
    CONSTRAINT fk_custoindependente_evento FOREIGN KEY (id_evento_fk) REFERENCES evento(id_evento) ON DELETE CASCADE
);

CREATE TABLE proposta (
    id_proposta INTEGER PRIMARY KEY AUTOINCREMENT,
    id_fornecedor_fk INTEGER NOT NULL,
    id_item_custo_fk INTEGER NOT NULL,
    valor_oferecido REAL NOT NULL,
    descricao_proposta TEXT,
    data_validade TEXT,
    observacoes TEXT,
    status_proposta TEXT NOT NULL DEFAULT 'enviada' CHECK (status_proposta IN ('enviada', 'em_analise', 'selecionada', 'recusada')),
    data_envio TEXT DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_proposta_fornecedor FOREIGN KEY (id_fornecedor_fk) REFERENCES fornecedor(id_fornecedor) ON DELETE CASCADE,
    CONSTRAINT fk_proposta_itemcusto FOREIGN KEY (id_item_custo_fk) REFERENCES itemcusto(id_item_custo) ON DELETE CASCADE,
    CONSTRAINT uq_fornecedor_item UNIQUE (id_fornecedor_fk, id_item_custo_fk)
);
