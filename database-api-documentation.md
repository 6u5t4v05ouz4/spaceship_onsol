# 🗄️ API do Banco de Dados - Space Crypto Miner

## 📋 Visão Geral

Este documento descreve a API completa do banco de dados do Space Crypto Miner, incluindo todas as tabelas, funções, políticas de segurança e exemplos de uso.

## 🏗️ Arquitetura do Banco de Dados

### Tecnologias Utilizadas
- **PostgreSQL** - Banco de dados principal
- **Supabase** - Plataforma de backend-as-a-service
- **Row Level Security (RLS)** - Controle de acesso granular
- **JSONB** - Armazenamento de dados estruturados
- **UUID v7** - Identificadores únicos baseados em timestamp
- **Triggers** - Automação de processos

### UUID v7 (Timestamp-based)

O banco de dados utiliza **UUID v7** em vez de UUID v4 tradicional para melhorar performance e ordenação:

**Vantagens do UUID v7:**
- **Ordenação Temporal**: UUIDs são ordenados cronologicamente
- **Melhor Performance**: Índices B-tree mais eficientes
- **Debugging**: Timestamp visível no UUID
- **Compatibilidade**: Mantém formato UUID padrão

**Estrutura do UUID v7:**
```
[48 bits timestamp][12 bits random][4 bits version][2 bits variant][62 bits random]
```

**Função de Geração:**
```sql
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS UUID AS $$
-- Implementação completa no arquivo database-schema.sql
$$ LANGUAGE plpgsql;
```

### Estrutura Geral
```
Space Crypto Miner Database
├── Autenticação e Perfis
├── NFTs e Naves
├── Recursos e Inventário
├── Economia e Tokens
├── Mapa e Exploração
├── Combate e PvP
├── Craft e Receitas
├── Estatísticas e Achievements
└── Logs e Auditoria
```

## 📊 Tabelas Principais

### 1. Autenticação e Perfis

#### `user_profiles`
Perfis unificados de usuários que podem conectar Google e/ou carteira Solana.

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    google_email TEXT UNIQUE,
    wallet_address TEXT UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `id` - Identificador único do perfil
- `google_email` - Email do Google (único)
- `wallet_address` - Endereço da carteira Solana (único)
- `display_name` - Nome de exibição do usuário
- `avatar_url` - URL do avatar do usuário
- `created_at` - Data de criação
- `updated_at` - Data da última atualização

**Constraints:**
- Pelo menos um dos campos `google_email` ou `wallet_address` deve ser preenchido
- Validação de formato de email
- Validação de comprimento da carteira

#### `game_sessions`
Sessões ativas de jogo com estado atual do jogador.

```sql
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    selected_ship_nft_mint TEXT,
    game_mode TEXT CHECK (game_mode IN ('pve', 'pvp')) DEFAULT 'pve',
    current_location_x INTEGER DEFAULT 0,
    current_location_y INTEGER DEFAULT 0,
    current_fuel INTEGER DEFAULT 100,
    current_oxygen INTEGER DEFAULT 100,
    current_shield INTEGER DEFAULT 100,
    current_cargo_weight INTEGER DEFAULT 0
);
```

### 2. NFTs e Naves

#### `ship_nfts`
NFTs de naves coletadas pelos jogadores.

