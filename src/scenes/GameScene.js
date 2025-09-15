import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.isThrusting = false; // Estado do motor da nave
        this.cryptoBalance = 0; // Saldo de criptomoedas
        this.miningRate = 0; // Taxa de mineração atual
        this.miningPlanets = []; // Planetas que podem ser minerados
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
        
        // Carrega as imagens de background para o efeito parallax
        this.load.image('stars', '/assets/background/stars.png');
        this.load.image('planets', '/assets/images/planets.png');
        
        // Carrega os assets do projétil
        this.load.atlas('rocket', '/assets/images/rocket.png', '/assets/images/rocket.json');
        
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

        // Adiciona a nave na tela e inicia a animação de idle
        this.ship = this.physics.add.sprite(0, 0, 'ship_idle');
        this.ship.play('ship_idle');
        
        // Adiciona o nome do jogador atrás da nave
        this.playerNameText = this.add.text(0, 30, this.playerName, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: { x: 8, y: 4 },
            borderRadius: 10
        }).setOrigin(0.5);
        this.playerNameText.setScrollFactor(1); // Faz o texto seguir a câmera
        
        // Configura a nave
        this.ship.setDrag(0.95); // Adiciona resistência para parar gradualmente
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
        
        // Cria um grupo para os projéteis
        this.projectiles = this.physics.add.group();
        
        // Configura o clique esquerdo do mouse para disparar
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.fireProjectile();
            }
        });
    }

    createBackground() {
        // Configuração do efeito parallax
        const worldWidth = 4000;  // Largura do mundo
        const worldHeight = 4000; // Altura do mundo
        
        // Camada de fundo (estrelas) - move-se mais devagar
        this.stars = this.add.tileSprite(0, 0, worldWidth, worldHeight, 'stars');
        this.stars.setOrigin(0.5);
        this.stars.setScale(2); // Ajusta o tamanho para preencher a tela
        this.stars.setDepth(-10); // Camada mais ao fundo
        
        // Camada de planetas - move-se um pouco mais rápido que as estrelas
        this.planets = this.add.tileSprite(0, 0, worldWidth, worldHeight, 'planets');
        this.planets.setOrigin(0.5);
        this.planets.setScale(1.5); // Ajusta o tamanho
        this.planets.setDepth(-5); // Camada na frente das estrelas
        
        // Configura o tile para repetir
        this.stars.setTileScale(0.5);
        this.planets.setTileScale(0.5);
    }

    createMiningPlanets() {
        // Cria planetas especiais que podem ser minerados
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(-1500, 1500);
            const y = Phaser.Math.Between(-1500, 1500);
            
            // Escolhe aleatoriamente um dos planetas mineráveis
            const planetType = Phaser.Math.Between(1, 2);
            const planetKey = `planets0${planetType}`;
            
            const planet = this.add.image(x, y, planetKey);
            planet.setScale(Phaser.Math.FloatBetween(0.8, 1.5));
            planet.setDepth(-0.5); // Fica atrás da nave mas à frente do background
            
            // Adiciona propriedades especiais para mineração
            planet.isMiningPlanet = true;
            planet.miningRate = Phaser.Math.FloatBetween(0.1, 0.5);
            
            this.miningPlanets.push(planet);
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
        
        // Cria o projétil sem física inicialmente
        const projectile = this.add.sprite(
            this.ship.x + offsetX,
            this.ship.y + offsetY,
            'rocket',
            'Sprite-0002-Recovered 0.'
        );
        
        // Configura o projétil
        projectile.setScale(0.5);
        projectile.setDepth(1);
        
        // Define a rotação do projétil para a mesma da nave
        projectile.rotation = this.ship.rotation;
        
        // Calcula a direção do movimento
        const angle = this.ship.rotation - Math.PI/2;
        const speed = 10; // Velocidade mais lenta para melhor controle
        
        // Adiciona propriedades de movimento
        projectile.speedX = Math.cos(angle) * speed;
        projectile.speedY = Math.sin(angle) * speed;
        
        // Adiciona o projétil ao grupo
        this.projectiles.add(projectile);
        
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
            if (this.stars && this.planets) {
                const camera = this.cameras.main;
                const scrollX = camera.scrollX;
                const scrollY = camera.scrollY;
                
                // Move as camadas em velocidades diferentes para criar o efeito parallax
                this.stars.tilePositionX = scrollX * 0.3;  // Move mais devagar
                this.stars.tilePositionY = scrollY * 0.3;
                
                this.planets.tilePositionX = scrollX * 0.6; // Move mais rápido que as estrelas
                this.planets.tilePositionY = scrollY * 0.6;
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
            
            // Atualiza a UI
            this.updateUI();
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