// Game-only entry point - Loads only the Phaser game without web interface
// CSS será carregado via link no HTML
// import { inject } from '@vercel/analytics';

// Import game scenes - GAMEPLAY COMPLETO MODULARIZADO
import GameSceneModular from './scenes/GameSceneModular.js';
import MenuSceneSimple from './scenes/MenuSceneSimple.js';

// Debug logging
console.log('🔍 game-only.js carregado');
console.log('🔍 GameSceneModular:', GameSceneModular);
console.log('🔍 MenuSceneSimple:', MenuSceneSimple);

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [MenuSceneSimple, GameSceneModular],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Initialize Speed Insights
function initializeSpeedInsights() {
    try {
        const script = document.createElement('script');
        script.src = 'https://vercel.com/speed-insights/script.js';
        script.defer = true;
        document.head.appendChild(script);
        console.log('📊 Speed Insights initialized');
    } catch (error) {
        console.warn('⚠️ Failed to initialize Speed Insights:', error);
    }
}

// Hide loading screen
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    const error = document.getElementById('error');
    const loading = document.getElementById('loading');
    
    if (loading) loading.style.display = 'none';
    if (error) {
        error.style.display = 'block';
        error.textContent = `Erro: ${message}`;
    }
}

// Initialize game
try {
    console.log('🚀 Iniciando Space Crypto Miner...');
    console.log('🔍 Configuração:', config);
    
    // Teste cada import individualmente
    console.log('🔍 Testando imports...');
    console.log('🔍 GameSceneModular:', typeof GameSceneModular);
    console.log('🔍 MenuScene:', typeof MenuScene);
    console.log('🔍 ConfigScene:', typeof ConfigScene);
    
    // Create Phaser game instance
    console.log('🔍 Criando instância do Phaser...');
    const game = new Phaser.Game(config);
    console.log('🔍 Instância criada:', game);
    
    // Hide loading when game starts
    game.events.once('boot', () => {
        console.log('🎮 Game booted');
        hideLoading();
    });
    
    // Alternative: Hide loading when first scene starts
    game.events.once('scenecreate', () => {
        console.log('🎬 First scene created');
        hideLoading();
    });
    
    // Force hide loading after 1 second
    setTimeout(() => {
        console.log('⏰ Force hiding loading screen');
        hideLoading();
    }, 1000);
    
    // Handle resize
    window.addEventListener('resize', () => {
        game.scale.resize(window.innerWidth, window.innerHeight);
    });
    
    // Handle errors
    game.events.on('error', (error) => {
        console.error('Game error:', error);
        showError('Erro ao carregar o jogo');
    });
    
    // Make game globally accessible for debugging
    window.game = game;
    
    // Initialize Vercel Analytics
    // inject();
    
    // Initialize Vercel Speed Insights
    initializeSpeedInsights();
    
    console.log('✅ Jogo inicializado com sucesso!');
    
    // Fallback: Hide loading after 3 seconds regardless
    setTimeout(() => {
        hideLoading();
        console.log('⏰ Loading screen hidden by timeout');
    }, 3000);
    
} catch (error) {
    console.error('❌ Erro ao inicializar o jogo:', error);
    console.error('❌ Stack trace:', error.stack);
    showError('Falha na inicialização: ' + error.message);
}

// Handle uncaught errors
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    showError('Erro inesperado no jogo');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showError('Erro de promise não tratada');
});
