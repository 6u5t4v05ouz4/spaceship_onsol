/**
 * MultiplayerGameScene - Cena principal do jogo multiplayer
 * Baseada no GameSceneModular mas adaptada para mundo compartilhado
 *
 * Principais diferenças do GameSceneModular:
 * - Mundo por chunks sincronizados via WebSocket
 * - Elementos do banco de dados (recursos, planetas, NPCs, estações)
 * - Players reais instead de inimigos gerados
 * - Sistema de coordenadas global e persistente
 * - Mesmos efeitos visuais e game feel do original
 */

// Efeitos visuais e game feel (mantidos do original)
import JuiceManager from '../managers/JuiceManager.js';
import AudioManager from '../managers/AudioManager.js';
import ParticleEffects from '../effects/ParticleEffects.js';
import UIAnimations from '../effects/UIAnimations.js';
import TrailEffects from '../effects/TrailEffects.js';

// Managers essenciais (adaptados)
import GameStateManager from '../managers/GameStateManager.js';
import ShipManager from '../managers/ShipManager.js';
import CollisionManager from '../managers/CollisionManager.js';
import UIManager from '../managers/UIManager.js';
import BackgroundManager from '../managers/BackgroundManager.js';
import GameOverManager from '../managers/GameOverManager.js';

// Managers multiplayer (novos/sobrepostos)
import MultiplayerManager from '../managers/MultiplayerManager.js';
import AssetManager from '../managers/AssetManager.js';
import SpriteSheetManager from '../managers/SpriteSheetManager.js';

export default class MultiplayerGameScene extends Phaser.Scene {
    constructor() {
        super('MultiplayerGameScene');

        // Managers de efeitos visuais (herdados do original)
        this.juiceManager = null;
        this.audioManager = null;
        this.particleEffects = null;
        this.uiAnimations = null;
        this.trailEffects = null;

        // Managers essenciais (adaptados do original)
        this.gameState = null;
        this.shipManager = null;
        this.collisionManager = null;
        this.uiManager = null;
        this.backgroundManager = null;
        this.gameOverManager = null;

        // Managers multiplayer (novos)
        this.multiplayerManager = null;
        this.assetManager = null;
        this.spriteSheetManager = null;

        // Estado da cena (mantido do original)
        this.connectedWallet = null;
        this.cursors = null;
        this.spaceKey = null;
        this.testExplosionKey = null;

        // Grupos de física (adaptados para multiplayer)
        this.projectiles = null;

        // Performance (mantido)
        this.lastCleanup = 0;
        this.cleanupInterval = 30000;
        this.lastDebugTime = 0;

        // Mira personalizada (mantida do original)
        this.crosshair = null;
        this.crosshairPulseTween = null;

        // Sistema de lock-on (mantido, mas para NPCs/players)
        this.lockedTarget = null;
        this.lockOnStartTime = 0;
        this.lockOnDuration = 3000;
        this.lockOnIndicator = null;

        // Sistema multiplayer específico
        this.currentChunk = { x: 0, y: 0 };
        this.chunkTransitionTime = 0;
        this.isTransitioning = false;
    }

