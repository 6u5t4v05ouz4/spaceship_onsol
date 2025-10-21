/**
 * Multiplayer Manager
 * Gerencia a integração do jogo Phaser com o servidor WebSocket
 */

import socketService from '../services/socketService.js';

export default class MultiplayerManager {
  constructor(scene) {
    this.scene = scene;
    this.otherPlayers = new Map(); // Map<playerId, playerData>
    this.currentChunk = { x: 0, y: 0 };
    this.lastPositionUpdate = 0;
    this.positionUpdateInterval = 100; // ms
    this.playerId = null;
    this.isConnected = false;
    this.isAuthenticated = false;
  }

  /**
   * Inicializa o multiplayer
   */
  async init() {
    console.log('🌐 Inicializando Multiplayer Manager...');
    console.log('🔍 socketService disponível:', typeof socketService !== 'undefined');
    console.log('🔍 socketService.isConnected():', socketService.isConnected());

    // Conectar ao servidor se não estiver conectado
    if (!socketService.isConnected()) {
      console.log('🔌 Tentando conectar ao servidor...');
      console.log('🔍 SocketService estado antes da conexão:', {
        connected: socketService.isConnected(),
        socket: socketService.socket,
        serverUrl: window.VITE_SERVER_URL
      });
      
      socketService.connect();
      
      // Aguardar conexão
      await new Promise((resolve) => {
        if (socketService.isConnected()) {
          console.log('✅ Já conectado');
          resolve();
        } else {
          console.log('⏳ Aguardando conexão...');
          const checkConnection = () => {
            console.log('🔍 Evento socket:connected recebido!');
            if (socketService.isConnected()) {
              console.log('✅ Conexão confirmada!');
              window.removeEventListener('socket:connected', checkConnection);
              resolve();
            }
          };
          window.addEventListener('socket:connected', checkConnection);
          
          // Timeout de 5 segundos
          setTimeout(() => {
            console.error('❌ Timeout na conexão após 5 segundos');
            console.log('🔍 Estado do socket:', socketService.socket);
            window.removeEventListener('socket:connected', checkConnection);
            resolve();
          }, 5000);
        }
      });
      
      console.log('🔍 Estado após tentativa de conexão:', {
        connected: socketService.isConnected(),
        socketId: socketService.getSocketId()
      });
    }

    // Autenticar explicitamente (Supabase já está disponível aqui)
    console.log('🔐 Tentando autenticar...');
    console.log('🔍 Supabase disponível:', typeof window.supabaseClient !== 'undefined');
    console.log('🔍 window.userSession:', window.userSession);
    console.log('🔍 Socket conectado antes da auth:', socketService.isConnected());
    
    try {
      const authResult = await socketService.authenticate();
      console.log('✅ Autenticação enviada com sucesso:', authResult);
    } catch (error) {
      console.error('❌ Erro na autenticação:', error);
    }

    // Aguardar confirmação de autenticação
    await this.waitForAuthentication();

    // Setup event listeners
    this.setupEventListeners();

    // Iniciar gameplay explicitamente (após autenticar)
    socketService.playStart();

    // Entrar no chunk inicial somente após playStart
    this.enterChunk(0, 0);

    console.log('✅ Multiplayer Manager inicializado');
  }

