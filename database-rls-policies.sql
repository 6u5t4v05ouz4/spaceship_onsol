-- =====================================================
-- SPACE CRYPTO MINER - POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Versão: 1.0
-- Data: Janeiro 2025
-- Descrição: Políticas de segurança para controle de acesso aos dados
-- =====================================================

-- =====================================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
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
-- 2. FUNÇÕES AUXILIARES PARA RLS
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
-- 3. POLÍTICAS PARA USER_PROFILES
-- =====================================================

-- Política para SELECT: usuários podem ver apenas seus próprios perfis
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (
        google_email = auth.jwt() ->> 'email' OR
        wallet_address = current_setting('app.current_wallet_address', true)
    );

-- Política para INSERT: usuários podem criar seus próprios perfis
CREATE POLICY "Users can create own profile" ON user_profiles
    FOR INSERT WITH CHECK (
        google_email = auth.jwt() ->> 'email' OR
        wallet_address = current_setting('app.current_wallet_address', true)
    );

-- Política para UPDATE: usuários podem atualizar apenas seus próprios perfis
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (
        google_email = auth.jwt() ->> 'email' OR
        wallet_address = current_setting('app.current_wallet_address', true)
    );

-- Política para DELETE: usuários podem deletar apenas seus próprios perfis
CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (
        google_email = auth.jwt() ->> 'email' OR
        wallet_address = current_setting('app.current_wallet_address', true)
    );

-- =====================================================
-- 4. POLÍTICAS PARA GAME_SESSIONS
-- =====================================================

-- Política para SELECT: usuários podem ver apenas suas próprias sessões
CREATE POLICY "Users can view own sessions" ON game_sessions
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para INSERT: usuários podem criar suas próprias sessões
CREATE POLICY "Users can create own sessions" ON game_sessions
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para UPDATE: usuários podem atualizar apenas suas próprias sessões
CREATE POLICY "Users can update own sessions" ON game_sessions
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para DELETE: usuários podem deletar apenas suas próprias sessões
CREATE POLICY "Users can delete own sessions" ON game_sessions
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- =====================================================
-- 5. POLÍTICAS PARA PLAYER_CREW
-- =====================================================

-- Política para SELECT: usuários podem ver apenas seus próprios tripulantes
CREATE POLICY "Users can view own crew" ON player_crew
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para INSERT: usuários podem contratar tripulantes
CREATE POLICY "Users can hire crew" ON player_crew
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para UPDATE: usuários podem atualizar apenas seus próprios tripulantes
CREATE POLICY "Users can update own crew" ON player_crew
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para DELETE: usuários podem demitir apenas seus próprios tripulantes
CREATE POLICY "Users can fire own crew" ON player_crew
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- =====================================================
-- 6. POLÍTICAS PARA PLAYER_INVENTORY
-- =====================================================

-- Política para SELECT: usuários podem ver apenas seu próprio inventário
CREATE POLICY "Users can view own inventory" ON player_inventory
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para INSERT: usuários podem adicionar itens ao seu inventário
CREATE POLICY "Users can add to own inventory" ON player_inventory
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para UPDATE: usuários podem atualizar apenas seu próprio inventário
CREATE POLICY "Users can update own inventory" ON player_inventory
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para DELETE: usuários podem remover itens apenas do seu próprio inventário
CREATE POLICY "Users can remove from own inventory" ON player_inventory
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- =====================================================
-- 7. POLÍTICAS PARA PLAYER_EQUIPMENT
-- =====================================================

-- Política para SELECT: usuários podem ver apenas seus próprios equipamentos
CREATE POLICY "Users can view own equipment" ON player_equipment
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para INSERT: usuários podem adicionar equipamentos
CREATE POLICY "Users can add equipment" ON player_equipment
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para UPDATE: usuários podem atualizar apenas seus próprios equipamentos
CREATE POLICY "Users can update own equipment" ON player_equipment
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para DELETE: usuários podem remover apenas seus próprios equipamentos
CREATE POLICY "Users can remove own equipment" ON player_equipment
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- =====================================================
-- 8. POLÍTICAS PARA PLAYER_WALLET
-- =====================================================

-- Política para SELECT: usuários podem ver apenas sua própria carteira
CREATE POLICY "Users can view own wallet" ON player_wallet
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para INSERT: usuários podem criar sua própria carteira
CREATE POLICY "Users can create own wallet" ON player_wallet
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para UPDATE: usuários podem atualizar apenas sua própria carteira
CREATE POLICY "Users can update own wallet" ON player_wallet
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- =====================================================
-- 9. POLÍTICAS PARA MINING_SESSIONS
-- =====================================================

-- Política para SELECT: usuários podem ver apenas suas próprias sessões de mineração
CREATE POLICY "Users can view own mining sessions" ON mining_sessions
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para INSERT: usuários podem criar suas próprias sessões de mineração
CREATE POLICY "Users can create own mining sessions" ON mining_sessions
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para UPDATE: usuários podem atualizar apenas suas próprias sessões de mineração
CREATE POLICY "Users can update own mining sessions" ON mining_sessions
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- =====================================================
-- 10. POLÍTICAS PARA PVP_BATTLES
-- =====================================================

