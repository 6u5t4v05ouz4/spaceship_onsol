// Tratamento de Erros Seguro - Space Crypto Miner
// Arquivo: src/utils/error-handler.js

import { sanitizeForLogging, isDevelopment } from './security.js';

/**
 * Mensagens de erro seguras para o usuário
 */
const ERROR_MESSAGES = {
    // Erros de autenticação
    'auth_failed': 'Falha na autenticação. Tente novamente.',
    'auth_cancelled': 'Autenticação cancelada.',
    'auth_timeout': 'Tempo limite de autenticação. Tente novamente.',
    'invalid_credentials': 'Credenciais inválidas.',
    
    // Erros de rede
    'network_error': 'Erro de conexão. Verifique sua internet.',
    'timeout': 'Tempo limite da requisição. Tente novamente.',
    'connection_refused': 'Conexão recusada. Tente novamente.',
    
    // Erros de configuração
    'config_error': 'Erro de configuração. Contate o suporte.',
    'missing_config': 'Configuração ausente. Contate o suporte.',
    'invalid_config': 'Configuração inválida. Contate o suporte.',
    
    // Erros de rate limiting
    'rate_limit': 'Muitas tentativas. Aguarde alguns minutos.',
    'too_many_requests': 'Muitas requisições. Aguarde alguns minutos.',
    
    // Erros de validação
    'validation_error': 'Dados inválidos. Verifique as informações.',
    'invalid_input': 'Entrada inválida. Verifique os dados.',
    'missing_required': 'Campos obrigatórios ausentes.',
    
    // Erros de permissão
    'permission_denied': 'Permissão negada.',
    'access_denied': 'Acesso negado.',
    'unauthorized': 'Não autorizado.',
    
    // Erros de servidor
    'server_error': 'Erro interno do servidor. Tente novamente.',
    'service_unavailable': 'Serviço indisponível. Tente novamente.',
    'maintenance': 'Sistema em manutenção. Tente mais tarde.',
    
    // Erro padrão
    'default': 'Ocorreu um erro inesperado. Tente novamente.'
};

/**
 * Mapeia códigos de erro do Supabase para mensagens seguras
 */
const SUPABASE_ERROR_MAP = {
    'invalid_grant': 'auth_failed',
    'invalid_request': 'auth_failed',
    'unauthorized_client': 'auth_failed',
    'unsupported_grant_type': 'auth_failed',
    'invalid_scope': 'auth_failed',
    'access_denied': 'auth_cancelled',
    'server_error': 'server_error',
    'temporarily_unavailable': 'service_unavailable'
};

/**
 * Mapeia códigos de erro HTTP para mensagens seguras
 */
const HTTP_ERROR_MAP = {
    400: 'validation_error',
    401: 'auth_failed',
    403: 'permission_denied',
    404: 'config_error',
    408: 'timeout',
    429: 'rate_limit',
    500: 'server_error',
    502: 'service_unavailable',
    503: 'service_unavailable',
    504: 'timeout'
};

/**
 * Extrai código de erro de diferentes tipos de erro
 * @param {Error|Object} error - Erro para analisar
 * @returns {string} - Código do erro
 */
function extractErrorCode(error) {
    // Erro do Supabase
    if (error.code) {
        return SUPABASE_ERROR_MAP[error.code] || error.code;
    }
    
    // Erro HTTP
    if (error.status) {
        return HTTP_ERROR_MAP[error.status] || 'default';
    }
    
    // Erro de rede
    if (error.name === 'NetworkError' || error.message?.includes('network')) {
        return 'network_error';
    }
    
    // Erro de timeout
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
        return 'timeout';
    }
    
    // Erro de validação
    if (error.name === 'ValidationError' || error.message?.includes('validation')) {
        return 'validation_error';
    }
    
    // Erro de configuração
    if (error.message?.includes('config') || error.message?.includes('missing')) {
        return 'config_error';
    }
    
    // Erro padrão
    return 'default';
}

/**
 * Obtém mensagem de erro segura para o usuário
 * @param {Error|Object} error - Erro original
 * @returns {string} - Mensagem segura
 */
export function getSafeErrorMessage(error) {
    // Log detalhado apenas em desenvolvimento
    if (isDevelopment()) {
        console.error('Detailed error:', sanitizeForLogging(error));
    } else {
        console.error('Error occurred:', error?.name || 'Unknown');
    }
    
    const errorCode = extractErrorCode(error);
    return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.default;
}

/**
 * Cria um erro customizado com mensagem segura
 * @param {string} code - Código do erro
 * @param {string} message - Mensagem adicional (opcional)
 * @returns {Error} - Erro customizado
 */
export function createSafeError(code, message = '') {
    const safeMessage = ERROR_MESSAGES[code] || ERROR_MESSAGES.default;
    const error = new Error(safeMessage);
    error.code = code;
    error.safeMessage = safeMessage;
    
    if (message && isDevelopment()) {
        error.details = message;
    }
    
    return error;
}

/**
 * Wrapper para funções assíncronas com tratamento de erro seguro
 * @param {Function} asyncFn - Função assíncrona
 * @param {string} context - Contexto do erro (opcional)
 * @returns {Function} - Função wrapper
 */
export function withSafeErrorHandling(asyncFn, context = '') {
    return async function(...args) {
        try {
            return await asyncFn.apply(this, args);
        } catch (error) {
            const safeMessage = getSafeErrorMessage(error);
            
            // Log com contexto
            if (context) {
                console.error(`Error in ${context}:`, sanitizeForLogging(error));
            }
            
            // Re-throw com mensagem segura
            const safeError = createSafeError(extractErrorCode(error), error.message);
            throw safeError;
        }
    };
}

/**
 * Handler global para erros não capturados
 */
export function setupGlobalErrorHandler() {
    // Erros não capturados
    window.addEventListener('error', (event) => {
        console.error('Uncaught error:', sanitizeForLogging({
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        }));
    });
    
    // Promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', sanitizeForLogging(event.reason));
    });
}

/**
 * Valida se um erro é conhecido e seguro
 * @param {Error} error - Erro para validar
 * @returns {boolean} - true se o erro é seguro
 */
export function isSafeError(error) {
    return error && error.safeMessage && ERROR_MESSAGES[error.code];
}

/**
 * Formata erro para exibição em UI
 * @param {Error} error - Erro para formatar
 * @returns {Object} - Objeto formatado para UI
 */
export function formatErrorForUI(error) {
    const safeMessage = getSafeErrorMessage(error);
    const errorCode = extractErrorCode(error);
    
    return {
        message: safeMessage,
        code: errorCode,
        isRetryable: ['network_error', 'timeout', 'server_error', 'service_unavailable'].includes(errorCode),
        retryAfter: ['rate_limit', 'too_many_requests'].includes(errorCode) ? 60000 : 0
    };
}
