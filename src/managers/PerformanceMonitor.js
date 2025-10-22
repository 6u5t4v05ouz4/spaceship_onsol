/**
 * PerformanceMonitor - Sistema de monitoramento de performance
 * Monitora métricas de performance das melhorias implementadas
 * 
 * Features:
 * - Monitoramento de métricas em tempo real
 * - Alertas de performance
 * - Relatórios de uso de recursos
 * - Integração com sistemas de logging
 * - Dashboard de métricas
 */

export default class PerformanceMonitor {
  constructor(options = {}) {
    // Configurações
    this.enableRealTimeMonitoring = options.enableRealTimeMonitoring !== false;
    this.monitoringInterval = options.monitoringInterval || 5000; // 5 segundos
    this.enableAlerts = options.enableAlerts !== false;
    this.maxHistorySize = options.maxHistorySize || 1000;
    
    // Estado interno
    this.isMonitoring = false;
    this.monitoringTimer = null;
    this.metricsHistory = [];
    this.alerts = [];
    
    // Referências aos sistemas
    this.chunkManager = null;
    this.networkOptimizer = null;
    this.connectionManager = null;
    this.connectionTester = null;
    
    // Limites de alerta
    this.alertThresholds = {
      memoryUsage: 100 * 1024 * 1024, // 100MB
      chunkCount: 50,
      reconnectTime: 10000, // 10 segundos
      latency: 200, // 200ms
      compressionRatio: 0.1 // 10%
    };
    
    // Estatísticas
    this.stats = {
      totalMetrics: 0,
      alertsTriggered: 0,
      averageMemoryUsage: 0,
      averageLatency: 0,
      peakMemoryUsage: 0,
      monitoringUptime: 0
    };
    
    console.log('📊 PerformanceMonitor inicializado:', {
      enableRealTimeMonitoring: this.enableRealTimeMonitoring,
      monitoringInterval: this.monitoringInterval
    });
  }

  /**
   * Configura o monitor com referências aos sistemas
   * @param {Object} systems - Objetos dos sistemas a monitorar
   */
  setup(systems = {}) {
    this.chunkManager = systems.chunkManager;
    this.networkOptimizer = systems.networkOptimizer;
    this.connectionManager = systems.connectionManager;
    this.connectionTester = systems.connectionTester;
    
    console.log('✅ PerformanceMonitor configurado');
  }

  /**
   * Inicia o monitoramento em tempo real
   */
  startMonitoring() {
    if (this.isMonitoring) {
      console.warn('⚠️ Monitoramento já está ativo');
      return;
    }

    this.isMonitoring = true;
    this.stats.monitoringUptime = Date.now();
    
    console.log('📊 Iniciando monitoramento de performance...');

    // Executar primeira coleta imediatamente
    this.collectMetrics();

    // Configurar timer para coleta periódica
    this.monitoringTimer = setInterval(() => {
      this.collectMetrics();
    }, this.monitoringInterval);
  }

