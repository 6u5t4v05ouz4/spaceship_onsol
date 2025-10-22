/**
 * LoadBalancer - Balanceador de carga para distribuição de jogadores
 * 
 * Features:
 * - Algoritmos de balanceamento (round-robin, least-connections, weighted)
 * - Health checks de instâncias
 * - Failover automático
 * - Métricas de performance por instância
 * - Distribuição inteligente baseada em recursos
 */

export default class LoadBalancer {
  constructor(options = {}) {
    // Configurações
    this.algorithm = options.algorithm || 'least-connections'; // 'round-robin', 'least-connections', 'weighted'
    this.healthCheckInterval = options.healthCheckInterval || 10000; // 10s
    this.instanceTimeout = options.instanceTimeout || 30000; // 30s
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000; // 1s
    
    // Estado interno
    this.instances = new Map(); // Map<instanceId, instanceData>
    this.currentIndex = 0; // Para round-robin
    this.healthCheckTimer = null;
    this.metrics = new Map(); // Map<instanceId, metrics>
    
    // Estatísticas
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      instanceFailovers: 0,
      averageResponseTime: 0,
      lastHealthCheck: 0
    };
    
    // Callbacks
    this.onInstanceHealthChange = options.onInstanceHealthChange || null;
    this.onInstanceFailover = options.onInstanceFailover || null;
    this.onRequestFailed = options.onRequestFailed || null;
    
