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
import EnemyManager from '../managers/EnemyManager.js';
import MeteorManager from '../managers/MeteorManager.js';
import ProjectileManager from '../managers/ProjectileManager.js';
import MiningManager from '../managers/MiningManager.js';
import RocketManager from '../managers/RocketManager.js';

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
        this.enemyManager = null;
        this.meteorManager = null;
        this.projectileManager = null;
        this.miningManager = null;
        this.rocketManager = null;

        // Managers multiplayer (novos)
        this.multiplayerManager = null;
        this.assetManager = null;
        this.spriteSheetManager = null;

        // Estado da cena (mantido do original)
        this.connectedWallet = null;
        this.cursors = null;
        this.spaceKey = null;
        this.testExplosionKey = null;

        // Grupos de física (agora gerenciados pelos managers)
        // Os grupos são criados pelos managers específicos

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

        // Carrega assets de áudio do original (caminhos corrigidos)
        this.load.audio('laser', '/assets/sounds_effects/bullet.mp3');
        this.load.audio('explosion', '/assets/sounds_effects/explosion.mp3');
        this.load.audio('engine', '/assets/sounds_effects/rocket.mp3');
        this.load.audio('pickup', '/assets/sounds_effects/bullet.mp3'); // reaproveita
        this.load.audio('rocket', '/assets/sounds_effects/rocket-launch.mp3');
        this.load.audio('damage', '/assets/sounds_effects/explosion.mp3'); // reaproveita
        this.load.audio('powerup', '/assets/sounds_effects/rocket.mp3'); // reaproveita

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

        // EnemyManager (mantido do original)
        this.enemyManager = new EnemyManager(this, this.collisionManager);
        console.log('✅ EnemyManager inicializado');

        // MeteorManager (mantido do original)
        this.meteorManager = new MeteorManager(this, this.collisionManager);
        console.log('✅ MeteorManager inicializado');

        // ProjectileManager (mantido do original)
        this.projectileManager = new ProjectileManager(this, this.collisionManager);
        console.log('✅ ProjectileManager inicializado');

        // MiningManager (mantido do original)
        this.miningManager = new MiningManager(this, this.collisionManager);
        console.log('✅ MiningManager inicializado');

        // BackgroundManager (mantido)
        this.backgroundManager = new BackgroundManager(this);
        console.log('✅ BackgroundManager inicializado');

        // GameOverManager (adaptado para contexto multiplayer)
        this.gameOverManager = new GameOverManager(this);
        console.log('✅ GameOverManager inicializado');

        // RocketManager (mantido do original)
        this.rocketManager = new RocketManager(this, this.collisionManager);
        console.log('✅ RocketManager inicializado');
    }

    async initializeMultiplayerManagers() {
        console.log('🌐 Inicializando managers multiplayer...');

        // SpriteSheetManager (novo - para elementos do banco)
        console.log('🔍 Inicializando SpriteSheetManager...');
        this.spriteSheetManager = new SpriteSheetManager(this);
        // Desativado init() pois estamos usando assets existentes, não geração procedural
        console.log('✅ SpriteSheetManager inicializado (sem geração procedural)');

        // AssetManager (novo - para gerenciar assets multiplayer)
        console.log('🔍 Inicializando AssetManager...');
        this.assetManager = new AssetManager(this, this.spriteSheetManager);
        console.log('✅ AssetManager inicializado');

        // MultiplayerManager (principal - gerencia mundo compartilhado)
        console.log('🔍 Inicializando MultiplayerManager...');
        this.multiplayerManager = new MultiplayerManager(this);
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

        // Grupos de física são criados pelos managers específicos
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

        // Atualizar nome do jogador com username do multiplayer
        if (this.multiplayerManager && this.multiplayerManager.playerId) {
            console.log('🏷️ Player ID do multiplayer:', this.multiplayerManager.playerId);
            // Usar o playerId como nome temporário
            this.shipManager.createPlayerNameText(`Player_${this.multiplayerManager.playerId.slice(0, 8)}`);
        }

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

        // Inicializa sistema de NPCs (apenas para NPCs multiplayer, não spawn automático)
        console.log('🔍 Inicializando sistema de NPCs...');
        this.enemyManager.initialize(this.shipManager.ship);
        // Desativa spawn automático para multiplayer - NPCs serão spawnados pelo MultiplayerManager
        if (this.enemyManager.spawnTimer) {
            this.enemyManager.spawnTimer.remove(false);
            this.enemyManager.spawnTimer = null;
        }
        console.log('✅ Sistema de NPCs inicializado (spawn automático desativado)');

        // Inicializa sistema de meteoros
        console.log('🔍 Inicializando sistema de meteoros...');
        this.meteorManager.initialize(this.shipManager.ship, this.trailEffects);
        console.log('✅ Sistema de meteoros inicializado');

        // Inicializa sistema de projéteis
        console.log('🔍 Inicializando sistema de projéteis...');
        this.projectileManager.initialize(
            this.shipManager.ship,
            this.particleEffects,
            this.audioManager,
            this.juiceManager
        );
        console.log('✅ Sistema de projéteis inicializado');

        // Inicializa sistema de mineração
        console.log('🔍 Inicializando sistema de mineração...');
        this.miningManager.initialize(
            this.shipManager,
            this.gameState,
            this.uiManager,
            this.particleEffects,
            this.uiAnimations
        );
        console.log('✅ Sistema de mineração inicializado');

        // Inicializa sistema de foguetes (sem inimigos por padrão no multiplayer)
        console.log('🔍 Inicializando sistema de foguetes...');
        this.rocketManager.initialize(
            this.shipManager,
            null, // Sem EnemyManager por padrão - NPCs serão gerenciados pelo MultiplayerManager
            this.particleEffects,
            this.audioManager,
            this.juiceManager
        );
        console.log('✅ Sistema de foguetes inicializado (sem inimigos automáticos)');

        // Inicializa sistema de game over
        console.log('🔍 Inicializando sistema de game over...');
        this.gameOverManager.initialize(
            this.gameState,
            this.shipManager,
            this.juiceManager,
            this.particleEffects,
            this.audioManager,
            this.uiAnimations
        );
        console.log('✅ Sistema de game over inicializado');

        // UI (adaptada para informações multiplayer)
        console.log('🔍 Inicializando interface multiplayer...');
        this.uiManager.createUI();
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
        console.log('🎮 Configurando controles de input...');

        // Desativa menu de contexto do botão direito
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                return;
            }
        });

        // Captura entrada do teclado (mesmos do GameSceneModular)
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.testExplosionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Controles de teste para raridades (mesmos do original)
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

        // Configura clique do mouse para disparar
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.fireProjectile();
            }
        });

        console.log('✅ Controles configurados');
    }

    setupMultiplayerEvents() {
        // Configurar eventos multiplayer vindo do MultiplayerManager

        // Player entrou no mesmo chunk
        this.events.on('player:joined', (data) => {
            console.log('👤 Player entrou na cena:', data.username);
            // MultiplayerManager já cuida de criar o sprite
        });

        // Player saiu do chunk
        this.events.on('player:left', (data) => {
            console.log('👋 Player saiu da cena:', data.playerId);
            // MultiplayerManager já cuida de remover o sprite
        });

        // Player se moveu
        this.events.on('player:moved', (data) => {
            // MultiplayerManager cuida da interpolação
            console.log('🏃 Player se moveu:', data.playerId, `para (${data.x}, ${data.y})`);
        });

        // Dados do chunk recebidos
        this.events.on('chunk:data', (data) => {
            console.log('📦 Chunk data recebido na cena:', data);
            // MultiplayerManager processa os dados
        });

        // Conexão multiplayer estabelecida
        this.events.on('multiplayer:connected', () => {
            console.log('🔌 Multiplayer conectado na cena');
        });

        // Autenticação multiplayer
        this.events.on('multiplayer:authenticated', (data) => {
            console.log('🔐 Multiplayer autenticado na cena:', data);
            // Atualizar nome do jogador se ainda não tiver sido feito
            if (this.shipManager && this.multiplayerManager && this.multiplayerManager.playerId) {
                this.shipManager.createPlayerNameText(`Player_${this.multiplayerManager.playerId.slice(0, 8)}`);
            }
        });

        console.log('✅ Eventos multiplayer configurados na cena');
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

        // Animação de explosão (baseado no GameSceneModular)
        this.createExplosionAnimation();

        // Cria animação do meteoro (baseado no GameSceneModular)
        this.anims.create({
            key: 'meteoro_anim',
            frames: [
                { key: 'meteoro', frame: 'meteoro 0.aseprite' },
                { key: 'meteoro', frame: 'meteoro 1.aseprite' }
            ],
            frameRate: 8,
            repeat: -1
        });

        console.log('✅ Animações criadas');
    }

    /**
     * Cria animação de explosão (baseado no GameSceneModular)
     */
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
        // Configuração da câmera mantida do original
        this.cameras.main.setZoom(1);
        this.cameras.main.setBounds(-50000, -50000, 100000, 100000);

        console.log('✅ Câmera configurada');
    }

    createCrosshair() {
        // Cria a mira personalizada usando aim1.png (mesmo do original)
        this.crosshair = this.add.image(0, 0, 'crosshair');
        this.crosshair.setScale(0.15); // Reduzido em 70% (era 0.5, agora 0.15)
        this.crosshair.setDepth(10);
        this.crosshair.setOrigin(0.5, 0.5); // Centraliza a mira no ponto vermelho

        // Esconde o cursor padrão do navegador
        this.input.setDefaultCursor('none');

        console.log('🎯 Mira personalizada criada com aim1.png (escala reduzida em 70%)');
    }

    // Métodos de gameplay (adaptados para multiplayer)

    fireProjectile() {
        // Usa o ProjectileManager para manter consistência com o original
        if (this.projectileManager) {
            this.projectileManager.fireProjectile();
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

        // Atualiza nave do jogador com controles (NOVO)
        if (this.shipManager && this.shipManager.ship) {
            this.shipManager.update(time, delta);

            // Controle de movimento (apenas propulsão com espaço/W - como no original)
            const inputState = {
                thrust: this.spaceKey ? this.spaceKey.isDown : false || this.wKey ? this.wKey.isDown : false
            };

            // Debug da propulsão
            if (inputState.thrust) {
                console.log('🎮 Multiplayer: Propulsão detectada:', inputState);
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

        // Atualiza sistema multiplayer (novo)
        if (this.multiplayerManager) {
            this.multiplayerManager.update();
        }

        // Atualiza mira (mantido)
        this.updateCrosshair();

        // Atualiza lock-on (adaptado para NPCs/players)
        this.updateLockOn();

        // Atualiza sistemas de jogo (mantidos do original)
        if (this.enemyManager) {
            this.enemyManager.update();
        }

        if (this.meteorManager) {
            this.meteorManager.update();
        }

        if (this.projectileManager) {
            this.projectileManager.update();
        }

        if (this.miningManager) {
            this.miningManager.update();
        }

        if (this.rocketManager) {
            this.rocketManager.update();
        }

        // Atualiza UI
        if (this.uiManager) {
            this.uiManager.update();
        }

        // Performance cleanup (mantido)
        if (time - this.lastCleanup > this.cleanupInterval) {
            this.performCleanup();
            this.lastCleanup = time;
        }

        // Debug explosion (tecla E)
        if (this.testExplosionKey && Phaser.Input.Keyboard.JustDown(this.testExplosionKey)) {
            this.createTestExplosion();
        }

        // Debug (mantido)
        if (time - this.lastDebugTime > 1000) {
            this.debugInfo();
            this.lastDebugTime = time;
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
    }

    updateLockOn() {
        if (!this.crosshair || !this.shipManager.ship) return;

        const crosshairX = this.crosshair.x;
        const crosshairY = this.crosshair.y;
        const lockRadius = 50; // Raio de detecção da mira

        // Busca por alvos no mundo multiplayer (outros players, NPCs, inimigos)
        let targets = [];

        // Adiciona outros players como alvos potenciais
        if (this.multiplayerManager && this.multiplayerManager.otherPlayers) {
            this.multiplayerManager.otherPlayers.forEach((playerData, playerId) => {
                if (playerData.sprite && playerData.sprite.active) {
                    targets.push({
                        sprite: playerData.sprite,
                        type: 'player',
                        id: playerId
                    });
                }
            });
        }

        // Busca alvo mais próximo da mira
        let closestTarget = null;
        let closestDistance = Infinity;

        targets.forEach(target => {
            if (target.sprite && target.sprite.active) {
                const distance = Phaser.Math.Distance.Between(
                    crosshairX, crosshairY,
                    target.sprite.x, target.sprite.y
                );

                if (distance < lockRadius && distance < closestDistance) {
                    closestDistance = distance;
                    closestTarget = target;
                }
            }
        });

        // Se encontrou um alvo próximo
        if (closestTarget) {
            // Se é o mesmo alvo que estava sendo travado
            if (this.lockedTarget && this.lockedTarget.sprite === closestTarget.sprite) {
                // Continua travando
                const currentTime = Date.now();
                const lockTime = currentTime - this.lockOnStartTime;

                // Se passou do tempo necessário, confirma o lock
                if (lockTime >= this.lockOnDuration) {
                    this.confirmLockOn(closestTarget);
                }
            } else {
                // Novo alvo, reinicia o processo
                this.lockedTarget = closestTarget;
                this.lockOnStartTime = Date.now();
                this.createLockOnIndicator(closestTarget.sprite);
            }
        } else {
            // Nenhum alvo próximo, cancela lock
            this.cancelLockOn();
        }
    }

    /**
     * Confirma o lock-on no alvo
     */
    confirmLockOn(target) {
        if (!this.lockOnIndicator) return;

        // Destrói o indicador vermelho e cria um verde
        this.lockOnIndicator.destroy();

        // Cria novo indicador verde para confirmar lock
        this.lockOnIndicator = this.add.circle(target.sprite.x, target.sprite.y, 40, 0x00ff00, 0.5);
        this.lockOnIndicator.setDepth(target.sprite.depth + 1);
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

        console.log(`🎯 Lock-on confirmado no ${target.type}!`);
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
    createLockOnIndicator(targetSprite) {
        // Remove indicador anterior se existir
        if (this.lockOnIndicator) {
            this.lockOnIndicator.destroy();
        }

        // Cria círculo vermelho ao redor do alvo
        this.lockOnIndicator = this.add.circle(targetSprite.x, targetSprite.y, 40, 0xff0000, 0.3);
        this.lockOnIndicator.setDepth(targetSprite.depth + 1);
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
        if (this.lockedTarget && this.lockedTarget.sprite && this.lockedTarget.sprite.active) {
            const currentTime = Date.now();
            const lockTime = currentTime - this.lockOnStartTime;

            // Só retorna o alvo se o lock foi confirmado (3+ segundos)
            if (lockTime >= this.lockOnDuration) {
                return this.lockedTarget;
            }
        }

        return null;
    }

    /**
     * Cria explosão de teste (baseado no GameSceneModular)
     */
    createTestExplosion() {
        const cam = this.cameras.main;
        const cx = cam.scrollX + cam.width / 2;
        const cy = cam.scrollY + cam.height / 2;

        console.log('DEBUG: test explosion spawn at', cx, cy);

        // Cria sprite de explosão
        const explosion = this.add.sprite(cx, cy, 'explosion');
        explosion.setDepth(1000);
        explosion.setOrigin(0.5, 0.5);

        if (this.anims.exists('explosion_anim')) {
            explosion.once('animationcomplete', () => {
                explosion.destroy();
            });
            explosion.play('explosion_anim');
        } else {
            console.warn('Animação de explosão não existe!');
            explosion.destroy();
        }
    }

    performCleanup() {
        // Sistema de cleanup mantido do original
        console.log('🧹 Realizando cleanup de performance...');

        // Cleanup de projéteis inativos (gerenciado pelo ProjectileManager)
        if (this.projectileManager) {
            this.projectileManager.cleanupDistantProjectiles();
        }

        // Cleanup dos sistemas managers
        if (this.meteorManager) {
            this.meteorManager.cleanupDistantMeteors();
        }

        if (this.projectileManager) {
            this.projectileManager.cleanupDistantProjectiles();
        }

        if (this.rocketManager) {
            this.rocketManager.cleanupDistantRockets();
        }

        if (this.miningManager) {
            this.miningManager.cullMiningPlanets();
        }

        // Força garbage collection se disponível
        if (window.gc) {
            window.gc();
        }

        console.log('✅ Cleanup realizado');
    }

    debugInfo() {
        // Informações de debug adaptadas para multiplayer
        if (this.multiplayerManager) {
            console.log('📊 Stats Multiplayer:', {
                connected: this.multiplayerManager.isConnected,
                authenticated: this.multiplayerManager.isAuthenticated,
                playerId: this.multiplayerManager.playerId,
                otherPlayers: this.multiplayerManager.otherPlayers.size,
                currentChunk: this.multiplayerManager.currentChunk
            });
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
            this.multiplayerManager.destroy();
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
