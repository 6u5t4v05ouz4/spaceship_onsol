# 🧠 Eventos e Descoberta

Descreve os eventos disparados no sistema ATLAS e como as descobertas funcionam.

---

## 📡 Eventos Principais

### Ciclo de Vida de um Chunk

```
┌──────────────────────┐
│ onChunkUndiscovered  │  Chunk nunca visitado
└──────────┬───────────┘
           │
    (jogador entra)
           ↓
┌──────────────────────┐
│ onChunkDiscovered    │  Primeiro acesso - seed salva
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│ onChunkEnter         │  Jogador entra - renderizar
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│ onChunkModified      │  Ações (mineração, etc)
└──────────┬───────────┘
           │
    (jogador sai)
           ↓
┌──────────────────────┐
│ onChunkExit          │  Sincronizar e descarregar
└──────────────────────┘
```

---

## 🎯 Definições de Eventos

### `onChunkDiscovered`

Disparado quando um jogador entra em um chunk pela primeira vez.

```js
event.onChunkDiscovered = {
  chunkId: '12,-7',
  playerId: 'player_xyz',
  seed: '12,-7_v1',
  timestamp: 2025-10-18T21:00:00Z,
  procedural_data: {
    biome: 'asteroid_field',
    density: 1.0
  }
};
```

**Ações Associadas:**
- Registrar descoberta no BD
- Mostrar notificação ao jogador
- Adicionar aos logs de exploração
- Dar recompensas (XP, badges)
- Disparar missões dinâmicas

### `onChunkEnter`

Disparado quando um jogador entra em um chunk (já descoberto ou novo).

```js
event.onChunkEnter = {
  chunkId: '12,-7',
  playerId: 'player_xyz',
  previousChunk: '12,-6',
  timestamp: 2025-10-18T21:00:30Z
};
```

**Ações Associadas:**
- Carregar conteúdo procedural
- Restaurar modificações persistidas
- Atualizar minimap
- Sincronizar estado com servidor
- Notificar outros jogadores (PvP)

### `onChunkExit`

Disparado quando um jogador sai de um chunk.

```js
event.onChunkExit = {
  chunkId: '12,-7',
  playerId: 'player_xyz',
  nextChunk: '12,-8',
  timeSpent: 145000,  // ms
  actionsPerformed: 3,
  resourcesCollected: 250,
  timestamp: 2025-10-18T21:02:25Z
};
```

**Ações Associadas:**
- Salvar estado do chunk
- Calcular recompensas por tempo
- Sincronizar alterações finais
- Liberar memória
- Unload de renderização

### `onChunkModified`

Disparado quando uma ação modifica um chunk (mineração, construção, etc).

```js
event.onChunkModified = {
  chunkId: '12,-7',
  playerId: 'player_xyz',
  action: {
    type: 'mining',
    targetId: 'ast_12_-7_0',
    resourcesCollected: 50,
    durationMs: 5000
  },
  timestamp: 2025-10-18T21:01:15Z,
  previousState: { resources: 85 },
  newState: { resources: 35 }
};
```

**Ações Associadas:**
- Gravar mudança no BD
- Sincronizar com outros jogadores (PvP)
- Atualizar inventory do jogador
- Verificar objetivos de missões
- Atualizar estatísticas
- Disparar eventos secundários (destruição = nova nave?)

---

## 🎁 Sistema de Descoberta

### Registro de Descobertas

Cada jogador mantém um log de descobertas:

```sql
CREATE TABLE player_discoveries (
  id BIGINT PRIMARY KEY,
  player_id UUID REFERENCES auth.users,
  chunk_id BIGINT REFERENCES chunks(id),
  discovered_at TIMESTAMP,
  time_spent_seconds INT,
  resources_collected INT,
  actions_performed INT,
  discovery_type VARCHAR(50)  -- first_blood, rediscovered, etc
);
```

### Tipos de Descoberta

| Tipo | Descrição | Recompensa |
|------|-----------|-----------|
| **First Blood** | Primeiro a descobrir um chunk | +100 XP, Badge especial |
| **Deep Explorer** | Descobrir 10 chunks únicos | +50 XP cada |
| **Danger Zone** | Descobrir zona de alta dificuldade | Bônus 2x XP |
| **Biome Master** | Descobrir todos os chunks de um bioma | Título especial |
| **Rediscovery** | Revisitar chunk já descoberto | +10 XP |

### Notificações de Descoberta

