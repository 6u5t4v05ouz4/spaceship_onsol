import Phaser from 'phaser';

export default class GameplaySimulation extends Phaser.Scene {
    constructor() {
        super('GameplaySimulation');
        this.simulationSpeed = 1;
        this.elements = {
            ship: null,
            enemies: [],
            meteors: [],
            bullets: [],
            explosions: [],
            planets: []
        };
        
        this.lastFireTime = 0;
    }

    preload() {
        // Carrega os mesmos assets do jogo principal
        this.load.setPath('');
        
        // Carrega atlas da nave
        this.load.atlas('ship', '/assets/images/01.png', '/assets/images/01.json');
        this.load.image('ship_idle', '/assets/images/idle.png');
        
        // Carrega atlas do inimigo
        this.load.atlas('enemy', '/assets/images/02.png', '/assets/images/02.json');
        
        // Carrega atlas de meteoros
        this.load.atlas('meteoro', '/assets/images/meteoro.png', '/assets/images/meteoro.json');
        
        // Carrega atlas de explosões
        this.load.atlas('explosion', '/assets/images/explosion.png', '/assets/images/explosion.json');
        
        // Carrega atlas de projéteis
        this.load.atlas('minibullet', '/assets/images/minibullet.png', '/assets/images/minibullet.json');
        
        // Carrega atlas de planetas
        this.load.atlas('planets', '/assets/background/planets.png', '/assets/background/planets.json');
        
        // Carrega background
        this.load.image('stars', '/assets/background/stars.jpeg');
        
        // Carrega sons com volume baixo para profundidade
        this.load.audio('bullet_sound', '/assets/sounds_effects/bullet.mp3');
        this.load.audio('explosion_sound', '/assets/sounds_effects/explosion.mp3');
    }

    create() {
        // Configura o mundo
        this.physics.world.setBounds(-2000, -2000, 4000, 4000);
        
        // Cria background
        this.createBackground();
        
        // Cria animações
        this.createAnimations();
        
        // Cria elementos da simulação
        this.createShip();
        this.createEnemies();
        this.createMeteors();
        this.createPlanets();
        
        // Configura colisões
        this.setupCollisions();
        
        // Inicia loop da simulação
        this.startSimulation();
        
        console.log('🎮 Simulação de gameplay iniciada');
    }

    createBackground() {
        // Obtém dimensões da tela
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        
        // Fundo preto cobrindo toda a tela
        this.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000)
            .setOrigin(0.5).setDepth(-10);
        
        // Fundo estelar responsivo usando tileSprite para cobrir toda a tela
        const starsBg = this.add.tileSprite(0, 0, screenWidth * 2, screenHeight * 2, 'stars');
        starsBg.setOrigin(0.5).setDepth(-9).setAlpha(0.8);
        
        // Adiciona movimento de parallax sutil
        this.starsBg = starsBg;
        
