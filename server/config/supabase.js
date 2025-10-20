// =====================================================
// SPACE CRYPTO MINER - Supabase Configuration
// =====================================================

import { createClient } from '@supabase/supabase-js';

// Debug: verificar variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Debug Supabase Config:');
console.log('  - SUPABASE_URL:', supabaseUrl ? '✅ Definido' : '❌ NÃO DEFINIDO');
console.log('  - SERVICE_ROLE_KEY:', serviceRoleKey ? `✅ Definido (${serviceRoleKey.substring(0, 20)}...)` : '❌ NÃO DEFINIDO');
console.log('  - ANON_KEY:', anonKey ? `✅ Definido (${anonKey.substring(0, 20)}...)` : '❌ NÃO DEFINIDO');

// Tornar inicialização resiliente: não falhar se variáveis estiverem ausentes
let supabaseAdmin = null;
let supabaseAnonClient = null;

try {
  if (supabaseUrl && serviceRoleKey) {
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  } else {
    console.warn('⚠️  Supabase admin client não inicializado: variáveis ausentes');
  }
} catch (err) {
  console.warn('⚠️  Falha ao inicializar supabaseAdmin:', err?.message || err);
  supabaseAdmin = null;
}

try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    supabaseAnonClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  } else {
    console.warn('⚠️  Supabase anon client não inicializado: variáveis ausentes');
  }
} catch (err) {
  console.warn('⚠️  Falha ao inicializar supabaseAnonClient:', err?.message || err);
  supabaseAnonClient = null;
}

// Validar conexão ao iniciar
export async function validateSupabaseConnection() {
  try {
    if (!supabaseAdmin) {
      console.warn('⚠️  Supabase admin client indisponível; pulando validação');
      return false;
    }
    const { data, error } = await supabaseAdmin
      .from('player_state')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = tabela não existe ainda
      throw error;
    }
    
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

export { supabaseAdmin, supabaseAnonClient };

