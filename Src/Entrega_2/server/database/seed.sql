-- Seed de TESTE para PostgreSQL / Supabase (schema: bancoPG.sql).
-- Rode DEPOIS do bancoPG.sql, num banco vazio. NAO usar em producao.
-- Para recomecar do zero: reset.sql -> bancoPG.sql -> este arquivo.
--
-- Senha de TODOS os usuarios abaixo: 123456
-- (hash bcrypt com custo 10, igual o authRoutes.js usa no cadastro real)
--
-- Os CNPJs sao de teste: tem 14 digitos, sem mascara (a coluna e CHAR(14)) e
-- passam na validacao do cadastro (digito verificador correto).
--
-- As tabelas usam GENERATED ALWAYS AS IDENTITY, entao os ids fixos abaixo entram
-- com OVERRIDING SYSTEM VALUE e, no fim, as sequencias sao ajustadas para o
-- proximo cadastro feito pela tela nao bater num id ja usado.

-- ── usuario ──────────────────────────────────────────────────────────────────
-- id 1: admin pra logar e testar a tela de Aprovar Cadastros
-- id 2: cliente comum, so pra ter alguem fora do fluxo de aprovacao
-- id 3-5: organizadores, um de cada status_aprovacao
-- id 6-8: fornecedores, um de cada status_aprovacao
INSERT INTO usuario (id_usuario, nome, idade, username, email, senha, perfil)
OVERRIDING SYSTEM VALUE VALUES
(1, 'Admin Master',    30, 'admin',              'admin@trocaticket.com',    '$2b$10$qgQo1.g.KFe6fvJXvIFqVevj7PcNu1SvS3VD9kSx5xro/z55PZGPy', 'administrador'),
(2, 'Cliente Teste',   25, 'cliente_teste',      'cliente@trocaticket.com',  '$2b$10$qgQo1.g.KFe6fvJXvIFqVevj7PcNu1SvS3VD9kSx5xro/z55PZGPy', 'cliente'),
(3, 'Carlos Mendonça', 34, 'carlos_organizador', 'carlos@eventosecia.com',   '$2b$10$qgQo1.g.KFe6fvJXvIFqVevj7PcNu1SvS3VD9kSx5xro/z55PZGPy', 'organizador'),
(4, 'Bruno Lima',      41, 'bruno_organizador',  'bruno@limaproducoes.com',  '$2b$10$qgQo1.g.KFe6fvJXvIFqVevj7PcNu1SvS3VD9kSx5xro/z55PZGPy', 'organizador'),
(5, 'Pedro Alves',     29, 'pedro_organizador',  'pedro@alvesshow.com',      '$2b$10$qgQo1.g.KFe6fvJXvIFqVevj7PcNu1SvS3VD9kSx5xro/z55PZGPy', 'organizador'),
(6, 'Mariana Souza',   27, 'mariana_fornecedor', 'mari@somart.com',          '$2b$10$qgQo1.g.KFe6fvJXvIFqVevj7PcNu1SvS3VD9kSx5xro/z55PZGPy', 'fornecedor'),
(7, 'Lúcia Ferreira',  38, 'lucia_fornecedor',   'lucia@lfilu.com',          '$2b$10$qgQo1.g.KFe6fvJXvIFqVevj7PcNu1SvS3VD9kSx5xro/z55PZGPy', 'fornecedor'),
(8, 'Tatiana Campos',  31, 'tatiana_fornecedor', 'tati@tceven.com',          '$2b$10$qgQo1.g.KFe6fvJXvIFqVevj7PcNu1SvS3VD9kSx5xro/z55PZGPy', 'fornecedor');


-- ── administrador ────────────────────────────────────────────────────────────
INSERT INTO administrador (id_administrador, nivel_permissao) VALUES
(1, 'master');

-- ── organizador ──────────────────────────────────────────────────────────────
-- um pendente, um aprovado, um rejeitado: cobre os 3 filtros da tela de uma vez
INSERT INTO organizador (id_organizador, nome_organizacao, cnpj, status_aprovacao) VALUES
(3, 'Eventos & Cia',  '12345678000195', 'pendente'),
(4, 'Lima Produções', '12345678000276', 'aprovado'),
(5, 'AlvesShow',      '12345678000357', 'rejeitado');

-- ── fornecedor ───────────────────────────────────────────────────────────────
INSERT INTO fornecedor (id_fornecedor, nome_organizacao, cnpj, area_atuacao, status_aprovacao) VALUES
(6, 'Som & Arte',    '98765432000198', 'Som e Luz',  'pendente'),
(7, 'LF Iluminação', '98765432000279', 'Iluminação', 'aprovado'),
(8, 'TC Eventos',    '98765432000350', 'Catering',   'rejeitado');

