// Game-only entry point - Loads only the Phaser game without web interface
import './styles.css';
import { Analytics } from '@vercel/analytics/react';

// Import game scenes
import GameScene from './scenes/GameScene.js';
import MenuScene from './scenes/MenuScene.js';
import ConfigScene from './scenes/ConfigScene.js';

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
    scene: [MenuScene, GameScene, ConfigScene],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

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
    
    // Create Phaser game instance
    const game = new Phaser.Game(config);
    
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
    Analytics();
    
    console.log('✅ Jogo inicializado com sucesso!');
    
    // Fallback: Hide loading after 3 seconds regardless
    setTimeout(() => {
        hideLoading();
        console.log('⏰ Loading screen hidden by timeout');
    }, 3000);
    
} catch (error) {
    console.error('❌ Erro ao inicializar o jogo:', error);
    showError('Falha na inicialização do jogo');
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
