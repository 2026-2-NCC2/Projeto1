-- ATENCAO: apaga TODO o schema public (tabelas e dados). Use so em banco de desenvolvimento/teste.
-- Depois rode bancoPG.sql para recriar as tabelas.
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
