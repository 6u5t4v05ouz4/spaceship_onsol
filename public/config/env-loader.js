// Carregador de Variáveis de Ambiente - Space Crypto Miner
// Arquivo: src/config/env-loader.js

/**
 * Carrega variáveis de ambiente do arquivo .env
 * Este arquivo deve ser executado no servidor antes de servir o HTML
 */

import fs from 'fs';
import path from 'path';

/**
 * Carrega variáveis de ambiente do arquivo .env
 * @param {string} envPath - Caminho para o arquivo .env
 * @returns {object} Objeto com as variáveis de ambiente
 */
export function loadEnvFile(envPath = '.env') {
    try {
        const envFile = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        
        envFile.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    envVars[key.trim()] = valueParts.join('=').trim();
                }
            }
        });
        
        console.log('✅ Variáveis de ambiente carregadas do .env');
        return envVars;
    } catch (error) {
        console.warn('⚠️ Arquivo .env não encontrado, usando configurações padrão');
        return {};
    }
}

/**
 * Injeta variáveis de ambiente no HTML
 * @param {string} html - Conteúdo HTML
 * @param {object} envVars - Variáveis de ambiente
 * @returns {string} HTML com variáveis injetadas
 */
export function injectEnvIntoHTML(html, envVars) {
    const envScript = `
        <script>
            // Variáveis de ambiente injetadas pelo servidor
            window.SUPABASE_URL = '${envVars.SUPABASE_URL || ''}';
            window.SUPABASE_ANON_KEY = '${envVars.SUPABASE_ANON_KEY || ''}';
            window.NODE_ENV = '${envVars.NODE_ENV || 'development'}';
            window.DEBUG_MODE = '${envVars.DEBUG_MODE || 'true'}';
            window.GAME_VERSION = '${envVars.GAME_VERSION || '1.0.0'}';
        </script>
    `;
    
    // Injeta antes do fechamento do </head>
    return html.replace('</head>', envScript + '\n</head>');
}

/**
 * Valida se as variáveis obrigatórias estão presentes
 * @param {object} envVars - Variáveis de ambiente
 * @returns {boolean} True se todas as variáveis obrigatórias estão presentes
 */
export function validateRequiredEnvVars(envVars) {
    const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const missing = required.filter(key => !envVars[key]);
    
    if (missing.length > 0) {
        console.error('❌ Variáveis de ambiente obrigatórias ausentes:', missing);
        return false;
    }
    
    console.log('✅ Todas as variáveis obrigatórias estão presentes');
    return true;
}

// Exemplo de uso (apenas para demonstração)
if (import.meta.url === `file://${process.argv[1]}`) {
    const envVars = loadEnvFile();
    console.log('Variáveis carregadas:', Object.keys(envVars));
    validateRequiredEnvVars(envVars);
}
