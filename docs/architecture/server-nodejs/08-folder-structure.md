# 📁 Folder Structure & Code Essentials

Organização de arquivos e código base do servidor Node.js.

---

## 🏗️ Estrutura de Pastas Completa

```
server/
├── server.js                    # Entry point principal
├── config/
│   ├── supabase.js             # Clientes Supabase (admin + anon)
│   └── redis.js                # Conexão Redis com retry
├── managers/
│   ├── cache-manager.js        # Cache em memória (players online)
│   ├── queue-manager.js        # Fila de persistência
│   └── player-manager.js       # Estado e validação de jogadores
├── engines/
│   ├── battle-engine.js        # Lógica de combate PvP
│   ├── chunk-authority.js      # Arbitragem de zonas (safe/hostile)
│   └── zone-calculator.js      # Cálculo de zonas por distância
├── events/
│   ├── player-events.js        # Eventos de movimento e ações
│   ├── battle-events.js        # Eventos de combate
│   └── chunk-events.js         # Eventos de carregamento de chunks
├── middleware/
│   ├── auth-middleware.js      # JWT validation e auth
│   └── error-handler.js        # Tratamento de erros
├── utils/
│   ├── logger.js               # Sistema de logging
│   ├── metrics.js              # Coleta de métricas
│   ├── distance-calculator.js  # Cálculos de distância
│   └── validators.js           # Validações de dados
├── .env.local                  # Variáveis de ambiente (local)
├── .env.production             # Variáveis de produção
├── package.json                # Dependências
├── package-lock.json           # Lock file
└── README.md                   # Documentação
```

---

## 📦 Dependências (package.json)

```json
{
  "name": "space-crypto-miner-server",
  "version": "1.0.0",
  "description": "Real-time server for SPACE CRYPTO MINER",
  "main": "server.js",
  "type": "module",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "test": "jest",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.0",
    "@supabase/supabase-js": "^2.38.0",
    "redis": "^4.6.0",
    "bull": "^4.11.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "uuid": "^9.0.0",
    "pino": "^8.16.0",
    "pino-pretty": "^10.2.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "eslint": "^8.50.0",
    "prettier": "^3.0.3",
    "jest": "^29.7.0"
  }
}
```

---

## 🔧 Código Base Essencial

### server.js (Entry Point)

```js
// server/server.js
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import logger from './utils/logger.js';
import { supabaseAdmin } from './config/supabase.js';
import redisManager from './config/redis.js';
import cacheManager from './managers/cache-manager.js';
import * as playerEvents from './events/player-events.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
    uptime: process.uptime()
  });
});

// Metrics
app.get('/metrics', (req, res) => {
  res.json({
    playersOnline: cacheManager.getPlayersCount(),
    memoryUsage: process.memoryUsage()
  });
});

// Socket.io connection
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('auth', (data) => playerEvents.handleAuth(socket, data, io));
  socket.on('chunk:enter', (data) => playerEvents.handleChunkEnter(socket, data, io));
  socket.on('player:move', (data) => playerEvents.handleMove(socket, data, io));
  socket.on('mining:complete', (data) => playerEvents.handleMiningComplete(socket, data, io));
  socket.on('battle:attack', (data) => playerEvents.handleAttack(socket, data, io));
  socket.on('disconnect', () => playerEvents.handleDisconnect(socket, io));
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.warn('Shutting down gracefully...');
  await cacheManager.syncAll();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
```

### config/supabase.js

```js
// server/config/supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const supabaseAnonClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
```

### config/redis.js

```js
// server/config/redis.js
import redis from 'redis';
import logger from '../utils/logger.js';

let client;
let isConnected = false;

export async function connectRedis() {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => retries > 10 ? new Error('Redis failed') : retries * 100
      }
    });

    client.on('error', (err) => logger.error('Redis error', err));
    client.on('connect', () => {
      logger.info('✅ Redis connected');
      isConnected = true;
    });

    await client.connect();
  } catch (err) {
    logger.error('Failed to connect Redis', err);
    throw err;
  }
}

export const getRedisClient = () => client;
export const isRedisConnected = () => isConnected;
```

