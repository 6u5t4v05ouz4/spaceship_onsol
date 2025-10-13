-- =====================================================
-- SPACE CRYPTO MINER - SCRIPT DE MIGRAÇÃO COMPLETO
-- =====================================================
-- Versão: 1.0
-- Data: Janeiro 2025
-- Descrição: Script único para aplicar todo o esquema do banco de dados
-- =====================================================

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================
-- 1. Execute este script no SQL Editor do Supabase Dashboard
-- 2. Ou use o Supabase CLI: supabase db reset
-- 3. Verifique se todas as tabelas foram criadas corretamente
-- 4. Teste as funções principais
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função para gerar UUID v7 (timestamp-based)
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
-- 1. TABELAS DE AUTENTICAÇÃO E PERFIS
-- =====================================================

-- Tabela de perfis de usuário unificados
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    google_email TEXT UNIQUE,
    wallet_address TEXT UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_email_or_wallet CHECK (
        google_email IS NOT NULL OR wallet_address IS NOT NULL
    ),
    CONSTRAINT valid_email CHECK (
        google_email IS NULL OR google_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    CONSTRAINT valid_wallet CHECK (
        wallet_address IS NULL OR LENGTH(wallet_address) >= 32
    )
);

-- Tabela de sessões de jogo
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Dados da sessão
    selected_ship_nft_mint TEXT,
    game_mode TEXT CHECK (game_mode IN ('pve', 'pvp')) DEFAULT 'pve',
    current_location_x INTEGER DEFAULT 0,
    current_location_y INTEGER DEFAULT 0,
    
    -- Recursos atuais da sessão
    current_fuel INTEGER DEFAULT 100,
    current_oxygen INTEGER DEFAULT 100,
    current_shield INTEGER DEFAULT 100,
    current_cargo_weight INTEGER DEFAULT 0,
    
    CONSTRAINT valid_session_token CHECK (LENGTH(session_token) = 64)
);

-- =====================================================
-- 2. TABELAS DE NFTs E NAVES
-- =====================================================

-- Tabela de NFTs de naves coletadas
CREATE TABLE IF NOT EXISTS ship_nfts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    mint_address TEXT UNIQUE NOT NULL,
    owner_wallet TEXT NOT NULL,
    collection_address TEXT NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    metadata_url TEXT NOT NULL,
    
    -- Atributos da nave
    rarity TEXT CHECK (rarity IN ('Comum', 'Incomum', 'Raro', 'Épico', 'Lendário')) NOT NULL,
    speed INTEGER NOT NULL CHECK (speed >= 100 AND speed <= 500),
    cargo_capacity INTEGER NOT NULL CHECK (cargo_capacity >= 50 AND cargo_capacity <= 200),
    max_fuel INTEGER NOT NULL CHECK (max_fuel >= 100 AND max_fuel <= 300),
    max_oxygen INTEGER NOT NULL CHECK (max_oxygen >= 100 AND max_oxygen <= 300),
    max_shield INTEGER NOT NULL CHECK (max_shield >= 100 AND max_shield <= 500),
    
    -- Metadados
    model_name TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_mint_address CHECK (LENGTH(mint_address) >= 32),
    CONSTRAINT valid_collection_address CHECK (LENGTH(collection_address) >= 32)
);

