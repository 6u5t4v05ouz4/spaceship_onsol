-- =====================================================
-- SPACE CRYPTO MINER - Initial Database Schema
-- =====================================================
-- Version: 1.0.0
-- Description: Tabelas para servidor Node.js real-time
-- Author: ATLAS v2.0
-- Date: 2025-10-19

-- =====================================================
-- 1. PLAYER STATE TABLE
-- =====================================================
-- Armazena estado em tempo real dos jogadores

CREATE TABLE IF NOT EXISTS player_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  
  -- Posição atual
  x REAL NOT NULL DEFAULT 0,
  y REAL NOT NULL DEFAULT 0,
  current_chunk TEXT NOT NULL DEFAULT '0,0', -- formato: "chunkX,chunkY"
  
  -- Stats
  health INTEGER NOT NULL DEFAULT 100,
  max_health INTEGER NOT NULL DEFAULT 100,
  energy INTEGER NOT NULL DEFAULT 100,
  max_energy INTEGER NOT NULL DEFAULT 100,
  
  -- Resources
  resources INTEGER NOT NULL DEFAULT 0,
  experience INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  
  -- Inventory básico
  armor INTEGER NOT NULL DEFAULT 0,
  weapon_damage INTEGER NOT NULL DEFAULT 10,
  
  -- Status
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_login TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id),
  CONSTRAINT health_positive CHECK (health >= 0),
  CONSTRAINT health_max CHECK (health <= max_health),
  CONSTRAINT energy_positive CHECK (energy >= 0),
  CONSTRAINT energy_max CHECK (energy <= max_energy),
  CONSTRAINT resources_positive CHECK (resources >= 0)
);

-- Índices para player_state
CREATE INDEX idx_player_state_user_id ON player_state(user_id);
CREATE INDEX idx_player_state_chunk ON player_state(current_chunk);
CREATE INDEX idx_player_state_online ON player_state(is_online);
CREATE INDEX idx_player_state_experience ON player_state(experience DESC);
CREATE INDEX idx_player_state_username ON player_state(username);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_player_state_updated_at
  BEFORE UPDATE ON player_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. CHUNKS TABLE
-- =====================================================
-- Armazena chunks gerados proceduralmente

CREATE TABLE IF NOT EXISTS chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Coordenadas
  chunk_x INTEGER NOT NULL,
  chunk_y INTEGER NOT NULL,
  
  -- Zona
  zone_type TEXT NOT NULL CHECK (zone_type IN ('safe', 'transition', 'hostile')),
  distance_from_origin REAL NOT NULL,
  loot_multiplier REAL NOT NULL DEFAULT 1.0,
  pvp_allowed BOOLEAN NOT NULL DEFAULT false,
  
  -- Geração procedural
  seed TEXT NOT NULL, -- formato: "chunkX,chunkY"
  biome_type TEXT NOT NULL DEFAULT 'asteroid_field',
  
  -- Metadata
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_visited_at TIMESTAMPTZ,
  visit_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(chunk_x, chunk_y),
  CONSTRAINT loot_multiplier_positive CHECK (loot_multiplier > 0)
);

-- Índices para chunks
CREATE INDEX idx_chunks_coords ON chunks(chunk_x, chunk_y);
CREATE INDEX idx_chunks_zone ON chunks(zone_type);
CREATE INDEX idx_chunks_distance ON chunks(distance_from_origin);
CREATE INDEX idx_chunks_discovered ON chunks(discovered_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_chunks_updated_at
  BEFORE UPDATE ON chunks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. CHUNK ASTEROIDS TABLE
-- =====================================================
-- Asteroides dentro de cada chunk

CREATE TABLE IF NOT EXISTS chunk_asteroids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
  
  -- Posição relativa dentro do chunk
  x REAL NOT NULL,
  y REAL NOT NULL,
  
  -- Recursos
  resources INTEGER NOT NULL DEFAULT 100,
  max_resources INTEGER NOT NULL DEFAULT 100,
  resource_type TEXT NOT NULL DEFAULT 'iron',
  
  -- Visual
  size TEXT NOT NULL DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large')),
  rotation REAL NOT NULL DEFAULT 0,
  
  -- Status
  is_depleted BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT resources_positive CHECK (resources >= 0),
  CONSTRAINT resources_max CHECK (resources <= max_resources)
);

-- Índices para chunk_asteroids
CREATE INDEX idx_chunk_asteroids_chunk_id ON chunk_asteroids(chunk_id);
CREATE INDEX idx_chunk_asteroids_depleted ON chunk_asteroids(is_depleted);

-- Trigger para updated_at
CREATE TRIGGER update_chunk_asteroids_updated_at
  BEFORE UPDATE ON chunk_asteroids
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. BATTLE LOG TABLE
-- =====================================================
-- Histórico de combates PvP

