# 🗄️ Análise Completa do Schema do Banco de Dados - Space Crypto Miner

## 📊 Visão Geral

O banco de dados do Space Crypto Miner possui **duas estruturas paralelas**:

### 1️⃣ **Sistema Novo (Completo)** - Tabelas principais do jogo
- `user_profiles` - Perfis unificados (Google + Solana)
- `game_sessions` - Sessões ativas de jogo
- `player_wallet` - Carteira de tokens (SPACE + SOL)
- `player_inventory` - Inventário de recursos
- `player_stats` - Estatísticas gerais
- `ship_nfts` - NFTs de naves
- `crew_members` - Tripulantes disponíveis
- `resource_types` - Tipos de recursos
- `equipment_types` - Tipos de equipamentos
- `discovered_planets` - Planetas descobertos
- `mining_sessions` - Sessões de mineração
- `pvp_battles` - Combates PvP
- `craft_recipes` - Receitas de craft
- `achievements` - Conquistas disponíveis
- E mais...

### 2️⃣ **Sistema Legado (Simplificado)** - Tabelas antigas
- `profiles` - Perfis antigos (FK para auth.users)
- `game_data` - Dados de jogo antigos
- `inventory` - Inventário antigo
- `nft_ships` - NFTs antigas

---

## 🔑 Tabela Central: `user_profiles`

### Estrutura
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    google_email TEXT UNIQUE,
    wallet_address TEXT UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Características
- ✅ **PK**: `id` (UUID v7)
- ✅ **Unique**: `google_email`, `wallet_address`
- ✅ **RLS Habilitado**: Sim
- ✅ **Relacionamentos**: 16 tabelas dependem dela

### Foreign Keys que apontam para `user_profiles.id`:
1. `game_sessions.user_id`
2. `player_wallet.user_id`
3. `player_inventory.user_id`
4. `player_stats.user_id`
5. `player_crew.user_id`
6. `player_equipment.user_id`
7. `player_achievements.user_id`
8. `mining_sessions.user_id`
9. `craft_sessions.user_id`
10. `pvp_battles.attacker_id`, `defender_id`, `winner_id`
11. `pvp_rankings.user_id`
12. `discovered_planets.discovered_by`
13. `token_transactions.user_id`
14. `player_action_logs.user_id`

---

## 🎮 Tabelas de Gameplay

### `game_sessions` - Sessões Ativas
```sql
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY,
    user_id UUID → user_profiles.id,
    session_token TEXT UNIQUE,
    started_at TIMESTAMPTZ,
    last_activity TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    selected_ship_nft_mint TEXT,
    game_mode TEXT CHECK (IN ('pve', 'pvp')),
    current_location_x INTEGER,
    current_location_y INTEGER,
    current_fuel INTEGER,
    current_oxygen INTEGER,
    current_shield INTEGER,
    current_cargo_weight INTEGER
);
```

**Uso**: Armazena estado atual do jogador durante uma sessão de jogo.

---

### `player_wallet` - Carteira de Tokens
```sql
CREATE TABLE player_wallet (
    id UUID PRIMARY KEY,
    user_id UUID → user_profiles.id UNIQUE,
    space_tokens INTEGER DEFAULT 0 CHECK (>= 0),
    sol_tokens NUMERIC DEFAULT 0 CHECK (>= 0),
    updated_at TIMESTAMPTZ
);
```

**Uso**: Saldo de tokens SPACE (in-game) e SOL (blockchain).

---

### `player_inventory` - Inventário de Recursos
```sql
CREATE TABLE player_inventory (
    id UUID PRIMARY KEY,
    user_id UUID → user_profiles.id,
    resource_type_id UUID → resource_types.id,
    quantity INTEGER CHECK (>= 0),
    updated_at TIMESTAMPTZ
);
```

**Uso**: Recursos minerados pelo jogador (Ferro, Cobre, Hidrogênio, etc).

---

### `player_stats` - Estatísticas Gerais
```sql
CREATE TABLE player_stats (
    id UUID PRIMARY KEY,
    user_id UUID → user_profiles.id UNIQUE,
    total_play_time_seconds INTEGER,
    sessions_count INTEGER,
    planets_discovered INTEGER,
    total_resources_mined JSONB,
    total_mining_sessions INTEGER,
    total_tokens_earned INTEGER,
    total_battles INTEGER,
    battles_won INTEGER,
    total_damage_dealt INTEGER,
    total_items_crafted INTEGER,
    successful_crafts INTEGER,
    distance_traveled INTEGER,
    unique_planets_visited INTEGER,
    updated_at TIMESTAMPTZ
);
```

**Uso**: Estatísticas acumuladas do jogador.

