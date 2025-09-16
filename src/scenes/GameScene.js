import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        // Debug flags
        this.debugExplosionMarkers = true; // set to false to disable marker overlays
        this.activeExplosions = [];
        // Physics group for enemies (used for collisions)
        this.enemiesGroup = null;
        this.isThrusting = false; // Estado do motor da nave
        this.cryptoBalance = 0; // Saldo de criptomoedas
        this.miningRate = 0; // Taxa de mineração atual
        this.miningPlanets = []; // Planetas que podem ser minerados
        this.enemies = []; // Naves inimigas
        this.playerName = 'Piloto'; // Nome padrão do jogador
        this.playerNameText = null; // Referência para o texto do nome
        
        // Propriedades da nave
        this.shipMaxHealth = 100;
        this.shipHealth = 100;
        this.shipSpeed = 0.1; // Velocidade base da nave
        this.shipMaxSpeed = 500; // Velocidade máxima
        this.shipAcceleration = 800; // Aceleração da nave
    }

    preload() {
        // Define o caminho base para os assets
        this.load.setPath('');
        
        // Carrega os assets com caminhos absolutos
        this.load.atlas('ship', '/assets/images/01.png', '/assets/images/01.json');
        
        // Carrega a imagem de idle
        this.load.image('ship_idle', '/assets/images/idle.png');
        
        // Carrega os assets do projétil
        this.load.atlas('rocket', '/assets/images/rocket.png', '/assets/images/rocket.json');
        
        // Carrega a imagem do inimigo
        this.load.atlas('enemy', '/assets/images/02.png', '/assets/images/02.json');
        
        // Carrega a animação de explosão
        console.log('Carregando textura de explosão...');
        this.load.atlas('explosion', '/assets/images/explosion.png', '/assets/images/explosion.json');
        
    // Carrega atlas de planetas exportado do Aseprite (planetas individuais em frames)
    this.load.atlas('planets', '/assets/background/planets.png', '/assets/background/planets.json');
        
        // Carrega o efeito sonoro do foguete
        this.load.audio('rocket', '/assets/sounds_effects/rocket.mp3');
        
        // Adiciona logs de depuração
        this.load.on('filecomplete', function (key, type, data) {
            console.log('Asset carregado:', key, type);
        });
        
        this.load.on('loaderror', function (file) {
            console.error('Erro ao carregar asset:', file.src);
        });
    }

    create(data) {
        // Recebe o nome do jogador da cena anterior, se existir
        if (data && data.playerName) {
            this.playerName = data.playerName;
        }
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
        
        // Adiciona a nave na tela e inicia a animação de idle
        this.ship = this.physics.add.sprite(0, 0, 'ship_idle');
        this.ship.play('ship_idle');

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
        
        // Configura colisões
        this.setupCollisions();
        
        // Configura o clique esquerdo do mouse para disparar
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.fireProjectile();
            }
        });
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
        
        // Cria estrelas distantes (camada 1 - parallax lento)
        this.distantStars = this.add.group();
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(-2000, 2000);
            const y = Phaser.Math.Between(-2000, 2000);
            const star = this.add.rectangle(x, y, 1, 1, 0xffffff);
            star.setDepth(-9);
            this.distantStars.add(star);
        }
        
        // Cria estrelas brilhantes (camada 2 - parallax mais rápido)
        this.brightStars = this.add.group();
        for (let i = 0; i < 20; i++) {
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

        for (let i = 0; i < 15; i++) {
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

        // Cria inimigos
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(-1500, 1500);
            const y = Phaser.Math.Between(-1500, 1500);
            
            // Cria a nave inimiga usando o atlas
            const enemy = this.physics.add.sprite(x, y, 'enemy');
            enemy.setScale(0.5);
            enemy.setDepth(1);
            
            // Inicia a animação do inimigo
            enemy.play('enemy_thrust');
            
            // Propriedades do inimigo
            enemy.health = 100; // Vida do inimigo é 100
            enemy.maxHealth = 100;
            enemy.speed = Phaser.Math.FloatBetween(30, 100);
            
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
                0xff0000
            ).setOrigin(0.5).setDepth(3);
            
            // Adiciona movimento aleatório
            this.time.addEvent({
                delay: Phaser.Math.Between(2000, 5000),
                callback: () => {
                    if (enemy.active) {
                        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                        enemy.setVelocity(
                            Math.cos(angle) * enemy.speed,
                            Math.sin(angle) * enemy.speed
                        );
                    }
                },
                callbackScope: this,
                loop: true
            });
            
            this.enemies.push(enemy);
            // Add to physics group for collisions
            this.enemiesGroup.add(enemy);
        }
    }
    
    setupCollisions() {
        // Colisão entre projéteis do jogador e inimigos (use the physics group)
        if (!this.enemiesGroup) this.enemiesGroup = this.physics.add.group();
        this.physics.add.overlap(this.projectiles, this.enemiesGroup, this.hitEnemy, null, this);
    }
    
    hitEnemy(projectile, enemy) {
        // Remove o projétil
        projectile.destroy();
        
        // Dano ao inimigo (10 de dano por tiro)
        enemy.health -= 10;
        
        // Efeito visual de dano
        const damageText = this.add.text(enemy.x, enemy.y - 20, '-10', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);
        
        // Animação do texto de dano
        this.tweens.add({
            targets: damageText,
            y: enemy.y - 80,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                damageText.destroy();
            }
        });
        
        // NOTE: efeito procedural removido — usaremos apenas a animação do atlas para explosões
        
        // Atualiza a barra de vida se existir
        if (enemy.healthBar) {
            const healthPercent = Math.max(0, enemy.health / enemy.maxHealth);
            enemy.healthBar.setScale(healthPercent, 1);
        }
        
        // Se o inimigo foi destruído
        if (enemy.health <= 0 && !enemy.destroyed) {
            enemy.destroyed = true; // Marca como destruído para evitar chamadas múltiplas
            console.log('Inimigo destruído, criando explosão...');

            // Esconde o inimigo e desativa seu corpo físico
            enemy.setVisible(false);
            enemy.body.enable = false;

            // Remove as barras de vida imediatamente
            if (enemy.healthBar) enemy.healthBar.destroy();
            if (enemy.healthBarBg) enemy.healthBarBg.destroy();

            // Cria o sprite de explosão no local do inimigo
            // Cria o sprite de explos e3o no local do inimigo
            console.log('DEBUG: explosion texture exists?', this.textures.exists('explosion'));
            if (this.textures.exists('explosion')) {
                console.log('DEBUG: explosion frames:', this.textures.get('explosion').getFrameNames());
            }

            // Escolhe o frame inicial correto (se disponível) para garantir que a animação comece no frame Aseprite
            const firstExplosionFrame = (this.explosionFrameNames && this.explosionFrameNames.length) ? this.explosionFrameNames[0] : null;
            const explosion = firstExplosionFrame ? this.add.sprite(enemy.x, enemy.y, 'explosion', firstExplosionFrame) : this.add.sprite(enemy.x, enemy.y, 'explosion');
            // Aumenta depth/scale para garantir visibilidade da animação
            explosion.setScale(1.2);
            explosion.setDepth(2000);
            explosion.setOrigin(0.5, 0.5);
            explosion.setAlpha(1);
            // Garante que a explosão não se mova com a câmera (opcional):
            explosion.setScrollFactor(1);
            console.log('Sprite de explosão criado:', explosion, 'firstFrame:', firstExplosionFrame);

            // Função de finalização única
            const finalizeExplosion = () => {
                console.log('DEBUG: finalizeExplosion called for enemy:', enemy);
                const index = this.enemies.indexOf(enemy);
                if (index > -1) this.enemies.splice(index, 1);
                try { if (enemy && enemy.destroy) enemy.destroy(); } catch (e) { console.warn('Error destroying enemy:', e); }
                try { if (explosion && explosion.destroy) explosion.destroy(); } catch (e) { console.warn('Error destroying explosion:', e); }
                this.cryptoBalance += 10;
                if (this.cryptoText) this.cryptoText.setText(`Crypto: ${this.cryptoBalance.toFixed(2)}`);
            };

            // Reproduz a animação de explosão (e finaliza quando completar). Se a animação não existir, finalizamos após um breve delay.
            if (this.anims.exists('explosion_anim')) {
                explosion.once('animationstart', () => console.log('DEBUG: explosion animation started at', explosion.x, explosion.y));
                explosion.once('animationcomplete', () => {
                    console.log('DEBUG: explosion animation complete for enemy at', enemy.x, enemy.y);
                    finalizeExplosion();
                });
                explosion.play('explosion_anim');
                // marca como ativo para debug
                this.activeExplosions.push(explosion);
                if (this.debugExplosionMarkers) {
                    const marker = this.add.circle(explosion.x, explosion.y, 6, 0x00ff00).setDepth(3000).setScrollFactor(1);
                    this.time.delayedCall(800, () => marker.destroy());
                }
            } else {
                // fallback: mostra frame estático por 500ms
                console.warn('WARN: explosion_anim not found; using fallback delay');
                this.time.delayedCall(500, finalizeExplosion);
            }
        }
    }

    createCrosshair() {
        // Cria a mira do mouse como um círculo vermelho
        this.crosshair = this.add.circle(0, 0, 5, 0xff0000);
        this.crosshair.setStrokeStyle(2, 0xffffff);
        this.crosshair.setDepth(10); // Garante que a mira fique acima de tudo
    }

    createUI() {
        // Estilo base para os textos da UI
        const style = {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 10, y: 5 },
            stroke: '#000000',
            strokeThickness: 2,
            fontFamily: 'Arial, sans-serif'
        };

        // Posições ajustadas para o canto superior esquerdo
        const startX = 20;
        const startY = 20;
        const spacing = 35;
        
        // Mostra o saldo de criptomoedas
        this.cryptoText = this.add.text(startX, startY, 'Crypto: 0.00', { ...style, fill: '#00ff00' });
        
        // Barra de vida
        const healthBarY = startY + spacing;
        const healthBarWidth = 180;
        const healthBarHeight = 20;
        
        this.healthBarBg = this.add.rectangle(startX, healthBarY + healthBarHeight/2, healthBarWidth, healthBarHeight, 0x000000, 0.7)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);
            
        this.healthBar = this.add.rectangle(startX, healthBarY + healthBarHeight/2, healthBarWidth, healthBarHeight, 0xff0000, 0.9)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);
            
        this.healthText = this.add.text(startX, healthBarY + healthBarHeight/2 + 15, 'Vida: 100/100', { 
            ...style, 
            fill: '#ff5555',
            fontSize: '16px'
        });
        
        // Velocidade
        this.speedText = this.add.text(startX, healthBarY + spacing * 1.5, 'Velocidade: 0', { 
            ...style, 
            fill: '#55aaff',
            fontSize: '16px'
        });
        
        // Aplica configurações comuns a todos os textos
        [this.cryptoText, this.healthText, this.speedText].forEach(text => {
            text.setScrollFactor(0);
            text.setDepth(20);
            text.setPadding(10, 5);
        });
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
            
            // Verifica a distância da nave aos planetas mineráveis
            for (let planet of this.miningPlanets) {
                const distance = Phaser.Math.Distance.Between(this.ship.x, this.ship.y, planet.x, planet.y);
                
                // Se a nave estiver perto o suficiente, adiciona a taxa de mineração
                if (distance < 200) {
                    // Quanto mais perto, maior a taxa de mineração
                    const proximityBonus = Math.max(0, (200 - distance) / 200);
                    totalRate += planet.miningRate * (1 + proximityBonus);
                    
                    // Efeito visual de mineração
                    this.add.circle(planet.x, planet.y, 5, 0xffff00)
                        .setDepth(5)
                        .setScale(0.5)
                        .setAlpha(0.7);
                }
            }
            
            // Adiciona criptomoedas ao saldo
            this.cryptoBalance += totalRate;
            
            // Atualiza a interface
            if (this.cryptoText) {
                this.cryptoText.setText(`Crypto: ${this.cryptoBalance.toFixed(2)}`);
            }
        }
    }

    fireProjectile() {
        // Cria um novo projétil na posição da nave
        const offsetX = Math.cos(this.ship.rotation - Math.PI/2) * 30;
        const offsetY = Math.sin(this.ship.rotation - Math.PI/2) * 30;
        // Cria o projétil como sprite com física
        const projectile = this.physics.add.sprite(
            this.ship.x + offsetX,
            this.ship.y + offsetY,
            'rocket',
            'Sprite-0002-Recovered 0.'
        );
        projectile.setScale(0.5);
        projectile.setDepth(1);
        projectile.setOrigin(0.5, 0.5);
        projectile.body.setAllowGravity(false);
        projectile.setCollideWorldBounds(false);

        // Define a rotação do projétil para a mesma da nave
        projectile.rotation = this.ship.rotation;

        // Calcula a direção do movimento e aplica velocidade via física
        const angle = this.ship.rotation - Math.PI/2;
        const speed = 800; // velocidade aplicada ao corpo físico
        projectile.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

        // Adiciona o projétil ao grupo de projéteis (grupo físico)
        this.projectiles.add(projectile);
    // Também define propriedades de movimento manual para compatibilidade com o loop de update
    // (mantém o comportamento anterior onde o projétil era movido manualmente)
    const manualSpeed = 10; // pixels por frame, como antes
    projectile.speedX = Math.cos(angle) * manualSpeed;
    projectile.speedY = Math.sin(angle) * manualSpeed;
        
        // Adiciona animação do projétil
        if (!this.anims.exists('rocket_anim')) {
            this.anims.create({
                key: 'rocket_anim',
                frames: this.anims.generateFrameNames('rocket', {
                    frames: [0, 1],
                    prefix: 'Sprite-0002-Recovered ',
                    suffix: '.'
                }),
                frameRate: 5,
                repeat: -1
            });
        }
        
        projectile.play('rocket_anim');
        
        // Remove o projétil após 3 segundos
        this.time.delayedCall(3000, () => {
            if (projectile && projectile.active) {
                projectile.destroy();
            }
        });
    }

    update(time, delta) {
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
            if (this.spaceKey.isDown) {
                if (!this.isThrusting) {
                    this.ship.play('ship_thrust', true);
                    this.isThrusting = true;
                    
                    // Toca o som do foguete se não estiver tocando
                    if (!this.isRocketPlaying) {
                        this.rocketSound.play();
                        this.isRocketPlaying = true;
                    }
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
            } else {
                if (this.isThrusting) {
                    this.ship.play('ship_idle', true);
                    this.isThrusting = false;
                    
                    // Para o som do foguete
                    if (this.isRocketPlaying) {
                        this.rocketSound.stop();
                        this.isRocketPlaying = false;
                    }
                }
                this.ship.setAcceleration(0);
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
            
            // Atualiza a UI
            this.updateUI();
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
        // Atualiza o texto de criptomoedas
        this.cryptoText.setText(`Crypto: ${this.cryptoBalance.toFixed(2)}`);
        
        // Atualiza a barra de vida
        const healthPercent = Math.max(0, this.shipHealth / this.shipMaxHealth);
        this.healthBar.setScale(healthPercent, 1);
        this.healthText.setText(`Vida: ${Math.round(this.shipHealth)}/${this.shipMaxHealth}`);
        
        // Atualiza a velocidade
        const velocity = this.ship.body.velocity;
        const speed = Math.round(Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y));
        this.speedText.setText(`Velocidade: ${speed}`);
        
        // Muda a cor da velocidade com base na velocidade
        const speedPercent = Math.min(1, speed / this.shipMaxSpeed);
        const r = Math.round(85 + 170 * speedPercent);
        const g = Math.round(170 - 170 * speedPercent);
        const b = 255;
        this.speedText.setColor(`rgb(${r},${g},${b})`);
    }
}