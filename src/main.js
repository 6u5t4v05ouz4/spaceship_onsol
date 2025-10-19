/**
 * Ponto de entrada principal da aplicação SPA
 * Inicializa o roteador e renderiza a aplicação
 */

import { initRouter } from './shared/router.js';

// Aguardar que o DOM esteja pronto
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando Space Crypto Miner Site...');

  // Obter container de renderização
  const app = document.getElementById('app');
  
  if (!app) {
    console.error('❌ Elemento #app não encontrado no HTML!');
    return;
  }

  // Inicializar roteador
  initRouter(app);

  console.log('✅ Roteador inicializado com sucesso!');
});