  /**
   * Para o monitoramento
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }

    console.log('⏹️ Monitoramento de performance parado');
  }

  /**
   * Coleta métricas de todos os sistemas
   */
  collectMetrics() {
    const timestamp = Date.now();
    const metrics = {
      timestamp,
      timestampISO: new Date().toISOString(),
      systems: {}
    };

    try {
      // Métricas do ChunkManager
      if (this.chunkManager) {
        const chunkStats = this.chunkManager.getStats();
        metrics.systems.chunkManager = {
          totalChunks: chunkStats.totalChunks,
          currentChunksInMemory: chunkStats.currentChunksInMemory,
          totalSizeMB: chunkStats.totalSizeMB,
          averageChunkSize: chunkStats.averageChunkSize,
          cleanupDuration: chunkStats.cleanupDuration,
          lastCleanupTime: chunkStats.lastCleanupTime
        };
      }

      // Métricas do NetworkOptimizer
      if (this.networkOptimizer) {
        const networkStats = this.networkOptimizer.getStats();
        metrics.systems.networkOptimizer = {
          messagesSent: networkStats.messagesSent,
          messagesCompressed: networkStats.messagesCompressed,
          bytesSaved: networkStats.bytesSaved,
          compressionRatio: networkStats.compressionRatio,
          averageMessageSize: networkStats.averageMessageSize,
          pendingMovement: networkStats.pendingMovement
        };
      }

      // Métricas do ConnectionManager
      if (this.connectionManager) {
        const connectionStats = this.connectionManager.getStats();
        metrics.systems.connectionManager = {
          isConnected: connectionStats.isConnected,
          isAuthenticated: connectionStats.isAuthenticated,
          totalReconnects: connectionStats.totalReconnects,
          successfulReconnects: connectionStats.successfulReconnects,
          averageReconnectTime: connectionStats.averageReconnectTime,
          uptime: connectionStats.uptime,
          heartbeatFailures: connectionStats.heartbeatFailures
        };
      }

      // Métricas do ConnectionTester
      if (this.connectionTester) {
        const testStats = this.connectionTester.getStats();
        metrics.systems.connectionTester = {
          totalTests: testStats.totalTests,
          successfulTests: testStats.successfulTests,
          successRate: testStats.successRate,
          averageReconnectTime: testStats.averageReconnectTime,
          isRunning: testStats.isRunning
        };
      }

      // Métricas do sistema (navegador)
      metrics.system = this.collectSystemMetrics();

      // Armazenar métricas
      this.metricsHistory.push(metrics);
      this.stats.totalMetrics++;

      // Limitar histórico
      if (this.metricsHistory.length > this.maxHistorySize) {
        this.metricsHistory.shift();
      }

      // Verificar alertas
      if (this.enableAlerts) {
        this.checkAlerts(metrics);
      }

      // Atualizar estatísticas agregadas
      this.updateAggregatedStats(metrics);

    } catch (error) {
      console.error('❌ Erro ao coletar métricas:', error);
    }
  }

  /**
   * Coleta métricas do sistema (navegador)
   * @returns {Object} Métricas do sistema
   */
  collectSystemMetrics() {
    const metrics = {
      memoryUsage: 0,
      performanceNow: performance.now(),
      userAgent: navigator.userAgent,
      connectionType: navigator.connection?.effectiveType || 'unknown'
    };

    // Tentar obter uso de memória se disponível
    if (performance.memory) {
      metrics.memoryUsage = performance.memory.usedJSHeapSize;
      metrics.totalMemory = performance.memory.totalJSHeapSize;
      metrics.memoryLimit = performance.memory.jsHeapSizeLimit;
    }

    // Métricas de performance
    if (performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        metrics.pageLoadTime = nav.loadEventEnd - nav.loadEventStart;
        metrics.domContentLoaded = nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart;
      }
    }

