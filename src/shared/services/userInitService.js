/**
 * UserInitService - Garante que todos os dados do usuário estão inicializados
 * 
 * Este serviço verifica se o usuário tem todos os dados necessários nas tabelas
 * relacionadas e, se não tiver, chama a função initialize_user_data para criá-los.
 * 
 * Deve ser chamado em TODAS as páginas autenticadas antes de carregar dados do usuário.
 */

/**
 * Verifica se o usuário tem todos os dados inicializados e, se não tiver, inicializa
 * 
 * @param {Object} supabase - Cliente Supabase
 * @param {string} googleEmail - Email do usuário do Google
 * @param {Object} user - Objeto user do Supabase auth (opcional, para metadata)
 * @returns {Promise<{success: boolean, message: string, profile_id: string}>}
 */
export async function ensureUserInitialized(supabase, googleEmail, user = null) {
  try {
    console.log('🔍 Verificando inicialização do usuário:', googleEmail);

    // 1. Verificar se o perfil existe
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('google_email', googleEmail)
      .maybeSingle();

    if (profileError) {
      console.error('❌ Erro ao verificar perfil:', profileError);
      throw new Error('Failed to check user profile: ' + profileError.message);
    }

    // Se o perfil existe, assumimos que os dados estão inicializados
    if (profile) {
      console.log('✅ Usuário já inicializado. Profile ID:', profile.id);
      return {
        success: true,
        message: 'User already initialized',
        profile_id: profile.id
      };
    }

    // 2. Perfil não existe - precisamos inicializar
    console.log('⚠️ Perfil não encontrado. Inicializando dados do usuário...');

    // Preparar dados para inicialização
    const displayName = user?.user_metadata?.name || user?.user_metadata?.full_name || googleEmail.split('@')[0];
    const avatarUrl = user?.user_metadata?.picture || user?.user_metadata?.avatar_url || null;
    const authUserId = user?.id || null;

    // 3. Chamar função RPC para inicializar todos os dados
    const { data: initResult, error: initError } = await supabase
      .rpc('initialize_user_data', {
        p_google_email: googleEmail,
        p_display_name: displayName,
        p_avatar_url: avatarUrl,
        p_auth_user_id: authUserId
      });

    if (initError) {
      console.error('❌ Erro ao inicializar dados do usuário:', initError);
      throw new Error('Failed to initialize user data: ' + initError.message);
    }

    // 4. Verificar resultado
    if (!initResult || initResult.length === 0) {
      console.error('❌ Nenhum resultado retornado da inicialização');
      throw new Error('No result returned from initialization');
    }

    const result = initResult[0];
    
    if (!result.success) {
      console.error('❌ Falha na inicialização:', result.message);
      throw new Error('Initialization failed: ' + result.message);
    }

    console.log('✅ Dados do usuário inicializados com sucesso!');
    console.log('📊 IDs criados:', {
      profile_id: result.profile_id,
      settings_id: result.settings_id,
      stats_id: result.stats_id,
      wallet_id: result.wallet_id
    });

    return {
      success: true,
      message: result.message,
      profile_id: result.profile_id,
      settings_id: result.settings_id,
      stats_id: result.stats_id,
      wallet_id: result.wallet_id
    };

  } catch (error) {
    console.error('❌ Erro em ensureUserInitialized:', error);
    throw error;
  }
}

/**
 * Wrapper simples para verificar e inicializar usuário
 * Retorna o profile_id ou lança erro
 * 
 * @param {Object} supabase - Cliente Supabase
 * @param {string} googleEmail - Email do usuário
 * @param {Object} user - Objeto user do Supabase auth (opcional)
 * @returns {Promise<string>} - Profile ID
 */
export async function getOrCreateUserProfile(supabase, googleEmail, user = null) {
  const result = await ensureUserInitialized(supabase, googleEmail, user);
  return result.profile_id;
}

export default {
  ensureUserInitialized,
  getOrCreateUserProfile
};

