/**
 * Network Integration Example
 * Exemplo de como integrar os novos sistemas de rede no MultiplayerManager
 */

import socketService from '../services/socketService.js';

export default class NetworkIntegrationExample {
  constructor(multiplayerManager) {
    this.multiplayerManager = multiplayerManager;
    this.lastNetworkUpdate = 0;
    this.networkUpdateInterval = 16; // ~60 FPS
  }

  /**
   * Inicializa os sistemas de rede com estado do jogador
   */
  initializeNetwork(playerState) {
    console.log('🌐 Inicializando sistemas de rede...');

    // Inicializar prediction manager com estado inicial
    socketService.initializeNetworkSystems({
      x: playerState.x || 0,
      y: playerState.y || 0,
      chunkX: Math.floor((playerState.x || 0) / 1000),
      chunkY: Math.floor((playerState.y || 0) / 1000)
    });

    // Configurar eventos de rede
    this.setupNetworkEvents();

    console.log('✅ Sistemas de rede inicializados');
  }

  /**
   * Configura eventos de rede para integração
   */
  setupNetworkEvents() {
    // Evento de confirmação de movimento do servidor
    window.addEventListener('socket:move:confirmed', (e) => {
      const { x, y, sequence } = e.detail;
      console.debug(`📡 Movimento confirmado: seq=${sequence}, pos=(${x}, ${y})`);
    });

    // Evento de correção de posição
    window.addEventListener('socket:position:corrected', (e) => {
      const { x, y, reason } = e.detail;
      console.warn(`⚠️ Posição corrigida: ${reason} -> (${x}, ${y})`);

      // Forçar teleport da nave local para posição corrigida
      if (this.multiplayerManager.scene?.ship) {
        this.multiplayerManager.scene.ship.setPosition(x, y);
      }
    });

    // Atualizar dados de outros jogadores no interpolation manager
    window.addEventListener('socket:player:joined', (e) => {
      const playerData = e.detail;
      socketService.updateEntityPosition(playerData.id, {
        x: playerData.x,
        y: playerData.y
      }, null, playerData.health);
    });

    window.addEventListener('socket:player:moved', (e) => {
      const { id, x, y } = e.detail;
      socketService.updateEntityPosition(id, { x, y });
    });

    window.addEventListener('socket:player:left', (e) => {
      socketService.removeEntity(e.detail.playerId || e.detail.id);
    });
  }

  /**
   * Atualiza movimento do jogador local com predição
   */
  updatePlayerPosition(x, y) {
    if (!socketService.isAuthenticated()) return;

    // Usar sistema de predição para movimento
    socketService.updatePosition(x, y);
  }

  /**
   * Obtém posição atual do jogador (com predição)
   */
  getPlayerPosition() {
    return socketService.getPredictedPosition();
  }

  /**
   * Obtém posição interpolada de outro jogador
   */
  getOtherPlayerPosition(playerId) {
    return socketService.getInterpolatedPosition(playerId);
  }

  /**
   * Update principal para ser chamado no game loop
   */
  update(time, delta) {
    // Atualizar sistemas de rede
    socketService.update();

    // Atualizar posições dos outros jogadores com interpolação
    this.updateOtherPlayers();

    // Debug info periódico
    if (time - this.lastNetworkUpdate > 5000) { // A cada 5 segundos
      this.logNetworkStats();
      this.lastNetworkUpdate = time;
    }
  }

  /**
   * Atualiza sprites dos outros jogadores com posições interpoladas
   */
  updateOtherPlayers() {
    if (!this.multiplayerManager.otherPlayers) return;

    this.multiplayerManager.otherPlayers.forEach((playerData, playerId) => {
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

        if (playerData.nameText) {
          playerData.nameText.x = newX;
          playerData.nameText.y = newY - 40;
        }

        if (playerData.healthBarBg) {
          playerData.healthBarBg.x = newX;
          playerData.healthBarBg.y = newY - 50;
        }

        if (playerData.healthBar) {
          playerData.healthBar.x = newX;
          playerData.healthBar.y = newY - 50;
        }

        // Atualizar saúde se disponível
        if (interpolatedPos.health !== undefined && playerData.healthBar) {
          const healthPercent = interpolatedPos.health / playerData.maxHealth;
          playerData.healthBar.setScale(healthPercent, 1);

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
   * Mostra estatísticas da rede para debug
   */
  logNetworkStats() {
    const stats = socketService.getNetworkStats();

    console.log('📊 Network Stats:', {
      connection: stats.connection,
      prediction: {
        predictions: stats.prediction.predictions,
        corrections: stats.prediction.corrections,
        pendingInputs: stats.prediction.pendingInputs,
        latency: `${stats.prediction.latency}ms`
      },
      interpolation: {
        entities: stats.interpolation.entities,
        smoothTransitions: stats.interpolation.smoothTransitions,
        memoryUsage: stats.interpolation.memoryUsage
      }
    });
  }

  /**
   * Força reset dos sistemas de rede (usado em reconexão)
   */
  resetNetworkSystems() {
    console.log('🔄 Resetando sistemas de rede...');
    socketService.resetNetworkSystems();
  }

  /**
   * Limpa recursos
   */
  destroy() {
    // Remove event listeners
    window.removeEventListener('socket:move:confirmed', this.handleMoveConfirmed);
    window.removeEventListener('socket:position:corrected', this.handlePositionCorrected);

    console.log('🧹 Network integration limpa');
  }
}

/**
 * Exemplo de como integrar no MultiplayerManager:
 *
 * No construtor do MultiplayerManager:
 * ```javascript
 * import NetworkIntegration from './network-integration-example.js';
 *
 * constructor(scene) {
 *   // ... código existente ...
 *   this.networkIntegration = new NetworkIntegration(this);
 * }
 * ```
 *
 * No método init():
 * ```javascript
 * async init() {
 *   // ... código existente ...
 *
 *   // Após autenticação bem-sucedida
 *   window.addEventListener('socket:authenticated', (e) => {
 *     this.networkIntegration.initializeNetwork(e.detail.playerState);
 *   });
 * }
 * ```
 *
 * No método update():
 * ```javascript
 * update() {
 *   // ... código existente ...
 *
 *   // Atualizar sistemas de rede
 *   this.networkIntegration.update(time, delta);
 *
 *   // Usar posição predita para movimento local
 *   if (this.shipManager && this.shipManager.ship) {
 *     const predictedPos = this.networkIntegration.getPlayerPosition();
 *     // ... usar posição predita ...
 *   }
 * }
 * ```
 */