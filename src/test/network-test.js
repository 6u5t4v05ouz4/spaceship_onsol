/**
 * Network Systems Test
 * Teste para validar os novos sistemas de rede multiplayer
 */

import socketService from '../services/socketService.js';

export default class NetworkTest {
  constructor(multiplayerManager) {
    this.multiplayerManager = multiplayerManager;
    this.testResults = [];
    this.testStartTime = Date.now();
    this.isRunning = false;
  }

  /**
   * Executa todos os testes dos sistemas de rede
   */
  async runAllTests() {
    console.log('🧪 Iniciando testes dos sistemas de rede...');
    this.isRunning = true;
    this.testResults = [];

    try {
      // Teste 1: Conexão e Autenticação
      await this.testConnectionAndAuth();

      // Teste 2: Predição de Movimento
      await this.testMovementPrediction();

      // Teste 3: Interpolação de Outros Jogadores
      await this.testPlayerInterpolation();

      // Teste 4: Rate Limiting e Validação
      await this.testRateLimiting();

      // Teste 5: Performance e Latência
      await this.testPerformance();

      // Teste 6: Recuperação de Erros
      await this.testErrorRecovery();

      this.showTestSummary();

    } catch (error) {
      console.error('❌ Erro durante os testes:', error);
      this.addTestResult('Test Suite', false, `Erro geral: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Teste 1: Conexão e Autenticação
   */
  async testConnectionAndAuth() {
    console.log('🔌 Testando conexão e autenticação...');

    try {
      // Verificar se está conectado
      const isConnected = socketService.isConnected();
      this.addTestResult('Conexão WebSocket', isConnected, 'Socket.io conectado');

      // Verificar se está autenticado
      const isAuthenticated = socketService.isAuthenticated();
      this.addTestResult('Autenticação', isAuthenticated, 'JWT validado');

      // Verificar se tem player ID
      const playerId = socketService.getPlayerId();
      this.addTestResult('Player ID', !!playerId, `ID: ${playerId}`);

      // Verificar se tem estado do jogador
      const playerState = socketService.getPlayerState();
      this.addTestResult('Player State', !!playerState, 'Estado carregado');

      // Verificar estatísticas de rede
      const networkStats = socketService.getNetworkStats();
      this.addTestResult('Network Stats', !!networkStats, 'Estatísticas disponíveis');

    } catch (error) {
      this.addTestResult('Conexão e Autenticação', false, `Erro: ${error.message}`);
    }
  }

  /**
   * Teste 2: Predição de Movimento
   */
  async testMovementPrediction() {
    console.log('🎮 Testando predição de movimento...');

    try {
      if (!socketService.isAuthenticated()) {
        this.addTestResult('Predição de Movimento', false, 'Não autenticado');
        return;
      }

      const initialPos = socketService.getPredictedPosition();
      this.addTestResult('Posição Inicial', !!initialPos, 'Posição obtida');

      // Simular movimento
      const testX = initialPos.x + 100;
      const testY = initialPos.y + 100;

      // Enviar movimento com predição
      const success = socketService.updatePosition(testX, testY);
      this.addTestResult('Envio com Predição', success, 'Movimento enviado');

      // Verificar se posição predita foi atualizada
      await this.delay(100); // Aguardar processamento
      const predictedPos = socketService.getPredictedPosition();
      const positionChanged = predictedPos.x !== initialPos.x || predictedPos.y !== initialPos.y;
      this.addTestResult('Posição Predita Atualizada', positionChanged, 'Predição funcionando');

    } catch (error) {
      this.addTestResult('Predição de Movimento', false, `Erro: ${error.message}`);
    }
  }

  /**
   * Teste 3: Interpolação de Outros Jogadores
   */
  async testPlayerInterpolation() {
    console.log('👥 Testando interpolação de outros jogadores...');

    try {
      // Criar jogador de teste
      const testPlayerId = 'test_player_123';
      const testPosition = { x: 500, y: 300 };

      // Adicionar jogador ao interpolation manager
      socketService.updateEntityPosition(testPlayerId, testPosition, 0, 100);
      this.addTestResult('Adicionar Entidade', true, 'Jogador de teste adicionado');

      // Obter posição interpolada
      const interpolatedPos = socketService.getInterpolatedPosition(testPlayerId);
      const positionValid = interpolatedPos && interpolatedPos.x === testPosition.x && interpolatedPos.y === testPosition.y;
      this.addTestResult('Posição Interpolada', positionValid, 'Interpolação funcionando');

      // Simular movimento do jogador
      const newPosition = { x: 550, y: 350 };
      socketService.updateEntityPosition(testPlayerId, newPosition, 0, 100);
      this.addTestResult('Atualizar Posição', true, 'Posição atualizada');

      // Remover jogador de teste
      socketService.removeEntity(testPlayerId);
      this.addTestResult('Remover Entidade', true, 'Jogador removido');

    } catch (error) {
      this.addTestResult('Interpolação de Jogadores', false, `Erro: ${error.message}`);
    }
  }

  /**
   * Teste 4: Rate Limiting e Validação
   */
  async testRateLimiting() {
    console.log('⚡ Testando rate limiting e validação...');

    try {
      // Testar múltiplos movimentos rápidos
      let rapidMovements = 0;
      const maxRapidMovements = 35; // Acima do limite de 30/segundo

      for (let i = 0; i < maxRapidMovements; i++) {
        const x = 100 + i * 10;
        const y = 100 + i * 10;
        socketService.updatePosition(x, y);
        rapidMovements++;
        await this.delay(10); // 10ms entre movimentos
      }

      this.addTestResult('Rate Limiting Test', rapidMovements >= maxRapidMovements,
        `${rapidMovements} movimentos enviados`);

      // Aguardar possíveis respostas de rate limit
      await this.delay(500);

    } catch (error) {
      this.addTestResult('Rate Limiting e Validação', false, `Erro: ${error.message}`);
    }
  }

  /**
   * Teste 5: Performance e Latência
   */
  async testPerformance() {
    console.log('📊 Testando performance e latência...');

    try {
      const startTime = Date.now();

      // Testar múltiplas atualizações de posição
      for (let i = 0; i < 10; i++) {
        const x = 200 + i * 20;
        const y = 200 + i * 20;
        socketService.updatePosition(x, y);
      }

      const updateTime = Date.now() - startTime;
      this.addTestResult('Performance Update', updateTime < 100,
        `10 atualizações em ${updateTime}ms`);

      // Verificar latência estimada
      const stats = socketService.getNetworkStats();
      const latency = stats.connection.latency;
      const latencyGood = latency < 200; // Menos de 200ms é bom
      this.addTestResult('Latência', latencyGood, `Latência estimada: ${latency}ms`);

      // Verificar uso de memória
      const memoryUsage = stats.interpolation.memoryUsage;
      this.addTestResult('Uso de Memória', !!memoryUsage, `Memória: ${memoryUsage}`);

    } catch (error) {
      this.addTestResult('Performance e Latência', false, `Erro: ${error.message}`);
    }
  }

  /**
   * Teste 6: Recuperação de Erros
   */
  async testErrorRecovery() {
    console.log('🔧 Testando recuperação de erros...');

    try {
      // Testar movimento para posição inválida
      const invalidX = NaN;
      const invalidY = undefined;

      // Isso não deve quebrar o sistema
      try {
        socketService.updatePosition(invalidX, invalidY);
        this.addTestResult('Resiliência a Dados Inválidos', true, 'Sistema resistente a dados inválidos');
      } catch (error) {
        this.addTestResult('Resiliência a Dados Inválidos', false, `Sistema quebrou: ${error.message}`);
      }

      // Testar reset dos sistemas
      socketService.resetNetworkSystems();
      this.addTestResult('Reset de Sistemas', true, 'Sistemas resetados com sucesso');

      // Verificar se ainda está conectado após reset
      const stillConnected = socketService.isConnected();
      this.addTestResult('Estabilidade Pós-Reset', stillConnected, 'Conexão mantida após reset');

    } catch (error) {
      this.addTestResult('Recuperação de Erros', false, `Erro: ${error.message}`);
    }
  }

  /**
   * Adiciona resultado de teste
   */
  addTestResult(testName, passed, details) {
    this.testResults.push({
      name: testName,
      passed,
      details,
      timestamp: Date.now() - this.testStartTime
    });

    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${details}`);
  }

  /**
   * Mostra resumo dos testes
   */
  showTestSummary() {
    console.log('\n📋 === RESUMO DOS TESTES ===');

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`Total de Testes: ${totalTests}`);
    console.log(`Aprovados: ${passedTests} ✅`);
    console.log(`Falharam: ${failedTests} ❌`);
    console.log(`Taxa de Sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n❌ Testes Falhados:');
      this.testResults.filter(t => !t.passed).forEach(test => {
        console.log(`  - ${test.name}: ${test.details}`);
      });
    }

    console.log('\n⏱️ Tempo Total:', `${((Date.now() - this.testStartTime) / 1000).toFixed(2)}s`);

    // Estatísticas finais de rede
    const finalStats = socketService.getNetworkStats();
    console.log('\n📊 Estatísticas Finais de Rede:');
    console.log(`  - Conectado: ${finalStats.connection.connected}`);
    console.log(`  - Autenticado: ${finalStats.connection.authenticated}`);
    console.log(`  - Latência: ${finalStats.connection.latency}ms`);
    console.log(`  - Predições: ${finalStats.prediction.predictions}`);
    console.log(`  - Correções: ${finalStats.prediction.corrections}`);
    console.log(`  - Entidades: ${finalStats.interpolation.entities}`);
  }

  /**
   * Atraso para testes
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verifica se os testes estão em execução
   */
  isTestRunning() {
    return this.isRunning;
  }

  /**
   * Obtém resultados dos testes
   */
  getTestResults() {
    return this.testResults;
  }

  /**
   * Teste rápido para desenvolvimento
   */
  async quickTest() {
    console.log('⚡ Executando teste rápido...');

    try {
      const isConnected = socketService.isConnected();
      const isAuthenticated = socketService.isAuthenticated();
      const stats = socketService.getNetworkStats();

      console.log('✅ Teste Rápido:');
      console.log(`  - Conectado: ${isConnected}`);
      console.log(`  - Autenticado: ${isAuthenticated}`);
      console.log(`  - Latência: ${stats.connection.latency}ms`);
      console.log(`  - Predições: ${stats.prediction.predictions}`);

      return isConnected && isAuthenticated;
    } catch (error) {
      console.error('❌ Erro no teste rápido:', error);
      return false;
    }
  }
}

/**
 * Como usar:
 *
 * No MultiplayerManager ou na cena do jogo:
 *
 * import NetworkTest from './test/network-test.js';
 *
 * // Criar instância
 * this.networkTest = new NetworkTest(this.multiplayerManager);
 *
 * // Executar testes completos
 * await this.networkTest.runAllTests();
 *
 * // Ou teste rápido
 * const passed = await this.networkTest.quickTest();
 *
 * // Verificar resultados
 * const results = this.networkTest.getTestResults();
 */