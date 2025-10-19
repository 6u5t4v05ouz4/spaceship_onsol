# 📡 WebSocket Events: Socket.io Reference

Referência completa de todos os eventos WebSocket entre Cliente e Servidor Node.js.

---

## 📋 Convenção de Nomenclatura

```
Eventos do cliente:
├─ entity:action       (chunk:enter, player:move, battle:attack)
├─ feature:action      (mining:start, mining:complete)
└─ sempre lowercase    (sem espaços, com hífen)

Eventos do servidor:
├─ entity:event        (chunk:data, player:joined)
├─ feature:status      (mining:progress, health:changed)
└─ sempre lowercase    (sem espaços, com hífen)

Erros:
├─ error               (Erro genérico)
├─ error:auth          (Erro de autenticação)
└─ error:validation    (Erro de validação)
```

---

## 🔐 Phase 1: Authentication Events

### Client → Server: `auth`

**Quando**: Ao conectar, antes de qualquer ação

**Payload**:
```json
{
  "userId": "user-uuid-123",
  "token": "jwt-token-eyJhbGciOi...",
  "clientVersion": "1.0.0"
}
```

**Server Response**: `auth:success` ou `auth:failed`

**Código**:
```js
// Client
socket.emit('auth', {
  userId: user.id,
  token: user.accessToken,
  clientVersion: '1.0.0'
});

socket.on('auth:success', (data) => {
  console.log('Authenticated:', data.playerId);
});

socket.on('auth:failed', (error) => {
  console.error('Auth error:', error.message);
});

// Server
socket.on('auth', async (data) => {
  try {
    const user = await validateJWT(data.token);
    if (user.id !== data.userId) throw new Error('Invalid user');
    
    socket.userId = user.id;
    socket.join(`user:${user.id}`);
    
    socket.emit('auth:success', {
      playerId: user.id,
      authenticated: true
    });
  } catch (err) {
    socket.emit('auth:failed', { message: err.message });
    socket.disconnect();
  }
});
```

---

## 🌍 Phase 2: Chunk Events

### Client → Server: `chunk:enter`

**Quando**: Jogador entra em novo chunk

**Payload**:
```json
{
  "chunkX": 10,
  "chunkY": -5,
  "userId": "user-uuid-123",
  "token": "jwt-token"
}
```

**Server Response**: `chunk:data`

```js
// Client
socket.emit('chunk:enter', {
  chunkX: Math.floor(playerX / 5000),
  chunkY: Math.floor(playerY / 5000),
  userId: currentUser.id,
  token: accessToken
});

socket.on('chunk:data', (data) => {
  console.log('Chunk loaded:', data.zoneType);
  renderChunk(data);
});

// Server (exemplo simplificado)
socket.on('chunk:enter', async (data) => {
  const chunk = await loadChunk(data.chunkX, data.chunkY);
  socket.emit('chunk:data', {
    chunkId: `${data.chunkX},${data.chunkY}`,
    zoneType: chunk.zone.type,
    biomeFile: chunk.biome,
    objects: chunk.objects,
    players: getPlayersInChunk(chunk.id)
  });
});
```

### Server → Client: `chunk:data`

**Quando**: Após carregar chunk com sucesso

**Payload**:
```json
{
  "chunkId": "10,-5",
  "zoneType": "safe|transition|hostile",
  "biomeFile": "biome_pve_5335.png",
  "distance": 10.5,
  "objects": [
    {
      "id": "ast_10_-5_0",
      "type": "asteroid",
      "x": 1200,
      "y": 850,
      "size": "large",
      "resources": 100
    }
  ],
  "players": [
    {
      "id": "player-2",
      "username": "Player2",
      "x": 500,
      "y": 300,
      "health": 80
    }
  ]
}
```

### Server → All Clients in Chunk: `new-player:joined`

**Quando**: Novo jogador entra no chunk

**Payload**:
```json
{
  "playerId": "player-1",
  "username": "NewPlayer",
  "chunkX": 10,
  "chunkY": -5,
  "x": 0,
  "y": 0
}
```

---

## 🚀 Phase 3: Movement Events

### Client → Server: `player:move`

**Quando**: Contínuamente enquanto se move (60-100ms)

**Payload**:
```json
{
  "userId": "user-uuid-123",
  "x": 1250,
  "y": 850,
  "chunkX": 10,
  "chunkY": -5,
  "vx": 100,
  "vy": 0,
  "timestamp": 1728000000000
}
```

**Server Response**: Broadcast `player:moved` ou `chunk:enter` se mudou de chunk

```js
// Client
let moveTimer = setInterval(() => {
  socket.emit('player:move', {
    userId: user.id,
    x: player.position.x,
    y: player.position.y,
    chunkX: Math.floor(player.position.x / 5000),
    chunkY: Math.floor(player.position.y / 5000),
    vx: player.velocity.x,
    vy: player.velocity.y,
    timestamp: Date.now()
  });
}, 100);

// Server
socket.on('player:move', (data) => {
  const player = cacheManager.getPlayer(data.userId);
  cacheManager.updatePosition(data.userId, data.x, data.y);
  
  // Broadcast para chunk
  socket.broadcast.emit('player:moved', {
    playerId: data.userId,
    x: data.x,
    y: data.y
  });
});
```

