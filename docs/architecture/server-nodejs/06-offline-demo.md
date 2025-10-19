# 🎮 Offline Demo Mode: PvE Local

Documentação do modo demo offline - PvE local sem conexão com servidor, sem persistência de dados.

---

## 📋 Visão Geral

```
┌─────────────────────────────────────────────┐
│         Offline Mode (Local)                │
├─────────────────────────────────────────────┤
│ • Phaser.js (Client-side game engine)      │
│ • Geração procedural local de chunks       │
│ • Simulação de mineração e combate         │
│ • SEM conexão ao Node.js Server            │
│ • SEM persistência (dados perdidos)        │
│ • SEM outros jogadores                     │
│ • SEM PvP (apenas PvE)                     │
└─────────────────────────────────────────────┘
```

### Propósito

- ✅ **Demo/Showcase** — Experimentar mecânicas do jogo
- ✅ **Tutorial** — Aprender controles e gameplay
- ✅ **Desenvolvimento Local** — Testar sem servidor
- ✅ **Offline Gameplay** — Jogar sem internet
- ✅ **Performance Testing** — Testar client-side

### Limitações

- ❌ **Sem Persistência** — Dados perdidos ao recarregar
- ❌ **Sem Multiplayer** — Apenas um jogador
- ❌ **Sem PvP** — Combate apenas com NPCs/asteroides
- ❌ **Sem Leveling** — Stats não salvam
- ❌ **Sem Marketplace** — Economia local apenas

---

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/game/offline/
├── index.js                # Entry point
├── managers/
│   ├── offline-cache.js    # Cache em memória local
│   ├── chunk-generator.js  # Geração procedural
│   └── player-manager.js   # Estado do jogador
├── scenes/
│   ├── offline-space.js    # Scene do espaço
│   └── offline-ui.js       # UI/HUD
├── entities/
│   ├── player-ship.js      # Nave do jogador
│   ├── asteroid.js         # Asteroides
│   ├── npc.js              # NPCs/inimigos
│   └── projectile.js       # Projéteis
└── utils/
    ├── distance.js         # Cálculos de distância
    └── procedural.js       # Geração procedural
```

### Máquina de Estados

```
┌─────────────┐
│   Loading   │  Carregar assets
└──────┬──────┘
       │
       ↓
┌──────────────┐
│    Menu      │  Tela inicial, opções
└──────┬───────┘
       │
       ↓
┌─────────────┐
│   Playing   │  Jogo em progresso
└──────┬──────┘
       │
       ├─→ Paused (P ou ESC)
       │
       ├─→ Dead (Voltou a origem)
       │
       └─→ GameOver (Sair)
```

---

## 🎯 Funcionalidades

### 1. Geração Procedural Local

```js
// src/game/offline/managers/chunk-generator.js
export class OfflineChunkGenerator {
  generateChunk(chunkX, chunkY, seed) {
    // 1. Criar seed determinístico
    const hash = this.hashCoordinates(chunkX, chunkY, seed);
    
    // 2. Gerar asteroides
    const asteroids = this.generateAsteroids(hash, 20);
    
    // 3. Gerar planetas (ocasionalmente)
    const planets = hash % 5 === 0 ? this.generatePlanets(hash, 3) : [];
    
    // 4. Gerar NPCs/inimigos
    const npcs = this.generateNPCs(hash, 5);
    
    return {
      id: `${chunkX},${chunkY}`,
      seed,
      objects: [...asteroids, ...planets],
      npcs,
      zone: this.calculateZone(chunkX, chunkY)
    };
  }
  
  generateAsteroids(hash, count) {
    const asteroids = [];
    for (let i = 0; i < count; i++) {
      const angle = (hash * (i + 1)) % 360;
      const distance = 500 + ((hash * i) % 2000);
      const x = Math.cos(angle * Math.PI / 180) * distance;
      const y = Math.sin(angle * Math.PI / 180) * distance;
      
      asteroids.push({
        id: `ast_${hash}_${i}`,
        type: 'asteroid',
        x, y,
        size: ['small', 'medium', 'large'][(hash * i) % 3],
        resources: 50 + ((hash * i) % 150),
        health: 100
      });
    }
    return asteroids;
  }
  
