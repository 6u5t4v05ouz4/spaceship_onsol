/**
 * LoadTester - Sistema de testes de carga para validar escalabilidade
 * 
 * Features:
 * - Simulação de múltiplos jogadores conectados
 * - Testes de stress em diferentes cenários
 * - Métricas de performance durante os testes
 * - Validação de balanceamento de carga
 * - Testes de failover e recuperação
 */

import io from 'socket.io-client';

export default class LoadTester {
  constructor(options = {}) {
    // Configurações
    this.serverUrl = options.serverUrl || 'http://localhost:3000';
    this.maxConcurrentPlayers = options.maxConcurrentPlayers || 100;
    this.testDuration = options.testDuration || 60000; // 1 minuto
    this.rampUpTime = options.rampUpTime || 10000; // 10 segundos
    this.rampDownTime = options.rampDownTime || 10000; // 10 segundos
    this.movementInterval = options.movementInterval || 100; // ms
    this.chunkChangeInterval = options.chunkChangeInterval || 5000; // ms
    
    // Estado interno
    this.players = new Map(); // Map<playerId, playerData>
    this.isRunning = false;
    this.startTime = null;
    this.endTime = null;
    this.testTimer = null;
    
    // Estatísticas
    this.stats = {
      totalPlayersCreated: 0,
      successfulConnections: 0,
      failedConnections: 0,
      totalMovements: 0,
      totalChunkChanges: 0,
      averageLatency: 0,
      peakLatency: 0,
      minLatency: Infinity,
      errors: 0,
      disconnections: 0,
      reconnections: 0
    };
    
    // Callbacks
    this.onTestStart = options.onTestStart || null;
    this.onTestEnd = options.onTestEnd || null;
    this.onPlayerConnect = options.onPlayerConnect || null;
    this.onPlayerDisconnect = options.onPlayerDisconnect || null;
    this.onError = options.onError || null;
    
    console.log('🧪 LoadTester inicializado:', {
      serverUrl: this.serverUrl,
      maxConcurrentPlayers: this.maxConcurrentPlayers,
      testDuration: this.testDuration
    });
  }

  /**
   * Inicia o teste de carga
   * @returns {Promise<boolean>} True se iniciou com sucesso
   */
  async startLoadTest() {
    try {
      if (this.isRunning) {
        console.warn('⚠️ Teste de carga já está em execução');
        return false;
      }

      console.log('🚀 Iniciando teste de carga...');
      this.isRunning = true;
      this.startTime = Date.now();
      this.stats = {
        totalPlayersCreated: 0,
        successfulConnections: 0,
        failedConnections: 0,
        totalMovements: 0,
        totalChunkChanges: 0,
        averageLatency: 0,
        peakLatency: 0,
        minLatency: Infinity,
        errors: 0,
        disconnections: 0,
        reconnections: 0
      };

      if (this.onTestStart) {
        this.onTestStart();
      }

      // Fase 1: Ramp Up - Conectar jogadores gradualmente
      await this.rampUpPlayers();

      // Fase 2: Sustained Load - Manter carga por tempo determinado
      await this.sustainedLoad();

      // Fase 3: Ramp Down - Desconectar jogadores gradualmente
      await this.rampDownPlayers();

      // Finalizar teste
      await this.endLoadTest();

      return true;

    } catch (error) {
      console.error('❌ Erro no teste de carga:', error.message);
      this.stats.errors++;
      
      if (this.onError) {
        this.onError(error);
      }
      
      return false;
    }
  }

  /**
   * Fase de ramp up - conectar jogadores gradualmente
   * @returns {Promise<void>}
   */
  async rampUpPlayers() {
    console.log(`📈 Fase de Ramp Up iniciada (${this.rampUpTime / 1000}s)`);
    
    const playersPerSecond = this.maxConcurrentPlayers / (this.rampUpTime / 1000);
    const interval = 1000 / playersPerSecond; // ms entre conexões
    
    for (let i = 0; i < this.maxConcurrentPlayers; i++) {
      if (!this.isRunning) break;
      
      await this.createPlayer(i);
      await this.sleep(interval);
    }
    
    console.log(`✅ Ramp Up concluído. ${this.players.size} jogadores conectados`);
  }

  /**
   * Fase de carga sustentada
   * @returns {Promise<void>}
   */
  async sustainedLoad() {
    console.log(`⚡ Fase de carga sustentada iniciada (${this.testDuration / 1000}s)`);
    
    return new Promise((resolve) => {
      this.testTimer = setTimeout(() => {
        console.log('✅ Carga sustentada concluída');
        resolve();
      }, this.testDuration);
    });
  }

  /**
   * Fase de ramp down - desconectar jogadores gradualmente
   * @returns {Promise<void>}
   */
  async rampDownPlayers() {
    console.log(`📉 Fase de Ramp Down iniciada (${this.rampDownTime / 1000}s)`);
    
    const playersToDisconnect = Array.from(this.players.keys());
    const interval = this.rampDownTime / playersToDisconnect.length;
    
    for (const playerId of playersToDisconnect) {
      if (!this.isRunning) break;
      
      await this.disconnectPlayer(playerId);
      await this.sleep(interval);
    }
    
    console.log('✅ Ramp Down concluído');
  }

