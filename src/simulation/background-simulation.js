// =====================================================
// SPACE CRYPTO MINER - SIMULAÇÃO DE BACKGROUND
// =====================================================
// Versão: 2.0 - Com melhorias de acessibilidade e performance

// Importar a simulação de gameplay com ASSETS REAIS
import GameplaySimulation from './GameplaySimulation.js';

// ✅ Função para retornar config adaptada (substitui const estática)
function getSimulationConfig() {
    const baseConfig = {
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
        parent: 'simulation-container',
        render: {
            antialias: false,
            pixelArt: false
        }
    };
    
    // Aplicar adaptações se instância já existe
    if (window.backgroundSimulation) {
        return window.backgroundSimulation.getAdaptiveConfig(baseConfig);
    }
    
    return baseConfig;
}

// Classe para gerenciar a simulação de background
class BackgroundSimulation {
    constructor() {
        this.game = null;
        this.isActive = false;
        this.isPaused = false;
        this.container = null;
        this.controls = null;
        
        // ✅ P0: Suporte a prefers-reduced-motion
        this.prefersReducedMotion = false;
        
        // ✅ P1: Opacity adaptativa por página (AUMENTADAS para melhor visibilidade)
        this.currentPage = 'unknown';
        this.opacityMap = {
            'home': 1.0,      // ✅ 100% visível na home (destaque máximo)
            'login': 0.5,     // ✅ Aumentado de 0.3 para 0.5
            'profile': 0.5,   // ✅ Aumentado de 0.3 para 0.5
            'dashboard': 0.7, // ✅ Aumentado de 0.5 para 0.7
            'game': 0.0,      // Invisível (não competir com jogo real)
            'default': 0.8    // ✅ Aumentado de 0.6 para 0.8
        };
        
        // ✅ P1: Performance mobile adaptativa
        this.isMobile = this.detectMobile();
        this.performanceMode = this.detectPerformanceMode();
        
        console.log(`📱 Dispositivo: ${this.isMobile ? 'Mobile' : 'Desktop'}`);
        console.log(`⚡ Modo: ${this.performanceMode}`);
        
        // Inicializar detecções
        this.checkMotionPreference();
        this.observePageChanges();
    }

    // ✅ P0: Verificar preferência de movimento reduzido
    checkMotionPreference() {
        // Detectar preferência inicial
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.prefersReducedMotion = mediaQuery.matches;
        
        // Log para debug
        if (this.prefersReducedMotion) {
            console.log('♿ Preferência de movimento reduzido detectada');
        }
        
        // Listener para mudanças em tempo real
        mediaQuery.addEventListener('change', (e) => {
            this.prefersReducedMotion = e.matches;
            this.applyMotionPreference();
            
            console.log(
                this.prefersReducedMotion 
                    ? '♿ Movimento reduzido ativado' 
                    : '▶️ Movimento normal ativado'
            );
        });
    }

    // ✅ P0: Aplicar preferência de movimento
    applyMotionPreference() {
        if (!this.container) return;
        
        if (this.prefersReducedMotion) {
            // Reduz opacity drasticamente
            this.container.style.opacity = '0.15';
            
            // Pausa automaticamente se estiver rodando
            
        } else {
            // Restaura opacity baseado na página atual
            this.updateOpacityForCurrentPage();
        }
    }

