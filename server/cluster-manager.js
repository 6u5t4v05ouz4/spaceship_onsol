/**
 * ClusterManager - Gerenciador de cluster para múltiplas instâncias
 * 
 * Features:
 * - Descoberta automática de instâncias
 * - Balanceamento de carga inteligente
 * - Health checks entre instâncias
 * - Migração de jogadores entre instâncias
 * - Coordenação de chunks entre instâncias
 */

import RedisManager from './redis-manager.js';
import os from 'os';

export default class ClusterManager {
  constructor(options = {}) {
    // Configurações
    this.instanceId = options.instanceId || this.generateInstanceId();
    this.port = options.port || process.env.PORT || 3000;
    this.host = options.host || process.env.HOST || 'localhost';
    this.redisManager = options.redisManager || null;
    this.maxPlayersPerInstance = options.maxPlayersPerInstance || 100;
    this.healthCheckInterval = options.healthCheckInterval || 30000; // 30s
    this.instanceTimeout = options.instanceTimeout || 120000; // 2min
    
    // Estado interno
    this.instances = new Map(); // Map<instanceId, instanceData>
    this.localPlayers = new Set(); // Set<playerId> - jogadores nesta instância
    this.healthCheckTimer = null;
    this.isLeader = false;
    this.leaderElectionTimer = null;
    
    // Estatísticas
    this.stats = {
      totalInstances: 0,
      activeInstances: 0,
      totalPlayers: 0,
      localPlayers: 0,
      leaderElections: 0,
      lastHealthCheck: 0,
      instanceJoins: 0,
      instanceLeaves: 0
    };
    
    // Callbacks
    this.onInstanceJoin = options.onInstanceJoin || null;
    this.onInstanceLeave = options.onInstanceLeave || null;
    this.onLeaderChange = options.onLeaderChange || null;
    this.onPlayerMigration = options.onPlayerMigration || null;
    
    console.log('🏗️ ClusterManager inicializado:', {
      instanceId: this.instanceId,
      port: this.port,
      host: this.host,
      maxPlayersPerInstance: this.maxPlayersPerInstance
    });
  }

  /**
   * Gera um ID único para esta instância
   * @returns {string}
   */
  generateInstanceId() {
    const hostname = os.hostname();
    const pid = process.pid;
    const timestamp = Date.now();
    return `${hostname}-${pid}-${timestamp}`;
  }

  /**
   * Inicializa o ClusterManager
   * @param {RedisManager} redisManager - Instância do RedisManager
   * @returns {Promise<boolean>} True se inicializou com sucesso
   */
  async init(redisManager) {
    try {
      console.log('🏗️ Inicializando ClusterManager...');
      
      this.redisManager = redisManager;
      
      // Registrar esta instância
      await this.registerInstance();
      
      // Subscrever a eventos de cluster
      await this.setupClusterEvents();
      
      // Iniciar health checks
      this.startHealthChecks();
      
      // Iniciar eleição de líder
      this.startLeaderElection();
      
      console.log('✅ ClusterManager inicializado');
      return true;

    } catch (error) {
      console.error('❌ Erro ao inicializar ClusterManager:', error.message);
      return false;
    }
  }

  /**
   * Registra esta instância no cluster
   * @returns {Promise<boolean>} True se registrou com sucesso
   */
  async registerInstance() {
    try {
      const instanceData = {
        instanceId: this.instanceId,
        host: this.host,
        port: this.port,
        status: 'active',
        playerCount: 0,
        maxPlayers: this.maxPlayersPerInstance,
        lastSeen: Date.now(),
        cpuUsage: this.getCpuUsage(),
        memoryUsage: this.getMemoryUsage(),
        uptime: process.uptime()
      };
      
      // Armazenar dados da instância
      await this.redisManager.setPlayerState(`instance:${this.instanceId}`, instanceData, 300); // 5min TTL
      
      // Adicionar à lista de instâncias ativas
      await this.redisManager.redis?.sadd('cluster:instances', this.instanceId);
      await this.redisManager.redis?.expire('cluster:instances', 300);
      
      console.log('📝 Instância registrada no cluster:', this.instanceId);
      return true;

    } catch (error) {
      console.error('❌ Erro ao registrar instância:', error.message);
      return false;
    }
  }

