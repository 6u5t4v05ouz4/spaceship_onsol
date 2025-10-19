# 💾 Banco de Dados e Índices

Define o schema PostgreSQL e estratégias de indexação para o ATLAS.

---

## 📊 Schema Principal

### Tabela: `chunks`

Armazena informações de chunks (base procedural + estado persistente).

```sql
CREATE TABLE chunks (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  chunk_x INT NOT NULL,
  chunk_y INT NOT NULL,
  seed VARCHAR(64) NOT NULL,
  game_mode VARCHAR(10) NOT NULL CHECK (game_mode IN ('pve', 'pvp')),
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  discovered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  procedural_data JSONB NOT NULL DEFAULT '{}',
  current_state JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint de unicidade por chunk
  UNIQUE(chunk_x, chunk_y, game_mode),
  UNIQUE(seed, game_mode)
);

-- Índices
CREATE INDEX idx_chunks_coords ON chunks(chunk_x, chunk_y, game_mode);
CREATE INDEX idx_chunks_discovered_at ON chunks(discovered_at DESC);
CREATE INDEX idx_chunks_discovered_by ON chunks(discovered_by);
CREATE INDEX idx_chunks_game_mode ON chunks(game_mode);
```

### Tabela: `chunk_changes`

Registra todas as mudanças (mineração, construção, destruição) em chunks.

```sql
CREATE TABLE chunk_changes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  chunk_id BIGINT NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
  object_id VARCHAR(255) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  player_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (chunk_id) REFERENCES chunks(id)
);

-- Índices para queries rápidas
CREATE INDEX idx_chunk_changes_chunk_id ON chunk_changes(chunk_id);
CREATE INDEX idx_chunk_changes_object_id ON chunk_changes(chunk_id, object_id);
CREATE INDEX idx_chunk_changes_player_id ON chunk_changes(player_id);
CREATE INDEX idx_chunk_changes_action_type ON chunk_changes(action_type);
CREATE INDEX idx_chunk_changes_created_at ON chunk_changes(created_at DESC);

-- Índice composto para query padrão
CREATE INDEX idx_chunk_changes_composite ON chunk_changes(chunk_id, created_at DESC);
```

### Tabela: `player_discoveries`

Rastreia descobertas únicas por jogador.

```sql
CREATE TABLE player_discoveries (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chunk_id BIGINT NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
  game_mode VARCHAR(10) NOT NULL,
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent_seconds INT DEFAULT 0,
  resources_collected INT DEFAULT 0,
  actions_performed INT DEFAULT 0,
  discovery_type VARCHAR(50) DEFAULT 'standard',
  biome VARCHAR(50),
  difficulty INT DEFAULT 1,
  
  -- Constraint: cada jogador descobre um chunk uma vez
  UNIQUE(player_id, chunk_id, game_mode),
  
  FOREIGN KEY (chunk_id) REFERENCES chunks(id)
);

-- Índices
CREATE INDEX idx_discoveries_player_id ON player_discoveries(player_id);
CREATE INDEX idx_discoveries_chunk_id ON player_discoveries(chunk_id);
CREATE INDEX idx_discoveries_game_mode ON player_discoveries(game_mode);
CREATE INDEX idx_discoveries_discovered_at ON player_discoveries(discovered_at DESC);
CREATE INDEX idx_discoveries_player_time ON player_discoveries(player_id, discovered_at DESC);
```

### Tabela: `player_chunk_state` (PvE only)

Armazena estado pessoal de chunks para modo PvE.

```sql
CREATE TABLE player_chunk_state (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chunk_id BIGINT NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}',
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: um estado por jogador por chunk
  UNIQUE(player_id, chunk_id),
  
  FOREIGN KEY (chunk_id) REFERENCES chunks(id)
);

-- Índices
CREATE INDEX idx_player_chunk_state_player ON player_chunk_state(player_id);
CREATE INDEX idx_player_chunk_state_chunk ON player_chunk_state(chunk_id);
CREATE INDEX idx_player_chunk_state_modified ON player_chunk_state(last_modified DESC);
```

### Tabela: `player_exploration_stats`

Estatísticas agregadas de exploração.

```sql
CREATE TABLE player_exploration_stats (
  player_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_chunks_discovered INT DEFAULT 0,
  total_resources_collected INT DEFAULT 0,
  total_playtime_seconds BIGINT DEFAULT 0,
  furthest_distance_chunks FLOAT DEFAULT 0,
  rarest_biome_discovered VARCHAR(50),
  last_played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_stats_total_chunks ON player_exploration_stats(total_chunks_discovered DESC);
CREATE INDEX idx_stats_playtime ON player_exploration_stats(total_playtime_seconds DESC);
CREATE INDEX idx_stats_updated_at ON player_exploration_stats(updated_at DESC);
```

---

## 🔍 Estratégia de Indexação

### Por Caso de Uso

#### 1. Buscar Chunk por Coordenadas

```sql
SELECT * FROM chunks 
WHERE chunk_x = $1 AND chunk_y = $2 AND game_mode = $3;

-- Índice: idx_chunks_coords ✓
```

#### 2. Buscar Todas as Mudanças de um Chunk (Recentes Primeiro)

```sql
SELECT * FROM chunk_changes 
WHERE chunk_id = $1 
ORDER BY created_at DESC 
LIMIT 10;

-- Índice: idx_chunk_changes_composite ✓
```

#### 3. Buscar Descrenças de um Jogador

