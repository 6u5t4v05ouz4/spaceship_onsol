/**
 * CollisionManager - Gerencia todas as colisões do jogo
 * Responsabilidades:
 * - Detecção de colisões entre objetos
 * - Resposta a colisões (dano, destruição, efeitos)
 * - Configuração de grupos de física
 * - Otimização de performance de colisões
 */
export default class CollisionManager {
    constructor(scene) {
        this.scene = scene;
        this.collisionGroups = new Map();
        this.collisionHandlers = new Map();
        this.setupCollisionGroups();
    }

    setupCollisionGroups() {
        // Cria grupos de física para diferentes tipos de objetos
        this.collisionGroups.set('projectiles', this.scene.physics.add.group());
        this.collisionGroups.set('rockets', this.scene.physics.add.group());
        this.collisionGroups.set('enemies', this.scene.physics.add.group());
        this.collisionGroups.set('meteors', this.scene.physics.add.group());
        this.collisionGroups.set('miningPlanets', this.scene.physics.add.group());
    }

    // === COLLISION SETUP ===
    setupAllCollisions(ship) {
        // Colisão entre projéteis e inimigos
        this.setupCollision(
            'projectiles', 'enemies',
            this.handleProjectileEnemyCollision.bind(this)
        );

        // Colisão entre projéteis e meteoros
        this.setupCollision(
            'projectiles', 'meteors',
            this.handleProjectileMeteorCollision.bind(this)
        );

        // Colisão entre foguetes e inimigos
        this.setupCollision(
            'rockets', 'enemies',
            this.handleRocketEnemyCollision.bind(this)
        );

        // Colisão entre foguetes e meteoros
        this.setupCollision(
            'rockets', 'meteors',
            this.handleRocketMeteorCollision.bind(this)
        );

        // Colisão entre nave e meteoros
        this.setupCollision(
            ship, 'meteors',
            this.handleShipMeteorCollision.bind(this)
        );

        // Colisão entre nave e inimigos
        this.setupCollision(
            ship, 'enemies',
            this.handleShipEnemyCollision.bind(this)
        );

        // Colisão entre nave e planetas mineráveis
        this.setupCollision(
            ship, 'miningPlanets',
            this.handleShipMiningPlanetCollision.bind(this)
        );
    }

    setupCollision(group1, group2, handler) {
        const key = `${group1}_${group2}`;
        
        // Armazena o handler para uso posterior
        this.collisionHandlers.set(key, handler);
        
        // Configura a colisão no Phaser
        if (typeof group1 === 'string') {
            group1 = this.collisionGroups.get(group1);
        }
        if (typeof group2 === 'string') {
            group2 = this.collisionGroups.get(group2);
        }
        
        this.scene.physics.add.overlap(group1, group2, handler, null, this.scene);
    }

    // === COLLISION HANDLERS ===
    handleProjectileEnemyCollision(projectile, enemy) {
        const damage = 35;
        
        // Efeitos visuais
        this.createImpactEffects(projectile, enemy);
        
        // Aplica dano
        enemy.health -= damage;
        
        // Atualiza barra de vida do inimigo
        this.updateEnemyHealthBar(enemy);
        
        // Destrói projétil
        projectile.destroy();
        
        // Verifica se inimigo foi destruído
        if (enemy.health <= 0) {
            this.destroyEnemy(enemy);
        }
    }

    handleProjectileMeteorCollision(projectile, meteor) {
        const damage = 15;
        
        // Efeitos visuais
        this.createImpactEffects(projectile, meteor);
        
        // Aplica dano
        meteor.health -= damage;
        
        // Destrói projétil
        projectile.destroy();
        
        // Verifica se meteoro foi destruído
        if (meteor.health <= 0) {
            this.destroyMeteor(meteor);
        } else {
            // Som de impacto leve
            if (this.scene.audioManager) {
                this.scene.audioManager.playImpact(0.4);
            }
        }
    }

