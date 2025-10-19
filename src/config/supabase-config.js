// Configuração Segura do Supabase - Frontend
// Arquivo: src/config/supabase-config.js

/**
 * Configuração do Supabase para o frontend
 * As chaves são injetadas pelo servidor via script tag
 */

// Aguardar configuração ser injetada pelo servidor
function waitForConfig() {
    return new Promise((resolve) => {
        const checkConfig = () => {
            if (window.SUPABASE_CONFIG) {
                resolve(window.SUPABASE_CONFIG);
            } else {
                setTimeout(checkConfig, 100);
            }
        };
        checkConfig();
    });
}

// Função para criar cliente Supabase
async function createSupabaseClient() {
    try {
        // Configuração dinâmica baseada no ambiente
        const config = {
            url: import.meta.env.VITE_SUPABASE_URL || 'https://cjrbhqlwfjebnjoyfjnc.supabase.co',
            anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcmJocWx3ZmplYm5qb3lmam5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA5MjM2MTYsImV4cCI6MjAxNjQ5OTYxNn0.8X0g5J8XZQ5ZQ5ZQ5ZQ5ZQ5ZQ5ZQ5ZQ5ZQ5ZQ5ZQ5ZQ',
            redirectUrl: `${window.location.origin}/auth-callback`
        };

        console.log('🔧 Usando configuração:', config.url);
        
        // Criar cliente com configuração dinâmica
        const client = window.supabase.createClient(
            config.url, 
            config.anonKey, 
            {
                auth: {
                    redirectTo: config.redirectUrl,
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true,
                    flowType: 'pkce' // Usar PKCE para melhor segurança
                }
            }
        );
        
        console.log('✅ Cliente Supabase criado com sucesso');
        return client;
        
    } catch (error) {
        console.error('❌ Erro ao criar cliente Supabase:', error);
        throw error;
    }
}

// Exportar função
window.createSupabaseClient = createSupabaseClient;
window.waitForConfig = waitForConfig;
