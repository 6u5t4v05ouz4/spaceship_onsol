// Supabase client configuration for development
// Development configuration
const supabaseUrl = "https://cjrbhqlwfjebnjoyfjnc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcmJocWx3ZmplYm5qb3lmam5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDIwNTMsImV4cCI6MjA3NTI3ODA1M30.X4uaKnfrmHYYSkVXz1qWYF0wmy-bkjHgbvonubYUTA4";

// Check if we're in development mode
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const redirectUrl = isDevelopment ? 'http://localhost:3000/auth-callback' : window.location.origin + '/auth-callback';

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

// Log configuration
console.log('🔧 Supabase Dev Client Configuration:', {
    url: supabaseUrl,
    redirectTo: redirectUrl,
    hostname: window.location.hostname,
    origin: window.location.origin,
    isDevelopment: isDevelopment
});

// Make available globally for script tags
window.supabaseDev = supabase;
