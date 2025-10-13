-- =====================================================
-- SPACE CRYPTO MINER - FUNÇÕES E TRIGGERS DO BANCO DE DADOS
-- =====================================================
-- Versão: 1.0
-- Data: Janeiro 2025
-- Descrição: Funções, triggers e procedimentos para lógica de negócio
-- =====================================================

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
-- 1. FUNÇÕES DE AUTENTICAÇÃO E PERFIS
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

-- Função para validar vinculação de contas
CREATE OR REPLACE FUNCTION validate_account_linking(
    p_google_email TEXT DEFAULT NULL,
    p_wallet_address TEXT DEFAULT NULL
)
RETURNS TABLE (
    valid BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    v_email_conflict BOOLEAN := FALSE;
    v_wallet_conflict BOOLEAN := FALSE;
    v_error_message TEXT;
BEGIN
    -- Verificar conflito de email
    IF p_google_email IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM user_profiles 
            WHERE google_email = p_google_email 
            AND (p_wallet_address IS NULL OR wallet_address != p_wallet_address)
        ) INTO v_email_conflict;
    END IF;
    
    -- Verificar conflito de carteira
    IF p_wallet_address IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM user_profiles 
            WHERE wallet_address = p_wallet_address 
            AND (p_google_email IS NULL OR google_email != p_google_email)
        ) INTO v_wallet_conflict;
    END IF;
    
    -- Determinar resultado
    IF v_email_conflict THEN
        v_error_message := 'Este email já está vinculado a outra carteira';
        RETURN QUERY SELECT FALSE, v_error_message;
    ELSIF v_wallet_conflict THEN
        v_error_message := 'Esta carteira já está vinculada a outro email';
        RETURN QUERY SELECT FALSE, v_error_message;
    ELSE
        RETURN QUERY SELECT TRUE, 'Vinculação válida';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. FUNÇÕES DE SESSÕES DE JOGO
-- =====================================================

-- Função para iniciar nova sessão de jogo
CREATE OR REPLACE FUNCTION start_game_session(
    p_user_id UUID,
    p_selected_ship_nft_mint TEXT DEFAULT NULL,
    p_game_mode TEXT DEFAULT 'pve'
)
RETURNS TABLE (
    session_id UUID,
    session_token TEXT
) AS $$
DECLARE
    v_session_id UUID;
    v_session_token TEXT;
    v_ship_attributes RECORD;
BEGIN
    -- Gerar token de sessão
    v_session_token := encode(gen_random_bytes(32), 'hex');
    
    -- Obter atributos da nave se NFT fornecido
    IF p_selected_ship_nft_mint IS NOT NULL THEN
        SELECT speed, cargo_capacity, max_fuel, max_oxygen, max_shield
        INTO v_ship_attributes
        FROM ship_nfts
        WHERE mint_address = p_selected_ship_nft_mint;
    END IF;
    
    -- Criar sessão
    INSERT INTO game_sessions (
        user_id, session_token, selected_ship_nft_mint, game_mode,
        current_fuel, current_oxygen, current_shield
    )
    VALUES (
        p_user_id, v_session_token, p_selected_ship_nft_mint, p_game_mode,
        COALESCE(v_ship_attributes.max_fuel, 100),
        COALESCE(v_ship_attributes.max_oxygen, 100),
        COALESCE(v_ship_attributes.max_shield, 100)
    )
    RETURNING id INTO v_session_id;
    
    RETURN QUERY SELECT v_session_id, v_session_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para finalizar sessão de jogo
