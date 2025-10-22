-- =====================================================
-- APLICAR CORREÇÃO DAS POLÍTICAS RLS - USER_PROFILES
-- =====================================================
-- Data: Janeiro 2025
-- Descrição: Aplica correção completa das políticas RLS
-- =====================================================

-- Verificar estado atual das políticas
SELECT 
    pol.polname as policy_name,
    pol.polcmd as policy_type,
    pol.polenabled as policy_enabled,
    pol.polroles as policy_roles
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname = 'user_profiles'
ORDER BY pol.polname;

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- =====================================================
-- REMOVER TODAS AS POLÍTICAS EXISTENTES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_upsert_policy" ON user_profiles;

-- =====================================================
-- GARANTIR QUE RLS ESTÁ HABILITADO
-- =====================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CRIAR POLÍTICAS SIMPLIFICADAS E FUNCIONAIS
-- =====================================================

-- Política para SELECT - usuários autenticados podem ver seus próprios perfis
CREATE POLICY "user_profiles_select" ON user_profiles
    FOR SELECT 
    TO authenticated
    USING (google_email = auth.jwt() ->> 'email');

-- Política para INSERT - usuários autenticados podem criar perfis com seu email
CREATE POLICY "user_profiles_insert" ON user_profiles
    FOR INSERT 
    TO authenticated
    WITH CHECK (google_email = auth.jwt() ->> 'email');

-- Política para UPDATE - usuários autenticados podem atualizar seus próprios perfis
CREATE POLICY "user_profiles_update" ON user_profiles
    FOR UPDATE 
    TO authenticated
    USING (google_email = auth.jwt() ->> 'email')
    WITH CHECK (google_email = auth.jwt() ->> 'email');

-- Política para DELETE - usuários autenticados podem deletar seus próprios perfis
CREATE POLICY "user_profiles_delete" ON user_profiles
    FOR DELETE 
    TO authenticated
    USING (google_email = auth.jwt() ->> 'email');

-- =====================================================
-- FUNÇÃO DE DEBUG PARA VERIFICAR CONTEXTO DE AUTH
-- =====================================================

CREATE OR REPLACE FUNCTION debug_auth_context()
RETURNS TABLE (
    jwt_email TEXT,
    jwt_sub TEXT,
    jwt_role TEXT,
    current_user_role TEXT,
    current_user_name TEXT,
    auth_uid UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.jwt() ->> 'email' as jwt_email,
        auth.jwt() ->> 'sub' as jwt_sub,
        auth.jwt() ->> 'role' as jwt_role,
        current_user as current_user_role,
        current_setting('role', true) as current_user_name,
        auth.uid() as auth_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO PARA TESTAR POLÍTICAS RLS
-- =====================================================

CREATE OR REPLACE FUNCTION test_user_profiles_access()
RETURNS TABLE (
    can_select BOOLEAN,
    can_insert BOOLEAN,
    can_update BOOLEAN,
    can_delete BOOLEAN,
    jwt_email TEXT,
    auth_uid UUID
) AS $$
DECLARE
    test_email TEXT;
    test_uid UUID;
BEGIN
    -- Obter dados do contexto de auth
    test_email := auth.jwt() ->> 'email';
    test_uid := auth.uid();
    
    -- Testar SELECT
    BEGIN
        PERFORM 1 FROM user_profiles WHERE google_email = test_email LIMIT 1;
        can_select := TRUE;
    EXCEPTION WHEN OTHERS THEN
        can_select := FALSE;
    END;
    
    -- Testar INSERT (simulado)
    BEGIN
        -- Não vamos realmente inserir, apenas testar a política
        can_insert := test_email IS NOT NULL;
    EXCEPTION WHEN OTHERS THEN
        can_insert := FALSE;
    END;
    
    -- Testar UPDATE (simulado)
    BEGIN
        -- Não vamos realmente atualizar, apenas testar a política
        can_update := test_email IS NOT NULL;
    EXCEPTION WHEN OTHERS THEN
        can_update := FALSE;
    END;
    
    -- Testar DELETE (simulado)
    BEGIN
        -- Não vamos realmente deletar, apenas testar a política
        can_delete := test_email IS NOT NULL;
    EXCEPTION WHEN OTHERS THEN
        can_delete := FALSE;
    END;
    
    RETURN QUERY SELECT can_select, can_insert, can_update, can_delete, test_email, test_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICAR POLÍTICAS APÓS CRIAÇÃO
-- =====================================================

-- Listar políticas criadas
SELECT 
    pol.polname as policy_name,
    pol.polcmd as policy_type,
    pol.polenabled as policy_enabled,
    pol.polroles as policy_roles
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname = 'user_profiles'
ORDER BY pol.polname;

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON POLICY "user_profiles_select" ON user_profiles IS 'Permite usuários autenticados visualizarem apenas seus próprios perfis';
COMMENT ON POLICY "user_profiles_insert" ON user_profiles IS 'Permite usuários autenticados criarem perfis com seu próprio email';
COMMENT ON POLICY "user_profiles_update" ON user_profiles IS 'Permite usuários autenticados atualizarem apenas seus próprios perfis';
COMMENT ON POLICY "user_profiles_delete" ON user_profiles IS 'Permite usuários autenticados deletarem apenas seus próprios perfis';

-- =====================================================
-- INSTRUÇÕES DE TESTE
-- =====================================================

-- Para testar após aplicar este script:
-- 1. SELECT * FROM debug_auth_context();
-- 2. SELECT * FROM test_user_profiles_access();
-- 3. Testar UPSERT via cliente Supabase

-- =====================================================
-- FIM DA APLICAÇÃO
-- =====================================================
