#!/usr/bin/env node

/**
 * Script de Setup do Redis
 * Facilita a configuração do Redis para desenvolvimento e produção
 */

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🔧 Setup do Redis - Space Crypto Miner');
console.log('=====================================\n');

// Verificar se Docker está disponível
function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Verificar se Redis está rodando localmente
function checkRedisLocal() {
  try {
    execSync('redis-cli ping', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Criar arquivo .env se não existir
function createEnvFile() {
  const envPath = '.env';
  
  if (!fs.existsSync(envPath)) {
    const envContent = `# Configurações de Desenvolvimento Local
# Gerado automaticamente pelo setup-redis.js

# Redis Local (desenvolvimento)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Cluster Configuration
INSTANCE_ID=dev-instance-1
HOST=localhost
PORT=3001
MAX_PLAYERS_PER_INSTANCE=100

# Load Balancer Configuration
LOAD_BALANCER_ALGORITHM=least-connections

# Performance Monitoring
ENABLE_ADVANCED_METRICS=true
METRICS_INTERVAL=5000
ENABLE_ALERTS=true

# Development/Testing
ENABLE_FALLBACK=true
ENABLE_AUTO_TESTS=false
ENABLE_STRESS_TESTS=false
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env criado');
    return true;
  } else {
    console.log('ℹ️ Arquivo .env já existe');
    return false;
  }
}

// Iniciar Redis com Docker
function startRedisDocker() {
  try {
    console.log('🐳 Iniciando Redis com Docker...');
    execSync('docker run -d -p 6379:6379 --name redis-local redis:alpine', { stdio: 'inherit' });
    console.log('✅ Redis iniciado com Docker');
    return true;
  } catch (error) {
    console.error('❌ Erro ao iniciar Redis com Docker:', error.message);
    return false;
  }
}

// Parar Redis Docker
function stopRedisDocker() {
  try {
    console.log('🛑 Parando Redis Docker...');
    execSync('docker stop redis-local', { stdio: 'inherit' });
    execSync('docker rm redis-local', { stdio: 'inherit' });
    console.log('✅ Redis Docker parado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao parar Redis Docker:', error.message);
    return false;
  }
}

// Testar conexão Redis
function testRedisConnection() {
  try {
    console.log('🧪 Testando conexão Redis...');
    execSync('redis-cli ping', { stdio: 'inherit' });
    console.log('✅ Redis funcionando!');
    return true;
  } catch (error) {
    console.error('❌ Redis não está respondendo:', error.message);
    return false;
  }
}

// Menu principal
function showMenu() {
  console.log('\n📋 Opções disponíveis:');
  console.log('1. 🐳 Iniciar Redis com Docker');
  console.log('2. 🛑 Parar Redis Docker');
  console.log('3. 🧪 Testar conexão Redis');
  console.log('4. 📝 Criar arquivo .env');
  console.log('5. 🚀 Iniciar servidor de desenvolvimento');
  console.log('6. 🧪 Executar teste de carga');
  console.log('7. ❌ Sair');
  console.log('\nEscolha uma opção (1-7):');
}

// Executar opção
function executeOption(option) {
  switch (option) {
    case '1':
      if (checkDocker()) {
        startRedisDocker();
      } else {
        console.log('❌ Docker não está instalado. Instale o Docker Desktop primeiro.');
      }
      break;
      
    case '2':
      stopRedisDocker();
      break;
      
    case '3':
      testRedisConnection();
      break;
      
    case '4':
      createEnvFile();
      break;
      
    case '5':
      console.log('🚀 Iniciando servidor de desenvolvimento...');
      execSync('npm start', { stdio: 'inherit' });
      break;
      
    case '6':
      console.log('🧪 Executando teste de carga...');
      execSync('npm run test-load:small', { stdio: 'inherit' });
      break;
      
    case '7':
      console.log('👋 Até logo!');
      process.exit(0);
      break;
      
    default:
      console.log('❌ Opção inválida');
  }
}

// Função principal
async function main() {
  console.log('🔍 Verificando ambiente...');
  
  const hasDocker = checkDocker();
  const hasRedisLocal = checkRedisLocal();
  
  console.log(`Docker: ${hasDocker ? '✅' : '❌'}`);
  console.log(`Redis Local: ${hasRedisLocal ? '✅' : '❌'}`);
  
  if (!hasRedisLocal && hasDocker) {
    console.log('\n💡 Recomendação: Inicie o Redis com Docker (opção 1)');
  } else if (!hasRedisLocal && !hasDocker) {
    console.log('\n💡 Recomendação: Instale o Docker Desktop ou Redis localmente');
  }
  
  // Criar .env se não existir
  createEnvFile();
  
  // Mostrar menu
  showMenu();
  
  // Aguardar input do usuário
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (data) => {
    const option = data.trim();
    executeOption(option);
    
    // Mostrar menu novamente após execução
    setTimeout(() => {
      showMenu();
    }, 1000);
  });
}

// Executar
main().catch(console.error);
