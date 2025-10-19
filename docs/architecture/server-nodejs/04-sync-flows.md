# 🔄 Sync Flows: Fluxos de Sincronização

Descrição detalhada dos fluxos de sincronização entre Cliente, Node.js Server e Supabase.

---

## 📋 Visão Geral

Cada interação no jogo segue um padrão de sincronização:

```
Cliente → WebSocket → Node.js Server → Validação/Processamento → Supabase (Persistência)
  ↑                                                                       ↓
  └───────────────────── Broadcast para Clientes ←───────────────────────┘
```

---

## 🎮 Flow 1: Player Enter Chunk

Quando um jogador entra em um novo chunk.

### Sequência

```
1. Cliente emite: chunk:enter
   ├─ chunkX, chunkY
   ├─ userId
   └─ token

2. Server recebe e valida
   ├─ Autenticação JWT
   ├─ Posição dentro do mundo
   └─ Não está em outro chunk

3. Server calcula zona
   ├─ Distance from origin
   ├─ Coordinate probability
   └─ Determina: safe / transition / hostile

4. Server consulta Supabase
   ├─ SELECT * FROM chunks WHERE chunk_x=$1 AND chunk_y=$2
   ├─ Se não existe → Gera proceduralmente
   └─ Se existe → Carrega estado atual

5. Server envia chunk data
   ├─ Chunk ID
   ├─ Zone type
   ├─ Biome visuals
   ├─ Objects (asteroides, planetas, etc)
   ├─ Players já presentes
   └─ Safe/Hostile indicators

6. Broadcast para outros players
   ├─ new-player:joined
   ├─ userId
   ├─ Posição
   └─ Ship info

7. Atualizar Supabase
   ├─ UPDATE players SET current_chunk=$1, updated_at=NOW()
   └─ Assíncrono (não bloqueia)
```

### Código de Exemplo

```js
// events/chunk-events.js
export async function handleChunkEnter(socket, data, io) {
  const { chunkX, chunkY, userId, token } = data;
  
  try {
    // 1. Validar auth
    const user = await validateJWT(token);
    if (user.id !== userId) throw new Error('Invalid user');
    
    // 2. Validar coordenadas
    if (Math.abs(chunkX) > 1000000 || Math.abs(chunkY) > 1000000) {
      throw new Error('Invalid chunk coordinates');
    }
    
    // 3. Calcular zona
    const zone = calculateZone(chunkX, chunkY);
    
    // 4. Carregar chunk do Supabase
    let chunk = await supabaseAdmin
      .from('chunks')
      .select('*')
      .eq('chunk_x', chunkX)
      .eq('chunk_y', chunkY)
      .single();
    
    if (!chunk.data) {
      // Gerar novo chunk proceduralmente
      chunk = await generateChunk(chunkX, chunkY, zone);
      
      await supabaseAdmin
        .from('chunks')
        .insert({
          chunk_x: chunkX,
          chunk_y: chunkY,
          zone_type: zone.type,
          discovered_by: userId,
          discovered_at: new Date(),
          procedural_data: chunk.procedural
        });
    }
    
    // 5. Atualizar cache do jogador
    cacheManager.addPlayer(userId, {
      id: userId,
      socketId: socket.id,
      currentChunk: `${chunkX},${chunkY}`,
      x: 0, // Posição dentro do chunk
      y: 0,
      health: 100
    });
    
    // 6. Enviar chunk data para cliente
    socket.emit('chunk:data', {
      chunkId: `${chunkX},${chunkY}`,
      zoneType: zone.type,
      biomeFile: zone.biomeFile,
      objects: chunk.data.current_state.objects,
      players: cacheManager.getPlayersInChunk(`${chunkX},${chunkY}`)
        .map(p => ({ id: p.id, x: p.x, y: p.y }))
    });
    
    // 7. Broadcast para outros players
    socket.broadcast.emit('new-player:joined', {
      userId,
      chunkX,
      chunkY,
      x: 0,
      y: 0
    });
    
    // 8. Atualizar Supabase (assíncrono)
    supabaseAdmin
      .from('players')
      .update({
        current_chunk: `${chunkX},${chunkY}`,
        updated_at: new Date()
      })
      .eq('id', userId)
      .then(() => logger.debug(`Player ${userId} chunk updated`));
      
  } catch (err) {
    logger.error('Chunk enter error', err);
    socket.emit('error', { message: err.message });
  }
}
```

