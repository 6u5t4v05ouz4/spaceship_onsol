# 🚀 Plano de Implementação - Servidor Node.js

**Versão**: v2.0-alpha  
**Status**: 📋 Planejamento  
**Estimativa Total**: 6-8 semanas  

---

## 📊 Visão Geral

```
Sprint 1: Foundation (2 semanas)
    ↓
Sprint 2: Core Features (2 semanas)
    ↓
Sprint 3: Integration (2 semanas)
    ↓
Sprint 4: Testing & Polish (1-2 semanas)
```

---

## 🎯 Sprint 1: Foundation (Semanas 1-2)

### **Objetivo**: Estrutura base + Schema + Setup inicial

### ✅ Fase 1.1: Setup do Projeto (2-3 dias)

**Tarefas:**
- [ ] Criar pasta `server/` na raiz do projeto
- [ ] Inicializar `package.json` com dependências
- [ ] Configurar `.env.local` com credenciais Supabase
- [ ] Setup ESLint + Prettier
- [ ] Criar estrutura de pastas (config, managers, engines, events, utils)
- [ ] Configurar nodemon para desenvolvimento

**Arquivos a criar:**
```
server/
├── package.json
├── .env.local
├── .gitignore
├── server.js (básico)
└── README.md
```

**Comandos:**
```bash
cd server
npm init -y
npm install express socket.io @supabase/supabase-js redis bull dotenv cors uuid pino
npm install -D nodemon eslint prettier
```

**Critério de Aceite:**
- ✅ `npm run dev` inicia servidor na porta 3000
- ✅ Health check em `/health` retorna status ok
- ✅ Conexão Supabase validada

---

### ✅ Fase 1.2: Schema Supabase (3-4 dias)

**Tarefas:**
- [ ] Criar tabelas no Supabase SQL Editor
- [ ] Configurar RLS policies
- [ ] Criar triggers para updated_at
- [ ] Popular dados de teste (3 jogadores)
- [ ] Validar queries básicas

**Tabelas principais:**
```sql
-- Ver docs/architecture/server-nodejs/03-database-schema.md
1. player_state (id, user_id, x, y, health, resources)
2. chunks (id, chunk_x, chunk_y, zone_type, seed)
3. chunk_asteroids (chunk_id, x, y, resources)
4. battle_log (attacker_id, defender_id, damage, timestamp)
5. player_inventory (player_id, item_type, quantity)
```

**Critério de Aceite:**
- ✅ Todas as 5 tabelas criadas
- ✅ RLS policies testadas com usuário anon
- ✅ Queries básicas funcionando (SELECT, INSERT, UPDATE)
- ✅ Triggers de timestamp funcionando

---

### ✅ Fase 1.3: Configuração Base (2-3 dias)

**Tarefas:**
- [ ] Implementar `config/supabase.js` (admin + anon clients)
- [ ] Implementar `config/redis.js` (conexão com retry)
- [ ] Implementar `utils/logger.js` (pino + pretty)
- [ ] Implementar `middleware/auth-middleware.js` (JWT validation)
- [ ] Criar health check endpoint (`/health`, `/metrics`)

**Arquivos:**
```js
config/
├── supabase.js      // Admin + Anon clients
└── redis.js         // Redis connection

utils/
└── logger.js        // Pino logger

middleware/
└── auth-middleware.js  // JWT validation
```

**Critério de Aceite:**
- ✅ Supabase admin client conecta
- ✅ Redis conecta (ou fallback se não disponível)
- ✅ Logger registra em console (dev) e arquivo (prod)
- ✅ Auth middleware valida JWT corretamente

---

## 🎮 Sprint 2: Core Features (Semanas 3-4)

### **Objetivo**: Lógica de negócio + WebSocket events

### ✅ Fase 2.1: Cache Manager (3-4 dias)

**Tarefas:**
- [ ] Implementar `managers/cache-manager.js`
- [ ] Map de `playersOnline`
- [ ] Métodos: `addPlayer`, `removePlayer`, `updatePosition`
- [ ] Métodos: `takeDamage`, `collectResources`
- [ ] Sistema de `criticalUpdates` (health = 0)
- [ ] Sistema de `batchUpdates` (resources)

**Código:**
```js
class CacheManager {
  constructor() {
    this.playersOnline = new Map();
    this.criticalUpdates = new Set();
    this.batchUpdates = new Set();
  }
  
  addPlayer(playerId, data) { /* ... */ }
  removePlayer(playerId) { /* ... */ }
  updatePosition(playerId, x, y) { /* ... */ }
  takeDamage(playerId, damage) { /* ... */ }
  collectResources(playerId, amount) { /* ... */ }
  getPlayersInChunk(chunkId) { /* ... */ }
}
```

