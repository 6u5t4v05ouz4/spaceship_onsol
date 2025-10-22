// =====================================================
// DATABASE SCHEMA - PostgreSQL Railway
// =====================================================

-- Tabela para elementos do jogo compartilhados
CREATE TABLE game_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_x INTEGER NOT NULL,
  chunk_y INTEGER NOT NULL,
  element_type VARCHAR(20) NOT NULL, -- 'meteor', 'npc', 'planet'
  x REAL NOT NULL,
  y REAL NOT NULL,
  data JSONB, -- propriedades específicas (health, speed, etc)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_game_elements_chunk ON game_elements(chunk_x, chunk_y);
CREATE INDEX idx_game_elements_type ON game_elements(element_type);

-- Tabela para chunks gerados
CREATE TABLE game_chunks (
  chunk_x INTEGER NOT NULL,
  chunk_y INTEGER NOT NULL,
  seed VARCHAR(50) NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (chunk_x, chunk_y)
);

-- Função para limpar elementos antigos
CREATE OR REPLACE FUNCTION cleanup_old_elements()
RETURNS void AS $$
BEGIN
  DELETE FROM game_elements 
  WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_game_elements_updated_at
  BEFORE UPDATE ON game_elements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