---

## ⚔️ Flow 2: Battle (PvP)

Quando dois jogadores se atacam.

### Sequência

```
1. Attacker emite: battle:attack
   ├─ defenderId
   ├─ weaponType
   ├─ damage
   └─ timestamp

2. Server valida
   ├─ Ambos no mesmo chunk
   ├─ Ambos online
   ├─ Zone permite PvP (não safe)
   └─ Attacker em range

3. Server executa battle logic
   ├─ Calcula dano final
   ├─ Aplica modificadores de zona
   ├─ Toma dano do defender
   └─ Verifica se morreu

4. Se vivo → Contínua
   └─ Defender pode contra-atacar

5. Se morreu → Game Over
   ├─ Limpar da cache
   ├─ Salvar death em battle_logs
   ├─ Respawnar em origem (0,0)
   └─ Notificar killer

6. Broadcast
   ├─ health:changed
   ├─ player:died
   └─ loot:dropped

7. Persistir em Supabase
   ├─ INSERT battle_logs
   ├─ UPDATE players (health, resources)
   └─ UPDATE chunks (loot position)
```

### Código de Exemplo

```js
// events/battle-events.js
export async function handleAttack(socket, data, io) {
  const { attackerId, defenderId, damage, timestamp } = data;
  
  try {
    // 1. Validar ambos players
    const attacker = cacheManager.getPlayer(attackerId);
    const defender = cacheManager.getPlayer(defenderId);
    
    if (!attacker || !defender) {
      throw new Error('Player not found');
    }
    
    // 2. Validar mesmo chunk
    if (attacker.currentChunk !== defender.currentChunk) {
      throw new Error('Players not in same chunk');
    }
    
    // 3. Validar zona (não safe)
    const zone = calculateZone(...attacker.currentChunk.split(','));
    if (zone.type === 'safe') {
      throw new Error('PvP not allowed in safe zone');
    }
    
    // 4. Calcular dano com modificadores
    const baseDamage = damage;
    const zoneMultiplier = zone.type === 'hostile' ? 1.5 : 1.0;
    const finalDamage = Math.floor(baseDamage * zoneMultiplier);
    
    // 5. Aplicar dano
    const defenderHealth = cacheManager.takeDamage(defenderId, finalDamage);
    
    // 6. Broadcast health update
    io.to(`chunk:${attacker.currentChunk}`)
      .emit('health:changed', {
        playerId: defenderId,
        health: defenderHealth,
        damage: finalDamage
      });
    
    // 7. Se morreu
    if (defenderHealth === 0) {
      handlePlayerDeath(defenderId, attackerId, zone, io);
    }
    
    // 8. Registrar batalha (assíncrono)
    await supabaseAdmin
      .from('battle_logs')
      .insert({
        chunk_id: attacker.currentChunk,
        attacker_id: attackerId,
        defender_id: defenderId,
        damage: finalDamage,
        zone_type: zone.type,
        created_at: new Date()
      });
    
  } catch (err) {
    logger.error('Attack error', err);
    socket.emit('error', { message: err.message });
  }
}

async function handlePlayerDeath(playerId, killerId, zone, io) {
  const player = cacheManager.getPlayer(playerId);
  const killer = cacheManager.getPlayer(killerId);
  
  // 1. Calcular loot
  const lootAmount = Math.floor(player.resources * 0.5);
  
  // 2. Atualizar cache
  cacheManager.removePlayer(playerId);
  cacheManager.collectResources(killerId, lootAmount);
  
  // 3. Broadcast death
  io.emit('player:died', {
    playerId,
    killerId,
    loot: lootAmount,
    zone: zone.type
  });
  
  // 4. Persistir
  await Promise.all([
    supabaseAdmin.from('players').update({
      health: 100,
      position: [0, 0], // Respawn em origem
      resources: 0,
      deaths: `deaths + 1`,
      updated_at: new Date()
    }).eq('id', playerId),
    
    supabaseAdmin.from('players').update({
      resources: `resources + ${lootAmount}`,
      kills: `kills + 1`
    }).eq('id', killerId)
  ]);
}
```

