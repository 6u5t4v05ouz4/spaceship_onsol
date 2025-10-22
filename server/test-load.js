#!/usr/bin/env node

/**
 * Script para executar testes de carga da Fase 2
 * 
 * Uso:
 * node test-load.js [opções]
 * 
 * Opções:
 * --players <número>     Número máximo de jogadores simultâneos (padrão: 100)
 * --duration <segundos>  Duração do teste em segundos (padrão: 60)
 * --server <url>         URL do servidor (padrão: http://localhost:3000)
 * --ramp-up <segundos>   Tempo de ramp up em segundos (padrão: 10)
 * --ramp-down <segundos> Tempo de ramp down em segundos (padrão: 10)
 * --help                 Mostra esta ajuda
 */

import LoadTester from './load-tester.js';
import { performance } from 'perf_hooks';

// Parse argumentos da linha de comando
const args = process.argv.slice(2);
const options = {
  players: 100,
  duration: 60,
  server: 'http://localhost:3000',
  rampUp: 10,
  rampDown: 10
};

// Processar argumentos
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  switch (arg) {
    case '--players':
      options.players = parseInt(args[++i]) || 100;
      break;
    case '--duration':
      options.duration = parseInt(args[++i]) || 60;
      break;
    case '--server':
      options.server = args[++i] || 'http://localhost:3000';
      break;
    case '--ramp-up':
      options.rampUp = parseInt(args[++i]) || 10;
      break;
    case '--ramp-down':
      options.rampDown = parseInt(args[++i]) || 10;
      break;
    case '--help':
      console.log(`
🧪 Teste de Carga - Fase 2: Escalabilidade

Uso: node test-load.js [opções]

Opções:
  --players <número>     Número máximo de jogadores simultâneos (padrão: 100)
  --duration <segundos>  Duração do teste em segundos (padrão: 60)
  --server <url>         URL do servidor (padrão: http://localhost:3000)
  --ramp-up <segundos>   Tempo de ramp up em segundos (padrão: 10)
  --ramp-down <segundos> Tempo de ramp down em segundos (padrão: 10)
  --help                 Mostra esta ajuda

Exemplos:
  node test-load.js --players 50 --duration 30
  node test-load.js --server http://localhost:3001 --players 200
  node test-load.js --ramp-up 5 --ramp-down 5 --duration 120
      `);
      process.exit(0);
      break;
    default:
      if (arg.startsWith('--')) {
        console.warn(`⚠️ Opção desconhecida: ${arg}`);
      }
      break;
  }
}

