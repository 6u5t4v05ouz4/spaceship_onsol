# 🚀 Deployment: Railway + Redis + Supabase

Guia passo a passo para fazer deploy do servidor Node.js em produção com otimizações de escalabilidade.

---

## 📋 Checklist Pré-Deploy

```
Infrastructure:
├─ [ ] Conta Railway criada
├─ [ ] Projeto Railway criado
├─ [ ] Redis (Railway ou externo)
├─ [ ] Supabase com RLS policies
└─ [ ] Domínio configurado (opcional)

Código:
├─ [ ] .env.local criado
├─ [ ] package.json pronto
├─ [ ] server.js testado localmente
├─ [ ] Redis connection testada
└─ [ ] Variáveis de ambiente definidas

Database:
├─ [ ] Migrations aplicadas
├─ [ ] Índices criados
├─ [ ] RLS policies ativas
└─ [ ] Connection pooling ativo
```

---

## 🏗️ Phase 1: Setup Local

### 1.1 Instalar Redis Localmente

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
redis-cli ping  # Deve retornar PONG
```

**Windows (Docker):**
```bash
docker run -d -p 6379:6379 redis:7-alpine
docker ps  # Verificar se está rodando
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
redis-cli ping  # Deve retornar PONG
```

### 1.2 Setup Project

```bash
# 1. Criar estrutura
mkdir server
cd server

# 2. Inicializar Node
npm init -y

# 3. Instalar dependências
npm install express socket.io @supabase/supabase-js bull redis dotenv cors
npm install -D nodemon

# 4. Criar .env.local
cat > .env.local << 'EOF'
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Redis
REDIS_URL=redis://localhost:6379

# Server
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Monitoring
LOG_LEVEL=debug
EOF

# 5. Update package.json
cat >> package.json << 'EOF'
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
EOF
```

### 1.3 Estrutura de Pastas

```bash
server/
├── server.js                    # Entry point
├── config/
│   ├── supabase.js             # Supabase client
│   └── redis.js                # Redis connection
├── managers/
│   ├── cache-manager.js        # Cache em memória
│   ├── queue-manager.js        # Fila de persistência
│   └── player-manager.js       # Estado de jogadores
├── engines/
│   ├── battle-engine.js        # Lógica de combate
│   ├── chunk-authority.js      # Arbitragem de zonas
│   └── zone-calculator.js      # Cálculo de zonas
├── events/
│   ├── player-events.js        # Eventos de jogador
│   ├── battle-events.js        # Eventos de combate
│   └── chunk-events.js         # Eventos de chunk
├── middleware/
│   └── auth-middleware.js      # JWT validation
├── utils/
│   ├── distance-calculator.js
│   ├── logger.js
│   └── metrics.js
└── package.json
```

---

## 🌐 Phase 2: Configurar Railway

### 2.1 Criar Conta e Projeto

```
1. Ir para railway.app
2. Sign up com GitHub
3. Criar novo projeto
4. "Deploy from GitHub" ou "Deploy from Repo"
5. Conectar repositório
```

### 2.2 Adicionar Serviços

#### A. Redis Database

```
1. Dashboard → Add Service
2. Selecionar "Redis"
3. Confirm
4. Esperar deploy (~2 min)
5. Copiar REDIS_URL
```

#### B. Node.js Server

```
1. GitHub → Conectar repositório
2. Selecionar branch `main`
3. Railway vai detectar Node.js automaticamente
4. Configurar variáveis de ambiente
```

### 2.3 Variáveis de Ambiente (Railway)

```
Em: Project → server → Variables

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

REDIS_URL=${{redis.REDIS_URL}}  # ← Automático

NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://seu-dominio.com

LOG_LEVEL=info
DEBUG=false
```

### 2.4 Health Check

```
Em: Project → server → Settings

Health Check URL: /health
Interval: 30s
Timeout: 10s
```

---

## 🔧 Phase 3: Código Necessário

### 3.1 server.js (Entry Point)

```js
// server/server.js
require('dotenv').config({ path: '.env.local' });

