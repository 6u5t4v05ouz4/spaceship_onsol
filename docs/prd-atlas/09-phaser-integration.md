# ⚙️ Integração Phaser.js

Descreve como o ATLAS se integra com o engine Phaser.js.

---

## 🎮 Cenas Envolvidas

### `SceneSpace`

Controla o espaço infinito e o movimento do jogador.

```js
class SceneSpace extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneSpace' });
  }

  create() {
    // Câmera segue o jogador
    this.cameras.main.setBounds(-10000, -10000, 20000, 20000);
    this.physics.world.setBounds(-10000, -10000, 20000, 20000);
    
    // Criar jogador
    this.player = this.add.sprite(0, 0, 'ship');
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    
    // Câmera segue
    this.cameras.main.startFollow(this.player);
    
    // Inicializar ATLAS
    this.atlas = new AtlasManager(this);
  }

  update() {
    // Atualizar movimento do jogador
    this.player.x += this.input.keyboard.keys[Phaser.Input.Keyboard.KeyCodes.RIGHT].isDown ? 5 : 0;
    this.player.x -= this.input.keyboard.keys[Phaser.Input.Keyboard.KeyCodes.LEFT].isDown ? 5 : 0;
    
    // Atualizar chunks (carregar/descarregar)
    this.atlas.updateChunks(this.player.x, this.player.y);
  }
}
```

### `SceneAtlas`

Gerencia chunks e entidades procedurais.

```js
class SceneAtlas extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneAtlas' });
    this.loadedChunks = new Map();
  }

  loadChunk(chunkId) {
    if (this.loadedChunks.has(chunkId)) return;
    
    const [chunkX, chunkY] = this.parseChunkId(chunkId);
    const chunkData = ProceduralChunkGenerator.generateChunk(this, chunkX, chunkY);
    
    // Criar grupo de sprites para o chunk
    const group = this.add.group();
    
    chunkData.entities.forEach(entity => {
      let sprite;
      
      if (entity.type === 'asteroid') {
        sprite = this.add.sprite(entity.position.x, entity.position.y, 'asteroid');
        sprite.setScale(entity.size === 'large' ? 2 : entity.size === 'medium' ? 1.5 : 1);
        sprite.setData('resources', entity.resources);
      } else if (entity.type === 'planet') {
        sprite = this.add.sprite(entity.position.x, entity.position.y, 'planet');
        sprite.setData('name', entity.name);
      }
      
      group.add(sprite);
    });
    
    this.loadedChunks.set(chunkId, group);
  }

  unloadChunk(chunkId) {
    const group = this.loadedChunks.get(chunkId);
    if (group) {
      group.clear(true, true);
      this.loadedChunks.delete(chunkId);
    }
  }

  parseChunkId(chunkId) {
    const [x, y] = chunkId.split(',').map(Number);
    return [x, y];
  }
}
```

### `SceneUI`

Exibe mapa e indicadores.

```js
class SceneUI extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneUI', active: true });
  }

  create() {
    // Minimapa
    this.createMinimap();
    
    // HUD
    this.createHUD();
  }

  createMinimap() {
    const minimap = this.make.graphics({
      x: this.game.config.width - 200,
      y: this.game.config.height - 200,
      add: true
    });
    
    minimap.fillStyle(0x000000, 0.5);
    minimap.fillRect(0, 0, 200, 200);
    
    this.minimap = minimap;
  }

  updateMinimap(playerX, playerY, loadedChunks) {
    const scale = 0.01;
    
    this.minimap.clear();
    this.minimap.fillStyle(0x000000, 0.5);
    this.minimap.fillRect(0, 0, 200, 200);
    
    // Desenhar chunks
    loadedChunks.forEach(chunk => {
      const chunkScreenX = (chunk.x * 1000 + 500 - playerX) * scale + 100;
      const chunkScreenY = (chunk.y * 1000 + 500 - playerY) * scale + 100;
      
      this.minimap.fillStyle(0x00ff00, 0.3);
      this.minimap.fillRect(chunkScreenX, chunkScreenY, 10, 10);
    });
    
    // Desenhar jogador
    this.minimap.fillStyle(0xff0000, 1);
    this.minimap.fillRect(95, 95, 10, 10);
  }

  createHUD() {
    this.add.text(16, 16, 'Resources: 0', { fontSize: '32px', fill: '#fff' });
  }
}
```

---

## 🔄 Pipeline Principal

### Update Loop

```js
update(time, delta) {
  // 1. Atualizar movimento do jogador
  player.update(delta);
  
  // 2. Atualizar chunks baseado na posição
  atlas.updateChunks(player.x, player.y, this);
  
  // 3. Atualizar física
  this.physics.update(delta);
  
  // 4. Atualizar UI/Câmera
  ui.updateMinimap(player.x, player.y);
  ui.updateHUD(player.stats);
}
```

### Sequência de Eventos

