// =====================================================
// SPACE CRYPTO MINER - Real-time Server (Simplified)
// =====================================================
// Version: 1.0.0
// Node.js + Express + Socket.io + Supabase

// IMPORTANTE: Carregar variáveis de ambiente PRIMEIRO
import './load-env.js';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initMultiplayer } from './multiplayer-handlers.js';

// =====================================================
// PATH SETUP
// =====================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// =====================================================
// EXPRESS SETUP
// =====================================================

const app = express();
const server = createServer(app);

// Middleware
app.use(cors({
  origin: [
    'https://spaceshiponsol.vercel.app',
    'https://spaceship-onsol-production.up.railway.app',
    process.env.CORS_ORIGIN || process.env.RAILWAY_PUBLIC_DOMAIN
  ].filter(Boolean), // Remove valores undefined/null
  credentials: true
}));
app.use(express.json());

// Servir arquivos estáticos do frontend (DEPOIS das rotas da API)
// app.use(express.static(path.join(rootDir, 'dist')));

// Servir game.html diretamente (não processado pelo Vite)
app.get('/game.html', (req, res) => {
  res.sendFile(path.join(rootDir, 'game.html'));
});

// =====================================================
// HEALTH CHECK ENDPOINTS
// =====================================================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// =====================================================
// API ENDPOINTS (Simplified)
// =====================================================

// Endpoint de exemplo para teste
app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API working',
    timestamp: Date.now()
  });
});

// Endpoint de informações do servidor
app.get('/api/info', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    timestamp: Date.now(),
    features: {
      websocket: true,
      static_files: true,
      spa_fallback: true
    }
  });
});

// =====================================================
// SOCKET.IO SETUP (Simplified)
// =====================================================

const io = new Server(server, {
  cors: {
    origin: [
      'https://spaceshiponsol.vercel.app',
      'https://spaceship-onsol-production.up.railway.app',
      process.env.CORS_ORIGIN || process.env.RAILWAY_PUBLIC_DOMAIN,
      'http://localhost:5173'
    ].filter(Boolean), // Remove valores undefined/null
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Connection handler (com multiplayer handlers)
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Ping-pong para teste de conexão
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  // Importar handlers do multiplayer
  import('./multiplayer-handlers.js').then(({
    handleAuth,
    handleChunkEnter,
    handlePlayerMove,
    handleAttack,
    handleRespawn,
    handleDisconnect
  }) => {
    // Event: auth (autenticação inicial)
    socket.on('auth', (data) => {
      handleAuth(socket, data, io);
    });

    // Event: chunk:enter (entrar em um chunk)
    socket.on('chunk:enter', (data) => {
      handleChunkEnter(socket, data, io);
    });

    // Event: player:move (atualizar posição)
    socket.on('player:move', (data) => {
      handlePlayerMove(socket, data, io);
    });

    // Event: battle:attack (atacar outro jogador)
    socket.on('battle:attack', (data) => {
      handleAttack(socket, data, io);
    });

    // Event: battle:respawn (respawn após morte)
    socket.on('battle:respawn', (data) => {
      handleRespawn(socket, data, io);
    });

    // Event: disconnect (desconexão)
    socket.on('disconnect', (reason) => {
      handleDisconnect(socket, reason, io);
    });
  }).catch(error => {
    console.error('❌ Erro ao carregar multiplayer handlers:', error);
  });
});

// =====================================================
// GRACEFUL SHUTDOWN (Simplified)
// =====================================================

process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// =====================================================
// SPA FALLBACK
// =====================================================

// Servir arquivos estáticos específicos (não interceptar rotas da API)
app.use('/assets', express.static(path.join(rootDir, 'dist/assets')));
app.use('/static', express.static(path.join(rootDir, 'dist/static')));
app.use('/game.html', express.static(path.join(rootDir, 'game.html')));

// Servir index.html para rotas específicas do frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'dist', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(rootDir, 'dist', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(rootDir, 'dist', 'index.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(rootDir, 'dist', 'index.html'));
});

// Fallback para SPA - todas as rotas não encontradas servem index.html
app.get('*', (req, res) => {
  // Não servir index.html para arquivos estáticos
  if (req.path.includes('.')) {
    return res.status(404).send('File not found');
  }
  
  res.sendFile(path.join(rootDir, 'dist', 'index.html'));
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Iniciar servidor IMEDIATAMENTE para não bloquear o healthcheck
    server.listen(PORT, '0.0.0.0', async () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 WebSocket ready for connections`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 Railway Public Domain: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'Not set'}`);
      console.log(`🔧 CORS Origin: ${process.env.CORS_ORIGIN || 'Not set'}`);
      console.log(`🔧 Process.env.PORT: ${process.env.PORT}`);
      console.log(`🔧 Server listening on: 0.0.0.0:${PORT}`);

      // Inicializar sistema multiplayer em segundo plano
      setTimeout(async () => {
        try {
          const multiplayerReady = await initMultiplayer();
          if (multiplayerReady) {
            console.log('✅ Multiplayer system ready');
          } else {
            console.log('⚠️ Multiplayer running in mock mode');
          }
        } catch (error) {
          console.error('❌ Failed to initialize multiplayer:', error);
        }
      }, 1000);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

