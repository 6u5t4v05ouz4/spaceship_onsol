// SIMULAÇÃO SIMPLES SEM ASSETS - GARANTIDO QUE FUNCIONA
export default class SimpleGameplaySimulation extends Phaser.Scene {
    constructor() {
        super('SimpleGameplaySimulation');
        this.elements = {
            ship: null,
            enemies: [],
            meteors: [],
            bullets: []
        };
    }

    create() {
        console.log('🔥 CRIANDO SIMULAÇÃO SIMPLES (SEM ASSETS)');
        
        // Mundo grande
        this.physics.world.setBounds(-1000, -1000, 2000, 2000);
        
        // Background com estrelas
        this.createSimpleBackground();
        
        // Criar elementos SEM ASSETS
        this.createSimpleShip();
        this.createSimpleEnemies();
        this.createSimpleMeteors();
        
        // Iniciar movimento
        this.startSimpleSimulation();
        
        console.log('✅ SIMULAÇÃO SIMPLES CRIADA E RODANDO!');
    }

    createSimpleBackground() {
        // Estrelas como círculos brancos
        for (let i = 0; i < 200; i++) {
            const x = Phaser.Math.Between(-1000, 1000);
            const y = Phaser.Math.Between(-1000, 1000);
            const star = this.add.circle(x, y, 1, 0xffffff);
            star.setAlpha(Phaser.Math.FloatBetween(0.3, 1));
        }
    }

    createSimpleShip() {
        // Nave como triângulo VERDE
        this.elements.ship = this.add.triangle(0, 0, 0, -15, -10, 15, 10, 15, 0x00ff00);
        this.physics.add.existing(this.elements.ship);
        this.elements.ship.body.setSize(20, 20);
        this.elements.ship.setDepth(10);
        
        console.log('✅ NAVE VERDE CRIADA');
    }

    createSimpleEnemies() {
        // 8 inimigos como círculos VERMELHOS
        for (let i = 0; i < 8; i++) {
            this.spawnSimpleEnemy();
        }
        
        // Spawn contínuo MAIS RÁPIDO
        this.time.addEvent({
            delay: 2000, // ✅ Mais rápido: 3000 -> 2000
            callback: () => {
                if (this.elements.enemies.length < 12) { // ✅ Mais inimigos: 8 -> 12
                    this.spawnSimpleEnemy();
                }
            },
            loop: true
        });
    }

    spawnSimpleEnemy() {
        // Spawn nas bordas da tela
        const side = Phaser.Math.Between(0, 3);
        let x, y;
        
        switch(side) {
            case 0: // Esquerda
                x = -600;
                y = Phaser.Math.Between(-400, 400);
                break;
            case 1: // Direita
                x = 600;
                y = Phaser.Math.Between(-400, 400);
                break;
            case 2: // Cima
                x = Phaser.Math.Between(-400, 400);
                y = -400;
                break;
            case 3: // Baixo
                x = Phaser.Math.Between(-400, 400);
                y = 400;
                break;
        }
        
        // Inimigo como círculo VERMELHO MAIOR
        const enemy = this.add.circle(x, y, 20, 0xff3333); // ✅ Maior: 15 -> 20, cor mais clara
        this.physics.add.existing(enemy);
        
        // Movimento em direção ao centro + velocidade aleatória
        const centerAngle = Phaser.Math.Angle.Between(x, y, 0, 0);
        const randomOffset = Phaser.Math.FloatBetween(-0.5, 0.5);
        const finalAngle = centerAngle + randomOffset;
        const speed = Phaser.Math.Between(120, 250); // ✅ Mais rápido: 100-200 -> 120-250
        
        enemy.body.setVelocity(
            Math.cos(finalAngle) * speed,
            Math.sin(finalAngle) * speed
        );
        
        this.elements.enemies.push(enemy);
        console.log('🔴 INIMIGO VERMELHO CRIADO E MOVENDO');
    }

    createSimpleMeteors() {
        // 6 meteoros como quadrados LARANJAS
        for (let i = 0; i < 6; i++) {
            this.spawnSimpleMeteor();
        }
        
        // Spawn contínuo MAIS RÁPIDO
        this.time.addEvent({
            delay: 2500, // ✅ Mais rápido: 4000 -> 2500
            callback: () => {
                if (this.elements.meteors.length < 10) { // ✅ Mais meteoros: 6 -> 10
                    this.spawnSimpleMeteor();
                }
            },
            loop: true
        });
    }

