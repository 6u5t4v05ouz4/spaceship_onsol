/**
 * AuthService - Serviço de Autenticação com Supabase
 * Encapsula toda lógica de autenticação (email/OAuth, session, erros)
 */

import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const REDIRECT_URL = import.meta.env.VITE_SUPABASE_REDIRECT_TO || 'http://localhost:3000/auth-callback';

// Validar configuração
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
}

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
});

/**
 * Traduz mensagens de erro do Supabase para português amigável
 */
function translateError(error) {
  const message = error?.message || '';
  
  const translations = {
    'Invalid login credentials': 'Email ou senha incorretos. Verifique seus dados e tente novamente.',
    'Email not confirmed': 'Email ainda não foi confirmado. Verifique seu inbox.',
    'User not found': 'Usuário não encontrado. Crie uma conta primeiro.',
    'Network error': 'Erro de conexão. Verifique sua internet e tente novamente.',
    'invalid_grant': 'Email ou senha incorretos.',
    'user_already_exists': 'Este email já está registrado.',
    'weak_password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
  };

  // Procurar tradução correspondente
  for (const [key, value] of Object.entries(translations)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Fallback: usar mensagem original (resumida)
  return message || 'Erro ao processar solicitação. Tente novamente.';
}

/**
 * Login com email e senha
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<{user, session}>} - Dados do usuário logado
 * @throws {Error} - Erro amigável em português
 */
export async function signIn(email, password) {
  try {
    console.log('🔐 Tentando login com email/senha...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      console.error('❌ Erro Supabase:', error);
      throw new Error(translateError(error));
    }

    console.log('✅ Login bem-sucedido!', data.user?.email);
    return data;
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    throw error;
  }
}

/**
 * Login com OAuth (Google, GitHub, etc)
 * @param {string} provider - Provedor OAuth ('google', 'github', etc)
 * @returns {Promise<{url}>} - URL de redirecionamento para OAuth
 * @throws {Error} - Erro amigável em português
 */
export async function signInWithOAuth(provider = 'google') {
  try {
    console.log(`🔐 Iniciando OAuth com ${provider}...`);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: REDIRECT_URL,
        skipBrowserRedirect: false,
      }
    });

    if (error) {
      console.error('❌ Erro OAuth:', error);
      throw new Error(translateError(error));
    }

    console.log('✅ OAuth iniciado. Redirecionando...');
    return data;
  } catch (error) {
    console.error('❌ Erro ao iniciar OAuth:', error.message);
    throw error;
  }
}

/**
 * Faz signup (registrar novo usuário)
 * @param {string} email - Email do novo usuário
 * @param {string} password - Senha do novo usuário
 * @returns {Promise<{user, session}>} - Dados do novo usuário
 * @throws {Error} - Erro amigável em português
 */
export async function signUp(email, password) {
  try {
    console.log('📝 Criando nova conta...');

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      console.error('❌ Erro ao criar conta:', error);
      throw new Error(translateError(error));
    }

    console.log('✅ Conta criada! Verifique seu email para confirmar.');
    return data;
  } catch (error) {
    console.error('❌ Erro no signup:', error.message);
    throw error;
  }
}

/**
 * Obter sessão atual
 * @returns {Promise<session>} - Sessão do usuário logado ou null
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Erro ao obter sessão:', error);
      return null;
    }

    if (session) {
      console.log('✅ Sessão ativa:', session.user?.email);
    }
    return session;
  } catch (error) {
    console.error('❌ Erro no getSession:', error.message);
    return null;
  }
}

/**
 * Fazer logout
 * @returns {Promise<void>}
 * @throws {Error} - Erro ao fazer logout
 */
export async function signOut() {
  try {
    console.log('🚪 Fazendo logout...');

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ Erro ao fazer logout:', error);
      throw new Error(translateError(error));
    }

    console.log('✅ Logout realizado com sucesso');
  } catch (error) {
    console.error('❌ Erro no logout:', error.message);
    throw error;
  }
}

/**
 * Atualizar/Refazer token de sessão
 * @returns {Promise<session>} - Nova sessão
 */
export async function refreshSession() {
  try {
    console.log('🔄 Refazendo sessão...');

    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('❌ Erro ao refazer sessão:', error);
      return null;
    }

    console.log('✅ Sessão atualizada');
    return session;
  } catch (error) {
    console.error('❌ Erro no refreshSession:', error.message);
    return null;
  }
}

/**
 * Obter usuário atual
 * @returns {Promise<user>} - Usuário logado ou null
 */
export async function getCurrentUser() {
  try {
    const session = await getSession();
    return session?.user || null;
  } catch (error) {
    console.error('❌ Erro ao obter usuário:', error.message);
    return null;
  }
}

/**
 * Validar email
 * @param {string} email - Email a validar
 * @returns {boolean} - True se válido
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validar senha (mínimo 6 caracteres)
 * @param {string} password - Senha a validar
 * @returns {boolean} - True se válida
 */
export function isValidPassword(password) {
  return password && password.length >= 6;
}

// Exportar serviço
export default {
  signIn,
  signInWithOAuth,
  signUp,
  signOut,
  getSession,
  refreshSession,
  getCurrentUser,
  isValidEmail,
  isValidPassword,
};
