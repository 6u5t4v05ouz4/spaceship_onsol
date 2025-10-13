-- =====================================================
-- SPACE CRYPTO MINER - ESQUEMA COMPLETO DO BANCO DE DADOS
-- =====================================================
-- Versão: 1.0
-- Data: Janeiro 2025
-- Descrição: Esquema completo para o jogo Space Crypto Miner
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
CREATE TABLE user_profiles (
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
CREATE TABLE game_sessions (
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
CREATE TABLE ship_nfts (
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
CREATE TABLE crew_members (
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
CREATE TABLE player_crew (
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
CREATE TABLE resource_types (
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
CREATE TABLE player_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    resource_type_id UUID REFERENCES resource_types(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, resource_type_id)
);

-- Tabela de equipamentos e módulos
CREATE TABLE equipment_types (
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
CREATE TABLE player_equipment (
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
CREATE TABLE token_transactions (
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
CREATE TABLE player_wallet (
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
CREATE TABLE discovered_planets (
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
CREATE TABLE mining_sessions (
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
CREATE TABLE pvp_battles (
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
CREATE TABLE pvp_rankings (
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
CREATE TABLE craft_recipes (
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
CREATE TABLE craft_sessions (
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
CREATE TABLE achievements (
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
CREATE TABLE player_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_id)
);

-- Tabela de estatísticas dos jogadores
CREATE TABLE player_stats (
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
CREATE TABLE player_action_logs (
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
CREATE TABLE system_logs (
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
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ship_nfts_updated_at BEFORE UPDATE ON ship_nfts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_player_inventory_updated_at BEFORE UPDATE ON player_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_player_equipment_updated_at BEFORE UPDATE ON player_equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_player_wallet_updated_at BEFORE UPDATE ON player_wallet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_player_stats_updated_at BEFORE UPDATE ON player_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 12. COMENTÁRIOS E DOCUMENTAÇÃO
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
-- FIM DO ESQUEMA
-- =====================================================