    console.log('⚖️ LoadBalancer inicializado:', {
      algorithm: this.algorithm,
      healthCheckInterval: this.healthCheckInterval,
      instanceTimeout: this.instanceTimeout
    });
  }

  /**
   * Adiciona uma instância ao pool
   * @param {string} instanceId - ID da instância
   * @param {Object} config - Configuração da instância
   * @returns {boolean} True se adicionou com sucesso
   */
  addInstance(instanceId, config) {
    try {
      const instanceData = {
        instanceId,
        host: config.host,
        port: config.port,
        weight: config.weight || 1,
        maxConnections: config.maxConnections || 100,
        currentConnections: 0,
        status: 'active',
        lastHealthCheck: Date.now(),
        responseTime: 0,
        errorCount: 0,
        successCount: 0,
        addedAt: Date.now()
      };
      
      this.instances.set(instanceId, instanceData);
      this.metrics.set(instanceId, {
        requests: 0,
        successes: 0,
        failures: 0,
        averageResponseTime: 0,
        lastRequest: 0
      });
      
      console.log(`➕ Instância adicionada ao LoadBalancer: ${instanceId}`);
      return true;

    } catch (error) {
      console.error('❌ Erro ao adicionar instância:', error.message);
      return false;
    }
  }

  /**
   * Remove uma instância do pool
   * @param {string} instanceId - ID da instância
   * @returns {boolean} True se removeu com sucesso
   */
  removeInstance(instanceId) {
    try {
      const removed = this.instances.delete(instanceId);
      this.metrics.delete(instanceId);
      
      if (removed) {
        console.log(`➖ Instância removida do LoadBalancer: ${instanceId}`);
      }
      
      return removed;

    } catch (error) {
      console.error('❌ Erro ao remover instância:', error.message);
      return false;
    }
  }

  /**
   * Seleciona a melhor instância para um novo jogador
   * @param {Object} playerInfo - Informações do jogador (opcional)
   * @returns {string|null} ID da instância selecionada ou null
   */
  selectInstance(playerInfo = {}) {
    try {
      this.stats.totalRequests++;
      
      // Filtrar instâncias ativas
      const activeInstances = Array.from(this.instances.values())
        .filter(instance => instance.status === 'active');
      
      if (activeInstances.length === 0) {
        console.warn('⚠️ Nenhuma instância ativa disponível');
        this.stats.failedRequests++;
        return null;
      }
      
      let selectedInstance = null;
      
      switch (this.algorithm) {
        case 'round-robin':
          selectedInstance = this.selectRoundRobin(activeInstances);
          break;
        case 'least-connections':
          selectedInstance = this.selectLeastConnections(activeInstances);
          break;
        case 'weighted':
          selectedInstance = this.selectWeighted(activeInstances);
          break;
        default:
          selectedInstance = this.selectLeastConnections(activeInstances);
      }
      
      if (selectedInstance) {
        // Atualizar contadores
        selectedInstance.currentConnections++;
        this.updateMetrics(selectedInstance.instanceId, true);
        this.stats.successfulRequests++;
        
        console.log(`🎯 Instância selecionada: ${selectedInstance.instanceId} (${this.algorithm})`);
        return selectedInstance.instanceId;
      } else {
        this.stats.failedRequests++;
        return null;
      }

    } catch (error) {
      console.error('❌ Erro ao selecionar instância:', error.message);
      this.stats.failedRequests++;
      return null;
    }
  }

  /**
   * Seleção por round-robin
   * @param {Array} instances - Lista de instâncias ativas
   * @returns {Object|null} Instância selecionada
   */
  selectRoundRobin(instances) {
    if (instances.length === 0) return null;
    
    const selected = instances[this.currentIndex % instances.length];
    this.currentIndex = (this.currentIndex + 1) % instances.length;
    
    return selected;
  }

  /**
   * Seleção por menor número de conexões
   * @param {Array} instances - Lista de instâncias ativas
   * @returns {Object|null} Instância selecionada
   */
  selectLeastConnections(instances) {
    if (instances.length === 0) return null;
    
    // Ordenar por número de conexões (menor primeiro)
    instances.sort((a, b) => a.currentConnections - b.currentConnections);
    
    // Se há empate, considerar tempo de resposta
    const minConnections = instances[0].currentConnections;
    const tiedInstances = instances.filter(instance => 
      instance.currentConnections === minConnections
    );
    
    if (tiedInstances.length > 1) {
      tiedInstances.sort((a, b) => a.responseTime - b.responseTime);
    }
    
    return tiedInstances[0];
  }

  /**
   * Seleção por peso
   * @param {Array} instances - Lista de instâncias ativas
   * @returns {Object|null} Instância selecionada
   */
  selectWeighted(instances) {
    if (instances.length === 0) return null;
    
    // Calcular peso efetivo baseado em peso, conexões e tempo de resposta
    const weightedInstances = instances.map(instance => {
      const connectionRatio = instance.currentConnections / instance.maxConnections;
      const responseTimeFactor = Math.max(0, 1 - (instance.responseTime / 1000)); // Normalizar para 1s
      const effectiveWeight = instance.weight * responseTimeFactor * (1 - connectionRatio);
      
      return {
        ...instance,
        effectiveWeight: Math.max(0.1, effectiveWeight) // Mínimo de 0.1
      };
    });
    
    // Seleção probabilística baseada no peso
    const totalWeight = weightedInstances.reduce((sum, instance) => sum + instance.effectiveWeight, 0);
    let random = Math.random() * totalWeight;
    
    for (const instance of weightedInstances) {
      random -= instance.effectiveWeight;
      if (random <= 0) {
        return instance;
      }
    }
    
    // Fallback para primeira instância
    return weightedInstances[0];
  }

  /**
   * Registra desconexão de jogador
   * @param {string} instanceId - ID da instância
   * @returns {boolean} True se registrou com sucesso
   */
  releaseConnection(instanceId) {
    try {
      const instance = this.instances.get(instanceId);
      if (instance && instance.currentConnections > 0) {
        instance.currentConnections--;
        console.log(`🔓 Conexão liberada da instância ${instanceId}`);
        return true;
      }
      
      return false;

    } catch (error) {
      console.error('❌ Erro ao liberar conexão:', error.message);
      return false;
    }
  }

  /**
   * Inicia health checks
   */
  startHealthChecks() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthChecks();
    }, this.healthCheckInterval);
    
    console.log(`💓 Health checks iniciados a cada ${this.healthCheckInterval / 1000} segundos`);
  }

  /**
   * Para health checks
   */
  stopHealthChecks() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
      console.log('⏹️ Health checks parados');
    }
  }

  /**
   * Executa health checks em todas as instâncias
   * @returns {Promise<void>}
   */
  async performHealthChecks() {
    try {
      const promises = Array.from(this.instances.keys()).map(instanceId => 
        this.checkInstanceHealth(instanceId)
      );
      
      await Promise.allSettled(promises);
      this.stats.lastHealthCheck = Date.now();

    } catch (error) {
      console.error('❌ Erro nos health checks:', error.message);
    }
  }

  /**
   * Verifica saúde de uma instância específica
   * @param {string} instanceId - ID da instância
   * @returns {Promise<void>}
   */
  async checkInstanceHealth(instanceId) {
    try {
      const instance = this.instances.get(instanceId);
      if (!instance) return;
      
      const startTime = Date.now();
      
      // Simular health check (em produção seria uma requisição HTTP)
      const isHealthy = await this.pingInstance(instance);
      const responseTime = Date.now() - startTime;
      
      // Atualizar dados da instância
      instance.lastHealthCheck = Date.now();
      instance.responseTime = responseTime;
      
      if (isHealthy) {
        if (instance.status !== 'active') {
          console.log(`✅ Instância ${instanceId} recuperada`);
          instance.status = 'active';
          instance.errorCount = 0;
          
          if (this.onInstanceHealthChange) {
            this.onInstanceHealthChange(instanceId, 'recovered');
          }
        }
        instance.successCount++;
      } else {
        instance.errorCount++;
        instance.status = 'unhealthy';
        
        console.warn(`⚠️ Instância ${instanceId} com problemas (erros: ${instance.errorCount})`);
        
        if (this.onInstanceHealthChange) {
          this.onInstanceHealthChange(instanceId, 'unhealthy');
        }
        
        // Marcar como inativa se muitos erros
        if (instance.errorCount >= this.maxRetries) {
          instance.status = 'inactive';
          console.error(`❌ Instância ${instanceId} marcada como inativa`);
          
          if (this.onInstanceFailover) {
            this.onInstanceFailover(instanceId);
          }
          
          this.stats.instanceFailovers++;
        }
      }
      
      this.updateMetrics(instanceId, isHealthy);

    } catch (error) {
      console.error(`❌ Erro no health check da instância ${instanceId}:`, error.message);
    }
  }

  /**
   * Simula ping para uma instância
   * @param {Object} instance - Dados da instância
   * @returns {Promise<boolean>} True se instância respondeu
   */
  async pingInstance(instance) {
    try {
      // Em produção, fazer requisição HTTP real
      // const response = await fetch(`http://${instance.host}:${instance.port}/health`);
      // return response.ok;
      
      // Simulação para desenvolvimento
      return Math.random() > 0.1; // 90% de chance de sucesso

    } catch (error) {
      return false;
    }
  }

  /**
   * Atualiza métricas de uma instância
   * @param {string} instanceId - ID da instância
   * @param {boolean} success - Se a operação foi bem-sucedida
   */
  updateMetrics(instanceId, success) {
    const metrics = this.metrics.get(instanceId);
    if (!metrics) return;
    
    metrics.requests++;
    metrics.lastRequest = Date.now();
    
    if (success) {
      metrics.successes++;
    } else {
      metrics.failures++;
    }
    
    // Calcular taxa de sucesso
    const successRate = metrics.successes / metrics.requests;
    
    // Atualizar tempo de resposta médio (simplificado)
    const instance = this.instances.get(instanceId);
    if (instance) {
      metrics.averageResponseTime = instance.responseTime;
    }
  }

  /**
   * Obtém estatísticas do LoadBalancer
   * @returns {Object} Estatísticas detalhadas
   */
  getStats() {
    const totalInstances = this.instances.size;
    const activeInstances = Array.from(this.instances.values())
      .filter(instance => instance.status === 'active').length;
    
    const totalConnections = Array.from(this.instances.values())
      .reduce((sum, instance) => sum + instance.currentConnections, 0);
    
    const averageResponseTime = Array.from(this.instances.values())
      .reduce((sum, instance) => sum + instance.responseTime, 0) / totalInstances || 0;
    
    return {
      ...this.stats,
      algorithm: this.algorithm,
      totalInstances,
      activeInstances,
      inactiveInstances: totalInstances - activeInstances,
      totalConnections,
      averageResponseTime: Math.round(averageResponseTime),
      instances: Array.from(this.instances.entries()).map(([id, data]) => ({
        instanceId: id,
        ...data,
        metrics: this.metrics.get(id) || {}
      })),
      lastHealthCheck: this.stats.lastHealthCheck
    };
  }

  /**
   * Obtém métricas de uma instância específica
   * @param {string} instanceId - ID da instância
   * @returns {Object|null} Métricas da instância
   */
  getInstanceMetrics(instanceId) {
    const instance = this.instances.get(instanceId);
    const metrics = this.metrics.get(instanceId);
    
    if (!instance || !metrics) return null;
    
    return {
      instanceId,
      ...instance,
      metrics: {
        ...metrics,
        successRate: metrics.requests > 0 ? (metrics.successes / metrics.requests) * 100 : 0,
        failureRate: metrics.requests > 0 ? (metrics.failures / metrics.requests) * 100 : 0
      }
    };
  }

  /**
   * Força failover de uma instância
   * @param {string} instanceId - ID da instância
   * @returns {boolean} True se failover foi executado
   */
  forceFailover(instanceId) {
    try {
      const instance = this.instances.get(instanceId);
      if (!instance) return false;
      
      instance.status = 'inactive';
      instance.errorCount = this.maxRetries;
      
      console.log(`🔄 Failover forçado para instância ${instanceId}`);
      
      if (this.onInstanceFailover) {
        this.onInstanceFailover(instanceId);
      }
      
      this.stats.instanceFailovers++;
      return true;

    } catch (error) {
      console.error('❌ Erro no failover forçado:', error.message);
      return false;
    }
  }

  /**
   * Destrói o LoadBalancer
   */
  destroy() {
    console.log('🧹 Destruindo LoadBalancer...');
    
    this.stopHealthChecks();
    this.instances.clear();
    this.metrics.clear();
    this.currentIndex = 0;
    
    console.log('✅ LoadBalancer destruído');
  }
}
