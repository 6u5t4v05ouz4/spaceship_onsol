/**
 * Multiplayer Manager
 * Gerencia a integração do jogo Phaser com o servidor WebSocket
 */

import socketService from '../services/socketService.js';
import AssetManager from './AssetManager.js';
import SpriteSheetManager from './SpriteSheetManager.js';

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

    // Asset managers
    this.assetManager = new AssetManager(scene);
    this.spriteSheetManager = new SpriteSheetManager(scene);
    this.chunkElements = new Map(); // Map<chunkKey, elementSprites>

    // Sistemas de rede (novos)
    this.networkStats = {
      predictions: 0,
      corrections: 0,
      latency: 0,
      lastUpdate: 0
    };
    this.lastNetworkUpdate = 0;
    this.networkUpdateInterval = 1000; // Update stats a cada segundo

    // Controle de movimento local
    this.localPlayerData = {
      x: 0,
      y: 0,
      chunkX: 0,
      chunkY: 0,
      lastMoveTime: 0
    };
  }

  /**
   * Inicializa o multiplayer
   */
  async init() {
    console.log('🌐 Inicializando Multiplayer Manager...');

    // Inicializar asset managers (spriteSheetManager desativado - usa assets existentes)
    // await this.spriteSheetManager.init(); // Desativado - usa assets existentes
    // await this.assetManager.init(); // Desativado para evitar erros

    // Conectar ao servidor se não estiver conectado
    if (!socketService.isConnected()) {
      socketService.connect();

      // Aguardar conexão
      await new Promise((resolve) => {
        if (socketService.isConnected()) {
          resolve();
        } else {
          const checkConnection = () => {
            if (socketService.isConnected()) {
              window.removeEventListener('socket:connected', checkConnection);
              resolve();
            }
          };
          window.addEventListener('socket:connected', checkConnection);

          // Timeout de 5 segundos
          setTimeout(() => {
            window.removeEventListener('socket:connected', checkConnection);
            resolve();
          }, 5000);
        }
      });
    }

    // Autenticar explicitamente (Supabase já está disponível aqui)
    console.log('🔐 Tentando autenticar...');
    await socketService.authenticate();

    // Aguardar confirmação de autenticação
    await this.waitForAuthentication();

    // Setup event listeners
    this.setupEventListeners();

    // Entrar no chunk inicial
    this.enterChunk(0, 0);

    console.log('✅ Multiplayer Manager inicializado');
  }

  /**
   * Aguarda autenticação
   */
  async waitForAuthentication() {
    return new Promise((resolve) => {
      if (socketService.isAuthenticated()) {
        this.isAuthenticated = true;
        this.playerId = socketService.getPlayerId();
        console.log('✅ Já autenticado:', this.playerId);
        resolve();
        return;
      }

      const checkAuth = () => {
        if (socketService.isAuthenticated()) {
          this.isAuthenticated = true;
          this.playerId = socketService.getPlayerId();
          console.log('✅ Autenticado:', this.playerId);

          // Inicializar sistemas de rede com estado do jogador
          this.initializeNetworkSystems();

          window.removeEventListener('socket:authenticated', checkAuth);
          resolve();
        }
      };

      window.addEventListener('socket:authenticated', checkAuth);

      // Timeout de 10 segundos
      setTimeout(() => {
        if (!this.isAuthenticated) {
          console.warn('⚠️ Timeout de autenticação, continuando sem multiplayer');
          window.removeEventListener('socket:authenticated', checkAuth);
          resolve();
        }
      }, 10000);
    });
  }

  /**
   * Inicializa os sistemas de rede com estado inicial do jogador
   */
  initializeNetworkSystems() {
    console.log('🌐 Inicializando sistemas de rede avançados...');

    const playerState = socketService.getPlayerState();
    if (playerState) {
      const initialState = {
        x: playerState.x || 0,
        y: playerState.y || 0,
        chunkX: Math.floor((playerState.x || 0) / 1000),
        chunkY: Math.floor((playerState.y || 0) / 1000)
      };

      // Inicializar prediction manager
      socketService.initializeNetworkSystems(initialState);

      // Atualizar dados locais
      this.localPlayerData = {
        ...this.localPlayerData,
        ...initialState
      };

      console.log('✅ Sistemas de rede inicializados com estado:', initialState);
    }

    // Configurar eventos de rede avançados
    this.setupNetworkEvents();
  }

  /**
   * Configura eventos específicos dos novos sistemas de rede
   */
  setupNetworkEvents() {
    console.log('📡 Configurando eventos de rede avançados...');

    // Evento de confirmação de movimento (predição)
    window.addEventListener('socket:move:confirmed', (e) => {
      const { x, y, sequence } = e.detail;
      this.networkStats.predictions++;
      console.debug(`📡 Movimento confirmado: seq=${sequence}, pos=(${x}, ${y})`);
    });

    // Evento de correção de posição do servidor
    window.addEventListener('socket:position:corrected', (e) => {
      const { x, y, reason } = e.detail;
      this.networkStats.corrections++;
      console.warn(`⚠️ Posição corrigida pelo servidor: ${reason} -> (${x}, ${y})`);

      // Forçar teleport da nave local para posição corrigida
      if (this.scene.shipManager?.ship) {
        this.scene.shipManager.ship.setPosition(x, y);
      }

      // Atualizar dados locais
      this.localPlayerData.x = x;
      this.localPlayerData.y = y;
      this.localPlayerData.chunkX = Math.floor(x / 1000);
      this.localPlayerData.chunkY = Math.floor(y / 1000);
    });

    // Evento de erro de rate limit
    window.addEventListener('socket:error', (e) => {
      const { code, message } = e.detail;
      if (code === 'RATE_LIMIT_EXCEEDED' || code === 'CHUNK_RATE_LIMIT_EXCEEDED') {
        console.warn(`⚠️ Rate limit atingido: ${message}`);
        // Mostrar feedback visual para o jogador
        this.showNetworkWarning(message);
      }
    });

    console.log('✅ Eventos de rede avançados configurados');
  }

  /**
   * Mostra aviso de rede para o jogador
   */
  showNetworkWarning(message) {
    // Criar aviso visual temporário
    if (this.scene && this.scene.add) {
      const warningText = this.scene.add.text(
        this.scene.cameras.main.width / 2,
        100,
        `⚠️ ${message}`,
        {
          fontSize: '16px',
          fontFamily: 'Arial',
          fill: '#ffaa00',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: { x: 10, y: 5 }
        }
      ).setOrigin(0.5).setDepth(1000);

      // Remover após 3 segundos
      this.scene.time.delayedCall(3000, () => {
        if (warningText) warningText.destroy();
      });
    }
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
   * Atualiza posição do player local com predição client-side
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

    // Atualizar dados locais
    this.localPlayerData.x = x;
    this.localPlayerData.y = y;
    this.localPlayerData.chunkX = chunkX;
    this.localPlayerData.chunkY = chunkY;
    this.localPlayerData.lastMoveTime = now;

    // Verificar mudança de chunk
    if (chunkX !== this.currentChunk.x || chunkY !== this.currentChunk.y) {
      this.enterChunk(chunkX, chunkY);
    }

    // Enviar posição com predição client-side
    socketService.updatePosition(Math.floor(x), Math.floor(y), chunkX, chunkY);
  }

  /**
   * Obtém posição atual do jogador (com predição)
   */
  getPlayerPosition() {
    if (!this.isAuthenticated) {
      return this.localPlayerData;
    }

    // Usar posição predita do socket service
    const predictedPos = socketService.getPredictedPosition();
    if (predictedPos) {
      return {
        x: predictedPos.x,
        y: predictedPos.y,
        chunkX: predictedPos.chunkX || Math.floor(predictedPos.x / 1000),
        chunkY: predictedPos.chunkY || Math.floor(predictedPos.y / 1000),
        lastMoveTime: this.localPlayerData.lastMoveTime
      };
    }

    return this.localPlayerData;
  }

  /**
   * Handle chunk data
   */
  handleChunkData(data) {
    console.log('📦 Chunk data recebido:', data);
    console.log('📊 Players no chunk:', data.players?.length || 0);
    console.log('📊 Asteroides no chunk:', data.asteroids?.length || 0);
    console.log('📊 Cristais no chunk:', data.crystals?.length || 0);
    console.log('📊 Recursos no chunk:', data.resources?.length || 0);
    console.log('📊 Planetas no chunk:', data.planets?.length || 0);
    console.log('📊 NPCs no chunk:', data.npcs?.length || 0);
    console.log('📊 Estações no chunk:', data.stations?.length || 0);
    console.log('🆔 Meu player ID:', this.playerId);

    // Limpar players antigos
    this.clearOtherPlayers();

    // Limpar elementos antigos do chunk
    this.clearChunkElements(data.chunk.chunkX, data.chunk.chunkY);

    // Preparar assets para o chunk
    this.assetManager.preloadChunkAssets(data.chunk.chunkX, data.chunk.chunkY);

    // Processar asteroides
    if (data.asteroids && data.asteroids.length > 0) {
      console.log('🌑 Processando asteroides do chunk...');
      this.spawnChunkElements(data.asteroids, data.chunk.chunkX, data.chunk.chunkY, 'asteroid');
    }

    // Processar cristais
    if (data.crystals && data.crystals.length > 0) {
      console.log('💎 Processando cristais do chunk...');
      this.spawnChunkElements(data.crystals, data.chunk.chunkX, data.chunk.chunkY, 'crystal');
    }

    // Processar recursos minerais
    if (data.resources && data.resources.length > 0) {
      console.log('⛏️ Processando recursos minerais do chunk...');
      this.spawnChunkElements(data.resources, data.chunk.chunkX, data.chunk.chunkY, 'resource');
    }

    // Processar planetas
    if (data.planets && data.planets.length > 0) {
      console.log('🪐 Processando planetas do chunk...');
      this.spawnChunkElements(data.planets, data.chunk.chunkX, data.chunk.chunkY, 'planet');
    }

    // Processar NPCs
    if (data.npcs && data.npcs.length > 0) {
      console.log('🚀 Processando NPCs do chunk...');
      data.npcs.forEach(npc => {
        this.spawnNPC(npc, data.chunk.chunkX, data.chunk.chunkY);
      });
    }

    // Processar estações espaciais
    if (data.stations && data.stations.length > 0) {
      console.log('🏭 Processando estações espaciais do chunk...');
      data.stations.forEach(station => {
        this.spawnSpaceStation(station, data.chunk.chunkX, data.chunk.chunkY);
      });
    }

    // Adicionar players do chunk
    if (data.players && data.players.length > 0) {
      console.log('👥 Processando players do chunk...');
      data.players.forEach(player => {
        console.log(`  - Player: ${player.username} (ID: ${player.id}) - Meu ID: ${this.playerId}`);
        console.log(`  - Tipo do player.id: ${typeof player.id}, Tipo do this.playerId: ${typeof this.playerId}`);
        console.log(`  - Comparação ===: ${player.id === this.playerId}`);
        console.log(`  - Comparação ==: ${player.id == this.playerId}`);

        // NÃO adicionar o próprio player de forma alguma
        if (player.id === this.playerId) {
          console.log(`    ❌ BLOQUEADO: Tentando adicionar o próprio player ${player.username} - ISSO NÃO DEVE ACONTECER!`);
          return; // Bloqueia completamente
        }

        console.log(`    ✅ Adicionando player ${player.username} (ID diferente)`);
        this.addOtherPlayer(player);
      });
    } else {
      console.log('⚠️ Nenhum player no chunk ou data.players vazio');
    }

    console.log('📊 Total de outros players após processamento:', this.otherPlayers.size);
    console.log('📊 Total de elementos visíveis:', this.chunkElements.size);
  }

  /**
   * Handle player joined
   */
  handlePlayerJoined(data) {
    console.log('👤 Player entrou:', data.username);

    // Não adicionar o próprio player
    if (data.id === this.playerId) return;

    this.addOtherPlayer(data);

    // Adicionar ao interpolation manager para movimento suave
    socketService.updateEntityPosition(data.id, {
      x: data.x,
      y: data.y
    }, null, data.health);
  }

  /**
   * Handle player left
   */
  handlePlayerLeft(data) {
    console.log('👋 Player saiu:', data.playerId);
    this.removeOtherPlayer(data.playerId);

    // Remover do interpolation manager
    socketService.removeEntity(data.playerId);
  }

  /**
   * Handle player moved (com interpolação suave)
   */
  handlePlayerMoved(data) {
    // Atualizar posição no interpolation manager
    socketService.updateEntityPosition(data.playerId, {
      x: data.x,
      y: data.y
    }, null, data.health);

    // Manter lógica existente como fallback
    const player = this.otherPlayers.get(data.playerId);
    if (player && player.sprite) {
      // Não fazer tween aqui - a interpolação será tratada no update()
      // O sistema de interpolação cuidará do movimento suave
    }
  }

  /**
   * Spawn de elementos do chunk
   */
  spawnChunkElements(elements, chunkX, chunkY, elementType) {
    const chunkKey = `${chunkX},${chunkY}`;

    if (!this.chunkElements.has(chunkKey)) {
      this.chunkElements.set(chunkKey, []);
    }

    const chunkElementList = this.chunkElements.get(chunkKey);

    elements.forEach(elementData => {
      try {
        // Criar sprite do elemento usando AssetManager
        const sprite = this.assetManager.createElement({
          ...elementData,
          element_type: elementType,
          chunk_x: chunkX,
          chunk_y: chunkY
        }, chunkX, chunkY);

        // Adicionar à lista de elementos do chunk
        chunkElementList.push({
          id: elementData.id,
          sprite,
          type: elementType,
          chunkX,
          chunkY
        });

        console.log(`✅ Elemento spawnado: ${elementType} (${elementData.x}, ${elementData.y})`);

      } catch (error) {
        console.error(`❌ Erro ao spawnar elemento ${elementType}:`, error);
      }
    });
  }

  /**
   * Limpa elementos de um chunk específico
   */
  clearChunkElements(chunkX, chunkY) {
    const chunkKey = `${chunkX},${chunkY}`;
    const elements = this.chunkElements.get(chunkKey);

    if (elements) {
      elements.forEach(element => {
        if (element.sprite) {
          element.sprite.destroy();
        }
        // Limpar textos de NPCs
        if (element.text) {
          element.text.destroy();
        }
        // Limpar textos de estações
        if (element.texts) {
          element.texts.forEach(text => text.destroy());
        }
      });
      this.chunkElements.delete(chunkKey);
      console.log(`🧹 Limpos elementos do chunk (${chunkX}, ${chunkY})`);
    }
  }

  /**
   * Remove um elemento específico
   */
  removeElement(elementId, chunkX, chunkY) {
    const chunkKey = `${chunkX},${chunkY}`;
    const elements = this.chunkElements.get(chunkKey);

    if (elements) {
      const index = elements.findIndex(el => el.id === elementId);
      if (index !== -1) {
        const element = elements[index];
        const x = element.sprite?.x || 0;
        const y = element.sprite?.y || 0;

        if (element.sprite) {
          element.sprite.destroy();
        }
        // Limpar textos de NPCs
        if (element.text) {
          element.text.destroy();
        }
        // Limpar textos de estações
        if (element.texts) {
          element.texts.forEach(text => text.destroy());
        }
        elements.splice(index, 1);

        // Criar efeito de destruição
        this.createElementDestroyEffect(x, y, element.type);

        console.log(`💥 Elemento removido: ${element.type} (${elementId})`);
      }
    }
  }

  /**
   * Cria efeito de destruição de elemento
   */
  createElementDestroyEffect(x, y, elementType) {
    // Usar sprite sheet de explosões se disponível
    if (this.scene.textures.exists('effects_explosions')) {
      const explosion = this.scene.add.sprite(x, y, 'effects_explosions', 'explosion_small_1');
      explosion.setScale(0.5);
      explosion.setDepth(20);

      // Animar explosão
      this.scene.tweens.add({
        targets: explosion,
        scaleX: 1.2,
        scaleY: 1.2,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          explosion.destroy();
        }
      });
    } else {
      // Fallback: círculo de explosão simples
      const explosion = this.scene.add.graphics();
      explosion.fillStyle(0xFF8800, 0.8);
      explosion.fillCircle(x, y, 20);

      this.scene.tweens.add({
        targets: explosion,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => {
          explosion.destroy();
        }
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

    // BLOQUEAR nave "pilot" - isso parece ser um erro de spawn
    if (data.username === 'pilot' || data.username === 'Pilot') {
      console.log('❌ BLOQUEADO: Tentando criar nave "pilot" - isso é um erro!');
      return;
    }

    console.log('➕ Adicionando player:', data.username, `(${data.x}, ${data.y})`);
    console.log('📊 Data completa:', data);

    // Usar sempre o sprite 'ship' (01.png) para todos os jogadores
    const spriteKey = 'ship';
    console.log('🎨 Usando sprite ship (01.png) para jogador:', data.username);
    
    const sprite = this.scene.physics.add.sprite(data.x, data.y, spriteKey);
    sprite.setScale(0.6);
    
    // Usar animação da nave (ship_thrust)
    try {
      if (this.scene.anims.exists('ship_thrust')) {
        sprite.play('ship_thrust');
      } else {
        console.warn('⚠️ Animação ship_thrust não disponível');
      }
    } catch (e) {
      console.warn('⚠️ Erro ao tocar animação:', e.message);
    }
    
    sprite.setDepth(10);
    console.log('✅ Sprite criado:', sprite);

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
   * Spawn de NPC
   */
  spawnNPC(npcData, chunkX, chunkY) {
    const chunkKey = `${chunkX},${chunkY}`;

    if (!this.chunkElements.has(chunkKey)) {
      this.chunkElements.set(chunkKey, []);
    }

    const chunkElementList = this.chunkElements.get(chunkKey);

    try {
      // Criar sprite do NPC usando AssetManager
      const sprite = this.assetManager.createElement({
        ...npcData,
        element_type: npcData.ship_type ? `npc_${npcData.ship_type}` : 'npc_trader',
        chunk_x: chunkX,
        chunk_y: chunkY
      }, chunkX, chunkY);

      // Adicionar informações flutuantes do NPC
      const npcText = this.scene.add.text(sprite.x, sprite.y - 30, npcData.behavior || 'neutral', {
        fontSize: '12px',
        fill: npcData.behavior === 'hostile' ? '#ff0000' :
               npcData.behavior === 'friendly' ? '#00ff00' : '#ffff00',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: { x: 4, y: 2 }
      }).setOrigin(0.5).setDepth(1000);

      // Adicionar à lista de elementos do chunk
      chunkElementList.push({
        id: npcData.id,
        sprite,
        text: npcText,
        type: 'npc',
        chunkX,
        chunkY
      });

      console.log(`✅ NPC spawnado: ${npcData.ship_type} (${npcData.x}, ${npcData.y})`);

    } catch (error) {
      console.error(`❌ Erro ao spawnar NPC:`, error);
    }
  }

  /**
   * Spawn de estação espacial
   */
  spawnSpaceStation(stationData, chunkX, chunkY) {
    const chunkKey = `${chunkX},${chunkY}`;

    if (!this.chunkElements.has(chunkKey)) {
      this.chunkElements.set(chunkKey, []);
    }

    const chunkElementList = this.chunkElements.get(chunkKey);

    try {
      // Criar sprite da estação usando AssetManager
      const sprite = this.assetManager.createElement({
        ...stationData,
        element_type: stationData.station_type ? `station_${stationData.station_type}` : 'station_trading_post',
        chunk_x: chunkX,
        chunk_y: chunkY
      }, chunkX, chunkY);

      // Adicionar informações flutuantes da estação
      const stationText = this.scene.add.text(sprite.x, sprite.y - 50, stationData.station_type?.replace('_', ' ') || 'trading post', {
        fontSize: '14px',
        fill: '#00ffff',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: { x: 6, y: 3 }
      }).setOrigin(0.5).setDepth(1000);

      // Adicionar ícones de serviços
      const servicesText = this.scene.add.text(sprite.x, sprite.y - 35,
        (stationData.services || []).slice(0, 3).join(' • '), {
        fontSize: '10px',
        fill: '#ffffff',
        backgroundColor: 'rgba(0,0,100,0.6)',
        padding: { x: 4, y: 2 }
      }).setOrigin(0.5).setDepth(1000);

      // Adicionar à lista de elementos do chunk
      chunkElementList.push({
        id: stationData.id,
        sprite,
        texts: [stationText, servicesText],
        type: 'station',
        chunkX,
        chunkY
      });

      console.log(`✅ Estação spawnada: ${stationData.station_type} (${stationData.x}, ${stationData.y})`);

    } catch (error) {
      console.error(`❌ Erro ao spawnar estação:`, error);
    }
  }

  /**
   * Update (chamado a cada frame)
   */
  update() {
    // Atualizar sistemas de rede (predição e interpolação)
    socketService.update();

    // Atualizar posições interpoladas dos outros jogadores
    this.updateInterpolatedPlayers();

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

    // Atualizar textos de NPCs e estações
    this.chunkElements.forEach((elements) => {
      elements.forEach(element => {
        if (element.type === 'npc' && element.text && element.sprite) {
          element.text.setPosition(element.sprite.x, element.sprite.y - 30);
        } else if (element.type === 'station' && element.texts && element.sprite) {
          element.texts[0].setPosition(element.sprite.x, element.sprite.y - 50);
          element.texts[1].setPosition(element.sprite.x, element.sprite.y - 35);
        }
      });
    });

    // Atualizar estatísticas de rede (periodicamente)
    this.updateNetworkStats();
  }

  /**
   * Atualiza posições dos outros jogadores com interpolação suave
   */
  updateInterpolatedPlayers() {
    this.otherPlayers.forEach((playerData, playerId) => {
      const interpolatedPos = socketService.getInterpolatedPosition(playerId);

      if (interpolatedPos && playerData.sprite) {
        // Usar interpolação suave para movimento
        const currentX = playerData.sprite.x;
        const currentY = playerData.sprite.y;

        const smoothing = 0.2; // Fator de suavização
        const newX = currentX + (interpolatedPos.x - currentX) * smoothing;
        const newY = currentY + (interpolatedPos.y - currentY) * smoothing;

        // Atualizar sprite e elementos UI
        playerData.sprite.x = newX;
        playerData.sprite.y = newY;

        // Atualizar saúde se disponível na interpolação
        if (interpolatedPos.health !== undefined && playerData.healthBar) {
          const healthPercent = interpolatedPos.health / playerData.maxHealth;
          playerData.healthBar.setScale(Math.max(0, healthPercent), 1);

          // Mudar cor baseado na saúde
          if (healthPercent > 0.5) {
            playerData.healthBar.setFillStyle(0x00ff00);
          } else if (healthPercent > 0.25) {
            playerData.healthBar.setFillStyle(0xffff00);
          } else {
            playerData.healthBar.setFillStyle(0xff0000);
          }
        }
      }
    });
  }

  /**
   * Atualiza estatísticas de rede para debug
   */
  updateNetworkStats() {
    const now = Date.now();
    if (now - this.lastNetworkUpdate < this.networkUpdateInterval) {
      return;
    }

    this.lastNetworkUpdate = now;

    try {
      const networkStats = socketService.getNetworkStats();

      this.networkStats = {
        predictions: networkStats.prediction.predictions,
        corrections: networkStats.prediction.corrections,
        latency: networkStats.connection.latency,
        entities: networkStats.interpolation.entities,
        lastUpdate: now
      };

      // Debug info periódico
      if (now % 5000 < this.networkUpdateInterval) { // A cada ~5 segundos
        console.log('📊 Network Stats:', {
          predictions: this.networkStats.predictions,
          corrections: this.networkStats.corrections,
          latency: `${this.networkStats.latency}ms`,
          entities: this.networkStats.entities
        });
      }
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de rede:', error);
    }
  }

  /**
   * Obtém estatísticas do servidor multiplayer
   */
  getServerStats() {
    const stats = {
      isConnected: this.isConnected,
      isAuthenticated: this.isAuthenticated,
      playerId: this.playerId,
      currentChunk: this.currentChunk,
      otherPlayersCount: this.otherPlayers.size,
      totalChunks: this.chunkElements.size,
      connectionStatus: this.isConnected ? 'Connected' : 'Disconnected',
      socketServiceStatus: socketService.isConnected() ? 'Connected' : 'Disconnected',
      // Estatísticas avançadas de rede
      network: this.networkStats,
      localPlayerPosition: this.getPlayerPosition()
    };

    // Adicionar informações dos outros players
    if (this.otherPlayers.size > 0) {
      stats.otherPlayers = Array.from(this.otherPlayers.values()).map(player => ({
        id: player.id,
        username: player.username,
        health: player.health,
        maxHealth: player.maxHealth,
        position: {
          x: player.data.x,
          y: player.data.y
        }
      }));
    }

    // Adicionar informações dos chunks
    if (this.chunkElements.size > 0) {
      stats.chunkElements = {};
      this.chunkElements.forEach((elements, chunkKey) => {
        stats.chunkElements[chunkKey] = {
          count: elements.length,
          types: elements.map(e => e.type)
        };
      });
    }

    return stats;
  }

  /**
   * Destroy (cleanup)
   */
  destroy() {
    console.log('🧹 Limpando Multiplayer Manager...');

    // Limpar todos os players
    this.clearOtherPlayers();

    // Limpar todos os elementos dos chunks
    this.chunkElements.forEach((elements, chunkKey) => {
      elements.forEach(element => {
        if (element.sprite) {
          element.sprite.destroy();
        }
        // Limpar textos de NPCs
        if (element.text) {
          element.text.destroy();
        }
        // Limpar textos de estações
        if (element.texts) {
          element.texts.forEach(text => text.destroy());
        }
      });
    });
    this.chunkElements.clear();

    // Limpar sistemas de rede
    socketService.resetNetworkSystems();

    // Limpar event listeners de rede
    window.removeEventListener('socket:move:confirmed', this.handleMoveConfirmed);
    window.removeEventListener('socket:position:corrected', this.handlePositionCorrected);

    // Limpar asset managers
    if (this.assetManager) {
      this.assetManager.cleanup();
    }
    if (this.spriteSheetManager) {
      this.spriteSheetManager.cleanup();
    }

    // Resetar estatísticas
    this.networkStats = {
      predictions: 0,
      corrections: 0,
      latency: 0,
      lastUpdate: 0
    };

    console.log('✅ Multiplayer Manager limpo');
  }
}

