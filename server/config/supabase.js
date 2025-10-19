// =====================================================
// SPACE CRYPTO MINER - Supabase Configuration
// =====================================================

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Admin client (bypass RLS, usado para operações do servidor)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Anon client (respeita RLS, usado para operações de usuários)
export const supabaseAnonClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Validar conexão ao iniciar
export async function validateSupabaseConnection() {
  try {
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

