/**
 * GameOverManager - Gerencia a tela de game over e estatísticas finais
 * Responsabilidades:
 * - Detecção de condições de game over
 * - Efeitos dramáticos de morte
 * - Tela de game over com estatísticas
 * - Animações e transições
 * - Opções de restart e menu
 * - Tracking de eventos
 */
export default class GameOverManager {
    constructor(scene) {
        this.scene = scene;
        
        // Estado do game over
        this.isGameOver = false;
        this.gameOverReason = '';
        this.gameOverElements = [];
        
        // Configurações visuais
        this.overlayAlpha = 0.9;
        this.panelColor = 0x0a0a0f;
        this.borderColor = 0xff0000;
        this.textColor = 0xffffff;
        
        // Configurações de animação
        this.slowMotionDuration = 1000;
        this.slowMotionFactor = 0.2;
        this.zoomDuration = 1000;
        this.zoomLevel = 0.5;
        this.screenDelay = 1500;
        
        // Referências
        this.gameState = null;
        this.shipManager = null;
        this.juiceManager = null;
        this.particleEffects = null;
        this.audioManager = null;
        this.uiAnimations = null;
        
        console.log('💀 GameOverManager inicializado');
    }
    
    /**
     * Inicializa o sistema de game over
     */
    initialize(gameState, shipManager, juiceManager, particleEffects, audioManager, uiAnimations) {
        this.gameState = gameState;
        this.shipManager = shipManager;
        this.juiceManager = juiceManager;
        this.particleEffects = particleEffects;
        this.audioManager = audioManager;
        this.uiAnimations = uiAnimations;
        
        console.log('💀 GameOverManager: Sistema inicializado');
        
        // Configura eventos de game over
        this.setupGameOverEvents();
        
        console.log('✅ GameOverManager: Sistema de game over pronto');
    }
    
    /**
     * Configura eventos de game over
     */
    setupGameOverEvents() {
        // Escuta eventos de game over do GameState
        this.scene.events.on('gameover', this.handleGameOver.bind(this));
        
        console.log('💀 Eventos de game over configurados');
    }
    
    /**
     * Manipula o evento de game over
     */
    handleGameOver(eventData) {
        if (this.isGameOver) return; // Evita múltiplos game overs
        
        this.isGameOver = true;
        this.gameOverReason = eventData.reason || 'unknown';
        
        console.log('💀 Game Over:', this.gameOverReason);
        
        // Track game over event
        this.trackGameOverEvent();
        
        // Executa sequência de game over
        this.executeGameOverSequence();
    }
    
    /**
     * Executa a sequência completa de game over
     */
    executeGameOverSequence() {
        // 1. Desabilita colisões da nave
        this.disableShipCollisions();
        
        // 2. Efeito de slow motion
        this.applySlowMotion();
        
        // 3. Explosão dramática
        this.createDramaticExplosion();
        
        // 4. Som de explosão
        this.playExplosionSound();
        
        // 5. Destrói nave visualmente
        this.destroyShipVisually();
        
        // 6. Zoom dramático
        this.applyDramaticZoom();
        
        // 7. Mostra tela de game over
        this.scene.time.delayedCall(this.screenDelay, () => {
            this.showGameOverScreen();
        });
    }
    
    /**
     * Desabilita colisões da nave
     */
    disableShipCollisions() {
        if (this.shipManager && this.shipManager.ship && this.shipManager.ship.body) {
            this.shipManager.ship.body.enable = false;
            console.log('💀 Colisões da nave desabilitadas');
        }
    }
    
    /**
     * Aplica efeito de slow motion
     */
    applySlowMotion() {
        if (this.juiceManager) {
            this.juiceManager.slowMotion(this.slowMotionDuration, this.slowMotionFactor);
            console.log('💀 Slow motion aplicado');
        }
    }
    
    /**
     * Cria explosão dramática
     */
    createDramaticExplosion() {
        if (this.particleEffects && this.shipManager && this.shipManager.ship) {
            this.particleEffects.createExplosion(
                this.shipManager.ship.x, 
                this.shipManager.ship.y, 
                'large'
            );
            console.log('💀 Explosão dramática criada');
        }
    }
    
    /**
     * Toca som de explosão
     */
    playExplosionSound() {
        if (this.audioManager) {
            this.audioManager.playExplosion('large');
            console.log('💀 Som de explosão tocado');
        }
    }
    
    /**
     * Destrói nave visualmente
     */
    destroyShipVisually() {
        this.scene.time.delayedCall(500, () => {
            if (this.shipManager && this.shipManager.ship) {
                this.shipManager.ship.setVisible(false);
                console.log('💀 Nave destruída visualmente');
            }
        });
    }
    
