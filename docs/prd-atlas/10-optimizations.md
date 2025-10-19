# 🧩 Otimizações Futuras

Descreve estratégias de otimização para melhorar performance e escalabilidade.

---

## 🎯 Culling (Oclusão)

Desativar objetos fora da área visível da câmera.

### Visão Geral

Em vez de renderizar e processar física para entidades fora da câmera, ocultá-las.

```
┌─────────────────────────────────┐
│      Camera Viewport (visível)  │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │  ✓ Renderiza asteroides  │  │
│  │  ✓ Processa física       │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  ✗ Objetos fora não renderizam  │
└─────────────────────────────────┘
```

### Implementação

```js
class CullingManager {
  constructor(scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
  }

  updateCulling(objects) {
    const worldView = this.camera.worldView;
    
    objects.forEach(obj => {
      const isVisible = Phaser.Geom.Rectangle.ContainsPoint(
        worldView,
        { x: obj.x, y: obj.y }
      );
      
      if (isVisible) {
        obj.setActive(true);
        obj.body.enable = true;
      } else {
        obj.setActive(false);
        obj.body.enable = false;
      }
    });
  }
}

// Uso
const cullingManager = new CullingManager(scene);

scene.events.on('update', () => {
  cullingManager.updateCulling(scene.allAsteroids);
});
```

### Benefícios

- ⚡ Reduz processamento de física
- 🎨 Melhora rendering performance
- 💾 Menor uso de memória

---

## 🪜 Level of Detail (LOD)

Chunks distantes renderizados com menos detalhe.

### Conceito

```
Distância do jogador | Renderização
──────────────────────────────────
0-1 chunk           | Detalhado (todos os asteroides)
1-2 chunks          | Normal (alguns asteroides)
2-3 chunks          | Simplificado (pontos no mapa)
3+ chunks           | Minimapa (ícone pequeno)
```

### Implementação

```js
class LODManager {
  constructor() {
    this.LOD_LEVELS = {
      DETAILED: 0,    // 0-1000px
      NORMAL: 1,      // 1000-2000px
      SIMPLIFIED: 2,  // 2000-3000px
      MINIMAP: 3      // 3000+px
    };
  }

  getLODLevel(distance) {
    if (distance < 1000) return this.LOD_LEVELS.DETAILED;
    if (distance < 2000) return this.LOD_LEVELS.NORMAL;
    if (distance < 3000) return this.LOD_LEVELS.SIMPLIFIED;
    return this.LOD_LEVELS.MINIMAP;
  }

  renderChunkWithLOD(chunk, playerX, playerY, scene) {
    const distance = Phaser.Math.Distance.Between(
      chunk.centerX, chunk.centerY,
      playerX, playerY
    );
    
    const lod = this.getLODLevel(distance);
    
    switch(lod) {
      case this.LOD_LEVELS.DETAILED:
        return this.renderDetailed(chunk, scene);
      case this.LOD_LEVELS.NORMAL:
        return this.renderNormal(chunk, scene);
      case this.LOD_LEVELS.SIMPLIFIED:
        return this.renderSimplified(chunk, scene);
      case this.LOD_LEVELS.MINIMAP:
        return this.renderMinimap(chunk, scene);
    }
  }

  renderDetailed(chunk, scene) {
    // Renderizar todos os 12 asteroides
    return chunk.entities.map(entity => {
      return scene.add.sprite(entity.x, entity.y, 'asteroid_detailed');
    });
  }

  renderNormal(chunk, scene) {
    // Renderizar 50% dos asteroides
    const filtered = chunk.entities.slice(0, Math.floor(chunk.entities.length / 2));
    return filtered.map(entity => {
      return scene.add.sprite(entity.x, entity.y, 'asteroid');
    });
  }

  renderSimplified(chunk, scene) {
    // Renderizar como um único ponto
    return scene.add.sprite(chunk.centerX, chunk.centerY, 'asteroid_cluster');
  }

  renderMinimap(chunk, scene) {
    // Ícone muito pequeno no minimapa
    return scene.add.sprite(chunk.centerX, chunk.centerY, 'minimap_icon').setScale(0.1);
  }
}
```

### Benefícios

- 🚀 Escalabilidade em grandes distâncias
- ⚡ Performance constante
- 📊 Smooth zoom in/out

---

## 🔄 Multithread (Web Workers)

Gerar chunks proceduralmente em thread separada.

### Conceito

```
Main Thread              Worker Thread
──────────────────────────────────────
Renderiza               Gera chunk
Processa input          (Math-heavy)
Sincroniza              
                        ↓ (message)
Recebe resultado
```

### Implementação

```js
// main.js
class ChunkGeneratorWorker {
  constructor() {
    this.worker = new Worker('chunk-generator.worker.js');
    this.pendingRequests = new Map();
    this.requestId = 0;

    this.worker.onmessage = (event) => {
      const { requestId, chunkData } = event.data;
      const callback = this.pendingRequests.get(requestId);
      
      if (callback) {
        callback(chunkData);
        this.pendingRequests.delete(requestId);
      }
    };
  }

  generateChunk(chunkX, chunkY) {
    return new Promise((resolve) => {
      const requestId = this.requestId++;
      this.pendingRequests.set(requestId, resolve);
      
      this.worker.postMessage({
        requestId,
        chunkX,
        chunkY,
        seed: `${chunkX},${chunkY}`
      });
    });
  }
}

// chunk-generator.worker.js
self.onmessage = (event) => {
  const { requestId, chunkX, chunkY, seed } = event.data;
  
  // Gerar chunk (expensive computation)
  const chunkData = ProceduralChunkGenerator.generateChunk(
    null, chunkX, chunkY
  );
  
  // Enviar resultado
  self.postMessage({
    requestId,
    chunkData
  });
};

// Uso
const worker = new ChunkGeneratorWorker();

atlas.on('chunk:loading', async (chunkId) => {
  const [x, y] = chunkId.split(',').map(Number);
  const chunkData = await worker.generateChunk(x, y);
  // Renderizar chunkData
});
```