**Critério de Aceite:**
- ✅ Players adicionados/removidos corretamente
- ✅ Posição atualizada em cache
- ✅ Dano reduz health e marca como crítico se = 0
- ✅ Resources acumulam e marcam para batch update

---

### ✅ Fase 2.2: Zone Calculator & Chunk Authority (3-4 dias)

**Tarefas:**
- [ ] Implementar `engines/zone-calculator.js`
- [ ] Cálculo de distância do centro (0,0)
- [ ] Determinação de zona (safe/transition/hostile)
- [ ] Implementar `engines/chunk-authority.js`
- [ ] Validação de PvP por zona
- [ ] Cálculo de loot multiplier

**Código:**
```js
// engines/zone-calculator.js
export function calculateZone(chunkX, chunkY) {
  const distance = Math.sqrt(chunkX ** 2 + chunkY ** 2);
  
  if (distance < 3) return { type: 'safe', lootMultiplier: 1.0, pvpAllowed: false };
  if (distance < 10) return { type: 'transition', lootMultiplier: 1.5, pvpAllowed: false };
  return { type: 'hostile', lootMultiplier: 3.0, pvpAllowed: true };
}

// engines/chunk-authority.js
export function canAttack(attackerChunk, defenderChunk) {
  const zone = calculateZone(attackerChunk.x, attackerChunk.y);
  return zone.pvpAllowed;
}
```

**Critério de Aceite:**
- ✅ Zona calculada corretamente para qualquer (x, y)
- ✅ PvP bloqueado em safe/transition
- ✅ PvP permitido em hostile
- ✅ Loot multiplier correto por zona

---

### ✅ Fase 2.3: Battle Engine (4-5 dias)

**Tarefas:**
- [ ] Implementar `engines/battle-engine.js`
- [ ] Validação de ataque (zona, distância, health)
- [ ] Cálculo de dano (com armadura)
- [ ] Sistema de morte (health = 0)
- [ ] Persistência em `battle_log`
- [ ] Broadcast de resultado

**Código:**
```js
// engines/battle-engine.js
export async function processAttack(attacker, defender, io) {
  // 1. Validar zona
  const zone = calculateZone(attacker.chunkX, attacker.chunkY);
  if (!zone.pvpAllowed) {
    return { success: false, reason: 'PvP not allowed in this zone' };
  }
  
  // 2. Validar distância
  const distance = calculateDistance(attacker, defender);
  if (distance > 500) {
    return { success: false, reason: 'Target too far' };
  }
  
  // 3. Calcular dano
  const baseDamage = attacker.weaponDamage || 10;
  const armor = defender.armor || 0;
  const finalDamage = Math.max(1, baseDamage - armor);
  
  // 4. Aplicar dano
  const newHealth = cacheManager.takeDamage(defender.id, finalDamage);
  
  // 5. Persistir
  await supabaseAdmin.from('battle_log').insert({
    attacker_id: attacker.id,
    defender_id: defender.id,
    damage: finalDamage,
    defender_health_after: newHealth
  });
  
  // 6. Broadcast
  io.to(defender.socketId).emit('battle:hit', {
    attackerId: attacker.id,
    damage: finalDamage,
    health: newHealth
  });
  
  return { success: true, damage: finalDamage, health: newHealth };
}
```

**Critério de Aceite:**
- ✅ Ataque validado por zona e distância
- ✅ Dano calculado com armadura
- ✅ Health atualizado em cache
- ✅ Morte detectada (health = 0)
- ✅ Evento persistido em battle_log
- ✅ Defender recebe notificação em tempo real

---

### ✅ Fase 2.4: WebSocket Events (4-5 dias)

**Tarefas:**
- [ ] Implementar `events/player-events.js`
- [ ] Event: `auth` (autenticação inicial)
- [ ] Event: `chunk:enter` (carregamento de chunk)
- [ ] Event: `player:move` (atualização de posição)
- [ ] Event: `mining:complete` (coleta de recursos)
- [ ] Event: `disconnect` (limpeza de cache)