---

## 🚀 Tabelas de NFTs e Assets

### `ship_nfts` - NFTs de Naves
```sql
CREATE TABLE ship_nfts (
    id UUID PRIMARY KEY,
    mint_address TEXT UNIQUE,
    owner_wallet TEXT,
    collection_address TEXT,
    name TEXT,
    image_url TEXT,
    metadata_url TEXT,
    rarity TEXT CHECK (IN ('Comum', 'Incomum', 'Raro', 'Épico', 'Lendário')),
    speed INTEGER CHECK (100-500),
    cargo_capacity INTEGER CHECK (50-200),
    max_fuel INTEGER CHECK (100-300),
    max_oxygen INTEGER CHECK (100-300),
    max_shield INTEGER CHECK (100-500),
    model_name TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Uso**: Dados de NFTs de naves da blockchain Solana.

---

### `crew_members` - Tripulantes Disponíveis
```sql
CREATE TABLE crew_members (
    id UUID PRIMARY KEY,
    name TEXT UNIQUE,
    specialization TEXT CHECK (IN ('Piloto', 'Engenheiro', 'Navegador', 'Médico', 'Mercador')),
    rarity TEXT,
    speed_bonus INTEGER,
    cargo_bonus INTEGER,
    fuel_efficiency_bonus INTEGER,
    oxygen_efficiency_bonus INTEGER,
    shield_bonus INTEGER,
    mining_bonus INTEGER,
    combat_bonus INTEGER,
    description TEXT,
    image_url TEXT,
    hire_cost_tokens INTEGER CHECK (> 0),
    created_at TIMESTAMPTZ
);
```

**Uso**: Catálogo de tripulantes que podem ser contratados.

---

### `resource_types` - Tipos de Recursos
```sql
CREATE TABLE resource_types (
    id UUID PRIMARY KEY,
    name TEXT UNIQUE,
    category TEXT CHECK (IN ('Metal', 'Combustível', 'Oxigênio', 'Projétil', 'Especial', 'Tripulante', 'Equipamento')),
    rarity TEXT CHECK (IN ('Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Mítico')),
    weight_per_unit INTEGER CHECK (> 0),
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMPTZ
);
```

**Uso**: Definição de todos os recursos disponíveis no jogo.

---

## 🌍 Tabelas de Exploração

### `discovered_planets` - Planetas Descobertos
```sql
CREATE TABLE discovered_planets (
    id UUID PRIMARY KEY,
    planet_id TEXT UNIQUE,
    name TEXT,
    planet_type TEXT CHECK (IN ('Rochoso', 'Gasoso', 'Gelado', 'Deserto', 'Tóxico', 'Cristalino')),
    rarity TEXT,
    coordinate_x INTEGER,
    coordinate_y INTEGER,
    available_resources JSONB DEFAULT '{}',
    mining_difficulty INTEGER CHECK (1-10),
    description TEXT,
    image_url TEXT,
    discovered_by UUID → user_profiles.id,
    discovered_at TIMESTAMPTZ
);
```

**Uso**: Planetas que foram descobertos por jogadores.

---

### `mining_sessions` - Sessões de Mineração
```sql
CREATE TABLE mining_sessions (
    id UUID PRIMARY KEY,
    user_id UUID → user_profiles.id,
    planet_id UUID → discovered_planets.id,
    session_id UUID → game_sessions.id,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    resources_mined JSONB DEFAULT '{}',
    total_weight_mined INTEGER,
    tokens_earned INTEGER,
    mining_efficiency NUMERIC DEFAULT 1.0,
    is_pvp_session BOOLEAN DEFAULT FALSE
);
```

**Uso**: Histórico de minerações realizadas.

---

## ⚔️ Tabelas de PvP

### `pvp_battles` - Combates PvP
```sql
CREATE TABLE pvp_battles (
    id UUID PRIMARY KEY,
    attacker_id UUID → user_profiles.id,
    defender_id UUID → user_profiles.id,
    planet_id UUID → discovered_planets.id,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    winner_id UUID → user_profiles.id,
    battle_result TEXT CHECK (IN ('attacker_win', 'defender_win', 'draw', 'abandoned')),
    contested_resources JSONB DEFAULT '{}',
    resources_won JSONB DEFAULT '{}',
    tokens_won INTEGER,
    attacker_damage_dealt INTEGER,
    defender_damage_dealt INTEGER,
    attacker_ship_destroyed BOOLEAN,
    defender_ship_destroyed BOOLEAN
);
```

**Uso**: Histórico de combates entre jogadores.

---

### `pvp_rankings` - Rankings PvP
```sql
CREATE TABLE pvp_rankings (
    id UUID PRIMARY KEY,
    user_id UUID → user_profiles.id,
    battles_won INTEGER,
    battles_lost INTEGER,
    battles_draw INTEGER,
    total_damage_dealt INTEGER,
    total_damage_taken INTEGER,
    current_rank INTEGER,
    current_rating INTEGER DEFAULT 1000,
    highest_rating INTEGER DEFAULT 1000,
    season_id TEXT,
    updated_at TIMESTAMPTZ
);
```

**Uso**: Ranking e estatísticas de PvP por temporada.

---

## 🛠️ Tabelas de Craft

### `craft_recipes` - Receitas de Craft
```sql
CREATE TABLE craft_recipes (
    id UUID PRIMARY KEY,
    result_item_type TEXT,
    result_item_id UUID,
    result_quantity INTEGER DEFAULT 1,
    required_resources JSONB DEFAULT '{}',
    required_equipment JSONB DEFAULT '{}',
    required_tokens INTEGER DEFAULT 0,
    name TEXT,
    description TEXT,
    difficulty_level INTEGER CHECK (1-10),
    craft_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ
);
```

**Uso**: Definição de receitas para craftar itens.

---

### `craft_sessions` - Sessões de Craft
```sql
CREATE TABLE craft_sessions (
    id UUID PRIMARY KEY,
    user_id UUID → user_profiles.id,
    recipe_id UUID → craft_recipes.id,
    session_id UUID → game_sessions.id,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    status TEXT CHECK (IN ('in_progress', 'completed', 'failed', 'cancelled')),
    success BOOLEAN DEFAULT FALSE,
    items_created JSONB DEFAULT '{}',
    resources_consumed JSONB DEFAULT '{}'
);
```

**Uso**: Histórico de crafts realizados.

---

## 🏆 Tabelas de Achievements

### `achievements` - Conquistas Disponíveis
```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY,
    name TEXT UNIQUE,
    description TEXT,
    category TEXT CHECK (IN ('Exploração', 'Mineração', 'Combate', 'Craft', 'Social', 'Economia')),
    rarity TEXT,
    criteria JSONB DEFAULT '{}',
    reward_tokens INTEGER DEFAULT 0,
    reward_resources JSONB DEFAULT '{}',
    icon_url TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ
);
```

**Uso**: Catálogo de conquistas disponíveis.

---

### `player_achievements` - Conquistas Desbloqueadas
```sql
CREATE TABLE player_achievements (
    id UUID PRIMARY KEY,
    user_id UUID → user_profiles.id,
    achievement_id UUID → achievements.id,
    unlocked_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Uso**: Conquistas desbloqueadas por cada jogador.

---

## 💰 Tabelas de Economia

### `token_transactions` - Histórico de Transações
```sql
CREATE TABLE token_transactions (
    id UUID PRIMARY KEY,
    user_id UUID → user_profiles.id,
    transaction_type TEXT CHECK (IN ('earn', 'spend', 'convert', 'royalty')),
    amount INTEGER,
    currency TEXT CHECK (IN ('SPACE', 'SOL')),
    description TEXT,
    source TEXT,
    metadata JSONB,
    blockchain_tx_hash TEXT,
    blockchain_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ
);
```

**Uso**: Auditoria de todas as transações de tokens.

---

## 📝 Tabelas de Logs

### `player_action_logs` - Logs de Ações
```sql
CREATE TABLE player_action_logs (
    id UUID PRIMARY KEY,
    user_id UUID → user_profiles.id,
    session_id UUID → game_sessions.id,
    action_type TEXT,
    action_data JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    location_data JSONB
);
```

**Uso**: Auditoria de ações dos jogadores.

---

### `system_logs` - Logs do Sistema
```sql
CREATE TABLE system_logs (
    id UUID PRIMARY KEY,
    log_level TEXT CHECK (IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')),
    component TEXT,
    message TEXT,
    data JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

**Uso**: Logs do sistema para debugging.

---

## 🔒 Row Level Security (RLS)

### Tabelas com RLS Habilitado ✅
- `user_profiles`
- `game_sessions`
- `player_wallet`
- `player_inventory`
- `player_stats`
- `player_crew`
- `player_equipment`
- `player_achievements`
- `mining_sessions`
- `craft_sessions`
- `pvp_battles`
- `pvp_rankings`
- `player_action_logs`

### Tabelas Públicas (Sem RLS) 🌐
- `ship_nfts` - Dados públicos de NFTs
- `crew_members` - Catálogo público
- `resource_types` - Tipos públicos
- `equipment_types` - Tipos públicos
- `discovered_planets` - Planetas públicos
- `craft_recipes` - Receitas públicas
- `achievements` - Conquistas públicas
- `token_transactions` - Transações públicas
- `system_logs` - Logs do sistema

---

## ⚠️ Tabelas Legadas (Sistema Antigo)

### `profiles` - Perfis Antigos
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY → auth.users.id,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Status**: ⚠️ **Legado** - Substituído por `user_profiles`

---

### `game_data` - Dados de Jogo Antigos
```sql
CREATE TABLE game_data (
    id UUID PRIMARY KEY,
    user_id UUID → auth.users.id UNIQUE,
    level INTEGER DEFAULT 0,
    experience NUMERIC DEFAULT 0,
    coins NUMERIC DEFAULT 0,
    win_count INTEGER DEFAULT 0,
    last_played TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Status**: ⚠️ **Legado** - Substituído por `player_stats` e `player_wallet`

---

### `inventory` - Inventário Antigo
```sql
CREATE TABLE inventory (
    id UUID PRIMARY KEY,
    user_id UUID → auth.users.id,
    item_id TEXT,
    quantity INTEGER DEFAULT 1,
    acquired_at TIMESTAMPTZ
);
```

**Status**: ⚠️ **Legado** - Substituído por `player_inventory`

---

### `nft_ships` - NFTs Antigas
```sql
CREATE TABLE nft_ships (
    id UUID PRIMARY KEY,
    user_id UUID → auth.users.id,
    name TEXT,
    rarity TEXT,
    contract_address TEXT,
    token_id TEXT,
    created_at TIMESTAMPTZ
);
```

**Status**: ⚠️ **Legado** - Substituído por `ship_nfts`

---

## 🔗 Diagrama de Relacionamentos

```
user_profiles (CENTRAL)
├── game_sessions
│   ├── mining_sessions
│   ├── craft_sessions
│   └── player_action_logs
├── player_wallet (1:1)
├── player_stats (1:1)
├── player_inventory (1:N)
│   └── resource_types
├── player_crew (1:N)
│   └── crew_members
├── player_equipment (1:N)
│   └── equipment_types
├── player_achievements (1:N)
│   └── achievements
├── mining_sessions (1:N)
│   └── discovered_planets
├── craft_sessions (1:N)
│   └── craft_recipes
├── pvp_battles (1:N)
│   └── discovered_planets
├── pvp_rankings (1:1)
├── token_transactions (1:N)
└── discovered_planets (1:N)
```

---

## 📊 Estado Atual do Banco

### Dados Existentes
- ✅ `user_profiles`: 1 registro (seu perfil)
- ✅ `player_wallet`: 1 registro (sua carteira)
- ✅ `profiles`: 1 registro (legado)
- ✅ `game_data`: 1 registro (legado)
- ✅ `inventory`: 3 registros (legado)

### Tabelas Vazias (Aguardando Gameplay)
- ⏳ `game_sessions`
- ⏳ `player_inventory`
- ⏳ `player_stats`
- ⏳ `mining_sessions`
- ⏳ `craft_sessions`
- ⏳ `pvp_battles`
- ⏳ `discovered_planets`
- ⏳ `ship_nfts`
- ⏳ `crew_members`
- ⏳ `resource_types`
- ⏳ `equipment_types`
- ⏳ `achievements`

---

## 🎯 Recomendações para o Dashboard

### Dados Disponíveis Agora
1. **Perfil**: `user_profiles.display_name`, `google_email`, `avatar_url`
2. **Carteira**: `player_wallet.space_tokens`, `sol_tokens`

### Dados que Precisam de Seed
1. **Estatísticas**: Criar registro em `player_stats`
2. **Inventário**: Popular `resource_types` e `player_inventory`
3. **Achievements**: Popular `achievements` e `player_achievements`
4. **NFTs**: Popular `ship_nfts` (se houver)

### Dados que Virão do Gameplay
1. **Sessões**: `game_sessions` (criadas ao jogar)
2. **Mineração**: `mining_sessions` (criadas ao minerar)
3. **Combates**: `pvp_battles` (criados ao lutar)
4. **Craft**: `craft_sessions` (criados ao craftar)

---

## 🚀 Próximos Passos

1. ✅ **Corrigir DashboardPage** - Usar tabelas corretas
2. ⏳ **Popular Dados Iniciais** - Seed de recursos, achievements, etc
3. ⏳ **Criar player_stats** - Estatísticas iniciais para o usuário
4. ⏳ **Integrar com Gameplay** - Criar sessões ao jogar
5. ⏳ **Migrar Dados Legados** - Mover de `profiles`/`game_data` para novo sistema

---

**Documento gerado em:** 19 de Outubro de 2025  
**Versão:** 1.0  
**Status:** ✅ Análise Completa

