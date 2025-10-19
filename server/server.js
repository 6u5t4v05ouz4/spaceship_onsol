// =====================================================
// SPACE CRYPTO MINER - Real-time Server
// =====================================================
// Version: 1.0.0
// Node.js + Express + Socket.io + Supabase

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import logger from './utils/logger.js';
import { supabaseAdmin, validateSupabaseConnection } from './config/supabase.js';
import { initRedis, closeRedis } from './config/redis.js';
import cacheManager from './managers/cache-manager.js';
import authMiddleware from './middleware/auth-middleware.js';

// =====================================================
// EXPRESS SETUP
// =====================================================

const app = express();
const server = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

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
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Connection handler
io.on('connection', (socket) => {
  logger.info(`🔌 Client connected: ${socket.id}`);
  
  // TODO: Implementar event handlers
  socket.on('auth', (data) => {
    logger.debug(`Auth request from ${socket.id}`);
    // TODO: Implementar autenticação
  });
  
  socket.on('disconnect', (reason) => {
    logger.info(`❌ Client disconnected: ${socket.id} (${reason})`);
    // TODO: Implementar cleanup
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
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 WebSocket ready for connections`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`📊 Metrics: http://localhost:${PORT}/metrics`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