  generateNPCs(hash, count) {
    const npcs = [];
    for (let i = 0; i < count; i++) {
      const angle = (hash * (i + 2)) % 360;
      const distance = 1000 + ((hash * i) % 3000);
      
      npcs.push({
        id: `npc_${hash}_${i}`,
        type: ['drone', 'pirate', 'scout'][(hash * i) % 3],
        x: Math.cos(angle * Math.PI / 180) * distance,
        y: Math.sin(angle * Math.PI / 180) * distance,
        health: 50 + ((hash * i) % 50),
        damage: 10 + ((hash * i) % 20),
        loot: 10 + ((hash * i) % 50)
      });
    }
    return npcs;
  }
}
```

### 2. Simulação de Mineração

```js
// src/game/offline/entities/asteroid.js
export class Asteroid extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, data) {
    super(scene, x, y, 'asteroid');
    this.data = data;
    this.miningProgress = 0;
    this.isMined = false;
  }
  
  startMining(duration = 5000) {
    this.miningProgress = 0;
    this.isMining = true;
    
    this.mineTimer = this.scene.time.addTimer({
      delay: duration,
      callback: () => this.completeMining()
    });
  }
  
  cancelMining() {
    this.isMining = false;
    this.miningProgress = 0;
    if (this.mineTimer) this.mineTimer.remove();
  }
  
  completeMining() {
    const resourcesGained = Math.floor(this.data.resources * 0.1);
    this.data.resources -= resourcesGained;
    
    this.scene.player.addResources(resourcesGained);
    
    if (this.data.resources <= 0) {
      this.depleteAsteroid();
    }
    
    this.isMining = false;
    this.miningProgress = 0;
  }
  
  depleteAsteroid() {
    this.isMined = true;
    this.setAlpha(0.3);
    this.scene.physics.world.disable(this);
  }
  
  update() {
    if (this.isMining && this.mineTimer) {
      this.miningProgress = Math.min(
        100,
        (this.mineTimer.elapsed / this.mineTimer.delay) * 100
      );
      
      // Atualizar UI de progresso
      this.scene.events.emit('mining:progress', {
        asteroidId: this.data.id,
        progress: this.miningProgress
      });
    }
  }
}
```

### 3. Simulação de Combate (PvE)

```js
// src/game/offline/entities/npc.js
export class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, data) {
    super(scene, x, y, `npc_${data.type}`);
    this.data = data;
    this.health = data.health;
    this.state = 'idle'; // idle, chasing, attacking, dead
    this.shootTimer = 0;
  }
  
  update(delta, playerPosition) {
    if (this.data.health <= 0) {
      this.setActive(false);
      return;
    }
    
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      playerPosition.x, playerPosition.y
    );
    
    if (distance < 500) {
      // Detectou jogador
      this.state = 'chasing';
      this.chasePlayer(playerPosition);
      
      if (distance < 200) {
        // Em range de ataque
        this.state = 'attacking';
        this.attackPlayer();
      }
    } else {
      this.state = 'idle';
      this.setVelocity(0, 0);
    }
    
    this.shootTimer += delta;
  }
  
  chasePlayer(playerPosition) {
    const angle = Phaser.Math.Angle.Between(
      this.x, this.y,
      playerPosition.x, playerPosition.y
    );
    
    this.setVelocity(
      Math.cos(angle) * 100,
      Math.sin(angle) * 100
    );
  }
  
  attackPlayer() {
    if (this.shootTimer > 1000) {
      // Dispara a cada 1 segundo
      const angle = Phaser.Math.Angle.Between(
        this.x, this.y,
        this.scene.player.x,
        this.scene.player.y
      );
      
      this.fireProjectile(angle);
      this.shootTimer = 0;
    }
  }
  
  fireProjectile(angle) {
    const projectile = new Projectile(
      this.scene,
      this.x, this.y,
      angle,
      this.data.damage,
      'npc'
    );
    this.scene.projectiles.add(projectile);
  }
  
  takeDamage(damage) {
    this.health -= damage;
    this.scene.events.emit('npc:damaged', {
      npcId: this.data.id,
      health: this.health
    });
    
    if (this.health <= 0) {
      this.die();
    }
  }
  
  die() {
    this.data.health = 0;
    
    // Criar explosão
    this.scene.add.explosion(this.x, this.y);
    
    // Dropar loot
    const loot = Math.floor(this.data.loot * 0.5);
    this.scene.player.addResources(loot);
    
    // Remover
    this.destroy();
    
    this.scene.events.emit('npc:died', {
      npcId: this.data.id,
      loot
    });
  }
}
```

### 4. Gerenciamento de Jogador

```js
// src/game/offline/entities/player-ship.js
export class PlayerShip extends Phaser.Physics.Arcade.Sprite {
  constructor(scene) {
    super(scene, 0, 0, 'player_ship');
    
    this.health = 100;
    this.maxHealth = 100;
    this.resources = 0;
    this.maxResources = 1000;
    this.experience = 0;
    this.level = 1;
    
    this.speed = 300;
    this.currentChunk = { x: 0, y: 0 };
    
    this.setupControls();
  }
  