  /**
   * Configura eventos de cluster via Redis Pub/Sub
   * @returns {Promise<boolean>} True se configurou com sucesso
   */
  async setupClusterEvents() {
    try {
      // Subscrever a eventos de cluster
      await this.redisManager.subscribe('cluster:events', (message) => {
        this.handleClusterEvent(message);
      });
      
      // Subscrever a eventos de migração de jogadores
      await this.redisManager.subscribe('cluster:player:migrate', (message) => {
        this.handlePlayerMigration(message);
      });
      
      console.log('📡 Eventos de cluster configurados');
      return true;

    } catch (error) {
      console.error('❌ Erro ao configurar eventos de cluster:', error.message);
      return false;
    }
  }

  /**
   * Processa eventos de cluster
   * @param {Object} message - Mensagem recebida
   */
  handleClusterEvent(message) {
    try {
      const { type, instanceId, data } = message;
      
      switch (type) {
        case 'instance:join':
          this.handleInstanceJoin(instanceId, data);
          break;
        case 'instance:leave':
          this.handleInstanceLeave(instanceId, data);
          break;
        case 'instance:health':
          this.handleInstanceHealth(instanceId, data);
          break;
        case 'leader:election':
          this.handleLeaderElection(data);
          break;
        default:
          console.log('📨 Evento de cluster desconhecido:', type);
      }

    } catch (error) {
      console.error('❌ Erro ao processar evento de cluster:', error.message);
    }
  }

  /**
   * Processa entrada de nova instância
   * @param {string} instanceId - ID da instância
   * @param {Object} data - Dados da instância
   */
  handleInstanceJoin(instanceId, data) {
    if (instanceId === this.instanceId) return; // Ignora própria instância
    
    this.instances.set(instanceId, {
      ...data,
      lastSeen: Date.now()
    });
    
    this.stats.instanceJoins++;
    this.updateStats();
    
    console.log(`🆕 Nova instância adicionada ao cluster: ${instanceId}`);
    
    if (this.onInstanceJoin) {
      this.onInstanceJoin(instanceId, data);
    }
  }

  /**
   * Processa saída de instância
   * @param {string} instanceId - ID da instância
   * @param {Object} data - Dados da instância
   */
  handleInstanceLeave(instanceId, data) {
    if (instanceId === this.instanceId) return; // Ignora própria instância
    
    this.instances.delete(instanceId);
    this.stats.instanceLeaves++;
    this.updateStats();
    
    console.log(`👋 Instância removida do cluster: ${instanceId}`);
    
    if (this.onInstanceLeave) {
      this.onInstanceLeave(instanceId, data);
    }
  }