**Código:**
```js
// events/player-events.js
export async function handleAuth(socket, data, io) {
  // 1. Validar JWT
  const user = await validateJWT(data.token);
  if (!user) {
    socket.emit('auth:error', { message: 'Invalid token' });
    return;
  }
  
  // 2. Carregar dados do jogador
  const { data: player } = await supabaseAdmin
    .from('player_state')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  // 3. Adicionar ao cache
  cacheManager.addPlayer(player.id, {
    ...player,
    socketId: socket.id
  });
  
  // 4. Confirmar autenticação
  socket.emit('auth:success', { playerId: player.id });
  logger.info(`Player authenticated: ${player.username}`);
}

export async function handleChunkEnter(socket, data, io) {
  const player = cacheManager.getPlayerBySocket(socket.id);
  if (!player) return;
  
  // 1. Calcular zona
  const zone = calculateZone(data.chunkX, data.chunkY);
  
  // 2. Consultar chunk no Supabase
  let { data: chunk } = await supabaseAdmin
    .from('chunks')
    .select('*, chunk_asteroids(*)')
    .eq('chunk_x', data.chunkX)
    .eq('chunk_y', data.chunkY)
    .single();
  
  // 3. Se não existe, gerar proceduralmente
  if (!chunk) {
    chunk = await generateChunk(data.chunkX, data.chunkY, zone);
  }
  
  // 4. Retornar ao cliente
  socket.emit('chunk:data', {
    chunk,
    zone,
    playersInChunk: cacheManager.getPlayersInChunk(`${data.chunkX},${data.chunkY}`)
  });
}

export async function handleMove(socket, data, io) {
  const player = cacheManager.getPlayerBySocket(socket.id);
  if (!player) return;
  
  // 1. Atualizar posição em cache
  cacheManager.updatePosition(player.id, data.x, data.y);
  
  // 2. Broadcast para jogadores próximos
  const chunkId = `${data.chunkX},${data.chunkY}`;
  const nearbyPlayers = cacheManager.getPlayersInChunk(chunkId);
  
  nearbyPlayers.forEach(p => {
    if (p.id !== player.id) {
      io.to(p.socketId).emit('player:moved', {
        playerId: player.id,
        x: data.x,
        y: data.y
      });
    }
  });
}

export async function handleMiningComplete(socket, data, io) {
  const player = cacheManager.getPlayerBySocket(socket.id);
  if (!player) return;
  
  // 1. Validar zona para loot multiplier
  const zone = calculateZone(data.chunkX, data.chunkY);
  const baseAmount = data.amount || 10;
  const finalAmount = Math.floor(baseAmount * zone.lootMultiplier);
  
  // 2. Adicionar recursos ao cache
  cacheManager.collectResources(player.id, finalAmount);
  
  // 3. Marcar para batch update
  // (será sincronizado em lote a cada 30s)
  
  // 4. Confirmar ao cliente
  socket.emit('mining:success', {
    amount: finalAmount,
    totalResources: player.resources + finalAmount
  });
}

export async function handleDisconnect(socket, io) {
  const player = cacheManager.getPlayerBySocket(socket.id);
  if (!player) return;
  
  // 1. Sincronizar estado final com Supabase
  await supabaseAdmin
    .from('player_state')
    .update({
      x: player.x,
      y: player.y,
      health: player.health,
      resources: player.resources
    })
    .eq('id', player.id);
  
  // 2. Remover do cache
  cacheManager.removePlayer(player.id);
  
  logger.info(`Player disconnected: ${player.username}`);
}
```

**Critério de Aceite:**
- ✅ Auth valida JWT e carrega jogador
- ✅ chunk:enter retorna dados do chunk (gerado ou existente)
- ✅ player:move atualiza cache e faz broadcast
- ✅ mining:complete aplica loot multiplier
- ✅ disconnect sincroniza estado final

---

## 🔗 Sprint 3: Integration (Semanas 5-6)

### **Objetivo**: Integrar cliente Phaser + Testes end-to-end

### ✅ Fase 3.1: Cliente Phaser Integration (5-7 dias)

**Tarefas:**
- [ ] Criar `src/network/socket-manager.js` no cliente
- [ ] Conectar ao servidor via Socket.io
- [ ] Implementar eventos client-side (emit + on)
- [ ] Sincronizar posição do jogador
- [ ] Sincronizar outros jogadores visíveis
- [ ] Testar latência e performance

