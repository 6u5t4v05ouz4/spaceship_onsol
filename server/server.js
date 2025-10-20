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
import databaseService from './services/database-service.js';
import chunkGenerator from './services/chunk-generator.js';
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

app.get('/api/database/test', async (req, res) => {
  try {
    if (!databaseService.pool) {
      return res.status(503).json({
        error: 'Database not connected',
        message: 'PostgreSQL connection not available'
      });
    }
    
    const client = await databaseService.pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    client.release();
    
    res.json({
      status: 'ok',
      database: 'PostgreSQL',
      current_time: result.rows[0].current_time,
      version: result.rows[0].postgres_version
    });
  } catch (error) {
    logger.error('❌ Erro ao testar PostgreSQL:', error);
    res.status(500).json({
      error: 'Database connection failed',
      message: error.message
    });
  }
});

// Endpoint para buscar elementos do chunk
app.get('/api/chunk/:chunkX/:chunkY/elements', async (req, res) => {
  try {
    const chunkX = parseInt(req.params.chunkX);
    const chunkY = parseInt(req.params.chunkY);
    
    // Se PostgreSQL não estiver conectado, retornar elementos vazios
    if (!databaseService.pool) {
      logger.warn('⚠️ PostgreSQL não conectado, retornando elementos vazios');
      return res.json({
        status: 'ok',
        chunkX,
        chunkY,
        elements: [],
        count: 0,
        warning: 'Database not connected'
      });
    }
    
    // Gerar elementos se não existirem
    const elements = await chunkGenerator.generateChunkElements(chunkX, chunkY);
    
    res.json({
      status: 'ok',
      chunkX,
      chunkY,
      elements: elements,
      count: elements.length
    });
  } catch (error) {
    logger.error('❌ Erro ao buscar elementos do chunk:', error);
    res.status(500).json({
      error: 'Failed to get chunk elements',
      message: error.message
    });
  }
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

// Servir arquivos estáticos do frontend (DEPOIS das rotas da API)
app.use(express.static(path.join(rootDir, 'dist')));

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
    
    // 2. Inicializar PostgreSQL (opcional)
    try {
      await databaseService.connect();
      logger.info('✅ PostgreSQL conectado com sucesso');
    } catch (error) {
      logger.warn('⚠️  PostgreSQL connection failed, server will start without database:', error.message);
    }
    
    // 3. Inicializar Redis (opcional)
    await initRedis();
    
    // 4. Iniciar Cache Manager
    cacheManager.start();
    
    // 5. Iniciar servidor
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 WebSocket ready for connections`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`📊 Metrics: http://localhost:${PORT}/metrics`);
      logger.info(`🌐 Railway Public Domain: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'Not set'}`);
      logger.info(`🔧 CORS Origin: ${process.env.CORS_ORIGIN || 'Not set'}`);
      logger.info(`🔧 Process.env.PORT: ${process.env.PORT}`);
      logger.info(`🔧 Server listening on: 0.0.0.0:${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

