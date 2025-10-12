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
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

// Função para determinar o tipo de conteúdo
function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
        '.ttf': 'font/ttf',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2'
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
    } else if (req.url === '/original') {
        filePath = './index-backup.html';
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
