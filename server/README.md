# 🚀 Space Crypto Miner - Servidor Node.js

Servidor real-time para o jogo Space Crypto Miner, construído com Node.js, Express, Socket.io e Supabase.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Setup](#setup)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Endpoints](#endpoints)
- [Eventos WebSocket](#eventos-websocket)
- [Sistemas](#sistemas)
- [Testes](#testes)
- [Deploy](#deploy)

---

## 🎯 Visão Geral

Servidor Node.js que gerencia:
- ✅ Autenticação via JWT (Supabase)
- ✅ Estado em tempo real de jogadores (cache in-memory)
- ✅ Geração procedural de chunks e asteroides
- ✅ Sistema de zonas (safe, transition, hostile)
- ✅ Combate PvP com validação
- ✅ Persistência no Supabase
- ✅ WebSocket para comunicação real-time

---

## 🏗️ Arquitetura

```
┌─────────────┐
│   Cliente   │ (Frontend)
└──────┬──────┘
       │ WebSocket (Socket.io)
       ▼
┌─────────────────────────────────┐
│     Servidor Node.js            │
│                                 │
│  ┌──────────────────────────┐  │
│  │  Cache Manager           │  │
│  │  (In-memory state)       │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │  Zone Manager            │  │
│  │  (Cálculo de zonas)      │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │  Chunk Generator         │  │
│  │  (Geração procedural)    │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │  Battle Engine           │  │
│  │  (Sistema de combate)    │  │
│  └──────────────────────────┘  │
└────────────┬────────────────────┘
             │
             ▼
      ┌─────────────┐
      │  Supabase   │ (PostgreSQL + Auth)
      └─────────────┘
```

---

## 🛠️ Tecnologias

- **Node.js** 18+
- **Express** 4.x - Framework HTTP
- **Socket.io** 4.x - WebSocket real-time
- **Supabase** - PostgreSQL + Auth + Storage
- **Pino** - Logger estruturado
- **dotenv** - Variáveis de ambiente
- **Redis** (opcional) - Cache distribuído

---

## 🚀 Setup

### 1. Instalar Dependências

```bash
cd server
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env.local`:

```bash
cp env.example .env.local
```

Edite `.env.local` e adicione suas credenciais:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
PORT=3001
NODE_ENV=development
```

**Obter credenciais:**
1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Settings → API
3. Copie `URL`, `anon key` e `service_role key`

### 3. Aplicar Schema no Supabase

```bash
# Via Supabase Dashboard
1. SQL Editor
2. Copiar migrations/001_initial_schema.sql
3. Run
```

Ver detalhes em: [`migrations/README.md`](./migrations/README.md)

### 4. Iniciar Servidor

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

**Servidor rodando em:** `http://localhost:3001`

---

## 📁 Estrutura de Pastas

```
server/
├── config/
│   ├── supabase.js         # Clientes Supabase (admin + anon)
│   └── redis.js            # Conexão Redis (opcional)
├── managers/
│   ├── cache-manager.js    # Gerenciamento de estado em memória
│   └── zone-manager.js     # Cálculo de zonas e regras
├── engines/
│   ├── chunk-generator.js  # Geração procedural de chunks
│   └── battle-engine.js    # Sistema de combate PvP
├── events/
│   ├── player-events.js    # Handlers de jogadores
│   └── battle-events.js    # Handlers de combate
├── middleware/
│   └── auth-middleware.js  # Validação JWT
├── utils/
│   └── logger.js           # Logger Pino
├── migrations/
│   ├── 001_initial_schema.sql
│   └── README.md
├── load-env.js             # Carregamento de .env
├── server.js               # Entry point
├── package.json
└── README.md
```

---

## 🌐 Endpoints

### `GET /health`
**Público**  
Status do servidor.

```json
{
  "status": "ok",
  "timestamp": 1729357200000,
  "uptime": 123.45,
  "version": "1.0.0"
}
```

### `GET /metrics`
**Público**  
Métricas do cache e servidor.

```json
{
  "playersOnline": 42,
  "totalUpdates": 1234,
  "totalCriticalUpdates": 5,
  "pendingCriticalUpdates": 0,
  "pendingBatchUpdates": 12,
  "lastSyncAt": "2025-10-19T17:45:00.000Z",
  "memoryUsage": { ... },
  "uptime": 123.45
}
```

### `GET /api/player/state`
**Protegido (JWT)**  
Estado do jogador autenticado.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "username": "Player1",
  "x": 100,
  "y": 200,
  "current_chunk": "10,5",
  "health": 100,
  "max_health": 100,
  "resources": 500
}
```

---

## 📡 Eventos WebSocket

### Cliente → Servidor

#### `auth`
Autenticação inicial via JWT.

```js
socket.emit('auth', {
  token: 'eyJhbGc...'
});
```

**Response:** `auth:success` ou `auth:error`

---

#### `chunk:enter`
Entrar em um chunk.

```js
socket.emit('chunk:enter', {
  chunkX: 0,
  chunkY: 0
});
```

**Response:** `chunk:data`

---

#### `player:move`
Atualizar posição.

```js
socket.emit('player:move', {
  x: 100,
  y: 200,
  chunkX: 0,
  chunkY: 0
});
```

**Broadcast:** `player:moved` (para outros players)

---

#### `battle:attack`
Atacar outro jogador.

```js
socket.emit('battle:attack', {
  targetId: 'uuid'
});
```

**Response:** `battle:attack:success` ou `battle:attack:failed`

---

#### `battle:respawn`
Respawn após morte.

```js
socket.emit('battle:respawn', {});
```

**Response:** `player:respawned`

---

### Servidor → Cliente

#### `auth:success`
Autenticação bem-sucedida.

```js
{
  playerId: 'uuid',
  playerState: { ... }
}
```

---

#### `chunk:data`
Dados do chunk.

```js
{
  chunk: {
    id: 'uuid',
    chunk_x: 0,
    chunk_y: 0,
    zone_type: 'safe',
    biome_type: 'asteroid_field',
    loot_multiplier: 1.0
  },
  asteroids: [
    {
      id: 'uuid',
      x: 50,
      y: 100,
      resources: 100,
      resource_type: 'iron',
      size: 'medium'
    }
  ],
  players: [
    {
      playerId: 'uuid',
      username: 'Player2',
      x: 150,
      y: 250,
      health: 80
    }
  ]
}
```

---

#### `player:joined`
Player entrou no chunk.

```js
{
  playerId: 'uuid',
  username: 'Player1',
  x: 100,
  y: 200,
  health: 100
}
```

---

#### `player:moved`
Player se moveu.

```js
{
  playerId: 'uuid',
  x: 120,
  y: 220
}
```

---

#### `battle:hit`
Você foi atingido.

```js
{
  attackerId: 'uuid',
  attackerName: 'Player2',
  damage: 15,
  isCritical: false,
  health: 85,
  wasFatal: false
}
```

---

#### `player:died`
Player morreu.

```js
{
  victimId: 'uuid',
  victimName: 'Player1',
  killerId: 'uuid',
  killerName: 'Player2'
}
```

---

## ⚙️ Sistemas

### 1. Cache Manager

Gerencia estado em tempo real dos jogadores em memória.

**Features:**
- Map de jogadores online
- Sync automático a cada 5 segundos
- Critical updates (health = 0) salvos imediatamente
- Batch updates (position, resources) agrupados

**Métodos:**
- `addPlayer(playerId, data)`
- `removePlayer(playerId)`
- `updatePosition(playerId, x, y, chunk)`
- `takeDamage(playerId, damage)`
- `collectResources(playerId, amount)`
- `getPlayersInChunk(chunkId)`

---

### 2. Zone Manager

Calcula zonas e regras baseadas em distância da origem.

**3 Zonas:**
- **Safe** (0-20): PvP ❌, Loot 1.0x, Densidade baixa
- **Transition** (20-50): PvP ❌, Loot 1.5x, Densidade média
- **Hostile** (50+): PvP ✅, Loot 2.0x+, Densidade alta

**Métodos:**
- `getZone(chunkX, chunkY)` - Determina zona
- `calculateLootMultiplier(distance)` - 1.0 + distance * 0.01
- `getAsteroidCount(density)` - low: 3-8, medium: 8-15, high: 15-25
- `getBiome(chunkX, chunkY)` - 4 biomas

---

### 3. Chunk Generator

Geração procedural de chunks e asteroides.

**Features:**
- Seed determinística (mesmo chunk = mesmos asteroides)
- 6 tipos de recursos: iron, copper, silver, gold, platinum, crystal
- 3 tamanhos: small, medium, large
- Posicionamento inteligente (evita sobreposição)

**Métodos:**
- `generateChunkData(chunkX, chunkY)` - Dados do chunk
- `generateAsteroids(chunkX, chunkY, chunkId)` - Gera asteroides

---

### 4. Battle Engine

Sistema de combate PvP.

**Validações:**
- Mesma chunk
- Zona permite PvP
- Distância máxima: 500 unidades
- Alvo está vivo

**Cálculo de Dano:**
- `damage = weapon_damage - (armor * 0.5)`
- Dano mínimo: 1
- Crítico: 10% chance, 2x damage

**Features:**
- Persistência em `battle_log`
- Sistema de morte e respawn
- Broadcast de eventos

**Métodos:**
- `processAttack(attackerId, defenderId, io)`
- `processDeath(victim, killer, io)`
- `processRespawn(playerId, io)`

---

## 🧪 Testes

### Teste Manual com Test Client

1. **Iniciar servidor:**
   ```bash
   npm run dev
   ```

2. **Abrir test client:**
   ```bash
   open test-client.html
   ```

3. **Obter JWT token:**
   - Fazer login no frontend
   - DevTools → Console:
   ```js
   const { data: { session } } = await supabase.auth.getSession()
   console.log(session.access_token)
   ```

4. **Testar fluxo:**
   - Conectar
   - Autenticar
   - Entrar em chunk
   - Mover
   - Atacar (em zona hostile)

### Verificar Health

```bash
curl http://localhost:3001/health
```

### Verificar Metrics

```bash
curl http://localhost:3001/metrics
```

---

## 🚀 Deploy

### Opção 1: Railway

1. **Criar projeto:**
   ```bash
   railway init
   ```

2. **Adicionar variáveis:**
   ```
   SUPABASE_URL
   SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   PORT
   NODE_ENV=production
   ```

3. **Deploy:**
   ```bash
   railway up
   ```

### Opção 2: Render

1. **Criar Web Service**
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. **Adicionar variáveis de ambiente**

### Opção 3: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

---

## 📊 Monitoramento

### Logs

Logs estruturados com Pino:

```bash
# Ver logs em tempo real
npm run dev

# Filtrar por nível
npm run dev | grep ERROR
```

### Métricas

Endpoint `/metrics` fornece:
- Players online
- Updates processados
- Memória utilizada
- Uptime

---

## 🔧 Troubleshooting

### Erro: "supabaseUrl is required"

**Causa:** `.env.local` não carregado.

**Solução:**
1. Verificar se `.env.local` existe em `server/`
2. Verificar se variáveis estão corretas
3. Reiniciar servidor

---

### Erro: "permission denied for schema public"

**Causa:** SERVICE_ROLE_KEY incorreta.

**Solução:**
1. Obter nova key do Supabase Dashboard
2. Atualizar `.env.local`
3. Reiniciar servidor

---

### Erro: "Port 3001 already in use"

**Causa:** Porta ocupada.

**Solução:**
1. Mudar porta em `.env.local`: `PORT=3002`
2. Ou matar processo: `lsof -ti:3001 | xargs kill -9`

---

## 📚 Documentação Adicional

- [Setup Guide](./SETUP.md)
- [Migrations](./migrations/README.md)
- [Fase 1.3 - Cache Manager](./FASE_1.3_COMPLETO.md)
- [Fase 1.4 - WebSocket Handlers](./FASE_1.4_COMPLETO.md)
- [Implementation Plan](../docs/architecture/server-nodejs/IMPLEMENTATION_PLAN.md)

---

## 🎯 Status do Projeto

✅ **Sprint 1 COMPLETO** (7/7 fases)

- ✅ Fase 1.1: Setup do Projeto
- ✅ Fase 1.2: Schema Supabase
- ✅ Fase 1.3: Cache Manager + Auth
- ✅ Fase 1.4: WebSocket Handlers
- ✅ Fase 2: Zone Manager + Chunk Generator
- ✅ Fase 3: Battle Engine
- ✅ Fase 4: Testes + Documentação

---

## 👥 Contribuindo

Ver [CONTRIBUTING.md](../CONTRIBUTING.md)

---

## 📝 Licença

Ver [LICENSE](../LICENSE)

---

**Versão:** 1.0.0  
**Última atualização:** 2025-10-19  
**Status:** ✅ Produção Ready
