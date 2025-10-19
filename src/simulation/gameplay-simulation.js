// Simulação de gameplay para a página inicial
import GameplaySimulation from './GameplaySimulation.js';

// Configuração do Phaser para a simulação
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#001133', // Fundo azul escuro brilhante
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [GameplaySimulation],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        fullscreenTarget: 'simulation-container'
    },
    parent: 'simulation-container'
};

// Inicializa a simulação quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Iniciando simulação de gameplay...');
    
    // Cria container para a simulação
    const simulationContainer = document.createElement('div');
    simulationContainer.id = 'simulation-container';
    simulationContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1;
        pointer-events: none;
        overflow: hidden;
    `;
    document.body.appendChild(simulationContainer);
    
    try {
        // Cria instância do Phaser
        const game = new Phaser.Game(config);
        
        // Armazena referência globalmente para controle
        window.gameplaySimulation = game;
        
        console.log('✅ Simulação de gameplay iniciada com sucesso!');
        
        // Handle resize
        window.addEventListener('resize', () => {
            game.scale.resize(window.innerWidth, window.innerHeight);
        });
        
        // Garante que o canvas ocupe toda a tela após o jogo carregar
        game.events.once('ready', () => {
            const canvas = game.canvas;
            if (canvas) {
                canvas.style.width = '100vw';
                canvas.style.height = '100vh';
                canvas.style.display = 'block';
                canvas.style.position = 'absolute';
                canvas.style.top = '0';
                canvas.style.left = '0';
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao inicializar simulação:', error);
    }
});

// Função para pausar/retomar simulação
window.pauseSimulation = function() {
    if (window.gameplaySimulation) {
        const scene = window.gameplaySimulation.scene.getScene('GameplaySimulation');
        if (scene) {
            scene.pauseSimulation();
        }
    }
};

window.resumeSimulation = function() {
    if (window.gameplaySimulation) {
        const scene = window.gameplaySimulation.scene.getScene('GameplaySimulation');
        if (scene) {
            scene.resumeSimulation();
        }
    }
};

// Função para destruir simulação
window.destroySimulation = function() {
    if (window.gameplaySimulation) {
        const scene = window.gameplaySimulation.scene.getScene('GameplaySimulation');
        if (scene) {
            scene.destroySimulation();
        }
        window.gameplaySimulation.destroy(true);
        window.gameplaySimulation = null;
        
        // Remove container
        const container = document.getElementById('simulation-container');
        if (container) {
            container.remove();
        }
    }
};