---

## ⛏️ Flow 3: Mining

Quando um jogador coleta recursos.

### Sequência

```
1. Cliente emite: mining:start
   ├─ asteroidId
   ├─ chunkX, chunkY
   └─ duration

2. Server valida
   ├─ Asteroid existe no chunk
   ├─ Está próximo do jogador
   ├─ Ainda tem recursos
   └─ Jogador não está em combate

3. Server inicia mining
   ├─ Reserva recurso em cache
   ├─ Simula progresso
   └─ Aguarda conclusão

4. Cliente emite: mining:complete
   ├─ asteroidId
   ├─ resources coletados
   └─ timestamp

5. Server valida conclusão
   ├─ Tempo decorrido correto
   ├─ Recursos disponíveis
   ├─ Mesmo jogador

6. Aplicar coleta
   ├─ Decrementar asteroid resources
   ├─ Adicionar ao inventário do jogador
   ├─ Marcar para batch update
   └─ Supabase: UPDATE com delay

7. Broadcast
   ├─ asteroid:damaged
   ├─ resources:gained
   └─ Atualizar UI de asteroides

8. Se asteroid zerou
   ├─ Marcar como depleted
   ├─ Remover da visualização
   └─ UPDATE chunks.current_state
```

### Código de Exemplo

```js
// events/mining-events.js
export async function handleMiningStart(socket, data, io) {
  const { userId, asteroidId, chunkId, duration } = data;
  
  try {
    // 1. Validar asteroid
    const chunk = await supabaseAdmin
      .from('chunks')
      .select('current_state')
      .eq('id', chunkId)
      .single();
    
    const asteroid = chunk.data.current_state.objects
      .find(o => o.id === asteroidId);
    
    if (!asteroid || asteroid.resources <= 0) {
      throw new Error('Asteroid depleted or not found');
    }
    
    // 2. Validar distância
    const player = cacheManager.getPlayer(userId);
    const distance = Math.hypot(
      player.x - asteroid.x,
      player.y - asteroid.y
    );
    
    if (distance > 100) { // Range de mineração
      throw new Error('Too far from asteroid');
    }
    
    // 3. Marcar como sendo minado
    socket.emit('mining:started', {
      asteroidId,
      duration,
      estimatedReward: Math.floor(asteroid.resources * 0.1)
    });
    
    // 4. Simular progresso no servidor
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 100;
      const progress = Math.min((elapsed / duration) * 100, 100);
      
      socket.emit('mining:progress', { progress });
      
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 100);
    
  } catch (err) {
    logger.error('Mining start error', err);
    socket.emit('error', { message: err.message });
  }
}

export async function handleMiningComplete(socket, data, io) {
  const { userId, asteroidId, chunkId, resourcesGained } = data;
  
  try {
    // 1. Validar jogador
    const player = cacheManager.getPlayer(userId);
    if (!player) throw new Error('Player not found');
    
    // 2. Adicionar recursos ao cache
    cacheManager.collectResources(userId, resourcesGained);
    
    // 3. Atualizar asteroid no Supabase (batch)
    const chunk = await supabaseAdmin
      .from('chunks')
      .select('current_state')
      .eq('id', chunkId)
      .single();
    
    const updatedObjects = chunk.data.current_state.objects.map(obj => {
      if (obj.id === asteroidId) {
        return { ...obj, resources: Math.max(0, obj.resources - resourcesGained) };
      }
      return obj;
    });
    
    // 4. Atualizar chunk (pode ser batch)
    await supabaseAdmin
      .from('chunks')
      .update({
        current_state: { ...chunk.data.current_state, objects: updatedObjects },
        modified_at: new Date()
      })
      .eq('id', chunkId);
    
    // 5. Broadcast para chunk
    io.to(`chunk:${chunkId}`).emit('mining:complete', {
      playerId: userId,
      asteroidId,
      resourcesGained,
      asteroidRemaining: Math.max(0, asteroid.resources - resourcesGained)
    });
    
    // 6. Atualizar player no Supabase (batch/assíncrono)
    cacheManager.batchUpdates.add(userId);
    
  } catch (err) {
    logger.error('Mining complete error', err);
    socket.emit('error', { message: err.message });
  }
}
```

