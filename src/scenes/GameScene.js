import Phaser from 'phaser';
import { track } from '@vercel/analytics';
import JuiceManager from '../managers/JuiceManager.js';
import AudioManager from '../managers/AudioManager.js';
import ParticleEffects from '../effects/ParticleEffects.js';
import UIAnimations from '../effects/UIAnimations.js';
import TrailEffects from '../effects/TrailEffects.js';
import MultiplayerManager from '../managers/MultiplayerManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        // Debug flags
        this.debugExplosionMarkers = true; // set to false to disable marker overlays
        this.activeExplosions = [];
        // Physics group for enemies (used for collisions)
        this.enemiesGroup = null;
        this.isThrusting = false; // Estado do motor da nave
        this.isGameOver = false; // Flag para prevenir múltiplas chamadas de game over
        this.cryptoBalance = 0; // Saldo de criptomoedas
        this.miningRate = 0; // Taxa de mineração atual
        this.miningPlanets = []; // Planetas que podem ser minerados
        this.enemies = []; // Naves inimigas
        this.playerName = 'Pilot'; // Default player name
        this.playerNameText = null; // Referência para o texto do nome
        
        // Propriedades da nave (serão carregadas do JSON)
        this.shipMaxHealth = 100;
        this.shipHealth = 100;
        this.shipSpeed = 0.1; // Velocidade base da nave
        this.shipMaxSpeed = 500; // Velocidade máxima
        this.shipAcceleration = 800; // Aceleração da nave
        // Combustível
        this.shipMaxFuel = 100; // capacidade máxima do tanque
        this.shipFuel = this.shipMaxFuel; // combustível atual
        this.fuelConsumptionRate = 20; // unidades por segundo enquanto acelera
        this.fuelRechargeRate = 10; // unidades por segundo quando não está acelerando
        this.fuelDepleted = false; // flag quando tanque vazio
        
        // Novos atributos da nave
        this.shipMaxOxygen = 100;
        this.shipOxygen = 100;
        this.shipCargoCapacity = 50;
        this.currentCargo = 0;
        this.oxygenConsumptionRate = 1;
        
        // Referência para metadata da nave
        this.shipMetadata = null;
        // Culling distance (only render/enable objects within this radius of the ship)
        this.cullRadius = 1200; // pixels
        
        // Memory management
        this.lastCleanup = 0;
        this.cleanupInterval = 30000; // Cleanup every 30 seconds
        
        // Game Juice Managers
        this.juiceManager = null;
        this.audioManager = null;
        this.particleEffects = null;
        this.uiAnimations = null;
        this.trailEffects = null;
        this.thrustEmitterId = null; // ID do emitter de propulsão
        
        // Multiplayer Manager
        this.multiplayerManager = null;
    }

    preload() {
        // Define o caminho base para os assets
        this.load.setPath('');
        
        // Carrega o JSON da nave padrão
        this.load.json('defaultShipMetadata', 'src/assets/default_ship_metadata.json');
        
        // Carrega os assets com caminhos absolutos
        this.load.atlas('ship', '/assets/images/01.png', '/assets/images/01.json');
        
        // Carrega a imagem de idle
        this.load.image('ship_idle', '/assets/images/idle.png');
        
        // Carrega os assets do projétil
        this.load.atlas('rocket', '/assets/images/rocket.png', '/assets/images/rocket.json');
        this.load.atlas('minibullet', '/assets/images/minibullet.png', '/assets/images/minibullet.json');
        
        // Carrega a imagem do inimigo
        this.load.atlas('enemy', '/assets/images/02.png', '/assets/images/02.json');
        // Carrega atlas de meteoros
        this.load.atlas('meteoro', '/assets/images/meteoro.png', '/assets/images/meteoro.json');
        
        // Carrega a animação de explosão
        console.log('Carregando textura de explosão...');
        this.load.atlas('explosion', '/assets/images/explosion.png', '/assets/images/explosion.json');
        
    // Carrega atlas de planetas exportado do Aseprite (planetas individuais em frames)
    this.load.atlas('planets', '/assets/background/planets.png', '/assets/background/planets.json');
        
        // Carrega o efeito sonoro do foguete
        this.load.audio('rocket', '/assets/sounds_effects/rocket.mp3');
        // Carrega o efeito sonoro da explosão
        this.load.audio('explosion', '/assets/sounds_effects/explosion.mp3');
        // Carrega o efeito sonoro do projétil
        this.load.audio('bullet', '/assets/sounds_effects/bullet.mp3');
        
        // Adiciona logs de depuração
        this.load.on('filecomplete', function (key, type, data) {
            console.log('Asset carregado:', key, type);
        });
        
        this.load.on('loaderror', function (file) {
            console.error('Erro ao carregar asset:', file.src);
        });
    }

    async create(data) {
        // Track game scene load
        track('game_scene_loaded', {
            player_name: data?.playerName || 'Unknown',
            has_wallet: !!data?.walletAddress,
            has_nft: !!data?.nftImage
        });
        
        // Inicializa os managers de Game Juice
        this.juiceManager = new JuiceManager(this);
        this.audioManager = new AudioManager(this);
        this.particleEffects = new ParticleEffects(this);
        this.uiAnimations = new UIAnimations(this);
        this.trailEffects = new TrailEffects(this);
        
        // Fade in suave ao iniciar
        this.juiceManager.fadeIn(800);
        
        // Recebe o nome do jogador da cena anterior, se existir
        if (data && data.playerName) {
            this.playerName = data.playerName;
        }
        // If walletAddress is provided (from MenuScene), try to fetch NFT image and replace ship sprite
        this.connectedWallet = data && data.walletAddress ? data.walletAddress : null;
        
        // Carrega as características da nave padrão do JSON (fallback)
        this.loadDefaultShipCharacteristics();
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
        
        // Cria o background com o efeito parallax
        this.createBackground();
        
        // Cria planetas mineráveis
        this.createMiningPlanets();
        
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
            repeat: -1 // -1 para repetir infinitamente
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
            repeat: -1 // -1 para repetir infinitamente
        });
        
        // Cria a animação de explosão
        this.anims.create({
            key: 'explosion_anim',
            frames: this.anims.generateFrameNames('explosion', {
                prefix: 'explosion ',
                start: 0,
                end: 15,
                suffix: '.aseprite',
                zeroPad: 0
            }),
            frameRate: 15,
            repeat: 0
        });
        
        // Cria animação do meteoro com 2 frames
        this.anims.create({
            key: 'meteoro_anim',
            frames: [
                { key: 'meteoro', frame: 'meteoro 0.aseprite' },
                { key: 'meteoro', frame: 'meteoro 1.aseprite' }
            ],
            frameRate: 8,
            repeat: -1
        });
        
        // Adiciona a nave na tela e inicia a animação de idle
        this.ship = this.physics.add.sprite(0, 0, 'ship_idle');
        this.ship.play('ship_idle');

        // If a wallet is connected, try to load NFT image and replace ship texture
        if (this.connectedWallet) {
            try {
                // dynamic import to avoid bundling unless used
                const { findFirstNftImageForOwner, findFirstNftMetadataForOwner } = await import('../solana_nft.js');
                
                // Busca tanto a imagem quanto os metadados do NFT
                const [imageUrl, nftMetadata] = await Promise.all([
                    findFirstNftImageForOwner(this.connectedWallet, { network: 'devnet' }),
                    findFirstNftMetadataForOwner(this.connectedWallet, { network: 'devnet' })
                ]);
                
                if (imageUrl) {
                    console.log('Found NFT image for wallet', this.connectedWallet, imageUrl);
                    
                    // Aplica as características do NFT se disponível
                    if (nftMetadata && nftMetadata.attributes) {
                        this.applyNFTCharacteristics(nftMetadata);
                    }
                    
                    // load image into Phaser and replace ship texture
                    this.load.image('nft_ship', imageUrl);
                    this.load.once('complete', () => {
                        try {
                            // create a temporary sprite to measure size
                            const tex = this.textures.get('nft_ship');
                            // replace the ship texture key
                            if (tex && tex.source && tex.source[0]) {
                                // Replace current ship texture
                                this.ship.setTexture('nft_ship');
                                // adjust size if very large
                                const maxScale = 0.6;
                                const w = this.ship.displayWidth;
                                const h = this.ship.displayHeight;
                                if (Math.max(w, h) > 256) {
                                    this.ship.setScale(maxScale);
                                }
                            }
                        } catch (e) {
                            console.warn('Failed to apply NFT texture', e);
                        }
                    });
                    this.load.start();
                } else {
                    console.log('No NFT image found for wallet', this.connectedWallet);
                    console.log('Using default ship characteristics from JSON');
                }
            } catch (e) {
                console.error('Error while loading NFT image for wallet', this.connectedWallet, e);
                console.log('Using default ship characteristics from JSON');
            }
        } else {
            console.log('No wallet connected, using default ship characteristics from JSON');
        }
        // Ajusta corpo de colisão da nave (circle) para melhorar detecção
        this.ship.body.setCircle(Math.max(this.ship.width, this.ship.height) / 2 * 0.6);
        this.ship.body.setOffset(this.ship.width * 0.5 - (Math.max(this.ship.width, this.ship.height) / 2 * 0.6), this.ship.height * 0.5 - (Math.max(this.ship.width, this.ship.height) / 2 * 0.6));
        
        // Cria efeito de propulsão com partículas
        this.thrustEmitterId = this.particleEffects.createThrustEffect(this.ship);
        
        // Adiciona o nome do jogador abaixo da nave
        this.playerNameText = this.add.text(this.ship.x, this.ship.y + 40, this.playerName, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(5);
        
        // Cria inimigos
        this.createEnemies();
        
        // Adiciona o nome do jogador atrás da nave
            // Cria a animação de explosão a partir dos frames do atlas (evita mismatch de nomes)
            let explosionFrameNames = this.textures.exists('explosion') ? this.textures.get('explosion').getFrameNames().filter(n => n !== '__BASE') : [];
            // Ordena os nomes por número presente no nome (ex: 'explosion 2.aseprite') para garantir sequência correta
            explosionFrameNames = explosionFrameNames.sort((a, b) => {
                const ra = a.match(/(\d+)/g); const rb = b.match(/(\d+)/g);
                const na = ra ? parseInt(ra[ra.length-1], 10) : 0;
                const nb = rb ? parseInt(rb[rb.length-1], 10) : 0;
                return na - nb;
            });
            console.log('DEBUG: create() explosion frames (sorted):', explosionFrameNames);
            // guarda para uso posterior em hitEnemy
            this.explosionFrameNames = explosionFrameNames;
            if (explosionFrameNames.length > 0) {
                const explosionFrames = explosionFrameNames.map(fn => ({ key: 'explosion', frame: fn }));
                // Remove animação antiga se existir e recria para garantir correspondência
                if (this.anims.exists('explosion_anim')) {
                    this.anims.remove('explosion_anim');
                }
                this.anims.create({
                    key: 'explosion_anim',
                    frames: explosionFrames,
                    frameRate: 15,
                    repeat: 0
                });
                console.log('DEBUG: explosion_anim created with', explosionFrames.length, 'frames');
            } else {
                console.warn('WARN: nenhum frame de explosao encontrado no atlas `explosion`.');
            }
        this.ship.setMaxVelocity(300); // Limita a velocidade máxima
        this.ship.setCollideWorldBounds(false); // Não colide com as bordas do mundo
        
        // Faz a câmera seguir a nave
        this.cameras.main.startFollow(this.ship);
        
        // Cria a mira do mouse
        this.createCrosshair();
        
        // Define um zoom fixo confortável e ajusta a viewport
        this.cameras.main.setZoom(1);
        this.cameras.main.setViewport(0, 0, this.game.config.width, this.game.config.height);
        
        // Cria a interface de usuário
        this.createUI();
        
        // Configura a mineração
        this.setupMining();
        
        // Captura a entrada do teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    // Tecla de debug: cria explosão de teste quando pressionar 'E'
    this.testExplosionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        
        // Cria um grupo para os projéteis
        this.projectiles = this.physics.add.group();
        // Grupo de meteoros
        this.meteorsGroup = this.physics.add.group();
        
        // Configura colisões
        this.setupCollisions();
        // Inicia spawn de meteoros
        this.createMeteors();
        
        // Configura o clique esquerdo do mouse para disparar
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.fireProjectile();
            }
        });
    }

    createMeteors() {
        // Spawn periódico de meteoros vindos de bordas do mundo - MUITO REDUZIDO
        this.meteorSpawnTimer = this.time.addEvent({
            delay: 8000, // Spawn a cada 8 segundos (muito mais espaçado)
            callback: () => {
                // Limita o número máximo de meteoros ativos para evitar sobrecarga
                const maxMeteors = 3; // Reduzido de 8 para 3
                const currentMeteors = this.meteorsGroup ? this.meteorsGroup.getLength() : 0;
                
                if (currentMeteors < maxMeteors) {
                    this.spawnMeteor();
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    spawnMeteor() {
        // Spawn relative to the camera viewport edges so meteoros are visible to player
        const cam = this.cameras && this.cameras.main ? this.cameras.main : null;
        let x, y;
        if (cam) {
            const halfW = cam.width / 2 / cam.zoom;
            const halfH = cam.height / 2 / cam.zoom;
            const centerX = cam.scrollX + halfW;
            const centerY = cam.scrollY + halfH;
            const side = Phaser.Math.Between(0, 3); // 0:left 1:right 2:top 3:bottom
            const offset = 120;
            if (side === 0) { x = centerX - halfW - offset; y = Phaser.Math.Between(centerY - halfH, centerY + halfH); }
            else if (side === 1) { x = centerX + halfW + offset; y = Phaser.Math.Between(centerY - halfH, centerY + halfH); }
            else if (side === 2) { x = Phaser.Math.Between(centerX - halfW, centerX + halfW); y = centerY - halfH - offset; }
            else { x = Phaser.Math.Between(centerX - halfW, centerX + halfW); y = centerY + halfH + offset; }
        } else {
            // fallback to world edges
            const minX = -2000, maxX = 2000, minY = -2000, maxY = 2000;
            const side = Phaser.Math.Between(0, 3);
            if (side === 0) { x = minX - 100; y = Phaser.Math.Between(minY, maxY); }
            else if (side === 1) { x = maxX + 100; y = Phaser.Math.Between(minY, maxY); }
            else if (side === 2) { x = Phaser.Math.Between(minX, maxX); y = minY - 100; }
            else { x = Phaser.Math.Between(minX, maxX); y = maxY + 100; }
        }

        const meteor = this.physics.add.sprite(x, y, 'meteoro', 'meteoro 0.aseprite');
        meteor.setScale(Phaser.Math.FloatBetween(0.5, 0.8)); // Variação no tamanho
        meteor.setDepth(1);
        meteor.setOrigin(0.5);
        meteor.body.setAllowGravity(false);
        meteor.setCollideWorldBounds(false);
        meteor.body.setDrag(0); // CORREÇÃO: Remove qualquer arrasto que freie o meteoro
        meteor.body.setMaxVelocity(1000); // CORREÇÃO: Permite velocidades altas
        
        // Ensure body exists and set a circular body for meteor
        if (meteor.body) {
            const r = Math.max(meteor.displayWidth, meteor.displayHeight) * 0.45;
            meteor.body.setCircle(r);
            meteor.body.setOffset((meteor.displayWidth - r) / 2, (meteor.displayHeight - r) / 2);
        }
        meteor.health = 30;

        // Direção mais inteligente - pode ir em direção ao jogador ou área central
        let targetX, targetY;
        
        if (this.ship && Phaser.Math.Between(0, 100) < 40) {
            // 40% de chance de ir em direção ao jogador
            targetX = this.ship.x + Phaser.Math.Between(-200, 200);
            targetY = this.ship.y + Phaser.Math.Between(-200, 200);
        } else {
            // Senão, vai para área central com variação
            targetX = Phaser.Math.Between(-600, 600);
            targetY = Phaser.Math.Between(-600, 600);
        }
        
        const angle = Phaser.Math.Angle.Between(meteor.x, meteor.y, targetX, targetY);
        const speed = Phaser.Math.Between(120, 280);
        
        // Armazena velocidade para movimento manual e física
        meteor.vx = Math.cos(angle) * speed;
        meteor.vy = Math.sin(angle) * speed;
        meteor.moveAngle = angle;
        
        // Aplica velocidade constante via física
        meteor.setVelocity(meteor.vx, meteor.vy);
        
        // CORREÇÃO: Usa o mesmo método das naves inimigas para rotação
        // Calcula rotação baseada na direção do movimento
        // meteor.rotation = angle - Math.PI / 2;
        meteor.rotation = angle;


        // Inicia a animação do meteoro
        meteor.play('meteoro_anim');

        // Adiciona trail effect ao meteoro
        if (this.trailEffects) {
            meteor.trailId = this.trailEffects.createLineTrail(
                `meteor_${Date.now()}_${Math.random()}`, 
                15, // maxPoints
                0xff6600, // cor laranja
                0.4, // alpha
                2 // width
            );
        }

        this.meteorsGroup.add(meteor);
        console.log('Spawned meteor at', x, y, 'moving towards', targetX, targetY, 'speed:', speed);
        
        if (this.meteors && Array.isArray(this.meteors)) {
            this.meteors.push(meteor);
        } else {
            this.meteors = [meteor];
        }

        // Destroy after a while to avoid memory leak
        this.time.delayedCall(25000, () => { 
            if (meteor && meteor.active) {
                // Remove trail before destroying
                if (meteor.trailId && this.trailEffects) {
                    this.trailEffects.removeTrail(meteor.trailId);
                }
                meteor.destroy(); 
            }
        });
    }
    
    // Disable/enable visibility and physics of entities that are far from the player ship to save render/physics work
    cullEntities() {
        if (!this.ship) return;
        const sx = this.ship.x;
        const sy = this.ship.y;
        const r = this.cullRadius;
        const r2 = r * r;

        // Meteors (group) - CORREÇÃO: Mantém física ativa mas controla visibilidade
        if (this.meteorsGroup) {
            this.meteorsGroup.getChildren().forEach(m => {
                if (!m) return;
                const dx = m.x - sx;
                const dy = m.y - sy;
                const dist2 = dx*dx + dy*dy;
                const inside = dist2 <= r2;
                
                // Apenas controla visibilidade, NÃO desabilita física
                m.setVisible(inside);
                
                // Update trail if meteor is active and visible and has trail
                if (inside && m.trailId && this.trailEffects) {
                    this.trailEffects.updateLineTrail(m.trailId, m.x, m.y);
                }
                
                // Se o meteoro estiver MUITO longe (2x o raio de culling), destrói para economizar memória
                if (dist2 > (r * 2) * (r * 2)) {
                    if (m.trailId && this.trailEffects) {
                        this.trailEffects.removeTrail(m.trailId);
                    }
                    m.destroy();
                }
            });
        }

        // Enemies (array)
        if (this.enemies && this.enemies.length) {
            this.enemies.forEach(e => {
                if (!e) return;
                const dx = e.x - sx;
                const dy = e.y - sy;
                const inside = (dx*dx + dy*dy) <= r2;
                e.setVisible(inside);
                if (e.body) e.body.enable = inside;
                e.active = inside;
                // pause/play thrust animation depending on active
                if (inside) {
                    if (e.anims && !e.anims.isPlaying) e.play('enemy_thrust', true);
                } else {
                    if (e.anims && e.anims.isPlaying) e.anims.pause();
                }
            });
        }

        // Mining planets (array of images)
        if (this.miningPlanets && this.miningPlanets.length) {
            this.miningPlanets.forEach(p => {
                if (!p) return;
                const dx = p.x - sx;
                const dy = p.y - sy;
                const inside = (dx*dx + dy*dy) <= r2;
                p.setVisible(inside);
            });
        }
    }

    createBackground() {
        // Cria um fundo preto para o espaço
        this.add.rectangle(
            0, 
            0, 
            4000, 
            4000, 
            0x000000
        ).setOrigin(0).setDepth(-10);
        
        // Cria estrelas distantes (camada 1 - parallax lento) - OTIMIZADO
        this.distantStars = this.add.group();
        for (let i = 0; i < 30; i++) { // Reduzido de 100 para 30
            const x = Phaser.Math.Between(-2000, 2000);
            const y = Phaser.Math.Between(-2000, 2000);
            const star = this.add.rectangle(x, y, 1, 1, 0xffffff);
            star.setDepth(-9);
            this.distantStars.add(star);
        }
        
        // Cria estrelas brilhantes (camada 2 - parallax mais rápido) - OTIMIZADO
        this.brightStars = this.add.group();
        for (let i = 0; i < 8; i++) { // Reduzido de 20 para 8
            const x = Phaser.Math.Between(-2000, 2000);
            const y = Phaser.Math.Between(-2000, 2000);
            const star = this.add.rectangle(x, y, 2, 2, 0xffffff);
            star.setDepth(-8);
            this.brightStars.add(star);
        }
    }

    createMiningPlanets() {
        // Cria planetas especiais que podem ser minerados
        // Pega os nomes dos frames do atlas "planets" (cada frame = um planeta)
        const frameNames = this.textures.exists('planets') ? this.textures.get('planets').getFrameNames() : null;
        console.log('DEBUG: planets atlas exists?', this.textures.exists('planets'));
        console.log('DEBUG: planets frameNames:', frameNames);

        for (let i = 0; i < 8; i++) { // Reduzido de 15 para 8
            const x = Phaser.Math.Between(-1500, 1500);
            const y = Phaser.Math.Between(-1500, 1500);

            let frameName = null;
            if (frameNames && frameNames.length > 0) {
                // Escolhe um frame aleatório do atlas (ignora o frame chamado '__BASE' se existir)
                const candidates = frameNames.filter(n => n !== "__BASE");
                frameName = Phaser.Utils.Array.GetRandom(candidates);
            }

            // Se por algum motivo o atlas não estiver disponível, usamos a chave 'planets' sem frame
            const planet = frameName ? this.add.image(x, y, 'planets', frameName) : this.add.image(x, y, 'planets');
            console.log(`DEBUG: Created planet at (${x}, ${y}) using frame:`, frameName);
            planet.setScale(Phaser.Math.FloatBetween(0.6, 1.2));
            planet.setDepth(-0.5); // Fica atrás da nave mas à frente do background

            // Adiciona propriedades especiais para mineração
            planet.isMiningPlanet = true;
            planet.miningRate = Phaser.Math.FloatBetween(0.1, 0.5);

            this.miningPlanets.push(planet);
        }
    }
    
    createEnemies() {
        // Ensure physics group exists for enemies so collisions work
        if (!this.enemiesGroup) this.enemiesGroup = this.physics.add.group();

        // Cria inimigos iniciais - MUITO REDUZIDO
        for (let i = 0; i < 2; i++) { // Reduzido de 4 para 2
            this.spawnSingleEnemy();
        }
        
        // Sistema de spawn contínuo de inimigos - MUITO MAIS ESPAÇADO
        this.enemySpawnTimer = this.time.addEvent({
            delay: 25000, // Spawn a cada 25 segundos (muito mais espaçado)
            callback: () => {
                // Só spawna se não tiver muitos inimigos (máximo muito reduzido)
                if (this.enemies.length < 3) { // Reduzido de 6 para 3
                    this.spawnSingleEnemy();
                }
            },
            callbackScope: this,
            loop: true
        });
    }
    
    spawnSingleEnemy() {
        // Spawn longe do jogador para não aparecer do nada
        let x, y;
        if (this.ship) {
            const distance = 800; // Distância mínima do jogador
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            x = this.ship.x + Math.cos(angle) * distance;
            y = this.ship.y + Math.sin(angle) * distance;
        } else {
            x = Phaser.Math.Between(-1500, 1500);
            y = Phaser.Math.Between(-1500, 1500);
        }
        
        // Cria a nave inimiga usando o atlas
        const enemy = this.physics.add.sprite(x, y, 'enemy');
        enemy.setScale(Phaser.Math.FloatBetween(0.4, 0.6)); // Variação no tamanho
        enemy.setDepth(1);
        
        // Inicia a animação do inimigo
        enemy.play('enemy_thrust');
        
        // Propriedades do inimigo - MAIS RESISTENTE com variação
        const baseHealth = Phaser.Math.Between(150, 250);
        enemy.health = baseHealth;
        enemy.maxHealth = baseHealth;
        enemy.speed = Phaser.Math.FloatBetween(40, 120);
        
        // Cria a barra de vida do inimigo
        const healthBarWidth = 40;
        const healthBarHeight = 5;
        
        enemy.healthBarBg = this.add.rectangle(
            enemy.x, 
            enemy.y + 30, 
            healthBarWidth, 
            healthBarHeight, 
            0x000000
        ).setOrigin(0.5).setDepth(2);
        
        enemy.healthBar = this.add.rectangle(
            enemy.x, 
            enemy.y + 30, 
            healthBarWidth, 
            healthBarHeight, 
            0x00ff00 // Começa verde
        ).setOrigin(0.5).setDepth(3);
        
        // Movimento mais inteligente - às vezes persegue o jogador
        const movementEvent = this.time.addEvent({
            delay: Phaser.Math.Between(1500, 4000),
            callback: () => {
                // proteção: o inimigo pode ter sido destruído/invalidado
                if (!enemy || !enemy.active || !enemy.body || typeof enemy.setVelocity !== 'function') {
                    return;
                }
                
                let angle;
                if (this.ship && Phaser.Math.Between(0, 100) < 30) {
                    // 30% de chance de ir em direção ao jogador
                    angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.ship.x, this.ship.y);
                    // Adiciona um pouco de imprecisão
                    angle += Phaser.Math.FloatBetween(-0.5, 0.5);
                } else {
                    // Movimento aleatório
                    angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                }
                
                enemy.setVelocity(
                    Math.cos(angle) * enemy.speed,
                    Math.sin(angle) * enemy.speed
                );
            },
            callbackScope: this,
            loop: true
        });
        
        // armazena referência para limpar depois
        enemy._movementTimer = movementEvent;
        
        this.enemies.push(enemy);
        // Add to physics group for collisions
        this.enemiesGroup.add(enemy);
        
        console.log(`Spawned enemy at (${x}, ${y}). Total enemies: ${this.enemies.length}`);
    }
    
    setupCollisions() {
        // Colisão entre projéteis do jogador e inimigos (use the physics group)
        if (!this.enemiesGroup) this.enemiesGroup = this.physics.add.group();
        this.physics.add.overlap(this.projectiles, this.enemiesGroup, this.hitEnemy, null, this);
        // Colisão entre projéteis e meteoros
        if (!this.meteorsGroup) this.meteorsGroup = this.physics.add.group();
        this.physics.add.overlap(this.projectiles, this.meteorsGroup, this.hitMeteor, null, this);
        // Colisão entre a nave e meteoros
        this.physics.add.overlap(this.ship, this.meteorsGroup, this.shipHitByMeteor, null, this);
        // Colisão entre a nave e inimigos (overlap) — também adicionamos collider físico
        this.physics.add.overlap(this.ship, this.enemiesGroup, this.shipHitByEnemy, null, this);
        this.physics.add.collider(this.ship, this.enemiesGroup, this.shipHitByEnemy, null, this);
    }

    hitEnemy(projectile, enemy) {
        // Calcula dano baseado no tipo de projétil
        const damage = 35; // Dano reduzido para que inimigos durem mais
        
        // Efeitos de impacto (faíscas)
        const angle = Phaser.Math.Angle.Between(projectile.x, projectile.y, enemy.x, enemy.y);
        this.particleEffects.createImpactSparks(projectile.x, projectile.y, Phaser.Math.RadToDeg(angle) + 180);
        
        // Flash no inimigo
        this.juiceManager.damageFlash(enemy, 100);
        
        // Screen shake pequeno
        this.juiceManager.screenShake(80, 3);
        
        // Som de impacto
        this.audioManager.playImpact(0.6);
        
        // NOVO: Mostra número de dano flutuante
        this.uiAnimations.createFloatingText(
            enemy.x + Phaser.Math.Between(-20, 20), 
            enemy.y - 20, 
            `-${damage}`, 
            {
                color: '#ff4444',
                fontSize: '18px',
                duration: 1000,
                distance: 40,
                fadeDelay: 300
            }
        );
        
        // Lógica de dano ao inimigo
        projectile.destroy(); // Destrói o projétil
        enemy.health -= damage; // Aplica dano
    
        // Atualiza a barra de vida do inimigo com animação
        const healthPercentage = Math.max(0, enemy.health / enemy.maxHealth);
        this.uiAnimations.animateBar(enemy.healthBar, enemy.healthBar.scaleX, healthPercentage, 200);
        
        // Muda cor da barra baseada na vida
        if (healthPercentage < 0.3) {
            enemy.healthBar.setFillStyle(0xff0000); // Vermelho quando crítico
        } else if (healthPercentage < 0.6) {
            enemy.healthBar.setFillStyle(0xff6600); // Laranja quando baixo
        }
    
        // Se a vida do inimigo chegar a zero, destrói o inimigo
        if (enemy.health <= 0) {
            // Efeito de impacto grande (shake + flash + slowmo)
            this.juiceManager.impactEffect('large');
            
            // NEW: "DESTROYED" text
            this.uiAnimations.createFloatingText(
                enemy.x, 
                enemy.y - 30, 
                'DESTROYED!', 
                {
                    color: '#00ff00',
                    fontSize: '24px',
                    duration: 1500,
                    distance: 60,
                    fadeDelay: 500
                }
            );
            
            // Explosão visual com animação
            this.createExplosion(enemy.x, enemy.y);
            
            // Partículas de explosão
            this.particleEffects.createExplosion(enemy.x, enemy.y, 'medium');
            
            // Som de explosão com variação
            this.audioManager.playExplosion('medium');
    
            // Limpa o timer de movimento antes de destruir o inimigo
            if (enemy._movementTimer) {
                enemy._movementTimer.remove(false);
            }
    
            // Destroi as barras de vida e o inimigo
            if (enemy.healthBar) enemy.healthBar.destroy();
            if (enemy.healthBarBg) enemy.healthBarBg.destroy();
            
            // Remove o inimigo do array de inimigos
            const index = this.enemies.indexOf(enemy);
            if (index > -1) {
                this.enemies.splice(index, 1);
            }
            
            enemy.destroy();
        }
    }

    shipHitByEnemy(ship, enemy) {
        // CORREÇÃO: Não sofre dano se já estiver em game over
        if (this.isGameOver) return;
        
        // Efeito visual de dano no jogador
        this.juiceManager.damageFlash(ship, 150);
        this.juiceManager.screenShake(200, 8);
        this.juiceManager.flash(150, 0xff0000, 0.4);
        
        // Mostra dano flutuante
        this.uiAnimations.showDamage(ship.x, ship.y - 30, 25);
        
        // Reduz a vida da nave do jogador
        this.shipHealth -= 25;
        this.updateUI(); // CORREÇÃO: Chamada para a função correta
    
        // Cria uma explosão no ponto de colisão
        this.createExplosion(ship.x, ship.y);
        this.particleEffects.createExplosion(ship.x, ship.y, 'medium');
        
        // Som de explosão
        this.audioManager.playExplosion('large');
    
        // Limpa o timer de movimento antes de destruir o inimigo
        if (enemy._movementTimer) {
            enemy._movementTimer.remove(false);
        }
    
        // Destroi as barras de vida e o inimigo
        if (enemy.healthBar) enemy.healthBar.destroy();
        if (enemy.healthBarBg) enemy.healthBarBg.destroy();
        
        // Remove o inimigo do array de inimigos
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
        
        enemy.destroy();
    
        // Se a vida da nave do jogador chegar a zero, reinicia a cena
        if (this.shipHealth <= 0) {
            this.gameOver();
        }
    }

    hitMeteor(projectile, meteor) {
        // Efeitos de impacto
        const angle = Phaser.Math.Angle.Between(projectile.x, projectile.y, meteor.x, meteor.y);
        this.particleEffects.createImpactSparks(projectile.x, projectile.y, Phaser.Math.RadToDeg(angle) + 180);
        this.juiceManager.screenShake(60, 2);
        
        projectile.destroy();
        meteor.health -= 15;
        
        if (meteor.health <= 0) {
            this.createExplosion(meteor.x, meteor.y);
            this.particleEffects.createExplosion(meteor.x, meteor.y, 'small');
            this.audioManager.playExplosion('small');
            this.juiceManager.impactEffect('small');
            meteor.destroy();
        } else {
            this.audioManager.playImpact(0.4);
        }
    }

    shipHitByMeteor(ship, meteor) {
        // CORREÇÃO: Não sofre dano se já estiver em game over
        if (this.isGameOver) return;
        
        // Efeitos de dano
        this.juiceManager.damageFlash(ship, 120);
        this.juiceManager.screenShake(150, 5);
        this.juiceManager.flash(120, 0xff6600, 0.3);
        this.uiAnimations.showDamage(ship.x, ship.y - 30, 10);
        
        this.shipHealth -= 10;
        this.updateUI();
        
        this.createExplosion(meteor.x, meteor.y);
        this.particleEffects.createExplosion(meteor.x, meteor.y, 'small');
        this.audioManager.playExplosion('small');
        meteor.destroy();

        if (this.shipHealth <= 0) {
            this.gameOver();
        }
    }

    createExplosion(x, y) {
        const explosion = this.add.sprite(x, y, 'explosion');
        explosion.setDepth(100);
        explosion.play('explosion_anim');
        explosion.once('animationcomplete', () => {
            explosion.destroy();
        });
    }

    gameOver(reason = '') {
        console.log('Game Over', reason ? `- ${reason}` : '');
        
        // Previne múltiplas chamadas
        if (this.isGameOver) return;
        this.isGameOver = true;
        
        // Track game over event
        track('game_over', {
            player_name: this.playerName,
            reason: reason || 'unknown',
            final_score: this.score || 0,
            final_level: this.level || 1,
            enemies_killed: this.enemiesKilled || 0,
            crypto_mined: this.cryptoMined || 0
        });
        
        // CORREÇÃO: Desabilita colisões imediatamente
        if (this.ship && this.ship.body) {
            this.ship.body.enable = false;
        }
        
        // Efeito dramático: slow motion + zoom + explosão final
        this.juiceManager.slowMotion(1000, 0.2);
        
        // Explosão grande na nave
        this.particleEffects.createExplosion(this.ship.x, this.ship.y, 'large');
        this.audioManager.playExplosion('large');
        
        // Destrói a nave visualmente após um delay
        this.time.delayedCall(500, () => {
            if (this.ship) {
                this.ship.setVisible(false);
            }
        });
        
        // Zoom dramático
        this.tweens.add({
            targets: this.cameras.main,
            zoom: 0.5,
            duration: 1000,
            ease: 'Cubic.easeIn'
        });
        
        // Aguarda os efeitos e então mostra a tela de Game Over
        this.time.delayedCall(1500, () => {
            this.showGameOverScreen(reason);
        });
    }
    
    showGameOverScreen(reason = '') {
        // Para todos os sons
        this.sound.stopAll();
        
        // Overlay escuro semi-transparente TELA INTEIRA
        const overlay = this.add.rectangle(
            this.cameras.main.scrollX + this.cameras.main.width / 2,
            this.cameras.main.scrollY + this.cameras.main.height / 2,
            this.cameras.main.width * 3,
            this.cameras.main.height * 3,
            0x000000,
            0.9
        ).setScrollFactor(0).setDepth(200);
        
        // Container para a tela de Game Over
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // Painel principal de Game Over - MUITO MAIOR
        const panelWidth = 700;
        const panelHeight = 550;
        
        const gameOverPanel = this.add.rectangle(
            centerX,
            centerY,
            panelWidth,
            panelHeight,
            0x0a0a0f,
            0.98
        ).setScrollFactor(0).setDepth(201);
        
        // Borda neon MAIS GROSSA
        const gameOverBorder = this.add.rectangle(
            centerX,
            centerY,
            panelWidth,
            panelHeight,
            0xff0000,
            0
        ).setScrollFactor(0).setDepth(201).setStrokeStyle(5, 0xff0000, 1);
        
        // Borda interna
        this.add.rectangle(
            centerX,
            centerY,
            panelWidth - 10,
            panelHeight - 10,
            0xff0000,
            0
        ).setScrollFactor(0).setDepth(201).setStrokeStyle(2, 0xff0000, 0.6);
        
        // "GAME OVER" title - VERY LARGE
        const gameOverText = this.add.text(centerX, centerY - 180, 'GAME OVER', {
            fontFamily: 'Arial',
            fontSize: '80px',
            color: '#ff0000',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(202);
        
        // Razão do game over (se disponível)
        if (reason) {
            this.add.text(centerX, centerY - 120, reason, {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffaa00',
                fontStyle: 'bold'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(202);
        }
        
        // Efeito de pulso no título
        this.tweens.add({
            targets: gameOverText,
            scale: { from: 1, to: 1.08 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Estatísticas do jogador
        const statsY = centerY - 60;
        
        this.add.text(centerX, statsY, '━━━━━━━━━ STATISTICS ━━━━━━━━━', {
            fontFamily: 'Arial',
            fontSize: '26px',
            color: '#00d4ff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(202);
        
        this.add.text(centerX, statsY + 60, `💰 Crypto Mined: ${this.cryptoBalance.toFixed(2)}`, {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#00ff88',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(202);
        
        this.add.text(centerX, statsY + 110, `👤 Pilot: ${this.playerName}`, {
            fontFamily: 'Arial',
            fontSize: '26px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(202);
        
        // Botão de Reiniciar - MAIOR
        const restartBtn = this.add.rectangle(
            centerX,
            centerY + 150,
            400,
            80,
            0x00ff00,
            0.3
        ).setScrollFactor(0).setDepth(202).setInteractive({ useHandCursor: true })
        .setStrokeStyle(4, 0x00ff00, 1);
        
        const restartText = this.add.text(centerX, centerY + 150, '🔄 PLAY AGAIN', {
            fontFamily: 'Arial',
            fontSize: '30px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(203);
        
        // Botão de Voltar ao Menu - MAIOR
        const menuBtn = this.add.rectangle(
            centerX,
            centerY + 245,
            400,
            70,
            0x00d4ff,
            0.3
        ).setScrollFactor(0).setDepth(202).setInteractive({ useHandCursor: true })
        .setStrokeStyle(3, 0x00d4ff, 0.8);
        
        const menuText = this.add.text(centerX, centerY + 245, '🏠 BACK TO MENU', {
            fontFamily: 'Arial',
            fontSize: '26px',
            color: '#00d4ff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(203);
        
        // Hover effects - MAIS EVIDENTES
        restartBtn.on('pointerover', () => {
            restartBtn.setFillStyle(0x00ff00, 0.6);
            restartText.setScale(1.1);
            this.tweens.add({
                targets: restartBtn,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
        
        restartBtn.on('pointerout', () => {
            restartBtn.setFillStyle(0x00ff00, 0.3);
            restartText.setScale(1);
            this.tweens.add({
                targets: restartBtn,
                scaleX: 1,
                scaleY: 1,
                duration: 200
            });
        });
        
        menuBtn.on('pointerover', () => {
            menuBtn.setFillStyle(0x00d4ff, 0.6);
            menuText.setScale(1.1);
            this.tweens.add({
                targets: menuBtn,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
        
        menuBtn.on('pointerout', () => {
            menuBtn.setFillStyle(0x00d4ff, 0.3);
            menuText.setScale(1);
            this.tweens.add({
                targets: menuBtn,
                scaleX: 1,
                scaleY: 1,
                duration: 200
            });
        });
        
        // Click events
        restartBtn.on('pointerdown', () => {
            // Track game restart
            track('game_restarted', {
                player_name: this.playerName,
                final_score: this.score || 0,
                final_level: this.level || 1
            });
            
            // Efeito de click
            restartBtn.setScale(0.95);
            this.time.delayedCall(100, () => {
                // Fade out e reinicia
                this.juiceManager.fadeOut(500, () => {
                    this.isGameOver = false;
                    this.scene.restart({ playerName: this.playerName });
                });
            });
        });
        
        menuBtn.on('pointerdown', () => {
            // Track return to menu
            track('return_to_menu', {
                player_name: this.playerName,
                final_score: this.score || 0,
                final_level: this.level || 1
            });
            
            // Efeito de click
            menuBtn.setScale(0.95);
            this.time.delayedCall(100, () => {
                // Fecha o game e volta para a página principal
                this.juiceManager.fadeOut(500, () => {
                    // Esconde o container do jogo
                    const gameLaunch = document.getElementById('game-launch');
                    if (gameLaunch) {
                        gameLaunch.style.display = 'none';
                    }
                    // Para a cena
                    this.scene.stop();
                });
            });
        });
        
        // Animação de entrada - MAIS DRAMÁTICA
        overlay.setAlpha(0);
        gameOverPanel.setScale(0.3);
        gameOverBorder.setScale(0.3);
        gameOverText.setScale(0);
        
        this.tweens.add({
            targets: overlay,
            alpha: 0.9,
            duration: 600,
            ease: 'Power2'
        });
        
        this.tweens.add({
            targets: [gameOverPanel, gameOverBorder],
            scale: 1,
            duration: 600,
            ease: 'Back.easeOut'
        });
        
        this.tweens.add({
            targets: gameOverText,
            scale: 1,
            duration: 800,
            delay: 300,
            ease: 'Elastic.easeOut'
        });
    }

    createCrosshair() {
        // Cria a mira do mouse como um círculo vermelho
        this.crosshair = this.add.circle(0, 0, 5, 0xff0000);
        this.crosshair.setStrokeStyle(2, 0xffffff);
        this.crosshair.setDepth(10); // Garante que a mira fique acima de tudo
    }

    createUI() {
        // Estilo base para os textos da UI - MELHORADO
        const titleStyle = {
            fontSize: '13px',
            fill: '#00d4ff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        };
        
        const valueStyle = {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        };

        // Container principal da UI no canto superior esquerdo
        const startX = 16;
        const startY = 16;
        const panelWidth = 320; // Aumentado para acomodar mais informações
        const panelPadding = 18;
        
        // Calcula altura dinâmica do painel (aumentado para caber todos os elementos)
        const panelHeight = 320; // Aumentado para oxigênio e carga
        
        // Painel de fundo semi-transparente para melhor legibilidade
        this.uiPanel = this.add.rectangle(startX, startY, panelWidth, panelHeight, 0x0a0a0f, 0.85)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(18);
        
        // Bordas do painel com efeito neon duplo
        this.uiPanelBorder = this.add.rectangle(startX, startY, panelWidth, panelHeight, 0x00d4ff, 0)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(18)
            .setStrokeStyle(2, 0x00d4ff, 0.8);
            
        // Borda interna sutil
        this.uiPanelInnerBorder = this.add.rectangle(startX + 3, startY + 3, panelWidth - 6, panelHeight - 6, 0x00d4ff, 0)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(18)
            .setStrokeStyle(1, 0x00d4ff, 0.3);
        
        let currentY = startY + panelPadding;
        const contentX = startX + panelPadding;
        const barWidth = panelWidth - (panelPadding * 2);
        
        // === CRYPTO ===
        this.add.text(contentX, currentY, '💰 CRYPTO', titleStyle)
            .setScrollFactor(0)
            .setDepth(20);
        currentY += 20;
        
        this.cryptoText = this.add.text(contentX, currentY, '0.00', { 
            ...valueStyle, 
            fill: '#00ff88',
            fontSize: '22px'
        })
            .setScrollFactor(0)
            .setDepth(20);
        currentY += 32;
        
        // === VIDA ===
        this.add.text(contentX, currentY, '❤️ HEALTH', titleStyle)
            .setScrollFactor(0)
            .setDepth(20);
        currentY += 20;
        
        // Barra de vida
        const healthBarHeight = 20;
        
        this.healthBarBg = this.add.rectangle(contentX, currentY, barWidth, healthBarHeight, 0x220000, 0.9)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(19)
            .setStrokeStyle(1, 0x660000, 0.6);
            
        this.healthBar = this.add.rectangle(contentX + 1, currentY + 1, barWidth - 2, healthBarHeight - 2, 0xff0000, 1)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(20);
            
        this.healthText = this.add.text(contentX + barWidth/2, currentY + healthBarHeight/2, '100/100', { 
            fontSize: '13px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        })
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0)
            .setDepth(21);
        currentY += healthBarHeight + 16;
        
        // === COMBUSTÍVEL ===
        this.add.text(contentX, currentY, '⚡ FUEL', titleStyle)
            .setScrollFactor(0)
            .setDepth(20);
        currentY += 20;
        
        const fuelBarHeight = 18;
        
        this.fuelBarBg = this.add.rectangle(contentX, currentY, barWidth, fuelBarHeight, 0x001a22, 0.9)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(19)
            .setStrokeStyle(1, 0x004466, 0.6);
            
        this.fuelBar = this.add.rectangle(contentX + 1, currentY + 1, barWidth - 2, fuelBarHeight - 2, 0x00aaff, 1)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(20);
            
        this.fuelText = this.add.text(contentX + barWidth/2, currentY + fuelBarHeight/2, '100/100', { 
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        })
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0)
            .setDepth(21);
        currentY += fuelBarHeight + 16;
        
        // === OXIGÊNIO ===
        this.add.text(contentX, currentY, '🫁 OXYGEN', titleStyle)
            .setScrollFactor(0)
            .setDepth(20);
        currentY += 20;
        
        const oxygenBarHeight = 18;
        
        this.oxygenBarBg = this.add.rectangle(contentX, currentY, barWidth, oxygenBarHeight, 0x001122, 0.9)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(19)
            .setStrokeStyle(1, 0x004466, 0.6);
            
        this.oxygenBar = this.add.rectangle(contentX + 1, currentY + 1, barWidth - 2, oxygenBarHeight - 2, 0x00ccff, 1)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(20);
            
        this.oxygenText = this.add.text(contentX + barWidth/2, currentY + oxygenBarHeight/2, '100/100', { 
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        })
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0)
            .setDepth(21);
        currentY += oxygenBarHeight + 16;
        
        // === CARGA ===
        this.add.text(contentX, currentY, '📦 CARGO', titleStyle)
            .setScrollFactor(0)
            .setDepth(20);
        currentY += 20;
        
        this.cargoText = this.add.text(contentX, currentY, '0/50 kg', { 
            fontSize: '16px',
            fill: '#ffaa00',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        })
            .setScrollFactor(0)
            .setDepth(20);
        currentY += 25;
        
        // === VELOCIDADE ===
        this.speedText = this.add.text(contentX, currentY, '🚀 SPEED: 0 km/h', { 
            fontSize: '13px',
            fill: '#55aaff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        })
            .setScrollFactor(0)
            .setDepth(20);
        currentY += 20;
        
        // === RARIDADE (se disponível) ===
        this.rarityText = this.add.text(contentX, currentY, '', { 
            fontSize: '12px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        })
            .setScrollFactor(0)
            .setDepth(20);
    }

    // Função de zoom removida - agora usamos um zoom fixo

    setupMining() {
        // Configura o timer para mineração
        this.miningTimer = this.time.addEvent({
            delay: 1000, // A cada segundo
            callback: this.mineCrypto,
            callbackScope: this,
            loop: true
        });
    }

    mineCrypto() {
        if (this.ship && this.miningPlanets.length > 0) {
            let totalRate = 0;
            let isMining = false;
            
            // Verifica a distância da nave aos planetas mineráveis
            for (let planet of this.miningPlanets) {
                const distance = Phaser.Math.Distance.Between(this.ship.x, this.ship.y, planet.x, planet.y);
                
                // Se a nave estiver perto o suficiente, adiciona a taxa de mineração
                if (distance < 200) {
                    isMining = true;
                    // Quanto mais perto, maior a taxa de mineração
                    const proximityBonus = Math.max(0, (200 - distance) / 200);
                    const rate = planet.miningRate * (1 + proximityBonus);
                    totalRate += rate;
                    
                    // Efeito de partículas de mineração
                    this.particleEffects.createMiningEffect(planet.x, planet.y, this.ship.x, this.ship.y);
                    
                    // Pulso no planeta quando está minerando
                    if (!planet.isPulsing) {
                        planet.isPulsing = true;
                        this.uiAnimations.pulse(planet, 1.05, 1000, -1);
                    }
                } else {
                    // Remove pulso se estava minerando
                    if (planet.isPulsing) {
                        planet.isPulsing = false;
                        this.tweens.killTweensOf(planet);
                        planet.setScale(planet.scale);
                    }
                }
            }
            
            // Se está minerando, mostra ganho
            if (totalRate > 0) {
                const oldBalance = this.cryptoBalance;
                this.cryptoBalance += totalRate;
                
                // Atualiza a interface com animação
                if (this.cryptoText) {
                    this.uiAnimations.animateCounter(
                        this.cryptoText, 
                        oldBalance, 
                        this.cryptoBalance, 
                        500,
                        (value) => `${value.toFixed(2)}`
                    );
                }
                
                // Mostra texto flutuante ocasionalmente (a cada 3 segundos de mineração)
                if (!this.lastMiningTextTime || Date.now() - this.lastMiningTextTime > 3000) {
                    this.uiAnimations.showCryptoGain(this.ship.x, this.ship.y - 50, totalRate);
                    this.lastMiningTextTime = Date.now();
                }
            }
        }
    }

    fireProjectile() {
        // Recuo leve da nave (juice!)
        this.juiceManager.screenShake(40, 1);
        
        // Cria um novo projétil (minibullet) na posição da nave
        // Calcula primeiro o ângulo de disparo para garantir que o sprite fique alinhado à direção
        const angle = this.ship.rotation - Math.PI/2;
        const offsetX = Math.cos(angle) * 30;
        const offsetY = Math.sin(angle) * 30;
        // Usa o atlas 'minibullet' para os tiros atuais
        const projectile = this.physics.add.sprite(
            this.ship.x + offsetX,
            this.ship.y + offsetY,
            'minibullet',
            'minibullet 0.aseprite'
        );
        projectile.setScale(0.6);
        projectile.setDepth(1);
        projectile.setOrigin(0.5, 0.5);
        projectile.body.setAllowGravity(false);
        projectile.setCollideWorldBounds(false);

        // Define a rotação do projétil igual ao ângulo de movimento (corrige orientação "deitada")
        projectile.rotation = angle;

        // Aplica velocidade via física
        const speed = 800; // velocidade aplicada ao corpo físico
        projectile.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

        // Adiciona o projétil ao grupo de projéteis (grupo físico)
        this.projectiles.add(projectile);

        // Também define propriedades de movimento manual para compatibilidade com o loop de update
        const manualSpeed = 12; // pixels por frame
        projectile.speedX = Math.cos(angle) * manualSpeed;
        projectile.speedY = Math.sin(angle) * manualSpeed;

        // Cria/usa animação do minibullet
        if (!this.anims.exists('minibullet_anim')) {
            this.anims.create({
                key: 'minibullet_anim',
                frames: [
                    { key: 'minibullet', frame: 'minibullet 0.aseprite' },
                    { key: 'minibullet', frame: 'minibullet 1.aseprite' }
                ],
                frameRate: 12,
                repeat: -1
            });
        }

        projectile.play('minibullet_anim');
        
        // Adiciona trilha de partículas ao projétil (otimizado)
        const trailId = this.particleEffects.createProjectileTrail(projectile);
        projectile._trailId = trailId; // Armazena para limpar depois
        
        // Som do disparo com variação de pitch
        this.audioManager.playShoot();
        
        // Remove o projétil após 3 segundos
        this.time.delayedCall(3000, () => {
            if (projectile && projectile.active) {
                // Remove a trilha antes de destruir
                if (projectile._trailId) {
                    this.particleEffects.removeEmitter(projectile._trailId);
                }
                projectile.destroy();
            }
        });
    }

    update(time, delta) {
        // Memory cleanup
        if (time - this.lastCleanup > this.cleanupInterval) {
            this.performMemoryCleanup();
            this.lastCleanup = time;
        }
        
        // Debug: Log de performance a cada 5 segundos
        if (!this.lastDebugTime || time - this.lastDebugTime > 5000) {
            const meteorCount = this.meteorsGroup ? this.meteorsGroup.getLength() : 0;
            const enemyCount = this.enemies ? this.enemies.length : 0;
            const projectileCount = this.projectiles ? this.projectiles.getLength() : 0;
            console.log(`[PERFORMANCE] Meteoros: ${meteorCount}, Inimigos: ${enemyCount}, Projéteis: ${projectileCount}`);
            this.lastDebugTime = time;
        }
        
        // Renderiza os trails de linha (se houver)
        if (this.trailEffects) {
            this.trailEffects.renderLineTrails();
        }
        
        // Cull entities each frame to limit rendering/physics to nearby objects
        this.cullEntities();
        // Debug: spawn de explosão com tecla E
        if (this.testExplosionKey && Phaser.Input.Keyboard.JustDown(this.testExplosionKey)) {
            const cam = this.cameras.main;
            const cx = cam.scrollX + cam.width / 2;
            const cy = cam.scrollY + cam.height / 2;
            console.log('DEBUG: test explosion spawn at', cx, cy);
            if (this.textures.exists('explosion')) {
                const frames = this.textures.get('explosion').getFrameNames().filter(n => n !== '__BASE');
                console.log('DEBUG: explosion frames for test:', frames);
                const firstFrame = (this.explosionFrameNames && this.explosionFrameNames.length) ? this.explosionFrameNames[0] : frames[0];
                const spr = firstFrame ? this.add.sprite(cx, cy, 'explosion', firstFrame) : this.add.sprite(cx, cy, 'explosion');
                spr.setOrigin(0.5, 0.5);
                spr.setDepth(1000);
                this.children.bringToTop(spr);
                if (this.anims.exists('explosion_anim')) {
                    spr.once('animationstart', () => console.log('DEBUG: test explosion animation started'));
                    spr.once('animationcomplete', () => {
                        console.log('DEBUG: test explosion animation complete - destroying test sprite');
                        spr.destroy();
                    });
                    spr.play('explosion_anim');
                } else {
                    console.warn('DEBUG: explosion_anim not found for test');
                }
            } else {
                console.warn('DEBUG: explosion atlas not found for test');
            }
        }
        // Atualiza a posição de todos os projéteis
        if (this.projectiles) {
            this.projectiles.getChildren().forEach(projectile => {
                if (projectile.active && projectile.speedX !== undefined) {
                    projectile.x += projectile.speedX;
                    projectile.y += projectile.speedY;
                }
            });
        }
        
        // Atualiza movimento dos meteoros
        if (this.meteorsGroup) {
            this.meteorsGroup.getChildren().forEach(meteor => {
                if (meteor.active && meteor.body) {
                    // CORREÇÃO: Garante que a velocidade física está aplicada
                    if (meteor.vx !== undefined && meteor.vy !== undefined) {
                        // Reaplica velocidade caso tenha sido resetada
                        if (Math.abs(meteor.body.velocity.x) < 10 && Math.abs(meteor.body.velocity.y) < 10) {
                            meteor.setVelocity(meteor.vx, meteor.vy);
                        }
                    }
                    
                    // CORREÇÃO: Usa o mesmo método das naves inimigas para rotação
                    if (meteor.body && (meteor.body.velocity.x !== 0 || meteor.body.velocity.y !== 0)) {
                        meteor.rotation = Phaser.Math.Angle.Between(
                            meteor.x - meteor.body.velocity.x, 
                            meteor.y - meteor.body.velocity.y,
                            meteor.x, 
                            meteor.y
                        ) + Math.PI / 2;
                    }
                }
            });
        }

        // Atualiza a posição do texto do nome do jogador
        if (this.playerNameText && this.ship) {
            this.playerNameText.x = this.ship.x;
            this.playerNameText.y = this.ship.y + 40; // Posição abaixo da nave
        }

        if (this.ship) {
            // Atualiza o efeito parallax baseado na posição da câmera
            if (this.distantStars && this.brightStars) {
                const camera = this.cameras.main;
                const scrollX = camera.scrollX;
                const scrollY = camera.scrollY;
                
                // Move as estrelas distantes mais devagar (parallax lento)
                this.distantStars.getChildren().forEach(star => {
                    star.x = star.initialX !== undefined ? star.initialX - scrollX * 0.1 : (star.initialX = star.x) - scrollX * 0.1;
                    star.y = star.initialY !== undefined ? star.initialY - scrollY * 0.1 : (star.initialY = star.y) - scrollY * 0.1;
                });
                
                // Move as estrelas brilhantes mais rápido (parallax mais rápido)
                this.brightStars.getChildren().forEach(star => {
                    star.x = star.initialX !== undefined ? star.initialX - scrollX * 0.3 : (star.initialX = star.x) - scrollX * 0.3;
                    star.y = star.initialY !== undefined ? star.initialY - scrollY * 0.3 : (star.initialY = star.y) - scrollY * 0.3;
                });
            }
            
            // Converte a posição do mouse para coordenadas do mundo
            const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
            
            // Atualiza a posição da mira
            if (this.crosshair) {
                this.crosshair.x = worldPoint.x;
                this.crosshair.y = worldPoint.y;
            }
            
            // Faz a nave apontar para o mouse
            this.ship.rotation = Phaser.Math.Angle.Between(this.ship.x, this.ship.y, worldPoint.x, worldPoint.y) + Math.PI / 2;
            
            // Verifica se a barra de espaço está pressionada
            if (this.spaceKey.isDown && !this.fuelDepleted) {
                if (!this.isThrusting) {
                    this.ship.play('ship_thrust', true);
                    this.isThrusting = true;
                    
                    // Ativa efeito de propulsão com partículas
                    if (this.thrustEmitterId) {
                        this.particleEffects.setThrustEmitting(this.thrustEmitterId, true);
                    }
                    
                    // Toca o som do foguete se não estiver tocando
                    if (!this.isRocketPlaying) {
                        this.rocketSound.play();
                        this.isRocketPlaying = true;
                    }
                }
                
                // Atualiza a posição do efeito de propulsão
                if (this.thrustEmitterId) {
                    this.particleEffects.updateThrustEffect(this.thrustEmitterId);
                }
                // Aplica força na direção em que a nave está apontando
                const angle = this.ship.rotation - Math.PI / 2;
                const vx = Math.cos(angle) * this.shipSpeed;
                const vy = Math.sin(angle) * this.shipSpeed;
                // Aplica a aceleração à nave
                this.ship.setAcceleration(
                    vx * this.shipAcceleration,
                    vy * this.shipAcceleration
                );

                // Consome combustível (baseado no delta em segundos)
                const deltaSec = delta / 1000;
                this.shipFuel -= this.fuelConsumptionRate * deltaSec;
                if (this.shipFuel <= 0) {
                    this.shipFuel = 0;
                    this.fuelDepleted = true;
                    // Para a aceleração imediata
                    this.ship.setAcceleration(0);
                    this.ship.play('ship_idle', true);
                    this.isThrusting = false;
                    if (this.isRocketPlaying) { this.rocketSound.stop(); this.isRocketPlaying = false; }
                }
            } else {
                if (this.isThrusting) {
                    this.ship.play('ship_idle', true);
                    this.isThrusting = false;
                    
                    // Desativa efeito de propulsão
                    if (this.thrustEmitterId) {
                        this.particleEffects.setThrustEmitting(this.thrustEmitterId, false);
                    }
                    
                    // Para o som do foguete
                    if (this.isRocketPlaying) {
                        this.rocketSound.stop();
                        this.isRocketPlaying = false;
                    }
                }
                this.ship.setAcceleration(0);

                // Recarrega combustível lentamente quando não está acelerando
                const deltaSec = delta / 1000;
                if (!this.fuelDepleted) {
                    this.shipFuel = Math.min(this.shipMaxFuel, this.shipFuel + this.fuelRechargeRate * deltaSec);
                } else {
                    // Se tanque estava vazio, recarrega automaticamente até um pequeno limiar para permitir retomar
                    this.shipFuel = Math.min(this.shipMaxFuel, this.shipFuel + (this.fuelRechargeRate/2) * deltaSec);
                    if (this.shipFuel >= 5) {
                        this.fuelDepleted = false;
                    }
                }
            }

            // Atualiza UI de combustível (se existir)
            if (this.fuelBar) {
                const fuelPercent = Math.max(0, this.shipFuel / this.shipMaxFuel);
                this.fuelBar.setScale(fuelPercent, 1);
            }
            if (this.fuelText) {
                this.fuelText.setText(`${Math.round(this.shipFuel)}/${this.shipMaxFuel}`);
            }
            
            // Limita a velocidade máxima
            const velocity = this.ship.body.velocity;
            const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
            if (speed > this.shipMaxSpeed) {
                const ratio = this.shipMaxSpeed / speed;
                this.ship.setVelocity(velocity.x * ratio, velocity.y * ratio);
            }
            
            // Atualiza os inimigos
            this.updateEnemies();
            
            // Atualiza o oxigênio (consome ao longo do tempo)
            this.updateOxygen(delta);
            
            // Atualiza a UI
            this.updateUI();
        }
    }
    
    /**
     * Atualiza o sistema de oxigênio
     */
    updateOxygen(delta) {
        if (this.isGameOver) return;
        
        // Consome oxigênio ao longo do tempo
        const deltaSec = delta / 1000;
        this.shipOxygen = Math.max(0, this.shipOxygen - (this.oxygenConsumptionRate * deltaSec));
        
        // Game over se oxigênio acabar
        if (this.shipOxygen <= 0) {
            this.gameOver('Oxigênio esgotado!');
        }
    }
    
    updateEnemies() {
        // Atualiza o comportamento dos inimigos
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            
            if (enemy.active) {
                // Faz o inimigo olhar na direção do movimento
                if (enemy.body && (enemy.body.velocity.x !== 0 || enemy.body.velocity.y !== 0)) {
                    enemy.rotation = Phaser.Math.Angle.Between(
                        enemy.x - enemy.body.velocity.x, 
                        enemy.y - enemy.body.velocity.y,
                        enemy.x, 
                        enemy.y
                    ) + Math.PI / 2;
                }
                
                // Adiciona uma leve rotação constante
                enemy.rotation += 0.01;
                
                // Atualiza a posição das barras de vida se existirem
                if (enemy.healthBarBg) {
                    enemy.healthBarBg.x = enemy.x;
                    enemy.healthBarBg.y = enemy.y + 30;
                }
                if (enemy.healthBar) {
                    enemy.healthBar.x = enemy.x;
                    enemy.healthBar.y = enemy.y + 30;
                }
            }
        }
    }
    
    updateUI() {
        // Atualiza o texto de criptomoedas (já animado no mineCrypto)
        // this.cryptoText.setText(this.cryptoBalance.toFixed(2));
        
        // Atualiza a barra de vida com animação suave
        const healthPercent = Math.max(0, this.shipHealth / this.shipMaxHealth);
        if (this.healthBar.scaleX !== healthPercent) {
            this.uiAnimations.animateBar(this.healthBar, this.healthBar.scaleX, healthPercent, 250);
        }
        this.healthText.setText(`${Math.round(this.shipHealth)}/${this.shipMaxHealth}`);
        
        // Efeito de glow pulsante quando vida está baixa
        if (healthPercent < 0.3 && !this.healthText._glowing) {
            this.healthText._glowing = true;
            this.uiAnimations.glowPulse(this.healthText, '#ff0000');
        } else if (healthPercent >= 0.3 && this.healthText._glowing) {
            this.healthText._glowing = false;
            this.uiAnimations.removeGlow(this.healthText);
        }
        
        // Atualiza o combustível com animação suave
        const fuelPercent = Math.max(0, this.shipFuel / this.shipMaxFuel);
        if (Math.abs(this.fuelBar.scaleX - fuelPercent) > 0.01) {
            this.uiAnimations.animateBar(this.fuelBar, this.fuelBar.scaleX, fuelPercent, 200, 'Linear');
        }
        this.fuelText.setText(`${Math.round(this.shipFuel)}/${this.shipMaxFuel}`);
        
        // Pulso na barra de combustível quando crítico
        if (fuelPercent < 0.2 && !this.fuelBar._pulsing) {
            this.fuelBar._pulsing = true;
            this.fuelBar.setFillStyle(0xff6600);
        } else if (fuelPercent >= 0.2 && this.fuelBar._pulsing) {
            this.fuelBar._pulsing = false;
            this.fuelBar.setFillStyle(0x00aaff);
        }
        
        // Atualiza a barra de oxigênio
        if (this.oxygenBar && this.oxygenText) {
            const oxygenPercent = Math.max(0, this.shipOxygen / this.shipMaxOxygen);
            if (Math.abs(this.oxygenBar.scaleX - oxygenPercent) > 0.01) {
                this.uiAnimations.animateBar(this.oxygenBar, this.oxygenBar.scaleX, oxygenPercent, 200, 'Linear');
            }
            this.oxygenText.setText(`${Math.round(this.shipOxygen)}/${this.shipMaxOxygen}`);
            
            // Muda cor da barra de oxigênio baseada no nível
            if (oxygenPercent < 0.25) {
                this.oxygenBar.setFillStyle(0xff0000); // Vermelho quando crítico
            } else if (oxygenPercent < 0.5) {
                this.oxygenBar.setFillStyle(0xffaa00); // Laranja quando baixo
            } else {
                this.oxygenBar.setFillStyle(0x00ccff); // Azul normal
            }
        }
        
        // Atualiza a carga
        if (this.cargoText) {
            this.cargoText.setText(`${this.currentCargo}/${this.shipCargoCapacity} kg`);
            
            // Muda cor baseada na capacidade
            const cargoPercent = this.currentCargo / this.shipCargoCapacity;
            if (cargoPercent >= 0.9) {
                this.cargoText.setColor('#ff4444'); // Vermelho quando quase cheio
            } else if (cargoPercent >= 0.7) {
                this.cargoText.setColor('#ffaa00'); // Laranja quando 70% cheio
            } else {
                this.cargoText.setColor('#ffaa00'); // Laranja normal
            }
        }
        
        // Atualiza a velocidade
        const velocity = this.ship.body.velocity;
        const speed = Math.round(Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y));
        this.speedText.setText(`🚀 SPEED: ${speed}/${this.shipMaxSpeed} km/h`);
        
        // Muda a cor da velocidade com base na velocidade
        const speedPercent = Math.min(1, speed / this.shipMaxSpeed);
        const r = Math.round(85 + 170 * speedPercent);
        const g = Math.round(170 - 170 * speedPercent);
        const b = 255;
        this.speedText.setColor(`rgb(${r},${g},${b})`);
        
        // Atualiza a raridade se disponível
        if (this.rarityText && this.shipMetadata) {
            const raridade = this.getAttributeValue(this.shipMetadata.attributes, 'Raridade') || 'Comum';
            this.rarityText.setText(`⭐ ${raridade.toUpperCase()}`);
            this.rarityText.setColor(this.getRarityColor(raridade));
        }
    }
    
    /**
     * Cleanup ao destruir a cena - libera recursos dos managers
     */
    shutdown() {
        // Limpa timer de spawn de inimigos
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.remove();
        }
        
        // Limpa timer de spawn de meteoros
        if (this.meteorSpawnTimer) {
            this.meteorSpawnTimer.remove();
        }
        
        // Limpa todos os efeitos e managers
        if (this.particleEffects) {
            this.particleEffects.cleanup();
        }
        if (this.trailEffects) {
            this.trailEffects.cleanup();
        }
        if (this.uiAnimations) {
            this.uiAnimations.cleanup();
        }
        if (this.audioManager) {
            this.audioManager.destroy();
        }
    }
    
    /**
     * Carrega as características da nave padrão do JSON
     */
    loadDefaultShipCharacteristics() {
        try {
            // Carrega o JSON da nave padrão
            const defaultShipData = this.cache.json.get('defaultShipMetadata');
            
            if (defaultShipData && defaultShipData.gameplay_stats) {
                const stats = defaultShipData.gameplay_stats;
                
                // Aplica as características do JSON
                this.shipMaxSpeed = stats.max_speed || 100;
                this.shipCargoCapacity = stats.cargo_capacity || 50;
                this.shipMaxFuel = stats.max_fuel || 100;
                this.shipMaxOxygen = stats.max_oxygen || 100;
                this.shipMaxHealth = stats.max_health || 100;
                this.shipAcceleration = stats.acceleration || 800;
                this.fuelConsumptionRate = stats.fuel_consumption_rate || 20;
                this.fuelRechargeRate = stats.fuel_recharge_rate || 10;
                this.oxygenConsumptionRate = stats.oxygen_consumption_rate || 1;
                
                // Inicializa valores atuais
                this.shipFuel = this.shipMaxFuel;
                this.shipOxygen = this.shipMaxOxygen;
                this.shipHealth = this.shipMaxHealth;
                this.currentCargo = 0;
                
                // Salva a metadata para uso posterior
                this.shipMetadata = defaultShipData;
                
                console.log('✅ Características da nave carregadas do JSON:', {
                    velocidade: this.shipMaxSpeed,
                    carga: this.shipCargoCapacity,
                    combustivel: this.shipMaxFuel,
                    oxigenio: this.shipMaxOxygen,
                    escudo: this.shipMaxHealth
                });
            } else {
                console.warn('⚠️ JSON da nave padrão não encontrado ou inválido, usando valores padrão');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar características da nave:', error);
            console.log('Usando valores padrão do código');
        }
    }
    
    /**
     * Aplica as características do NFT à nave
     */
    applyNFTCharacteristics(nftMetadata) {
        try {
            if (!nftMetadata || !nftMetadata.attributes) {
                console.warn('NFT metadata inválida, mantendo características padrão');
                return;
            }

            const attributes = nftMetadata.attributes;
            
            // Extrai os atributos do NFT
            const velocidade = this.getAttributeValue(attributes, 'Velocidade') || this.shipMaxSpeed;
            const carga = this.getAttributeValue(attributes, 'Carga') || this.shipCargoCapacity;
            const combustivel = this.getAttributeValue(attributes, 'Combustível') || this.shipMaxFuel;
            const oxigenio = this.getAttributeValue(attributes, 'Oxigênio') || this.shipMaxOxygen;
            const escudo = this.getAttributeValue(attributes, 'Escudo') || this.shipMaxHealth;
            const raridade = this.getAttributeValue(attributes, 'Raridade') || 'Comum';
            
            // Aplica as características do NFT (sobrescreve as padrão)
            this.shipMaxSpeed = velocidade;
            this.shipCargoCapacity = carga;
            this.shipMaxFuel = combustivel;
            this.shipMaxOxygen = oxigenio;
            this.shipMaxHealth = escudo;
            
            // Inicializa valores atuais com os novos máximos
            this.shipFuel = this.shipMaxFuel;
            this.shipOxygen = this.shipMaxOxygen;
            this.shipHealth = this.shipMaxHealth;
            this.currentCargo = 0;
            
            // Salva a metadata do NFT
            this.shipMetadata = nftMetadata;
            
            console.log('✅ Características do NFT aplicadas:', {
                nome: nftMetadata.name || 'NFT Desconhecido',
                raridade: raridade,
                velocidade: velocidade,
                carga: carga,
                combustivel: combustivel,
                oxigenio: oxigenio,
                escudo: escudo
            });
            
            // Atualiza o nome da nave na UI se disponível
            if (nftMetadata.name && this.playerNameText) {
                this.playerNameText.setText(nftMetadata.name);
                this.playerNameText.setColor(this.getRarityColor(raridade));
            }
            
        } catch (error) {
            console.error('❌ Erro ao aplicar características do NFT:', error);
            console.log('Mantendo características padrão da nave');
        }
    }
    
    /**
     * Extrai o valor de um atributo específico do NFT
     */
    getAttributeValue(attributes, traitType) {
        if (!attributes || !Array.isArray(attributes)) {
            return null;
        }
        
        const attribute = attributes.find(attr => 
            attr.trait_type === traitType || attr.trait_type === traitType.toLowerCase()
        );
        
        return attribute ? attribute.value : null;
    }
    
    /**
     * Retorna a cor da raridade baseada no nível
     */
    getRarityColor(rarity) {
        const colors = {
            'Comum': '#CCCCCC',
            'Incomum': '#00FF00',
            'Raro': '#0080FF',
            'Épico': '#A020F0',
            'Lendário': '#FFD700'
        };
        return colors[rarity] || '#FFFFFF';
    }
    
    /**
     * Limpeza automática de memória
     */
    performMemoryCleanup() {
        console.log('[MEMORY] Performing cleanup...');
        
        // Limpa projéteis antigos
        if (this.projectiles) {
            this.projectiles.getChildren().forEach(projectile => {
                if (projectile.active && projectile.lifespan) {
                    projectile.lifespan -= 1000;
                    if (projectile.lifespan <= 0) {
                        projectile.destroy();
                    }
                }
            });
        }
        
        // Limpa meteoros muito distantes
        if (this.meteorsGroup) {
            this.meteorsGroup.getChildren().forEach(meteor => {
                if (meteor.active && this.ship) {
                    const distance = Phaser.Math.Distance.Between(
                        this.ship.x, this.ship.y, 
                        meteor.x, meteor.y
                    );
                    if (distance > this.cullRadius * 3) {
                        meteor.destroy();
                    }
                }
            });
        }
        
        // Limpa inimigos muito distantes
        if (this.enemies) {
            this.enemies.forEach((enemy, index) => {
                if (enemy.active && this.ship) {
                    const distance = Phaser.Math.Distance.Between(
                        this.ship.x, this.ship.y, 
                        enemy.x, enemy.y
                    );
                    if (distance > this.cullRadius * 3) {
                        enemy.destroy();
                        this.enemies.splice(index, 1);
                    }
                }
            });
        }
        
        // Força garbage collection se disponível
        if (window.gc) {
            window.gc();
        }
        
        console.log('[MEMORY] Cleanup completed');
    }
}