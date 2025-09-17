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
        // Combustível
        this.shipMaxFuel = 100; // capacidade máxima do tanque
        this.shipFuel = this.shipMaxFuel; // combustível atual
        this.fuelConsumptionRate = 20; // unidades por segundo enquanto acelera
        this.fuelRechargeRate = 10; // unidades por segundo quando não está acelerando
        this.fuelDepleted = false; // flag quando tanque vazio
        // Culling distance (only render/enable objects within this radius of the ship)
        this.cullRadius = 1200; // pixels
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
        
        // Create meteor animation if atlas available
        if (!this.anims.exists('meteoro_anim') && this.textures.exists('meteoro')) {
            this.anims.create({
                key: 'meteoro_anim',
                frames: [
                    { key: 'meteoro', frame: 'meteoro 0.aseprite' },
                    { key: 'meteoro', frame: 'meteoro 1.aseprite' }
                ],
                frameRate: 6,
                repeat: -1
            });
        }
        
        // Adiciona a nave na tela e inicia a animação de idle
        this.ship = this.physics.add.sprite(0, 0, 'ship_idle');
        this.ship.play('ship_idle');
        // Ajusta corpo de colisão da nave (circle) para melhorar detecção
        this.ship.body.setCircle(Math.max(this.ship.width, this.ship.height) / 2 * 0.6);
        this.ship.body.setOffset(this.ship.width * 0.5 - (Math.max(this.ship.width, this.ship.height) / 2 * 0.6), this.ship.height * 0.5 - (Math.max(this.ship.width, this.ship.height) / 2 * 0.6));
        
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
        // Spawn periódico de meteoros vindos de bordas do mundo
        this.time.addEvent({
            delay: 1200,
            callback: () => this.spawnMeteor(),
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
            const offset = 80;
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
        meteor.setScale(0.6);
        meteor.setDepth(1);
        meteor.setOrigin(0.5);
        meteor.body.setAllowGravity(false);
        meteor.setCollideWorldBounds(false);
        // Ensure body exists and set a circular body for meteor
        if (meteor.body) {
            const r = Math.max(meteor.displayWidth, meteor.displayHeight) * 0.45;
            meteor.body.setCircle(r);
            meteor.body.setOffset((meteor.displayWidth - r) / 2, (meteor.displayHeight - r) / 2);
        }
        meteor.health = 30;

        // Direção aproximada para o centro do mundo com variação
        const targetX = Phaser.Math.Between(-800, 800);
        const targetY = Phaser.Math.Between(-800, 800);
        const angle = Phaser.Math.Angle.Between(meteor.x, meteor.y, targetX, targetY);
        const speed = Phaser.Math.Between(60, 180);
        meteor.rotation = angle;
        // store velocity (pixels per second) for both physics and manual updates
        meteor.vx = Math.cos(angle) * speed;
        meteor.vy = Math.sin(angle) * speed;
        // apply to physics body initially
        meteor.setVelocity(meteor.vx, meteor.vy);

        // Play frames animation if exists (no self-spin)
        if (this.anims.exists('meteoro_anim')) {
            meteor.play('meteoro_anim');
        }

        this.meteorsGroup.add(meteor);
        console.log('Spawned meteor at', x, y, 'velocity', meteor.body.velocity);
        if (this.meteors && Array.isArray(this.meteors)) {
            this.meteors.push(meteor);
        } else {
            this.meteors = [meteor];
        }

        // Destroy after a while to avoid memory leak
        this.time.delayedCall(20000, () => { if (meteor && meteor.active) meteor.destroy(); });
    }
    
    // Disable/enable visibility and physics of entities that are far from the player ship to save render/physics work
    cullEntities() {
        if (!this.ship) return;
        const sx = this.ship.x;
        const sy = this.ship.y;
        const r = this.cullRadius;
        const r2 = r * r;

        // Meteors (group)
        if (this.meteorsGroup) {
            this.meteorsGroup.getChildren().forEach(m => {
                if (!m) return;
                const dx = m.x - sx;
                const dy = m.y - sy;
                const inside = (dx*dx + dy*dy) <= r2;
                // Toggle visible/active/body
                m.setVisible(inside);
                if (m.body) {
                    m.body.enable = inside;
                }
                // Keep sprite active flag consistent
                m.active = inside;
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
            // guardamos o evento para poder removê-lo quando o inimigo for destruído
            const movementEvent = this.time.addEvent({
                delay: Phaser.Math.Between(2000, 5000),
                callback: () => {
                    // proteção: o inimigo pode ter sido destruído/invalidado
                    if (!enemy || !enemy.active || !enemy.body || typeof enemy.setVelocity !== 'function') {
                        return;
                    }
                    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
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
        }
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
        // Lógica de dano ao inimigo
        projectile.destroy(); // Destrói o projétil
        enemy.health -= 50; // Reduz a vida do inimigo
    
        // Atualiza a barra de vida do inimigo
        const healthPercentage = Math.max(0, enemy.health / enemy.maxHealth);
        enemy.healthBar.scaleX = healthPercentage;
    
        // Se a vida do inimigo chegar a zero, destrói o inimigo
        if (enemy.health <= 0) {
            this.createExplosion(enemy.x, enemy.y);
            this.sound.play('explosion', { volume: 0.5 });
    
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
        // Reduz a vida da nave do jogador
        this.shipHealth -= 25;
        this.updateUI(); // CORREÇÃO: Chamada para a função correta
    
        // Cria uma explosão no ponto de colisão
        this.createExplosion(ship.x, ship.y);
        this.sound.play('explosion', { volume: 0.5 });
    
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
        projectile.destroy();
        meteor.health -= 15;
        if (meteor.health <= 0) {
            this.createExplosion(meteor.x, meteor.y);
            this.sound.play('explosion', { volume: 0.3 });
            meteor.destroy();
        }
    }

    shipHitByMeteor(ship, meteor) {
        this.shipHealth -= 10;
        this.updateUI();
        this.createExplosion(meteor.x, meteor.y);
        this.sound.play('explosion', { volume: 0.3 });
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

    gameOver() {
        console.log('Game Over');
        // Para todos os sons e reinicia a cena
        this.sound.stopAll();
        this.scene.restart({ playerName: this.playerName });
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
        
        // Combustível (barra e texto)
        const fuelBarY = healthBarY + spacing * 1.5 + 30;
        const fuelBarWidth = 180;
        const fuelBarHeight = 16;
        this.fuelBarBg = this.add.rectangle(startX, fuelBarY + fuelBarHeight/2, fuelBarWidth, fuelBarHeight, 0x000000, 0.7)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);
        this.fuelBar = this.add.rectangle(startX, fuelBarY + fuelBarHeight/2, fuelBarWidth, fuelBarHeight, 0x00aaff, 0.95)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);
        this.fuelText = this.add.text(startX + fuelBarWidth + 10, fuelBarY + fuelBarHeight/2, 'Fuel', { ...style, fontSize: '14px' })
            .setScrollFactor(0)
            .setDepth(20);
        
        // Aplica configurações comuns a todos os textos
        [this.cryptoText, this.healthText, this.speedText].forEach(text => {
            text.setScrollFactor(0);
            text.setDepth(20);
            text.setPadding(10, 5);
        });
        // Ensure fuel UI elements also have scroll factor/depth
        if (this.fuelBarBg) this.fuelBarBg.setDepth(20).setScrollFactor(0);
        if (this.fuelBar) this.fuelBar.setDepth(21).setScrollFactor(0);
        if (this.fuelText) this.fuelText.setDepth(22).setScrollFactor(0);
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
        // Toca som do projétil ao disparar
        try { this.sound.play('bullet', { volume: 0.9 }); } catch (e) { console.warn('Falha ao tocar som de bullet', e); }
        
        // Remove o projétil após 3 segundos
        this.time.delayedCall(3000, () => {
            if (projectile && projectile.active) {
                projectile.destroy();
            }
        });
    }

    update(time, delta) {
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
        
        // Atualiza o combustível
        const fuelPercent = Math.max(0, this.shipFuel / this.shipMaxFuel);
        this.fuelBar.setScale(fuelPercent, 1);
        this.fuelText.setText(`Combustível: ${Math.round(this.shipFuel)}`);
        
        // Muda a cor da velocidade com base na velocidade
        const speedPercent = Math.min(1, speed / this.shipMaxSpeed);
        const r = Math.round(85 + 170 * speedPercent);
        const g = Math.round(170 - 170 * speedPercent);
        const b = 255;
        this.speedText.setColor(`rgb(${r},${g},${b})`);
    }
}