# 🔁 Persistência e Sincronização

Define como o estado de chunks é armazenado no servidor e sincronizado entre jogadores e sessões.

---

## 📊 Estrutura de Dados no Servidor

Cada chunk armazenado no servidor contém:

```json
{
  "chunk_id": "12,-7",
  "seed": "12,-7_v1",
  "discovered_at": "2025-10-18T21:00:00Z",
  "discovered_by": "player_xyz",
  "modified_at": "2025-10-18T21:15:30Z",
  "procedural_base": {
    "biome": "asteroid_field",
    "density": 1.0,
    "difficulty": 1
  },
  "objects": [
    {
      "id": "ast_12_-7_0",
      "type": "asteroid",
      "x": 12230,
      "y": -7050,
      "size": "large",
      "resources": 85,
      "state": "intact"
    },
    {
      "id": "planet_A",
      "type": "planet",
      "x": 12500,
      "y": -7500,
      "name": "Terra-Prime"
    }
  ],
  "changes": {
    "ast_12_-7_0": {
      "action": "damaged",
      "resources_remaining": 42,
      "damaged_by": "player_abc",
      "timestamp": "2025-10-18T21:10:00Z"
    },
    "station_new_1": {
      "action": "built",
      "owner": "player_abc",
      "type": "mining_station",
      "timestamp": "2025-10-18T21:15:30Z"
    }
  }
}
```

---

## 🔄 Regras de Sincronização

### Ao Entrar em um Chunk

```js
async function onChunkEnter(chunkId, playerId) {
  // 1. Verificar se existe no servidor
  const chunk = await server.getChunk(chunkId);
  
  if (chunk === null) {
    // Novo chunk - marcar como descoberto
    chunk = await server.createChunk(chunkId);
    emit('event:chunk_discovered', { chunkId, playerId });
  }
  
  // 2. Carregar base procedural
  const base = generateProceduralContent(chunk.seed);
  
  // 3. Aplicar modificações persistidas
  applyStoredChanges(base, chunk.changes);
  
  // 4. Renderizar no cliente
  client.renderChunk(base);
}
```

### Ao Realizar Ações (Mineração, Destruição, Construção)

```js
async function onChunkAction(chunkId, action, playerId) {
  // 1. Aplicar mudança no cliente
  client.applyAction(action);
  
  // 2. Registrar no servidor
  const change = {
    object_id: action.targetId,
    action_type: action.type,
    player_id: playerId,
    timestamp: Date.now(),
    details: action.details
  };
  
  await server.recordChunkChange(chunkId, change);
  
  // 3. Sincronizar com outros jogadores no chunk (PvP)
  broadcast('chunk:action', { chunkId, action, playerId });
}
```

### Ao Sair de um Chunk

```js
async function onChunkExit(chunkId, playerId) {
  // 1. Capturar estado final
  const changes = client.getChunkState(chunkId);
  
  // 2. Sincronizar alterações pendentes
  await server.saveChunkState(chunkId, changes);
  
  // 3. Limpeza local
  client.unloadChunk(chunkId);
}
```

---

## ⚡ Sincronização Real-Time (PvP)

### WebSocket Events

Para jogadores no mesmo chunk:

```js
// Player A minerando um asteroide
socket.emit('chunk:mining_started', {
  chunkId: '12,-7',
  asteroidId: 'ast_12_-7_0',
  playerId: 'player_A'
});

// Player B recebe e atualiza
socket.on('chunk:mining_started', (data) => {
  if (data.chunkId === currentChunk) {
    disableAsteroidForMining(data.asteroidId);
    showNotification(`${data.playerId} está minerando...`);
  }
});
```

### Conflitos de Ação

Se dois jogadores tentam minerar o mesmo asteroide:

```js
// Servidor arbitra
const mining1 = { player: 'A', start: 1000, duration: 5000 };
const mining2 = { player: 'B', start: 1005, duration: 5000 };

// Mining2 falha (overlap)
if (overlap(mining1, mining2)) {
  rejectAction(mining2, 'asteroid_already_locked');
  notify(mining2.player, 'Asteroide já está sendo minerado');
}
```

---

## 🎮 Diferenças: PvE vs PvP

### PvE (Universo Instanciado)