-- Tabela de tripulantes (não-NFTs)
CREATE TABLE IF NOT EXISTS crew_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    name TEXT NOT NULL,
    specialization TEXT CHECK (specialization IN ('Piloto', 'Engenheiro', 'Navegador', 'Médico', 'Mercador')) NOT NULL,
    rarity TEXT CHECK (rarity IN ('Comum', 'Incomum', 'Raro', 'Épico', 'Lendário')) NOT NULL,
    
    -- Bônus que o tripulante oferece
    speed_bonus INTEGER DEFAULT 0,
    cargo_bonus INTEGER DEFAULT 0,
    fuel_efficiency_bonus INTEGER DEFAULT 0,
    oxygen_efficiency_bonus INTEGER DEFAULT 0,
    shield_bonus INTEGER DEFAULT 0,
    mining_bonus INTEGER DEFAULT 0,
    combat_bonus INTEGER DEFAULT 0,
    
    -- Metadados
    description TEXT,
    image_url TEXT,
    hire_cost_tokens INTEGER NOT NULL CHECK (hire_cost_tokens > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tripulação contratada pelos jogadores
CREATE TABLE IF NOT EXISTS player_crew (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
    hired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(user_id, crew_member_id)
);

-- =====================================================
-- 3. TABELAS DE RECURSOS E INVENTÁRIO
-- =====================================================

-- Tabela de tipos de recursos
CREATE TABLE IF NOT EXISTS resource_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    name TEXT UNIQUE NOT NULL,
    category TEXT CHECK (category IN ('Metal', 'Combustível', 'Oxigênio', 'Projétil', 'Especial', 'Tripulante', 'Equipamento')) NOT NULL,
    rarity TEXT CHECK (rarity IN ('Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Mítico')) NOT NULL,
    weight_per_unit INTEGER NOT NULL CHECK (weight_per_unit > 0),
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de inventário dos jogadores
CREATE TABLE IF NOT EXISTS player_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    resource_type_id UUID REFERENCES resource_types(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, resource_type_id)
);

-- Tabela de equipamentos e módulos
CREATE TABLE IF NOT EXISTS equipment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    name TEXT UNIQUE NOT NULL,
    category TEXT CHECK (category IN ('Arma', 'Escudo', 'Motor', 'Sensor', 'Carga', 'Sobrevivência')) NOT NULL,
    rarity TEXT CHECK (rarity IN ('Comum', 'Incomum', 'Raro', 'Épico', 'Lendário')) NOT NULL,
    
    -- Efeitos do equipamento
    speed_modifier INTEGER DEFAULT 0,
    cargo_modifier INTEGER DEFAULT 0,
    fuel_efficiency_modifier INTEGER DEFAULT 0,
    oxygen_efficiency_modifier INTEGER DEFAULT 0,
    shield_modifier INTEGER DEFAULT 0,
    mining_efficiency_modifier INTEGER DEFAULT 0,
    combat_damage_modifier INTEGER DEFAULT 0,
    
    -- Metadados
    description TEXT,
    image_url TEXT,
    craft_cost_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de equipamentos dos jogadores
CREATE TABLE IF NOT EXISTS player_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    equipment_type_id UUID REFERENCES equipment_types(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    equipped BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, equipment_type_id)
);

-- =====================================================
-- 4. TABELAS DE ECONOMIA E TOKENS
-- =====================================================

-- Tabela de transações de tokens
CREATE TABLE IF NOT EXISTS token_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    transaction_type TEXT CHECK (transaction_type IN ('earn', 'spend', 'convert', 'royalty')) NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT CHECK (currency IN ('SPACE', 'SOL')) NOT NULL,
    
    -- Detalhes da transação
    description TEXT,
    source TEXT, -- 'mining', 'pvp', 'craft', 'hire', etc.
    metadata JSONB,
    
    -- Blockchain data (para conversões)
    blockchain_tx_hash TEXT,
    blockchain_confirmed BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de saldo de tokens dos jogadores
CREATE TABLE IF NOT EXISTS player_wallet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    space_tokens INTEGER DEFAULT 0 CHECK (space_tokens >= 0),
    sol_tokens DECIMAL(18, 9) DEFAULT 0 CHECK (sol_tokens >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =====================================================
-- 5. TABELAS DE MAPA E EXPLORAÇÃO
-- =====================================================

-- Tabela de planetas descobertos
CREATE TABLE IF NOT EXISTS discovered_planets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    planet_id TEXT UNIQUE NOT NULL, -- ID único do planeta no mapa
    name TEXT NOT NULL,
    planet_type TEXT CHECK (planet_type IN ('Rochoso', 'Gasoso', 'Gelado', 'Deserto', 'Tóxico', 'Cristalino')) NOT NULL,
    rarity TEXT CHECK (rarity IN ('Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Mítico')) NOT NULL,
    
    -- Localização
    coordinate_x INTEGER NOT NULL,
    coordinate_y INTEGER NOT NULL,
    
    -- Recursos disponíveis
    available_resources JSONB NOT NULL DEFAULT '{}',
    mining_difficulty INTEGER CHECK (mining_difficulty >= 1 AND mining_difficulty <= 10) DEFAULT 5,
    
    -- Metadados
    description TEXT,
    image_url TEXT,
    discovered_by UUID REFERENCES user_profiles(id),
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(coordinate_x, coordinate_y)
);