        // Estrelas animadas responsivas
        const starCount = Math.floor((screenWidth * screenHeight) / 10000); // Baseado na área da tela
        for (let i = 0; i < starCount; i++) {
            const x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
            const y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
            const star = this.add.rectangle(x, y, 1, 1, 0xffffff);
            star.setDepth(-8);
            star.setAlpha(Phaser.Math.FloatBetween(0.3, 1));
        }
    }

    createAnimations() {
        // Animação da nave
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

        // Animação do inimigo
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

        // Animação do meteoro
        this.anims.create({
            key: 'meteoro_anim',
            frames: [
                { key: 'meteoro', frame: 'meteoro 0.aseprite' },
                { key: 'meteoro', frame: 'meteoro 1.aseprite' }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Animação de explosão
        const explosionFrames = this.textures.get('explosion').getFrameNames()
            .filter(n => n !== '__BASE')
            .sort((a, b) => {
                const ra = a.match(/(\d+)/g);
                const rb = b.match(/(\d+)/g);
                const na = ra ? parseInt(ra[ra.length-1], 10) : 0;
                const nb = rb ? parseInt(rb[rb.length-1], 10) : 0;
                return na - nb;
            })
            .map(fn => ({ key: 'explosion', frame: fn }));

        this.anims.create({
            key: 'explosion_anim',
            frames: explosionFrames,
            frameRate: 15,
            repeat: 0
        });

        // Animação do projétil
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

    createShip() {
        // Cria nave do jogador
        this.elements.ship = this.physics.add.sprite(0, 0, 'ship_idle');
        this.elements.ship.setScale(0.8);
        this.elements.ship.setDepth(2);
        this.elements.ship.play('ship_thrust');
        
        // Configura física
        this.elements.ship.body.setCircle(20);
        this.elements.ship.setMaxVelocity(200);
        
        // Sistema de vida para nave principal
        this.elements.ship.health = 50; // Nave principal mais resistente
        this.elements.ship.maxHealth = 50;
        
        // Câmera fixa - não segue a nave
        this.cameras.main.setZoom(0.6);
        this.cameras.main.centerOn(0, 0);
        
        // Inicializa grupo de projéteis
        this.projectilesGroup = this.physics.add.group();
        
        console.log('Nave criada em (0, 0)');
    }

    createEnemies() {
        // Cria 3 inimigos iniciais
        for (let i = 0; i < 3; i++) {
            this.spawnEnemy();
        }
        
        // Spawn contínuo de inimigos
        this.time.addEvent({
            delay: 8000,
            callback: () => {
                if (this.elements.enemies.length < 4) {
                    this.spawnEnemy();
                }
            },
            loop: true
        });
    }

    spawnEnemy() {
        // Obtém dimensões da tela
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        
        // Spawn fora da área visível da câmera
        const side = Phaser.Math.Between(0, 3); // 0=top, 1=right, 2=bottom, 3=left
        let x, y;
        
        switch(side) {
            case 0: // Top
                x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
                y = -screenHeight/2 - 50;
                break;
            case 1: // Right
                x = screenWidth/2 + 50;
                y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
                break;
            case 2: // Bottom
                x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
                y = screenHeight/2 + 50;
                break;
            case 3: // Left
                x = -screenWidth/2 - 50;
                y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
                break;
        }
        
        const enemy = this.physics.add.sprite(x, y, 'enemy');
        enemy.setScale(Phaser.Math.FloatBetween(0.4, 0.6));
        enemy.setDepth(1);
        enemy.play('enemy_thrust');
        
        // Configura física
        enemy.body.setCircle(15);
        enemy.setMaxVelocity(100);
        
        // Sistema de vida para inimigos
        enemy.health = 10; // Inimigos precisam de 10 tiros para morrer
        enemy.maxHealth = 10;
        
        // Movimento em direção ao centro da tela (velocidade reduzida em 90%)
        const centerX = Phaser.Math.Between(-100, 100);
        const centerY = Phaser.Math.Between(-100, 100);
        const angle = Phaser.Math.Angle.Between(x, y, centerX, centerY);
        const speed = Phaser.Math.Between(5, 10); // Reduzido de 50-100 para 5-10 (90% redução)
        
        enemy.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        
        // Inimigo aponta na direção do movimento (compensando orientação inicial)
        enemy.rotation = angle + Math.PI / 2;
        
        this.elements.enemies.push(enemy);
    }

    createMeteors() {
        // Cria 2 meteoros iniciais
        for (let i = 0; i < 2; i++) {
            this.spawnMeteor();
        }
        
        // Spawn contínuo de meteoros
        this.time.addEvent({
            delay: 6000,
            callback: () => {
                if (this.elements.meteors.length < 3) {
                    this.spawnMeteor();
                }
            },
            loop: true
        });
    }

    spawnMeteor() {
        // Obtém dimensões da tela
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        
        // Spawn fora da área visível da câmera
        const side = Phaser.Math.Between(0, 3); // 0=top, 1=right, 2=bottom, 3=left
        let x, y;
        
        switch(side) {
            case 0: // Top
                x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
                y = -screenHeight/2 - 50;
                break;
            case 1: // Right
                x = screenWidth/2 + 50;
                y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
                break;
            case 2: // Bottom
                x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
                y = screenHeight/2 + 50;
                break;
            case 3: // Left
                x = -screenWidth/2 - 50;
                y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
                break;
        }
        
        const meteor = this.physics.add.sprite(x, y, 'meteoro', 'meteoro 0.aseprite');
        meteor.setScale(Phaser.Math.FloatBetween(0.5, 0.8));
        meteor.setDepth(1);
        meteor.play('meteoro_anim');
        
        // Configura física com colisão maior
        meteor.body.setCircle(25); // Aumentado de 12 para 25
        meteor.setMaxVelocity(300);
        
        // Movimento em direção ao centro da tela (velocidade aleatória mantida)
        const centerX = Phaser.Math.Between(-150, 150);
        const centerY = Phaser.Math.Between(-150, 150);
        const angle = Phaser.Math.Angle.Between(x, y, centerX, centerY);
        const speed = Phaser.Math.Between(100, 200); // Velocidade aleatória mantida para meteoros
        
        meteor.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        
        // Meteoro sempre aponta para frente (sem rotação)
        meteor.rotation = 0;
        
        this.elements.meteors.push(meteor);
    }

    createPlanets() {
        // Evita duplicação - só cria se não existir
        if (this.elements.planets.length > 0) {
            console.log('Planetas já criados, pulando criação...');
            return;
        }
        
        // Obtém dimensões da tela
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        
        // Cria planetas de fundo
        const frameNames = this.textures.get('planets').getFrameNames()
            .filter(n => n !== '__BASE');
        
        // Define posições aleatórias nos cantos extremos da tela
        const cornerPositions = [
            // Canto superior esquerdo - área aleatória
            { 
                x: Phaser.Math.Between(-screenWidth/2 + 50, -screenWidth/2 + 200), 
                y: Phaser.Math.Between(-screenHeight/2 + 50, -screenHeight/2 + 200) 
            },
            // Canto superior direito - área aleatória
            { 
                x: Phaser.Math.Between(screenWidth/2 - 200, screenWidth/2 - 50), 
                y: Phaser.Math.Between(-screenHeight/2 + 50, -screenHeight/2 + 200) 
            },
            // Canto inferior esquerdo - área aleatória
            { 
                x: Phaser.Math.Between(-screenWidth/2 + 50, -screenWidth/2 + 200), 
                y: Phaser.Math.Between(screenHeight/2 - 200, screenHeight/2 - 50) 
            },
            // Canto inferior direito - área aleatória
            { 
                x: Phaser.Math.Between(screenWidth/2 - 200, screenWidth/2 - 50), 
                y: Phaser.Math.Between(screenHeight/2 - 200, screenHeight/2 - 50) 
            }
        ];
        
        // Cria apenas 4 planetas nos cantos principais
        for (let i = 0; i < Math.min(4, frameNames.length); i++) {
            const pos = cornerPositions[i];
            const frameName = frameNames[i % frameNames.length]; // Usa frame específico para evitar aleatoriedade
            
            const planet = this.add.image(pos.x, pos.y, 'planets', frameName);
            planet.setScale(Phaser.Math.FloatBetween(1.0, 1.5));
            planet.setDepth(-0.5);
            
            this.elements.planets.push(planet);
            console.log(`Planeta ${i} criado em (${pos.x}, ${pos.y}) com frame ${frameName}`);
        }
        
        // Armazena posições dos planetas para navegação da nave
        this.planetPositions = cornerPositions.slice(0, this.elements.planets.length);
        console.log(`Total de planetas criados: ${this.elements.planets.length}`);
    }

    setupCollisions() {
        // Colisões entre projéteis e inimigos
        this.physics.add.overlap(this.projectilesGroup, this.elements.enemies, (bullet, enemy) => {
            if (!bullet.active || !enemy.active) return;
            
            // Sistema de vida - inimigo recebe dano
            enemy.health -= 1;
            
            // Remove projétil
            bullet.destroy();
            
            // Verifica se inimigo morreu
            if (enemy.health <= 0) {
                this.createExplosion(enemy.x, enemy.y);
                this.playSound('explosion_sound', 0.1); // Volume baixo para profundidade
                
                // Remove inimigo
                const index = this.elements.enemies.indexOf(enemy);
                if (index > -1) {
                    this.elements.enemies.splice(index, 1);
                }
                enemy.destroy();
            } else {
                // Inimigo ainda vivo - efeito visual de dano
                enemy.setTint(0xff0000); // Vermelho temporário
                this.time.delayedCall(100, () => {
                    if (enemy.active) {
                        enemy.clearTint();
                    }
                });
            }
        });

        // Colisões entre projéteis e meteoros com detecção melhorada
        this.physics.add.overlap(this.projectilesGroup, this.elements.meteors, (bullet, meteor) => {
            if (!bullet.active || !meteor.active) return;
            
            // Verifica se o projétil realmente colidiu com o meteoro
            const distance = Phaser.Math.Distance.Between(bullet.x, bullet.y, meteor.x, meteor.y);
            if (distance > 35) return; // Se muito longe, não é colisão válida
            
            this.createExplosion(meteor.x, meteor.y);
            this.playSound('explosion_sound', 0.08); // Volume ainda mais baixo
            
            // Remove meteoro
            const index = this.elements.meteors.indexOf(meteor);
            if (index > -1) {
                this.elements.meteors.splice(index, 1);
            }
            meteor.destroy();
            
            // Remove projétil
            bullet.destroy();
        });

        // Colisões entre nave e inimigos
        this.physics.add.overlap(this.elements.ship, this.elements.enemies, (ship, enemy) => {
            if (!ship.active || !enemy.active) return;
            
            // Sistema de vida - nave recebe dano
            ship.health -= 5; // Colisão causa mais dano que tiro
            
            // Verifica se nave morreu
            if (ship.health <= 0) {
                this.createExplosion(ship.x, ship.y);
                this.playSound('explosion_sound', 0.15); // Volume um pouco maior para impacto
                
                // Remove inimigo
                const index = this.elements.enemies.indexOf(enemy);
                if (index > -1) {
                    this.elements.enemies.splice(index, 1);
                }
                enemy.destroy();
                
                // Respawn da nave após 2 segundos
                this.time.delayedCall(2000, () => {
                    ship.health = ship.maxHealth;
                    ship.clearTint();
                });
            } else {
                // Nave ainda viva - efeito visual de dano
                ship.setTint(0xff0000); // Vermelho temporário
                this.time.delayedCall(200, () => {
                    if (ship.active) {
                        ship.clearTint();
                    }
                });
            }
        });

        // Colisões entre nave e meteoros
        this.physics.add.overlap(this.elements.ship, this.elements.meteors, (ship, meteor) => {
            if (!ship.active || !meteor.active) return;
            
            // Sistema de vida - nave recebe dano
            ship.health -= 10; // Meteoro causa muito dano
            
            // Verifica se nave morreu
            if (ship.health <= 0) {
                this.createExplosion(ship.x, ship.y);
                this.playSound('explosion_sound', 0.12);
                
                // Remove meteoro
                const index = this.elements.meteors.indexOf(meteor);
                if (index > -1) {
                    this.elements.meteors.splice(index, 1);
                }
                meteor.destroy();
                
                // Respawn da nave após 2 segundos
                this.time.delayedCall(2000, () => {
                    ship.health = ship.maxHealth;
                    ship.clearTint();
                });
            } else {
                // Nave ainda viva - efeito visual de dano
                ship.setTint(0xff0000); // Vermelho temporário
                this.time.delayedCall(200, () => {
                    if (ship.active) {
                        ship.clearTint();
                    }
                });
            }
        });
    }

    playSound(soundKey, volume = 0.1) {
        try {
            const sound = this.sound.add(soundKey, { volume });
            sound.play();
        } catch (error) {
            console.log('Som não disponível:', soundKey);
        }
    }

    createExplosion(x, y) {
        const explosion = this.add.sprite(x, y, 'explosion', 'explosion 0.aseprite');
        explosion.setScale(0.8);
        explosion.setDepth(2);
        explosion.play('explosion_anim');
        
        this.elements.explosions.push(explosion);
        
        // Remove explosão após 1 segundo
        this.time.delayedCall(1000, () => {
            if (explosion.active) {
                const index = this.elements.explosions.indexOf(explosion);
                if (index > -1) {
                    this.elements.explosions.splice(index, 1);
                }
                explosion.destroy();
            }
        });
    }

    moveToNextPlanet() {
        if (!this.planetPositions || this.planetPositions.length === 0) return;
        
        // Escolhe um planeta aleatório diferente do atual
        let nextIndex;
        do {
            nextIndex = Phaser.Math.Between(0, this.planetPositions.length - 1);
        } while (nextIndex === this.currentPlanetIndex && this.planetPositions.length > 1);
        
        this.currentPlanetIndex = nextIndex;
        this.targetPlanet = this.planetPositions[nextIndex];
        
        console.log(`Nave navegando para planeta ${nextIndex} em (${this.targetPlanet.x}, ${this.targetPlanet.y})`);
    }


    startSimulation() {
        // Movimento da nave do jogador entre planetas
        this.currentPlanetIndex = 0;
        this.moveToNextPlanet();
        
        this.time.addEvent({
            delay: 16, // ~60fps para movimento mais suave
            callback: () => {
                if (this.elements.ship && this.targetPlanet) {
                    // Move a nave em direção ao planeta alvo
                    const ship = this.elements.ship;
                    const target = this.targetPlanet;
                    
                    // Calcula distância até o alvo
                    const distance = Phaser.Math.Distance.Between(ship.x, ship.y, target.x, target.y);
                    
                    // Se chegou próximo do planeta, escolhe o próximo
                    if (distance < 80) {
                        this.moveToNextPlanet();
                    } else {
                        // Move em direção ao planeta com velocidade reduzida (90% mais lenta)
                        const speed = 12; // Velocidade reduzida de 120 para 12 (90% redução)
                        const angle = Phaser.Math.Angle.Between(ship.x, ship.y, target.x, target.y);
                        
                        // Movimento mais direto e eficiente
                        const deltaTime = 0.016; // 60fps
                        ship.x += Math.cos(angle) * speed * deltaTime;
                        ship.y += Math.sin(angle) * speed * deltaTime;
                        
                        // Debug da navegação
                        if (Math.random() < 0.01) { // 1% de chance de log
                            console.log(`Nave: (${ship.x.toFixed(1)}, ${ship.y.toFixed(1)}) -> Planeta: (${target.x}, ${target.y}) | Distância: ${distance.toFixed(1)}`);
                        }
                    }
                }
            },
            loop: true
        });

        // Sistema de defesa automática
        this.time.addEvent({
            delay: 100,
            callback: () => {
                this.updateDefenseSystem();
            },
            loop: true
        });

        // Explosões ocasionais
        this.time.addEvent({
            delay: 4000,
            callback: () => {
                this.createRandomExplosion();
            },
            loop: true
        });

        // Spawn contínuo de inimigos
        this.time.addEvent({
            delay: 3000,
            callback: () => {
                if (this.elements.enemies.length < 3) {
                    this.spawnEnemy();
                }
            },
            loop: true
        });

        // Spawn contínuo de meteoros
        this.time.addEvent({
            delay: 4000,
            callback: () => {
                if (this.elements.meteors.length < 2) {
                    this.spawnMeteor();
                }
            },
            loop: true
        });

        // Atualização contínua agora é feita no método update()
    }

    fireBullet() {
        if (!this.elements.ship) return;
        
        const angle = this.elements.ship.rotation - Math.PI/2;
        const offsetX = Math.cos(angle) * 30;
        const offsetY = Math.sin(angle) * 30;
        
        const bullet = this.projectilesGroup.create(
            this.elements.ship.x + offsetX,
            this.elements.ship.y + offsetY,
            'minibullet',
            'minibullet 0.aseprite'
        );
        
        bullet.setScale(0.6);
        bullet.setDepth(1);
        bullet.play('minibullet_anim');
        bullet.rotation = angle;
        
        // Configura física (velocidade reduzida em 90%)
        bullet.body.setAllowGravity(false);
        bullet.body.setCircle(8); // Adiciona colisão circular para projéteis
        bullet.setMaxVelocity(200); // Velocidade dobrada
        bullet.setVelocity(
            Math.cos(angle) * 160, // Velocidade dobrada
            Math.sin(angle) * 160
        );
        
        this.elements.bullets.push(bullet);
        
        // Som do disparo com volume baixo
        this.playSound('bullet_sound', 0.05);
        
        // Remove projétil após 3 segundos
        this.time.delayedCall(3000, () => {
            if (bullet.active) {
                const index = this.elements.bullets.indexOf(bullet);
                if (index > -1) {
                    this.elements.bullets.splice(index, 1);
                }
                bullet.destroy();
            }
        });
    }

    createRandomExplosion() {
        const x = Phaser.Math.Between(-800, 800);
        const y = Phaser.Math.Between(-600, 600);
        
        const explosion = this.add.sprite(x, y, 'explosion');
        explosion.setDepth(100);
        explosion.play('explosion_anim');
        
        this.elements.explosions.push(explosion);
        
        explosion.once('animationcomplete', () => {
            const index = this.elements.explosions.indexOf(explosion);
            if (index > -1) {
                this.elements.explosions.splice(index, 1);
            }
            explosion.destroy();
        });
    }

    updateDefenseSystem() {
        if (!this.elements.ship) return;
        
        const ship = this.elements.ship;
        const detectionRange = 300; // Alcance de detecção
        const fireRate = 500; // Taxa de disparo em ms
        
        // Verifica se pode atirar (cooldown)
        if (this.lastFireTime && this.time.now - this.lastFireTime < fireRate) {
            return;
        }
        
        // Procura inimigos próximos
        let nearestEnemy = null;
        let nearestDistance = detectionRange;
        
        this.elements.enemies.forEach(enemy => {
            if (enemy.active) {
                const distance = Phaser.Math.Distance.Between(ship.x, ship.y, enemy.x, enemy.y);
                if (distance < nearestDistance) {
                    nearestEnemy = enemy;
                    nearestDistance = distance;
                }
            }
        });
        
        // Procura meteoros próximos
        let nearestMeteor = null;
        let nearestMeteorDistance = detectionRange;
        
        this.elements.meteors.forEach(meteor => {
            if (meteor.active) {
                const distance = Phaser.Math.Distance.Between(ship.x, ship.y, meteor.x, meteor.y);
                if (distance < nearestMeteorDistance) {
                    nearestMeteor = meteor;
                    nearestMeteorDistance = distance;
                }
            }
        });
        
        // Decide qual alvo atacar (prioriza o mais próximo)
        let target = null;
        if (nearestEnemy && nearestMeteor) {
            target = nearestDistance < nearestMeteorDistance ? nearestEnemy : nearestMeteor;
        } else if (nearestEnemy) {
            target = nearestEnemy;
        } else if (nearestMeteor) {
            target = nearestMeteor;
        }
        
        // Sempre rotaciona a nave para o alvo mais próximo (se houver)
        if (target) {
            const angle = Phaser.Math.Angle.Between(ship.x, ship.y, target.x, target.y);
            ship.rotation = angle + Math.PI / 2; // Compensação para orientação correta
            
            // Atira no alvo se encontrado
            this.fireAtTarget(target);
            this.lastFireTime = this.time.now;
        } else if (this.targetPlanet) {
            // Se não há alvo inimigo, rotaciona para o planeta de destino
            const angle = Phaser.Math.Angle.Between(ship.x, ship.y, this.targetPlanet.x, this.targetPlanet.y);
            ship.rotation = angle + Math.PI / 2; // Compensação para orientação correta
        } else {
            // Se não há alvo nem planeta, mantém a nave apontando para frente
            ship.rotation = 0;
        }
    }

    fireAtTarget(target) {
        if (!this.elements.ship) return;
        
        const ship = this.elements.ship;
        const angle = Phaser.Math.Angle.Between(ship.x, ship.y, target.x, target.y);
        const offsetX = Math.cos(angle) * 30;
        const offsetY = Math.sin(angle) * 30;
        
        const bullet = this.projectilesGroup.create(
            ship.x + offsetX,
            ship.y + offsetY,
            'minibullet',
            'minibullet 0.aseprite'
        );
        
        bullet.setScale(0.6);
        bullet.setDepth(1);
        bullet.play('minibullet_anim');
        bullet.rotation = angle;
        
        // Configura física (velocidade reduzida em 90%)
        bullet.body.setAllowGravity(false);
        bullet.body.setCircle(8); // Adiciona colisão circular para projéteis
        bullet.setMaxVelocity(200); // Velocidade dobrada
        bullet.setVelocity(
            Math.cos(angle) * 160, // Velocidade dobrada
            Math.sin(angle) * 160
        );
        
        this.elements.bullets.push(bullet);
        
        // Som do disparo com volume baixo
        this.playSound('bullet_sound', 0.05);
        
        // Remove projétil após 3 segundos
        this.time.delayedCall(3000, () => {
            if (bullet.active) {
                const index = this.elements.bullets.indexOf(bullet);
                if (index > -1) {
                    this.elements.bullets.splice(index, 1);
                }
                bullet.destroy();
            }
        });
    }

    updateSimulation() {
        // Atualiza movimento dos inimigos
        this.elements.enemies.forEach(enemy => {
            if (enemy.active) {
                // Mantém movimento baseado na velocidade inicial
                // Elementos não são removidos automaticamente
            }
        });

        // Atualiza movimento dos meteoros
        this.elements.meteors.forEach(meteor => {
            if (meteor.active) {
                meteor.rotation += 0.05;
                // Elementos não são removidos automaticamente
            }
        });

        // Atualiza movimento dos projéteis
        this.elements.bullets.forEach(bullet => {
            if (bullet.active) {
                // Projéteis não são removidos automaticamente
                // Só são destruídos por colisão ou timer
            }
        });

        // Atualiza rotação dos planetas
        this.elements.planets.forEach(planet => {
            planet.rotation += 0.001;
        });
    }

    // Método para pausar/retomar a simulação
    pauseSimulation() {
        this.physics.pause();
        this.scene.pause();
    }

    resumeSimulation() {
        this.physics.resume();
        this.scene.resume();
    }

    // Método para destruir a simulação
    destroySimulation() {
        // Limpa todos os elementos
        this.elements.enemies.forEach(enemy => enemy.destroy());
        this.elements.meteors.forEach(meteor => meteor.destroy());
        this.elements.bullets.forEach(bullet => bullet.destroy());
        this.elements.explosions.forEach(explosion => explosion.destroy());
        this.elements.planets.forEach(planet => planet.destroy());
        
        if (this.elements.ship) {
            this.elements.ship.destroy();
        }
        
        // Limpa arrays
        this.elements.enemies = [];
        this.elements.meteors = [];
        this.elements.bullets = [];
        this.elements.explosions = [];
        this.elements.planets = [];
        
        console.log('🎮 Simulação de gameplay destruída');
    }

    update() {
        // Anima o fundo de estrelas com movimento de parallax
        if (this.starsBg) {
            this.starsBg.tilePositionX += 0.1;
            this.starsBg.tilePositionY += 0.05;
        }
        
        // Atualiza elementos da simulação
        this.updateSimulation();
    }
}
