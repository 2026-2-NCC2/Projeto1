-- Migração: confirmação de e-mail ANTES de criar a conta (rode UMA vez em bancos que já existem).
-- Banco novo NÃO precisa deste arquivo: o bancoPG.sql já cria a tabela.

CREATE TABLE IF NOT EXISTS cadastro_pendente (
    id_pendente INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    nome VARCHAR(150) NOT NULL,
    idade INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil tipo_perfil NOT NULL,
    nome_organizacao VARCHAR(150),
    cnpj CHAR(14),
    area_atuacao VARCHAR(80),
    token_verificacao CHAR(64) NOT NULL UNIQUE,
    token_expira TIMESTAMPTZ NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Versão anterior desta funcionalidade guardava o estado na própria tabela usuario.
-- Se você chegou a rodar aquela migração, estas colunas não são mais usadas.
DROP INDEX IF EXISTS idx_usuario_token_verificacao;
ALTER TABLE usuario
    DROP COLUMN IF EXISTS email_verificado,
    DROP COLUMN IF EXISTS token_verificacao,
    DROP COLUMN IF EXISTS token_verificacao_expira;
