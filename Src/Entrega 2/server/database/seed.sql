-- ATENCAO: seed so para MySQL (banco.sql).

-- Dados de teste pra nao precisar recriar conta pela tela toda vez.
-- Roda isso DEPOIS do banco.sql (schema). Nao usar em producao.
--
-- Senha de TODOS os usuarios abaixo: 123456
-- (hash bcrypt gerado com custo 10, igual o authRoutes.js usa no cadastro real)

USE trocaticket;

-- ── usuario ──────────────────────────────────────────────────────────────────
-- id 1: admin pra logar e testar a tela de Aprovar Cadastros
-- id 2: cliente comum, so pra ter alguem fora do fluxo de aprovacao
-- id 3-5: organizadores, um de cada status_aprovacao
-- id 6-8: fornecedores, um de cada status_aprovacao
INSERT INTO usuario (id_usuario, nome, idade, username, email, senha, perfil) VALUES
(1, 'Admin Master',        30, 'admin',             'admin@trocaticket.com',      '$2b$10$qgQo1.g.KFe6fvJXvIFqVevj7PcNu1SvS3VD9kSx5xro/z55PZGPy', 'administrador'),
(2, 'Cliente Teste',       25, 'cliente_teste',      'cliente@trocaticket.com',    '$2b$10$qgQo1.g.KFe6fvJXvIFqVevj7PcNu1SvS3VD9kSx5xro/z55PZGPy', 'cliente'),
(3, 'Carlos Mendonça',     34, 'carlos_organizador',  'carlos@eventosecia.com',    '$2b$10$qgQo1.g.KFe6fvJXvIFqVevj7PcNu1SvS3VD9kSx5xro/z55PZGPy', 'organizador'),
(4, 'Bruno Lima',          41, 'bruno_organizador',   'bruno@limaproducoes.com',   '$2b$10$qgQo1.g.KFe6fvJXvIFqVevj7PcNu1SvS3VD9kSx5xro/z55PZGPy', 'organizador'),
(5, 'Pedro Alves',         29, 'pedro_organizador',   'pedro@alvesshow.com',       '$2b$10$qgQo1.g.KFe6fvJXvIFqVevj7PcNu1SvS3VD9kSx5xro/z55PZGPy', 'organizador'),
(6, 'Mariana Souza',       27, 'mariana_fornecedor',  'mari@somart.com',           '$2b$10$qgQo1.g.KFe6fvJXvIFqVevj7PcNu1SvS3VD9kSx5xro/z55PZGPy', 'fornecedor'),
(7, 'Lúcia Ferreira',      38, 'lucia_fornecedor',    'lucia@lfilu.com',           '$2b$10$qgQo1.g.KFe6fvJXvIFqVevj7PcNu1SvS3VD9kSx5xro/z55PZGPy', 'fornecedor'),
(8, 'Tatiana Campos',      31, 'tatiana_fornecedor',  'tati@tceven.com',           '$2b$10$qgQo1.g.KFe6fvJXvIFqVevj7PcNu1SvS3VD9kSx5xro/z55PZGPy', 'fornecedor');

-- ── administrador ────────────────────────────────────────────────────────────
INSERT INTO administrador (id_administrador, nivel_permissao) VALUES
(1, 'master');

-- ── organizador ──────────────────────────────────────────────────────────────
-- um pendente, um aprovado, um rejeitado — cobre os 3 filtros da tela de uma vez
INSERT INTO organizador (id_organizador, nome_organizacao, cnpj, status_aprovacao) VALUES
(3, 'Eventos & Cia',     '12.345.678/0001-01', 'pendente'),
(4, 'Lima Produções',    '12.345.678/0001-02', 'aprovado'),
(5, 'AlvesShow',         '12.345.678/0001-03', 'rejeitado');

-- ── fornecedor ───────────────────────────────────────────────────────────────
INSERT INTO fornecedor (id_fornecedor, nome_organizacao, cnpj, area_atuacao, status_aprovacao) VALUES
(6, 'Som & Arte',    '98.765.432/0001-01', 'Som e Luz',  'pendente'),
(7, 'LF Iluminação', '98.765.432/0001-02', 'Iluminação', 'aprovado'),
(8, 'TC Eventos',    '98.765.432/0001-03', 'Catering',   'rejeitado');

-- evento teste usando o id 4 
INSERT INTO evento (
    id_evento, 
    id_organizador_fk, 
    titulo_evento, 
    data_evento, 
    data_inicio, 
    data_fim, 
    endereco, 
    publico_minimo, 
    publico_maximo, 
    qtd_lote_minimo,
    qtd_lote_maximo,
    status_publicacao,
    margem_lucro_percentual,
    ticket_estimado
) VALUES (
    1, 
    4, -- ID do organizador 'Lima Produções' (Aprovado)
    'Festival de Primavera TrocaTicket', 
    '2026-11-15', 
    '2026-11-15 14:00:00', 
    '2026-11-15 23:30:00', -- Garante a regra data_fim >= data_inicio
    'Parque da Cidade, Espaço Alvorada - São Paulo, SP', 
    200, 
    1500, 
    10.0,
    100.0,
    'publicado',
    15.50,
    75.00
);

-- Adicionando um item de custo base para este evento (necessário para as propostas)
INSERT INTO itemcusto (id_item_custo, id_evento_fk, categoria, descricao_detalhada, quantidade, valor_unitario)
VALUES (1, 1, 'Palco', 'Estrutura metálica de palco 10x8 metros', 1, 3500.00);