**Código Cliente:**
```js
// src/network/socket-manager.js
import io from 'socket.io-client';

class SocketManager {
  constructor() {
    this.socket = null;
    this.connected = false;
  }
  
  connect(token) {
    this.socket = io('http://localhost:3000', {
      auth: { token }
    });
    
    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
      this.connected = true;
      this.socket.emit('auth', { token });
    });
    
    this.socket.on('auth:success', (data) => {
      console.log('✅ Authenticated:', data.playerId);
    });
    
    this.socket.on('chunk:data', (data) => {
      // Renderizar chunk no Phaser
      this.onChunkLoaded(data);
    });
    
    this.socket.on('player:moved', (data) => {
      // Atualizar posição de outro jogador
      this.onPlayerMoved(data);
    });
    
    this.socket.on('battle:hit', (data) => {
      // Mostrar dano recebido
      this.onBattleHit(data);
    });
  }
  
  enterChunk(chunkX, chunkY) {
    this.socket.emit('chunk:enter', { chunkX, chunkY });
  }
  
  move(x, y, chunkX, chunkY) {
    this.socket.emit('player:move', { x, y, chunkX, chunkY });
  }
  
  attack(targetId) {
    this.socket.emit('battle:attack', { targetId });
  }
  
  miningComplete(amount, chunkX, chunkY) {
    this.socket.emit('mining:complete', { amount, chunkX, chunkY });
  }
}

export default new SocketManager();
```

**Critério de Aceite:**
- ✅ Cliente conecta ao servidor
- ✅ Autenticação funciona
- ✅ Chunks carregam dinamicamente
- ✅ Movimento sincroniza em tempo real
- ✅ Outros jogadores aparecem na tela
- ✅ Latência < 100ms em localhost

---

### ✅ Fase 3.2: Battle System Integration (4-5 dias)

**Tarefas:**
- [ ] Implementar `events/battle-events.js` no servidor
- [ ] Event: `battle:attack` (processar ataque)
- [ ] Event: `battle:death` (quando health = 0)
- [ ] Integrar com BattleEngine
- [ ] Testar combate PvP end-to-end
- [ ] Validar persistência em battle_log

**Código:**
```js
// events/battle-events.js
import { processAttack } from '../engines/battle-engine.js';

export async function handleAttack(socket, data, io) {
  const attacker = cacheManager.getPlayerBySocket(socket.id);
  const defender = cacheManager.getPlayer(data.targetId);
  
  if (!attacker || !defender) {
    socket.emit('battle:error', { message: 'Invalid target' });
    return;
  }
  
  const result = await processAttack(attacker, defender, io);
  
  if (!result.success) {
    socket.emit('battle:error', { message: result.reason });
    return;
  }
  
  // Notificar atacante
  socket.emit('battle:success', {
    targetId: defender.id,
    damage: result.damage,
    targetHealth: result.health
  });
  
  // Se morreu, notificar morte
  if (result.health === 0) {
    io.to(defender.socketId).emit('battle:death', {
      killerId: attacker.id
    });
  }
}
```

**Critério de Aceite:**
- ✅ Ataque processa corretamente
- ✅ Dano calculado com armadura
- ✅ Defender recebe notificação
- ✅ Morte detectada e notificada
- ✅ Evento persistido em battle_log

---

### ✅ Fase 3.3: Queue Manager & Batch Updates (3-4 dias)

**Tarefas:**
- [ ] Implementar `managers/queue-manager.js`
- [ ] Usar Bull para fila de persistência
- [ ] Job: `syncCriticalUpdates` (health = 0)
- [ ] Job: `syncBatchUpdates` (resources a cada 30s)
- [ ] Job: `syncPositions` (a cada 60s)
- [ ] Configurar retry e dead-letter queue

**Código:**
```js
// managers/queue-manager.js
import Queue from 'bull';
import { supabaseAdmin } from '../config/supabase.js';
import cacheManager from './cache-manager.js';

const syncQueue = new Queue('sync', process.env.REDIS_URL);

// Job: Sincronizar updates críticos (imediato)
syncQueue.process('critical', async (job) => {
  const { playerId } = job.data;
  const player = cacheManager.getPlayer(playerId);
  
  await supabaseAdmin
    .from('player_state')
    .update({ health: player.health })
    .eq('id', playerId);
});

// Job: Sincronizar resources (batch a cada 30s)
syncQueue.process('batch', async (job) => {
  const updates = [];
  
  for (const playerId of cacheManager.batchUpdates) {
    const player = cacheManager.getPlayer(playerId);
    updates.push({
      id: playerId,
      resources: player.resources
    });
  }
  
  if (updates.length > 0) {
    await supabaseAdmin
      .from('player_state')
      .upsert(updates);
    
    cacheManager.batchUpdates.clear();
  }
});

// Agendar batch updates a cada 30s
setInterval(() => {
  syncQueue.add('batch', {}, { priority: 2 });
}, 30000);

export default syncQueue;
```

**Critério de Aceite:**
- ✅ Updates críticos (health = 0) persistem imediatamente
- ✅ Resources sincronizam em lote a cada 30s
- ✅ Retry automático em caso de falha
- ✅ Dead-letter queue para erros persistentes

---

## 🧪 Sprint 4: Testing & Polish (Semanas 7-8)