const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const http = require('http');

const supabaseManager = require('./config/supabase');
const redisManager = require('./config/redis');
const cacheManager = require('./managers/cache-manager');
const playerEvents = require('./events/player-events');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    redis: redisManager.isConnected ? 'connected' : 'disconnected'
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    playersOnline: cacheManager.getPlayersCount(),
    redisQueueSize: cacheManager.getQueueSize(),
    memoryUsage: process.memoryUsage()
  });
});

// Socket.io events
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  // Auth
  socket.on('auth', (data) => playerEvents.handleAuth(socket, data));
  
  // Chunk events
  socket.on('chunk:enter', (data) => playerEvents.handleChunkEnter(socket, data));
  
  // Player events
  socket.on('player:move', (data) => playerEvents.handleMove(socket, data));
  socket.on('mining:start', (data) => playerEvents.handleMiningStart(socket, data));
  socket.on('mining:complete', (data) => playerEvents.handleMiningComplete(socket, data));
  
  // Battle events
  socket.on('battle:attack', (data) => playerEvents.handleAttack(socket, data));
  
  // Disconnect
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
    playerEvents.handleDisconnect(socket);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.warn('SIGTERM received, shutting down gracefully');
  
  // Sincronizar dados em cache
  await cacheManager.syncAll();
  
  // Fechar Redis
  await redisManager.close();
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Metrics available at http://localhost:${PORT}/metrics`);
});

module.exports = { app, io };
```

### 3.2 config/supabase.js

```js
// server/config/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabase, supabaseAdmin };
```

### 3.3 config/redis.js

```js
// server/config/redis.js
const redis = require('redis');
const logger = require('../utils/logger');

let client;
let isConnected = false;

async function connect() {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis max retries exceeded');
            return new Error('Redis connection failed');
          }
          return retries * 100;
        }
      }
    });

    client.on('error', (err) => logger.error('Redis error:', err));
    client.on('connect', () => {
      logger.info('✅ Redis connected');
      isConnected = true;
    });

    await client.connect();
    return client;
  } catch (err) {
    logger.error('Failed to connect to Redis:', err);
    throw err;
  }
}

async function close() {
  if (client) {
    await client.quit();
    isConnected = false;
  }
}

module.exports = {
  connect,
  close,
  getClient: () => client,
  isConnected: () => isConnected
};
```

### 3.4 managers/cache-manager.js

```js
// server/managers/cache-manager.js
const logger = require('../utils/logger');

class CacheManager {
  constructor() {
    this.playersOnline = new Map();
    this.chunksActive = new Map();
    this.criticalUpdates = new Set();
    this.batchUpdates = new Set();
  }

  // Adicionar jogador online
  addPlayer(playerId, playerData) {
    this.playersOnline.set(playerId, {
      ...playerData,
      lastUpdateTime: Date.now()
    });
    logger.debug(`Player added to cache: ${playerId}`);
  }

  // Remover jogador
  removePlayer(playerId) {
    this.playersOnline.delete(playerId);
    this.criticalUpdates.delete(playerId);
    this.batchUpdates.delete(playerId);
    logger.debug(`Player removed from cache: ${playerId}`);
  }

  // Atualizar posição (sem persistir)
  updatePosition(playerId, x, y) {
    const player = this.playersOnline.get(playerId);
    if (player) {
      player.x = x;
      player.y = y;
      player.lastUpdateTime = Date.now();
    }
  }

  // Tomar dano (com persistência se morrer)
  takeDamage(playerId, damage) {
    const player = this.playersOnline.get(playerId);
    if (player) {
      player.health = Math.max(0, player.health - damage);
      
      // Se morreu, marcar para sync crítico
      if (player.health === 0) {
        this.criticalUpdates.add(playerId);
      }
      
      return player.health;
    }
    return null;
  }