    preload() {
        // Define o caminho base para os assets (mantido do original)
        this.load.setPath('');

        // Carrega o JSON da nave padrão (mantido)
        this.load.json('defaultShipMetadata', 'src/assets/default_ship_metadata.json');

        // CARREGA TODOS OS ASSETS DO ORIGINAL (100% mantido)
        this.load.atlas('ship', '/assets/images/01.png', '/assets/images/01.json');
        this.load.image('ship_idle', '/assets/images/idle.png');
        this.load.atlas('rocket', '/assets/images/rocket.png', '/assets/images/rocket.json');
        this.load.atlas('minibullet', '/assets/images/minibullet.png', '/assets/images/minibullet.json');
        this.load.atlas('enemy', '/assets/images/02.png', '/assets/images/02.json');
        this.load.atlas('meteoro', '/assets/images/meteoro.png', '/assets/images/meteoro.json');
        this.load.atlas('explosion', '/assets/images/explosion.png', '/assets/images/explosion.json');
        this.load.image('crosshair', '/assets/aim/aim1.png');
        this.load.atlas('planets', '/assets/background/planets.png', '/assets/background/planets.json');
        this.load.image('stars', '/assets/background/stars.jpeg');

        // Carrega assets de áudio do original
        this.load.audio('laser', '/assets/sounds/laser.mp3');
        this.load.audio('explosion', '/assets/sounds/explosion.mp3');
        this.load.audio('engine', '/assets/sounds/engine.mp3');
        this.load.audio('pickup', '/assets/sounds/pickup.mp3');
        this.load.audio('rocket', '/assets/sounds/rocket.mp3');
        this.load.audio('damage', '/assets/sounds/damage.mp3');
        this.load.audio('powerup', '/assets/sounds/powerup.mp3');

        // Loading com progresso
        this.load.on('progress', (progress) => {
            console.log(`📦 Carregando assets: ${Math.floor(progress * 100)}%`);
        });

        this.load.on('complete', () => {
            console.log('✅ Todos os assets carregados com sucesso');
        });
    }

    async create(data) {
        console.log('🚀 Iniciando MultiplayerGameScene...');
        console.log('📊 Dados recebidos:', data);

        try {
            // Inicializa managers de efeitos visuais (mantidos do original)
            this.initializeEffectManagers();

            // Inicializa managers essenciais (adaptados)
            this.initializeEssentialManagers(data);

            // Inicializa managers multiplayer (novos)
            await this.initializeMultiplayerManagers();

            // Configura a cena
            this.setupScene(data);

            // Cria objetos do jogo
            await this.createGameObjects();

            // Configura sistemas
            this.setupSystems();

            // Configura inputs
            this.setupInput();

            // Configura eventos multiplayer
            this.setupMultiplayerEvents();

            console.log('✅ MultiplayerGameScene inicializada com sucesso!');

        } catch (error) {
            console.error('❌ Erro ao inicializar MultiplayerGameScene:', error);
        }
    }

    initializeEffectManagers() {
        console.log('🎨 Inicializando managers de efeitos visuais...');

        // Managers de efeitos (exatamente como no original)
        console.log('🔍 Inicializando JuiceManager...');
        this.juiceManager = new JuiceManager(this);
        console.log('✅ JuiceManager inicializado');

        console.log('🔍 Inicializando AudioManager...');
        this.audioManager = new AudioManager(this);
        console.log('✅ AudioManager inicializado');

        console.log('🔍 Inicializando ParticleEffects...');
        this.particleEffects = new ParticleEffects(this);
        console.log('✅ ParticleEffects inicializado');

        console.log('🔍 Inicializando UIAnimations...');
        this.uiAnimations = new UIAnimations(this);
        console.log('✅ UIAnimations inicializado');

        console.log('🔍 Inicializando TrailEffects...');
        this.trailEffects = new TrailEffects(this);
        console.log('✅ TrailEffects inicializado');
    }

    initializeEssentialManagers(data) {
        console.log('🔧 Inicializando managers essenciais...');

        // GameStateManager (mantido do original)
        if (!this.sys) {
            console.error('❌ this.sys não está disponível!');
            return;
        }

        this.gameState = new GameStateManager(this);
        console.log('✅ GameStateManager inicializado');

        // Configura dados iniciais (mantido)
        if (data && data.playerName) {
            this.gameState.setPlayerName(data.playerName);
            console.log('✅ Nome do jogador configurado');
        }

        this.connectedWallet = data && data.walletAddress ? data.walletAddress : null;

        // ShipManager (mantido, mas para multiplayer)
        this.shipManager = new ShipManager(this, this.gameState);
        console.log('✅ ShipManager inicializado');

        // CollisionManager (adaptado para elementos multiplayer)
        this.collisionManager = new CollisionManager(this);
        console.log('✅ CollisionManager inicializado');

        // UIManager (mantido, mas com informações multiplayer)
        this.uiManager = new UIManager(this, this.gameState);
        console.log('✅ UIManager inicializado');

        // BackgroundManager (mantido)
        this.backgroundManager = new BackgroundManager(this);
        console.log('✅ BackgroundManager inicializado');

        // GameOverManager (adaptado para contexto multiplayer)
        this.gameOverManager = new GameOverManager(this);
        console.log('✅ GameOverManager inicializado');
    }

