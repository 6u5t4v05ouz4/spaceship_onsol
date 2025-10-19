// Utilitários de Segurança - Space Crypto Miner
// Arquivo: src/utils/security.js

/**
 * Domínios permitidos para redirecionamento
 */
const ALLOWED_DOMAINS = [
    'localhost:3000',
    '127.0.0.1:3000',
    'spacecryptominer.com',
    'www.spacecryptominer.com',
    'spacecryptominer.vercel.app'
];

/**
 * Valida se uma URL de redirecionamento é segura
 * @param {string} url - URL para validar
 * @returns {boolean} - true se a URL é segura
 */
export function validateRedirectUrl(url) {
    try {
        const urlObj = new URL(url);
        const port = urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80');
        const domain = `${urlObj.hostname}:${port}`;
        
        return ALLOWED_DOMAINS.includes(domain);
    } catch (error) {
        console.error('Invalid URL format:', error);
        return false;
    }
}

/**
 * Sanitiza uma URL de redirecionamento
 * @param {string} url - URL para sanitizar
 * @returns {string} - URL segura ou fallback
 */
export function sanitizeRedirectUrl(url) {
    if (!validateRedirectUrl(url)) {
        console.warn('Unsafe redirect URL detected, using fallback');
        return window.location.origin + '/auth-callback.html';
    }
    return url;
}

/**
 * Valida se estamos em ambiente de desenvolvimento
 * @returns {boolean} - true se em desenvolvimento
 */
export function isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('localhost');
}

/**
 * Valida se estamos em ambiente de produção
 * @returns {boolean} - true se em produção
 */
export function isProduction() {
    return !isDevelopment();
}

/**
 * Gera um token CSRF simples
 * @returns {string} - Token CSRF
 */
export function generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Valida um token CSRF
 * @param {string} token - Token para validar
 * @returns {boolean} - true se o token é válido
 */
export function validateCSRFToken(token) {
    const storedToken = localStorage.getItem('csrf_token');
    return token === storedToken;
}

/**
 * Configura headers de segurança para requisições
 * @param {Headers} headers - Headers object
 * @returns {Headers} - Headers com segurança aplicada
 */
export function addSecurityHeaders(headers) {
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return headers;
}

/**
 * Rate limiting simples no frontend
 */
class RateLimiter {
    constructor(maxAttempts = 5, windowMs = 60000) {
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
        this.attempts = new Map();
    }

    /**
     * Verifica se uma ação pode ser executada
     * @param {string} key - Chave única para o rate limiting
     * @returns {boolean} - true se pode executar
     */
    canExecute(key) {
        const now = Date.now();
        const userAttempts = this.attempts.get(key) || { count: 0, resetTime: now + this.windowMs };
        
        if (now > userAttempts.resetTime) {
            userAttempts.count = 0;
            userAttempts.resetTime = now + this.windowMs;
        }
        
        if (userAttempts.count >= this.maxAttempts) {
            return false;
        }
        
        userAttempts.count++;
        this.attempts.set(key, userAttempts);
        return true;
    }

    /**
     * Reseta o contador para uma chave
     * @param {string} key - Chave para resetar
     */
    reset(key) {
        this.attempts.delete(key);
    }
}

// Instância global do rate limiter
export const rateLimiter = new RateLimiter();

/**
 * Valida configurações de ambiente
 * @returns {boolean} - true se configurações são válidas
 */
export function validateEnvironment() {
    const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    
    for (const varName of requiredVars) {
        if (!window[varName] && !process.env[varName]) {
            console.error(`Missing required environment variable: ${varName}`);
            return false;
        }
    }
    
    return true;
}

/**
 * Sanitiza dados para logs (remove informações sensíveis)
 * @param {any} data - Dados para sanitizar
 * @returns {any} - Dados sanitizados
 */
export function sanitizeForLogging(data) {
    if (typeof data !== 'object' || data === null) {
        return data;
    }
    
    const sanitized = { ...data };
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth', 'credential'];
    
    for (const key in sanitized) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object') {
            sanitized[key] = sanitizeForLogging(sanitized[key]);
        }
    }
    
    return sanitized;
}
