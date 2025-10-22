#!/usr/bin/env node

/**
 * Script de Configuração Railway Redis
 * Facilita a configuração das variáveis do Railway
 */

import fs from 'fs';
import readline from 'readline';

console.log('🚀 Configuração Railway Redis');
console.log('============================\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('📋 Para configurar o Redis do Railway, você precisa:');
  console.log('1. Ir ao Railway Dashboard');
  console.log('2. Selecionar seu projeto');
  console.log('3. Ir em "Variables"');
  console.log('4. Copiar as variáveis do Redis\n');

  console.log('🔍 Procure por variáveis como:');
  console.log('- REDIS_URL');
  console.log('- REDIS_HOST');
  console.log('- REDIS_PORT');
  console.log('- REDIS_PASSWORD\n');

  const redisUrl = await question('🔗 Cole aqui o REDIS_URL (ou pressione Enter para pular): ');
  const redisHost = await question('🏠 Cole aqui o REDIS_HOST (ou pressione Enter para pular): ');
  const redisPort = await question('🔌 Cole aqui o REDIS_PORT (ou pressione Enter para pular): ');
  const redisPassword = await question('🔐 Cole aqui o REDIS_PASSWORD (ou pressione Enter para pular): ');

  // Criar arquivo .env
  let envContent = `# Configurações Railway Redis
# Gerado automaticamente pelo setup-railway.js

`;

  if (redisUrl) {
    envContent += `REDIS_URL=${redisUrl}\n`;
  }

  if (redisHost) {
    envContent += `REDIS_HOST=${redisHost}\n`;
  }

  if (redisPort) {
    envContent += `REDIS_PORT=${redisPort}\n`;
  }

  if (redisPassword) {
    envContent += `REDIS_PASSWORD=${redisPassword}\n`;
  }

  envContent += `
# Cluster Configuration
INSTANCE_ID=railway-instance-1
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

  try {
    fs.writeFileSync('.env', envContent);
    console.log('\n✅ Arquivo .env criado com sucesso!');
    console.log('📁 Localização: .env');
    
    console.log('\n🚀 Próximos passos:');
    console.log('1. npm run start:dev');
    console.log('2. Verificar logs para "✅ RedisManager conectado ao Redis"');
    console.log('3. npm run test-load:small');
    
  } catch (error) {
    console.error('❌ Erro ao criar arquivo .env:', error.message);
  }

  rl.close();
}

main().catch(console.error);
