/**
 * GameScene - Cena principal do jogo (REFATORADA)
 * Agora usa arquitetura modular com managers especializados
 * Responsabilidades principais:
 * - Coordenação entre managers
 * - Ciclo de vida da cena
 * - Eventos globais
 */
// import { track } from '@vercel/analytics';
import JuiceManager from '../managers/JuiceManager.js';
import AudioManager from '../managers/AudioManager.js';
import ParticleEffects from '../effects/ParticleEffects.js';
import UIAnimations from '../effects/UIAnimations.js';
import TrailEffects from '../effects/TrailEffects.js';

// Managers especializados
import GameStateManager from '../managers/GameStateManager.js';
import ShipManager from '../managers/ShipManager.js';
import CollisionManager from '../managers/CollisionManager.js';
import UIManager from '../managers/UIManager.js';
import EnemyManager from '../managers/EnemyManager.js';
import MeteorManager from '../managers/MeteorManager.js';
import ProjectileManager from '../managers/ProjectileManager.js';
import MiningManager from '../managers/MiningManager.js';
import BackgroundManager from '../managers/BackgroundManager.js';
import GameOverManager from '../managers/GameOverManager.js';
import RocketManager from '../managers/RocketManager.js';
import MultiplayerManager from '../managers/MultiplayerManager.js';

export default class GameSceneModular extends Phaser.Scene {
    constructor() {
        super('GameSceneModular');
        
        // Managers especializados
        this.gameState = null;
        this.shipManager = null;
        this.collisionManager = null;
        this.uiManager = null;
        this.enemyManager = null;
        this.meteorManager = null;
        this.projectileManager = null;
        this.miningManager = null;
        this.backgroundManager = null;
        this.gameOverManager = null;
        this.rocketManager = null;
        this.multiplayerManager = null;
        
        // Managers de efeitos (existentes)
        this.juiceManager = null;
        this.audioManager = null;
        this.particleEffects = null;
        this.uiAnimations = null;
        this.trailEffects = null;
        
        // Estado da cena
        this.connectedWallet = null;
        this.cursors = null;
        this.spaceKey = null;
        this.testExplosionKey = null;
        
        // Grupos de física (serão gerenciados pelos managers)
        this.projectiles = null;
        this.meteorsGroup = null;
        
        // Timers
        
        // Performance
        this.lastCleanup = 0;
        this.cleanupInterval = 30000;
        this.lastDebugTime = 0;
        
        // Mira personalizada
        this.crosshair = null;
        this.crosshairPulseTween = null;
        
        // Sistema de lock-on
        this.lockedTarget = null;
        this.lockOnStartTime = 0;
        this.lockOnDuration = 3000; // 3 segundos
        this.lockOnIndicator = null;
    }

    preload() {
        // Define o caminho base para os assets
        this.load.setPath('');
        
        // Carrega o JSON da nave padrão
        this.load.json('defaultShipMetadata', 'src/assets/default_ship_metadata.json');
        
        // Carrega os assets com caminhos absolutos
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
        
        // Sons
        this.load.audio('rocket', '/assets/sounds_effects/rocket.mp3');
        this.load.audio('explosion', '/assets/sounds_effects/explosion.mp3');
        this.load.audio('bullet', '/assets/sounds_effects/bullet.mp3');
        
        // Logs de depuração
        this.load.on('filecomplete', (key, type, data) => {
            console.log('Asset carregado:', key, type);
        });
        
        this.load.on('loaderror', (file) => {
            console.error('Erro ao carregar asset:', file.src);
        });
    }