CREATE OR REPLACE FUNCTION end_game_session(
    p_session_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_session_exists BOOLEAN;
BEGIN
    -- Verificar se sessão existe e está ativa
    SELECT EXISTS(
        SELECT 1 FROM game_sessions 
        WHERE id = p_session_id AND is_active = TRUE
    ) INTO v_session_exists;
    
    IF NOT v_session_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Finalizar sessão
    UPDATE game_sessions
    SET 
        is_active = FALSE,
        ended_at = NOW(),
        last_activity = NOW()
    WHERE id = p_session_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. FUNÇÕES DE INVENTÁRIO E RECURSOS
-- =====================================================

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

-- Função para remover recursos do inventário
CREATE OR REPLACE FUNCTION remove_resources_from_inventory(
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
        
        -- Verificar se há recursos suficientes
        IF v_current_quantity < v_quantity THEN
            RAISE EXCEPTION 'Recursos insuficientes: % (disponível: %, necessário: %)', 
                v_resource_name, v_current_quantity, v_quantity;
        END IF;
        
        -- Atualizar quantidade
        UPDATE player_inventory
        SET quantity = quantity - v_quantity
        WHERE user_id = p_user_id AND resource_type_id = v_resource_type_id;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. FUNÇÕES DE ECONOMIA E TOKENS
-- =====================================================

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

-- Função para gastar tokens
CREATE OR REPLACE FUNCTION spend_tokens_from_wallet(
    p_user_id UUID,
    p_space_tokens INTEGER DEFAULT 0,
    p_sol_tokens DECIMAL DEFAULT 0,
    p_description TEXT DEFAULT NULL,
    p_source TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_space INTEGER;
    v_current_sol DECIMAL;
BEGIN
    -- Verificar saldo atual
    SELECT space_tokens, sol_tokens
    INTO v_current_space, v_current_sol
    FROM player_wallet
    WHERE user_id = p_user_id;
    
    -- Verificar se há saldo suficiente
    IF v_current_space < p_space_tokens OR v_current_sol < p_sol_tokens THEN
        RAISE EXCEPTION 'Saldo insuficiente (SPACE: %, SOL: %)', v_current_space, v_current_sol;
    END IF;
    
    -- Atualizar saldo
    UPDATE player_wallet
    SET 
        space_tokens = space_tokens - p_space_tokens,
        sol_tokens = sol_tokens - p_sol_tokens,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Registrar transação
    IF p_space_tokens > 0 THEN
        INSERT INTO token_transactions (
            user_id, transaction_type, amount, currency, description, source
        )
        VALUES (
            p_user_id, 'spend', p_space_tokens, 'SPACE', p_description, p_source
        );
    END IF;
    
    IF p_sol_tokens > 0 THEN
        INSERT INTO token_transactions (
            user_id, transaction_type, amount, currency, description, source
        )
        VALUES (
            p_user_id, 'spend', p_sol_tokens, 'SOL', p_description, p_source
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. FUNÇÕES DE MINERAÇÃO
-- =====================================================

-- Função para iniciar sessão de mineração
CREATE OR REPLACE FUNCTION start_mining_session(
    p_user_id UUID,
    p_planet_id UUID,
    p_session_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_mining_session_id UUID;
    v_planet_exists BOOLEAN;
BEGIN
    -- Verificar se planeta existe
    SELECT EXISTS(
        SELECT 1 FROM discovered_planets WHERE id = p_planet_id
    ) INTO v_planet_exists;
    
    IF NOT v_planet_exists THEN
        RAISE EXCEPTION 'Planeta não encontrado';
    END IF;
    
    -- Criar sessão de mineração
    INSERT INTO mining_sessions (
        user_id, planet_id, session_id, started_at
    )
    VALUES (
        p_user_id, p_planet_id, p_session_id, NOW()
    )
    RETURNING id INTO v_mining_session_id;
    
    RETURN v_mining_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para finalizar sessão de mineração
CREATE OR REPLACE FUNCTION end_mining_session(
    p_mining_session_id UUID,
    p_resources_mined JSONB,
    p_tokens_earned INTEGER DEFAULT 0
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_total_weight INTEGER;
BEGIN
    -- Obter user_id da sessão
    SELECT user_id INTO v_user_id
    FROM mining_sessions
    WHERE id = p_mining_session_id AND ended_at IS NULL;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Sessão de mineração não encontrada ou já finalizada';
    END IF;
    
    -- Calcular peso total
    SELECT COALESCE(SUM((value::INTEGER) * rt.weight_per_unit), 0)
    INTO v_total_weight
    FROM jsonb_each_text(p_resources_mined) j
    JOIN resource_types rt ON rt.name = j.key;
    
    -- Finalizar sessão
    UPDATE mining_sessions
    SET 
        ended_at = NOW(),
        duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER,
        resources_mined = p_resources_mined,
        total_weight_mined = v_total_weight,
        tokens_earned = p_tokens_earned
    WHERE id = p_mining_session_id;
    
    -- Adicionar recursos ao inventário
    PERFORM add_resources_to_inventory(v_user_id, p_resources_mined);
    
    -- Adicionar tokens à carteira
    IF p_tokens_earned > 0 THEN
        PERFORM add_tokens_to_wallet(
            v_user_id, 
            p_tokens_earned, 
            0, 
            'earn', 
            'Mineração de recursos', 
            'mining'
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. FUNÇÕES DE CRAFT
-- =====================================================

-- Função para verificar se jogador pode craftar
CREATE OR REPLACE FUNCTION can_craft_item(
    p_user_id UUID,
    p_recipe_id UUID
)
RETURNS TABLE (
    can_craft BOOLEAN,
    missing_resources JSONB,
    missing_tokens INTEGER
) AS $$
DECLARE
    v_recipe RECORD;
    v_missing_resources JSONB := '{}';
    v_missing_tokens INTEGER := 0;
    v_can_craft BOOLEAN := TRUE;
    v_resource_name TEXT;
    v_required_quantity INTEGER;
    v_current_quantity INTEGER;
BEGIN
    -- Obter receita
    SELECT * INTO v_recipe
    FROM craft_recipes
    WHERE id = p_recipe_id;
    
    IF v_recipe IS NULL THEN
        RETURN QUERY SELECT FALSE, '{}'::JSONB, 0;
        RETURN;
    END IF;
    
    -- Verificar recursos necessários
    FOR v_resource_name, v_required_quantity IN 
        SELECT key, value::INTEGER 
        FROM jsonb_each_text(v_recipe.required_resources)
    LOOP
        SELECT COALESCE(pi.quantity, 0) INTO v_current_quantity
        FROM player_inventory pi
        JOIN resource_types rt ON rt.id = pi.resource_type_id
        WHERE pi.user_id = p_user_id AND rt.name = v_resource_name;
        
        IF v_current_quantity < v_required_quantity THEN
            v_missing_resources := v_missing_resources || jsonb_build_object(
                v_resource_name, v_required_quantity - v_current_quantity
            );
            v_can_craft := FALSE;
        END IF;
    END LOOP;
    
    -- Verificar tokens necessários
    IF v_recipe.required_tokens > 0 THEN
        SELECT COALESCE(space_tokens, 0) INTO v_current_quantity
        FROM player_wallet
        WHERE user_id = p_user_id;
        
        IF v_current_quantity < v_recipe.required_tokens THEN
            v_missing_tokens := v_recipe.required_tokens - v_current_quantity;
            v_can_craft := FALSE;
        END IF;
    END IF;
    
    RETURN QUERY SELECT v_can_craft, v_missing_resources, v_missing_tokens;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para executar craft
CREATE OR REPLACE FUNCTION execute_craft(
    p_user_id UUID,
    p_recipe_id UUID,
    p_session_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_craft_session_id UUID;
    v_recipe RECORD;
    v_can_craft BOOLEAN;
    v_missing_resources JSONB;
    v_missing_tokens INTEGER;
BEGIN
    -- Verificar se pode craftar
    SELECT * INTO v_can_craft, v_missing_resources, v_missing_tokens
    FROM can_craft_item(p_user_id, p_recipe_id);
    
    IF NOT v_can_craft THEN
        RAISE EXCEPTION 'Não é possível craftar: recursos ou tokens insuficientes';
    END IF;
    
    -- Obter receita
    SELECT * INTO v_recipe
    FROM craft_recipes
    WHERE id = p_recipe_id;
    
    -- Criar sessão de craft
    INSERT INTO craft_sessions (
        user_id, recipe_id, session_id, started_at, status
    )
    VALUES (
        p_user_id, p_recipe_id, p_session_id, NOW(), 'in_progress'
    )
    RETURNING id INTO v_craft_session_id;
    
    -- Remover recursos do inventário
    PERFORM remove_resources_from_inventory(p_user_id, v_recipe.required_resources);
    
    -- Remover tokens da carteira
    IF v_recipe.required_tokens > 0 THEN
        PERFORM spend_tokens_from_wallet(
            p_user_id, 
            v_recipe.required_tokens, 
            0, 
            'Craft de item', 
            'craft'
        );
    END IF;
    
    -- Finalizar craft
    UPDATE craft_sessions
    SET 
        completed_at = NOW(),
        status = 'completed',
        success = TRUE,
        items_created = jsonb_build_object(
            v_recipe.result_item_type, 
            jsonb_build_object(
                'id', v_recipe.result_item_id,
                'quantity', v_recipe.result_quantity
            )
        ),
        resources_consumed = v_recipe.required_resources
    WHERE id = v_craft_session_id;
    
    RETURN v_craft_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. FUNÇÕES DE ESTATÍSTICAS
-- =====================================================

-- Função para atualizar estatísticas do jogador
CREATE OR REPLACE FUNCTION update_player_stats(
    p_user_id UUID,
    p_stats_update JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    v_stats_exists BOOLEAN;
BEGIN
    -- Verificar se estatísticas existem
    SELECT EXISTS(
        SELECT 1 FROM player_stats WHERE user_id = p_user_id
    ) INTO v_stats_exists;
    
    -- Criar estatísticas se não existirem
    IF NOT v_stats_exists THEN
        INSERT INTO player_stats (user_id)
        VALUES (p_user_id);
    END IF;
    
    -- Atualizar estatísticas
    UPDATE player_stats
    SET 
        total_play_time_seconds = COALESCE(
            (p_stats_update ->> 'play_time_seconds')::INTEGER, 
            total_play_time_seconds
        ),
        sessions_count = COALESCE(
            (p_stats_update ->> 'sessions_count')::INTEGER, 
            sessions_count
        ),
        planets_discovered = COALESCE(
            (p_stats_update ->> 'planets_discovered')::INTEGER, 
            planets_discovered
        ),
        total_mining_sessions = COALESCE(
            (p_stats_update ->> 'mining_sessions')::INTEGER, 
            total_mining_sessions
        ),
        total_battles = COALESCE(
            (p_stats_update ->> 'battles')::INTEGER, 
            total_battles
        ),
        battles_won = COALESCE(
            (p_stats_update ->> 'battles_won')::INTEGER, 
            battles_won
        ),
        total_items_crafted = COALESCE(
            (p_stats_update ->> 'items_crafted')::INTEGER, 
            total_items_crafted
        ),
        distance_traveled = COALESCE(
            (p_stats_update ->> 'distance_traveled')::INTEGER, 
            distance_traveled
        ),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. TRIGGERS AUTOMÁTICOS
-- =====================================================

-- Trigger para atualizar estatísticas quando sessão termina
CREATE OR REPLACE FUNCTION update_stats_on_session_end()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estatísticas quando sessão termina
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        PERFORM update_player_stats(
            NEW.user_id,
            jsonb_build_object(
                'sessions_count', 1,
                'play_time_seconds', EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stats_on_session_end
    AFTER UPDATE ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_stats_on_session_end();

-- Trigger para atualizar estatísticas quando mineração termina
CREATE OR REPLACE FUNCTION update_stats_on_mining_end()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estatísticas quando mineração termina
    IF OLD.ended_at IS NULL AND NEW.ended_at IS NOT NULL THEN
        PERFORM update_player_stats(
            NEW.user_id,
            jsonb_build_object(
                'mining_sessions', 1,
                'tokens_earned', NEW.tokens_earned
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stats_on_mining_end
    AFTER UPDATE ON mining_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_stats_on_mining_end();

-- Trigger para atualizar estatísticas quando craft termina
CREATE OR REPLACE FUNCTION update_stats_on_craft_end()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estatísticas quando craft termina
    IF OLD.status = 'in_progress' AND NEW.status = 'completed' THEN
        PERFORM update_player_stats(
            NEW.user_id,
            jsonb_build_object(
                'items_crafted', 1
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stats_on_craft_end
    AFTER UPDATE ON craft_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_stats_on_craft_end();

-- =====================================================
-- 9. FUNÇÕES DE AUDITORIA E LOGS
-- =====================================================

-- Função para registrar ação do jogador
CREATE OR REPLACE FUNCTION log_player_action(
    p_user_id UUID,
    p_session_id UUID,
    p_action_type TEXT,
    p_action_data JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO player_action_logs (
        user_id, session_id, action_type, action_data
    )
    VALUES (
        p_user_id, p_session_id, p_action_type, p_action_data
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar log do sistema
CREATE OR REPLACE FUNCTION log_system_event(
    p_log_level TEXT,
    p_component TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO system_logs (
        log_level, component, message, data
    )
    VALUES (
        p_log_level, p_component, p_message, p_data
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. FUNÇÕES DE LIMPEZA E MANUTENÇÃO
-- =====================================================

-- Função para limpar sessões antigas
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

-- Função para limpar logs antigos
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

-- =====================================================
-- FIM DAS FUNÇÕES E TRIGGERS
-- =====================================================