### Server → Chunk Players: `player:moved`

**Quando**: Outro jogador se move

**Payload**:
```json
{
  "playerId": "player-1",
  "x": 1300,
  "y": 900,
  "timestamp": 1728000000100
}
```

### Server → All Clients: `player:left`

**Quando**: Jogador sai do chunk

**Payload**:
```json
{
  "playerId": "player-1",
  "chunkX": 10,
  "chunkY": -5
}
```

---

## ⚔️ Phase 4: Battle Events

### Client → Server: `battle:attack`

**Quando**: Atacar outro jogador

**Payload**:
```json
{
  "attackerId": "player-1",
  "defenderId": "player-2",
  "weaponType": "laser",
  "damage": 25,
  "timestamp": 1728000000500
}
```

**Server Response**: `health:changed` ou `player:died`

```js
// Client
socket.emit('battle:attack', {
  attackerId: player.id,
  defenderId: targetPlayer.id,
  weaponType: currentWeapon.type,
  damage: calculateDamage(currentWeapon),
  timestamp: Date.now()
});

// Server
socket.on('battle:attack', async (data) => {
  const attacker = cacheManager.getPlayer(data.attackerId);
  const defender = cacheManager.getPlayer(data.defenderId);
  
  if (!attacker || !defender) {
    socket.emit('error:validation', { message: 'Player not found' });
    return;
  }
  
  const zone = calculateZone(attacker.currentChunk);
  if (zone.type === 'safe') {
    socket.emit('error:validation', { message: 'PvP not allowed here' });
    return;
  }
  
  const finalDamage = data.damage * (zone.type === 'hostile' ? 1.5 : 1.0);
  const newHealth = cacheManager.takeDamage(data.defenderId, finalDamage);
  
  io.to(`chunk:${attacker.currentChunk}`).emit('health:changed', {
    playerId: data.defenderId,
    health: newHealth,
    damage: finalDamage
  });
});
```

### Server → Chunk Players: `health:changed`

**Quando**: Jogador toma dano

**Payload**:
```json
{
  "playerId": "player-2",
  "health": 55,
  "damage": 25,
  "timestamp": 1728000000600
}
```

### Server → All Clients: `player:died`

**Quando**: Jogador morre

**Payload**:
```json
{
  "playerId": "player-2",
  "killerId": "player-1",
  "zoneType": "hostile",
  "lootDropped": 500,
  "respawnLocation": [0, 0]
}
```

---

## ⛏️ Phase 5: Mining Events

### Client → Server: `mining:start`

**Quando**: Jogador começa a minerar

**Payload**:
```json
{
  "userId": "user-uuid-123",
  "asteroidId": "ast_10_-5_0",
  "chunkId": "chunk-123",
  "duration": 5000
}
```

**Server Response**: `mining:started` + `mining:progress` contínuo

```js
// Client
socket.emit('mining:start', {
  userId: user.id,
  asteroidId: targetAsteroid.id,
  chunkId: currentChunk.id,
  duration: 5000
});

socket.on('mining:started', (data) => {
  console.log('Mining started, estimated reward:', data.estimatedReward);
  showMiningBar(data.duration);
});

socket.on('mining:progress', (data) => {
  updateMiningBar(data.progress);
});

// Server
socket.on('mining:start', (data) => {
  const chunk = cacheManager.getChunk(data.chunkId);
  const asteroid = chunk.objects.find(o => o.id === data.asteroidId);
  
  if (!asteroid || asteroid.resources <= 0) {
    socket.emit('error:validation', { message: 'Asteroid depleted' });
    return;
  }
  
  socket.emit('mining:started', {
    asteroidId: data.asteroidId,
    duration: data.duration,
    estimatedReward: Math.floor(asteroid.resources * 0.1)
  });
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    socket.emit('mining:progress', { progress });
    
    if (progress >= 100) clearInterval(interval);
  }, 500);
});
```

### Client → Server: `mining:complete`

**Quando**: Terminada a mineração

**Payload**:
```json
{
  "userId": "user-uuid-123",
  "asteroidId": "ast_10_-5_0",
  "chunkId": "chunk-123",
  "resourcesGained": 50,
  "timestamp": 1728000005000
}
```

**Server Response**: `mining:complete` broadcast

```js
// Client
setTimeout(() => {
  socket.emit('mining:complete', {
    userId: user.id,
    asteroidId: targetAsteroid.id,
    chunkId: currentChunk.id,
    resourcesGained: 50,
    timestamp: Date.now()
  });
}, 5000);

// Server
socket.on('mining:complete', async (data) => {
  cacheManager.collectResources(data.userId, data.resourcesGained);
  
  io.to(`chunk:${data.chunkId}`).emit('mining:complete', {
    playerId: data.userId,
    asteroidId: data.asteroidId,
    resourcesGained: data.resourcesGained,
    asteroidRemaining: asteroid.resources - data.resourcesGained
  });
});
```