### managers/cache-manager.js

```js
// server/managers/cache-manager.js
import logger from '../utils/logger.js';

class CacheManager {
  constructor() {
    this.playersOnline = new Map();
    this.criticalUpdates = new Set();
    this.batchUpdates = new Set();
  }

  addPlayer(playerId, playerData) {
    this.playersOnline.set(playerId, {
      ...playerData,
      lastUpdate: Date.now()
    });
    logger.debug(`Player added: ${playerId}`);
  }

  removePlayer(playerId) {
    this.playersOnline.delete(playerId);
    this.criticalUpdates.delete(playerId);
    this.batchUpdates.delete(playerId);
  }

  updatePosition(playerId, x, y) {
    const player = this.playersOnline.get(playerId);
    if (player) {
      player.x = x;
      player.y = y;
    }
  }

  takeDamage(playerId, damage) {
    const player = this.playersOnline.get(playerId);
    if (player) {
      player.health = Math.max(0, player.health - damage);
      if (player.health === 0) {
        this.criticalUpdates.add(playerId);
      }
      return player.health;
    }
    return null;
  }

  collectResources(playerId, amount) {
    const player = this.playersOnline.get(playerId);
    if (player) {
      player.resources = (player.resources || 0) + amount;
      this.batchUpdates.add(playerId);
    }
  }

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

  async syncAll() {
    // Sincronizar dados críticos
    // Implementado em 09-setup-deployment.md
  }
}

export default new CacheManager();
```

### utils/logger.js

```js
// server/utils/logger.js
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'production' ? {} : {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

export default logger;
```

---

## 📋 Convenções de Código

### Nomenclatura

```
Arquivos:
├─ camelCase.js      (componentes)
├─ PascalCase.js     (classes/serviços)
└─ snake_case.sql    (migrations)

Variáveis:
├─ camelCase         (variáveis/funções)
├─ UPPER_CASE        (constantes)
└─ $variable         (Supabase placeholders)

Socket Events:
├─ entity:action     (player:move, chunk:enter)
├─ prefix:action     (mining:start, battle:attack)
└─ Sempre kebab-case
```

### Importações ES6

```js
// ✅ Preferir
import { createClient } from '@supabase/supabase-js';
import logger from './utils/logger.js';

// ❌ Evitar
const { createClient } = require('@supabase/supabase-js');
const logger = require('./utils/logger.js');
```

---

## 🧪 Arquivo .env

### Development (.env.local)

```bash
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

# Logging
LOG_LEVEL=debug
```

### Production (.env.production)

```bash
# Supabase (Railway environment)
SUPABASE_URL=${{SUPABASE_URL}}
SUPABASE_ANON_KEY=${{SUPABASE_ANON_KEY}}
SUPABASE_SERVICE_ROLE_KEY=${{SUPABASE_SERVICE_ROLE_KEY}}

# Redis (Railway environment)
REDIS_URL=${{REDIS_URL}}

# Server
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://seu-dominio.com

# Logging
LOG_LEVEL=info
```

---

## ✅ Checklist Estrutura

```
Arquivos de Configuração:
├─ [ ] server.js
├─ [ ] package.json
├─ [ ] .env.local
├─ [ ] .gitignore

Estrutura de Diretórios:
├─ [ ] config/
├─ [ ] managers/
├─ [ ] engines/
├─ [ ] events/
├─ [ ] middleware/
├─ [ ] utils/

Arquivo Essenciais:
├─ [ ] config/supabase.js
├─ [ ] config/redis.js
├─ [ ] managers/cache-manager.js
├─ [ ] utils/logger.js
└─ [ ] events/player-events.js
```

---

**Próxima Leitura**: [09 - Setup & Deployment](./09-setup-deployment.md)