-- ── evento de teste (organizador 4, Lima Produções, aprovado) ────────────────
-- Margem de lucro de 15,5% (RF13). O ticket calculado NAO e gravado aqui: a API
-- calcula na hora em GET /api/eventos/1/ticket. ticket_estimado (75,00) e o
-- "Lote inicial", o preco de venda digitado pelo organizador.
INSERT INTO evento (
    id_evento, id_organizador_fk, titulo_evento,
    data_evento, data_inicio, data_fim, endereco,
    publico_minimo, publico_maximo, qtd_lote_minimo, qtd_lote_maximo,
    status_publicacao, margem_lucro_percentual, ticket_estimado
) OVERRIDING SYSTEM VALUE VALUES (
    1, 4, 'Festival de Primavera TrocaTicket',
    '2026-11-15', '2026-11-15 14:00:00-03', '2026-11-15 23:30:00-03',
    'Parque da Cidade, Espaço Alvorada - São Paulo, SP',
    200, 1500, 10.0, 100.0,
    'publicado', 15.50, 75.00
);

-- ── itens de custo (estimativas do organizador) ──────────────────────────────
-- 1: palco, sem proposta                       -> entra pela estimativa
-- 2: sonorizacao, 4 unidades; a proposta aceita
--    cobre 3 delas                             -> 3 pelo preco da proposta + 1 pela estimativa
INSERT INTO itemcusto (id_item_custo, id_evento_fk, categoria, descricao_detalhada, quantidade, valor_unitario)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 'Palco',       'Estrutura metálica de palco 10x8 metros',       1, 3500.00),
(2, 1, 'Sonorização', 'Caixas de som line array com operador (unid.)', 4,  800.00);

-- ── custos independentes (RF07) ──────────────────────────────────────────────
-- Todos os tipos sao FIXOS, exceto "Variável": o valor e POR PARTICIPANTE e
-- e multiplicado pelo publico de cada cenario.
INSERT INTO custoindependente (id_custo_independente, id_evento_fk, tipo_custo, descricao, valor)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 'Fiscal',      'Taxas e impostos do evento',          1200.00),
(2, 1, 'Operacional', 'Segurança, limpeza e brigada',        2500.00),
(3, 1, 'Variável',    'Pulseira e kit de boas-vindas',          4.50);

-- ── solicitacoes de fornecimento (RF10/RF12) ─────────────────────────────────
-- 1: LF Iluminação (aprovada) ACEITOU fornecer 3 sonorizacoes por 750,00 (entra no custo)
-- 2: LF Iluminação RECUSADA pelo organizador para o palco a 5.000,00 (NAO entra no custo)
-- 3: LF Iluminação ainda sem resposta para 1 sonorizacao a 700,00 (NAO entra no custo)
-- data_validade e observacoes (RF10) sao opcionais; a proposta 3 (sem resposta) vale 15 dias a partir de hoje.
INSERT INTO solicitacao_fornecimento (id, id_evento_fk, id_fornecedor_fk, mensagem, data_validade, observacoes, status, respondida_em)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 7, 'Fornecimento de 3 conjuntos de sonorização para o festival.', CURRENT_DATE + 30, 'Pagamento em até 30 dias após a entrega. Inclui montagem e operação técnica.', 'aceita',   CURRENT_TIMESTAMP),
(2, 1, 7, 'Montagem do palco principal.',                               CURRENT_DATE + 10, 'Valor sujeito a reajuste se a montagem passar de 2 dias.',                   'recusada', CURRENT_TIMESTAMP),
(3, 1, 7, 'Um conjunto extra de sonorização para a área de alimentação.', CURRENT_DATE + 15, 'Entrega condicionada à confirmação até 7 dias antes do evento.',            'enviada',  NULL);

INSERT INTO produto_solicitacao (id, id_solicitacao_fk, id_item_custo_fk, produto, quantidade, valor_unitario)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 2, 'Conjunto de sonorização line array', 3, 750.00),
(2, 2, 1, 'Palco metálico 10x8 m',              1, 5000.00),
(3, 3, 2, 'Conjunto de sonorização line array', 1, 700.00);

-- ── ajusta as sequencias (ids automaticos continuam depois dos fixos acima) ──
SELECT setval(pg_get_serial_sequence('usuario', 'id_usuario'),                       (SELECT MAX(id_usuario) FROM usuario));
SELECT setval(pg_get_serial_sequence('evento', 'id_evento'),                         (SELECT MAX(id_evento) FROM evento));
SELECT setval(pg_get_serial_sequence('itemcusto', 'id_item_custo'),                  (SELECT MAX(id_item_custo) FROM itemcusto));
SELECT setval(pg_get_serial_sequence('custoindependente', 'id_custo_independente'),  (SELECT MAX(id_custo_independente) FROM custoindependente));
SELECT setval(pg_get_serial_sequence('solicitacao_fornecimento', 'id'),              (SELECT MAX(id) FROM solicitacao_fornecimento));
SELECT setval(pg_get_serial_sequence('produto_solicitacao', 'id'),                   (SELECT MAX(id) FROM produto_solicitacao));

-- Resultado esperado em GET /api/eventos/1/ticket (como Bruno Lima, id 4):
--   custo fixo = palco 3.500 + sonorizacao (3 x 750 + 1 x 800 = 3.050) + fiscal 1.200 + operacional 2.500 = 10.250,00
--   variavel   = 4,50 por participante
--   publico minimo (200):  custo total 11.150,00 -> equilibrio R$ 55,75 | ticket-alvo R$ 65,98
--   publico maximo (1500): custo total 17.000,00 -> equilibrio R$ 11,34 | ticket-alvo R$ 13,42