    async initializeMultiplayerManagers() {
        console.log('🌐 Inicializando managers multiplayer...');

        // SpriteSheetManager (novo - para elementos do banco)
        console.log('🔍 Inicializando SpriteSheetManager...');
        this.spriteSheetManager = new SpriteSheetManager(this);
        await this.spriteSheetManager.init();
        console.log('✅ SpriteSheetManager inicializado');

        // AssetManager (novo - para gerenciar assets multiplayer)
        console.log('🔍 Inicializando AssetManager...');
        this.assetManager = new AssetManager(this, this.spriteSheetManager);
        console.log('✅ AssetManager inicializado');

        // MultiplayerManager (principal - gerencia mundo compartilhado)
        console.log('🔍 Inicializando MultiplayerManager...');
        this.multiplayerManager = new MultiplayerManager(
            this,
            this.assetManager,
            this.spriteSheetManager,
            this.juiceManager
        );
        console.log('✅ MultiplayerManager inicializado');
    }

    setupScene(data) {
        // Obtém as dimensões da tela (mantido)
        const screenWidth = this.game.config.width;
        const screenHeight = this.game.config.height;

        // Cria um mundo maior para suportar múltiplos chunks
        // Em multiplayer, o mundo é infinito através de chunks
        this.physics.world.setBounds(-50000, -50000, 100000, 100000);

        // Configura som (mantido do original)
        this.rocketSound = this.sound.add('rocket', {
            loop: true,
            volume: 0.5
        });
        this.isRocketPlaying = false;

        // Background mantido, mas adaptado para chunks
        console.log('🌌 Background configurado para contexto multiplayer');

        // Cria animações (mantido do original)
        this.createAnimations();

        // Configura a câmera
        this.setupCamera();

        // Cria a mira do mouse (mantida)
        this.createCrosshair();

        // Configura grupos de física (adaptados)
        this.projectiles = this.physics.add.group({
            defaultKey: 'minibullet',
            maxSize: 50
        });

        console.log('✅ Cena multiplayer configurada');
    }

    async createGameObjects() {
        console.log('🎮 Criando objetos do jogo multiplayer...');

        // Background (mantido)
        console.log('🔍 Inicializando sistema de background...');
        this.backgroundManager.initialize();
        console.log('✅ Sistema de background inicializado');

        // Nave do jogador (mantida)
        console.log('🔍 Criando nave do jogador...');
        await this.shipManager.create();
        console.log('✅ Nave criada:', this.shipManager.ship);

        // Configura câmera para seguir a nave (mantido)
        if (this.shipManager.ship) {
            this.cameras.main.startFollow(this.shipManager.ship);
            console.log('✅ Câmera configurada para seguir a nave');
        }

        // Configura colisões (adaptado para contexto multiplayer)
        console.log('🔍 Configurando colisões multiplayer...');
        this.collisionManager.setupAllCollisions(this.shipManager.ship);
        console.log('✅ Colisões configuradas');

        // UI (adaptada para informações multiplayer)
        console.log('🔍 Inicializando interface multiplayer...');
        this.uiManager.initialize();
        console.log('✅ Interface inicializada');

        // Inicializa sistema multiplayer principal
        console.log('🌐 Inicializando conexão multiplayer...');
        try {
            await this.multiplayerManager.init();
            console.log('✅ Sistema multiplayer inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar multiplayer:', error);
        }

        console.log('✅ Objetos do jogo multiplayer criados');
    }

