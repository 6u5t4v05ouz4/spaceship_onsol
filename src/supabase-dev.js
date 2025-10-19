// Supabase client configuration for development
// Versão segura com variáveis de ambiente

// Configuração com fallback para desenvolvimento
const supabaseUrl = window.SUPABASE_URL || "https://cjrbhqlwfjebnjoyfjnc.supabase.co";
const supabaseAnonKey = window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcmJocWx3ZmplYm5qb3lmam5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDIwNTMsImV4cCI6MjA3NTI3ODA1M30.X4uaKnfrmHYYSkVXz1qWYF0wmy-bkjHgbvonubYUTA4";

// Validação obrigatória
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase configuration missing. Check environment variables.');
    throw new Error('Supabase configuration missing. Check environment variables.');
}

// Check if we're in development mode
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const redirectUrl = isDevelopment ? 'http://localhost:3000/auth-callback.html' : window.location.origin + '/auth-callback.html';

// Create Supabase client with custom configuration for development
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Override redirect URL for development
        redirectTo: redirectUrl,
        // Disable automatic session recovery to avoid conflicts
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Log configuration (seguro)
if (isDevelopment) {
    console.log('🔧 Supabase Dev Client initialized');
    console.log('🔧 Environment:', isDevelopment ? 'development' : 'production');
} else {
    console.log('🔧 Supabase Client initialized');
}

// Make available globally for script tags
window.supabaseDev = supabase;