    spawnSimpleMeteor() {
        const x = Phaser.Math.Between(-600, 600);
        const y = Phaser.Math.Between(-600, 600);
        
        // Meteoro como quadrado LARANJA girando
        const meteor = this.add.rectangle(x, y, 25, 25, 0xff8800);
        this.physics.add.existing(meteor);
        
        // Movimento RÁPIDO
        const speed = Phaser.Math.Between(150, 300);
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        meteor.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        
        this.elements.meteors.push(meteor);
        console.log('🟠 METEORO LARANJA CRIADO E MOVENDO');
    }

    startSimpleSimulation() {
        console.log('🚀 INICIANDO MOVIMENTO DA NAVE');
        
        // Nave se move em círculos
        this.time.addEvent({
            delay: 16,
            callback: () => {
                if (this.elements.ship) {
                    const time = this.time.now * 0.001;
                    const radius = 200;
                    const x = Math.cos(time) * radius;
                    const y = Math.sin(time) * radius;
                    
                    this.elements.ship.setPosition(x, y);
                    this.elements.ship.rotation = time;
                }
            },
            loop: true
        });
        
        // Disparar balas automaticamente
        this.time.addEvent({
            delay: 500,
            callback: () => {
                this.fireSimpleBullet();
            },
            loop: true
        });
        
        // Explosões aleatórias
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                this.createSimpleExplosion();
            },
            loop: true
        });
    }

    fireSimpleBullet() {
        if (!this.elements.ship) return;
        
        // Bala como círculo CIANO pequeno
        const bullet = this.add.circle(
            this.elements.ship.x,
            this.elements.ship.y,
            3, 0x00ffff
        );
        this.physics.add.existing(bullet);
        
        // Dispara na direção da rotação da nave
        const speed = 400;
        bullet.body.setVelocity(
            Math.cos(this.elements.ship.rotation) * speed,
            Math.sin(this.elements.ship.rotation) * speed
        );
        
        this.elements.bullets.push(bullet);
        
        // Remove bala após 2 segundos
        this.time.delayedCall(2000, () => {
            if (bullet.active) {
                const index = this.elements.bullets.indexOf(bullet);
                if (index > -1) {
                    this.elements.bullets.splice(index, 1);
                }
                bullet.destroy();
            }
        });
    }

    createSimpleExplosion() {
        const x = Phaser.Math.Between(-400, 400);
        const y = Phaser.Math.Between(-400, 400);
        
        // Explosão como círculo AMARELO que cresce
        const explosion = this.add.circle(x, y, 5, 0xffff00);
        
        this.tweens.add({
            targets: explosion,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                explosion.destroy();
            }
        });
    }

    update() {
        // Limpar elementos que saíram da tela
        this.cleanupElements();
        
        // Fazer meteoros girarem
        this.elements.meteors.forEach(meteor => {
            if (meteor.active) {
                meteor.rotation += 0.05;
            }
        });
    }

    cleanupElements() {
        const bounds = 800;
        
        // Limpar inimigos
        for (let i = this.elements.enemies.length - 1; i >= 0; i--) {
            const enemy = this.elements.enemies[i];
            if (enemy.active && (Math.abs(enemy.x) > bounds || Math.abs(enemy.y) > bounds)) {
                this.elements.enemies.splice(i, 1);
                enemy.destroy();
            }
        }
        
        // Limpar meteoros
        for (let i = this.elements.meteors.length - 1; i >= 0; i--) {
            const meteor = this.elements.meteors[i];
            if (meteor.active && (Math.abs(meteor.x) > bounds || Math.abs(meteor.y) > bounds)) {
                this.elements.meteors.splice(i, 1);
                meteor.destroy();
            }
        }
        
        // Limpar balas
        for (let i = this.elements.bullets.length - 1; i >= 0; i--) {
            const bullet = this.elements.bullets[i];
            if (bullet.active && (Math.abs(bullet.x) > bounds || Math.abs(bullet.y) > bounds)) {
                this.elements.bullets.splice(i, 1);
                bullet.destroy();
            }
        }
    }
}