CREATE TABLE IF NOT EXISTS battle_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Combatentes
  attacker_id UUID NOT NULL REFERENCES player_state(id) ON DELETE CASCADE,
  defender_id UUID NOT NULL REFERENCES player_state(id) ON DELETE CASCADE,
  
  -- Localização
  chunk_id UUID REFERENCES chunks(id) ON DELETE SET NULL,
  chunk_coords TEXT NOT NULL, -- formato: "chunkX,chunkY"
  
  -- Resultado
  damage INTEGER NOT NULL,
  defender_health_before INTEGER NOT NULL,
  defender_health_after INTEGER NOT NULL,
  was_fatal BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  attacker_weapon_damage INTEGER,
  defender_armor INTEGER,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT different_players CHECK (attacker_id != defender_id),
  CONSTRAINT damage_positive CHECK (damage > 0),
  CONSTRAINT health_positive CHECK (defender_health_after >= 0)
);

-- Índices para battle_log
CREATE INDEX idx_battle_log_chunk ON battle_log(chunk_id);
CREATE INDEX idx_battle_log_created ON battle_log(created_at DESC);
CREATE INDEX idx_battle_log_attacker ON battle_log(attacker_id, created_at DESC);
CREATE INDEX idx_battle_log_defender ON battle_log(defender_id, created_at DESC);
CREATE INDEX idx_battle_log_fatal ON battle_log(was_fatal);

-- =====================================================
-- 5. PLAYER INVENTORY TABLE
-- =====================================================
-- Inventário de itens dos jogadores

CREATE TABLE IF NOT EXISTS player_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES player_state(id) ON DELETE CASCADE,
  
  -- Item
  item_type TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  
  -- Metadata
  rarity TEXT CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(player_id, item_type, item_name),
  CONSTRAINT quantity_positive CHECK (quantity > 0)
);

-- Índices para player_inventory
CREATE INDEX idx_player_inventory_player_id ON player_inventory(player_id);
CREATE INDEX idx_player_inventory_type ON player_inventory(item_type);
CREATE INDEX idx_player_inventory_equipped ON player_inventory(is_equipped);

-- Trigger para updated_at
CREATE TRIGGER update_player_inventory_updated_at
  BEFORE UPDATE ON player_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. CHUNK CHANGES TABLE (Opcional - para auditoria)
-- =====================================================
-- Registra mudanças em chunks (asteroides minerados, etc)

CREATE TABLE IF NOT EXISTS chunk_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
  
  -- O que mudou
  object_id UUID, -- ID do asteroide, por exemplo
  object_type TEXT NOT NULL, -- 'asteroid', 'npc', etc
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'destroyed')),
  
  -- Quem causou
  player_id UUID REFERENCES player_state(id) ON DELETE SET NULL,
  
  -- Metadata
  change_data JSONB,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para chunk_changes
CREATE INDEX idx_chunk_changes_chunk ON chunk_changes(chunk_id, created_at DESC);
CREATE INDEX idx_chunk_changes_object ON chunk_changes(chunk_id, object_id);
CREATE INDEX idx_chunk_changes_player ON chunk_changes(player_id);

-- =====================================================
-- 7. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE player_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunk_asteroids ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunk_changes ENABLE ROW LEVEL SECURITY;

-- player_state policies
CREATE POLICY "Users can view own player state"
  ON player_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own player state"
  ON player_state FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Server can manage all player states"
  ON player_state FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- chunks policies
CREATE POLICY "Chunks are public for reading"
  ON chunks FOR SELECT
  USING (true);

CREATE POLICY "Server manages chunks"
  ON chunks FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- chunk_asteroids policies
CREATE POLICY "Asteroids are public for reading"
  ON chunk_asteroids FOR SELECT
  USING (true);

CREATE POLICY "Server manages asteroids"
  ON chunk_asteroids FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- battle_log policies
CREATE POLICY "Players can view own battles"
  ON battle_log FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM player_state WHERE id = attacker_id
      UNION
      SELECT user_id FROM player_state WHERE id = defender_id
    )
  );

CREATE POLICY "Server logs battles"
  ON battle_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- player_inventory policies
CREATE POLICY "Users can view own inventory"
  ON player_inventory FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM player_state WHERE id = player_id
    )
  );

CREATE POLICY "Server manages inventory"
  ON player_inventory FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- chunk_changes policies
CREATE POLICY "Changes are public for reading"
  ON chunk_changes FOR SELECT
  USING (true);

CREATE POLICY "Server records changes"
  ON chunk_changes FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- 8. SEED DATA (Opcional - para testes)
-- =====================================================

-- Criar chunk inicial (0,0) - Zona Segura
INSERT INTO chunks (chunk_x, chunk_y, zone_type, distance_from_origin, loot_multiplier, pvp_allowed, seed, biome_type)
VALUES (0, 0, 'safe', 0, 1.0, false, '0,0', 'asteroid_field')
ON CONFLICT (chunk_x, chunk_y) DO NOTHING;

-- =====================================================
-- DONE!
-- =====================================================

-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar índices criados
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;