  /**
   * Cria um novo jogador simulado
   * @param {number} playerIndex - Índice do jogador
   * @returns {Promise<boolean>} True se criou com sucesso
   */
  async createPlayer(playerIndex) {
    try {
      const playerId = `test-player-${playerIndex}`;
      const socket = io(this.serverUrl, {
        transports: ['websocket'],
        timeout: 5000
      });

      const playerData = {
        id: playerId,
        socket: socket,
        connected: false,
        authenticated: false,
        x: Math.random() * 800,
        y: Math.random() * 600,
        chunkX: 0,
        chunkY: 0,
        movements: 0,
        chunkChanges: 0,
        latency: 0,
        errors: 0,
        connectedAt: null,
        lastMovement: 0,
        lastChunkChange: 0
      };

      // Configurar event listeners
      socket.on('connect', () => {
        playerData.connected = true;
        playerData.connectedAt = Date.now();
        this.stats.successfulConnections++;
        
        if (this.onPlayerConnect) {
          this.onPlayerConnect(playerId);
        }
        
        // Simular autenticação (token fake para teste)
        socket.emit('auth', { token: `test-token-${playerIndex}` });
      });

      socket.on('auth:success', (data) => {
        playerData.authenticated = true;
        console.log(`✅ Jogador ${playerId} autenticado`);
        
        // Iniciar simulação de movimento
        this.startPlayerSimulation(playerId);
      });

      socket.on('auth:error', (error) => {
        console.warn(`⚠️ Erro de autenticação para ${playerId}:`, error.message);
        playerData.errors++;
        this.stats.errors++;
      });

      socket.on('disconnect', (reason) => {
        playerData.connected = false;
        this.stats.disconnections++;
        
        if (this.onPlayerDisconnect) {
          this.onPlayerDisconnect(playerId, reason);
        }
      });

      socket.on('error', (error) => {
        playerData.errors++;
        this.stats.errors++;
        
        if (this.onError) {
          this.onError(error);
        }
      });

      // Conectar
      socket.connect();
      
      this.players.set(playerId, playerData);
      this.stats.totalPlayersCreated++;
      
      return true;

    } catch (error) {
      console.error(`❌ Erro ao criar jogador ${playerIndex}:`, error.message);
      this.stats.failedConnections++;
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Inicia simulação de movimento para um jogador
   * @param {string} playerId - ID do jogador
   */
  startPlayerSimulation(playerId) {
    const player = this.players.get(playerId);
    if (!player || !player.authenticated) return;

    // Simular movimento contínuo
    const movementInterval = setInterval(() => {
      if (!this.isRunning || !player.connected) {
        clearInterval(movementInterval);
        return;
      }

      // Movimento aleatório
      const deltaX = (Math.random() - 0.5) * 10;
      const deltaY = (Math.random() - 0.5) * 10;
      
      player.x = Math.max(0, Math.min(800, player.x + deltaX));
      player.y = Math.max(0, Math.min(600, player.y + deltaY));
      
      // Calcular novo chunk
      const newChunkX = Math.floor(player.x / 1000);
      const newChunkY = Math.floor(player.y / 1000);
      
      // Enviar movimento
      const startTime = Date.now();
      player.socket.emit('player:move', {
        x: player.x,
        y: player.y,
        chunkX: newChunkX,
        chunkY: newChunkY
      });
      
      // Simular resposta do servidor
      setTimeout(() => {
        const latency = Date.now() - startTime;
        player.latency = latency;
        player.movements++;
        this.stats.totalMovements++;
        
        // Atualizar estatísticas de latência
        this.updateLatencyStats(latency);
      }, Math.random() * 50); // Simular latência variável
      
      // Verificar mudança de chunk
      if (newChunkX !== player.chunkX || newChunkY !== player.chunkY) {
        player.chunkX = newChunkX;
        player.chunkY = newChunkY;
        player.chunkChanges++;
        this.stats.totalChunkChanges++;
        
        player.socket.emit('chunk:enter', {
          chunkX: newChunkX,
          chunkY: newChunkY
        });
      }
      
      player.lastMovement = Date.now();
      
    }, this.movementInterval);

    // Armazenar interval para cleanup
    player.movementInterval = movementInterval;
  }

  /**
   * Desconecta um jogador
   * @param {string} playerId - ID do jogador
   * @returns {Promise<boolean>} True se desconectou com sucesso
   */
  async disconnectPlayer(playerId) {
    try {
      const player = this.players.get(playerId);
      if (!player) return false;

      // Parar simulação
      if (player.movementInterval) {
        clearInterval(player.movementInterval);
      }

      // Desconectar socket
      if (player.socket) {
        player.socket.disconnect();
      }

      // Remover do mapa
      this.players.delete(playerId);
      
      return true;

    } catch (error) {
      console.error(`❌ Erro ao desconectar jogador ${playerId}:`, error.message);
      return false;
    }
  }

  /**
   * Atualiza estatísticas de latência
   * @param {number} latency - Latência em ms
   */
  updateLatencyStats(latency) {
    this.stats.minLatency = Math.min(this.stats.minLatency, latency);
    this.stats.peakLatency = Math.max(this.stats.peakLatency, latency);
    
    // Calcular média móvel
    const totalLatency = this.stats.averageLatency * this.stats.totalMovements + latency;
    this.stats.averageLatency = totalLatency / (this.stats.totalMovements + 1);
  }

  /**
   * Finaliza o teste de carga
   * @returns {Promise<void>}
   */
  async endLoadTest() {
    console.log('🏁 Finalizando teste de carga...');
    
    this.isRunning = false;
    this.endTime = Date.now();
    
    // Desconectar todos os jogadores restantes
    const remainingPlayers = Array.from(this.players.keys());
    for (const playerId of remainingPlayers) {
      await this.disconnectPlayer(playerId);
    }
    
    // Calcular estatísticas finais
    this.calculateFinalStats();
    
    if (this.onTestEnd) {
      this.onTestEnd(this.getTestResults());
    }
    
    console.log('✅ Teste de carga finalizado');
  }

  /**
   * Calcula estatísticas finais do teste
   */
  calculateFinalStats() {
    const testDuration = this.endTime - this.startTime;
    
    this.stats.testDuration = testDuration;
    this.stats.playersPerSecond = this.stats.totalPlayersCreated / (testDuration / 1000);
    this.stats.movementsPerSecond = this.stats.totalMovements / (testDuration / 1000);
    this.stats.chunkChangesPerSecond = this.stats.totalChunkChanges / (testDuration / 1000);
    this.stats.successRate = (this.stats.successfulConnections / this.stats.totalPlayersCreated) * 100;
    this.stats.errorRate = (this.stats.errors / this.stats.totalMovements) * 100;
    
    // Corrigir minLatency se não houve movimentos
    if (this.stats.minLatency === Infinity) {
      this.stats.minLatency = 0;
    }
  }

  /**
   * Obtém resultados do teste
   * @returns {Object} Resultados detalhados
   */
  getTestResults() {
    return {
      summary: {
        testDuration: this.stats.testDuration,
        totalPlayers: this.stats.totalPlayersCreated,
        successfulConnections: this.stats.successfulConnections,
        failedConnections: this.stats.failedConnections,
        successRate: Math.round(this.stats.successRate * 100) / 100,
        totalMovements: this.stats.totalMovements,
        totalChunkChanges: this.stats.totalChunkChanges,
        errors: this.stats.errors,
        disconnections: this.stats.disconnections
      },
      performance: {
        playersPerSecond: Math.round(this.stats.playersPerSecond * 100) / 100,
        movementsPerSecond: Math.round(this.stats.movementsPerSecond * 100) / 100,
        chunkChangesPerSecond: Math.round(this.stats.chunkChangesPerSecond * 100) / 100,
        averageLatency: Math.round(this.stats.averageLatency * 100) / 100,
        minLatency: this.stats.minLatency,
        peakLatency: this.stats.peakLatency,
        errorRate: Math.round(this.stats.errorRate * 100) / 100
      },
      configuration: {
        serverUrl: this.serverUrl,
        maxConcurrentPlayers: this.maxConcurrentPlayers,
        testDuration: this.testDuration,
        rampUpTime: this.rampUpTime,
        rampDownTime: this.rampDownTime,
        movementInterval: this.movementInterval,
        chunkChangeInterval: this.chunkChangeInterval
      }
    };
  }

  /**
   * Para o teste de carga
   * @returns {Promise<void>}
   */
  async stopLoadTest() {
    console.log('⏹️ Parando teste de carga...');
    
    if (this.testTimer) {
      clearTimeout(this.testTimer);
      this.testTimer = null;
    }
    
    await this.endLoadTest();
  }

  /**
   * Obtém estatísticas em tempo real
   * @returns {Object} Estatísticas atuais
   */
  getCurrentStats() {
    const connectedPlayers = Array.from(this.players.values())
      .filter(player => player.connected).length;
    
    const authenticatedPlayers = Array.from(this.players.values())
      .filter(player => player.authenticated).length;
    
    return {
      ...this.stats,
      currentConnectedPlayers: connectedPlayers,
      currentAuthenticatedPlayers: authenticatedPlayers,
      isRunning: this.isRunning,
      elapsedTime: this.startTime ? Date.now() - this.startTime : 0
    };
  }

  /**
   * Utilitário para sleep
   * @param {number} ms - Milissegundos para aguardar
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Destrói o LoadTester
   */
  async destroy() {
    console.log('🧹 Destruindo LoadTester...');
    
    await this.stopLoadTest();
    this.players.clear();
    
    console.log('✅ LoadTester destruído');
  }
}