  /**
   * Processa health check de instância
   * @param {string} instanceId - ID da instância
   * @param {Object} data - Dados de health
   */
  handleInstanceHealth(instanceId, data) {
    if (instanceId === this.instanceId) return; // Ignora própria instância
    
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.lastSeen = Date.now();
      instance.playerCount = data.playerCount || 0;
      instance.cpuUsage = data.cpuUsage || 0;
      instance.memoryUsage = data.memoryUsage || 0;
    }
  }

  /**
   * Processa eleição de líder
   * @param {Object} data - Dados da eleição
   */
  handleLeaderElection(data) {
    const { leaderId, timestamp } = data;
    
    if (leaderId === this.instanceId) {
      this.isLeader = true;
      console.log('👑 Esta instância foi eleita líder do cluster');
      
      if (this.onLeaderChange) {
        this.onLeaderChange(true);
      }
    } else {
      this.isLeader = false;
    }
  }

  /**
   * Processa migração de jogador
   * @param {Object} message - Mensagem de migração
   */
  handlePlayerMigration(message) {
    const { playerId, fromInstance, toInstance, reason } = message;
    
    if (toInstance === this.instanceId) {
      console.log(`🔄 Jogador ${playerId} migrando para esta instância (de ${fromInstance})`);
      
      if (this.onPlayerMigration) {
        this.onPlayerMigration(playerId, fromInstance, toInstance, reason);
      }
    }
  }

  /**
   * Inicia health checks periódicos
   */
  startHealthChecks() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, this.healthCheckInterval);
    
    console.log(`💓 Health checks iniciados a cada ${this.healthCheckInterval / 1000} segundos`);
  }

  /**
   * Executa health check
   * @returns {Promise<void>}
   */
  async performHealthCheck() {
    try {
      // Atualizar dados desta instância
      const instanceData = {
        instanceId: this.instanceId,
        host: this.host,
        port: this.port,
        status: 'active',
        playerCount: this.localPlayers.size,
        maxPlayers: this.maxPlayersPerInstance,
        lastSeen: Date.now(),
        cpuUsage: this.getCpuUsage(),
        memoryUsage: this.getMemoryUsage(),
        uptime: process.uptime()
      };
      
      // Atualizar no Redis
      await this.redisManager.setPlayerState(`instance:${this.instanceId}`, instanceData, 300);
      
      // Publicar health check
      await this.redisManager.publish('cluster:events', {
        type: 'instance:health',
        instanceId: this.instanceId,
        data: {
          playerCount: this.localPlayers.size,
          cpuUsage: instanceData.cpuUsage,
          memoryUsage: instanceData.memoryUsage,
          timestamp: Date.now()
        }
      });
      
      // Verificar instâncias inativas
      await this.checkInactiveInstances();
      
      this.stats.lastHealthCheck = Date.now();
      this.updateStats();

    } catch (error) {
      console.error('❌ Erro no health check:', error.message);
    }
  }

  /**
   * Verifica instâncias inativas e as remove
   * @returns {Promise<void>}
   */
  async checkInactiveInstances() {
    const now = Date.now();
    const inactiveInstances = [];
    
    for (const [instanceId, instance] of this.instances.entries()) {
      if (now - instance.lastSeen > this.instanceTimeout) {
        inactiveInstances.push(instanceId);
      }
    }
    
    for (const instanceId of inactiveInstances) {
      console.log(`⏰ Instância inativa detectada: ${instanceId}`);
      this.handleInstanceLeave(instanceId, { reason: 'timeout' });
    }
  }

  /**
   * Inicia eleição de líder
   */
  startLeaderElection() {
    if (this.leaderElectionTimer) {
      clearInterval(this.leaderElectionTimer);
    }
    
    // Eleição inicial após 5 segundos
    setTimeout(() => {
      this.performLeaderElection();
    }, 5000);
    
    // Eleições periódicas a cada 2 minutos
    this.leaderElectionTimer = setInterval(() => {
      this.performLeaderElection();
    }, 120000);
    
    console.log('🗳️ Eleição de líder iniciada');
  }

  /**
   * Executa eleição de líder
   * @returns {Promise<void>}
   */
  async performLeaderElection() {
    try {
      // Obter todas as instâncias ativas
      const instances = Array.from(this.instances.values());
      instances.push({
        instanceId: this.instanceId,
        playerCount: this.localPlayers.size,
        uptime: process.uptime()
      });
      
      // Ordenar por uptime (mais antiga primeiro) e depois por playerCount (menos jogadores primeiro)
      instances.sort((a, b) => {
        if (a.uptime !== b.uptime) {
          return a.uptime - b.uptime; // Mais antiga primeiro
        }
        return a.playerCount - b.playerCount; // Menos jogadores primeiro
      });
      
      const leader = instances[0];
      
      if (leader.instanceId === this.instanceId && !this.isLeader) {
        console.log('👑 Esta instância foi eleita líder');
        this.isLeader = true;
        
        if (this.onLeaderChange) {
          this.onLeaderChange(true);
        }
      } else if (leader.instanceId !== this.instanceId && this.isLeader) {
        console.log('👑 Esta instância não é mais líder');
        this.isLeader = false;
        
        if (this.onLeaderChange) {
          this.onLeaderChange(false);
        }
      }
      
      // Publicar resultado da eleição
      await this.redisManager.publish('cluster:events', {
        type: 'leader:election',
        data: {
          leaderId: leader.instanceId,
          timestamp: Date.now(),
          candidates: instances.length
        }
      });
      
      this.stats.leaderElections++;

    } catch (error) {
      console.error('❌ Erro na eleição de líder:', error.message);
    }
  }

  /**
   * Adiciona jogador local
   * @param {string} playerId - ID do jogador
   * @returns {boolean} True se adicionou com sucesso
   */
  addLocalPlayer(playerId) {
    if (this.localPlayers.has(playerId)) {
      return false; // Já existe
    }
    
    this.localPlayers.add(playerId);
    this.updateStats();
    
    console.log(`👤 Jogador ${playerId} adicionado à instância local`);
    return true;
  }

  /**
   * Remove jogador local
   * @param {string} playerId - ID do jogador
   * @returns {boolean} True se removeu com sucesso
   */
  removeLocalPlayer(playerId) {
    if (!this.localPlayers.has(playerId)) {
      return false; // Não existe
    }
    
    this.localPlayers.delete(playerId);
    this.updateStats();
    
    console.log(`👋 Jogador ${playerId} removido da instância local`);
    return true;
  }

  /**
   * Encontra melhor instância para novo jogador
   * @returns {string|null} ID da melhor instância ou null
   */
  findBestInstanceForPlayer() {
    const instances = Array.from(this.instances.values());
    
    // Adicionar instância local
    instances.push({
      instanceId: this.instanceId,
      playerCount: this.localPlayers.size,
      maxPlayers: this.maxPlayersPerInstance,
      cpuUsage: this.getCpuUsage(),
      memoryUsage: this.getMemoryUsage()
    });
    
    // Filtrar instâncias com capacidade
    const availableInstances = instances.filter(instance => 
      instance.playerCount < instance.maxPlayers
    );
    
    if (availableInstances.length === 0) {
      return null; // Nenhuma instância disponível
    }
    
    // Ordenar por carga (menor primeiro)
    availableInstances.sort((a, b) => {
      const loadA = (a.playerCount / a.maxPlayers) + (a.cpuUsage / 100) + (a.memoryUsage / 100);
      const loadB = (b.playerCount / b.maxPlayers) + (b.cpuUsage / 100) + (b.memoryUsage / 100);
      return loadA - loadB;
    });
    
    return availableInstances[0].instanceId;
  }

  /**
   * Migra jogador para outra instância
   * @param {string} playerId - ID do jogador
   * @param {string} targetInstanceId - ID da instância de destino
   * @param {string} reason - Razão da migração
   * @returns {Promise<boolean>} True se migrou com sucesso
   */
  async migratePlayer(playerId, targetInstanceId, reason = 'load_balancing') {
    try {
      if (targetInstanceId === this.instanceId) {
        return false; // Não pode migrar para si mesmo
      }
      
      // Publicar evento de migração
      await this.redisManager.publish('cluster:player:migrate', {
        playerId,
        fromInstance: this.instanceId,
        toInstance: targetInstanceId,
        reason,
        timestamp: Date.now()
      });
      
      console.log(`🔄 Migrando jogador ${playerId} para instância ${targetInstanceId} (${reason})`);
      return true;

    } catch (error) {
      console.error('❌ Erro ao migrar jogador:', error.message);
      return false;
    }
  }

  /**
   * Obtém uso de CPU (simplificado)
   * @returns {number} Percentual de uso de CPU
   */
  getCpuUsage() {
    // Implementação simplificada - em produção usar uma biblioteca como 'os-utils'
    return Math.random() * 100; // Placeholder
  }

  /**
   * Obtém uso de memória
   * @returns {number} Percentual de uso de memória
   */
  getMemoryUsage() {
    const used = process.memoryUsage();
    const total = os.totalmem();
    return (used.heapUsed / total) * 100;
  }

  /**
   * Atualiza estatísticas
   */
  updateStats() {
    this.stats.totalInstances = this.instances.size + 1; // +1 para instância local
    this.stats.activeInstances = this.instances.size + 1;
    this.stats.localPlayers = this.localPlayers.size;
    
    // Calcular total de jogadores (aproximado)
    let totalPlayers = this.localPlayers.size;
    for (const instance of this.instances.values()) {
      totalPlayers += instance.playerCount || 0;
    }
    this.stats.totalPlayers = totalPlayers;
  }

  /**
   * Obtém estatísticas do cluster
   * @returns {Object} Estatísticas detalhadas
   */
  getStats() {
    this.updateStats();
    
    return {
      ...this.stats,
      instanceId: this.instanceId,
      isLeader: this.isLeader,
      instances: Array.from(this.instances.entries()).map(([id, data]) => ({
        instanceId: id,
        ...data
      })),
      localInstance: {
        instanceId: this.instanceId,
        host: this.host,
        port: this.port,
        playerCount: this.localPlayers.size,
        maxPlayers: this.maxPlayersPerInstance,
        cpuUsage: this.getCpuUsage(),
        memoryUsage: this.getMemoryUsage(),
        uptime: process.uptime()
      }
    };
  }

  /**
   * Destrói o ClusterManager
   */
  async destroy() {
    console.log('🧹 Destruindo ClusterManager...');
    
    // Parar timers
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    
    if (this.leaderElectionTimer) {
      clearInterval(this.leaderElectionTimer);
      this.leaderElectionTimer = null;
    }
    
    // Remover instância do cluster
    if (this.redisManager) {
      await this.redisManager.redis?.srem('cluster:instances', this.instanceId);
      await this.redisManager.removePlayerState(`instance:${this.instanceId}`);
    }
    
    // Limpar estado
    this.instances.clear();
    this.localPlayers.clear();
    this.isLeader = false;
    
    console.log('✅ ClusterManager destruído');
  }
}