    handleRocketEnemyCollision(rocket, enemy) {
        const damage = rocket.damage || 100; // 4x mais dano que projéteis
        
        console.log(`🚀 Foguete atingiu inimigo! Dano: ${damage}`);
        
        // Efeitos visuais mais intensos
        this.createImpactEffects(rocket, enemy);
        
        // Animação de explosão
        this.createExplosion(rocket.x, rocket.y);
        
        // Efeitos de partículas
        if (this.scene.particleEffects) {
            this.scene.particleEffects.createExplosion(rocket.x, rocket.y, 'large');
        }
        
        // Aplica dano
        enemy.health -= damage;
        
        // Destrói foguete
        rocket.destroy();
        
        // Verifica se inimigo foi destruído
        if (enemy.health <= 0) {
            this.destroyEnemy(enemy);
        } else {
            // Som de impacto forte
            if (this.scene.audioManager) {
                this.scene.audioManager.playExplosion('large');
            }
        }
    }

    handleRocketMeteorCollision(rocket, meteor) {
        const damage = rocket.damage || 100; // 4x mais dano que projéteis
        
        console.log(`🚀 Foguete atingiu meteoro! Dano: ${damage}`);
        
        // Efeitos visuais mais intensos
        this.createImpactEffects(rocket, meteor);
        
        // Animação de explosão
        this.createExplosion(rocket.x, rocket.y);
        
        // Efeitos de partículas
        if (this.scene.particleEffects) {
            this.scene.particleEffects.createExplosion(rocket.x, rocket.y, 'medium');
        }
        
        // Aplica dano
        meteor.health -= damage;
        
        // Destrói foguete
        rocket.destroy();
        
        // Verifica se meteoro foi destruído
        if (meteor.health <= 0) {
            this.destroyMeteor(meteor);
        } else {
            // Som de impacto forte
            if (this.scene.audioManager) {
                this.scene.audioManager.playExplosion('medium');
            }
        }
    }

    handleShipMeteorCollision(ship, meteor) {
        if (this.scene.gameState.isGameOver) return;
        
        const damage = 10;
        
        // Efeitos de dano na nave
        this.createShipDamageEffects(ship, damage);
        
        // Aplica dano à nave
        if (this.scene.gameState.takeDamage(damage)) {
            // Game over
            return;
        }
        
        // Destrói meteoro
        this.destroyMeteor(meteor);
    }

    handleShipEnemyCollision(ship, enemy) {
        if (this.scene.gameState.isGameOver) return;
        
        const damage = 25;
        
        // Efeitos de dano na nave
        this.createShipDamageEffects(ship, damage);
        
        // Aplica dano à nave
        if (this.scene.gameState.takeDamage(damage)) {
            // Game over
            return;
        }
        
        // Destrói inimigo
        this.destroyEnemy(enemy);
    }

    handleShipMiningPlanetCollision(ship, planet) {
        // Lógica de mineração será implementada no MiningManager
        // Por enquanto, apenas emite evento
        this.scene.events.emit('mining_planet_contact', {
            ship: ship,
            planet: planet
        });
    }

    // === EFFECTS ===
    createImpactEffects(projectile, target) {
        // Efeitos de impacto (faíscas)
        const angle = Phaser.Math.Angle.Between(
            projectile.x, projectile.y, 
            target.x, target.y
        );
        
        if (this.scene.particleEffects) {
            this.scene.particleEffects.createImpactSparks(
                projectile.x, projectile.y, 
                Phaser.Math.RadToDeg(angle) + 180
            );
        }
        
        // Flash no alvo
        if (this.scene.juiceManager) {
            this.scene.juiceManager.damageFlash(target, 100);
        }
        
        // Screen shake pequeno
        if (this.scene.juiceManager) {
            this.scene.juiceManager.screenShake(80, 3);
        }
        
        // Som de impacto
        if (this.scene.audioManager) {
            this.scene.audioManager.playImpact(0.6);
        }
        
        // Texto de dano flutuante
        if (this.scene.uiAnimations) {
            this.scene.uiAnimations.createFloatingText(
                target.x + Phaser.Math.Between(-20, 20), 
                target.y - 20, 
                `-35`, 
                {
                    color: '#ff4444',
                    fontSize: '18px',
                    duration: 1000,
                    distance: 40,
                    fadeDelay: 300
                }
            );
        }
    }

    createShipDamageEffects(ship, damage) {
        // Flash na nave
        if (this.scene.juiceManager) {
            this.scene.juiceManager.damageFlash(ship, 150);
            this.scene.juiceManager.screenShake(200, 8);
            this.scene.juiceManager.flash(150, 0xff0000, 0.4);
        }
        
        // Texto de dano
        if (this.scene.uiAnimations) {
            this.scene.uiAnimations.showDamage(ship.x, ship.y - 30, damage);
        }
        
        // Explosão no ponto de colisão
        this.createExplosion(ship.x, ship.y);
        
        // Partículas de explosão
        if (this.scene.particleEffects) {
            this.scene.particleEffects.createExplosion(ship.x, ship.y, 'medium');
        }
        
        // Som de explosão
        if (this.scene.audioManager) {
            this.scene.audioManager.playExplosion('large');
        }
    }