```js
// Cada jogador tem sua instância
const chunk = await server.getChunkForPlayer(chunkId, playerId);

// Modificações são pessoais
await server.updatePlayerChunkState(playerId, chunkId, changes);

// Próxima sessão: restaura estado pessoal
const previousState = await server.getPlayerChunkState(playerId, chunkId);
```

**Características:**
- Sem sincronização com outros jogadores
- Modificações persistem entre sessões
- Sem contenção de recursos

### PvP (Universo Compartilhado)

```js
// Um chunk compartilhado para todos
const chunk = await server.getChunk(chunkId);

// Modificações afetam todos
await server.recordChunkChange(chunkId, change);

// Sincronização em tempo real
broadcastToChunk(chunkId, 'chunk:state_changed', newState);
```

**Características:**
- Sincronização real-time entre jogadores
- Contenção de recursos (primeiro vem, primeiro serve)
- Modificações permanentes globais

---

## 💾 Banco de Dados — Tabelas

### Tabela: `chunks`

```sql
CREATE TABLE chunks (
  id BIGINT PRIMARY KEY,
  chunk_x INT NOT NULL,
  chunk_y INT NOT NULL,
  seed VARCHAR(64) NOT NULL,
  discovered_at TIMESTAMP DEFAULT NOW(),
  discovered_by UUID REFERENCES auth.users,
  procedural_data JSONB,
  current_state JSONB,
  game_mode VARCHAR(10) CHECK (game_mode IN ('pve', 'pvp')),
  UNIQUE(chunk_x, chunk_y, game_mode)
);
```

### Tabela: `chunk_changes`

```sql
CREATE TABLE chunk_changes (
  id BIGINT PRIMARY KEY,
  chunk_id BIGINT REFERENCES chunks(id),
  object_id VARCHAR(255) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  player_id UUID REFERENCES auth.users,
  change_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_chunk_object (chunk_id, object_id),
  INDEX idx_created (created_at)
);
```

### Tabela: `player_chunk_state` (PvE)

```sql
CREATE TABLE player_chunk_state (
  id BIGINT PRIMARY KEY,
  player_id UUID REFERENCES auth.users,
  chunk_id BIGINT REFERENCES chunks(id),
  state JSONB,
  last_modified TIMESTAMP DEFAULT NOW(),
  UNIQUE(player_id, chunk_id)
);
```

---

## 🔐 Validação e Integridade

### No Servidor

Antes de aceitar uma mudança:

```js
async function validateChunkAction(chunkId, action, playerId) {
  // 1. Verificar se jogador está no chunk
  const playerLocation = await getPlayerLocation(playerId);
  if (playerLocation !== chunkId) {
    throw new Error('Player not in chunk');
  }
  
  // 2. Verificar se objeto existe
  const object = await getChunkObject(chunkId, action.targetId);
  if (!object) {
    throw new Error('Object not found');
  }
  
  // 3. Validar ação
  if (!isValidAction(object.type, action.type)) {
    throw new Error('Invalid action for object type');
  }
  
  // 4. Verificar restrições de tempo (cooldown)
  const lastAction = await getLastAction(action.targetId);
  if (Date.now() - lastAction < action.cooldown) {
    throw new Error('Action on cooldown');
  }
  
  return true;
}
```

---

## 🚀 Pipeline Completo: Exemplo

```
[1] Jogador A entra no chunk (12, -7)
    ↓
[2] Servidor busca chunk no BD
    ↓
[3] Chunk encontrado: seed = "12,-7_v1"
    ↓
[4] Gerar conteúdo procedural
    ↓
[5] Aplicar mudanças armazenadas
    ↓
[6] Renderizar no cliente
    ↓
[7] Jogador A começa a minerar asteroide
    ↓
[8] Emit: 'chunk:mining_started'
    ↓
[9] Servidor valida ação
    ↓
[10] Registra mudança em chunk_changes
    ↓
[11] Broadcast para Jogador B no mesmo chunk
    ↓
[12] Jogador A termina mineração
    ↓
[13] Emit: 'chunk:mining_completed'
    ↓
[14] Servidor atualiza asteroides HP
    ↓
[15] Jogador A sai do chunk
    ↓
[16] Sincronizar estado final
    ↓
[17] Descarregar chunk localmente
```