  setupControls() {
    this.keys = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      pause: Phaser.Input.Keyboard.KeyCodes.P
    });
  }
  
  update() {
    let velocityX = 0;
    let velocityY = 0;
    
    if (this.keys.up.isDown) velocityY = -this.speed;
    if (this.keys.down.isDown) velocityY = this.speed;
    if (this.keys.left.isDown) velocityX = -this.speed;
    if (this.keys.right.isDown) velocityX = this.speed;
    
    this.setVelocity(velocityX, velocityY);
    
    // Detectar mudança de chunk
    const newChunkX = Math.floor(this.x / 5000);
    const newChunkY = Math.floor(this.y / 5000);
    
    if (newChunkX !== this.currentChunk.x || newChunkY !== this.currentChunk.y) {
      this.changeChunk(newChunkX, newChunkY);
    }
  }
  
  changeChunk(newChunkX, newChunkY) {
    this.currentChunk = { x: newChunkX, y: newChunkY };
    this.scene.events.emit('chunk:changed', this.currentChunk);
    
    // Limpar objetos do chunk anterior
    this.scene.asteroids.children.entries.forEach(ast => {
      if (Math.abs(ast.x - this.x) > 6000) {
        ast.destroy();
      }
    });
    
    // Gerar novo chunk
    this.scene.loadChunk(newChunkX, newChunkY);
  }
  
  addResources(amount) {
    this.resources = Math.min(
      this.maxResources,
      this.resources + amount
    );
    this.scene.events.emit('resources:changed', this.resources);
  }
  
  takeDamage(damage) {
    this.health = Math.max(0, this.health - damage);
    this.scene.events.emit('player:damaged', this.health);
    
    if (this.health === 0) {
      this.die();
    }
  }
  
  die() {
    // Respawnar na origem
    this.health = this.maxHealth;
    this.resources = 0;
    this.setPosition(0, 0);
    
    this.scene.events.emit('player:died');
  }
}
```

---

## 🎨 Scene Principal

```js
// src/game/offline/scenes/offline-space.js
export class OfflineSpaceScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OfflineSpace' });
  }
  
  create() {
    // 1. Criar player
    this.player = new PlayerShip(this);
    this.physics.world.enable(this.player);
    this.add.existing(this.player);
    
    // 2. Criar câmera seguindo player
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(-50000, -50000, 100000, 100000);
    
    // 3. Criar groups
    this.asteroids = this.physics.add.group();
    this.npcs = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    
    // 4. Gerar chunk inicial
    this.chunkGenerator = new OfflineChunkGenerator();
    this.cache = new OfflineCache();
    
    this.loadChunk(0, 0);
    
    // 5. Setup colisões
    this.physics.add.overlap(
      this.player, this.asteroids,
      this.onPlayerAsteroidCollision, null, this
    );
    
    this.physics.add.overlap(
      this.projectiles, this.player,
      this.onProjectilePlayerCollision, null, this
    );
    
    // 6. Setup UI
    this.createUI();
    
    // 7. Listen to events
    this.events.on('chunk:changed', () => this.onChunkChanged());
  }
  
  update(time, delta) {
    this.player.update();
    
    this.npcs.children.entries.forEach(npc => {
      npc.update(delta, this.player);
    });
    
    this.asteroids.children.entries.forEach(ast => {
      ast.update();
    });
  }
  
  loadChunk(chunkX, chunkY) {
    // Verificar se já está em cache
    if (!this.cache.has(`${chunkX},${chunkY}`)) {
      // Gerar novo chunk
      const chunk = this.chunkGenerator.generateChunk(
        chunkX, chunkY,
        `offline_${chunkX}_${chunkY}`
      );
      this.cache.set(`${chunkX},${chunkY}`, chunk);
    }
    
    const chunk = this.cache.get(`${chunkX},${chunkY}`);
    
    // Criar asteroides
    chunk.objects.forEach(obj => {
      if (!this.asteroids.children.entries.find(a => a.data.id === obj.id)) {
        const ast = new Asteroid(this, obj.x, obj.y, obj);
        this.asteroids.add(ast);
      }
    });
    
    // Criar NPCs
    chunk.npcs.forEach(npc => {
      if (!this.npcs.children.entries.find(n => n.data.id === npc.id)) {
        const npcEntity = new NPC(this, npc.x, npc.y, npc);
        this.npcs.add(npcEntity);
      }
    });
  }
  
  createUI() {
    // Health bar
    this.healthText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ff0000'
    }).setScrollFactor(0);
    
    // Resources display
    this.resourcesText = this.add.text(10, 30, '', {
      fontSize: '16px',
      color: '#00ff00'
    }).setScrollFactor(0);
    
    // Position display
    this.positionText = this.add.text(10, 50, '', {
      fontSize: '12px',
      color: '#ffff00'
    }).setScrollFactor(0);
    
    // Listen to events
    this.events.on('resources:changed', (amount) => {
      this.resourcesText.setText(`Resources: ${Math.floor(amount)}`);
    });
    
    this.events.on('player:damaged', (health) => {
      this.healthText.setText(`Health: ${health} / 100`);
    });
  }
  
  onPlayerAsteroidCollision(player, asteroid) {
    // Interação com asteroide (mineração)
    if (this.input.keyboard.keys[Phaser.Input.Keyboard.KeyCodes.E].isDown) {
      asteroid.startMining(3000);
    }
  }
  
  onProjectilePlayerCollision(projectile, player) {
    player.takeDamage(projectile.data.damage);
    projectile.destroy();
  }
  
  onChunkChanged() {
    // Limpar cache antigo (manter apenas 3x3 chunks)
    const px = this.player.currentChunk.x;
    const py = this.player.currentChunk.y;
    
    for (let x = px - 2; x <= px + 2; x++) {
      for (let y = py - 2; y <= py + 2; y++) {
        const key = `${x},${y}`;
        if (!this.cache.has(key)) {
          this.cache.delete(key);
        }
      }
    }
  }
}
```

---

## 📊 Flow de Utilização

```
1. Usuário clica "Play Offline"
   ↓
