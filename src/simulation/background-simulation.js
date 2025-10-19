// =====================================================
// SPACE CRYPTO MINER - SIMULAÇÃO DE BACKGROUND
// =====================================================

// Importar a simulação de gameplay
import GameplaySimulation from './GameplaySimulation.js';

// Configuração do Phaser para simulação de background
const simulationConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 'transparent',
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
    parent: 'simulation-container',
    render: {
        antialias: false,
        pixelArt: false
    }
};

// Classe para gerenciar a simulação de background
class BackgroundSimulation {
    constructor() {
        this.game = null;
        this.isActive = false;
        this.isPaused = false;
        this.container = null;
        this.controls = null;
    }

    // Inicializar simulação
    init() {
        console.log('🎮 Inicializando simulação de background...');
        
        // Criar container se não existir
        this.createContainer();
        
        // Criar controles
        this.createControls();
        
        // Inicializar Phaser
        this.initPhaser();
        
        console.log('✅ Simulação de background inicializada');
    }

    // Criar container da simulação
    createContainer() {
        // Verificar se já existe
        this.container = document.getElementById('simulation-container');
        if (this.container) {
            return;
        }

        // Criar novo container
        this.container = document.createElement('div');
        this.container.id = 'simulation-container';
        this.container.className = 'simulation-container';
        
        // Adicionar ao body
        document.body.appendChild(this.container);
        
        console.log('📦 Container da simulação criado');
    }

    // Criar controles da simulação
    createControls() {
        // Verificar se já existe
        this.controls = document.getElementById('simulation-controls');
        if (this.controls) {
            return;
        }

        // Criar controles
        this.controls = document.createElement('div');
        this.controls.id = 'simulation-controls';
        this.controls.className = 'simulation-controls';
        
        this.controls.innerHTML = `
            <button class="simulation-control-btn" onclick="window.backgroundSimulation.togglePause()" title="Pausar/Retomar">
                ⏸️
            </button>
            <button class="simulation-control-btn" onclick="window.backgroundSimulation.toggleVisibility()" title="Mostrar/Ocultar">
                👁️
            </button>
            <button class="simulation-control-btn" onclick="window.backgroundSimulation.destroy()" title="Parar Simulação">
                ⏹️
            </button>
        `;
        
        // Adicionar ao body
        document.body.appendChild(this.controls);
        
        console.log('🎛️ Controles da simulação criados');
    }

    // Inicializar Phaser
    initPhaser() {
        try {
            // Verificar se Phaser está disponível
            if (typeof Phaser === 'undefined') {
                console.warn('⚠️ Phaser não está disponível, carregando...');
                this.loadPhaser().then(() => {
                    this.createGame();
                });
            } else {
                this.createGame();
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar Phaser:', error);
        }
    }

    // Carregar Phaser se necessário
    async loadPhaser() {
        return new Promise((resolve, reject) => {
            if (typeof Phaser !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js';
            script.onload = () => {
                console.log('✅ Phaser carregado');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Erro ao carregar Phaser');
                reject();
            };
            document.head.appendChild(script);
        });
    }

    // Criar jogo Phaser
    createGame() {
        try {
            this.game = new Phaser.Game(simulationConfig);
            this.isActive = true;
            
            // Armazenar referência globalmente
            window.gameplaySimulation = this.game;
            
            // Configurar eventos
            this.setupEvents();
            
            console.log('🎮 Jogo Phaser criado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao criar jogo Phaser:', error);
        }
    }

    // Configurar eventos
    setupEvents() {
        if (!this.game) return;

        // Evento de redimensionamento
        window.addEventListener('resize', () => {
            if (this.game && this.game.scale) {
                this.game.scale.resize(window.innerWidth, window.innerHeight);
            }
        });

        // Evento quando o jogo está pronto
        this.game.events.once('ready', () => {
            console.log('✅ Simulação de background pronta');
            this.onGameReady();
        });

        // Evento de erro
        this.game.events.on('error', (error) => {
            console.error('❌ Erro na simulação:', error);
        });
    }

    // Quando o jogo está pronto
    onGameReady() {
        const canvas = this.game.canvas;
        if (canvas) {
        // Configurar canvas para ocupar toda a tela
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.display = 'block';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.opacity = '1';
        canvas.style.zIndex = '-1'; // Set z-index to -1
            
            console.log('🎨 Canvas configurado para background');
        }
    }

    // Pausar/Retomar simulação
    togglePause() {
        if (!this.game || !this.isActive) return;

        const scene = this.game.scene.getScene('GameplaySimulation');
        if (!scene) return;

        if (this.isPaused) {
            scene.resumeSimulation();
            this.isPaused = false;
            console.log('▶️ Simulação retomada');
        } else {
            scene.pauseSimulation();
            this.isPaused = true;
            console.log('⏸️ Simulação pausada');
        }

        // Atualizar ícone do botão
        const pauseBtn = this.controls.querySelector('button');
        if (pauseBtn) {
            pauseBtn.textContent = this.isPaused ? '▶️' : '⏸️';
        }
    }

    // Mostrar/Ocultar simulação
    toggleVisibility() {
        if (!this.container) return;

        const isVisible = this.container.style.opacity !== '0';
        
        if (isVisible) {
            this.container.style.opacity = '0';
            console.log('👁️ Simulação ocultada');
        } else {
            this.container.style.opacity = '1';
            console.log('👁️ Simulação visível');
        }

        // Atualizar ícone do botão
        const visibilityBtn = this.controls.querySelectorAll('button')[1];
        if (visibilityBtn) {
            visibilityBtn.textContent = isVisible ? '👁️' : '🙈';
        }
    }

    // Destruir simulação
    destroy() {
        console.log('🗑️ Destruindo simulação de background...');
        
        // Pausar simulação
        if (this.game && !this.isPaused) {
            this.togglePause();
        }

        // Destruir jogo Phaser
        if (this.game) {
            const scene = this.game.scene.getScene('GameplaySimulation');
            if (scene) {
                scene.destroySimulation();
            }
            this.game.destroy(true);
            this.game = null;
        }

        // Remover elementos DOM
        if (this.container) {
            this.container.remove();
            this.container = null;
        }

        if (this.controls) {
            this.controls.remove();
            this.controls = null;
        }

        // Limpar referências globais
        window.gameplaySimulation = null;
        this.isActive = false;
        this.isPaused = false;

        console.log('✅ Simulação de background destruída');
    }

    // Obter status da simulação
    getStatus() {
        return {
            isActive: this.isActive,
            isPaused: this.isPaused,
            hasGame: !!this.game,
            hasContainer: !!this.container,
            hasControls: !!this.controls
        };
    }
}

// Criar instância global
window.backgroundSimulation = new BackgroundSimulation();

// Funções globais para compatibilidade
window.pauseSimulation = () => window.backgroundSimulation.togglePause();
window.resumeSimulation = () => window.backgroundSimulation.togglePause();
window.destroySimulation = () => window.backgroundSimulation.destroy();

// Inicializar automaticamente quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Pequeno delay para garantir que tudo esteja carregado
        setTimeout(() => {
            window.backgroundSimulation.init();
        }, 1000);
    });
} else {
    // DOM já carregado
    setTimeout(() => {
        window.backgroundSimulation.init();
    }, 1000);
}

// Exportar para uso em módulos
export default BackgroundSimulation;