-- Tabela de sessões de mineração
CREATE TABLE IF NOT EXISTS mining_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    planet_id UUID REFERENCES discovered_planets(id) ON DELETE CASCADE,
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Resultados da mineração
    resources_mined JSONB DEFAULT '{}',
    total_weight_mined INTEGER DEFAULT 0,
    tokens_earned INTEGER DEFAULT 0,
    
    -- Dados da sessão
    mining_efficiency DECIMAL(5, 2) DEFAULT 1.0,
    is_pvp_session BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT valid_duration CHECK (duration_seconds IS NULL OR duration_seconds > 0)
);

-- =====================================================
-- 6. TABELAS DE COMBATE E PvP
-- =====================================================

-- Tabela de combates PvP
CREATE TABLE IF NOT EXISTS pvp_battles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    attacker_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    defender_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    planet_id UUID REFERENCES discovered_planets(id) ON DELETE CASCADE,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Resultado do combate
    winner_id UUID REFERENCES user_profiles(id),
    battle_result TEXT CHECK (battle_result IN ('attacker_win', 'defender_win', 'draw', 'abandoned')) NOT NULL,
    
    -- Recursos disputados
    contested_resources JSONB DEFAULT '{}',
    resources_won JSONB DEFAULT '{}',
    tokens_won INTEGER DEFAULT 0,
    
    -- Dados de combate
    attacker_damage_dealt INTEGER DEFAULT 0,
    defender_damage_dealt INTEGER DEFAULT 0,
    attacker_ship_destroyed BOOLEAN DEFAULT FALSE,
    defender_ship_destroyed BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT valid_duration CHECK (duration_seconds IS NULL OR duration_seconds > 0),
    CONSTRAINT valid_combatants CHECK (attacker_id != defender_id)
);

-- Tabela de ranking PvP
CREATE TABLE IF NOT EXISTS pvp_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Estatísticas de combate
    battles_won INTEGER DEFAULT 0,
    battles_lost INTEGER DEFAULT 0,
    battles_draw INTEGER DEFAULT 0,
    total_damage_dealt INTEGER DEFAULT 0,
    total_damage_taken INTEGER DEFAULT 0,
    
    -- Ranking
    current_rank INTEGER,
    current_rating INTEGER DEFAULT 1000,
    highest_rating INTEGER DEFAULT 1000,
    
    -- Período
    season_id TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, season_id)
);

-- =====================================================
-- 7. TABELAS DE CRAFT E RECEITAS
-- =====================================================

-- Tabela de receitas de craft
CREATE TABLE IF NOT EXISTS craft_recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    result_item_type TEXT NOT NULL, -- 'equipment', 'resource', etc.
    result_item_id UUID NOT NULL,
    result_quantity INTEGER DEFAULT 1 CHECK (result_quantity > 0),
    
    -- Ingredientes necessários
    required_resources JSONB NOT NULL DEFAULT '{}',
    required_equipment JSONB DEFAULT '{}',
    required_tokens INTEGER DEFAULT 0 CHECK (required_tokens >= 0),
    
    -- Metadados
    name TEXT NOT NULL,
    description TEXT,
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 10) DEFAULT 1,
    craft_time_seconds INTEGER DEFAULT 0 CHECK (craft_time_seconds >= 0),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões de craft
CREATE TABLE IF NOT EXISTS craft_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES craft_recipes(id) ON DELETE CASCADE,
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('in_progress', 'completed', 'failed', 'cancelled')) DEFAULT 'in_progress',
    
    -- Resultado
    success BOOLEAN DEFAULT FALSE,
    items_created JSONB DEFAULT '{}',
    resources_consumed JSONB DEFAULT '{}',
    
    CONSTRAINT valid_completion CHECK (
        (status = 'completed' AND completed_at IS NOT NULL) OR
        (status != 'completed' AND completed_at IS NULL)
    )
);

-- =====================================================
-- 8. TABELAS DE ESTATÍSTICAS E ACHIEVEMENTS
-- =====================================================