2. Scene OfflineSpace inicia
   ↓
3. Player spawn em (0,0)
   ↓
4. Chunk (0,0) é gerado proceduralmente
   ↓
5. Player move pelo chunk
   ├─ Asteroides podem ser minerados
   ├─ NPCs atacam se próximos
   └─ Projéteis causam dano
   ↓
6. Se player atinge limite do chunk
   ├─ Novo chunk é gerado
   ├─ Cache anterior é liberado
   └─ Asteroides/NPCs são criados
   ↓
7. Se player morre
   ├─ Respawna em (0,0)
   ├─ Perde todos os recursos
   └─ Continua jogando
   ↓
8. Se player clica "Exit"
   ├─ Todas as alterações são perdidas
   ├─ Retorna ao menu principal
   └─ Fim da sessão
```

---

## 💾 Dados Salvos (Local Storage)

```js
// Apenas dados cosmésticos/preferências do usuário:
{
  "offlineSettings": {
    "volume": 0.8,
    "difficulty": "normal",
    "quality": "high"
  },
  "lastOfflinePlaytime": "2025-10-19T15:30:00Z",
  "bestOfflineScore": {
    "resources": 5000,
    "kills": 25,
    "timePlayed": "01:30:45"
  }
}

// ❌ NÃO salvamos:
// - Posição do jogador
// - Recursos coletados
// - Inimigos derrotados
// - Chunks visitados
```

---

## 🎮 Controles

```
W / Arrow Up     → Mover para cima
S / Arrow Down   → Mover para baixo
A / Arrow Left   → Mover para esquerda
D / Arrow Right  → Mover para direita

E               → Minerar asteroide (próximo)
Space           → Disparo/Ataque
P / ESC         → Pausar
M               → Menu
Q               → Quit (Sair para menu)
```

---

## 📈 Limitações Conhecidas

### Performance

```
• Máximo 200 asteroides por chunk
• Máximo 50 NPCs por chunk
• Máximo 100 projéteis simultâneos
• Culling ativo (objetos fora da tela desabilitados)
```

### Gameplay

```
• Sem persistência entre sessões
• Sem leveling/progression permanente
• Sem trading/economia
• Sem PvP (apenas PvE)
• Sem social features
```

### Compatibilidade

```
• Requer WebGL
• Testar em Chrome/Firefox/Safari
• Performance pode variar em dispositivos móveis
```

---

## 🔧 Desenvolvimento Local

```bash
# Iniciar com modo offline
npm run dev

# Testar offline mode
# 1. Abrir DevTools (F12)
# 2. Ir para Network
# 3. Ativar "Offline" mode
# 4. Jogo deve continuar funcionando
```

---

## 📘 Documentação Relacionada

- [04 - Sync Flows](./04-sync-flows.md) — Comparar com online flows
- [09 - Setup & Deployment](./09-setup-deployment.md) — Client setup
- [ARCHITECTURE-V2.md](../ARCHITECTURE-V2.md) — Arquitetura geral

---

**Versão**: v1.0  
**Atualizado**: Outubro 2025  
**Status**: 🟢 Demo Pronto para Uso