---

## 🚀 Flow 4: Player Movement

Movimento contínuo do jogador pelo mapa.

### Sequência

```
1. Cliente emite: player:move (cada 100ms)
   ├─ x, y (posição relativa ao chunk)
   ├─ vx, vy (velocidade)
   └─ timestamp

2. Server recebe (pode descartar alguns)
   ├─ Validar posição dentro do chunk
   ├─ Aplicar movimento ao cache
   └─ NÃO persistir a cada movimento

3. Cache atualiza
   ├─ player.x = x
   ├─ player.y = y
   ├─ Recalcular outros players visíveis
   └─ Detectar mudança de chunk

4. Se mudou de chunk
   ├─ Emitir chunk:enter (novo flow)
   └─ Limpar de chunk antigo

5. Broadcast periódico (a cada 500ms)
   ├─ players:moved
   ├─ Lista de posições no chunk
   └─ Apenas jogadores visíveis

6. Sem persistência por movimento
   ├─ Salvar posição apenas ao desconectar
   ├─ Ou periodicamente (a cada 5s)
   └─ Em batch update
```

### Código de Exemplo

```js
// events/player-events.js
export function handleMove(socket, data, io) {
  const { userId, x, y, chunkX, chunkY } = data;
  
  try {
    // 1. Validar coordenadas
    if (x < 0 || x > 5000 || y < 0 || y > 5000) {
      logger.warn(`Invalid move coords from ${userId}: ${x}, ${y}`);
      return;
    }
    
    // 2. Atualizar cache (muito rápido)
    cacheManager.updatePosition(userId, x, y);
    
    // 3. Verificar mudança de chunk
    const player = cacheManager.getPlayer(userId);
    const oldChunk = player.currentChunk;
    const newChunk = `${chunkX},${chunkY}`;
    
    if (oldChunk !== newChunk) {
      // Mudou de chunk - trigger novo flow
      socket.emit('chunk:enter', {
        chunkX,
        chunkY,
        userId
      });
      return;
    }
    
    // 4. Broadcast apenas para jogadores no mesmo chunk
    io.to(`chunk:${oldChunk}`).emit('player:moved', {
      playerId: userId,
      x,
      y
    });
    
  } catch (err) {
    logger.error('Move error', err);
  }
}
```

---

## 🔄 Flow 5: Periodic Sync (Batch)

Sincronização periódica de dados não-críticos.

### Sequência

```
Cada 5 segundos:
1. Coletar atualizações em cache
   ├─ batchUpdates (recursos, posição)
   ├─ Não críticas (não afetam gameplay)
   └─ Podem ter pequeno delay

2. Agrupar por tipo
   ├─ Resources updates
   ├─ Position updates
   ├─ Chunk modifications
   └─ Discovery updates

3. Enviar para Supabase em lote
   ├─ INSERT/UPDATE múltiplos registros
   ├─ Com transação
   └─ Em paralelo

4. Limpar queue se sucesso
   ├─ batchUpdates.clear()
   └─ Log de sucesso

5. Em caso de erro
   ├─ Manter na queue
   ├─ Retry na próxima iteração
   └─ Log de erro
```

