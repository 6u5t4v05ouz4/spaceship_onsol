/**
 * ConnectionTester - Sistema de testes para reconexão
 * Valida a robustez do sistema de conexão e reconexão
 * 
 * Features:
 * - Testes automatizados de reconexão
 * - Simulação de falhas de rede
 * - Validação de preservação de estado
 * - Métricas de performance de reconexão
 * - Testes de heartbeat
 */

export default class ConnectionTester {
  constructor(options = {}) {
    // Configurações
    this.enableAutoTests = options.enableAutoTests !== false;
    this.testInterval = options.testInterval || 300000; // 5 minutos
    this.maxTestDuration = options.maxTestDuration || 30000; // 30 segundos
    this.enableStressTests = options.enableStressTests || false;
    
    // Estado interno
    this.isRunning = false;
    this.currentTest = null;
    this.testResults = [];
    this.testTimer = null;
    
    // Referências
    this.connectionManager = null;
    this.socketService = null;
    
    // Estatísticas
    this.stats = {
      totalTests: 0,
      successfulTests: 0,
      failedTests: 0,
      averageReconnectTime: 0,
      averageTestDuration: 0,
      lastTestTime: 0
    };
    
    console.log('🧪 ConnectionTester inicializado:', {
      enableAutoTests: this.enableAutoTests,
      testInterval: this.testInterval
    });
  }

  /**
   * Configura o tester com referências necessárias
   * @param {Object} connectionManager - Instância do ConnectionManager
   * @param {Object} socketService - Serviço de socket
   */
  setup(connectionManager, socketService) {
    this.connectionManager = connectionManager;
    this.socketService = socketService;
    
    console.log('✅ ConnectionTester configurado');
  }

  /**
   * Inicia os testes automáticos
   */
  startAutoTests() {
    if (this.isRunning) {
      console.warn('⚠️ Testes já estão rodando');
      return;
    }

    if (!this.enableAutoTests) {
      console.log('⏸️ Testes automáticos desabilitados');
      return;
    }

    this.isRunning = true;
    console.log('🧪 Iniciando testes automáticos de reconexão...');

    // Executar primeiro teste imediatamente
    this.runReconnectionTest();

    // Configurar timer para testes periódicos
    this.testTimer = setInterval(() => {
      this.runReconnectionTest();
    }, this.testInterval);
  }

  /**
   * Para os testes automáticos
   */
  stopAutoTests() {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.testTimer) {
      clearInterval(this.testTimer);
      this.testTimer = null;
    }

    // Cancelar teste atual se estiver rodando
    if (this.currentTest) {
      this.cancelCurrentTest();
    }