    setupSystems() {
        // Configura eventos do GameState (mantido)
        this.events.on('gameover', this.handleGameOver.bind(this));
        this.events.on('pause', this.handlePause.bind(this));
        this.events.on('resume', this.handleResume.bind(this));

        // Eventos multiplayer específicos
        this.events.on('chunk_changed', this.handleChunkChanged.bind(this));
        this.events.on('element_destroyed', this.handleElementDestroyed.bind(this));

        console.log('✅ Sistemas configurados');
    }

    setupInput() {
        // Input configuration exatamente como no original
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                return;
            }
        });

        // Captura entrada do teclado (mantido)
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.testExplosionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Configura clique do mouse para disparar (mantido)
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.fireProjectile();
            }
        });

        console.log('✅ Controles configurados');
    }

    setupMultiplayerEvents() {
        // Eventos específicos do multiplayer serão configurados aqui
        // Estes eventos virão do MultiplayerManager

        console.log('✅ Eventos multiplayer configurados');
    }

    createAnimations() {
        // Animações mantidas 100% do original
        this.anims.create({
            key: 'ship_thrust',
            frames: this.anims.generateFrameNames('ship', {
                prefix: '01 ',
                start: 0,
                end: 1,
                suffix: '.aseprite'
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'ship_idle',
            frames: [{ key: 'ship_idle' }],
            frameRate: 1,
            repeat: 0
        });

        // Animação de explosão (mantida)
        this.anims.create({
            key: 'explosion',
            frames: this.anims.generateFrameNames('explosion', {
                prefix: 'explo',
                start: 0,
                end: 7,
                suffix: '.aseprite'
            }),
            frameRate: 20,
            repeat: 0
        });

        console.log('✅ Animações criadas');
    }

    setupCamera() {
        // Configuração da câmera mantida do original
        this.cameras.main.setZoom(1);
        this.cameras.main.setBounds(-50000, -50000, 100000, 100000);

        console.log('✅ Câmera configurada');
    }

    createCrosshair() {
        // Mira personalizada mantida do original
        this.crosshair = this.add.image(0, 0, 'crosshair')
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1000);

        // Animação de pulso da mira (mantida)
        this.crosshairPulseTween = this.tweens.add({
            targets: this.crosshair,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        console.log('✅ Mira criada');
    }

    // Métodos de gameplay (adaptados para multiplayer)

    fireProjectile() {
        if (!this.shipManager || !this.shipManager.ship) return;

        // Lógica de disparo adaptada para multiplayer
        const ship = this.shipManager.ship;
        const pointer = this.input.activePointer;

        // Calcula ângulo do disparo
        const angle = Phaser.Math.Angle.Between(
            ship.x, ship.y,
            pointer.worldX, pointer.worldY
        );

        // Cria projétil com efeitos visuais do original
        const projectile = this.projectiles.get(ship.x, ship.y);

        if (projectile) {
            projectile.setActive(true);
            projectile.setVisible(true);

            // Configura velocidade
            const speed = 800;
            projectile.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );

            // Rotação do projétil
            projectile.rotation = angle;

            // Aplica efeitos visuais do original
            if (this.particleEffects) {
                this.particleEffects.createMuzzleFlash(ship.x, ship.y, angle);
            }

            if (this.audioManager) {
                this.audioManager.playSound('laser');
            }

            if (this.juiceManager) {
                this.juiceManager.screenShake(50, 2);
            }

            // Cleanup automático
            this.time.delayedCall(2000, () => {
                projectile.setActive(false);
                projectile.setVisible(false);
            });
        }
    }

    update(time, delta) {
        // Atualização mantida do original, mas com adaptações multiplayer

        // Atualiza managers de efeitos (mantido)
        if (this.particleEffects) {
            this.particleEffects.update(time, delta);
        }

        if (this.trailEffects) {
            this.trailEffects.update(time, delta);
        }

        // Atualiza nave do jogador (mantido)
        if (this.shipManager) {
            this.shipManager.update(time, delta);
        }

        // Atualiza sistema multiplayer (novo)
        if (this.multiplayerManager) {
            this.multiplayerManager.update();
        }

        // Atualiza mira (mantido)
        this.updateCrosshair();

        // Atualiza lock-on (adaptado para NPCs/players)
        this.updateLockOn();

        // Performance cleanup (mantido)
        if (time - this.lastCleanup > this.cleanupInterval) {
            this.performCleanup();
            this.lastCleanup = time;
        }

        // Debug (mantido)
        if (time - this.lastDebugTime > 1000) {
            this.debugInfo();
            this.lastDebugTime = time;
        }
    }

    updateCrosshair() {
        // Atualização da mira mantida do original
        if (this.crosshair && this.input.activePointer) {
            this.crosshair.x = this.input.activePointer.x;
            this.crosshair.y = this.input.activePointer.y;
        }
    }

    updateLockOn() {
        // Sistema de lock-on adaptado para NPCs/players multiplayer
        // Lógica similar ao original, mas para elementos do mundo multiplayer
    }

    performCleanup() {
        // Sistema de cleanup mantido do original
        console.log('🧹 Realizando cleanup de performance...');

        // Cleanup de projéteis inativos
        this.projectiles.children.entries.forEach(projectile => {
            if (!projectile.active) {
                this.projectiles.remove(projectile, true, true);
            }
        });

        // Outros sistemas de cleanup...
    }

    debugInfo() {
        // Informações de debug adaptadas para multiplayer
        if (this.multiplayerManager) {
            const stats = this.multiplayerManager.getServerStats();
            console.log('📊 Stats Multiplayer:', stats);
        }
    }

    // Event handlers (adaptados)

    handleGameOver() {
        console.log('💀 Game Over - Contexto Multiplayer');

        // Lógica de game over adaptada para multiplayer
        if (this.gameOverManager) {
            this.gameOverManager.showGameOver();
        }

        // Notificar outros jogadores sobre a desconexão
        if (this.multiplayerManager) {
            this.multiplayerManager.disconnect();
        }
    }

    handlePause() {
        console.log('⏸️ Jogo pausado - Contexto Multiplayer');

        // Pausar sistemas multiplayer
        if (this.multiplayerManager) {
            // Implementar pausa multiplayer
        }
    }

    handleResume() {
        console.log('▶️ Jogo resumido - Contexto Multiplayer');

        // Resumir sistemas multiplayer
        if (this.multiplayerManager) {
            // Implementar resume multiplayer
        }
    }

    handleChunkChanged(chunkData) {
        console.log('🔄 Mudança de chunk:', chunkData);

        // Aplicar efeitos visuais de transição
        if (this.juiceManager) {
            this.juiceManager.flashColor(this.cameras.main, 0x00ffff, 300);
        }

        // Atualizar elementos da UI
        if (this.uiManager) {
            this.uiManager.updateChunkInfo(chunkData);
        }
    }

    handleElementDestroyed(elementData) {
        console.log('💥 Elemento destruído:', elementData);

        // Aplicar efeitos de destruição do original
        if (this.juiceManager) {
            this.juiceManager.screenShake(200, 5);
        }

        if (this.particleEffects) {
            this.particleEffects.createExplosion(
                elementData.x,
                elementData.y,
                elementData.type
            );
        }

        if (this.audioManager) {
            this.audioManager.playSound('explosion');
        }
    }

    // Cleanup ao destruir a cena
    destroy() {
        console.log('🧹 Destruindo MultiplayerGameScene...');

        // Destruir todos os managers
        if (this.multiplayerManager) {
            this.multiplayerManager.destroy();
        }

        if (this.assetManager) {
            this.assetManager.cleanup();
        }

        if (this.spriteSheetManager) {
            this.spriteSheetManager.cleanup();
        }

        if (this.juiceManager) {
            // Cleanup do juice manager se necessário
        }

        if (this.particleEffects) {
            this.particleEffects.destroy();
        }

        if (this.trailEffects) {
            this.trailEffects.destroy();
        }

        if (this.uiAnimations) {
            // Cleanup do UI animations se necessário
        }

        if (this.audioManager) {
            this.audioManager.destroy();
        }

        console.log('✅ MultiplayerGameScene destruída');
    }
}