    // ✅ P1: Observar mudanças de página
    observePageChanges() {
        // Detectar página inicial
        this.updateOpacityForCurrentPage();
        
        // Observer para mudanças na URL (SPA)
        let lastUrl = location.href; 
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                this.updateOpacityForCurrentPage();
            }
        }).observe(document, { subtree: true, childList: true });
        
        // Listener para popstate (navegação back/forward)
        window.addEventListener('popstate', () => {
            this.updateOpacityForCurrentPage();
        });
        
        console.log('👁️ Observer de páginas ativado');
    }

    // ✅ P1: Atualizar opacity baseado na página
    updateOpacityForCurrentPage() {
        if (!this.container) return;
        
        // Detectar página atual pela URL
        const path = window.location.pathname;
        let pageName = 'default';
        
        if (path === '/' || path === '/index.html') {
            pageName = 'home';
        } else if (path.includes('/login')) {
            pageName = 'login';
        } else if (path.includes('/profile')) {
            pageName = 'profile';
        } else if (path.includes('/dashboard')) {
            pageName = 'dashboard';
        } else if (path.includes('/game')) {
            pageName = 'game';
        }
        
        this.currentPage = pageName;
        
        // Aplicar opacity (respeitando prefers-reduced-motion)
        let targetOpacity = this.opacityMap[pageName];
        
        if (this.prefersReducedMotion) {
            targetOpacity = Math.min(targetOpacity, 0.15);
        }
        
        this.container.style.transition = 'opacity 0.5s ease';
        this.container.style.opacity = targetOpacity;
        
        console.log(`🎨 Opacity ajustada para página "${pageName}": ${targetOpacity}`);
    }

    // ✅ P1: Detectar se é dispositivo móvel
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
    }

    // ✅ P1: Detectar modo de performance ideal
    detectPerformanceMode() {
        // Fatores para determinar modo
        const isMobile = this.isMobile;
        const isLowEnd = navigator.hardwareConcurrency <= 4;
        const isSaveData = navigator.connection?.saveData === true;
        
        if (isMobile || isLowEnd || isSaveData) {
            return 'lite'; // Modo leve
        } else {
            return 'full'; // Modo completo
        }
    }

    // ✅ P1: Retornar configuração adaptada à performance
    getAdaptiveConfig(baseConfig) {
        const config = { ...baseConfig };
        
        if (this.performanceMode === 'lite') {
            // Ajustes para dispositivos móveis/fracos
            config.fps = { target: 30, forceSetTimeOut: true };
            config.render = {
                ...config.render,
                antialias: false,
                pixelArt: true,
                roundPixels: true
            };
            config.physics.arcade.debug = false;
            
            console.log('⚡ Configuração LITE aplicada (mobile/low-end)');
        } else {
            // Configuração completa para desktop
            config.fps = { target: 60 };
            config.render = {
                ...config.render,
                antialias: true,
                pixelArt: false
            };
            
            console.log('🚀 Configuração FULL aplicada (desktop/high-end)');
        }
        
        return config;
    }

    // Inicializar simulação
    init() {
        console.log('🎮 Inicializando simulação de background...');
        
        // Criar container se não existir
        this.createContainer();
        
        // ✅ REMOVIDO: Controles e atalhos (simulação sempre ativa)
        // this.createControls();
        // this.setupKeyboardShortcuts();
        
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

    // ✅ P0: Criar controles com acessibilidade
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
        this.controls.setAttribute('role', 'toolbar');
        this.controls.setAttribute('aria-label', 'Controles da simulação de background');
        
        this.controls.innerHTML = `
            <button 
                id="simulation-pause-btn"
                class="simulation-control-btn" 
                onclick="window.backgroundSimulation.togglePause()"
                aria-label="Pausar simulação de background"
                aria-pressed="false"
                title="Pausar/Retomar simulação (Ctrl+P)"
            >
                <span aria-hidden="true">⏸️</span>
                <span class="sr-only">Pausar</span>
            </button>
            <button 
                id="simulation-visibility-btn"
                class="simulation-control-btn" 
                onclick="window.backgroundSimulation.toggleVisibility()"
                aria-label="Alternar visibilidade da simulação"
                aria-pressed="false"
                title="Mostrar/Ocultar simulação (Ctrl+H)"
            >
                <span aria-hidden="true">👁️</span>
                <span class="sr-only">Visível</span>
            </button>
            <button 
                id="simulation-stop-btn"
                class="simulation-control-btn simulation-control-btn-danger" 
                onclick="window.backgroundSimulation.destroy()"
                aria-label="Parar simulação de background permanentemente"
                title="Parar simulação (Ctrl+Shift+S)"
            >
                <span aria-hidden="true">⏹️</span>
                <span class="sr-only">Parar</span>
            </button>
            <div class="simulation-mode-indicator" title="Modo de performance atual">
                <span class="mode-badge mode-badge-${this.performanceMode}">
                    ${this.performanceMode === 'lite' ? '⚡ Lite' : '🚀 Full'}
                </span>
            </div>
        `;
        
        // Adicionar ao body
        document.body.appendChild(this.controls);
        
        console.log('🎛️ Controles da simulação criados com acessibilidade');
    }

    // ✅ P1: Configurar atalhos de teclado
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignorar se usuário está digitando
            const activeElement = document.activeElement;
            const isTyping = 
                activeElement.tagName === 'INPUT' || 
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.isContentEditable;
            
            if (isTyping) return;
            
            // Ctrl+P: Pausar/Retomar
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                this.togglePause();
                this.showShortcutFeedback('Simulação ' + (this.isPaused ? 'pausada' : 'retomada'));
            }
            
            // Ctrl+H: Mostrar/Ocultar
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                this.toggleVisibility();
                const isVisible = this.container.style.opacity !== '0';
                this.showShortcutFeedback('Simulação ' + (isVisible ? 'visível' : 'oculta'));
            }
            
            // Ctrl+Shift+S: Parar (com confirmação)
            if (e.ctrlKey && e.key === 's' && e.shiftKey) {
                e.preventDefault();
                if (confirm('Tem certeza que deseja parar a simulação permanentemente?')) {
                    this.destroy();
                    this.showShortcutFeedback('Simulação encerrada');
                }
            }
        });
        
        console.log('⌨️ Atalhos de teclado configurados (Ctrl+P, Ctrl+H, Ctrl+Shift+S)');
    }

    // ✅ P1: Mostrar feedback visual de atalho
    showShortcutFeedback(message) {
        // Criar toast temporário
        const toast = document.createElement('div');
        toast.className = 'simulation-shortcut-toast';
        toast.textContent = message;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        
        document.body.appendChild(toast);
        
        // Remover após 2 segundos
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
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

    // Carregar Phaser se necessário (com retry)
    async loadPhaser(retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                if (typeof Phaser !== 'undefined') {
                    return;
                }

                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js';
                    script.onload = () => {
                        console.log('✅ Phaser carregado');
                        resolve();
                    };
                    script.onerror = () => {
                        reject(new Error('Erro ao carregar Phaser'));
                    };
                    document.head.appendChild(script);
                });
                return;
            } catch (error) {
                if (i === retries - 1) {
                    console.error('❌ Erro ao carregar Phaser após tentativas:', error);
                    throw error;
                }
                console.warn(`⚠️ Tentativa ${i + 1} falhou, tentando novamente...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    // ✅ Criar jogo Phaser com config adaptada
    createGame() {
        try {
            // Usar configuração adaptativa
            const config = this.getAdaptiveConfig(getSimulationConfig());
            
            this.game = new Phaser.Game(config);
            this.isActive = true;
            
            // Armazenar referência globalmente
            window.gameplaySimulation = this.game;
            
            // Configurar eventos
            this.setupEvents();
            
            console.log(`🎮 Jogo Phaser criado (modo: ${this.performanceMode})`);
            
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

    // ✅ Quando o jogo está pronto (com fade in)
    onGameReady() {
        const canvas = this.game.canvas;
        if (canvas) {
            // Configurar canvas para ocupar toda a tela (FIXED para não criar scroll)
            canvas.style.width = '100vw';
            canvas.style.height = '100vh';
            canvas.style.display = 'block';
            canvas.style.position = 'fixed'; // ✅ FIXED em vez de absolute
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.pointerEvents = 'none';
            
            // ✅ Canvas SEMPRE visível (sem fade in por enquanto para debug)
            canvas.style.opacity = '1'; // ✅ DIRETO EM 1 para debug
            canvas.style.transition = 'opacity 0.5s ease-in';
            canvas.style.zIndex = '5'; // ✅ Acima dos backgrounds CSS mas abaixo do conteúdo
            
            console.log('🎨 Canvas configurado para background');
            console.log('🎨 Canvas opacity:', canvas.style.opacity);
            console.log('🎨 Canvas zIndex:', canvas.style.zIndex);
            console.log('🎨 Canvas position:', canvas.style.position);
            
        // Aplicar preferência inicial
        this.applyMotionPreference();
        
        // ✅ DEBUG: Verificar se está pausado
        console.log('🔍 DEBUG: isPaused =', this.isPaused);
        console.log('🔍 DEBUG: isActive =', this.isActive);
        console.log('🔍 DEBUG: prefersReducedMotion =', this.prefersReducedMotion);
        
        // Atualizar opacity baseado na página após um delay
        setTimeout(() => {
            this.updateOpacityForCurrentPage();
            console.log('🎨 Opacity atualizada para página:', this.currentPage);
            console.log('🔍 DEBUG FINAL: isPaused =', this.isPaused, 'isActive =', this.isActive);
        }, 500);
        }
    }

    // ✅ P0: Pausar/Retomar com ARIA
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

        // Atualizar ícone e aria-label do botão
        const pauseBtn = document.getElementById('simulation-pause-btn');
        if (pauseBtn) {
            pauseBtn.querySelector('span[aria-hidden]').textContent = this.isPaused ? '▶️' : '⏸️';
            pauseBtn.querySelector('.sr-only').textContent = this.isPaused ? 'Retomar' : 'Pausar';
            pauseBtn.setAttribute('aria-pressed', this.isPaused ? 'true' : 'false');
            pauseBtn.setAttribute('aria-label', 
                this.isPaused 
                    ? 'Retomar simulação de background' 
                    : 'Pausar simulação de background'
            );
        }
    }

    // ✅ P0: Mostrar/Ocultar com ARIA
    toggleVisibility() {
        if (!this.container) return;

        const isVisible = this.container.style.opacity !== '0';
        
        if (isVisible) {
            this.container.style.transition = 'opacity 0.3s ease';
            this.container.style.opacity = '0';
            console.log('👁️ Simulação ocultada');
        } else {
            this.container.style.transition = 'opacity 0.3s ease';
            this.container.style.opacity = this.prefersReducedMotion ? '0.15' : '0.6';
            console.log('👁️ Simulação visível');
        }

        // Atualizar ícone e aria-label do botão
        const visibilityBtn = document.getElementById('simulation-visibility-btn');
        if (visibilityBtn) {
            visibilityBtn.querySelector('span[aria-hidden]').textContent = isVisible ? '🙈' : '👁️';
            visibilityBtn.querySelector('.sr-only').textContent = isVisible ? 'Oculto' : 'Visível';
            visibilityBtn.setAttribute('aria-pressed', isVisible ? 'true' : 'false');
            visibilityBtn.setAttribute('aria-label', 
                isVisible 
                    ? 'Mostrar simulação de background' 
                    : 'Ocultar simulação de background'
            );
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
            hasControls: !!this.controls,
            prefersReducedMotion: this.prefersReducedMotion,
            currentPage: this.currentPage,
            performanceMode: this.performanceMode,
            isMobile: this.isMobile
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
