// Configuration for different environments
const config = {
    // Detect environment
    isProduction: window.location.hostname !== 'localhost' && 
                  window.location.hostname !== '127.0.0.1' && 
                  !window.location.hostname.includes('localhost'),
    
    // Get current environment info
    getEnvironmentInfo() {
        return {
            hostname: window.location.hostname,
            origin: window.location.origin,
            protocol: window.location.protocol,
            isProduction: this.isProduction,
            isDevelopment: !this.isProduction
        };
    },
    
    // Get the correct redirect URL for OAuth
    getRedirectUrl() {
        const env = this.getEnvironmentInfo();
        console.log('Environment info:', env);
        
        // In production, use the current origin (Vercel URL)
        // In development, use localhost
        return env.origin;
    },
    
    // Get Supabase configuration
    getSupabaseConfig() {
        // Force development environment for localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return {
                url: "https://cjrbhqlwfjebnjoyfjnc.supabase.co",
                anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcmJocWx3ZmplYm5qb3lmam5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDIwNTMsImV4cCI6MjA3NTI3ODA1M30.X4uaKnfrmHYYSkVXz1qWYF0wmy-bkjHgbvonubYUTA4",
                // Override redirect URL for development
                redirectUrl: "http://localhost:3000/auth-callback"
            };
        }
        
        // Production configuration
        return {
            url: "https://cjrbhqlwfjebnjoyfjnc.supabase.co",
            anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcmJocWx3ZmplYm5qb3lmam5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDIwNTMsImV4cCI6MjA3NTI3ODA1M30.X4uaKnfrmHYYSkVXz1qWYF0wmy-bkjHgbvonubYUTA4"
        };
    },
    
    // Log configuration for debugging
    logConfig() {
        console.log('🔧 Configuration loaded:', {
            environment: this.getEnvironmentInfo(),
            redirectUrl: this.getRedirectUrl(),
            supabaseUrl: this.getSupabaseConfig().url
        });
    }
};

// Make config available globally
window.appConfig = config;

// Log configuration on load
config.logConfig();

