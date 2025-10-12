// Configuração de desenvolvimento
// Para alternar entre desenvolvimento e produção, altere o valor abaixo

const DEV_CONFIG = {
    // true = desenvolvimento (mostra login), false = produção (mostra soon)
    isDevelopment: true,
    
    // URLs disponíveis
    urls: {
        login: '/login',
        game: '/game',
        soon: '/',
        original: '/original'
    }
};

// Função para verificar se está em desenvolvimento
function isDevelopment() {
    return DEV_CONFIG.isDevelopment;
}

// Função para obter a URL correta baseada no ambiente
function getMainUrl() {
    return isDevelopment() ? DEV_CONFIG.urls.login : DEV_CONFIG.urls.soon;
}

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DEV_CONFIG, isDevelopment, getMainUrl };
} else {
    window.DEV_CONFIG = DEV_CONFIG;
    window.isDevelopment = isDevelopment;
    window.getMainUrl = getMainUrl;
}