    async create(data) {
        console.log('🎬 GameSceneModular create() iniciado');
        console.log('🔍 Data recebida:', data);
        
        // Verificar se this.sys está disponível
        if (!this.sys) {
            console.error('❌ this.sys não está disponível no início do create()!');
            return;
        }
        
        console.log('✅ this.sys disponível:', this.sys);
        console.log('✅ Scene key:', this.sys.settings.key);
        
        // Track game scene load
        // track('game_scene_loaded', {
        //     player_name: data?.playerName || 'Unknown',
        //     has_wallet: !!data?.walletAddress,
        //     has_nft: !!data?.nftImage
        // });
        console.log('✅ Game scene loaded');
        
        // Inicializa managers de efeitos
        console.log('🔍 Inicializando managers de efeitos...');
        this.initializeEffectManagers();
        console.log('✅ Managers de efeitos inicializados');
        
        // Inicializa managers especializados
        console.log('🔍 Inicializando managers especializados...');
        this.initializeSpecializedManagers(data);
        console.log('✅ Managers especializados inicializados');
        
        // Configuração da cena
        console.log('🔍 Configurando cena...');
        this.setupScene(data);
        console.log('✅ Cena configurada');
        
        // Criação de objetos do jogo
        console.log('🔍 Criando objetos do jogo...');
        await this.createGameObjects();
        console.log('✅ Objetos do jogo criados');
        
        // Configuração de sistemas
        console.log('🔍 Configurando sistemas...');
        this.setupSystems();
        console.log('✅ Sistemas configurados');
        
        // Configuração de entrada
        console.log('🔍 Configurando entrada...');
        this.setupInput();
        console.log('✅ Entrada configurada');
        
        // Fade in suave
        console.log('🔍 Iniciando fade in...');
        this.juiceManager.fadeIn(800);
        console.log('✅ Fade in iniciado');
        
        // Esconder loading screen
        console.log('🔍 Escondendo loading screen...');
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            console.log('✅ Loading screen escondida');
        } else {
            console.log('⚠️ Loading screen não encontrada');
        }
        
