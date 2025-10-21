/**
 * Game Configuration
 * Configurações do jogo carregadas de forma segura
 */

// Configurações públicas (podem ser expostas)
export const GAME_CONFIG = {
    // URLs públicas
    SERVER_URL: 'https://spaceshiponsol-production-5493.up.railway.app',
    
    // Configurações do jogo
    GAME_VERSION: '1.0.0',
    DEBUG_MODE: true,
    
    // Configurações de rede
    SOCKET_TIMEOUT: 10000,
    RECONNECT_ATTEMPTS: 5,
    
    // Configurações de UI
    DEFAULT_SCREEN_WIDTH: 1920,
    DEFAULT_SCREEN_HEIGHT: 1080,
};

// Função para carregar credenciais de forma segura
export async function loadSecureCredentials() {
    try {
        // Tentar carregar de um endpoint seguro primeiro
        const serverUrl = GAME_CONFIG.SERVER_URL;
        const response = await fetch(`${serverUrl}/api/config`);
        
        if (response.ok) {
            const config = await response.json();
            console.log('✅ Configurações carregadas do servidor');
            return config;
        }
        
        // Fallback para desenvolvimento local
        console.warn('⚠️ Servidor não disponível, usando configurações locais');
        return {
            SUPABASE_URL: 'https://cjrbhqlwfjebnjoyfjnc.supabase.co',
            SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcmJocWx3ZmplYm5qb3lmam5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDIwNTMsImV4cCI6MjA3NTI3ODA1M30.X4uaKnfrmHYYSkVXz1qWYF0wmy-bkjHgbvonubYUTA4',
            SERVER_URL: serverUrl,
            GAME_VERSION: '1.0.0',
            DEBUG_MODE: true
        };
    } catch (error) {
        console.error('❌ Erro ao carregar credenciais:', error);
        
        // Fallback de emergência para desenvolvimento
        console.warn('⚠️ Usando configurações de emergência');
        return {
            SUPABASE_URL: 'https://cjrbhqlwfjebnjoyfjnc.supabase.co',
            SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcmJocWx3ZmplYm5qb3lmam5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDIwNTMsImV4cCI6MjA3NTI3ODA1M30.X4uaKnfrmHYYSkVXz1qWYF0wmy-bkjHgbvonubYUTA4',
            SERVER_URL: GAME_CONFIG.SERVER_URL,
            GAME_VERSION: '1.0.0',
            DEBUG_MODE: true
        };
    }
}
