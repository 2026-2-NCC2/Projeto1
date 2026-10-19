-- Execute uma vez em uma instalação existente, depois de selecionar o banco.
CREATE TABLE IF NOT EXISTS sessao (
 token_hash CHAR(64) PRIMARY KEY,
 id_usuario_fk INT NOT NULL,
 expira_em DATETIME NOT NULL,
 FOREIGN KEY (id_usuario_fk) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;
ALTER TABLE itemcusto ADD COLUMN valor_unitario DECIMAL(12,2) NOT NULL DEFAULT 0;
CREATE TABLE solicitacao_fornecimento (
 id INT AUTO_INCREMENT PRIMARY KEY,
 id_evento_fk INT NOT NULL,
 id_fornecedor_fk INT NOT NULL,
 mensagem VARCHAR(1000) NOT NULL,
 status ENUM('enviada','aceita','recusada') NOT NULL DEFAULT 'enviada',
 criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 respondida_em TIMESTAMP NULL,
 FOREIGN KEY (id_evento_fk) REFERENCES evento(id_evento) ON DELETE CASCADE,
 FOREIGN KEY (id_fornecedor_fk) REFERENCES fornecedor(id_fornecedor) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE produto_solicitacao (
 id INT AUTO_INCREMENT PRIMARY KEY,
 id_solicitacao_fk INT NOT NULL,
 id_item_custo_fk INT NOT NULL,
 produto VARCHAR(255) NOT NULL,
 quantidade INT NOT NULL,
 valor_unitario DECIMAL(12,2) NOT NULL,
 FOREIGN KEY (id_solicitacao_fk) REFERENCES solicitacao_fornecimento(id) ON DELETE CASCADE,
 FOREIGN KEY (id_item_custo_fk) REFERENCES itemcusto(id_item_custo) ON DELETE CASCADE
) ENGINE=InnoDB;
