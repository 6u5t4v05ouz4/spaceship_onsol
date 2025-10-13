-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA USER_PROFILES
-- =====================================================
-- Data: Janeiro 2025
-- Descrição: Corrige políticas RLS para permitir INSERT/UPDATE via UPSERT
-- =====================================================

-- Remover políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- =====================================================
-- NOVAS POLÍTICAS RLS CORRIGIDAS
-- =====================================================

-- Política para SELECT: usuários podem ver apenas seus próprios perfis
CREATE POLICY "user_profiles_select_policy" ON user_profiles
    FOR SELECT 
    TO authenticated
    USING (
        -- Permitir acesso por email do Google OAuth
        google_email = auth.jwt() ->> 'email' OR
        -- Permitir acesso por wallet address (para usuários que conectaram carteira)
        wallet_address = current_setting('app.current_wallet_address', true)
    );

-- Política para INSERT: usuários podem criar seus próprios perfis
CREATE POLICY "user_profiles_insert_policy" ON user_profiles
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        -- Verificar se o email do perfil corresponde ao email do token JWT
        google_email = auth.jwt() ->> 'email' OR
        -- Verificar se o wallet corresponde ao wallet configurado
        wallet_address = current_setting('app.current_wallet_address', true)
    );

-- Política para UPDATE: usuários podem atualizar apenas seus próprios perfis
CREATE POLICY "user_profiles_update_policy" ON user_profiles
    FOR UPDATE 
    TO authenticated
    USING (
        -- Verificar se o email do perfil corresponde ao email do token JWT
        google_email = auth.jwt() ->> 'email' OR
        -- Verificar se o wallet corresponde ao wallet configurado
        wallet_address = current_setting('app.current_wallet_address', true)
    )
    WITH CHECK (
        -- Garantir que após o UPDATE, o perfil ainda pertence ao usuário
        google_email = auth.jwt() ->> 'email' OR
        wallet_address = current_setting('app.current_wallet_address', true)
    );

-- Política para DELETE: usuários podem deletar apenas seus próprios perfis
CREATE POLICY "user_profiles_delete_policy" ON user_profiles
    FOR DELETE 
    TO authenticated
    USING (
        -- Verificar se o email do perfil corresponde ao email do token JWT
        google_email = auth.jwt() ->> 'email' OR
        -- Verificar se o wallet corresponde ao wallet configurado
        wallet_address = current_setting('app.current_wallet_address', true)
    );

-- =====================================================
-- POLÍTICA ESPECÍFICA PARA UPSERT (INSERT + UPDATE)
-- =====================================================

-- Política adicional para garantir que UPSERT funcione corretamente
-- Esta política permite que o PostgREST execute UPSERT quando usando on_conflict
CREATE POLICY "user_profiles_upsert_policy" ON user_profiles
    FOR ALL 
    TO authenticated
    USING (
        -- Permitir acesso por email do Google OAuth
        google_email = auth.jwt() ->> 'email' OR
        -- Permitir acesso por wallet address
        wallet_address = current_setting('app.current_wallet_address', true)
    )
    WITH CHECK (
        -- Garantir que o perfil pertence ao usuário autenticado
        google_email = auth.jwt() ->> 'email' OR
        wallet_address = current_setting('app.current_wallet_address', true)
    );

-- =====================================================
-- VERIFICAÇÃO E LOGS
-- =====================================================

-- Função para verificar se as políticas estão funcionando
CREATE OR REPLACE FUNCTION test_user_profiles_rls()
RETURNS TABLE (
    policy_name TEXT,
    policy_type TEXT,
    policy_enabled BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pol.polname::TEXT as policy_name,
        pol.polcmd::TEXT as policy_type,
        pol.polenabled::BOOLEAN as policy_enabled
    FROM pg_policy pol
    JOIN pg_class cls ON pol.polrelid = cls.oid
    WHERE cls.relname = 'user_profiles'
    ORDER BY pol.polname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para debug de autenticação
CREATE OR REPLACE FUNCTION debug_auth_context()
RETURNS TABLE (
    jwt_email TEXT,
    jwt_sub TEXT,
    jwt_role TEXT,
    current_user_role TEXT,
    current_user_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.jwt() ->> 'email' as jwt_email,
        auth.jwt() ->> 'sub' as jwt_sub,
        auth.jwt() ->> 'role' as jwt_role,
        current_user as current_user_role,
        current_setting('role', true) as current_user_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON POLICY "user_profiles_select_policy" ON user_profiles IS 'Permite usuários autenticados visualizarem apenas seus próprios perfis';
COMMENT ON POLICY "user_profiles_insert_policy" ON user_profiles IS 'Permite usuários autenticados criarem perfis com seu próprio email/wallet';
COMMENT ON POLICY "user_profiles_update_policy" ON user_profiles IS 'Permite usuários autenticados atualizarem apenas seus próprios perfis';
COMMENT ON POLICY "user_profiles_delete_policy" ON user_profiles IS 'Permite usuários autenticados deletarem apenas seus próprios perfis';
COMMENT ON POLICY "user_profiles_upsert_policy" ON user_profiles IS 'Política especial para garantir que UPSERT funcione corretamente';

-- =====================================================
-- INSTRUÇÕES DE TESTE
-- =====================================================

-- Para testar se as políticas estão funcionando:
-- 1. SELECT * FROM test_user_profiles_rls();
-- 2. SELECT * FROM debug_auth_context();
-- 3. Testar UPSERT via cliente Supabase com usuário autenticado

-- =====================================================
-- FIM DA CORREÇÃO
-- =====================================================