  // Coletar recursos
  collectResources(playerId, amount) {
    const player = this.playersOnline.get(playerId);
    if (player) {
      player.resources = (player.resources || 0) + amount;
      this.batchUpdates.add(playerId);
    }
  }

  // Getters
  getPlayer(playerId) {
    return this.playersOnline.get(playerId);
  }

  getPlayersCount() {
    return this.playersOnline.size;
  }

  getPlayersInChunk(chunkId) {
    return Array.from(this.playersOnline.values())
      .filter(p => p.currentChunk === chunkId);
  }

  // Sincronizar com Supabase
  async syncCritical(supabaseAdmin) {
    const updates = Array.from(this.criticalUpdates)
      .map(playerId => this.playersOnline.get(playerId))
      .filter(p => p && p.health === 0);

    if (updates.length > 0) {
      await supabaseAdmin.from('players').upsert(
        updates.map(p => ({
          id: p.id,
          health: p.health,
          updated_at: new Date()
        }))
      );
      
      this.criticalUpdates.clear();
      logger.info(`✅ Synced ${updates.length} critical updates`);
    }
  }

  async syncBatch(supabaseAdmin) {
    const updates = Array.from(this.batchUpdates)
      .map(playerId => this.playersOnline.get(playerId))
      .filter(p => p);

    if (updates.length > 0) {
      await supabaseAdmin.from('players').upsert(
        updates.map(p => ({
          id: p.id,
          resources: p.resources,
          updated_at: new Date()
        }))
      );
      
      this.batchUpdates.clear();
      logger.info(`✅ Synced ${updates.length} batch updates`);
    }
  }
}

module.exports = new CacheManager();
```

---

## 📊 Phase 4: Database Setup

### 4.1 RLS Policies (Supabase)

```sql
-- Habilitar RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_logs ENABLE ROW LEVEL SECURITY;

-- Policies para players
CREATE POLICY "Users can view own data"
ON players FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
ON players FOR UPDATE
USING (auth.uid() = id);

-- Chunks públicos para leitura
CREATE POLICY "Chunks are public"
ON chunks FOR SELECT
USING (true);

-- Battle logs: ambos combatentes podem ler
CREATE POLICY "Players can view own battles"
ON battle_logs FOR SELECT
USING (
  auth.uid() = attacker_id OR 
  auth.uid() = defender_id
);
```

### 4.2 Connection Pooling

```
Supabase Dashboard:
1. Project Settings
2. Database
3. Connection Pooling → ON
4. Mode: Transaction
5. Max pool size: 30
```

### 4.3 Índices

```sql
-- Performance essencial
CREATE INDEX idx_players_chunk ON players(current_chunk);
CREATE INDEX idx_players_online ON players(is_online);
CREATE INDEX idx_chunks_zone ON chunks(zone_type);
CREATE INDEX idx_chunks_distance ON chunks(distance_from_origin);
CREATE INDEX idx_battle_chunk ON battle_logs(chunk_id);
CREATE INDEX idx_battle_created ON battle_logs(created_at DESC);
```

---

## 🔐 Phase 5: Monitoramento e Logs

### 5.1 Logger Configuration

```js
// server/utils/logger.js
const fs = require('fs');
const path = require('path');

const LOG_LEVEL = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const CURRENT_LEVEL = LOG_LEVEL[process.env.LOG_LEVEL || 'info'];

class Logger {
  log(level, message, data = {}) {
    if (LOG_LEVEL[level] < CURRENT_LEVEL) return;

    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    console.log(formatted, data);

    // Salvar em arquivo
    if (process.env.NODE_ENV === 'production') {
      const logFile = path.join('/tmp', `server-${new Date().toISOString().split('T')[0]}.log`);
      fs.appendFileSync(logFile, `${formatted} ${JSON.stringify(data)}\n`);
    }
  }