```sql
CREATE TABLE ship_nfts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mint_address TEXT UNIQUE NOT NULL,
    owner_wallet TEXT NOT NULL,
    collection_address TEXT NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    metadata_url TEXT NOT NULL,
    rarity TEXT CHECK (rarity IN ('Comum', 'Incomum', 'Raro', 'Épico', 'Lendário')) NOT NULL,
    speed INTEGER NOT NULL CHECK (speed >= 100 AND speed <= 500),
    cargo_capacity INTEGER NOT NULL CHECK (cargo_capacity >= 50 AND cargo_capacity <= 200),
    max_fuel INTEGER NOT NULL CHECK (max_fuel >= 100 AND max_fuel <= 300),
    max_oxygen INTEGER NOT NULL CHECK (max_oxygen >= 100 AND max_oxygen <= 300),
    max_shield INTEGER NOT NULL CHECK (max_shield >= 100 AND max_shield <= 500),
    model_name TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `crew_members`
Tipos de tripulantes disponíveis para contratação.

```sql
CREATE TABLE crew_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    specialization TEXT CHECK (specialization IN ('Piloto', 'Engenheiro', 'Navegador', 'Médico', 'Mercador')) NOT NULL,
    rarity TEXT CHECK (rarity IN ('Comum', 'Incomum', 'Raro', 'Épico', 'Lendário')) NOT NULL,
    speed_bonus INTEGER DEFAULT 0,
    cargo_bonus INTEGER DEFAULT 0,
    fuel_efficiency_bonus INTEGER DEFAULT 0,
    oxygen_efficiency_bonus INTEGER DEFAULT 0,
    shield_bonus INTEGER DEFAULT 0,
    mining_bonus INTEGER DEFAULT 0,
    combat_bonus INTEGER DEFAULT 0,
    description TEXT,
    image_url TEXT,
    hire_cost_tokens INTEGER NOT NULL CHECK (hire_cost_tokens > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Recursos e Inventário

#### `resource_types`
Tipos de recursos disponíveis no jogo.

```sql
CREATE TABLE resource_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT CHECK (category IN ('Metal', 'Combustível', 'Oxigênio', 'Projétil', 'Especial', 'Tripulante', 'Equipamento')) NOT NULL,
    rarity TEXT CHECK (rarity IN ('Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Mítico')) NOT NULL,
    weight_per_unit INTEGER NOT NULL CHECK (weight_per_unit > 0),
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `player_inventory`
Inventário de recursos dos jogadores.

```sql
CREATE TABLE player_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    resource_type_id UUID REFERENCES resource_types(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, resource_type_id)
);
```

### 4. Economia e Tokens

#### `player_wallet`
Saldo atual de tokens dos jogadores.

```sql
CREATE TABLE player_wallet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    space_tokens INTEGER DEFAULT 0 CHECK (space_tokens >= 0),
    sol_tokens DECIMAL(18, 9) DEFAULT 0 CHECK (sol_tokens >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

#### `token_transactions`
Histórico de transações de tokens.

```sql
CREATE TABLE token_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    transaction_type TEXT CHECK (transaction_type IN ('earn', 'spend', 'convert', 'royalty')) NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT CHECK (currency IN ('SPACE', 'SOL')) NOT NULL,
    description TEXT,
    source TEXT,
    metadata JSONB,
    blockchain_tx_hash TEXT,
    blockchain_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Mapa e Exploração

#### `discovered_planets`
Planetas descobertos pelos jogadores.

```sql
CREATE TABLE discovered_planets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planet_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    planet_type TEXT CHECK (planet_type IN ('Rochoso', 'Gasoso', 'Gelado', 'Deserto', 'Tóxico', 'Cristalino')) NOT NULL,
    rarity TEXT CHECK (rarity IN ('Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Mítico')) NOT NULL,
    coordinate_x INTEGER NOT NULL,
    coordinate_y INTEGER NOT NULL,
    available_resources JSONB NOT NULL DEFAULT '{}',
    mining_difficulty INTEGER CHECK (mining_difficulty >= 1 AND mining_difficulty <= 10) DEFAULT 5,
    description TEXT,
    image_url TEXT,
    discovered_by UUID REFERENCES user_profiles(id),
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(coordinate_x, coordinate_y)
);
```

#### `mining_sessions`
Sessões de mineração dos jogadores.

```sql
CREATE TABLE mining_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    planet_id UUID REFERENCES discovered_planets(id) ON DELETE CASCADE,
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    resources_mined JSONB DEFAULT '{}',
    total_weight_mined INTEGER DEFAULT 0,
    tokens_earned INTEGER DEFAULT 0,
    mining_efficiency DECIMAL(5, 2) DEFAULT 1.0,
    is_pvp_session BOOLEAN DEFAULT FALSE
);
```

### 6. Combate e PvP

#### `pvp_battles`
Combates PvP entre jogadores.

```sql
CREATE TABLE pvp_battles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attacker_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    defender_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    planet_id UUID REFERENCES discovered_planets(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    winner_id UUID REFERENCES user_profiles(id),
    battle_result TEXT CHECK (battle_result IN ('attacker_win', 'defender_win', 'draw', 'abandoned')) NOT NULL,
    contested_resources JSONB DEFAULT '{}',
    resources_won JSONB DEFAULT '{}',
    tokens_won INTEGER DEFAULT 0,
    attacker_damage_dealt INTEGER DEFAULT 0,
    defender_damage_dealt INTEGER DEFAULT 0,
    attacker_ship_destroyed BOOLEAN DEFAULT FALSE,
    defender_ship_destroyed BOOLEAN DEFAULT FALSE
);
```

### 7. Craft e Receitas

#### `craft_recipes`
Receitas de craft disponíveis.

```sql
CREATE TABLE craft_recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    result_item_type TEXT NOT NULL,
    result_item_id UUID NOT NULL,
    result_quantity INTEGER DEFAULT 1 CHECK (result_quantity > 0),
    required_resources JSONB NOT NULL DEFAULT '{}',
    required_equipment JSONB DEFAULT '{}',
    required_tokens INTEGER DEFAULT 0 CHECK (required_tokens >= 0),
    name TEXT NOT NULL,
    description TEXT,
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 10) DEFAULT 1,
    craft_time_seconds INTEGER DEFAULT 0 CHECK (craft_time_seconds >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `craft_sessions`
Sessões de craft dos jogadores.

```sql
CREATE TABLE craft_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES craft_recipes(id) ON DELETE CASCADE,
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('in_progress', 'completed', 'failed', 'cancelled')) DEFAULT 'in_progress',
    success BOOLEAN DEFAULT FALSE,
    items_created JSONB DEFAULT '{}',
    resources_consumed JSONB DEFAULT '{}'
);
```

### 8. Estatísticas e Achievements

#### `achievements`
Achievements disponíveis no jogo.

```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category TEXT CHECK (category IN ('Exploração', 'Mineração', 'Combate', 'Craft', 'Social', 'Economia')) NOT NULL,
    rarity TEXT CHECK (rarity IN ('Comum', 'Incomum', 'Raro', 'Épico', 'Lendário')) NOT NULL,
    criteria JSONB NOT NULL DEFAULT '{}',
    reward_tokens INTEGER DEFAULT 0 CHECK (reward_tokens >= 0),
    reward_resources JSONB DEFAULT '{}',
    icon_url TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `player_stats`
Estatísticas gerais dos jogadores.

```sql
CREATE TABLE player_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    total_play_time_seconds INTEGER DEFAULT 0,
    sessions_count INTEGER DEFAULT 0,
    planets_discovered INTEGER DEFAULT 0,
    total_resources_mined JSONB DEFAULT '{}',
    total_mining_sessions INTEGER DEFAULT 0,
    total_tokens_earned INTEGER DEFAULT 0,
    total_battles INTEGER DEFAULT 0,
    battles_won INTEGER DEFAULT 0,
    total_damage_dealt INTEGER DEFAULT 0,
    total_items_crafted INTEGER DEFAULT 0,
    successful_crafts INTEGER DEFAULT 0,
    distance_traveled INTEGER DEFAULT 0,
    unique_planets_visited INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

## 🔧 Funções Principais

### 1. Autenticação e Perfis

#### `create_or_update_user_profile()`
Cria ou atualiza perfil de usuário.

```sql
CREATE OR REPLACE FUNCTION create_or_update_user_profile(
    p_google_email TEXT DEFAULT NULL,
    p_wallet_address TEXT DEFAULT NULL,
    p_display_name TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL
)
RETURNS TABLE (
    profile_id UUID,
    created BOOLEAN,
    message TEXT
) AS $$
-- Implementação da função
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Parâmetros:**
- `p_google_email` - Email do Google (opcional)
- `p_wallet_address` - Endereço da carteira (opcional)
- `p_display_name` - Nome de exibição (opcional)
- `p_avatar_url` - URL do avatar (opcional)

**Retorno:**
- `profile_id` - ID do perfil criado/atualizado
- `created` - Se foi criado novo perfil
- `message` - Mensagem de status

**Exemplo de uso:**
```sql
SELECT * FROM create_or_update_user_profile(
    'user@gmail.com',
    'ABC123...',
    'Nome do Usuário',
    'https://avatar.url'
);
```

#### `validate_account_linking()`
Valida vinculação de contas.

```sql
CREATE OR REPLACE FUNCTION validate_account_linking(
    p_google_email TEXT DEFAULT NULL,
    p_wallet_address TEXT DEFAULT NULL
)
RETURNS TABLE (
    valid BOOLEAN,
    error_message TEXT
) AS $$
-- Implementação da função
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Sessões de Jogo

#### `start_game_session()`
Inicia nova sessão de jogo.

```sql
CREATE OR REPLACE FUNCTION start_game_session(
    p_user_id UUID,
    p_selected_ship_nft_mint TEXT DEFAULT NULL,
    p_game_mode TEXT DEFAULT 'pve'
)
RETURNS TABLE (
    session_id UUID,
    session_token TEXT
) AS $$
-- Implementação da função
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `end_game_session()`
Finaliza sessão de jogo.

```sql
CREATE OR REPLACE FUNCTION end_game_session(
    p_session_id UUID
)
RETURNS BOOLEAN AS $$
-- Implementação da função
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Inventário e Recursos

#### `add_resources_to_inventory()`
Adiciona recursos ao inventário.

```sql
CREATE OR REPLACE FUNCTION add_resources_to_inventory(
    p_user_id UUID,
    p_resources JSONB
)
RETURNS BOOLEAN AS $$
-- Implementação da função
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Exemplo de uso:**
```sql
SELECT add_resources_to_inventory(
    'user-uuid',
    '{"Ferro": 50, "Cobre": 25, "Hidrogênio": 30}'::JSONB
);
```

#### `remove_resources_from_inventory()`
Remove recursos do inventário.

```sql
CREATE OR REPLACE FUNCTION remove_resources_from_inventory(
    p_user_id UUID,
    p_resources JSONB
)
RETURNS BOOLEAN AS $$
-- Implementação da função
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. Economia e Tokens

#### `add_tokens_to_wallet()`
Adiciona tokens à carteira.

```sql
CREATE OR REPLACE FUNCTION add_tokens_to_wallet(
    p_user_id UUID,
    p_space_tokens INTEGER DEFAULT 0,
    p_sol_tokens DECIMAL DEFAULT 0,
    p_transaction_type TEXT DEFAULT 'earn',
    p_description TEXT DEFAULT NULL,
    p_source TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
-- Implementação da função
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `spend_tokens_from_wallet()`
Gasta tokens da carteira.

```sql
CREATE OR REPLACE FUNCTION spend_tokens_from_wallet(
    p_user_id UUID,
    p_space_tokens INTEGER DEFAULT 0,
    p_sol_tokens DECIMAL DEFAULT 0,
    p_description TEXT DEFAULT NULL,
    p_source TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
-- Implementação da função
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5. Mineração

#### `start_mining_session()`
Inicia sessão de mineração.

```sql
CREATE OR REPLACE FUNCTION start_mining_session(
    p_user_id UUID,
    p_planet_id UUID,
    p_session_id UUID
)
RETURNS UUID AS $$
-- Implementação da função
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `end_mining_session()`
Finaliza sessão de mineração.

```sql
CREATE OR REPLACE FUNCTION end_mining_session(
    p_mining_session_id UUID,
    p_resources_mined JSONB,
    p_tokens_earned INTEGER DEFAULT 0
)
RETURNS BOOLEAN AS $$
-- Implementação da função
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 6. Craft

#### `can_craft_item()`
Verifica se jogador pode craftar.

```sql
CREATE OR REPLACE FUNCTION can_craft_item(
    p_user_id UUID,
    p_recipe_id UUID
)
RETURNS TABLE (
    can_craft BOOLEAN,
    missing_resources JSONB,
    missing_tokens INTEGER
) AS $$
-- Implementação da função
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `execute_craft()`
Executa craft de item.

```sql
CREATE OR REPLACE FUNCTION execute_craft(
    p_user_id UUID,
    p_recipe_id UUID,
    p_session_id UUID
)
RETURNS UUID AS $$
-- Implementação da função
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 7. Estatísticas

#### `update_player_stats()`
Atualiza estatísticas do jogador.

```sql
CREATE OR REPLACE FUNCTION update_player_stats(
    p_user_id UUID,
    p_stats_update JSONB
)
RETURNS BOOLEAN AS $$
-- Implementação da função
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🔒 Políticas de Segurança (RLS)

### Princípios de Segurança

1. **Isolamento de Dados**: Usuários só podem acessar seus próprios dados
2. **Validação de Propriedade**: Verificação de ownership em todas as operações
3. **Auditoria Completa**: Log de todas as ações importantes
4. **Sanitização**: Validação de entrada em todas as funções

### Políticas Implementadas

#### Tabelas com RLS Habilitado
- `user_profiles` - Perfis de usuários
- `game_sessions` - Sessões de jogo
- `player_crew` - Tripulação dos jogadores
- `player_inventory` - Inventário dos jogadores
- `player_equipment` - Equipamentos dos jogadores
- `player_wallet` - Carteira dos jogadores
- `mining_sessions` - Sessões de mineração
- `craft_sessions` - Sessões de craft
- `pvp_battles` - Combates PvP
- `player_achievements` - Achievements dos jogadores
- `player_stats` - Estatísticas dos jogadores
- `player_action_logs` - Logs de ações

#### Tabelas Públicas (Sem RLS)
- `ship_nfts` - Dados públicos de NFTs
- `crew_members` - Catálogo público de tripulantes
- `resource_types` - Tipos de recursos públicos
- `equipment_types` - Tipos de equipamentos públicos
- `discovered_planets` - Planetas descobertos
- `craft_recipes` - Receitas públicas
- `achievements` - Achievements públicos
- `token_transactions` - Transações públicas
- `pvp_rankings` - Rankings públicos
- `system_logs` - Logs do sistema

### Exemplo de Política RLS

```sql
-- Política para SELECT em user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (
        google_email = auth.jwt() ->> 'email' OR
        wallet_address = current_setting('app.current_wallet_address', true)
    );

-- Política para INSERT em user_profiles
CREATE POLICY "Users can create own profile" ON user_profiles
    FOR INSERT WITH CHECK (
        google_email = auth.jwt() ->> 'email' OR
        wallet_address = current_setting('app.current_wallet_address', true)
    );
```

## 📈 Índices de Performance

### Índices Principais

```sql
-- Índices para user_profiles
CREATE INDEX idx_user_profiles_email ON user_profiles(google_email);
CREATE INDEX idx_user_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);

-- Índices para game_sessions
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_active ON game_sessions(is_active);
CREATE INDEX idx_game_sessions_last_activity ON game_sessions(last_activity);

-- Índices para ship_nfts
CREATE INDEX idx_ship_nfts_owner ON ship_nfts(owner_wallet);
CREATE INDEX idx_ship_nfts_rarity ON ship_nfts(rarity);
CREATE INDEX idx_ship_nfts_collection ON ship_nfts(collection_address);

-- Índices para player_inventory
CREATE INDEX idx_player_inventory_user_id ON player_inventory(user_id);
CREATE INDEX idx_player_inventory_resource ON player_inventory(resource_type_id);

-- Índices para discovered_planets
CREATE INDEX idx_discovered_planets_coordinates ON discovered_planets(coordinate_x, coordinate_y);
CREATE INDEX idx_discovered_planets_rarity ON discovered_planets(rarity);
CREATE INDEX idx_discovered_planets_discovered_by ON discovered_planets(discovered_by);

-- Índices para mining_sessions
CREATE INDEX idx_mining_sessions_user_id ON mining_sessions(user_id);
CREATE INDEX idx_mining_sessions_planet_id ON mining_sessions(planet_id);
CREATE INDEX idx_mining_sessions_started_at ON mining_sessions(started_at);

-- Índices para pvp_battles
CREATE INDEX idx_pvp_battles_attacker ON pvp_battles(attacker_id);
CREATE INDEX idx_pvp_battles_defender ON pvp_battles(defender_id);
CREATE INDEX idx_pvp_battles_started_at ON pvp_battles(started_at);

-- Índices para token_transactions
CREATE INDEX idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX idx_token_transactions_type ON token_transactions(transaction_type);
CREATE INDEX idx_token_transactions_created_at ON token_transactions(created_at);

-- Índices para player_action_logs
CREATE INDEX idx_player_action_logs_user_id ON player_action_logs(user_id);
CREATE INDEX idx_player_action_logs_timestamp ON player_action_logs(timestamp);
CREATE INDEX idx_player_action_logs_action_type ON player_action_logs(action_type);
```

## 🔄 Triggers Automáticos

### Triggers Implementados

#### 1. Atualização de `updated_at`
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicado em todas as tabelas com updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 2. Atualização de Estatísticas
```sql
-- Trigger para atualizar estatísticas quando sessão termina
CREATE TRIGGER trigger_update_stats_on_session_end
    AFTER UPDATE ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_stats_on_session_end();

-- Trigger para atualizar estatísticas quando mineração termina
CREATE TRIGGER trigger_update_stats_on_mining_end
    AFTER UPDATE ON mining_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_stats_on_mining_end();

-- Trigger para atualizar estatísticas quando craft termina
CREATE TRIGGER trigger_update_stats_on_craft_end
    AFTER UPDATE ON craft_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_stats_on_craft_end();
```

## 🧹 Funções de Manutenção

### Limpeza de Dados Antigos

#### `cleanup_old_sessions()`
```sql
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Deletar sessões inativas há mais de 7 dias
    DELETE FROM game_sessions
    WHERE is_active = FALSE AND ended_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Log da limpeza
    PERFORM log_system_event(
        'INFO', 
        'cleanup', 
        'Sessões antigas removidas', 
        jsonb_build_object('deleted_count', v_deleted_count)
    );
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `cleanup_old_logs()`
```sql
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Deletar logs de ação antigos (mais de 30 dias)
    DELETE FROM player_action_logs
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Deletar logs do sistema antigos (mais de 90 dias)
    DELETE FROM system_logs
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS v_deleted_count = v_deleted_count + ROW_COUNT;
    
    -- Log da limpeza
    PERFORM log_system_event(
        'INFO', 
        'cleanup', 
        'Logs antigos removidos', 
        jsonb_build_object('deleted_count', v_deleted_count)
    );
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📊 Dados Iniciais

### Recursos Disponíveis
- **Metais**: Ferro, Cobre, Alumínio, Titânio, Platina, Cristal de Energia
- **Combustível**: Hidrogênio, Deutério, Antimatéria, Cristal de Poder
- **Oxigênio**: Oxigênio Líquido, Oxigênio Comprimido, Cristal de Ar
- **Projéteis**: Mísseis Básicos, Mísseis Guiados, Mísseis Energéticos, Torpedos de Plasma
- **Recursos Especiais**: Cristal Espacial, Essência Estelar, Fragmento de Realidade

### Equipamentos Disponíveis
- **Armas**: Canhão Laser, Canhão de Plasma, Torpedeiro Quântico, Canhão de Antimatéria, Destruidor Estelar
- **Escudos**: Escudo Energético, Escudo de Plasma, Escudo Quântico, Escudo de Antimatéria, Escudo Estelar
- **Motores**: Motor Iônico, Motor de Plasma, Motor Quântico, Motor de Antimatéria, Motor Estelar
- **Sensores**: Sensor Básico, Sensor Avançado, Sensor Quântico, Sensor de Antimatéria, Sensor Estelar
- **Sistemas de Carga**: Compartimento Básico, Compartimento Expandido, Compartimento Quântico, Compartimento de Antimatéria, Compartimento Estelar
- **Sistemas de Sobrevivência**: Gerador de Oxigênio, Purificador Avançado, Sistema Quântico, Sistema de Antimatéria, Sistema Estelar

### Tripulantes Disponíveis
- **Pilotos**: Piloto Novato, Piloto Experiente, Piloto Elite, Piloto Lendário, Piloto Estelar
- **Engenheiros**: Engenheiro Júnior, Engenheiro Sênior, Engenheiro Chefe, Engenheiro Mestre, Engenheiro Estelar
- **Navegadores**: Navegador Iniciante, Navegador Experiente, Navegador Elite, Navegador Lendário, Navegador Estelar
- **Médicos**: Médico Júnior, Médico Sênior, Médico Chefe, Médico Mestre, Médico Estelar
- **Mercadores**: Mercador Iniciante, Mercador Experiente, Mercador Elite, Mercador Lendário, Mercador Estelar

### Achievements Disponíveis
- **Exploração**: Primeiro Passo, Explorador Iniciante, Explorador Experiente, Explorador Elite, Explorador Lendário
- **Mineração**: Primeira Mineração, Minerador Iniciante, Minerador Experiente, Minerador Elite, Minerador Lendário
- **Combate**: Primeiro Combate, Guerreiro Iniciante, Guerreiro Experiente, Guerreiro Elite, Guerreiro Lendário
- **Craft**: Primeiro Craft, Artífice Iniciante, Artífice Experiente, Artífice Elite, Artífice Lendário
- **Economia**: Primeiros Tokens, Comerciante Iniciante, Comerciante Experiente, Comerciante Elite, Comerciante Lendário

## 🚀 Exemplos de Uso

### 1. Criar Perfil de Usuário
```sql
-- Criar perfil com email Google
SELECT * FROM create_or_update_user_profile(
    'user@gmail.com',
    NULL,
    'Nome do Usuário',
    'https://avatar.url'
);

-- Criar perfil com carteira Solana
SELECT * FROM create_or_update_user_profile(
    NULL,
    'ABC123...',
    'Nome do Usuário',
    NULL
);
```

### 2. Iniciar Sessão de Jogo
```sql
-- Iniciar sessão PvE
SELECT * FROM start_game_session(
    'user-uuid',
    'nft-mint-address',
    'pve'
);

-- Iniciar sessão PvP
SELECT * FROM start_game_session(
    'user-uuid',
    'nft-mint-address',
    'pvp'
);
```

### 3. Adicionar Recursos ao Inventário
```sql
-- Adicionar recursos minerados
SELECT add_resources_to_inventory(
    'user-uuid',
    '{"Ferro": 50, "Cobre": 25, "Hidrogênio": 30}'::JSONB
);
```

### 4. Gastar Tokens
```sql
-- Gastar tokens para contratar tripulante
SELECT spend_tokens_from_wallet(
    'user-uuid',
    150, -- SPACE tokens
    0,   -- SOL tokens
    'Contratação de tripulante',
    'crew_hire'
);
```

### 5. Iniciar Mineração
```sql
-- Iniciar sessão de mineração
SELECT start_mining_session(
    'user-uuid',
    'planet-uuid',
    'session-uuid'
);

-- Finalizar mineração
SELECT end_mining_session(
    'mining-session-uuid',
    '{"Ferro": 30, "Cobre": 15}'::JSONB,
    100 -- tokens ganhos
);
```

### 6. Executar Craft
```sql
-- Verificar se pode craftar
SELECT * FROM can_craft_item(
    'user-uuid',
    'recipe-uuid'
);

-- Executar craft
SELECT execute_craft(
    'user-uuid',
    'recipe-uuid',
    'session-uuid'
);
```

### 7. Atualizar Estatísticas
```sql
-- Atualizar estatísticas do jogador
SELECT update_player_stats(
    'user-uuid',
    '{"play_time_seconds": 3600, "sessions_count": 1}'::JSONB
);
```

## 🔍 Queries Úteis

### 1. Buscar Perfil por Email
```sql
SELECT * FROM user_profiles 
WHERE google_email = 'user@gmail.com';
```

### 2. Buscar Perfil por Carteira
```sql
SELECT * FROM user_profiles 
WHERE wallet_address = 'ABC123...';
```

### 3. Buscar NFTs de um Jogador
```sql
SELECT * FROM ship_nfts 
WHERE owner_wallet = 'ABC123...';
```

### 4. Buscar Inventário de um Jogador
```sql
SELECT 
    rt.name,
    rt.category,
    rt.rarity,
    pi.quantity,
    rt.weight_per_unit,
    (pi.quantity * rt.weight_per_unit) as total_weight
FROM player_inventory pi
JOIN resource_types rt ON rt.id = pi.resource_type_id
WHERE pi.user_id = 'user-uuid'
ORDER BY rt.category, rt.rarity;
```

### 5. Buscar Sessões Ativas
```sql
SELECT 
    gs.*,
    up.display_name,
    sn.name as ship_name,
    sn.rarity as ship_rarity
FROM game_sessions gs
JOIN user_profiles up ON up.id = gs.user_id
LEFT JOIN ship_nfts sn ON sn.mint_address = gs.selected_ship_nft_mint
WHERE gs.is_active = TRUE
ORDER BY gs.last_activity DESC;
```

### 6. Buscar Planetas por Coordenadas
```sql
SELECT * FROM discovered_planets 
WHERE coordinate_x BETWEEN 0 AND 100 
AND coordinate_y BETWEEN 0 AND 100
ORDER BY rarity DESC;
```

### 7. Buscar Transações de Tokens
```sql
SELECT 
    tt.*,
    up.display_name
FROM token_transactions tt
JOIN user_profiles up ON up.id = tt.user_id
WHERE tt.user_id = 'user-uuid'
ORDER BY tt.created_at DESC
LIMIT 50;
```

### 8. Buscar Estatísticas de um Jogador
```sql
SELECT 
    ps.*,
    up.display_name,
    up.google_email,
    up.wallet_address
FROM player_stats ps
JOIN user_profiles up ON up.id = ps.user_id
WHERE ps.user_id = 'user-uuid';
```

### 9. Buscar Achievements Desbloqueados
```sql
SELECT 
    a.name,
    a.description,
    a.category,
    a.rarity,
    a.reward_tokens,
    a.reward_resources,
    pa.unlocked_at
FROM player_achievements pa
JOIN achievements a ON a.id = pa.achievement_id
WHERE pa.user_id = 'user-uuid'
ORDER BY pa.unlocked_at DESC;
```

### 10. Buscar Ranking PvP
```sql
SELECT 
    pr.*,
    up.display_name,
    up.avatar_url,
    RANK() OVER (ORDER BY pr.current_rating DESC) as rank_position
FROM pvp_rankings pr
JOIN user_profiles up ON up.id = pr.user_id
WHERE pr.season_id = 'current_season'
ORDER BY pr.current_rating DESC
LIMIT 100;
```

## 📝 Notas de Implementação

### 1. Segurança
- Todas as funções usam `SECURITY DEFINER` para garantir execução com privilégios adequados
- Validação de entrada em todas as funções
- Sanitização de dados JSONB
- Logs de auditoria para todas as ações importantes

### 2. Performance
- Índices otimizados para queries frequentes
- Uso de JSONB para dados estruturados flexíveis
- Triggers para atualização automática de estatísticas
- Funções de limpeza para manutenção

### 3. Escalabilidade
- Estrutura modular e extensível
- Suporte a múltiplos jogadores simultâneos
- Sistema de sessões para gerenciamento de estado
- Logs estruturados para análise

### 4. Manutenibilidade
- Código bem documentado
- Funções reutilizáveis
- Políticas de segurança centralizadas
- Dados iniciais organizados

## 🚀 Próximos Passos

1. **Implementar no Supabase**: Executar scripts SQL no Supabase Dashboard
2. **Configurar RLS**: Aplicar políticas de segurança
3. **Testar Funções**: Validar todas as funções com dados de teste
4. **Integrar com Frontend**: Conectar com o jogo Phaser.js
5. **Monitorar Performance**: Acompanhar métricas de uso
6. **Otimizar Queries**: Ajustar índices conforme necessário
7. **Implementar Backup**: Configurar backup automático
8. **Documentar APIs**: Criar documentação para desenvolvedores

---

**Documento criado em:** Janeiro 2025  
**Versão:** 1.0  
**Status:** Pronto para implementação
