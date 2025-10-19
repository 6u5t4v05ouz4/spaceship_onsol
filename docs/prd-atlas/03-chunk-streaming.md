# 🧮 Chunk Streaming

Descreve como chunks são carregados, gerenciados e descarregados dinamicamente.

---

## 🔄 Ciclo de Vida de um Chunk

| Estado | Ação | Descrição |
|--------|------|-----------|
| **`Undiscovered`** | Lazy-load | Chunk ainda não visitado por nenhum jogador |
| **`Discovered`** | Procedural seed gerada e salva | Primeiro jogador cria o estado base |
| **`Active`** | Renderizado no cliente | Jogadores presentes ou próximos do chunk |
| **`Persisted`** | Estado armazenado no servidor | Alterações registradas (PvP/PvE) |
| **`Unloaded`** | Descarregado da memória | Fora do raio ativo, não renderizado |

---

## 🎬 Transição de Estados

```
┌─────────────────┐
│  Undiscovered   │  ← Chunk nunca visitado
└────────┬────────┘
         │ (jogador entra)
         ↓
┌─────────────────┐
│  Discovered     │  ← Seed gerada e salva
└────────┬────────┘
         │ (dentro do raio ativo)
         ↓
┌─────────────────┐
│  Active         │  ← Renderizado
└────────┬────────┘
         │ (alterações ocorrem)
         ↓
┌─────────────────┐
│  Persisted      │  ← Sincronizado com servidor
└────────┬────────┘
         │ (fora do raio ativo)
         ↓
┌─────────────────┐
│  Unloaded       │  ← Descarregado, mas persistido
└─────────────────┘
```

---

## ⚙️ Atualização Dinâmica

O sistema mantém um **raio de chunks ativos** em torno do jogador.

### Raio Configurável

```js
ACTIVE_RADIUS = 1; // chunks ao redor do jogador
```

### Lógica de Atualização

Cada frame, o jogo verifica:

```js
updateChunks(playerX, playerY, scene) {
  // 1. Calcular chunk atual do jogador
  const currentChunk = getChunkCoords(playerX, playerY);
  
  // 2. Calcular chunks ativos
  const activeChunks = getActiveChunks(currentChunk, ACTIVE_RADIUS);
  
  // 3. Unload: descarregar chunks antigos
  unloadChunks(scene, activeChunks);
  
  // 4. Load: carregar novos chunks
  loadChunks(scene, activeChunks);
}
```

### Pseudo-código Detalhado

```js
function updateChunks(playerX, playerY, scene) {
  const chunkX = Math.floor(playerX / CHUNK_SIZE);
  const chunkY = Math.floor(playerY / CHUNK_SIZE);
  
  // Calcular chunks que deveriam estar ativos
  const targetChunks = new Set();
  for (let x = chunkX - ACTIVE_RADIUS; x <= chunkX + ACTIVE_RADIUS; x++) {
    for (let y = chunkY - ACTIVE_RADIUS; y <= chunkY + ACTIVE_RADIUS; y++) {
      targetChunks.add(`${x},${y}`);
    }
  }
  
  // Remover chunks não mais necessários
  scene.loadedChunks.forEach(chunkId => {
    if (!targetChunks.has(chunkId)) {
      unloadChunk(scene, chunkId);
      scene.loadedChunks.delete(chunkId);
    }
  });
  
  // Carregar novos chunks
  targetChunks.forEach(chunkId => {
    if (!scene.loadedChunks.has(chunkId)) {
      loadChunk(scene, chunkId);
      scene.loadedChunks.add(chunkId);
    }
  });
}
```

---

## 🔌 Carregamento de Chunk

Sequência de operações ao carregar um novo chunk:

### 1. Verificar Persistência

```js
const chunk = await server.getChunk(chunkId);
```

- Se já existe: carrega estado salvo
- Se novo: marca como descoberto

### 2. Gerar ou Restaurar Conteúdo

```js
if (chunk.isNew) {
  generateChunk(scene, chunkId);  // Procedural
} else {
  restoreChunk(scene, chunk);     // Do servidor
}
```

### 3. Adicionar à Cena

```js
scene.add.group() // Agrupa entidades do chunk
scene.loadedChunks.add(chunkId);
```

---

## 🗑️ Descarregamento de Chunk

Sequência ao descarregar um chunk:

### 1. Sincronizar Alterações

```js
const changes = captureChunkChanges(chunkId);
await server.saveChunkChanges(chunkId, changes);
```

### 2. Limpar Renderização

```js
const group = scene.chunkGroups.get(chunkId);
group.clear(true, true); // Destroy sprites e bodies
```

### 3. Liberar Memória

```js
scene.chunkGroups.delete(chunkId);
scene.loadedChunks.delete(chunkId);
```

---

## 📊 Otimizações e Considerações

### Threshold de Carregamento

Para evitar carregamentos muito frequentes ao cruzar bordas de chunks:

```js
// Carregar chunks com antecedência
const PRELOAD_DISTANCE = 500; // pixels antes da borda
```

### Priorização de Carga

Se há múltiplos chunks para carregar:

1. Chunks no raio imediato (prioridade alta)
2. Chunks adjacentes (prioridade média)
3. Chunks distantes (prioridade baixa)

### Limites de Taxa de Carregamento

Não carregar mais de N chunks por frame:

```js
const MAX_CHUNKS_PER_FRAME = 2;
```

Evita lag ao cruzar grandes distâncias rapidamente.

---

## 💾 Exemplo de Pipeline Completo

```
[Update Frame 1]
  Player: (1234, 5678) → Chunk (1, 5)
  Active chunks: {(0,4), (0,5), (0,6), (1,4), (1,5), (1,6), (2,4), (2,5), (2,6)}
  Current loaded: {}
  → Load all 9 chunks

[Update Frame 50]
  Player: (1350, 5700) → Still Chunk (1, 5)
  Active chunks: {(0,4), (0,5), (0,6), (1,4), (1,5), (1,6), (2,4), (2,5), (2,6)}
  Current loaded: {(0,4), (0,5), (0,6), (1,4), (1,5), (1,6), (2,4), (2,5), (2,6)}
  → No changes

[Update Frame 100]
  Player: (1999, 5000) → Chunk (1, 5) to (2, 5)
  Active chunks: {(1,4), (1,5), (1,6), (2,4), (2,5), (2,6), (3,4), (3,5), (3,6)}
  Current loaded: {(0,4), (0,5), (0,6), (1,4), (1,5), (1,6), (2,4), (2,5), (2,6)}
  → Unload: {(0,4), (0,5), (0,6)}
  → Load: {(3,4), (3,5), (3,6)}
```