-- Política para SELECT: usuários podem ver combates onde participaram
CREATE POLICY "Users can view own battles" ON pvp_battles
    FOR SELECT USING (
        attacker_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        ) OR
        defender_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para INSERT: usuários podem iniciar combates
CREATE POLICY "Users can start battles" ON pvp_battles
    FOR INSERT WITH CHECK (
        attacker_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para UPDATE: usuários podem atualizar combates onde participaram
CREATE POLICY "Users can update own battles" ON pvp_battles
    FOR UPDATE USING (
        attacker_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        ) OR
        defender_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- =====================================================
-- 11. POLÍTICAS PARA CRAFT_SESSIONS
-- =====================================================

-- Política para SELECT: usuários podem ver apenas suas próprias sessões de craft
CREATE POLICY "Users can view own craft sessions" ON craft_sessions
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para INSERT: usuários podem criar suas próprias sessões de craft
CREATE POLICY "Users can create own craft sessions" ON craft_sessions
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para UPDATE: usuários podem atualizar apenas suas próprias sessões de craft
CREATE POLICY "Users can update own craft sessions" ON craft_sessions
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- =====================================================
-- 12. POLÍTICAS PARA PLAYER_ACHIEVEMENTS
-- =====================================================

-- Política para SELECT: usuários podem ver apenas seus próprios achievements
CREATE POLICY "Users can view own achievements" ON player_achievements
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para INSERT: sistema pode adicionar achievements aos usuários
CREATE POLICY "System can add achievements" ON player_achievements
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 13. POLÍTICAS PARA PLAYER_STATS
-- =====================================================

-- Política para SELECT: usuários podem ver apenas suas próprias estatísticas
CREATE POLICY "Users can view own stats" ON player_stats
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para INSERT: sistema pode criar estatísticas para usuários
CREATE POLICY "System can create stats" ON player_stats
    FOR INSERT WITH CHECK (true);

-- Política para UPDATE: sistema pode atualizar estatísticas
CREATE POLICY "System can update stats" ON player_stats
    FOR UPDATE USING (true);

-- =====================================================
-- 14. POLÍTICAS PARA PLAYER_ACTION_LOGS
-- =====================================================

-- Política para SELECT: usuários podem ver apenas seus próprios logs
CREATE POLICY "Users can view own action logs" ON player_action_logs
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE google_email = auth.jwt() ->> 'email' OR
                  wallet_address = current_setting('app.current_wallet_address', true)
        )
    );

-- Política para INSERT: sistema pode criar logs de ações
CREATE POLICY "System can create action logs" ON player_action_logs
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 15. POLÍTICAS PARA TABELAS PÚBLICAS (SEM RLS)
-- =====================================================

-- As seguintes tabelas são públicas e não precisam de RLS:
-- - ship_nfts (dados públicos de NFTs)
-- - crew_members (catálogo público de tripulantes)
-- - resource_types (tipos de recursos públicos)
-- - equipment_types (tipos de equipamentos públicos)
-- - discovered_planets (planetas descobertos são públicos)
-- - craft_recipes (receitas públicas)
-- - achievements (achievements públicos)
-- - token_transactions (transações públicas para transparência)
-- - pvp_rankings (rankings públicos)
-- - system_logs (logs do sistema)

-- =====================================================
-- 16. POLÍTICAS ADMINISTRATIVAS (OPCIONAL)
-- =====================================================

-- Política para administradores verem todos os dados
-- (Descomente se necessário)

-- CREATE POLICY "Admins can view all data" ON user_profiles
--     FOR ALL USING (
--         auth.jwt() ->> 'email' IN (
--             SELECT email FROM admin_users WHERE is_active = true
--         )
--     );

-- =====================================================
-- 17. FUNÇÕES DE SEGURANÇA ADICIONAIS
-- =====================================================

-- Função para validar se o usuário pode acessar um recurso
CREATE OR REPLACE FUNCTION validate_user_access(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verifica se o usuário atual tem acesso ao recurso
    RETURN resource_user_id IN (
        SELECT id FROM user_profiles 
        WHERE google_email = auth.jwt() ->> 'email' OR
              wallet_address = current_setting('app.current_wallet_address', true)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter o perfil do usuário atual
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS TABLE (
    id UUID,
    google_email TEXT,
    wallet_address TEXT,
    display_name TEXT,
    avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT up.id, up.google_email, up.wallet_address, up.display_name, up.avatar_url
    FROM user_profiles up
    WHERE up.google_email = auth.jwt() ->> 'email' OR
          up.wallet_address = current_setting('app.current_wallet_address', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIM DAS POLÍTICAS RLS
-- =====================================================