```sql
SELECT * FROM player_discoveries 
WHERE player_id = $1 AND game_mode = $2 
ORDER BY discovered_at DESC;

-- Índice: idx_discoveries_player_time ✓
```

#### 4. Verificar se Jogador já Descobriu um Chunk

```sql
SELECT EXISTS(
  SELECT 1 FROM player_discoveries 
  WHERE player_id = $1 AND chunk_id = $2
);

-- Índice: idx_discoveries_player_id ✓
```

#### 5. Buscar Chunks por Descoberta Recente

```sql
SELECT * FROM chunks 
WHERE discovered_at > NOW() - INTERVAL '7 days'
ORDER BY discovered_at DESC;

-- Índice: idx_chunks_discovered_at ✓
```

---

## 📈 Dicas de Performance

### Particionamento (Futuro)

Para datasets muito grandes, considerar particionamento:

```sql
-- Particionar chunks por game_mode
CREATE TABLE chunks_pve PARTITION OF chunks
  FOR VALUES IN ('pve');

CREATE TABLE chunks_pvp PARTITION OF chunks
  FOR VALUES IN ('pvp');
```

### Materialized Views

Para estatísticas agregadas:

```sql
CREATE MATERIALIZED VIEW chunk_statistics AS
SELECT 
  c.game_mode,
  c.biome,
  COUNT(*) as total_chunks,
  COUNT(DISTINCT cd.player_id) as unique_discoverers,
  AVG(c.procedural_data->>'difficulty')::INT as avg_difficulty
FROM chunks c
LEFT JOIN chunk_changes cd ON c.id = cd.chunk_id
GROUP BY c.game_mode, c.procedural_data->>'biome';

CREATE INDEX idx_chunk_stats_mode ON chunk_statistics(game_mode);
```

### Batch Operations

Para operações em massa, usar transações:

```sql
BEGIN;

-- Inserir múltiplas descobertas
INSERT INTO player_discoveries (player_id, chunk_id, game_mode, discovered_at)
VALUES 
  ($1, $2, $3, NOW()),
  ($1, $4, $3, NOW()),
  ($1, $5, $3, NOW())
ON CONFLICT (player_id, chunk_id, game_mode) DO NOTHING;

-- Atualizar stats
UPDATE player_exploration_stats 
SET total_chunks_discovered = total_chunks_discovered + 3
WHERE player_id = $1;

COMMIT;
```

---

## 🔐 Row Level Security (RLS)

### Policy: Jogadores só acessam seus dados

```sql
-- Tabela: player_chunk_state
ALTER TABLE player_chunk_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY pve_chunk_policy ON player_chunk_state
  FOR ALL
  USING (player_id = auth.uid());

-- Tabela: player_discoveries
ALTER TABLE player_discoveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY discovery_policy ON player_discoveries
  FOR SELECT
  USING (
    player_id = auth.uid() OR 
    game_mode = 'pvp'  -- Descobertas PvP são públicas
  );
```

### Policy: Apenas servidor pode modificar chunks

```sql
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY chunks_server_only ON chunks
  FOR UPDATE
  USING (current_user = 'service_role');
```

---

## 🚀 Query Otimizadas

### Carregar Chunk Completo

```sql
-- Obter chunk + todas as mudanças
SELECT 
  c.id,
  c.chunk_x,
  c.chunk_y,
  c.seed,
  c.procedural_data,
  c.current_state,
  json_agg(
    json_build_object(
      'id', cc.id,
      'object_id', cc.object_id,
      'action', cc.action_type,
      'player', cc.player_id,
      'data', cc.change_data,
      'created_at', cc.created_at
    )
  ) FILTER (WHERE cc.id IS NOT NULL) as changes
FROM chunks c
LEFT JOIN chunk_changes cc ON c.id = cc.chunk_id
WHERE c.chunk_x = $1 AND c.chunk_y = $2 AND c.game_mode = $3
GROUP BY c.id;
```

### Obter Dashboard do Jogador

```sql
-- Estatísticas completas
SELECT 
  u.id,
  u.email,
  pes.total_chunks_discovered,
  pes.total_resources_collected,
  COUNT(DISTINCT CASE WHEN pd.game_mode = 'pve' THEN pd.chunk_id END) as pve_chunks,
  COUNT(DISTINCT CASE WHEN pd.game_mode = 'pvp' THEN pd.chunk_id END) as pvp_chunks,
  MAX(pd.discovered_at) as last_discovery
FROM auth.users u
LEFT JOIN player_exploration_stats pes ON u.id = pes.player_id
LEFT JOIN player_discoveries pd ON u.id = pd.player_id
WHERE u.id = $1
GROUP BY u.id, pes.total_chunks_discovered, pes.total_resources_collected;
```

---

## 📋 Criação de Tabelas (Ordem Recomendada)

```sql
-- 1. Criar tabela base
CREATE TABLE chunks (...);

-- 2. Criar dependentes
CREATE TABLE chunk_changes (...);
CREATE TABLE player_discoveries (...);
CREATE TABLE player_chunk_state (...);
CREATE TABLE player_exploration_stats (...);

-- 3. Criar índices
CREATE INDEX idx_chunks_coords ON chunks(...);
-- ... (todos os índices)

-- 4. Criar políticas RLS
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY chunks_policy ON chunks (...);
-- ... (todas as policies)

-- 5. Criar views materializadas
CREATE MATERIALIZED VIEW chunk_statistics AS (...);
```