-- Tabela de achievements
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category TEXT CHECK (category IN ('Exploração', 'Mineração', 'Combate', 'Craft', 'Social', 'Economia')) NOT NULL,
    rarity TEXT CHECK (rarity IN ('Comum', 'Incomum', 'Raro', 'Épico', 'Lendário')) NOT NULL,
    
    -- Critérios para desbloqueio
    criteria JSONB NOT NULL DEFAULT '{}',
    reward_tokens INTEGER DEFAULT 0 CHECK (reward_tokens >= 0),
    reward_resources JSONB DEFAULT '{}',
    
    -- Metadados
    icon_url TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de achievements desbloqueados pelos jogadores
CREATE TABLE IF NOT EXISTS player_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_id)
);

-- Tabela de estatísticas dos jogadores
CREATE TABLE IF NOT EXISTS player_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Estatísticas gerais
    total_play_time_seconds INTEGER DEFAULT 0,
    sessions_count INTEGER DEFAULT 0,
    planets_discovered INTEGER DEFAULT 0,
    
    -- Estatísticas de mineração
    total_resources_mined JSONB DEFAULT '{}',
    total_mining_sessions INTEGER DEFAULT 0,
    total_tokens_earned INTEGER DEFAULT 0,
    
    -- Estatísticas de combate
    total_battles INTEGER DEFAULT 0,
    battles_won INTEGER DEFAULT 0,
    total_damage_dealt INTEGER DEFAULT 0,
    
    -- Estatísticas de craft
    total_items_crafted INTEGER DEFAULT 0,
    successful_crafts INTEGER DEFAULT 0,
    
    -- Estatísticas de exploração
    distance_traveled INTEGER DEFAULT 0,
    unique_planets_visited INTEGER DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =====================================================
-- 9. TABELAS DE LOGS E AUDITORIA
-- =====================================================

-- Tabela de logs de ações dos jogadores
CREATE TABLE IF NOT EXISTS player_action_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    
    action_type TEXT NOT NULL,
    action_data JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadados
    ip_address INET,
    user_agent TEXT,
    location_data JSONB
);

