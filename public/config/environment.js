// Configuração de Ambiente Frontend - Space Crypto Miner
// Arquivo: src/config/environment.js

/**
 * Configurações de ambiente para o frontend
 * Este arquivo deve ser carregado antes de qualquer outro script
 */

// Configurações padrão (fallback para desenvolvimento)
const DEFAULT_CONFIG = {
    SUPABASE_URL: 'https://cjrbhqlwfjebnjoyfjnc.supabase.co',
    SUPABASE_ANON_KEY: 'your-supabase-anon-key-here',
    NODE_ENV: 'development',
    LOG_LEVEL: 'debug',
    DEBUG_MODE: 'true',
    GAME_VERSION: '1.0.0'
};

/**
 * Obtém configuração de ambiente
 * Prioridade: window.ENV > process.env > DEFAULT_CONFIG
 */
function getEnvironmentConfig() {
    // Configurações do window (injetadas pelo servidor)
    const windowConfig = window.ENV || {};
    
    // Configurações do process.env (Node.js)
    const processConfig = process.env || {};
    
    // Merge com prioridade
    return {
        ...DEFAULT_CONFIG,
        ...processConfig,
        ...windowConfig
    };
}

// Configuração global
const ENV_CONFIG = getEnvironmentConfig();

// Validação de configurações obrigatórias
const REQUIRED_CONFIGS = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];

for (const configKey of REQUIRED_CONFIGS) {
    if (!ENV_CONFIG[configKey]) {
        console.error(`❌ Missing required configuration: ${configKey}`);
        throw new Error(`Missing required configuration: ${configKey}`);
    }
}

// Expor configurações globalmente
window.SUPABASE_URL = ENV_CONFIG.SUPABASE_URL;
window.SUPABASE_ANON_KEY = ENV_CONFIG.SUPABASE_ANON_KEY;
window.NODE_ENV = ENV_CONFIG.NODE_ENV;
window.LOG_LEVEL = ENV_CONFIG.LOG_LEVEL;
window.DEBUG_MODE = ENV_CONFIG.DEBUG_MODE;
window.GAME_VERSION = ENV_CONFIG.GAME_VERSION;

// Log de inicialização (seguro)
if (ENV_CONFIG.NODE_ENV === 'development' || ENV_CONFIG.DEBUG_MODE === 'true') {
    console.log('🔧 Environment configuration loaded');
    console.log('🔧 Environment:', ENV_CONFIG.NODE_ENV);
    console.log('🔧 Debug mode:', ENV_CONFIG.DEBUG_MODE);
    console.log('🔧 Game version:', ENV_CONFIG.GAME_VERSION);
    console.log('🔧 Log level:', ENV_CONFIG.LOG_LEVEL);
} else {
    console.log('🔧 Environment configuration loaded');
}

// Exportar para uso em módulos
export default ENV_CONFIG;
export { ENV_CONFIG };
