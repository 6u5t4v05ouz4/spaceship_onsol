// Servidor de desenvolvimento simples
// Execute com: node dev-server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Carregar variáveis de ambiente do .env
function loadEnvFile() {
    try {
        const envFile = fs.readFileSync('.env', 'utf8');
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
        console.log('🔍 SUPABASE_URL:', envVars.SUPABASE_URL ? '✅ Definida' : '❌ Não definida');
        console.log('🔍 SUPABASE_ANON_KEY:', envVars.SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não definida');
        return envVars;
    } catch (error) {
        console.warn('⚠️ Arquivo .env não encontrado, usando configurações padrão');
        console.error('❌ Erro:', error.message);
        return {};
    }
}

// Carregar variáveis de ambiente
const envVars = loadEnvFile();

// Função para servir arquivos estáticos
function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        
        let content = data;
        
        // Se for um arquivo HTML, injetar variáveis de ambiente
        if (filePath.endsWith('.html')) {
            console.log(`🔧 Injetando variáveis em: ${filePath}`);
            console.log(`🔍 SUPABASE_URL: ${envVars.SUPABASE_URL ? '✅ Definida' : '❌ Não definida'}`);
            console.log(`🔍 SUPABASE_ANON_KEY: ${envVars.SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não definida'}`);
            
            const envScript = `
        <script>
            // Variáveis de ambiente injetadas pelo servidor
            window.SUPABASE_CONFIG = {
                url: '${envVars.SUPABASE_URL || ''}',
                anonKey: '${envVars.SUPABASE_ANON_KEY || ''}',
                redirectUrl: 'http://localhost:3000/auth-callback.html' // for local dev
            };
            window.NODE_ENV = '${envVars.NODE_ENV || 'development'}';
            window.DEBUG_MODE = '${envVars.DEBUG_MODE || 'true'}';
            window.GAME_VERSION = '${envVars.GAME_VERSION || '1.0.0'}';
        </script>
    `;
            
            // Injeta antes do fechamento do </head>
            content = data.toString().replace('</head>', envScript + '\n</head>');
        }
        
        // Headers para fontes
        const headers = { 'Content-Type': contentType };
        if (filePath.endsWith('.ttf') || filePath.endsWith('.woff') || filePath.endsWith('.woff2')) {
            headers['Access-Control-Allow-Origin'] = '*';
            headers['Cache-Control'] = 'public, max-age=31536000';
        }
        
        res.writeHead(200, headers);
        res.end(content);
    });
}

// Função para determinar o tipo de conteúdo
function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
        '.ttf': 'font/ttf',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.ogv': 'video/ogg'
    };
    return types[ext] || 'text/plain';
}

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    
    // Roteamento para desenvolvimento - SPA Fallback
    // Todas as rotas servem index.html, exceto:
    // 1. Arquivos estáticos (.js, .css, .png, etc)
    // 2. game.html (entry point separado)
    
    // Se tem extensão de arquivo, servir normalmente
    if (req.url.includes('.')) {
        // Arquivo estático - pode ter extensão
        filePath = '.' + req.url;
    } 
    // game.html é entry point separado
    else if (req.url === '/game') {
        filePath = './game.html';
    }
    // Qualquer outra rota sem extensão → serve index.html (SPA)
    else {
        filePath = './index.html';
    }
    
    // Normalizar path
    filePath = path.normalize(filePath);
    
    // Se não for um arquivo específico, tentar servir como arquivo estático
    if (filePath === '.' + req.url) {
        // Verificar se o arquivo existe
        if (!fs.existsSync(filePath)) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
    }
    
    const contentType = getContentType(filePath);
    serveFile(res, filePath, contentType);
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor de desenvolvimento rodando em http://localhost:${PORT}`);
    console.log(`📱 Login: http://localhost:${PORT}/login`);
    console.log(`🎮 Jogo: http://localhost:${PORT}/game`);
    console.log(`⏳ Soon: http://localhost:${PORT}/soon`);
    console.log(`📄 Original: http://localhost:${PORT}/original`);
});