        console.log('🎉 GameSceneModular create() concluído com sucesso!');
    }

    initializeEffectManagers() {
        console.log('🔍 Inicializando JuiceManager...');
        // Verificar se this.sys está disponível
        if (!this.sys) {
            console.error('❌ this.sys não está disponível!');
            return;
        }
        // Inicializa os managers de Game Juice
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

    initializeSpecializedManagers(data) {
        console.log('🔍 Inicializando GameStateManager...');
        // Verificar se this.sys está disponível
        if (!this.sys) {
            console.error('❌ this.sys não está disponível!');
            return;
        }
        // Inicializa GameStateManager
        this.gameState = new GameStateManager(this);
        console.log('✅ GameStateManager inicializado');
        
        // Configura dados iniciais
        if (data && data.playerName) {
            console.log('🔍 Configurando nome do jogador...');
            this.gameState.setPlayerName(data.playerName);
            console.log('✅ Nome do jogador configurado');
        }
        
        this.connectedWallet = data && data.walletAddress ? data.walletAddress : null;
        
        console.log('🔍 Inicializando ShipManager...');
        // Inicializa ShipManager completo
        this.shipManager = new ShipManager(this, this.gameState);
        console.log('✅ ShipManager inicializado');
        
        console.log('🔍 Inicializando CollisionManager...');
        this.collisionManager = new CollisionManager(this);
        console.log('✅ CollisionManager inicializado');
        
        console.log('🔍 Inicializando UIManager...');
        this.uiManager = new UIManager(this, this.gameState);
        console.log('✅ UIManager inicializado');
        
        console.log('🔍 Inicializando EnemyManager...');
        this.enemyManager = new EnemyManager(this, this.collisionManager);
        console.log('✅ EnemyManager inicializado');
        
        console.log('🔍 Inicializando MeteorManager...');
        this.meteorManager = new MeteorManager(this, this.collisionManager);
        console.log('✅ MeteorManager inicializado');
        
        console.log('🔍 Inicializando ProjectileManager...');
        this.projectileManager = new ProjectileManager(this, this.collisionManager);
        console.log('✅ ProjectileManager inicializado');
        
        console.log('🔍 Inicializando MiningManager...');
        this.miningManager = new MiningManager(this, this.collisionManager);
        console.log('✅ MiningManager inicializado');
        
        console.log('🔍 Inicializando BackgroundManager...');
        this.backgroundManager = new BackgroundManager(this);
        console.log('✅ BackgroundManager inicializado');
        
        console.log('🔍 Inicializando GameOverManager...');
        this.gameOverManager = new GameOverManager(this);
        console.log('✅ GameOverManager inicializado');
        
        console.log('🔍 Inicializando RocketManager...');
        this.rocketManager = new RocketManager(this, this.collisionManager);
        console.log('✅ RocketManager inicializado');
        
        console.log('🔍 Inicializando MultiplayerManager...');
        this.multiplayerManager = new MultiplayerManager(this);
        console.log('✅ MultiplayerManager inicializado');
    }

    setupScene(data) {
        // Obtém as dimensões da tela
        const screenWidth = this.game.config.width;
        const screenHeight = this.game.config.height;
        
        // Cria um mundo maior que a tela para permitir movimento infinito
        this.physics.world.setBounds(-2000, -2000, 4000, 4000);
        
        // Configura o som do foguete
        this.rocketSound = this.sound.add('rocket', {
            loop: true,
            volume: 0.5
        });
        this.isRocketPlaying = false;
        
        // Background agora é gerenciado pelo BackgroundManager
        console.log('🌌 Background delegado ao BackgroundManager');
        
        // Cria animações
        this.createAnimations();
        
        // Configura a câmera
        this.setupCamera();
        
        // Cria a mira do mouse
        this.createCrosshair();
    }

    async createGameObjects() {
        console.log('🔍 Inicializando sistema de background...');
        // Inicializa BackgroundManager ANTES da nave (não depende da nave)
        this.backgroundManager.initialize();
        console.log('✅ Sistema de background inicializado');
        
        console.log('🔍 Criando nave...');
        // Cria a nave usando ShipManager
        await this.shipManager.create();
        console.log('✅ Nave criada:', this.shipManager.ship);
        
        // Configura câmera para seguir a nave agora que ela existe
        if (this.shipManager.ship) {
            this.cameras.main.startFollow(this.shipManager.ship);
            console.log('✅ Camera configurada para seguir a nave');
        }
        
        console.log('🔍 Configurando colisões...');
        // Configura colisões usando CollisionManager
        this.collisionManager.setupAllCollisions(this.shipManager.ship);
        console.log('✅ Colisões configuradas');
        
        console.log('🔍 Inicializando sistema de inimigos...');
        // Inicializa EnemyManager com a nave do jogador
        this.enemyManager.initialize(this.shipManager.ship);
        console.log('✅ Sistema de inimigos inicializado');
        
        console.log('🔍 Inicializando sistema de meteoros...');
        // Inicializa MeteorManager com a nave do jogador e trail effects
        this.meteorManager.initialize(this.shipManager.ship, this.trailEffects);
        console.log('✅ Sistema de meteoros inicializado');
        
        console.log('🔍 Inicializando sistema de projéteis...');
        // Inicializa ProjectileManager com todos os efeitos necessários
        this.projectileManager.initialize(
            this.shipManager.ship, 
            this.particleEffects, 
            this.audioManager, 
            this.juiceManager
        );
        console.log('✅ Sistema de projéteis inicializado');
        
        console.log('🔍 Inicializando sistema de mineração...');
        // Inicializa MiningManager com todos os componentes necessários
        this.miningManager.initialize(
            this.shipManager,
            this.gameState,
            this.uiManager,
            this.particleEffects,
            this.uiAnimations
        );
        console.log('✅ Sistema de mineração inicializado');
        
        // BackgroundManager já foi inicializado anteriormente
        
        console.log('🔍 Inicializando sistema de game over...');
        // Inicializa GameOverManager com todos os componentes necessários
        this.gameOverManager.initialize(
            this.gameState,
            this.shipManager,
            this.juiceManager,
            this.particleEffects,
            this.audioManager,
            this.uiAnimations
        );
        console.log('✅ Sistema de game over inicializado');
        
        console.log('🔍 Inicializando sistema de foguetes...');
        // Inicializa RocketManager com todos os componentes necessários
        this.rocketManager.initialize(
            this.shipManager,
            this.enemyManager,
            this.particleEffects,
            this.audioManager,
            this.juiceManager
        );
        console.log('✅ Sistema de foguetes inicializado');
        
        console.log('🔍 Inicializando sistema multiplayer...');
        // Inicializa MultiplayerManager (async)
        this.multiplayerManager.init().catch(err => {
            console.error('❌ Erro ao inicializar multiplayer:', err);
        });
        console.log('✅ Sistema multiplayer inicializado');
        
        // Configura a mineração
        this.setupMining();
    }

    setupSystems() {
        // Configura eventos do GameState
        this.events.on('gameover', this.handleGameOver.bind(this));
        this.events.on('pause', this.handlePause.bind(this));
        this.events.on('resume', this.handleResume.bind(this));
        
        // Configura eventos de mineração
        this.events.on('mining_planet_contact', this.handleMiningContact.bind(this));
    }

    setupInput() {
        // Desativa menu de contexto do botão direito
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                // O Phaser já previne o menu de contexto automaticamente
                // Não precisamos fazer nada adicional aqui
                return;
            }
        });
        
        // Captura a entrada do teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.testExplosionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        
        // Debug dos controles
        // Controles de teste para raridades
        this.input.keyboard.on('keydown-ONE', () => {
            if (this.shipManager) {
                this.shipManager.setRarityForTesting('Comum');
            }
        });
        
        this.input.keyboard.on('keydown-TWO', () => {
            if (this.shipManager) {
                this.shipManager.setRarityForTesting('Incomum');
            }
        });
        
        this.input.keyboard.on('keydown-THREE', () => {
            if (this.shipManager) {
                this.shipManager.setRarityForTesting('Raro');
            }
        });
        
        this.input.keyboard.on('keydown-FOUR', () => {
            if (this.shipManager) {
                this.shipManager.setRarityForTesting('Épico');
            }
        });
        
        this.input.keyboard.on('keydown-FIVE', () => {
            if (this.shipManager) {
                this.shipManager.setRarityForTesting('Lendário');
            }
        });
        
        console.log('🎮 Controles de teste de raridade configurados (teclas 1-5)');
        
        // Configura o clique esquerdo do mouse para disparar
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.projectileManager.fireProjectile();
            }
        });
    }

    createAnimations() {
        // Cria a animação da nave com propulsão
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

        // Cria a animação da nave em idle
        this.anims.create({
            key: 'ship_idle',
            frames: [{ key: 'ship_idle' }],
            frameRate: 1,
            repeat: 0
        });
        
        // Cria a animação do inimigo com propulsão
        this.anims.create({
            key: 'enemy_thrust',
            frames: this.anims.generateFrameNames('enemy', {
                prefix: '02 ',
                start: 0,
                end: 1,
                suffix: '.aseprite'
            }),
            frameRate: 10,
            repeat: -1
        });
        
        // Cria a animação de explosão
        this.createExplosionAnimation();
        
        // Cria animação do meteoro
        this.anims.create({
            key: 'meteoro_anim',
            frames: [
                { key: 'meteoro', frame: 'meteoro 0.aseprite' },
                { key: 'meteoro', frame: 'meteoro 1.aseprite' }
            ],
            frameRate: 8,
            repeat: -1
        });
    }

    createExplosionAnimation() {
        let explosionFrameNames = this.textures.exists('explosion') ? 
            this.textures.get('explosion').getFrameNames().filter(n => n !== '__BASE') : [];
        
        explosionFrameNames = explosionFrameNames.sort((a, b) => {
            const ra = a.match(/(\d+)/g); 
            const rb = b.match(/(\d+)/g);
            const na = ra ? parseInt(ra[ra.length-1], 10) : 0;
            const nb = rb ? parseInt(rb[rb.length-1], 10) : 0;
            return na - nb;
        });
        
        this.explosionFrameNames = explosionFrameNames;
        
        if (explosionFrameNames.length > 0) {
            const explosionFrames = explosionFrameNames.map(fn => ({ key: 'explosion', frame: fn }));
            
            if (this.anims.exists('explosion_anim')) {
                this.anims.remove('explosion_anim');
            }
            
            this.anims.create({
                key: 'explosion_anim',
                frames: explosionFrames,
                frameRate: 15,
                repeat: 0
            });
        }
    }

    setupCamera() {
        // Faz a câmera seguir a nave
        if (this.shipManager && this.shipManager.ship) {
            this.cameras.main.startFollow(this.shipManager.ship);
        } else {
            console.log('⚠️ Camera: Nave não disponível ainda, configurando depois');
        }
        
        // Define um zoom fixo confortável
        this.cameras.main.setZoom(1);
        this.cameras.main.setViewport(0, 0, this.game.config.width, this.game.config.height);
    }

    createCrosshair() {
        // Cria a mira personalizada usando aim1.png
        this.crosshair = this.add.image(0, 0, 'crosshair');
        this.crosshair.setScale(0.15); // Reduzido em 70% (era 0.5, agora 0.15)
        this.crosshair.setDepth(10);
        this.crosshair.setOrigin(0.5, 0.5); // Centraliza a mira no ponto vermelho
        
        // Esconde o cursor padrão do navegador
        this.input.setDefaultCursor('none');
        
        console.log('🎯 Mira personalizada criada com aim1.png (escala reduzida em 70%)');
    }

    setupMining() {
        // Sistema de mineração agora é gerenciado pelo MiningManager
        console.log('⛏️ Sistema de mineração delegado ao MiningManager');
    }

    // === EVENT HANDLERS ===
    handleGameOver(eventData) {
        // Delega para o GameOverManager
        if (this.gameOverManager) {
            this.gameOverManager.handleGameOver(eventData);
        } else {
            console.warn('⚠️ GameOverManager não disponível');
        }
    }

    handlePause() {
        // Implementar lógica de pausa
        console.log('Game paused');
    }

    handleResume() {
        // Implementar lógica de retomada
        console.log('Game resumed');
    }

    handleMiningContact(eventData) {
        // Lógica adicional de contato com planeta minerável
        console.log('Mining planet contact', eventData);
    }

    createGameOverButtons(centerX, centerY) {
        // Botão Reiniciar
        const restartBtn = this.add.rectangle(
            centerX, centerY + 150, 400, 80, 0x00ff00, 0.3
        ).setScrollFactor(0).setDepth(202).setInteractive({ useHandCursor: true })
        .setStrokeStyle(4, 0x00ff00, 1);
        
        const restartText = this.add.text(centerX, centerY + 150, '🔄 PLAY AGAIN', {
            fontFamily: 'Arial',
            fontSize: '30px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(203);
        
        // Botão Menu
        const menuBtn = this.add.rectangle(
            centerX, centerY + 245, 400, 70, 0x00d4ff, 0.3
        ).setScrollFactor(0).setDepth(202).setInteractive({ useHandCursor: true })
        .setStrokeStyle(3, 0x00d4ff, 0.8);
        
        const menuText = this.add.text(centerX, centerY + 245, '🏠 BACK TO MENU', {
            fontFamily: 'Arial',
            fontSize: '26px',
            color: '#00d4ff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(203);
        
        // Eventos dos botões
        restartBtn.on('pointerdown', () => {
            // track('game_restarted', {
            //     player_name: this.gameState.playerName,
            //     final_score: this.gameState.score,
            //     final_level: this.gameState.level
            // });
            console.log('Game restarted tracked');
            
            restartBtn.setScale(0.95);
            this.time.delayedCall(100, () => {
                if (this.juiceManager) {
                    this.juiceManager.fadeOut(500, () => {
                        this.scene.restart({ playerName: this.gameState.playerName });
                    });
                }
            });
        });
        
        menuBtn.on('pointerdown', () => {
            // track('return_to_menu', {
            //     player_name: this.gameState.playerName,
            //     final_score: this.gameState.score,
            //     final_level: this.gameState.level
            // });
            console.log('Return to menu tracked');
            
            menuBtn.setScale(0.95);
            this.time.delayedCall(100, () => {
                if (this.juiceManager) {
                    this.juiceManager.fadeOut(500, () => {
                        const gameLaunch = document.getElementById('game-launch');
                        if (gameLaunch) {
                            gameLaunch.style.display = 'none';
                        }
                        this.scene.stop();
                    });
                }
            });
        });
    }

    animateGameOverScreen(overlay, panel, border, text) {
        overlay.setAlpha(0);
        panel.setScale(0.3);
        border.setScale(0.3);
        text.setScale(0);
        
        this.tweens.add({
            targets: overlay,
            alpha: 0.9,
            duration: 600,
            ease: 'Power2'
        });
        
        this.tweens.add({
            targets: [panel, border],
            scale: 1,
            duration: 600,
            ease: 'Back.easeOut'
        });
        
        this.tweens.add({
            targets: text,
            scale: 1,
            duration: 800,
            delay: 300,
            ease: 'Elastic.easeOut'
        });
    }

    // === UPDATE LOOP ===
    update(time, delta) {
        // Debug: verificar se update está sendo chamado
        if (!this.updateCallCount) {
            this.updateCallCount = 0;
        }
        this.updateCallCount++;
        
        if (this.updateCallCount % 60 === 0) { // A cada segundo (60fps)
            console.log('🔄 Update chamado:', this.updateCallCount, 'vezes');
        }
        
        // Memory cleanup
        if (time - this.lastCleanup > this.cleanupInterval) {
            this.performMemoryCleanup();
            this.lastCleanup = time;
        }
        
        // Debug performance
        if (!this.lastDebugTime || time - this.lastDebugTime > 5000) {
            const meteorCount = this.meteorManager ? this.meteorManager.getMeteorCount() : 0;
            const enemyCount = this.enemyManager ? this.enemyManager.getEnemyCount() : 0;
            const projectileCount = this.projectileManager ? this.projectileManager.getProjectileCount() : 0;
            const rocketStats = this.rocketManager ? this.rocketManager.getRocketStats() : null;
            const miningStats = this.miningManager ? this.miningManager.getMiningStats() : null;
            const backgroundStats = this.backgroundManager ? this.backgroundManager.getBackgroundStats() : null;
            console.log(`[PERFORMANCE] Meteoros: ${meteorCount}, Inimigos: ${enemyCount}, Projéteis: ${projectileCount}, Foguetes: ${rocketStats ? rocketStats.activeRockets : 0}, Planetas: ${miningStats ? miningStats.activePlanets : 0}, Estrelas: ${backgroundStats ? backgroundStats.visibleStars : 0}`);
            this.lastDebugTime = time;
        }
        
        // Renderiza trails
        if (this.trailEffects) {
            this.trailEffects.renderLineTrails();
        }
        
        // Cull entities
        this.cullEntities();
        
        // Debug explosion
        if (this.testExplosionKey && Phaser.Input.Keyboard.JustDown(this.testExplosionKey)) {
            this.createTestExplosion();
        }
        
        // Atualiza sistema de projéteis
        if (this.projectileManager) {
            this.projectileManager.update();
        }
        
        // Atualiza sistema de foguetes
        if (this.rocketManager) {
            this.rocketManager.update();
        }
        
        // Atualiza sistema de mineração
        if (this.miningManager) {
            this.miningManager.update();
        }
        
        // Atualiza meteoros
        if (this.meteorManager) {
            this.meteorManager.update();
        }
        
        // Atualiza inimigos
        if (this.enemyManager) {
            this.enemyManager.update();
        }
        
        // Atualiza nave
        if (this.shipManager) {
            this.shipManager.update();
            
            // Controle de movimento (apenas propulsão com espaço)
            const inputState = {
                thrust: this.spaceKey ? this.spaceKey.isDown : false
            };
            
            // Debug da propulsão
            if (inputState.thrust) {
                console.log('🎮 GameScene: Propulsão detectada:', inputState);
            }
            
            this.shipManager.updateMovement(inputState, delta);
            
            // Atualiza posição no multiplayer
            if (this.multiplayerManager && this.shipManager.ship) {
                this.multiplayerManager.updatePosition(
                    this.shipManager.ship.x,
                    this.shipManager.ship.y
                );
            }
        }
        
        // Atualiza oxigênio
        this.updateOxygen(delta);
        
        // Atualiza UI
        if (this.uiManager) {
            this.uiManager.update();
        }
        
        // Atualiza sistema de background
        if (this.backgroundManager) {
            this.backgroundManager.update(time, delta);
        }
        
        // Atualiza sistema multiplayer
        if (this.multiplayerManager) {
            this.multiplayerManager.update();
        }
        
        // Atualiza mira
        this.updateCrosshair();
    }

    updateOxygen(delta) {
        if (this.gameState.isGameOver) return;
        
        const deltaSec = delta / 1000;
        if (!this.gameState.consumeOxygen(this.gameState.oxygenConsumptionRate * deltaSec)) {
            // Game over por oxigênio
        }
    }

    updateCrosshair() {
        if (!this.crosshair || !this.shipManager.ship) return;
        
        const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
        this.crosshair.x = worldPoint.x;
        this.crosshair.y = worldPoint.y;
        
        // Efeito visual: pulsação sutil da mira (proporcional ao novo tamanho)
        if (!this.crosshairPulseTween) {
            this.crosshairPulseTween = this.tweens.add({
                targets: this.crosshair,
                scaleX: 0.18, // Proporcional ao novo tamanho (0.15 * 1.2)
                scaleY: 0.18,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Sistema de lock-on
        this.updateLockOnSystem();
    }

    /**
     * Sistema de lock-on - detecta inimigos sob a mira e trava alvos
     */
    updateLockOnSystem() {
        if (!this.enemyManager) return;
        
        const crosshairX = this.crosshair.x;
        const crosshairY = this.crosshair.y;
        const lockRadius = 50; // Raio de detecção da mira
        
        // Busca inimigo mais próximo da mira
        const enemies = this.enemyManager.getAliveEnemies();
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        enemies.forEach(enemy => {
            if (enemy.active) {
                const distance = Phaser.Math.Distance.Between(
                    crosshairX, crosshairY,
                    enemy.x, enemy.y
                );
                
                if (distance < lockRadius && distance < closestDistance) {
                    closestDistance = distance;
                    closestEnemy = enemy;
                }
            }
        });
        
        // Se encontrou um inimigo próximo
        if (closestEnemy) {
            // Se é o mesmo inimigo que estava sendo travado
            if (this.lockedTarget === closestEnemy) {
                // Continua travando
                const currentTime = Date.now();
                const lockTime = currentTime - this.lockOnStartTime;
                
                // Se passou do tempo necessário, confirma o lock
                if (lockTime >= this.lockOnDuration) {
                    this.confirmLockOn(closestEnemy);
                }
            } else {
                // Novo inimigo, reinicia o processo
                this.lockedTarget = closestEnemy;
                this.lockOnStartTime = Date.now();
                this.createLockOnIndicator(closestEnemy);
            }
        } else {
            // Nenhum inimigo próximo, cancela lock
            this.cancelLockOn();
        }
    }
    
    /**
     * Confirma o lock-on no inimigo
     */
    confirmLockOn(enemy) {
        if (!this.lockOnIndicator) return;
        
        // Destrói o indicador vermelho e cria um verde
        this.lockOnIndicator.destroy();
        
        // Cria novo indicador verde para confirmar lock
        this.lockOnIndicator = this.add.circle(enemy.x, enemy.y, 40, 0x00ff00, 0.5);
        this.lockOnIndicator.setDepth(enemy.depth + 1);
        this.lockOnIndicator.setStrokeStyle(4, 0x00ff00, 1.0);
        this.lockOnIndicator.setScale(1.2);
        
        // Animação pulsante mais intensa
        this.tweens.add({
            targets: this.lockOnIndicator,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        console.log(`🎯 Lock-on confirmado no inimigo!`);
    }
    
    /**
     * Cancela o lock-on atual
     */
    cancelLockOn() {
        if (this.lockedTarget) {
            this.lockedTarget = null;
            this.lockOnStartTime = 0;
            
            if (this.lockOnIndicator) {
                this.lockOnIndicator.destroy();
                this.lockOnIndicator = null;
            }
        }
    }
    
    /**
     * Cria indicador visual de lock-on
     */
    createLockOnIndicator(enemy) {
        // Remove indicador anterior se existir
        if (this.lockOnIndicator) {
            this.lockOnIndicator.destroy();
        }
        
        // Cria círculo vermelho ao redor do inimigo
        this.lockOnIndicator = this.add.circle(enemy.x, enemy.y, 40, 0xff0000, 0.3);
        this.lockOnIndicator.setDepth(enemy.depth + 1);
        this.lockOnIndicator.setStrokeStyle(3, 0xff0000, 0.8);
        
        // Animação pulsante
        this.tweens.add({
            targets: this.lockOnIndicator,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    /**
     * Obtém o alvo travado pelo sistema de lock-on
     */
    getLockedTarget() {
        // Verifica se o alvo travado ainda está ativo
        if (this.lockedTarget && this.lockedTarget.active) {
            const currentTime = Date.now();
            const lockTime = currentTime - this.lockOnStartTime;
            
            // Só retorna o alvo se o lock foi confirmado (3+ segundos)
            if (lockTime >= this.lockOnDuration) {
                return this.lockedTarget;
            }
        }
        
        return null;
    }

    createTestExplosion() {
        const cam = this.cameras.main;
        const cx = cam.scrollX + cam.width / 2;
        const cy = cam.scrollY + cam.height / 2;
        
        console.log('DEBUG: test explosion spawn at', cx, cy);
        
        if (this.textures.exists('explosion')) {
            const frames = this.textures.get('explosion').getFrameNames().filter(n => n !== '__BASE');
            const firstFrame = (this.explosionFrameNames && this.explosionFrameNames.length) ? 
                this.explosionFrameNames[0] : frames[0];
            
            const spr = firstFrame ? 
                this.add.sprite(cx, cy, 'explosion', firstFrame) : 
                this.add.sprite(cx, cy, 'explosion');
            
            spr.setOrigin(0.5, 0.5);
            spr.setDepth(1000);
            this.children.bringToTop(spr);
            
            if (this.anims.exists('explosion_anim')) {
                spr.once('animationcomplete', () => {
                    spr.destroy();
                });
                spr.play('explosion_anim');
            }
        }
    }

    cullEntities() {
        if (!this.shipManager.ship) return;
        
        const sx = this.shipManager.ship.x;
        const sy = this.shipManager.ship.y;
        const r = 1200; // cull radius
        const r2 = r * r;

        // Cull meteoros usando MeteorManager
        if (this.meteorManager) {
            this.meteorManager.cullMeteors();
        }

        // Cull projéteis usando ProjectileManager
        if (this.projectileManager) {
            this.projectileManager.cullProjectiles();
        }

        // Cull foguetes usando RocketManager
        if (this.rocketManager) {
            this.rocketManager.cullRockets();
        }

        // Cull planetas mineráveis usando MiningManager
        if (this.miningManager) {
            this.miningManager.cullMiningPlanets();
        }
    }

    performMemoryCleanup() {
        console.log('[MEMORY] Performing cleanup...');
        
        // Limpa projéteis antigos
        const projectiles = this.collisionManager ? this.collisionManager.getGroup('projectiles') : null;
        if (projectiles) {
            projectiles.getChildren().forEach(projectile => {
                if (projectile.active && projectile.lifespan) {
                    projectile.lifespan -= 1000;
                    if (projectile.lifespan <= 0) {
                        projectile.destroy();
                    }
                }
            });
        }
        
        // Limpa meteoros usando MeteorManager
        if (this.meteorManager) {
            this.meteorManager.cleanupDistantMeteors();
        }
        
        // Limpa projéteis usando ProjectileManager
        if (this.projectileManager) {
            this.projectileManager.cleanupDistantProjectiles();
        }
        
        // Limpa foguetes distantes usando RocketManager
        if (this.rocketManager) {
            this.rocketManager.cleanupDistantRockets();
        }
        
        // Força garbage collection se disponível
        if (window.gc) {
            window.gc();
        }
        
        console.log('[MEMORY] Cleanup completed');
    }

    // === CLEANUP ===
    shutdown() {
        // Limpa managers
        if (this.shipManager) this.shipManager.destroy();
        if (this.collisionManager) this.collisionManager.destroy();
        if (this.uiManager) this.uiManager.destroy();
        if (this.enemyManager) this.enemyManager.destroy();
        if (this.meteorManager) this.meteorManager.destroy();
        if (this.projectileManager) this.projectileManager.destroy();
        if (this.miningManager) this.miningManager.destroy();
        if (this.backgroundManager) this.backgroundManager.destroy();
        if (this.gameOverManager) this.gameOverManager.destroy();
        if (this.rocketManager) this.rocketManager.destroy();
        if (this.multiplayerManager) this.multiplayerManager.destroy();
        
        // Limpa efeitos
        if (this.particleEffects) this.particleEffects.cleanup();
        if (this.trailEffects) this.trailEffects.cleanup();
        if (this.uiAnimations) this.uiAnimations.cleanup();
        
        // Limpa mira personalizada
        if (this.crosshairPulseTween) {
            this.crosshairPulseTween.destroy();
        }
        if (this.crosshair) {
            this.crosshair.destroy();
        }
        if (this.audioManager) this.audioManager.destroy();
        
        // Salva estado do jogo
        if (this.gameState) {
            this.gameState.saveToLocalStorage();
        }
    }
}