### Benefícios

- ⚡ Main thread não bloqueia
- 🎮 Gameplay suave mesmo durante geração
- 🚀 Múltiplas gerações paralelas

---

## 🔮 Prefetching

Carregar antecipadamente chunks na direção de movimento.

### Algoritmo

```
Jogador movendo para direita
Direção: +X

Chunks ativos: ║ X │ X │ X ║
Chunks prefetch: │ X │ X │

(próximos chunks já são carregados)
```

### Implementação

```js
class PrefetchManager {
  constructor(atlas, lookAheadDistance = 2000) {
    this.atlas = atlas;
    this.lookAheadDistance = lookAheadDistance;
    this.lastVelocity = { x: 0, y: 0 };
  }

  update(playerX, playerY, velocityX, velocityY) {
    this.lastVelocity = { x: velocityX, y: velocityY };

    // Prever próxima posição
    const predictedX = playerX + velocityX * this.lookAheadDistance;
    const predictedY = playerY + velocityY * this.lookAheadDistance;

    // Calcular chunks na direção predita
    const predictedChunks = this.getPredictedChunks(predictedX, predictedY);

    // Pre-carregar
    predictedChunks.forEach(chunkId => {
      if (!this.atlas.loadedChunks.has(chunkId) && !this.atlas.prefetchedChunks?.has(chunkId)) {
        this.atlas.prefetchChunk(chunkId);
      }
    });
  }

  getPredictedChunks(x, y) {
    const CHUNK_SIZE = 1000;
    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkY = Math.floor(y / CHUNK_SIZE);
    
    // Retornar chunks ao redor da posição predita
    const chunks = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        chunks.push(`${chunkX + dx},${chunkY + dy}`);
      }
    }
    return chunks;
  }
}

// Uso
const prefetch = new PrefetchManager(atlas);

scene.events.on('update', () => {
  prefetch.update(
    player.x, player.y,
    player.body.velocity.x, player.body.velocity.y
  );
});
```

### Benefícios

- ⚡ Transição suave entre chunks
- 🚀 Zero lag ao cruzar bordas
- 🎮 Melhor UX

---

## 📊 Compressão de Dados

Comprimir dados persistidos no servidor.

```js
// Comprimir ao salvar
async function saveChunk(chunkId, data) {
  const compressed = LZ4.compress(JSON.stringify(data));
  await database.save(chunkId, compressed);
}

// Descomprimir ao carregar
async function loadChunk(chunkId) {
  const compressed = await database.load(chunkId);
  const decompressed = LZ4.decompress(compressed);
  return JSON.parse(decompressed);
}
```

### Benefícios

- 💾 Reduz espaço no BD
- 📡 Reduz bandwidth de rede
- ⚡ Mais chunks podem ser cached

---

## 🧠 Cache Inteligente

Manter cache de chunks mais acessados.

```js
class SmartCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessCount = new Map();
  }

  get(key) {
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    return this.cache.get(key);
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      // Remove o menos acessado
      let leastAccessed = null;
      let minAccess = Infinity;
      
      this.cache.forEach((_, k) => {
        const count = this.accessCount.get(k) || 0;
        if (count < minAccess) {
          minAccess = count;
          leastAccessed = k;
        }
      });
      
      if (leastAccessed) {
        this.cache.delete(leastAccessed);
        this.accessCount.delete(leastAccessed);
      }
    }
    
    this.cache.set(key, value);
  }
}
```

---

## 🔍 Monitoramento e Profiling

Ferramentas para medir performance.

```js
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 0,
      loadTime: 0,
      unloadTime: 0,
      renderTime: 0,
      memoryUsed: 0
    };
  }

  measureFrameTime(callback) {
    const start = performance.now();
    callback();
    const end = performance.now();
    return end - start;
  }

  update() {
    this.metrics.fps = Math.round(1000 / (performance.now() % 1000 || 1));
    this.metrics.memoryUsed = performance.memory?.usedJSHeapSize / 1048576 || 0; // MB
  }

  logMetrics() {
    console.log('Performance Metrics:', this.metrics);
  }
}
```

---

## 📈 Escalabilidade Teórica

Com todas as otimizações:

| Métrica | Sem Otimização | Com Otimização |
|---------|----------------|----------------|
| Chunks renderizados | 25 | 25-50 (LOD) |
| FPS | 30-45 | 55-60 |
| Memória | 150MB | 80MB |
| Tempo de carregamento | 200ms | 50ms (prefetch) |

---

## 🗺️ Roadmap de Otimizações

1. **Sprint 1**: Culling básico
2. **Sprint 2**: LOD system
3. **Sprint 3**: Web Workers
4. **Sprint 4**: Prefetching
5. **Sprint 5**: Cache inteligente
6. **Sprint 6**: Compressão de dados