  /**
   * Aguarda autenticação
   */
  async waitForAuthentication() {
    console.log('⏳ Aguardando autenticação...');
    console.log('🔍 Socket conectado:', socketService.isConnected());
    console.log('🔍 Socket autenticado:', socketService.isAuthenticated());
    
    return new Promise((resolve) => {
      if (socketService.isAuthenticated()) {
        this.isAuthenticated = true;
        this.playerId = socketService.getPlayerId();
        console.log('✅ Já autenticado:', this.playerId);
        resolve();
        return;
      }
      
      console.log('🔍 Aguardando evento socket:authenticated...');

      const checkAuth = () => {
        console.log('🔍 Evento socket:authenticated recebido!');
        if (socketService.isAuthenticated()) {
          this.isAuthenticated = true;
          this.playerId = socketService.getPlayerId();
          console.log('✅ Autenticação confirmada! Player ID:', this.playerId);
          window.removeEventListener('socket:authenticated', checkAuth);
          resolve();
        }
      };

      window.addEventListener('socket:authenticated', checkAuth);

      // Timeout de 10 segundos
      setTimeout(() => {
        console.error('❌ Timeout na autenticação após 10 segundos');
        console.log('🔍 Estado final:', {
          connected: socketService.isConnected(),
          authenticated: socketService.isAuthenticated(),
          playerId: socketService.getPlayerId()
        });
        if (!this.isAuthenticated) {
          console.warn('⚠️ Timeout de autenticação, continuando sem multiplayer');
          window.removeEventListener('socket:authenticated', checkAuth);
          resolve();
        }
      }, 10000);
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Chunk data
    window.addEventListener('socket:chunk:data', (e) => {
      this.handleChunkData(e.detail);
    });

    // Player joined
    window.addEventListener('socket:player:joined', (e) => {
      this.handlePlayerJoined(e.detail);
    });

    // Player left
    window.addEventListener('socket:player:left', (e) => {
      this.handlePlayerLeft(e.detail);
    });

    // Player moved
    window.addEventListener('socket:player:moved', (e) => {
      this.handlePlayerMoved(e.detail);
    });

    // Battle events
    window.addEventListener('socket:battle:hit', (e) => {
      this.handleBattleHit(e.detail);
    });

    window.addEventListener('socket:battle:attack', (e) => {
      this.handleBattleAttack(e.detail);
    });

    window.addEventListener('socket:player:died', (e) => {
      this.handlePlayerDied(e.detail);
    });

    window.addEventListener('socket:player:death', (e) => {
      this.handlePlayerDeath(e.detail);
    });

    window.addEventListener('socket:player:respawned', (e) => {
      this.handlePlayerRespawned(e.detail);
    });
  }

  /**
   * Entra em um chunk
   */
  enterChunk(chunkX, chunkY) {
    if (!this.isAuthenticated) return;

    console.log(`📍 Entrando no chunk (${chunkX}, ${chunkY})`);
    this.currentChunk = { x: chunkX, y: chunkY };
    socketService.enterChunk(chunkX, chunkY);
  }

  /**
   * Atualiza posição do player local
   */
  updatePosition(x, y) {
    if (!this.isAuthenticated) return;

    const now = Date.now();
    if (now - this.lastPositionUpdate < this.positionUpdateInterval) {
      return;
    }

    this.lastPositionUpdate = now;

    // Calcular chunk baseado na posição
    const chunkX = Math.floor(x / 1000);
    const chunkY = Math.floor(y / 1000);

    // Verificar mudança de chunk
    if (chunkX !== this.currentChunk.x || chunkY !== this.currentChunk.y) {
      this.enterChunk(chunkX, chunkY);
    }

    // Enviar posição
    socketService.updatePosition(Math.floor(x), Math.floor(y), chunkX, chunkY);
  }

  /**
   * Handle chunk data
   */
  handleChunkData(data) {
    console.log('📦 Chunk data recebido:', data);
    console.log('📊 Players no chunk:', data.players?.length || 0);
    console.log('🆔 Meu player ID:', this.playerId);

    // Limpar players antigos
    this.clearOtherPlayers();

    // Adicionar players do chunk
    if (data.players && data.players.length > 0) {
      console.log('👥 Processando players do chunk...');
      data.players.forEach(player => {
        console.log(`  - Player: ${player.username} (ID: ${player.id})`);
        console.log(`    📍 Posição: (${player.x}, ${player.y})`);
        console.log(`    🗺️ Chunk: ${player.current_chunk}`);
        
        // Não adicionar o próprio player
        if (player.id !== this.playerId) {
          console.log(`    ✅ Adicionando player ${player.username}`);
          this.addOtherPlayer(player);
        } else {
          console.log(`    ⏭️ Pulando (é você mesmo)`);
        }
      });
    } else {
      console.log('⚠️ Nenhum player no chunk ou data.players vazio');
    }

    console.log('📊 Total de outros players após processamento:', this.otherPlayers.size);

    // TODO: Adicionar asteroides do chunk
    // if (data.asteroids && data.asteroids.length > 0) {
    //   this.scene.spawnAsteroids(data.asteroids);
    // }
  }

  /**
   * Handle player joined
   */
  handlePlayerJoined(data) {
    console.log('👤 Player entrou:', data.username);

    // Não adicionar o próprio player
    if (data.id === this.playerId) return;

    this.addOtherPlayer(data);
  }

  /**
   * Handle player left
   */
  handlePlayerLeft(data) {
    console.log('👋 Player saiu:', data.id);
    this.removeOtherPlayer(data.id);
  }

  /**
   * Handle player moved
   */
  handlePlayerMoved(data) {
    const player = this.otherPlayers.get(data.id);
    if (player && player.sprite) {
      // Animar movimento suave
      this.scene.tweens.add({
        targets: [player.sprite, player.nameText],
        x: data.x,
        y: data.y,
        duration: this.positionUpdateInterval,
        ease: 'Linear'
      });
    }
  }

  /**
   * Adiciona outro player
   */
  addOtherPlayer(data) {
    // Verificar se já existe
    if (this.otherPlayers.has(data.id)) {
      console.log('⚠️ Player já existe:', data.username);
      return;
    }

    console.log('➕ Adicionando player:', data.username, `(${data.x}, ${data.y})`);
    console.log('📊 Data completa:', data);

    // Verificar se o sprite 'enemy' existe
    if (!this.scene.textures.exists('enemy')) {
      console.error('❌ Sprite "enemy" não encontrado! Usando fallback...');
      // Tentar usar o sprite da nave do player
      const fallbackSprite = this.scene.textures.exists('nave') ? 'nave' : null;
      if (!fallbackSprite) {
        console.error('❌ Nenhum sprite disponível para outros players!');
        return;
      }
    }

    // Criar sprite do player (usar 'nave' como fallback)
    const spriteKey = this.scene.textures.exists('enemy') ? 'enemy' : 'nave';
    console.log('🎨 Usando sprite:', spriteKey);
    console.log('📍 Posição do sprite:', data.x, data.y);
    
    const sprite = this.scene.physics.add.sprite(data.x, data.y, spriteKey);
    sprite.setScale(0.6);
    
    // Debug: verificar se o sprite foi criado corretamente
    console.log('✅ Sprite criado:', sprite);
    console.log('📍 Sprite posição final:', sprite.x, sprite.y);
    console.log('👁️ Sprite visível:', sprite.visible);
    console.log('🎯 Sprite ativo:', sprite.active);

    // Criar texto do nome
    const nameText = this.scene.add.text(data.x, data.y - 40, data.username, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#00ff88',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    });
    nameText.setOrigin(0.5);
    nameText.setDepth(11);

    // Criar barra de vida
    const healthBarBg = this.scene.add.rectangle(data.x, data.y - 50, 50, 5, 0x000000);
    healthBarBg.setOrigin(0.5);
    healthBarBg.setDepth(11);

    const healthBar = this.scene.add.rectangle(data.x, data.y - 50, 50, 5, 0x00ff00);
    healthBar.setOrigin(0.5, 0.5);
    healthBar.setDepth(12);

    // Armazenar referências
    this.otherPlayers.set(data.id, {
      id: data.id,
      username: data.username,
      sprite,
      nameText,
      healthBarBg,
      healthBar,
      health: data.health || 100,
      maxHealth: data.max_health || 100,
      data
    });
  }

  /**
   * Remove outro player
   */
  removeOtherPlayer(playerId) {
    const player = this.otherPlayers.get(playerId);
    if (player) {
      console.log('➖ Removendo player:', player.username);

      // Destruir sprites
      if (player.sprite) player.sprite.destroy();
      if (player.nameText) player.nameText.destroy();
      if (player.healthBarBg) player.healthBarBg.destroy();
      if (player.healthBar) player.healthBar.destroy();

      this.otherPlayers.delete(playerId);
    }
  }

  /**
   * Limpa todos os outros players
   */
  clearOtherPlayers() {
    this.otherPlayers.forEach((player, playerId) => {
      this.removeOtherPlayer(playerId);
    });
  }

  /**
   * Handle battle hit (você foi atingido)
   */
  handleBattleHit(data) {
    console.log('💥 Você foi atingido!', data);

    // Atualizar vida do player local
    if (this.scene.shipHealth !== undefined) {
      this.scene.shipHealth = data.health;
      
      // Atualizar UI de vida
      if (this.scene.updateHealthBar) {
        this.scene.updateHealthBar();
      }

      // Efeito visual de dano
      if (this.scene.juiceManager) {
        this.scene.juiceManager.screenShake(200, 0.01);
        this.scene.juiceManager.flashColor(this.scene.ship, 0xff0000, 200);
      }

      // Se morreu
      if (data.wasFatal) {
        console.log('💀 Você morreu!');
        // A morte será tratada por handlePlayerDeath
      }
    }
  }

  /**
   * Handle battle attack (combate no chunk)
   */
  handleBattleAttack(data) {
    console.log('⚔️ Combate:', data);

    // Mostrar efeito visual entre atacante e defensor
    const attacker = this.otherPlayers.get(data.attackerId);
    const defender = this.otherPlayers.get(data.defenderId);

    if (attacker && defender) {
      // Criar linha de ataque visual
      const graphics = this.scene.add.graphics();
      graphics.lineStyle(2, data.isCritical ? 0xff0000 : 0xffff00, 1);
      graphics.beginPath();
      graphics.moveTo(attacker.sprite.x, attacker.sprite.y);
      graphics.lineTo(defender.sprite.x, defender.sprite.y);
      graphics.strokePath();
      graphics.setDepth(5);

      // Remover após delay
      this.scene.time.delayedCall(200, () => {
        graphics.destroy();
      });

      // Atualizar barra de vida do defensor
      if (defender.healthBar) {
        defender.health = Math.max(0, defender.health - data.damage);
        const healthPercent = defender.health / defender.maxHealth;
        defender.healthBar.setScale(healthPercent, 1);
        
        // Mudar cor baseado na vida
        if (healthPercent > 0.5) {
          defender.healthBar.setFillStyle(0x00ff00);
        } else if (healthPercent > 0.25) {
          defender.healthBar.setFillStyle(0xffff00);
        } else {
          defender.healthBar.setFillStyle(0xff0000);
        }
      }
    }
  }

  /**
   * Handle player died (outro player morreu)
   */
  handlePlayerDied(data) {
    console.log('💀 Player morreu:', data.victimName);

    const victim = this.otherPlayers.get(data.victimId);
    if (victim && victim.sprite) {
      // Criar explosão
      if (this.scene.createExplosion) {
        this.scene.createExplosion(victim.sprite.x, victim.sprite.y);
      }

      // Remover player temporariamente
      this.removeOtherPlayer(data.victimId);
    }
  }

  /**
   * Handle player death (você morreu)
   */
  handlePlayerDeath(data) {
    console.log('💀 Você morreu!', data);

    // Mostrar tela de morte
    if (this.scene.showDeathScreen) {
      this.scene.showDeathScreen(data);
    }

    // Auto-respawn após delay
    this.scene.time.delayedCall(data.respawnDelay || 5000, () => {
      socketService.respawn();
    });
  }

  /**
   * Handle player respawned
   */
  handlePlayerRespawned(data) {
    console.log('🔄 Respawn:', data);

    // Resetar vida
    if (this.scene.shipHealth !== undefined) {
      this.scene.shipHealth = data.health;
      this.scene.shipMaxHealth = data.maxHealth;
      
      if (this.scene.updateHealthBar) {
        this.scene.updateHealthBar();
      }
    }

    // Teleportar para posição de respawn
    if (this.scene.ship) {
      this.scene.ship.setPosition(data.x, data.y);
    }

    // Efeito visual de respawn
    if (this.scene.juiceManager) {
      this.scene.juiceManager.flashColor(this.scene.ship, 0x00ffff, 500);
    }
  }

  /**
   * Ataca outro player
   */
  attackPlayer(targetId) {
    if (!this.isAuthenticated) {
      console.warn('⚠️ Não autenticado, não pode atacar');
      return;
    }

    console.log('⚔️ Atacando player:', targetId);
    socketService.attack(targetId);
  }

  /**
   * Update (chamado a cada frame)
   */
  update() {
    // Atualizar posição dos outros players (healthbar e nameText seguem sprite)
    this.otherPlayers.forEach((player) => {
      if (player.sprite && player.nameText) {
        player.nameText.setPosition(player.sprite.x, player.sprite.y - 40);
      }
      if (player.sprite && player.healthBarBg) {
        player.healthBarBg.setPosition(player.sprite.x, player.sprite.y - 50);
      }
      if (player.sprite && player.healthBar) {
        player.healthBar.setPosition(player.sprite.x, player.sprite.y - 50);
      }
    });
  }

  /**
   * Destroy (cleanup)
   */
  destroy() {
    console.log('🧹 Limpando Multiplayer Manager...');
    
    // Limpar todos os players
    this.clearOtherPlayers();

    // Remover event listeners
    // (não é possível remover listeners anônimos, então deixamos para o garbage collector)
  }
}