### Código de Exemplo

```js
// managers/sync-manager.js
export class SyncManager {
  constructor() {
    this.batchInterval = 5000; // 5 segundos
    this.startPeriodicSync();
  }
  
  startPeriodicSync() {
    setInterval(async () => {
      try {
        // 1. Coletar updates
        const batchPlayers = Array.from(cacheManager.batchUpdates)
          .map(id => cacheManager.getPlayer(id))
          .filter(p => p);
        
        if (batchPlayers.length === 0) return;
        
        // 2. Preparar dados
        const updates = batchPlayers.map(p => ({
          id: p.id,
          resources: p.resources,
          current_chunk: p.currentChunk,
          updated_at: new Date()
        }));
        
        // 3. Enviar para Supabase
        const { error } = await supabaseAdmin
          .from('players')
          .upsert(updates);
        
        if (error) throw error;
        
        // 4. Limpar queue
        cacheManager.batchUpdates.clear();
        logger.info(`✅ Synced ${updates.length} players`);
        
      } catch (err) {
        logger.error('Batch sync error', err);
        // Mantém na queue para próxima tentativa
      }
    }, this.batchInterval);
  }
}
```

---

## 🎯 Prioridades de Sincronização

```
CRÍTICO (imediato):
├─ Player death
├─ Battle outcome
├─ Zone validation errors
└─ RLS violations

ALTO (< 1 seg):
├─ Join chunk
├─ Resource collected
├─ Chunk generation
└─ Damage taken

MÉDIO (< 5 seg):
├─ Position updates
├─ Resource accumulation
├─ Chunk modifications
└─ Discoveries

BAIXO (< 30 seg):
├─ Session data
├─ Stats aggregation
├─ Analytics
└─ Cleanup
```

---

## 🔗 Relacionamentos Entre Flows

```
chunk:enter
  ├─ Valida zona
  ├─ Carrega chunk
  └─ Prepara para battle/mining

player:move
  └─ Pode trigger chunk:enter
       └─ Se crossed chunk boundary

battle:attack
  ├─ Player em mesmo chunk
  ├─ Player em chunk não-safe
  └─ Pode resultar em player:died

mining:start → mining:complete
  ├─ Valida asteroid no chunk
  ├─ Atualiza resources
  └─ Trigger periodic sync

periodic:sync
  └─ Agrupa todas as updates
      └─ Envia em batch ao Supabase
```

---

## 📊 Exemplo de Timeline Completa

```
T=0s:    Player A conecta
T=0.5s:  Client emite chunk:enter (0,0)
T=0.6s:  Server valida, calcula zona (safe), envia chunk:data
T=1s:    Player A emite player:move (100, 100)
T=1.1s:  Server atualiza cache, broadcast move
T=2s:    Player B entra no chunk (0,0)
T=2.1s:  Broadcast new-player:joined para A
T=3s:    Player A emite mining:start (asteroid_1)
T=5s:    Client emite mining:complete
T=5.1s:  Server atualiza asteroid, broadcast mining:complete
T=5.5s:  Player A vs B emite battle:attack
T=5.6s:  Server valida, aplica dano, broadcast health:changed
T=6s:    Player B morre, handlePlayerDeath executa
T=6.1s:  Broadcast player:died, Player B respawna em (0,0)
T=10s:   periodic:sync agrupa todas updates do servidor, envia ao Supabase
```

---

## 📘 Documentação Relacionada

- [02 - Sistema de Zonas](./02-zone-system.md) — Cálculo de zonas safe/hostile
- [03 - Database Schema](./03-database-schema.md) — Tabelas e índices
- [05 - WebSocket Events](./05-websocket-events.md) — Eventos completos
- [ARCHITECTURE-V2.md](../ARCHITECTURE-V2.md) — Visão geral arquitetura

---

**Versão**: v1.0  
**Atualizado**: Outubro 2025  
**Status**: 🟢 Documentação Completa