```
[Frame N]
  ↓
1. Input processing
  ↓
2. Player movement calculation
  ↓
3. Calculate current chunk
  ↓
4. Compare with active chunks
  ↓
5. Unload old chunks (if any)
  ↓
6. Load new chunks (if any)
  ↓
7. Render/Physics update
  ↓
8. Update UI
  ↓
9. Render frame
  ↓
[Frame N+1]
```

---

## 🎯 Classe Principal: AtlasManager

```js
class AtlasManager {
  constructor(scene) {
    this.scene = scene;
    this.loadedChunks = new Map();
    this.CHUNK_SIZE = 1000;
    this.ACTIVE_RADIUS = 2;
    this.server = new AtlasServerClient();
    this.eventManager = new AtlasEventManager();
  }

  updateChunks(playerX, playerY) {
    // Calcular chunk atual
    const currentChunkX = Math.floor(playerX / this.CHUNK_SIZE);
    const currentChunkY = Math.floor(playerY / this.CHUNK_SIZE);

    // Calcular chunks ativos
    const activeChunks = this.getActiveChunks(currentChunkX, currentChunkY);
    const activeChunkIds = new Set(
      activeChunks.map(([x, y]) => `${x},${y}`)
    );

    // Unload chunks antigos
    const chunksToUnload = [];
    this.loadedChunks.forEach((_, chunkId) => {
      if (!activeChunkIds.has(chunkId)) {
        this.unloadChunk(chunkId);
        chunksToUnload.push(chunkId);
      }
    });

    // Load novos chunks
    activeChunks.forEach(([x, y]) => {
      const chunkId = `${x},${y}`;
      if (!this.loadedChunks.has(chunkId)) {
        this.loadChunk(chunkId);
      }
    });

    return { loaded: activeChunkIds, unloaded: chunksToUnload };
  }

  getActiveChunks(centerX, centerY) {
    const chunks = [];
    for (let x = centerX - this.ACTIVE_RADIUS; x <= centerX + this.ACTIVE_RADIUS; x++) {
      for (let y = centerY - this.ACTIVE_RADIUS; y <= centerY + this.ACTIVE_RADIUS; y++) {
        chunks.push([x, y]);
      }
    }
    return chunks;
  }

  async loadChunk(chunkId) {
    // Carregar do servidor
    const chunk = await this.server.getChunk(chunkId);
    
    // Emitir evento
    this.eventManager.emit('chunk:loading', { chunkId });
    
    // Renderizar
    const group = this.renderChunk(chunk);
    this.loadedChunks.set(chunkId, group);
    
    // Emitir sucesso
    this.eventManager.emit('chunk:loaded', { chunkId });
  }

  unloadChunk(chunkId) {
    const group = this.loadedChunks.get(chunkId);
    if (group) {
      group.clear(true, true);
      this.loadedChunks.delete(chunkId);
      
      this.eventManager.emit('chunk:unloaded', { chunkId });
    }
  }

  renderChunk(chunk) {
    const group = this.scene.add.group();
    
    chunk.entities.forEach(entity => {
      // ... renderização similar ao SceneAtlas
    });
    
    return group;
  }
}
```

---

## 📡 Comunicação com Servidor

### Cliente → Servidor

```js
class AtlasServerClient {
  constructor() {
    this.baseUrl = 'https://api.example.com';
  }

  async getChunk(chunkId) {
    const response = await fetch(`${this.baseUrl}/chunks/${chunkId}`);
    return response.json();
  }

  async recordAction(chunkId, action) {
    const response = await fetch(`${this.baseUrl}/chunks/${chunkId}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action)
    });
    return response.json();
  }

  connectWebSocket() {
    this.socket = io(this.baseUrl);
    
    this.socket.on('chunk:state_updated', (data) => {
      console.log('Chunk updated:', data);
    });
  }
}
```

---

## 🎨 Assets Required

```
textures/
├── asteroid.png
├── planet.png
├── ship.png
└── effects/
    ├── explosion.png
    └── mining_effect.png

sounds/
├── mining.mp3
├── explosion.mp3
└── ambient.mp3

UI/
├── hud_background.png
├── minimap_frame.png
└── icons/
    ├── resources.png
    ├── health.png
    └── energy.png
```

---

## 🧪 Testes de Integração

```js
// test-atlas-integration.js

describe('ATLAS Integration with Phaser', () => {
  let scene, atlas;

  beforeEach(() => {
    scene = new SceneSpace();
    atlas = new AtlasManager(scene);
  });

  test('should load chunks when player moves', () => {
    atlas.updateChunks(0, 0);
    expect(atlas.loadedChunks.size).toBe(25); // 5x5 grid
  });

  test('should unload distant chunks', () => {
    atlas.updateChunks(5000, 5000);
    expect(atlas.loadedChunks.size).toBeLessThanOrEqual(25);
  });

  test('should generate different chunks with different seeds', () => {
    const chunk1 = ProceduralChunkGenerator.generateChunk(scene, 0, 0);
    const chunk2 = ProceduralChunkGenerator.generateChunk(scene, 1, 0);
    expect(chunk1.entities.length).not.toBe(chunk2.entities.length);
  });
});
```
