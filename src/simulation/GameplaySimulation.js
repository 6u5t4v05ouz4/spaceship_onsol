// Phaser is loaded globally from CDN
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
        this.load.setPath('');
        this.load.atlas('ship', '/assets/images/01.png', '/assets/images/01.json');
        this.load.image('ship_idle', '/assets/images/idle.png');
        this.load.atlas('enemy', '/assets/images/02.png', '/assets/images/02.json');
        this.load.atlas('meteoro', '/assets/images/meteoro.png', '/assets/images/meteoro.json');
        this.load.atlas('explosion', '/assets/images/explosion.png', '/assets/images/explosion.json');
        this.load.atlas('minibullet', '/assets/images/minibullet.png', '/assets/images/minibullet.json');
        this.load.atlas('planets', '/assets/background/planets.png', '/assets/background/planets.json');
        this.load.image('stars', '/assets/background/stars.jpeg');
        this.load.audio('bullet_sound', '/assets/sounds_effects/bullet.mp3');
        this.load.audio('explosion_sound', '/assets/sounds_effects/explosion.mp3');
    }

    create() {
        this.physics.world.setBounds(-2000, -2000, 4000, 4000);
        this.createBackground();
        this.createAnimations();
        this.createShip();
        this.createEnemies();
        this.createMeteors();
        this.createPlanets();
        this.setupCollisions();
        this.startSimulation();
        console.log('🎮 Simulação de gameplay iniciada');
    }

    createBackground() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        // Fundo azul escuro com brilho ao invés de preto sólido
        this.add.rectangle(0, 0, screenWidth, screenHeight, 0x001133)
            .setOrigin(0.5).setDepth(-10);

        // Fundo de estrelas muito mais brilhante
        const starsBg = this.add.tileSprite(0, 0, screenWidth * 2, screenHeight * 2, 'stars');
        starsBg.setOrigin(0.5).setDepth(-9).setAlpha(1.0).setTint(0xaaaaff); // Azul claro
        this.starsBg = starsBg;

        // Criar MUITAS estrelas brilhantes
        const starCount = Math.floor((screenWidth * screenHeight) / 4000); // Dobro de estrelas
        for (let i = 0; i < starCount; i++) {
            const x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
            const y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
            const size = Phaser.Math.Between(1, 4);
            const star = this.add.rectangle(x, y, size, size, 0xffffff);
            star.setDepth(-8);
            star.setAlpha(Phaser.Math.FloatBetween(0.8, 1)); // Brilho mínimo muito alto

            // Adicionar efeito de brilho pulsante para MAIS estrelas
            if (Math.random() < 0.6) { // 60% das estrelas têm efeito de brilho
                this.tweens.add({
                    targets: star,
                    alpha: { from: 0.8, to: 1 },
                    scale: { from: 1, to: 1.5 },
                    duration: Phaser.Math.Between(1000, 3000),
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        }

        // Adicionar estrelas grandes brilhantes esparsas
        const bigStarCount = Math.floor((screenWidth * screenHeight) / 50000);
        for (let i = 0; i < bigStarCount; i++) {
            const x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
            const y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
            const bigStar = this.add.rectangle(x, y, 6, 6, 0xaaccff);
            bigStar.setDepth(-8);
            bigStar.setAlpha(0.9);

            // Brilho intenso pulsante
            this.tweens.add({
                targets: bigStar,
                alpha: { from: 0.7, to: 1 },
                scale: { from: 1, to: 2 },
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Adicionar nebulosas luminosas
        this.createNebulas();
    }

    createNebulas() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        // Criar nebulosas BRILHANTES para dar mais vida ao fundo
        const nebulaColors = [0x6666aa, 0x66aa66, 0xaa8866, 0x6688aa]; // Cores mais claras e brilhantes

        for (let i = 0; i < 5; i++) { // Mais nebulosas
            const x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
            const y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
            const color = nebulaColors[i % nebulaColors.length];

            // Criar forma oval para nebulosa com mais brilho
            const nebula = this.add.graphics();
            nebula.setDepth(-7);
            nebula.fillStyle(color, 0.25); // Muito mais brilhante
            nebula.fillEllipse(x, y, Phaser.Math.Between(300, 600), Phaser.Math.Between(200, 400));
            nebula.fillStyle(color, 0.15); // Ainda brilhante
            nebula.fillEllipse(x + 50, y + 30, Phaser.Math.Between(200, 400), Phaser.Math.Between(150, 300));

            // Adicionar movimento lento com brilho pulsante
            this.tweens.add({
                targets: nebula,
                x: x + Phaser.Math.Between(-30, 30),
                y: y + Phaser.Math.Between(-30, 30),
                alpha: { from: 0.8, to: 1 },
                duration: Phaser.Math.Between(8000, 15000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createAnimations() {
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

        this.anims.create({
            key: 'meteoro_anim',
            frames: [
                { key: 'meteoro', frame: 'meteoro 0.aseprite' },
                { key: 'meteoro', frame: 'meteoro 1.aseprite' }
            ],
            frameRate: 8,
            repeat: -1
        });

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
        this.elements.ship = this.physics.add.sprite(0, 0, 'ship_idle');
        this.elements.ship.setScale(0.8);
        this.elements.ship.setDepth(2);
        this.elements.ship.play('ship_thrust');
        this.elements.ship.body.setCircle(20);
        this.elements.ship.setMaxVelocity(200);
        this.elements.ship.health = 50;
        this.elements.ship.maxHealth = 50;
        this.cameras.main.setZoom(1.0); // Zoom completo para background da página web
        this.cameras.main.centerOn(0, 0);
        this.projectilesGroup = this.physics.add.group();
        console.log('Nave criada em (0, 0)');
    }

    createEnemies() {
        for (let i = 0; i < 3; i++) {
            this.spawnEnemy();
        }
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
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        const side = Phaser.Math.Between(0, 3);
        let x, y;
        switch(side) {
            case 0:
                x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
                y = -screenHeight/2 - 50;
                break;
            case 1:
                x = screenWidth/2 + 50;
                y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
                break;
            case 2:
                x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
                y = screenHeight/2 + 50;
                break;
            case 3:
                x = -screenWidth/2 - 50;
                y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
                break;
        }
        
        const enemy = this.physics.add.sprite(x, y, 'enemy');
        enemy.setScale(Phaser.Math.FloatBetween(0.4, 0.6));
        enemy.setDepth(1);
        enemy.play('enemy_thrust');
        enemy.body.setCircle(40); // Aumentado para 40 para colisão mais confiável
        enemy.setMaxVelocity(100);
        enemy.body.setImmovable(true); // Inimigos não se movem por física
        enemy.health = 10; // 10 tiros para destruir
        enemy.maxHealth = 10;
        
        // Direção aleatória em vez de sempre ir para o centro
        const randomAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const speed = Phaser.Math.Between(5, 10);
        enemy.setVelocity(
            Math.cos(randomAngle) * speed,
            Math.sin(randomAngle) * speed
        );
        enemy.rotation = randomAngle + Math.PI / 2;
        this.elements.enemies.push(enemy);

        // Debug: Desenhar colisor (remover após testes)
        // const graphics = this.add.graphics();
        // graphics.lineStyle(2, 0x00ff00);
        // graphics.strokeCircle(enemy.x, enemy.y, 40);
        // enemy.debugGraphics = graphics;
    }

    createMeteors() {
        for (let i = 0; i < 2; i++) {
            this.spawnMeteor();
        }
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
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        const side = Phaser.Math.Between(0, 3);
        let x, y;
        switch(side) {
            case 0:
                x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
                y = -screenHeight/2 - 50;
                break;
            case 1:
                x = screenWidth/2 + 50;
                y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
                break;
            case 2:
                x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
                y = screenHeight/2 + 50;
                break;
            case 3:
                x = -screenWidth/2 - 50;
                y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
                break;
        }
        
        const meteor = this.physics.add.sprite(x, y, 'meteoro', 'meteoro 0.aseprite');
        meteor.setScale(Phaser.Math.FloatBetween(0.5, 0.8));
        meteor.setDepth(1);
        meteor.play('meteoro_anim');
        meteor.body.setCircle(25);
        meteor.setMaxVelocity(300);
        const centerX = Phaser.Math.Between(-150, 150);
        const centerY = Phaser.Math.Between(-150, 150);
        const angle = Phaser.Math.Angle.Between(x, y, centerX, centerY);
        const speed = Phaser.Math.Between(100, 200);
        meteor.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        // Define a rotação baseada na direção do movimento
        // Adiciona Math.PI/2 para corrigir a orientação do sprite
        meteor.rotation = angle + Math.PI/2;
        this.elements.meteors.push(meteor);
    }

    createPlanets() {
        if (this.elements.planets.length > 0) {
            console.log('Planetas já criados, pulando criação...');
            return;
        }
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        const frameNames = this.textures.get('planets').getFrameNames()
            .filter(n => n !== '__BASE');
        
        // Sistema de posicionamento aleatório priorizando laterais com detecção de colisão
        const planetPositions = [];
        const minDistanceFromCenter = 150; // Distância mínima do centro
        const minDistanceBetweenPlanets = 200; // Distância mínima entre planetas
        const edgePreference = 0.7; // 70% de chance de aparecer nas laterais
        
        // Função para verificar se uma posição é válida
        const isValidPosition = (newX, newY) => {
            // Verifica distância do centro
            if (Phaser.Math.Distance.Between(0, 0, newX, newY) < minDistanceFromCenter) {
                return false;
            }
            
            // Verifica distância de outros planetas já posicionados
            for (const existingPos of planetPositions) {
                const distance = Phaser.Math.Distance.Between(newX, newY, existingPos.x, existingPos.y);
                if (distance < minDistanceBetweenPlanets) {
                    return false;
                }
            }
            
            return true;
        };
        
        for (let i = 0; i < Math.min(4, frameNames.length); i++) {
            let x, y;
            let attempts = 0;
            const maxAttempts = 100; // Aumentado para dar mais chances
            
            do {
                // Decide se vai para as laterais ou área central
                const useEdgeArea = Math.random() < edgePreference;
                
                if (useEdgeArea) {
                    // Prioriza laterais da tela
                    const side = Phaser.Math.Between(0, 3);
                    switch(side) {
                        case 0: // Lado esquerdo
                            x = Phaser.Math.Between(-screenWidth/2 - 100, -screenWidth/2 + 50);
                            y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
                            break;
                        case 1: // Lado direito
                            x = Phaser.Math.Between(screenWidth/2 - 50, screenWidth/2 + 100);
                            y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
                            break;
                        case 2: // Lado superior
                            x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
                            y = Phaser.Math.Between(-screenHeight/2 - 100, -screenHeight/2 + 50);
                            break;
                        case 3: // Lado inferior
                            x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
                            y = Phaser.Math.Between(screenHeight/2 - 50, screenHeight/2 + 100);
                            break;
                    }
                } else {
                    // Área central com mais espaço
                    x = Phaser.Math.Between(-screenWidth/2 + 100, screenWidth/2 - 100);
                    y = Phaser.Math.Between(-screenHeight/2 + 100, screenHeight/2 - 100);
                }
                
                attempts++;
            } while (
                attempts < maxAttempts && 
                !isValidPosition(x, y)
            );
            
            // Se não conseguiu posição válida após muitas tentativas, usa posição padrão nas laterais
            if (attempts >= maxAttempts) {
                console.log(`Planeta ${i}: Tentativas esgotadas, usando posição padrão`);
                const side = Phaser.Math.Between(0, 3);
                switch(side) {
                    case 0:
                        x = -screenWidth/2 + 50;
                        y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
                        break;
                    case 1:
                        x = screenWidth/2 - 50;
                        y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
                        break;
                    case 2:
                        x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
                        y = -screenHeight/2 + 50;
                        break;
                    case 3:
                        x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
                        y = screenHeight/2 - 50;
                        break;
                }
            }
            
            planetPositions.push({ x, y });
            console.log(`Planeta ${i} posicionado em (${x.toFixed(1)}, ${y.toFixed(1)}) após ${attempts} tentativas`);
        }
        
        for (let i = 0; i < planetPositions.length; i++) {
            const pos = planetPositions[i];
            const frameName = frameNames[i % frameNames.length];
            const planet = this.add.image(pos.x, pos.y, 'planets', frameName);
            planet.setScale(Phaser.Math.FloatBetween(1.0, 1.5));
            planet.setDepth(-0.5);
            this.elements.planets.push(planet);
            console.log(`Planeta ${i} criado em (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}) com frame ${frameName}`);
        }
        
        this.planetPositions = planetPositions;
        console.log(`Total de planetas criados: ${this.elements.planets.length}`);
    }

    setupCollisions() {
        // Colisões entre projéteis e inimigos usando overlap
        this.physics.add.overlap(this.projectilesGroup, this.elements.enemies, (bullet, enemy) => {
            if (!bullet.active || !enemy.active) return;
            
            // Reduz a vida do inimigo (1 dano por projétil)
            enemy.health -= 1;
            
            // Remove projétil imediatamente
            bullet.destroy();
            const bulletIndex = this.elements.bullets.indexOf(bullet);
            if (bulletIndex > -1) {
                this.elements.bullets.splice(bulletIndex, 1);
            }
            
            // Verifica se inimigo morreu (10 tiros)
            if (enemy.health <= 0) {
                // Cria explosão usando método existente
                this.createExplosion(enemy.x, enemy.y);
                this.playSound('explosion_sound', 0.1);
                
                // Remove inimigo
                const index = this.elements.enemies.indexOf(enemy);
                if (index > -1) {
                    this.elements.enemies.splice(index, 1);
                }
                enemy.destroy();
            } else {
                // Inimigo ainda vivo - efeito visual de dano
                enemy.setTint(0xff0000);
                this.time.delayedCall(100, () => {
                    if (enemy.active) {
                        enemy.clearTint();
                    }
                });
                
                // Som de impacto
                this.playSound('bullet_sound', 0.05);
            }
        });

        // Colisões entre projéteis e meteoros usando overlap
        this.physics.add.overlap(this.projectilesGroup, this.elements.meteors, (bullet, meteor) => {
            if (!bullet.active || !meteor.active) return;
            
            // Remove projétil imediatamente
            bullet.destroy();
            const bulletIndex = this.elements.bullets.indexOf(bullet);
            if (bulletIndex > -1) {
                this.elements.bullets.splice(bulletIndex, 1);
            }
            
            // Cria explosão na posição do meteoro
            this.createExplosion(meteor.x, meteor.y);
            
            this.playSound('explosion_sound', 0.08);
            
            // Remove meteoro
            const index = this.elements.meteors.indexOf(meteor);
            if (index > -1) {
                this.elements.meteors.splice(index, 1);
            }
            meteor.destroy();
        });

        // Colisões entre nave e inimigos
        this.physics.add.overlap(this.elements.ship, this.elements.enemies, (ship, enemy) => {
            if (!ship.active || !enemy.active) return;
            ship.health -= 5;
            if (ship.health <= 0) {
                this.createExplosion(ship.x, ship.y);
                this.playSound('explosion_sound', 0.15);
                const index = this.elements.enemies.indexOf(enemy);
                if (index > -1) {
                    this.elements.enemies.splice(index, 1);
                }
                enemy.destroy();
                this.time.delayedCall(2000, () => {
                    ship.setPosition(0, 0);
                    ship.health = ship.maxHealth;
                    ship.clearTint();
                });
            } else {
                ship.setTint(0xff0000);
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
            ship.health -= 10;
            if (ship.health <= 0) {
                this.createExplosion(ship.x, ship.y);
                this.playSound('explosion_sound', 0.12);
                const index = this.elements.meteors.indexOf(meteor);
                if (index > -1) {
                    this.elements.meteors.splice(index, 1);
                }
                meteor.destroy();
                this.time.delayedCall(2000, () => {
                    ship.setPosition(0, 0);
                    ship.health = ship.maxHealth;
                    ship.clearTint();
                });
            } else {
                ship.setTint(0xff0000);
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
        explosion.setScale(1.2);
        explosion.setDepth(3);
        explosion.play('explosion_anim');
        this.elements.explosions.push(explosion);
        
        // Remove explosão após animação completar
        explosion.once('animationcomplete', () => {
            const index = this.elements.explosions.indexOf(explosion);
            if (index > -1) {
                this.elements.explosions.splice(index, 1);
            }
            explosion.destroy();
        });
    }

    moveToNextPlanet() {
        if (!this.planetPositions || this.planetPositions.length === 0) return;
        let nextIndex;
        do {
            nextIndex = Phaser.Math.Between(0, this.planetPositions.length - 1);
        } while (nextIndex === this.currentPlanetIndex && this.planetPositions.length > 1);
        this.currentPlanetIndex = nextIndex;
        this.targetPlanet = this.planetPositions[nextIndex];
        console.log(`Nave navegando para planeta ${nextIndex} em (${this.targetPlanet.x}, ${this.targetPlanet.y})`);
    }

    startSimulation() {
        this.currentPlanetIndex = 0;
        this.moveToNextPlanet();
        this.time.addEvent({
            delay: 16,
            callback: () => {
                if (this.elements.ship && this.targetPlanet) {
                    const ship = this.elements.ship;
                    const target = this.targetPlanet;
                    const distance = Phaser.Math.Distance.Between(ship.x, ship.y, target.x, target.y);
                    if (distance < 80) {
                        this.moveToNextPlanet();
                    } else {
                        const speed = 12;
                        const angle = Phaser.Math.Angle.Between(ship.x, ship.y, target.x, target.y);
                        const deltaTime = 0.016;
                        ship.x += Math.cos(angle) * speed * deltaTime;
                        ship.y += Math.sin(angle) * speed * deltaTime;
                        if (Math.random() < 0.01) {
                            console.log(`Nave: (${ship.x.toFixed(1)}, ${ship.y.toFixed(1)}) -> Planeta: (${target.x}, ${target.y}) | Distância: ${distance.toFixed(1)}`);
                        }
                    }
                }
            },
            loop: true
        });

        this.time.addEvent({
            delay: 100,
            callback: () => {
                this.updateDefenseSystem();
            },
            loop: true
        });

        this.time.addEvent({
            delay: 4000,
            callback: () => {
                this.createRandomExplosion();
            },
            loop: true
        });

        this.time.addEvent({
            delay: 3000,
            callback: () => {
                if (this.elements.enemies.length < 3) {
                    this.spawnEnemy();
                }
            },
            loop: true
        });

        this.time.addEvent({
            delay: 4000,
            callback: () => {
                if (this.elements.meteors.length < 2) {
                    this.spawnMeteor();
                }
            },
            loop: true
        });
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
        bullet.body.setAllowGravity(false);
        bullet.body.setCircle(20); // Aumentado para 20 para melhor detecção
        bullet.setMaxVelocity(300); // Velocidade aumentada
        bullet.setVelocity(
            Math.cos(angle) * 240,
            Math.sin(angle) * 240
        );
        this.elements.bullets.push(bullet);
        this.playSound('bullet_sound', 0.05);
        this.time.delayedCall(3000, () => {
            if (bullet.active) {
                // Cria explosão pequena na posição do projétil
                this.createExplosion(bullet.x, bullet.y);
                this.playSound('explosion_sound', 0.03);
                
                const index = this.elements.bullets.indexOf(bullet);
                if (index > -1) {
                    this.elements.bullets.splice(index, 1);
                }
                bullet.destroy();
            }
        });

        // Debug: Desenhar colisor do projétil (remover após testes)
        // const graphics = this.add.graphics();
        // graphics.lineStyle(2, 0xff0000);
        // graphics.strokeCircle(bullet.x, bullet.y, 20);
        // bullet.debugGraphics = graphics;
    }

    createRandomExplosion() {
        const x = Phaser.Math.Between(-800, 800);
        const y = Phaser.Math.Between(-600, 600);
        this.createExplosion(x, y);
    }

    updateDefenseSystem() {
        if (!this.elements.ship) return;
        const ship = this.elements.ship;
        const detectionRange = 300;
        const fireRate = 500;
        if (this.lastFireTime && this.time.now - this.lastFireTime < fireRate) {
            return;
        }
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
        let target = null;
        if (nearestEnemy && nearestMeteor) {
            target = nearestDistance < nearestMeteorDistance ? nearestEnemy : nearestMeteor;
        } else if (nearestEnemy) {
            target = nearestEnemy;
        } else if (nearestMeteor) {
            target = nearestMeteor;
        }
        if (target) {
            const angle = Phaser.Math.Angle.Between(ship.x, ship.y, target.x, target.y);
            ship.rotation = angle + Math.PI / 2;
            this.fireAtTarget(target);
            this.lastFireTime = this.time.now;
        } else if (this.targetPlanet) {
            const angle = Phaser.Math.Angle.Between(ship.x, ship.y, this.targetPlanet.x, this.targetPlanet.y);
            ship.rotation = angle + Math.PI / 2;
        } else {
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
        bullet.body.setAllowGravity(false);
        bullet.body.setCircle(20); // Aumentado para 20 para melhor detecção
        bullet.setMaxVelocity(300); // Velocidade aumentada
        bullet.setVelocity(
            Math.cos(angle) * 240,
            Math.sin(angle) * 240
        );
        this.elements.bullets.push(bullet);
        this.playSound('bullet_sound', 0.05);
        this.time.delayedCall(3000, () => {
            if (bullet.active) {
                const index = this.elements.bullets.indexOf(bullet);
                if (index > -1) {
                    this.elements.bullets.splice(index, 1);
                }
                bullet.destroy();
            }
        });

        // Debug: Desenhar colisor do projétil (remover após testes)
        // const graphics = this.add.graphics();
        // graphics.lineStyle(2, 0xff0000);
        // graphics.strokeCircle(bullet.x, bullet.y, 20);
        // bullet.debugGraphics = graphics;
    }

    updateSimulation() {
        // Remove inimigos que saíram dos limites da tela
        for (let i = this.elements.enemies.length - 1; i >= 0; i--) {
            const enemy = this.elements.enemies[i];
            if (enemy.active) {
                const screenWidth = this.scale.width;
                const screenHeight = this.scale.height;
                const margin = 100; // Margem para remoção
                
                // Verifica se saiu dos limites visíveis
                if (enemy.x < -screenWidth/2 - margin || 
                    enemy.x > screenWidth/2 + margin ||
                    enemy.y < -screenHeight/2 - margin || 
                    enemy.y > screenHeight/2 + margin) {
                    
                    // Remove inimigo que saiu da tela
                    this.elements.enemies.splice(i, 1);
                    enemy.destroy();
                }
            }
        }
        // Remove meteoros que saíram dos limites da tela
        for (let i = this.elements.meteors.length - 1; i >= 0; i--) {
            const meteor = this.elements.meteors[i];
            if (meteor.active) {
                const screenWidth = this.scale.width;
                const screenHeight = this.scale.height;
                const margin = 100; // Margem para remoção
                
                // Verifica se saiu dos limites visíveis
                if (meteor.x < -screenWidth/2 - margin || 
                    meteor.x > screenWidth/2 + margin ||
                    meteor.y < -screenHeight/2 - margin || 
                    meteor.y > screenHeight/2 + margin) {
                    
                    // Remove meteoro que saiu da tela
                    this.elements.meteors.splice(i, 1);
                    meteor.destroy();
                } else {
                    // Atualiza a rotação baseada na direção do movimento
                    const velocity = meteor.body.velocity;
                    if (velocity.x !== 0 || velocity.y !== 0) {
                        const movementAngle = Math.atan2(velocity.y, velocity.x);
                        // Adiciona Math.PI/2 para corrigir a orientação do sprite
                        meteor.rotation = movementAngle + Math.PI/2;
                    }
                }
            }
        }
        this.elements.bullets.forEach(bullet => {
            if (bullet.active) {
                // if (bullet.debugGraphics) {
                //     bullet.debugGraphics.clear();
                //     bullet.debugGraphics.lineStyle(2, 0xff0000);
                //     bullet.debugGraphics.strokeCircle(bullet.x, bullet.y, 20);
                // }
            }
        });
        this.elements.planets.forEach(planet => {
            planet.rotation += 0.001;
        });
    }

    pauseSimulation() {
        this.physics.pause();
        this.scene.pause();
    }

    resumeSimulation() {
        this.physics.resume();
        this.scene.resume();
    }

    destroySimulation() {
        this.elements.enemies.forEach(enemy => {
            enemy.destroy();
            // if (enemy.debugGraphics) enemy.debugGraphics.destroy();
        });
        this.elements.meteors.forEach(meteor => meteor.destroy());
        this.elements.bullets.forEach(bullet => {
            bullet.destroy();
            // if (bullet.debugGraphics) bullet.debugGraphics.destroy();
        });
        this.elements.explosions.forEach(explosion => explosion.destroy());
        this.elements.planets.forEach(planet => planet.destroy());
        if (this.elements.ship) {
            this.elements.ship.destroy();
        }
        this.elements.enemies = [];
        this.elements.meteors = [];
        this.elements.bullets = [];
        this.elements.explosions = [];
        this.elements.planets = [];
        console.log('🎮 Simulação de gameplay destruída');
    }

    update() {
        if (this.starsBg) {
            // Movimento mais dinâmico das estrelas para sensação de velocidade no espaço
            this.starsBg.tilePositionX += 0.3;
            this.starsBg.tilePositionY += 0.1;
        }
        this.updateSimulation();
    }
}