### **Objetivo**: Testes + Performance + Deploy

### ✅ Fase 4.1: Testes Automatizados (4-5 dias)

**Tarefas:**
- [ ] Setup Jest para testes
- [ ] Testes unitários: `zone-calculator.js`
- [ ] Testes unitários: `battle-engine.js`
- [ ] Testes de integração: WebSocket events
- [ ] Testes de carga: 100 jogadores simultâneos
- [ ] Medir latência e throughput

**Exemplo:**
```js
// __tests__/zone-calculator.test.js
import { calculateZone } from '../engines/zone-calculator.js';

describe('Zone Calculator', () => {
  test('should return safe zone for center', () => {
    const zone = calculateZone(0, 0);
    expect(zone.type).toBe('safe');
    expect(zone.pvpAllowed).toBe(false);
  });
  
  test('should return hostile zone for far chunks', () => {
    const zone = calculateZone(15, 15);
    expect(zone.type).toBe('hostile');
    expect(zone.pvpAllowed).toBe(true);
    expect(zone.lootMultiplier).toBe(3.0);
  });
});
```

**Critério de Aceite:**
- ✅ Cobertura de testes > 80%
- ✅ Todos os testes passam
- ✅ Testes de carga suportam 100 jogadores
- ✅ Latência média < 50ms

---

### ✅ Fase 4.2: Performance & Monitoring (3-4 dias)

**Tarefas:**
- [ ] Implementar `utils/metrics.js` (coleta de métricas)
- [ ] Endpoint `/metrics` (Prometheus format)
- [ ] Monitorar: players online, memory, CPU
- [ ] Otimizar queries Supabase (índices)
- [ ] Otimizar broadcast (apenas jogadores próximos)
- [ ] Configurar rate limiting

**Código:**
```js
// utils/metrics.js
class Metrics {
  constructor() {
    this.counters = {
      connections: 0,
      attacks: 0,
      chunkLoads: 0
    };
  }
  
  increment(metric) {
    this.counters[metric]++;
  }
  
  getAll() {
    return {
      ...this.counters,
      playersOnline: cacheManager.getPlayersCount(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };
  }
}

export default new Metrics();
```

**Critério de Aceite:**
- ✅ Métricas coletadas em `/metrics`
- ✅ Memory usage estável (< 500MB)
- ✅ CPU usage < 50% com 100 jogadores
- ✅ Rate limiting configurado (10 req/s por IP)

---

### ✅ Fase 4.3: Deployment (3-4 dias)

**Tarefas:**
- [ ] Configurar Railway.app
- [ ] Deploy servidor Node.js
- [ ] Deploy Redis
- [ ] Configurar variáveis de ambiente
- [ ] Testar em produção
- [ ] Configurar domínio e SSL

**Passos:**
```bash
# 1. Criar conta Railway
# 2. Conectar repositório GitHub
# 3. Configurar variáveis:
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
REDIS_URL=...
NODE_ENV=production

# 4. Deploy automático via Git push
git push origin main
```

**Critério de Aceite:**
- ✅ Servidor rodando em produção
- ✅ Redis conectado
- ✅ SSL configurado
- ✅ Health check acessível publicamente
- ✅ Cliente conecta ao servidor em produção

---

## 📊 Resumo de Entregas

| Sprint | Entrega | Duração |
|--------|---------|---------|
| **1** | Setup + Schema + Config | 2 semanas |
| **2** | Core Logic + WebSocket | 2 semanas |
| **3** | Integration + Battle | 2 semanas |
| **4** | Testing + Deploy | 1-2 semanas |

**Total**: 6-8 semanas

---

## ✅ Checklist Final

### Sprint 1
- [ ] Projeto inicializado
- [ ] Schema Supabase criado
- [ ] Configuração base (Supabase, Redis, Logger)

### Sprint 2
- [ ] Cache Manager implementado
- [ ] Zone Calculator implementado
- [ ] Battle Engine implementado
- [ ] WebSocket events implementados

### Sprint 3
- [ ] Cliente integrado
- [ ] Battle system funcionando
- [ ] Queue Manager implementado

### Sprint 4
- [ ] Testes automatizados
- [ ] Performance otimizada
- [ ] Deploy em produção

---

## 🚀 Próximos Passos Imediatos

1. **Agora**: Criar pasta `server/` e inicializar projeto
2. **Hoje**: Configurar `package.json` e instalar dependências
3. **Amanhã**: Criar schema no Supabase
4. **Esta semana**: Completar Sprint 1 - Fase 1.1

---

**Pronto para começar?** 🚀

Comando para iniciar:
```bash
mkdir server
cd server
npm init -y
```

