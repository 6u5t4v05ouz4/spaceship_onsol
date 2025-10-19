/**
 * Load Environment Variables
 * Este arquivo DEVE ser importado PRIMEIRO em server.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tentar carregar .env.local primeiro
const envLocalPath = join(__dirname, '.env.local');
if (existsSync(envLocalPath)) {
  const result = dotenv.config({ path: envLocalPath });
  if (result.error) {
    console.error('❌ Erro ao carregar .env.local:', result.error);
  } else {
    console.log('✅ .env.local carregado');
  }
} else {
  console.warn('⚠️  .env.local não encontrado, tentando .env');
  // Fallback para .env
  const envPath = join(__dirname, '.env');
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('✅ .env carregado');
  } else {
    console.log('ℹ️  Nenhum arquivo .env encontrado, usando variáveis de ambiente do sistema');
  }
}

// Debug: mostrar variáveis disponíveis (sem valores sensíveis)
console.log('🔍 Debug Environment Variables:');
console.log('  - SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Definido' : '❌ Não definido');
console.log('  - SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Definido' : '❌ Não definido');
console.log('  - SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Definido' : '❌ Não definido');

// Validar variáveis críticas
const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('❌ Variáveis de ambiente faltando:', missing.join(', '));
  console.error('📝 Verifique suas variáveis de ambiente no Railway');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente carregadas com sucesso');