// Configurar LoadTester
const loadTester = new LoadTester({
  serverUrl: options.server,
  maxConcurrentPlayers: options.players,
  testDuration: options.duration * 1000,
  rampUpTime: options.rampUp * 1000,
  rampDownTime: options.rampDown * 1000,
  movementInterval: 100,
  chunkChangeInterval: 5000,
  
  onTestStart: () => {
    console.log('🚀 Teste de carga iniciado!');
    console.log(`📊 Configuração:`);
    console.log(`   Servidor: ${options.server}`);
    console.log(`   Jogadores: ${options.players}`);
    console.log(`   Duração: ${options.duration}s`);
    console.log(`   Ramp Up: ${options.rampUp}s`);
    console.log(`   Ramp Down: ${options.rampDown}s`);
    console.log('');
  },
  
  onTestEnd: (results) => {
    console.log('\n🏁 Teste de carga concluído!');
    console.log('\n📊 RESULTADOS:');
    console.log('═══════════════════════════════════════');
    
    // Resumo
    console.log('\n📈 RESUMO:');
    console.log(`   Duração total: ${Math.round(results.summary.testDuration / 1000)}s`);
    console.log(`   Jogadores criados: ${results.summary.totalPlayers}`);
    console.log(`   Conexões bem-sucedidas: ${results.summary.successfulConnections}`);
    console.log(`   Taxa de sucesso: ${results.summary.successRate}%`);
    console.log(`   Movimentos totais: ${results.summary.totalMovements}`);
    console.log(`   Mudanças de chunk: ${results.summary.totalChunkChanges}`);
    console.log(`   Erros: ${results.summary.errors}`);
    console.log(`   Desconexões: ${results.summary.disconnections}`);
    
    // Performance
    console.log('\n⚡ PERFORMANCE:');
    console.log(`   Jogadores/segundo: ${results.performance.playersPerSecond}`);
    console.log(`   Movimentos/segundo: ${results.performance.movementsPerSecond}`);
    console.log(`   Mudanças de chunk/segundo: ${results.performance.chunkChangesPerSecond}`);
    console.log(`   Latência média: ${results.performance.averageLatency}ms`);
    console.log(`   Latência mínima: ${results.performance.minLatency}ms`);
    console.log(`   Latência máxima: ${results.performance.peakLatency}ms`);
    console.log(`   Taxa de erro: ${results.performance.errorRate}%`);
    
    // Análise
    console.log('\n🔍 ANÁLISE:');
    if (results.summary.successRate >= 95) {
      console.log('   ✅ Taxa de sucesso excelente (≥95%)');
    } else if (results.summary.successRate >= 90) {
      console.log('   ⚠️ Taxa de sucesso boa (≥90%)');
    } else {
      console.log('   ❌ Taxa de sucesso baixa (<90%)');
    }
    
    if (results.performance.averageLatency <= 100) {
      console.log('   ✅ Latência excelente (≤100ms)');
    } else if (results.performance.averageLatency <= 200) {
      console.log('   ⚠️ Latência aceitável (≤200ms)');
    } else {
      console.log('   ❌ Latência alta (>200ms)');
    }
    
    if (results.performance.errorRate <= 1) {
      console.log('   ✅ Taxa de erro baixa (≤1%)');
    } else if (results.performance.errorRate <= 5) {
      console.log('   ⚠️ Taxa de erro moderada (≤5%)');
    } else {
      console.log('   ❌ Taxa de erro alta (>5%)');
    }
    
    console.log('\n═══════════════════════════════════════');
    
    // Salvar resultados em arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `load-test-results-${timestamp}.json`;
    
    try {
      const fs = await import('fs');
      fs.writeFileSync(filename, JSON.stringify(results, null, 2));
      console.log(`\n💾 Resultados salvos em: ${filename}`);
    } catch (error) {
      console.warn('⚠️ Não foi possível salvar os resultados:', error.message);
    }
  },
  
  onPlayerConnect: (playerId) => {
    const stats = loadTester.getCurrentStats();
    if (stats.currentConnectedPlayers % 10 === 0) {
      console.log(`👤 ${stats.currentConnectedPlayers}/${options.players} jogadores conectados`);
    }
  },
  
  onPlayerDisconnect: (playerId, reason) => {
    // Log apenas desconexões inesperadas
    if (reason !== 'io client disconnect') {
      console.log(`👋 Jogador ${playerId} desconectou: ${reason}`);
    }
  },
  
  onError: (error) => {
    console.error('❌ Erro durante o teste:', error.message);
  }
});

// Handler para interrupção
process.on('SIGINT', async () => {
  console.log('\n⏹️ Interrompendo teste de carga...');
  await loadTester.stopLoadTest();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏹️ Finalizando teste de carga...');
  await loadTester.stopLoadTest();
  process.exit(0);
});

// Executar teste
async function runLoadTest() {
  try {
    console.log('🧪 Iniciando teste de carga da Fase 2...');
    console.log('   Pressione Ctrl+C para interromper\n');
    
    const success = await loadTester.startLoadTest();
    
    if (success) {
      console.log('✅ Teste de carga executado com sucesso');
    } else {
      console.log('❌ Teste de carga falhou');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Erro fatal no teste de carga:', error);
    process.exit(1);
  }
}

// Executar
runLoadTest();
