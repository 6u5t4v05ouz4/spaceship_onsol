// Servidor de desenvolvimento simples
// Execute com: node dev-server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Função para servir arquivos estáticos
function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        
        // Headers para fontes
        const headers = { 'Content-Type': contentType };
        if (filePath.endsWith('.ttf') || filePath.endsWith('.woff') || filePath.endsWith('.woff2')) {
            headers['Access-Control-Allow-Origin'] = '*';
            headers['Cache-Control'] = 'public, max-age=31536000';
        }
        
        res.writeHead(200, headers);
        res.end(data);
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
    
    // Roteamento para desenvolvimento
    if (req.url === '/') {
        // Em desenvolvimento, serve login.html
        filePath = './login.html';
    } else if (req.url === '/login') {
        filePath = './login.html';
    } else if (req.url === '/game') {
        filePath = './game.html';
        } else if (req.url === '/soon') {
            filePath = './soon.html';
    } else if (req.url === '/profile') {
        filePath = './profile.html';
    } else if (req.url === '/dashboard') {
        filePath = './dashboard.html';
    } else if (req.url === '/test-auth') {
        filePath = './test-auth.html';
    } else if (req.url === '/debug-auth') {
        filePath = './debug-auth.html';
    } else if (req.url === '/test-profile-save') {
        filePath = './test-profile-save.html';
        } else if (req.url === '/test-auth-session') {
            filePath = './test-auth-session.html';
        } else if (req.url === '/debug-session') {
            filePath = './debug-session.html';
        } else if (req.url === '/auth-callback') {
            filePath = './auth-callback.html';
    } else if (req.url === '/test-supabase') {
        filePath = './test-supabase.html';
        } else if (req.url === '/original') {
            filePath = './index-backup.html';
    } else if (req.url.startsWith('/assets/')) {
        // Servir arquivos da pasta public/assets
        filePath = './public' + req.url;
    } else if (req.url.startsWith('/src/')) {
        // Servir arquivos da pasta src
        filePath = '.' + req.url;
    }
    
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
