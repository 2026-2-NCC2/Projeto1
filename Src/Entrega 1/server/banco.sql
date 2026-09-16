CREATE DATABASE trocaticket;
USE trocaticket;

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR (150) NOT NULL,
    username VARCHAR (50) NOT NULL UNIQUE,
    email VARCHAR (150) NOT NULL UNIQUE,
    senha VARCHAR (255) NOT NULL,
    perfil ENUM ('organizador', 'fornecedor', 'administrador') NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=INNODB;

CREATE TABLE organizador (
    id_organizador INT PRIMARY KEY,
    nome_organizacao VARCHAR (150) NOT NULL,
    cnpj VARCHAR (18) UNIQUE NOT NULL,
    status_aprovacao ENUM ('pendente', 'aprovado', 'rejeitado') NOT NULL DEFAULT 'pendente',
    CONSTRAINT fk_organizador_usuario FOREIGN KEY (id_organizador) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=INNODB;

CREATE TABLE fornecedor (
    id_fornecedor INT PRIMARY KEY,
    nome_organizacao VARCHAR (150) NOT NULL,
    cnpj VARCHAR (18) UNIQUE NOT NULL,
    area_atuacao VARCHAR(80) NOT NULL,
    status_aprovacao ENUM('pendente', 'aprovado', 'rejeitado') NOT NULL DEFAULT 'pendente', 
    CONSTRAINT fk_fornecedor_usuario FOREIGN KEY (id_fornecedor) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=INNODB;

CREATE TABLE administrador (
    id_administrador INT PRIMARY KEY,
    nome_completo VARCHAR (150) NOT NULL,
    nivel_permissao ENUM('suporte', 'gestor', 'master') NOT NULL DEFAULT 'suporte',
    CONSTRAINT fk_administrador_usuario FOREIGN KEY (id_administrador) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=INNODB;

CREATE TABLE evento (
    id_evento INT AUTO_INCREMENT PRIMARY KEY,
    id_organizador_fk INT NOT NULL,
    titulo_evento VARCHAR (150) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    endereco VARCHAR (200) NOT NULL,
    publico_minimo INT,
    publico_maximo INT,
    status_publicacao ENUM ('Rascunho', 'Publicado', 'Encerrado', 'Cancelado') NOT NULL DEFAULT 'Rascunho',
    margem_lucro_percentual DECIMAL (5,2) DEFAULT 0.00,
    ticket_estimado DECIMAL (10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    CONSTRAINT fk_evento_organizador FOREIGN KEY(id_organizador_fk) REFERENCES organizador(id_organizador) ON DELETE CASCADE,
    CONSTRAINT chk_datas_evento CHECK (data_fim >= data_inicio)
) ENGINE=INNODB;

CREATE TABLE item_custo (
    id_item_custo INT AUTO_INCREMENT PRIMARY KEY,
    id_evento_fk INT NOT NULL,
    categoria VARCHAR (80) NOT NULL,
    descricao_detalhada VARCHAR (255) NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_itemcusto_evento FOREIGN KEY (id_evento_fk) REFERENCES evento (id_evento) ON DELETE CASCADE
);

CREATE TABLE custo_independente ( 
    id_custo_independente INT AUTO_INCREMENT PRIMARY KEY, 
    id_evento_fk INT NOT NULL, 
    tipo_custo VARCHAR (80) NOT NULL, 
    descricao VARCHAR (255), 
    valor DECIMAL (12,2) NOT NULL, 
    CONSTRAINT fk_custoindependente_evento FOREIGN KEY (id_evento_fk) REFERENCES evento (id_evento) ON DELETE CASCADE 
) ENGINE=INNODB;

CREATE TABLE proposta (
    id_proposta INT AUTO_INCREMENT PRIMARY KEY,
    id_fornecedor_fk INT NOT NULL,
    id_item_custo_fk INT NOT NULL,
    valor_oferecido DECIMAL (12,2) NOT NULL,
    descricao_proposta TEXT,
    data_validade DATE,
    observacoes TEXT,
    status_proposta ENUM ('enviada', 'em_analise', 'selecionada', 'recusada') NOT NULL DEFAULT 'enviada',
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_proposta_fornecedor FOREIGN KEY (id_fornecedor_fk) REFERENCES fornecedor (id_fornecedor) ON DELETE CASCADE,
    CONSTRAINT fk_proposta_itemcusto FOREIGN KEY (id_item_custo_fk) REFERENCES itemcusto (id_item_custo) ON DELETE CASCADE,
    CONSTRAINT uq_fornecedor_item UNIQUE (id_fornecedor_fk, id_item_custo_fk)
) ENGINE=INNODB;