```js
function showDiscoveryNotification(event) {
  if (event.type === 'onChunkDiscovered') {
    const data = event.procedural_data;
    showNotif({
      title: 'Nova Região Descoberta!',
      description: `Você descobriu uma ${data.biome} em ${event.chunkId}`,
      icon: getBiomeIcon(data.biome),
      action: () => openExplorationLog()
    });
  }
}
```

---

## 🎯 Eventos de Ação

### Mineração

```js
emit('action:mining_started', {
  chunkId: '12,-7',
  asteroidId: 'ast_0',
  playerId: 'player_xyz',
  durationSeconds: 5,
  estimatedResources: 50
});

emit('action:mining_completed', {
  chunkId: '12,-7',
  asteroidId: 'ast_0',
  playerId: 'player_xyz',
  resourcesCollected: 50,
  totalTime: 5000
});
```

### Construção

```js
emit('action:construction_started', {
  chunkId: '12,-7',
  buildingType: 'mining_station',
  position: { x: 12500, y: -7500 },
  playerId: 'player_xyz',
  durationSeconds: 30
});

emit('action:construction_completed', {
  chunkId: '12,-7',
  buildingId: 'station_new_1',
  buildingType: 'mining_station',
  playerId: 'player_xyz',
  costs: { resources: 200, energy: 50 }
});
```

### Combate

```js
emit('action:combat_started', {
  chunkId: '12,-7',
  attacker: 'player_xyz',
  defender: 'npc_pirate_1',
  weapon: 'laser'
});

emit('action:combat_ended', {
  chunkId: '12,-7',
  winner: 'player_xyz',
  loser: 'npc_pirate_1',
  loot: { resources: 150, tech_blueprints: 1 }
});
```

---

## 📊 EventEmitter Architecture

### Sistema de Events

```js
class AtlasEventManager {
  constructor() {
    this.events = {};
  }

  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  off(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    }
  }

  emit(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventName} handler:`, error);
        }
      });
    }
  }
}

// Uso
const atlas = new AtlasEventManager();

atlas.on('chunk:discovered', (data) => {
  console.log(`Chunk ${data.chunkId} descoberto por ${data.playerId}`);
  incrementDiscoveryCount(data.playerId);
  giveRewardXP(data.playerId, 100);
});

atlas.emit('chunk:discovered', {
  chunkId: '12,-7',
  playerId: 'player_xyz'
});
```

---

## 🎮 Integração com Gameplay

### Missões Dinâmicas

Eventos podem disparar missões:

```js
atlas.on('chunk:discovered', (data) => {
  const difficulty = data.procedural_data.difficulty;
  
  if (difficulty > 3) {
    // Disparar missão de "exploração perigosa"
    createDynamicMission({
      type: 'exploration_mission',
      chunkId: data.chunkId,
      difficulty: difficulty,
      reward: difficulty * 50
    });
  }
});
```

### Achievements

```js
atlas.on('chunk:discovered', (data) => {
  const player = getPlayer(data.playerId);
  player.discoveredChunks.push(data.chunkId);
  
  // Verificar achievements
  if (player.discoveredChunks.length === 10) {
    unlockAchievement(player, 'explorer_10');
  }
  if (player.discoveredChunks.length === 50) {
    unlockAchievement(player, 'explorer_50');
  }
});
```

### Notificações em Tempo Real

```js
atlas.on('action:mining_completed', (data) => {
  const player = getPlayer(data.playerId);
  
  // Notificação local
  showNotification({
    message: `Mineração concluída! +${data.resourcesCollected} recursos`,
    duration: 3000
  });
  
  // Notificação para outros (PvP)
  if (gameMode === 'pvp') {
    broadcastToChunk(data.chunkId, 'notification:other_player_action', {
      player: player.name,
      action: 'mineração',
      resources: data.resourcesCollected
    });
  }
});
```

---

## 📋 Log de Exploração

Cada jogador tem acesso a um histórico:

```json
{
  "player_id": "player_xyz",
  "discoveries": [
    {
      "chunk_id": "12,-7",
      "discovered_at": "2025-10-18T21:00:00Z",
      "biome": "asteroid_field",
      "difficulty": 1,
      "time_spent": 145,
      "resources_collected": 250
    },
    {
      "chunk_id": "12,-8",
      "discovered_at": "2025-10-18T21:30:00Z",
      "biome": "nebula_zone",
      "difficulty": 2,
      "time_spent": 320,
      "resources_collected": 450
    }
  ],
  "total_chunks_discovered": 47,
  "total_resources_collected": 12450,
  "furthest_distance": 3.5,  // em unidades de chunk
  "rarest_biome": "wormhole_area"
}
```