    /**
     * Aplica zoom dramático
     */
    applyDramaticZoom() {
        this.scene.tweens.add({
            targets: this.scene.cameras.main,
            zoom: this.zoomLevel,
            duration: this.zoomDuration,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                console.log('💀 Zoom dramático concluído');
            }
        });
    }
    
    /**
     * Mostra a tela de game over
     */
    showGameOverScreen() {
        console.log('💀 Mostrando tela de game over...');
        
        // Para todos os sons
        this.scene.sound.stopAll();
        
        // Cria elementos da tela
        const elements = this.createGameOverElements();
        
        // Anima a entrada
        this.animateGameOverScreen(elements);
        
        // Configura controles
        this.setupGameOverControls();
    }
    
    /**
     * Cria elementos da tela de game over
     */
    createGameOverElements() {
        const camera = this.scene.cameras.main;
        const centerX = camera.width / 2;
        const centerY = camera.height / 2;
        
        // Overlay escuro
        const overlay = this.scene.add.rectangle(
            camera.scrollX + centerX,
            camera.scrollY + centerY,
            camera.width * 3,
            camera.height * 3,
            0x000000, this.overlayAlpha
        ).setScrollFactor(0).setDepth(200);
        
        // Painel principal
        const gameOverPanel = this.scene.add.rectangle(
            centerX, centerY, 700, 550, this.panelColor, 0.98
        ).setScrollFactor(0).setDepth(201);
        
        // Borda neon
        const gameOverBorder = this.scene.add.rectangle(
            centerX, centerY, 700, 550, this.borderColor, 0
        ).setScrollFactor(0).setDepth(201).setStrokeStyle(5, this.borderColor, 1);
        
        // Título
        const gameOverText = this.scene.add.text(centerX, centerY - 180, 'GAME OVER', {
            fontSize: '48px',
            fill: this.textColor,
            fontFamily: 'Arial',
            stroke: '#ff0000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(202).setOrigin(0.5);
        
        // Motivo da morte
        const reasonText = this.scene.add.text(centerX, centerY - 120, this.getReasonText(), {
            fontSize: '20px',
            fill: '#ff6666',
            fontFamily: 'Arial'
        }).setScrollFactor(0).setDepth(202).setOrigin(0.5);
        
        // Estatísticas
        const stats = this.getGameStats();
        const statsText = this.scene.add.text(centerX, centerY - 40, stats, {
            fontSize: '16px',
            fill: this.textColor,
            fontFamily: 'Arial',
            align: 'center'
        }).setScrollFactor(0).setDepth(202).setOrigin(0.5);
        
        // Botões
        const restartButton = this.createButton(centerX - 100, centerY + 120, 'RESTART', () => {
            this.restartGame();
        });
        
        const menuButton = this.createButton(centerX + 100, centerY + 120, 'MENU', () => {
            this.returnToMenu();
        });
        
        // Armazena elementos para limpeza
        const elements = {
            overlay,
            gameOverPanel,
            gameOverBorder,
            gameOverText,
            reasonText,
            statsText,
            restartButton,
            menuButton
        };
        
        this.gameOverElements.push(elements);
        
        return elements;
    }
    
    /**
     * Cria um botão interativo
     */
    createButton(x, y, text, callback) {
        const button = this.scene.add.rectangle(x, y, 150, 50, 0x333333, 0.8)
            .setScrollFactor(0).setDepth(202)
            .setStrokeStyle(2, this.borderColor, 1);
        
        const buttonText = this.scene.add.text(x, y, text, {
            fontSize: '18px',
            fill: this.textColor,
            fontFamily: 'Arial'
        }).setScrollFactor(0).setDepth(203).setOrigin(0.5);
        
        // Interatividade
        button.setInteractive();
        button.on('pointerover', () => {
            button.setFillStyle(0x444444);
            buttonText.setStyle({ fill: '#ffff00' });
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(0x333333);
            buttonText.setStyle({ fill: this.textColor });
        });
        
        button.on('pointerdown', callback);
        
        return { button, buttonText };
    }
    
    /**
     * Obtém texto do motivo da morte
     */
    getReasonText() {
        const reasons = {
            'oxygen': '💨 Oxigênio Esgotado',
            'collision': '💥 Colisão Fatal',
            'enemy': '👾 Derrotado por Inimigo',
            'meteor': '☄️ Impacto de Meteoro',
            'unknown': '❓ Causa Desconhecida'
        };
        
        return reasons[this.gameOverReason] || reasons['unknown'];
    }
    
    /**
     * Obtém estatísticas do jogo
     */
    getGameStats() {
        if (!this.gameState) return 'Estatísticas não disponíveis';
        
        return `Score: ${this.gameState.score || 0}
Level: ${this.gameState.level || 1}
Crypto Mined: ${this.gameState.cryptoBalance || 0}
Enemies Killed: ${this.gameState.enemiesKilled || 0}
Time Survived: ${this.getSurvivalTime()}`;
    }
    
    /**
     * Calcula tempo de sobrevivência
     */
    getSurvivalTime() {
        if (!this.gameState || !this.gameState.startTime) return '0s';
        
        const survivalTime = Date.now() - this.gameState.startTime;
        const minutes = Math.floor(survivalTime / 60000);
        const seconds = Math.floor((survivalTime % 60000) / 1000);
        
        return `${minutes}m ${seconds}s`;
    }
    
    /**
     * Anima a entrada da tela de game over
     */
    animateGameOverScreen(elements) {
        // Inicia elementos invisíveis
        elements.overlay.setAlpha(0);
        elements.gameOverPanel.setAlpha(0);
        elements.gameOverBorder.setAlpha(0);
        elements.gameOverText.setAlpha(0);
        elements.reasonText.setAlpha(0);
        elements.statsText.setAlpha(0);
        elements.restartButton.button.setAlpha(0);
        elements.restartButton.buttonText.setAlpha(0);
        elements.menuButton.button.setAlpha(0);
        elements.menuButton.buttonText.setAlpha(0);
        
        // Sequência de animação
        this.scene.tweens.add({
            targets: elements.overlay,
            alpha: this.overlayAlpha,
            duration: 500,
            ease: 'Cubic.easeOut'
        });
        
        this.scene.time.delayedCall(200, () => {
            this.scene.tweens.add({
                targets: [elements.gameOverPanel, elements.gameOverBorder],
                alpha: 1,
                duration: 300,
                ease: 'Cubic.easeOut'
            });
        });
        
        this.scene.time.delayedCall(400, () => {
            this.scene.tweens.add({
                targets: [elements.gameOverText, elements.reasonText],
                alpha: 1,
                duration: 300,
                ease: 'Cubic.easeOut'
            });
        });
        
        this.scene.time.delayedCall(600, () => {
            this.scene.tweens.add({
                targets: elements.statsText,
                alpha: 1,
                duration: 300,
                ease: 'Cubic.easeOut'
            });
        });
        
        this.scene.time.delayedCall(800, () => {
            this.scene.tweens.add({
                targets: [
                    elements.restartButton.button, elements.restartButton.buttonText,
                    elements.menuButton.button, elements.menuButton.buttonText
                ],
                alpha: 1,
                duration: 300,
                ease: 'Cubic.easeOut'
            });
        });
    }
    
    /**
     * Configura controles da tela de game over
     */
    setupGameOverControls() {
        // Teclas de atalho
        this.scene.input.keyboard.on('keydown-R', () => {
            this.restartGame();
        });
        
        this.scene.input.keyboard.on('keydown-M', () => {
            this.returnToMenu();
        });
        
        this.scene.input.keyboard.on('keydown-ESC', () => {
            this.returnToMenu();
        });
    }
    
    /**
     * Reinicia o jogo
     */
    restartGame() {
        console.log('💀 Reiniciando jogo...');
        
        // Limpa elementos da tela de game over
        this.clearGameOverElements();
        
        // Reseta estado
        this.resetGameState();
        
        // Reinicia a cena
        this.scene.scene.restart();
    }
    
    /**
     * Retorna ao menu
     */
    returnToMenu() {
        console.log('💀 Retornando ao menu...');
        
        // Limpa elementos da tela de game over
        this.clearGameOverElements();
        
        // Para para o menu
        this.scene.scene.start('MenuScene');
    }
    
    /**
     * Limpa elementos da tela de game over
     */
    clearGameOverElements() {
        this.gameOverElements.forEach(elements => {
            Object.values(elements).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
        });
        
        this.gameOverElements = [];
    }
    
    /**
     * Reseta estado do jogo
     */
    resetGameState() {
        this.isGameOver = false;
        this.gameOverReason = '';
        
        if (this.gameState) {
            this.gameState.reset();
        }
    }
    
    /**
     * Track evento de game over
     */
    trackGameOverEvent() {
        // Implementar tracking de analytics se necessário
        console.log('💀 Game over tracked:', {
            reason: this.gameOverReason,
            score: this.gameState ? this.gameState.score : 0,
            crypto: this.gameState ? this.gameState.cryptoBalance : 0
        });
    }
    
    /**
     * Verifica se está em game over
     */
    isGameOverActive() {
        return this.isGameOver;
    }
    
    /**
     * Força game over (para testes)
     */
    forceGameOver(reason = 'test') {
        this.handleGameOver({ reason });
    }
    
    /**
     * Destrói o manager e limpa recursos
     */
    destroy() {
        console.log('💀 GameOverManager: Destruindo...');
        
        // Limpa elementos
        this.clearGameOverElements();
        
        // Remove listeners
        this.scene.events.off('gameover');
        
        // Reseta estado
        this.resetGameState();
        
        console.log('✅ GameOverManager: Destruído');
    }
}