    console.log('⏹️ Testes automáticos parados');
  }

  /**
   * Executa teste de reconexão
   * @param {Object} options - Opções do teste
   * @returns {Promise<Object>} Resultado do teste
   */
  async runReconnectionTest(options = {}) {
    const testOptions = {
      simulateDisconnect: true,
      preserveState: true,
      maxReconnectTime: 15000, // 15 segundos
      ...options
    };

    const testId = `test_${Date.now()}`;
    const startTime = Date.now();
    
    console.log(`🧪 Iniciando teste de reconexão: ${testId}`);

    this.currentTest = {
      id: testId,
      startTime,
      options: testOptions,
      status: 'running'
    };

    try {
      // Verificar pré-condições
      if (!this.connectionManager || !this.socketService) {
        throw new Error('ConnectionManager ou SocketService não configurados');
      }

      if (!this.connectionManager.isConnected) {
        throw new Error('Não conectado - não é possível testar reconexão');
      }

      // Salvar estado inicial
      const initialState = this.captureInitialState();

      // Simular desconexão se solicitado
      if (testOptions.simulateDisconnect) {
        await this.simulateDisconnection();
      }

      // Aguardar reconexão
      const reconnectResult = await this.waitForReconnection(testOptions.maxReconnectTime);

      // Validar estado após reconexão
      const stateValidation = this.validateStatePreservation(initialState);

      // Calcular métricas
      const testDuration = Date.now() - startTime;
      const testResult = {
        id: testId,
        success: reconnectResult.success && stateValidation.success,
        duration: testDuration,
        reconnectTime: reconnectResult.reconnectTime,
        statePreserved: stateValidation.success,
        errors: [...reconnectResult.errors, ...stateValidation.errors],
        timestamp: new Date().toISOString()
      };

      // Atualizar estatísticas
      this.updateStats(testResult);

      // Armazenar resultado
      this.testResults.push(testResult);

      // Limitar histórico de resultados
      if (this.testResults.length > 100) {
        this.testResults.shift();
      }

      console.log(`✅ Teste ${testId} concluído:`, {
        success: testResult.success,
        duration: `${testDuration}ms`,
        reconnectTime: `${testResult.reconnectTime}ms`
      });

      return testResult;

    } catch (error) {
      const testDuration = Date.now() - startTime;
      const testResult = {
        id: testId,
        success: false,
        duration: testDuration,
        reconnectTime: 0,
        statePreserved: false,
        errors: [error.message],
        timestamp: new Date().toISOString()
      };

      this.updateStats(testResult);
      this.testResults.push(testResult);

      console.error(`❌ Teste ${testId} falhou:`, error.message);
      return testResult;

    } finally {
      this.currentTest = null;
    }
  }

  /**
   * Captura estado inicial para validação
   * @returns {Object} Estado inicial
   */
  captureInitialState() {
    return {
      isConnected: this.connectionManager.isConnected,
      isAuthenticated: this.connectionManager.isAuthenticated,
      playerId: this.socketService?.getPlayerId?.() || null,
      username: this.socketService?.getUsername?.() || null,
      currentChunk: this.socketService?.getCurrentChunk?.() || null,
      timestamp: Date.now()
    };
  }

  /**
   * Simula desconexão para teste
   * @returns {Promise<void>}
   */
  async simulateDisconnection() {
    console.log('🔌 Simulando desconexão...');
    
    if (this.socketService && this.socketService.socket) {
      // Desconectar socket
      this.socketService.socket.disconnect();
      
      // Aguardar desconexão ser processada
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * Aguarda reconexão e mede tempo
   * @param {number} maxTime - Tempo máximo para aguardar
   * @returns {Promise<Object>} Resultado da reconexão
   */
  async waitForReconnection(maxTime) {
    const startTime = Date.now();
    const errors = [];

    return new Promise((resolve) => {
      let reconnectTime = 0;
      let success = false;

      // Timeout máximo
      const timeout = setTimeout(() => {
        errors.push('Timeout na reconexão');
        resolve({ success: false, reconnectTime: 0, errors });
      }, maxTime);

      // Verificar reconexão periodicamente
      const checkInterval = setInterval(() => {
        if (this.connectionManager.isConnected && this.connectionManager.isAuthenticated) {
          reconnectTime = Date.now() - startTime;
          success = true;
          
          clearTimeout(timeout);
          clearInterval(checkInterval);
          resolve({ success, reconnectTime, errors });
        }
      }, 100);

      // Listener para eventos de reconexão
      const onReconnect = () => {
        reconnectTime = Date.now() - startTime;
        success = true;
        
        clearTimeout(timeout);
        clearInterval(checkInterval);
        resolve({ success, reconnectTime, errors });
      };

      // Adicionar listener temporário
      if (this.connectionManager.onReconnect) {
        const originalCallback = this.connectionManager.onReconnect;
        this.connectionManager.onReconnect = () => {
          originalCallback();
          onReconnect();
        };
      } else {
        this.connectionManager.onReconnect = onReconnect;
      }
    });
  }

  /**
   * Valida se o estado foi preservado após reconexão
   * @param {Object} initialState - Estado inicial capturado
   * @returns {Object} Resultado da validação
   */
  validateStatePreservation(initialState) {
    const errors = [];
    let success = true;

    try {
      // Verificar conexão
      if (!this.connectionManager.isConnected) {
        errors.push('Não reconectado');
        success = false;
      }

      // Verificar autenticação
      if (!this.connectionManager.isAuthenticated) {
        errors.push('Não reautenticado');
        success = false;
      }

      // Verificar preservação de estado se habilitada
      if (this.connectionManager.preserveState) {
        const currentPlayerId = this.socketService?.getPlayerId?.() || null;
        if (currentPlayerId !== initialState.playerId) {
          errors.push('PlayerId não preservado');
          success = false;
        }

        const currentUsername = this.socketService?.getUsername?.() || null;
        if (currentUsername !== initialState.username) {
          errors.push('Username não preservado');
          success = false;
        }
      }

    } catch (error) {
      errors.push(`Erro na validação: ${error.message}`);
      success = false;
    }

    return { success, errors };
  }

  /**
   * Atualiza estatísticas com resultado do teste
   * @param {Object} testResult - Resultado do teste
   */
  updateStats(testResult) {
    this.stats.totalTests++;
    
    if (testResult.success) {
      this.stats.successfulTests++;
    } else {
      this.stats.failedTests++;
    }

    // Atualizar tempo médio de reconexão
    if (testResult.reconnectTime > 0) {
      this.stats.averageReconnectTime = 
        (this.stats.averageReconnectTime + testResult.reconnectTime) / 2;
    }

    // Atualizar tempo médio de teste
    this.stats.averageTestDuration = 
      (this.stats.averageTestDuration + testResult.duration) / 2;

    this.stats.lastTestTime = Date.now();
  }

  /**
   * Cancela teste atual em execução
   */
  cancelCurrentTest() {
    if (this.currentTest) {
      console.log(`⏹️ Cancelando teste: ${this.currentTest.id}`);
      this.currentTest.status = 'cancelled';
      this.currentTest = null;
    }
  }

  /**
   * Executa teste de stress (múltiplas reconexões)
   * @param {number} iterations - Número de iterações
   * @returns {Promise<Array>} Resultados dos testes
   */
  async runStressTest(iterations = 5) {
    if (!this.enableStressTests) {
      console.log('⏸️ Testes de stress desabilitados');
      return [];
    }

    console.log(`🧪 Iniciando teste de stress com ${iterations} iterações...`);
    
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      console.log(`🧪 Executando iteração ${i + 1}/${iterations}`);
      
      const result = await this.runReconnectionTest({
        simulateDisconnect: true,
        maxReconnectTime: 10000 // 10 segundos para stress test
      });
      
      results.push(result);
      
      // Aguardar entre iterações
      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`✅ Teste de stress concluído:`, {
      totalTests: results.length,
      successful: results.filter(r => r.success).length,
      averageReconnectTime: results.reduce((sum, r) => sum + r.reconnectTime, 0) / results.length
    });

    return results;
  }

  /**
   * Obtém estatísticas dos testes
   * @returns {Object} Estatísticas detalhadas
   */
  getStats() {
    const recentTests = this.testResults.slice(-10); // Últimos 10 testes
    const successRate = this.stats.totalTests > 0 ? 
      (this.stats.successfulTests / this.stats.totalTests) * 100 : 0;

    return {
      ...this.stats,
      successRate: Math.round(successRate * 100) / 100,
      recentTests: recentTests.length,
      isRunning: this.isRunning,
      currentTest: this.currentTest?.id || null,
      config: {
        enableAutoTests: this.enableAutoTests,
        testInterval: this.testInterval,
        enableStressTests: this.enableStressTests
      }
    };
  }

  /**
   * Obtém histórico de testes
   * @param {number} limit - Limite de resultados
   * @returns {Array} Histórico de testes
   */
  getTestHistory(limit = 20) {
    return this.testResults.slice(-limit);
  }

  /**
   * Reseta estatísticas e histórico
   */
  resetStats() {
    this.stats = {
      totalTests: 0,
      successfulTests: 0,
      failedTests: 0,
      averageReconnectTime: 0,
      averageTestDuration: 0,
      lastTestTime: 0
    };
    this.testResults = [];
    console.log('🔄 Estatísticas de teste resetadas');
  }

  /**
   * Destrói o ConnectionTester
   */
  destroy() {
    console.log('🧹 Destruindo ConnectionTester...');
    
    this.stopAutoTests();
    this.testResults = [];
    this.currentTest = null;
    
    console.log('✅ ConnectionTester destruído');
  }
}
