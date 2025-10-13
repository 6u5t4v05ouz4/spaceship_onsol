-- =====================================================
-- UUID v7 FUNCTION - SPACE CRYPTO MINER
-- =====================================================
-- Versão: 1.0
-- Data: Janeiro 2025
-- Descrição: Função para gerar UUID v7 (timestamp-based)
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função para gerar UUID v7 (timestamp-based)
-- UUID v7 inclui timestamp de 48 bits para ordenação cronológica
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS UUID AS $$
DECLARE
    unix_ts_ms BIGINT;
    uuid_bytes BYTEA;
BEGIN
    -- Obter timestamp em milissegundos
    unix_ts_ms := EXTRACT(EPOCH FROM NOW()) * 1000;
    
    -- Converter para bytes (48 bits para timestamp)
    uuid_bytes := 
        (unix_ts_ms >> 40)::INTEGER::BIT(8)::BYTEA ||
        ((unix_ts_ms >> 32) & 255)::INTEGER::BIT(8)::BYTEA ||
        ((unix_ts_ms >> 24) & 255)::INTEGER::BIT(8)::BYTEA ||
        ((unix_ts_ms >> 16) & 255)::INTEGER::BIT(8)::BYTEA ||
        ((unix_ts_ms >> 8) & 255)::INTEGER::BIT(8)::BYTEA ||
        (unix_ts_ms & 255)::INTEGER::BIT(8)::BYTEA ||
        -- 2 bytes aleatórios
        gen_random_bytes(2) ||
        -- Versão 7 (0111) + 4 bits aleatórios
        (7::BIT(4) || (random() * 16)::INTEGER::BIT(4))::BIT(8)::BYTEA ||
        -- 2 bytes aleatórios
        gen_random_bytes(2) ||
        -- Variante (10) + 6 bytes aleatórios
        ((2::BIT(2) || (random() * 64)::INTEGER::BIT(6))::BIT(8)::BYTEA ||
         gen_random_bytes(5));
    
    RETURN uuid_bytes::UUID;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TESTE DA FUNÇÃO
-- =====================================================

-- Exemplo de uso
-- SELECT uuid_generate_v7();

-- Teste de ordenação temporal
-- SELECT uuid_generate_v7() as uuid1, uuid_generate_v7() as uuid2, uuid_generate_v7() as uuid3;

-- =====================================================
-- VANTAGENS DO UUID v7
-- =====================================================

/*
UUID v7 oferece várias vantagens sobre UUID v4:

1. ORDENAÇÃO TEMPORAL
   - UUIDs são ordenados cronologicamente
   - Facilita queries ORDER BY id
   - Melhor performance em índices B-tree

2. DEBUGGING
   - Timestamp visível no UUID
   - Facilita identificação de registros antigos/novos
   - Melhor rastreabilidade

3. PERFORMANCE
   - Índices mais eficientes
   - Menos fragmentação
   - Melhor cache locality

4. COMPATIBILIDADE
   - Mantém formato UUID padrão
   - Funciona com todas as bibliotecas UUID
   - Não quebra código existente

ESTRUTURA DO UUID v7:
[48 bits timestamp][12 bits random][4 bits version][2 bits variant][62 bits random]

Onde:
- timestamp: Unix timestamp em milissegundos (48 bits)
- random: Dados aleatórios para unicidade
- version: 7 (identifica UUID v7)
- variant: 2 (identifica RFC 4122)
*/

-- =====================================================
-- COMPARAÇÃO COM UUID v4
-- =====================================================

/*
UUID v4 (tradicional):
- Totalmente aleatório
- Sem ordenação temporal
- Pode causar fragmentação em índices
- Difícil debugging

UUID v7 (timestamp-based):
- Baseado em timestamp + aleatório
- Ordenação temporal automática
- Melhor performance em índices
- Facilita debugging
*/

-- =====================================================
-- EXEMPLOS DE USO
-- =====================================================

-- Criar tabela com UUID v7
-- CREATE TABLE example_table (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
--     name TEXT NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Inserir dados (UUID será gerado automaticamente)
-- INSERT INTO example_table (name) VALUES ('Teste 1'), ('Teste 2'), ('Teste 3');

-- Consultar dados ordenados por criação (automaticamente ordenado por ID)
-- SELECT * FROM example_table ORDER BY id;

-- =====================================================
-- FIM DA FUNÇÃO UUID v7
-- =====================================================
