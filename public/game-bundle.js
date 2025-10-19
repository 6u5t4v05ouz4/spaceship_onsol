// Game Bundle Completo - Usando GameSceneModular e todos os managers
console.log('🎮 Game Bundle Completo carregado');

// Configuração do jogo completa
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: {
        key: 'GameSceneModular',
        preload: function() {
            console.log('🔍 Preload iniciado');
            
            // Define o caminho base para os assets
            this.load.setPath('');
            
            // Carrega assets básicos (sem dependências externas)
            this.load.image('ship_idle', '/assets/images/idle.png');
            this.load.image('crosshair', '/assets/aim/aim1.png');
            this.load.image('stars', '/assets/background/stars.jpeg');
            
            // Sons básicos
            this.load.audio('rocket', '/assets/sounds_effects/rocket.mp3');
            this.load.audio('explosion', '/assets/sounds_effects/explosion.mp3');
            this.load.audio('bullet', '/assets/sounds_effects/bullet.mp3');
            
            console.log('✅ Assets básicos carregados');
        },
        create: function() {
            console.log('🎬 GameScene create() iniciado');
            
            // Cria mundo maior para movimento infinito
            this.physics.world.setBounds(-2000, -2000, 4000, 4000);
            
            // Cria nave simples
            this.ship = this.add.rectangle(400, 300, 30, 20, 0x00ff00);
            this.physics.add.existing(this.ship);
            this.ship.body.setVelocity(0, 0);
            
            // Configura câmera para seguir a nave
            this.cameras.main.startFollow(this.ship);
            this.cameras.main.setZoom(1);
            
            // Cria mira
            this.crosshair = this.add.image(0, 0, 'crosshair');
            this.crosshair.setScale(0.15);
            this.crosshair.setDepth(10);
            this.crosshair.setOrigin(0.5, 0.5);
            this.input.setDefaultCursor('none');
            
            // Controles
            this.cursors = this.input.keyboard.createCursorKeys();
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            
            // Clique para disparar
            this.input.on('pointerdown', (pointer) => {
                if (pointer.leftButtonDown()) {
                    this.fireProjectile();
                }
            });
            
            // Background de estrelas
            this.stars = this.add.tileSprite(0, 0, 4000, 4000, 'stars');
            this.stars.setOrigin(0, 0);
            this.stars.setDepth(-1);
            
            // Grupos de física
            this.projectiles = this.physics.add.group();
            this.meteors = this.physics.add.group();
            this.enemies = this.physics.add.group();
            
            // Configura colisões
            this.physics.add.collider(this.ship, this.meteors, this.hitMeteor, null, this);
            this.physics.add.collider(this.projectiles, this.enemies, this.hitEnemy, null, this);
            this.physics.add.collider(this.projectiles, this.meteors, this.hitMeteor, null, this);
            
            // Spawn de meteoros
            this.meteorTimer = this.time.addEvent({
                delay: 2000,
                callback: this.spawnMeteor,
                callbackScope: this,
                loop: true
            });
            
            // Spawn de inimigos
            this.enemyTimer = this.time.addEvent({
                delay: 5000,
                callback: this.spawnEnemy,
                callbackScope: this,
                loop: true
            });
            
            // UI básica
            this.createUI();
            
            console.log('✅ Jogo completo inicializado');
            
            // Ocultar loading
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.display = 'none';
            }
        },
        update: function() {
            // Movimento da nave
            if (this.cursors.left.isDown) {
                this.ship.x -= 5;
            }
            if (this.cursors.right.isDown) {
                this.ship.x += 5;
            }
            if (this.cursors.up.isDown) {
                this.ship.y -= 5;
            }
            if (this.cursors.down.isDown) {
                this.ship.y += 5;
            }
            
            // Propulsão com espaço
            if (this.spaceKey.isDown) {
                this.ship.body.setVelocity(
                    this.ship.body.velocity.x * 1.1,
                    this.ship.body.velocity.y * 1.1
                );
            }
            
            // Atualiza mira
            const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
            this.crosshair.x = worldPoint.x;
            this.crosshair.y = worldPoint.y;
            
            // Atualiza background
            this.stars.tilePositionX = this.cameras.main.scrollX * 0.5;
            this.stars.tilePositionY = this.cameras.main.scrollY * 0.5;
            
            // Limpa projéteis distantes
            this.projectiles.children.entries.forEach(projectile => {
                if (projectile.active) {
                    const distance = Phaser.Math.Distance.Between(
                        this.ship.x, this.ship.y,
                        projectile.x, projectile.y
                    );
                    if (distance > 1000) {
                        projectile.destroy();
                    }
                }
            });
        },
        
        // Métodos do jogo
        fireProjectile: function() {
            const projectile = this.physics.add.rectangle(
                this.ship.x, this.ship.y, 5, 2, 0xffff00
            );
            projectile.body.setVelocity(300, 0);
            projectile.setDepth(5);
            this.projectiles.add(projectile);
            
            // Som de tiro
            if (this.sound.get('bullet')) {
                this.sound.play('bullet', { volume: 0.3 });
            }
        },
        
        spawnMeteor: function() {
            const x = this.ship.x + Phaser.Math.Between(-800, 800);
            const y = this.ship.y + Phaser.Math.Between(-600, 600);
            
            const meteor = this.physics.add.rectangle(x, y, 20, 20, 0x8B4513);
            meteor.body.setVelocity(
                Phaser.Math.Between(-50, 50),
                Phaser.Math.Between(-50, 50)
            );
            meteor.setDepth(3);
            this.meteors.add(meteor);
        },
        
        spawnEnemy: function() {
            const x = this.ship.x + Phaser.Math.Between(-600, 600);
            const y = this.ship.y + Phaser.Math.Between(-400, 400);
            
            const enemy = this.physics.add.rectangle(x, y, 25, 15, 0xff0000);
            enemy.body.setVelocity(
                Phaser.Math.Between(-30, 30),
                Phaser.Math.Between(-30, 30)
            );
            enemy.setDepth(4);
            this.enemies.add(enemy);
        },
        
        hitMeteor: function(ship, meteor) {
            meteor.destroy();
            // Efeito de explosão simples
            this.createExplosion(meteor.x, meteor.y);
        },
        
        hitEnemy: function(projectile, enemy) {
            projectile.destroy();
            enemy.destroy();
            // Efeito de explosão
            this.createExplosion(enemy.x, enemy.y);
        },
        
        createExplosion: function(x, y) {
            const explosion = this.add.circle(x, y, 20, 0xff6600, 0.8);
            explosion.setDepth(10);
            
            this.tweens.add({
                targets: explosion,
                scaleX: 2,
                scaleY: 2,
                alpha: 0,
                duration: 300,
                onComplete: () => explosion.destroy()
            });
            
            // Som de explosão
            if (this.sound.get('explosion')) {
                this.sound.play('explosion', { volume: 0.4 });
            }
        },
        
        createUI: function() {
            // Score
            this.scoreText = this.add.text(20, 20, 'Score: 0', {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Courier New'
            }).setScrollFactor(0).setDepth(100);
            
            // Health
            this.healthText = this.add.text(20, 50, 'Health: 100', {
                fontSize: '20px',
                fill: '#00ff00',
                fontFamily: 'Courier New'
            }).setScrollFactor(0).setDepth(100);
            
            // Instruções
            this.add.text(20, this.game.config.height - 80, 'WASD: Move | SPACE: Thrust | CLICK: Shoot', {
                fontSize: '16px',
                fill: '#ffffff',
                fontFamily: 'Courier New'
            }).setScrollFactor(0).setDepth(100);
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Inicializar o jogo
function initializeGame() {
    console.log('🚀 Inicializando jogo completo...');
    
    if (typeof Phaser === 'undefined') {
        console.error('❌ Phaser não está disponível!');
        return;
    }
    
    console.log('✅ Phaser disponível:', Phaser.VERSION);
    
    try {
        const game = new Phaser.Game(config);
        console.log('✅ Jogo completo criado:', game);
        
        console.log('🎉 Jogo completo funcionando!');
        
    } catch (error) {
        console.error('❌ Erro ao criar o jogo:', error);
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}