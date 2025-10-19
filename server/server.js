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
  res.json({
    playersOnline: 0, // TODO: Implementar cache manager
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  });
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
  
  // TODO: Sincronizar cache com Supabase
  
  server.close(() => {
    logger.info('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.warn('⚠️  SIGINT received, shutting down gracefully...');
  
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
    // Validar conexão Supabase
    const supabaseOk = await validateSupabaseConnection();
    if (!supabaseOk) {
      logger.warn('⚠️  Supabase connection failed, but server will start anyway');
    }
    
    // Iniciar servidor
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 WebSocket ready for connections`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