-- Tabela de logs do sistema
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    log_level TEXT CHECK (log_level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')) NOT NULL,
    component TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(google_email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- Índices para game_sessions
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_active ON game_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_game_sessions_last_activity ON game_sessions(last_activity);

-- Índices para ship_nfts
CREATE INDEX IF NOT EXISTS idx_ship_nfts_owner ON ship_nfts(owner_wallet);
CREATE INDEX IF NOT EXISTS idx_ship_nfts_rarity ON ship_nfts(rarity);
CREATE INDEX IF NOT EXISTS idx_ship_nfts_collection ON ship_nfts(collection_address);

-- Índices para player_inventory
CREATE INDEX IF NOT EXISTS idx_player_inventory_user_id ON player_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_player_inventory_resource ON player_inventory(resource_type_id);

-- Índices para discovered_planets
CREATE INDEX IF NOT EXISTS idx_discovered_planets_coordinates ON discovered_planets(coordinate_x, coordinate_y);
CREATE INDEX IF NOT EXISTS idx_discovered_planets_rarity ON discovered_planets(rarity);
CREATE INDEX IF NOT EXISTS idx_discovered_planets_discovered_by ON discovered_planets(discovered_by);

-- Índices para mining_sessions
CREATE INDEX IF NOT EXISTS idx_mining_sessions_user_id ON mining_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_planet_id ON mining_sessions(planet_id);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_started_at ON mining_sessions(started_at);

-- Índices para pvp_battles
CREATE INDEX IF NOT EXISTS idx_pvp_battles_attacker ON pvp_battles(attacker_id);
CREATE INDEX IF NOT EXISTS idx_pvp_battles_defender ON pvp_battles(defender_id);
CREATE INDEX IF NOT EXISTS idx_pvp_battles_started_at ON pvp_battles(started_at);

-- Índices para token_transactions
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON token_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at);

-- Índices para player_action_logs
CREATE INDEX IF NOT EXISTS idx_player_action_logs_user_id ON player_action_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_player_action_logs_timestamp ON player_action_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_player_action_logs_action_type ON player_action_logs(action_type);

-- =====================================================
-- 11. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ship_nfts_updated_at ON ship_nfts;
CREATE TRIGGER update_ship_nfts_updated_at BEFORE UPDATE ON ship_nfts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_player_inventory_updated_at ON player_inventory;
CREATE TRIGGER update_player_inventory_updated_at BEFORE UPDATE ON player_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_player_equipment_updated_at ON player_equipment;
CREATE TRIGGER update_player_equipment_updated_at BEFORE UPDATE ON player_equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_player_wallet_updated_at ON player_wallet;
CREATE TRIGGER update_player_wallet_updated_at BEFORE UPDATE ON player_wallet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_player_stats_updated_at ON player_stats;
CREATE TRIGGER update_player_stats_updated_at BEFORE UPDATE ON player_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 12. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

-- Tabelas de usuários e perfis
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_action_logs ENABLE ROW LEVEL SECURITY;

-- Tabelas de jogo
ALTER TABLE mining_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE craft_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pvp_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pvp_rankings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 13. FUNÇÕES AUXILIARES PARA RLS
-- =====================================================

-- Função para obter o ID do usuário atual
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    -- Primeiro, tenta obter do contexto de autenticação do Supabase
    IF auth.uid() IS NOT NULL THEN
        RETURN auth.uid();
    END IF;
    
    -- Se não houver contexto de auth, tenta obter da sessão atual
    -- (para casos onde o usuário está logado via wallet)
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário é dono do perfil
CREATE OR REPLACE FUNCTION is_profile_owner(profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verifica se o usuário atual é dono do perfil
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = profile_id 
        AND (
            google_email = auth.jwt() ->> 'email' OR
            wallet_address = current_setting('app.current_wallet_address', true)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário é dono do recurso
CREATE OR REPLACE FUNCTION is_resource_owner(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verifica se o usuário atual é dono do recurso
    RETURN resource_user_id = get_current_user_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 14. POLÍTICAS RLS PARA USER_PROFILES
-- =====================================================

-- Política para SELECT: usuários podem ver apenas seus próprios perfis
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (
        google_email = auth.jwt() ->> 'email' OR
        wallet_address = current_setting('app.current_wallet_address', true)
    );

-- Política para INSERT: usuários podem criar seus próprios perfis
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
CREATE POLICY "Users can create own profile" ON user_profiles
    FOR INSERT WITH CHECK (
        google_email = auth.jwt() ->> 'email' OR
        wallet_address = current_setting('app.current_wallet_address', true)
    );

-- Política para UPDATE: usuários podem atualizar apenas seus próprios perfis
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (
        google_email = auth.jwt() ->> 'email' OR
        wallet_address = current_setting('app.current_wallet_address', true)
    );

-- Política para DELETE: usuários podem deletar apenas seus próprios perfis
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (
        google_email = auth.jwt() ->> 'email' OR
        wallet_address = current_setting('app.current_wallet_address', true)
    );

-- =====================================================
-- 15. POLÍTICAS RLS PARA GAME_SESSIONS
-- =====================================================

-- Política para SELECT: usuários podem ver apenas suas próprias sessões
DROP POLICY IF EXISTS "Users can view own sessions" ON game_sessions;
CREATE POLICY "Users can view own sessions" ON game_sessions
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para INSERT: usuários podem criar suas próprias sessões
DROP POLICY IF EXISTS "Users can create own sessions" ON game_sessions;
CREATE POLICY "Users can create own sessions" ON game_sessions
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para UPDATE: usuários podem atualizar apenas suas próprias sessões
DROP POLICY IF EXISTS "Users can update own sessions" ON game_sessions;
CREATE POLICY "Users can update own sessions" ON game_sessions
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para DELETE: usuários podem deletar apenas suas próprias sessões
DROP POLICY IF EXISTS "Users can delete own sessions" ON game_sessions;
CREATE POLICY "Users can delete own sessions" ON game_sessions
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- =====================================================
-- 16. POLÍTICAS RLS PARA OUTRAS TABELAS
-- =====================================================

-- Políticas para player_inventory
DROP POLICY IF EXISTS "Users can view own inventory" ON player_inventory;
CREATE POLICY "Users can view own inventory" ON player_inventory
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

DROP POLICY IF EXISTS "Users can add to own inventory" ON player_inventory;
CREATE POLICY "Users can add to own inventory" ON player_inventory
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

DROP POLICY IF EXISTS "Users can update own inventory" ON player_inventory;
CREATE POLICY "Users can update own inventory" ON player_inventory
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

DROP POLICY IF EXISTS "Users can remove from own inventory" ON player_inventory;
CREATE POLICY "Users can remove from own inventory" ON player_inventory
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Políticas para player_wallet
DROP POLICY IF EXISTS "Users can view own wallet" ON player_wallet;
CREATE POLICY "Users can view own wallet" ON player_wallet
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

DROP POLICY IF EXISTS "Users can create own wallet" ON player_wallet;
CREATE POLICY "Users can create own wallet" ON player_wallet
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

DROP POLICY IF EXISTS "Users can update own wallet" ON player_wallet;
CREATE POLICY "Users can update own wallet" ON player_wallet
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- =====================================================
-- 17. FUNÇÕES PRINCIPAIS DO JOGO
-- =====================================================

-- Função para criar ou atualizar perfil de usuário
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
DECLARE
    v_profile_id UUID;
    v_existing_profile UUID;
    v_created BOOLEAN := FALSE;
    v_message TEXT;
BEGIN
    -- Validação de entrada
    IF p_google_email IS NULL AND p_wallet_address IS NULL THEN
        RETURN QUERY SELECT NULL::UUID, FALSE, 'Email ou carteira deve ser fornecido';
        RETURN;
    END IF;
    
    -- Buscar perfil existente
    SELECT id INTO v_existing_profile
    FROM user_profiles
    WHERE (p_google_email IS NOT NULL AND google_email = p_google_email)
       OR (p_wallet_address IS NOT NULL AND wallet_address = p_wallet_address);
    
    IF v_existing_profile IS NOT NULL THEN
        -- Atualizar perfil existente
        UPDATE user_profiles
        SET 
            google_email = COALESCE(p_google_email, google_email),
            wallet_address = COALESCE(p_wallet_address, wallet_address),
            display_name = COALESCE(p_display_name, display_name),
            avatar_url = COALESCE(p_avatar_url, avatar_url),
            updated_at = NOW()
        WHERE id = v_existing_profile;
        
        v_profile_id := v_existing_profile;
        v_created := FALSE;
        v_message := 'Perfil atualizado com sucesso';
    ELSE
        -- Criar novo perfil
        INSERT INTO user_profiles (google_email, wallet_address, display_name, avatar_url)
        VALUES (p_google_email, p_wallet_address, p_display_name, p_avatar_url)
        RETURNING id INTO v_profile_id;
        
        v_created := TRUE;
        v_message := 'Perfil criado com sucesso';
    END IF;
    
    RETURN QUERY SELECT v_profile_id, v_created, v_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para adicionar recursos ao inventário
CREATE OR REPLACE FUNCTION add_resources_to_inventory(
    p_user_id UUID,
    p_resources JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    v_resource_type_id UUID;
    v_quantity INTEGER;
    v_resource_name TEXT;
    v_current_quantity INTEGER;
BEGIN
    -- Iterar sobre cada recurso
    FOR v_resource_name, v_quantity IN SELECT * FROM jsonb_each_text(p_resources)
    LOOP
        -- Buscar ID do tipo de recurso
        SELECT id INTO v_resource_type_id
        FROM resource_types
        WHERE name = v_resource_name;
        
        IF v_resource_type_id IS NULL THEN
            RAISE EXCEPTION 'Tipo de recurso não encontrado: %', v_resource_name;
        END IF;
        
        -- Verificar quantidade atual
        SELECT COALESCE(quantity, 0) INTO v_current_quantity
        FROM player_inventory
        WHERE user_id = p_user_id AND resource_type_id = v_resource_type_id;
        
        -- Atualizar ou inserir
        INSERT INTO player_inventory (user_id, resource_type_id, quantity)
        VALUES (p_user_id, v_resource_type_id, v_current_quantity + v_quantity)
        ON CONFLICT (user_id, resource_type_id)
        DO UPDATE SET quantity = player_inventory.quantity + v_quantity;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para adicionar tokens à carteira
CREATE OR REPLACE FUNCTION add_tokens_to_wallet(
    p_user_id UUID,
    p_space_tokens INTEGER DEFAULT 0,
    p_sol_tokens DECIMAL DEFAULT 0,
    p_transaction_type TEXT DEFAULT 'earn',
    p_description TEXT DEFAULT NULL,
    p_source TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_wallet_exists BOOLEAN;
BEGIN
    -- Verificar se carteira existe
    SELECT EXISTS(
        SELECT 1 FROM player_wallet WHERE user_id = p_user_id
    ) INTO v_wallet_exists;
    
    -- Criar carteira se não existir
    IF NOT v_wallet_exists THEN
        INSERT INTO player_wallet (user_id, space_tokens, sol_tokens)
        VALUES (p_user_id, 0, 0);
    END IF;
    
    -- Atualizar saldo
    UPDATE player_wallet
    SET 
        space_tokens = space_tokens + p_space_tokens,
        sol_tokens = sol_tokens + p_sol_tokens,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Registrar transação
    INSERT INTO token_transactions (
        user_id, transaction_type, amount, currency, description, source
    )
    VALUES (
        p_user_id, p_transaction_type, p_space_tokens, 'SPACE', p_description, p_source
    );
    
    IF p_sol_tokens > 0 THEN
        INSERT INTO token_transactions (
            user_id, transaction_type, amount, currency, description, source
        )
        VALUES (
            p_user_id, p_transaction_type, p_sol_tokens, 'SOL', p_description, p_source
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 18. DADOS INICIAIS
-- =====================================================

-- Inserir tipos de recursos básicos
INSERT INTO resource_types (name, category, rarity, weight_per_unit, description, icon_url) VALUES
('Ferro', 'Metal', 'Comum', 1, 'Metal básico usado em reparos e construções simples', '/assets/icons/iron.png'),
('Cobre', 'Metal', 'Comum', 1, 'Metal condutor usado em sistemas elétricos', '/assets/icons/copper.png'),
('Alumínio', 'Metal', 'Incomum', 1, 'Metal leve usado em estruturas avançadas', '/assets/icons/aluminum.png'),
('Hidrogênio', 'Combustível', 'Comum', 1, 'Combustível básico para naves pequenas', '/assets/icons/hydrogen.png'),
('Deutério', 'Combustível', 'Incomum', 2, 'Combustível eficiente para naves médias', '/assets/icons/deuterium.png'),
('Oxigênio Líquido', 'Oxigênio', 'Comum', 1, 'Oxigênio purificado para respiração', '/assets/icons/liquid_oxygen.png'),
('Mísseis Básicos', 'Projétil', 'Comum', 2, 'Mísseis simples para combate básico', '/assets/icons/basic_missiles.png')
ON CONFLICT (name) DO NOTHING;

-- Inserir equipamentos básicos
INSERT INTO equipment_types (name, category, rarity, combat_damage_modifier, description, image_url, craft_cost_tokens) VALUES
('Canhão Laser', 'Arma', 'Comum', 50, 'Arma básica de energia', '/assets/equipment/laser_cannon.png', 100),
('Escudo Energético', 'Escudo', 'Comum', 0, 'Escudo básico de energia', '/assets/equipment/energy_shield.png', 100),
('Motor Iônico', 'Motor', 'Comum', 0, 'Motor básico de íons', '/assets/equipment/ion_engine.png', 100)
ON CONFLICT (name) DO NOTHING;

-- Inserir tripulantes básicos
INSERT INTO crew_members (name, specialization, rarity, speed_bonus, description, image_url, hire_cost_tokens) VALUES
('Piloto Novato', 'Piloto', 'Comum', 10, 'Piloto iniciante com habilidades básicas', '/assets/crew/novice_pilot.png', 50),
('Engenheiro Júnior', 'Engenheiro', 'Comum', 0, 'Engenheiro júnior com conhecimentos básicos', '/assets/crew/junior_engineer.png', 50)
ON CONFLICT (name) DO NOTHING;

-- Inserir achievements básicos
INSERT INTO achievements (name, description, category, rarity, criteria, reward_tokens, reward_resources, icon_url) VALUES
('Primeiro Passo', 'Descubra seu primeiro planeta', 'Exploração', 'Comum', '{"planets_discovered": 1}', 50, '{"Ferro": 10}', '/assets/achievements/first_step.png'),
('Primeira Mineração', 'Complete sua primeira sessão de mineração', 'Mineração', 'Comum', '{"mining_sessions": 1}', 50, '{"Ferro": 15}', '/assets/achievements/first_mining.png')
ON CONFLICT (name) DO NOTHING;

-- Inserir planetas iniciais
INSERT INTO discovered_planets (planet_id, name, planet_type, rarity, coordinate_x, coordinate_y, available_resources, mining_difficulty, description, image_url) VALUES
('planet_001', 'Terra Nova', 'Rochoso', 'Comum', 0, 0, '{"Ferro": 100, "Cobre": 50, "Hidrogênio": 75}', 3, 'Planeta rochoso com recursos básicos', '/assets/planets/rocky_planet_01.png'),
('planet_002', 'Aqua Prime', 'Gelado', 'Comum', 100, 0, '{"Oxigênio Líquido": 80, "Hidrogênio": 60, "Ferro": 40}', 4, 'Planeta gelado rico em oxigênio', '/assets/planets/icy_planet_01.png')
ON CONFLICT (planet_id) DO NOTHING;

-- Inserir log de inicialização
INSERT INTO system_logs (log_level, component, message, data) VALUES
('INFO', 'system', 'Banco de dados inicializado com sucesso', '{"version": "1.0", "date": "2025-01-01", "tables": 20, "functions": 15}');

-- =====================================================
-- 19. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE user_profiles IS 'Perfis unificados de usuários que podem conectar Google e/ou carteira Solana';
COMMENT ON TABLE game_sessions IS 'Sessões ativas de jogo com estado atual do jogador';
COMMENT ON TABLE ship_nfts IS 'NFTs de naves coletadas pelos jogadores';
COMMENT ON TABLE crew_members IS 'Tipos de tripulantes disponíveis para contratação';
COMMENT ON TABLE player_crew IS 'Tripulantes contratados pelos jogadores';
COMMENT ON TABLE resource_types IS 'Tipos de recursos disponíveis no jogo';
COMMENT ON TABLE player_inventory IS 'Inventário de recursos dos jogadores';
COMMENT ON TABLE equipment_types IS 'Tipos de equipamentos e módulos disponíveis';
COMMENT ON TABLE player_equipment IS 'Equipamentos possuídos pelos jogadores';
COMMENT ON TABLE token_transactions IS 'Histórico de transações de tokens';
COMMENT ON TABLE player_wallet IS 'Saldo atual de tokens dos jogadores';
COMMENT ON TABLE discovered_planets IS 'Planetas descobertos pelos jogadores';
COMMENT ON TABLE mining_sessions IS 'Sessões de mineração dos jogadores';
COMMENT ON TABLE pvp_battles IS 'Combates PvP entre jogadores';
COMMENT ON TABLE pvp_rankings IS 'Rankings e estatísticas PvP';
COMMENT ON TABLE craft_recipes IS 'Receitas de craft disponíveis';
COMMENT ON TABLE craft_sessions IS 'Sessões de craft dos jogadores';
COMMENT ON TABLE achievements IS 'Achievements disponíveis no jogo';
COMMENT ON TABLE player_achievements IS 'Achievements desbloqueados pelos jogadores';
COMMENT ON TABLE player_stats IS 'Estatísticas gerais dos jogadores';
COMMENT ON TABLE player_action_logs IS 'Logs de ações dos jogadores para auditoria';
COMMENT ON TABLE system_logs IS 'Logs do sistema para debugging e monitoramento';

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================

-- Verificar se todas as tabelas foram criadas
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'user_profiles', 'game_sessions', 'ship_nfts', 'crew_members', 'player_crew',
        'resource_types', 'player_inventory', 'equipment_types', 'player_equipment',
        'token_transactions', 'player_wallet', 'discovered_planets', 'mining_sessions',
        'pvp_battles', 'pvp_rankings', 'craft_recipes', 'craft_sessions',
        'achievements', 'player_achievements', 'player_stats', 'player_action_logs', 'system_logs'
    );
    
    IF table_count = 22 THEN
        RAISE NOTICE '✅ Migração concluída com sucesso! Todas as % tabelas foram criadas.', table_count;
    ELSE
        RAISE NOTICE '⚠️ Migração parcial. Apenas % de 22 tabelas foram criadas.', table_count;
    END IF;
END $$;