  debug(msg, data) { this.log('debug', msg, data); }
  info(msg, data) { this.log('info', msg, data); }
  warn(msg, data) { this.log('warn', msg, data); }
  error(msg, data) { this.log('error', msg, data); }
}

module.exports = new Logger();
```

### 5.2 Metrics Endpoint

```js
// GET /metrics
{
  "status": "ok",
  "timestamp": 1728000000,
  "uptime": 3600,
  "playersOnline": 42,
  "redisQueueSize": 5,
  "memoryUsage": {
    "heapUsed": 52428800,
    "heapTotal": 104857600
  }
}
```

---

## 📈 Phase 6: Deploy Final

### 6.1 GitHub Setup

```bash
# 1. Criar repo
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/space-crypto-miner.git
git push -u origin main

# 2. Railway vai detectar automaticamente
```

### 6.2 Deploy Steps

```
1. Railway Dashboard
2. New Service → GitHub
3. Selecionar seu repo
4. Selecionar branch `main`
5. Confirmar
6. Esperar deploy (~3-5 min)
7. Verificar Logs
```

### 6.3 Verificar Deploy

```bash
# Health check
curl https://seu-projeto.railway.app/health

# Metrics
curl https://seu-projeto.railway.app/metrics

# Logs
railway logs  # Localmente com Railway CLI
```

---

## 🔧 Phase 7: Troubleshooting

### Erro: "Redis connection refused"

```
1. Verificar REDIS_URL em Railway
2. Verificar se Redis está rodando
3. Aumentar timeout:
   socket: { connectTimeout: 10000 }
```

### Erro: "Supabase not responding"

```
1. Verificar credenciais em .env
2. Verificar RLS policies
3. Aumentar connection pool
```

### Erro: "Out of memory"

```
1. Implementar limitação de cache:
   if (playersOnline.size > 5000) {
     removeOldestInactivePlayer();
   }

2. Monitorar heap:
   node --max-old-space-size=512 server.js
```

### Erro: "Socket.io timeout"

```
1. Aumentar timeout:
   io.engine.pingInterval = 25000;
   io.engine.pingTimeout = 60000;

2. Verificar CORS_ORIGIN
```

---

## 📊 Performance Benchmarks

### Target Production

```
Métricas esperadas:
├─ Latência P2P: 50-150ms
├─ CPU: 30-50%
├─ Memory: 200-400MB
├─ Supabase requests: 10-20 req/s
└─ Jogadores simultâneos: 100-500
```

### Monitorar

```bash
# Localmente
npm run dev

# Production (Railway CLI)
railway logs --tail

# Métricas
curl https://seu-projeto.railway.app/metrics | jq
```

---

## 🚀 Scaling (Futuro)

### 1. Múltiplas Instâncias

```
Railway Auto-scaling:
1. Project → server → Settings
2. "Disk Auto-scaling" → ON
3. "Memory Auto-scaling" → ON
```

### 2. Redis Cluster

```
Para 1000+ jogadores:
1. Usar Railway Redis com persistência
2. Implementar Redis Sentinel
3. Backup automático
```

### 3. Load Balancer

```
Nginx + Railway:
1. Deploy Nginx no Railway
2. Redirecionar tráfego para múltiplas instâncias
3. Sticky sessions para Socket.io
```

---

## ✅ Checklist Deploy

```
Antes de ir para produção:
├─ [ ] Testes locais com 100+ jogadores
├─ [ ] Logs configurados
├─ [ ] Métricas monitorizadas
├─ [ ] Health check respondendo
├─ [ ] RLS policies ativas
├─ [ ] Índices criados
├─ [ ] Redis conectando
├─ [ ] Supabase respondendo
├─ [ ] CORS configurado corretamente
├─ [ ] Variáveis de ambiente na Railway
├─ [ ] Domínio/URL configurada
└─ [ ] Backups automáticos habilitados
```

---

**Versão**: v1.0  
**Atualizado**: Outubro 2025  
**Status**: 🟢 Pronto para produção