    createExplosion(x, y) {
        const explosion = this.scene.add.sprite(x, y, 'explosion');
        explosion.setDepth(100);
        explosion.play('explosion_anim');
        explosion.once('animationcomplete', () => {
            explosion.destroy();
        });
    }

    // === DESTRUCTION HANDLERS ===
    destroyEnemy(enemy) {
        // Efeito de impacto grande
        if (this.scene.juiceManager) {
            this.scene.juiceManager.impactEffect('large');
        }
        
        // Texto "DESTROYED"
        if (this.scene.uiAnimations) {
            this.scene.uiAnimations.createFloatingText(
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
        }
        
        // Explosão visual
        this.createExplosion(enemy.x, enemy.y);
        
        // Partículas de explosão
        if (this.scene.particleEffects) {
            this.scene.particleEffects.createExplosion(enemy.x, enemy.y, 'medium');
        }
        
        // Som de explosão
        if (this.scene.audioManager) {
            this.scene.audioManager.playExplosion('medium');
        }
        
        // Limpa timer de movimento
        if (enemy._movementTimer) {
            enemy._movementTimer.remove(false);
        }
        
        // Destrói barras de vida
        if (enemy.healthBar) enemy.healthBar.destroy();
        if (enemy.healthBarBg) enemy.healthBarBg.destroy();
        
        // Remove do grupo de física
        this.collisionGroups.get('enemies').remove(enemy);
        
        // Destrói inimigo
        enemy.destroy();
        
        // Atualiza estatísticas
        if (this.scene.gameState) {
            this.scene.gameState.incrementEnemiesKilled();
        }
    }

    destroyMeteor(meteor) {
        // Explosão visual
        this.createExplosion(meteor.x, meteor.y);
        
        // Partículas de explosão
        if (this.scene.particleEffects) {
            this.scene.particleEffects.createExplosion(meteor.x, meteor.y, 'small');
        }
        
        // Som de explosão
        if (this.scene.audioManager) {
            this.scene.audioManager.playExplosion('small');
        }
        
        // Efeito de impacto
        if (this.scene.juiceManager) {
            this.scene.juiceManager.impactEffect('small');
        }
        
        // Remove trail se existir
        if (meteor.trailId && this.scene.trailEffects) {
            this.scene.trailEffects.removeTrail(meteor.trailId);
        }
        
        // Remove do grupo de física
        this.collisionGroups.get('meteors').remove(meteor);
        
        // Destrói meteoro
        meteor.destroy();
        
        // Atualiza estatísticas
        if (this.scene.gameState) {
            this.scene.gameState.incrementMeteorsDestroyed();
        }
    }

    // === UTILITY METHODS ===
    updateEnemyHealthBar(enemy) {
        if (!enemy.healthBar || !enemy.maxHealth) return;
        
        const healthPercentage = Math.max(0, enemy.health / enemy.maxHealth);
        
        // Anima mudança na barra de vida
        if (this.scene.uiAnimations) {
            this.scene.uiAnimations.animateBar(
                enemy.healthBar, 
                enemy.healthBar.scaleX, 
                healthPercentage, 
                200
            );
        }
        
        // Muda cor da barra baseada na vida
        if (healthPercentage < 0.3) {
            enemy.healthBar.setFillStyle(0xff0000); // Vermelho quando crítico
        } else if (healthPercentage < 0.6) {
            enemy.healthBar.setFillStyle(0xff6600); // Laranja quando baixo
        }
    }

    // === GROUP MANAGEMENT ===
    addToGroup(groupName, object) {
        const group = this.collisionGroups.get(groupName);
        if (group) {
            group.add(object);
        }
    }

    removeFromGroup(groupName, object) {
        const group = this.collisionGroups.get(groupName);
        if (group) {
            group.remove(object);
        }
    }

    getGroup(groupName) {
        return this.collisionGroups.get(groupName);
    }

    // === CLEANUP ===
    destroy() {
        this.collisionGroups.clear();
        this.collisionHandlers.clear();
    }
}
