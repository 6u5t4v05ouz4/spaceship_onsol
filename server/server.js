// =====================================================
// SPACE CRYPTO MINER - Real-time Server
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
import logger from './utils/logger.js';
import { supabaseAdmin, validateSupabaseConnection } from './config/supabase.js';
import { initRedis, closeRedis } from './config/redis.js';
import cacheManager from './managers/cache-manager.js';
import authMiddleware from './middleware/auth-middleware.js';
import {
  handleAuth,
  handleChunkEnter,
  handlePlayerMove,
  handleDisconnect,
} from './events/player-events.js';
import { handleAttack, handleRespawn } from './events/battle-events.js';

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

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(rootDir, 'dist')));

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

app.get('/metrics', (req, res) => {
  const stats = cacheManager.getStats();
  
  res.json({
    playersOnline: stats.playersOnline,
    totalUpdates: stats.totalUpdates,
    totalCriticalUpdates: stats.totalCriticalUpdates,
    pendingCriticalUpdates: stats.pendingCriticalUpdates,
    pendingBatchUpdates: stats.pendingBatchUpdates,
    lastSyncAt: stats.lastSyncAt,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// =====================================================
// PROTECTED ENDPOINTS (Exemplo)
// =====================================================

// Endpoint protegido de exemplo
app.get('/api/player/state', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('player_state')
      .select('*')
      .eq('user_id', req.userId)
      .single();

    if (error) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Player state não encontrado',
      });
    }

    res.json(data);
  } catch (error) {
    logger.error('❌ Erro ao buscar player state:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Erro ao buscar estado do jogador',
    });
  }
});

// =====================================================
// SOCKET.IO SETUP
// =====================================================

const io = new Server(server, {
  cors: {
    origin: [
      'https://spaceshiponsol.vercel.app',
      'https://spaceship-onsol-production.up.railway.app',
      process.env.CORS_ORIGIN || process.env.RAILWAY_PUBLIC_DOMAIN
    ].filter(Boolean), // Remove valores undefined/null
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Connection handler
io.on('connection', (socket) => {
  logger.info(`🔌 Client connected: ${socket.id}`);

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
});

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

process.on('SIGTERM', async () => {
  logger.warn('⚠️  SIGTERM received, shutting down gracefully...');
  
  // Parar cache manager (sync final)
  cacheManager.stop();
  
  // Fechar Redis
  await closeRedis();
  
  server.close(() => {
    logger.info('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.warn('⚠️  SIGINT received, shutting down gracefully...');
  
  // Parar cache manager (sync final)
  cacheManager.stop();
  
  // Fechar Redis
  await closeRedis();
  
  server.close(() => {
    logger.info('✅ Server closed');
    process.exit(0);
  });
});

// =====================================================
// SPA FALLBACK
// =====================================================

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
    // 1. Validar conexão Supabase
    const supabaseOk = await validateSupabaseConnection();
    if (!supabaseOk) {
      logger.warn('⚠️  Supabase connection failed, but server will start anyway');
    }
    
    // 2. Inicializar Redis (opcional)
    await initRedis();
    
    // 3. Iniciar Cache Manager
    cacheManager.start();
    
    // 4. Iniciar servidor
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 WebSocket ready for connections`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`📊 Metrics: http://localhost:${PORT}/metrics`);
      logger.info(`🌐 Railway Public Domain: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'Not set'}`);
      logger.info(`🔧 CORS Origin: ${process.env.CORS_ORIGIN || 'Not set'}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