    return metrics;
  }

  /**
   * Verifica alertas baseados nas métricas
   * @param {Object} metrics - Métricas coletadas
   */
  checkAlerts(metrics) {
    const alerts = [];

    // Alerta de uso de memória
    if (metrics.system.memoryUsage > this.alertThresholds.memoryUsage) {
      alerts.push({
        type: 'memory_usage',
        level: 'warning',
        message: `Uso de memória alto: ${Math.round(metrics.system.memoryUsage / 1024 / 1024)}MB`,
        value: metrics.system.memoryUsage,
        threshold: this.alertThresholds.memoryUsage,
        timestamp: metrics.timestamp
      });
    }

    // Alerta de chunks em memória
    if (metrics.systems.chunkManager?.currentChunksInMemory > this.alertThresholds.chunkCount) {
      alerts.push({
        type: 'chunk_count',
        level: 'warning',
        message: `Muitos chunks em memória: ${metrics.systems.chunkManager.currentChunksInMemory}`,
        value: metrics.systems.chunkManager.currentChunksInMemory,
        threshold: this.alertThresholds.chunkCount,
        timestamp: metrics.timestamp
      });
    }

    // Alerta de tempo de reconexão
    if (metrics.systems.connectionManager?.averageReconnectTime > this.alertThresholds.reconnectTime) {
      alerts.push({
        type: 'reconnect_time',
        level: 'error',
        message: `Tempo de reconexão alto: ${metrics.systems.connectionManager.averageReconnectTime}ms`,
        value: metrics.systems.connectionManager.averageReconnectTime,
        threshold: this.alertThresholds.reconnectTime,
        timestamp: metrics.timestamp
      });
    }

    // Alerta de taxa de compressão baixa
    if (metrics.systems.networkOptimizer?.compressionRatio < this.alertThresholds.compressionRatio) {
      alerts.push({
        type: 'compression_ratio',
        level: 'info',
        message: `Taxa de compressão baixa: ${Math.round(metrics.systems.networkOptimizer.compressionRatio * 100)}%`,
        value: metrics.systems.networkOptimizer.compressionRatio,
        threshold: this.alertThresholds.compressionRatio,
        timestamp: metrics.timestamp
      });
    }

    // Processar alertas
    alerts.forEach(alert => {
      this.processAlert(alert);
    });
  }

  /**
   * Processa um alerta
   * @param {Object} alert - Dados do alerta
   */
  processAlert(alert) {
    this.alerts.push(alert);
    this.stats.alertsTriggered++;

    // Limitar histórico de alertas
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    // Log do alerta
    const logLevel = alert.level === 'error' ? 'error' : 
                    alert.level === 'warning' ? 'warn' : 'log';
    console[logLevel](`🚨 Alerta ${alert.type}: ${alert.message}`);

    // Emitir evento customizado se disponível
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('performanceAlert', {
        detail: alert
      }));
    }
  }

  /**
   * Atualiza estatísticas agregadas
   * @param {Object} metrics - Métricas coletadas
   */
  updateAggregatedStats(metrics) {
    // Atualizar uso médio de memória
    if (metrics.system.memoryUsage > 0) {
      this.stats.averageMemoryUsage = 
        (this.stats.averageMemoryUsage + metrics.system.memoryUsage) / 2;
      
      // Atualizar pico de memória
      if (metrics.system.memoryUsage > this.stats.peakMemoryUsage) {
        this.stats.peakMemoryUsage = metrics.system.memoryUsage;
      }
    }

    // Atualizar latência média
    if (metrics.systems.connectionManager?.averageReconnectTime > 0) {
      this.stats.averageLatency = 
        (this.stats.averageLatency + metrics.systems.connectionManager.averageReconnectTime) / 2;
    }
  }

  /**
   * Obtém métricas atuais
   * @returns {Object} Métricas mais recentes
   */
  getCurrentMetrics() {
    return this.metricsHistory[this.metricsHistory.length - 1] || null;
  }

  /**
   * Obtém histórico de métricas
   * @param {number} limit - Limite de resultados
   * @returns {Array} Histórico de métricas
   */
  getMetricsHistory(limit = 50) {
    return this.metricsHistory.slice(-limit);
  }

  /**
   * Obtém alertas recentes
   * @param {number} limit - Limite de resultados
   * @returns {Array} Alertas recentes
   */
  getRecentAlerts(limit = 20) {
    return this.alerts.slice(-limit);
  }

  /**
   * Obtém estatísticas do monitor
   * @returns {Object} Estatísticas detalhadas
   */
  getStats() {
    const uptime = this.isMonitoring ? Date.now() - this.stats.monitoringUptime : 0;
    
    return {
      ...this.stats,
      isMonitoring: this.isMonitoring,
      uptime: uptime,
      metricsHistorySize: this.metricsHistory.length,
      alertsCount: this.alerts.length,
      alertThresholds: this.alertThresholds,
      config: {
        enableRealTimeMonitoring: this.enableRealTimeMonitoring,
        monitoringInterval: this.monitoringInterval,
        enableAlerts: this.enableAlerts,
        maxHistorySize: this.maxHistorySize
      }
    };
  }

  /**
   * Gera relatório de performance
   * @param {number} timeRange - Período em ms (padrão: última hora)
   * @returns {Object} Relatório detalhado
   */
  generateReport(timeRange = 3600000) { // 1 hora
    const now = Date.now();
    const cutoff = now - timeRange;
    
    const recentMetrics = this.metricsHistory.filter(m => m.timestamp >= cutoff);
    const recentAlerts = this.alerts.filter(a => a.timestamp >= cutoff);

    if (recentMetrics.length === 0) {
      return {
        error: 'Nenhuma métrica encontrada no período especificado',
        timeRange,
        period: {
          start: new Date(cutoff).toISOString(),
          end: new Date(now).toISOString()
        }
      };
    }

    // Calcular estatísticas do período
    const memoryUsages = recentMetrics
      .map(m => m.system?.memoryUsage || 0)
      .filter(usage => usage > 0);
    
    const chunkCounts = recentMetrics
      .map(m => m.systems?.chunkManager?.currentChunksInMemory || 0);
    
    const reconnectTimes = recentMetrics
      .map(m => m.systems?.connectionManager?.averageReconnectTime || 0)
      .filter(time => time > 0);

    return {
      period: {
        start: new Date(cutoff).toISOString(),
        end: new Date(now).toISOString(),
        duration: timeRange
      },
      summary: {
        totalMetrics: recentMetrics.length,
        totalAlerts: recentAlerts.length,
        averageMemoryUsage: memoryUsages.length > 0 ? 
          memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length : 0,
        peakMemoryUsage: memoryUsages.length > 0 ? Math.max(...memoryUsages) : 0,
        averageChunkCount: chunkCounts.length > 0 ? 
          chunkCounts.reduce((sum, count) => sum + count, 0) / chunkCounts.length : 0,
        averageReconnectTime: reconnectTimes.length > 0 ? 
          reconnectTimes.reduce((sum, time) => sum + time, 0) / reconnectTimes.length : 0
      },
      alerts: recentAlerts,
      recommendations: this.generateRecommendations(recentMetrics, recentAlerts)
    };
  }

  /**
   * Gera recomendações baseadas nas métricas
   * @param {Array} metrics - Métricas do período
   * @param {Array} alerts - Alertas do período
   * @returns {Array} Lista de recomendações
   */
  generateRecommendations(metrics, alerts) {
    const recommendations = [];

    // Verificar uso de memória
    const memoryAlerts = alerts.filter(a => a.type === 'memory_usage');
    if (memoryAlerts.length > 0) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'Considere reduzir o número de chunks em memória ou implementar cleanup mais agressivo',
        action: 'Ajustar configurações do ChunkManager'
      });
    }

    // Verificar tempo de reconexão
    const reconnectAlerts = alerts.filter(a => a.type === 'reconnect_time');
    if (reconnectAlerts.length > 0) {
      recommendations.push({
        type: 'connectivity',
        priority: 'medium',
        message: 'Tempos de reconexão altos podem indicar problemas de rede',
        action: 'Verificar configurações de heartbeat e timeout'
      });
    }

    // Verificar taxa de compressão
    const compressionAlerts = alerts.filter(a => a.type === 'compression_ratio');
    if (compressionAlerts.length > 0) {
      recommendations.push({
        type: 'network',
        priority: 'low',
        message: 'Taxa de compressão baixa pode ser melhorada',
        action: 'Revisar configurações de compressão do NetworkOptimizer'
      });
    }

    return recommendations;
  }

  /**
   * Reseta estatísticas e histórico
   */
  resetStats() {
    this.stats = {
      totalMetrics: 0,
      alertsTriggered: 0,
      averageMemoryUsage: 0,
      averageLatency: 0,
      peakMemoryUsage: 0,
      monitoringUptime: 0
    };
    this.metricsHistory = [];
    this.alerts = [];
    console.log('🔄 Estatísticas do monitor resetadas');
  }

  /**
   * Destrói o PerformanceMonitor
   */
  destroy() {
    console.log('🧹 Destruindo PerformanceMonitor...');
    
    this.stopMonitoring();
    this.metricsHistory = [];
    this.alerts = [];
    
    console.log('✅ PerformanceMonitor destruído');
  }
}