### Server → Chunk Players: `mining:progress`

**Quando**: Progresso da mineração

**Payload**:
```json
{
  "playerId": "player-1",
  "asteroidId": "ast_10_-5_0",
  "progress": 45,
  "timestamp": 1728000002500
}
```

### Server → Chunk Players: `mining:complete`

**Quando**: Mineração completa

**Payload**:
```json
{
  "playerId": "player-1",
  "asteroidId": "ast_10_-5_0",
  "resourcesGained": 50,
  "asteroidRemaining": 450
}
```

---

## 📊 Phase 6: Status & Sync Events

### Server → All Clients: `server:time`

**Quando**: A cada segundo (heartbeat)

**Payload**:
```json
{
  "timestamp": 1728000000000,
  "uptime": 3600000,
  "playersOnline": 42
}
```

```js
// Server
setInterval(() => {
  io.emit('server:time', {
    timestamp: Date.now(),
    uptime: process.uptime() * 1000,
    playersOnline: cacheManager.getPlayersCount()
  });
}, 1000);
```

### Client → Server: `ping`

**Quando**: Para medir latência

**Payload**:
```json
{
  "id": "ping-123",
  "timestamp": 1728000000000
}
```

**Server Response**: `pong`

```js
// Client
socket.emit('ping', { id: 'ping-123', timestamp: Date.now() });

socket.on('pong', (data) => {
  const latency = Date.now() - data.timestamp;
  console.log('Latency:', latency, 'ms');
});

// Server
socket.on('ping', (data) => {
  socket.emit('pong', data);
});
```

---

## 🚨 Phase 7: Error Events

### Server → Client: `error`

**Quando**: Erro genérico

**Payload**:
```json
{
  "message": "Something went wrong",
  "code": "UNKNOWN_ERROR",
  "timestamp": 1728000000000
}
```

### Server → Client: `error:auth`

**Quando**: Erro de autenticação

**Payload**:
```json
{
  "message": "Invalid token",
  "code": "AUTH_INVALID_TOKEN",
  "timestamp": 1728000000000
}
```

### Server → Client: `error:validation`

**Quando**: Validação falhou (posição, distância, etc)

**Payload**:
```json
{
  "message": "Invalid coordinates",
  "code": "VALIDATION_INVALID_COORDS",
  "timestamp": 1728000000000
}
```

### Server → Client: `error:business`

**Quando**: Erro de regra de negócio (PvP em safe zone, etc)

**Payload**:
```json
{
  "message": "PvP not allowed in safe zone",
  "code": "BUSINESS_PVP_NOT_ALLOWED",
  "timestamp": 1728000000000
}
```

---

## 🔌 Phase 8: Connection Events

### Built-in Socket.io Events

```js
// Cliente conectado
socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('auth', { /* ... */ });
});

// Cliente desconectado
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  // Cleanup local state
});

// Reconnectando
socket.on('reconnect', () => {
  console.log('Reconnected');
  socket.emit('auth', { /* ... */ });
});

// Erro de conexão
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

// Server
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
    handlePlayerDisconnect(socket.userId);
  });
});
```

---

## 📋 Mapa Rápido de Eventos

| Evento | Direção | Quando | Prioridade |
|--------|---------|--------|-----------|
| `auth` | C→S | Ao conectar | 🔴 Crítico |
| `chunk:enter` | C→S | Novo chunk | 🔴 Alto |
| `chunk:data` | S→C | Chunk carregado | 🔴 Alto |
| `player:move` | C→S | Movimento | 🟡 Médio |
| `player:moved` | S→* | Outro move | 🟡 Médio |
| `battle:attack` | C→S | Ataque | 🔴 Alto |
| `health:changed` | S→* | Dano | 🔴 Alto |
| `player:died` | S→* | Morte | 🔴 Crítico |
| `mining:start` | C→S | Iniciar mine | 🟢 Baixo |
| `mining:complete` | C→S | Terminar mine | 🟡 Médio |
| `error` | S→C | Qualquer erro | 🔴 Crítico |
| `ping/pong` | C↔S | Latência | 🟢 Baixo |

---

## 🔒 Segurança

```js
// Sempre validar no servidor
socket.on('battle:attack', async (data) => {
  // 1. Validar JWT
  const user = await validateJWT(socket.token);
  
  // 2. Verificar IDs correspondem
  if (user.id !== data.attackerId) {
    socket.emit('error:auth', { message: 'Unauthorized' });
    return;
  }
  
  // 3. Validar regras de negócio
  const zone = calculateZone(data.chunkX, data.chunkY);
  if (zone.type === 'safe') {
    socket.emit('error:business', { message: 'PvP not allowed here' });
    return;
  }
  
  // 4. Proceder com operação
  // ...
});
```

---

## 📘 Documentação Relacionada

- [04 - Sync Flows](./04-sync-flows.md) — Fluxos detalhados
- [02 - Zone System](./02-zone-system.md) — Sistema de zonas
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Server.js setup

---

**Versão**: v1.0  
**Atualizado**: Outubro 2025  
**Status**: 🟢 Referência Completa

