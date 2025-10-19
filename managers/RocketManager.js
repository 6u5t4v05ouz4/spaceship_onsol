/**
 * RocketManager - Gerencia foguetes teleguiados com sistema de mísseis
 * Responsabilidades:
 * - Lançamento de foguetes com botão direito do mouse
 * - Sistema de cooldown de 10 segundos
 * - Foguetes mais lentos que projéteis comuns
 * - 4x mais dano que projéteis normais
 * - Sistema de teleguiamento para inimigo mais próximo
 * - Curva física realista para perseguição
 * - Otimização de performance
 */
export default class RocketManager {
    constructor(scene, collisionManager) {
        this.scene = scene;
        this.collisionManager = collisionManager;
        
        // Estado dos foguetes
        this.rockets = [];
        this.maxRockets = 5; // Máximo de foguetes simultâneos
        
        // Configurações de foguetes
        this.rocketSpeed = 200; // Mais lento que projéteis (que são 800)
        this.rocketDamage = 100; // 4x mais dano que projéteis (25)
        this.rocketRange = 2000; // Alcance máximo
        this.rocketLifetime = 15000; // 15 segundos de vida
        
        // Sistema de cooldown
        this.cooldownDuration = 10000; // 10 segundos
        this.lastFireTime = 0;
        this.isOnCooldown = false;
        
        // Sistema de teleguiamento
        this.guidanceDelay = 1000; // 1 segundo antes de começar a guiar
        this.turnRate = 0.05; // Velocidade de curva (radianos por frame)
        this.guidanceRange = 1500; // Alcance de guiamento
        
        // Referências
        this.playerShip = null;
        this.enemyManager = null;
        this.particleEffects = null;
        this.audioManager = null;
        this.juiceManager = null;
        
        console.log('🚀 RocketManager inicializado');
    }
    
    /**
     * Inicializa o sistema de foguetes
     */
    initialize(playerShip, enemyManager, particleEffects, audioManager, juiceManager) {
        this.playerShip = playerShip;
        this.enemyManager = enemyManager;
        this.particleEffects = particleEffects;
        this.audioManager = audioManager;
        this.juiceManager = juiceManager;
        
        console.log('🚀 RocketManager: Sistema inicializado');
        
        // Configura input do botão direito
        this.setupRocketInput();
        
        console.log('✅ RocketManager: Sistema de foguetes pronto');
    }
    
    /**
     * Configura input para lançamento de foguetes
     */
    setupRocketInput() {
        // Botão direito do mouse para lançar foguete
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                this.fireRocket();
            }
        });
        
        console.log('🚀 Input de foguetes configurado (botão direito)');
    }
    
    /**
     * Lança um foguete
     */
    fireRocket() {
        if (!this.playerShip || !this.playerShip.ship) {
            console.warn('⚠️ RocketManager: Nave do jogador não disponível');
            return;
        }
        
        // Verifica cooldown
        if (this.isOnCooldown) {
            const remainingTime = Math.ceil((this.cooldownDuration - (Date.now() - this.lastFireTime)) / 1000);
            console.log(`🚀 Foguete em cooldown: ${remainingTime}s restantes`);
            return;
        }
        
        // Verifica limite de foguetes
        if (this.rockets.length >= this.maxRockets) {
            console.log('🚀 Limite de foguetes atingido');
            return;
        }
        
        try {
            // Atualiza cooldown
            this.lastFireTime = Date.now();
            this.isOnCooldown = true;
            
            // Inicia timer de cooldown
            this.scene.time.delayedCall(this.cooldownDuration, () => {
                this.isOnCooldown = false;
                console.log('🚀 Cooldown de foguete finalizado');
            });
            
            // Efeito de recuo mais forte
            if (this.juiceManager) {
                this.juiceManager.screenShake(80, 1.5); // Mais forte que projéteis
            }
            
            // Cria o foguete
            const rocket = this.createRocket();
            
            // Adiciona ao sistema de colisões
            if (this.collisionManager) {
                this.collisionManager.addToGroup('rockets', rocket);
            }
            
            // Armazena referência
            this.rockets.push(rocket);
            
            // Som do lançamento
            if (this.audioManager) {
                this.audioManager.playShoot();
            }
            
            // Remove o foguete após tempo de vida
            this.scene.time.delayedCall(this.rocketLifetime, () => {
                this.destroyRocket(rocket);
            });
            
            console.log(`🚀 Foguete lançado! Cooldown: ${this.cooldownDuration/1000}s`);
            
        } catch (error) {
            console.error('❌ Erro ao lançar foguete:', error);
        }
    }
    
    /**
     * Cria um foguete individual
     */
    createRocket() {
        // Usa a mesma lógica de direção dos projéteis que funciona
        const angle = this.playerShip.ship.rotation - Math.PI / 2;
        const offsetX = Math.cos(angle) * 40; // Mais distante que projéteis
        const offsetY = Math.sin(angle) * 40;
        
        // Cria o foguete
        const rocket = this.scene.physics.add.sprite(
            this.playerShip.ship.x + offsetX,
            this.playerShip.ship.y + offsetY,
            'rocket',
            'Sprite-0002-Recovered 0.'
        );
        
        // Configurações visuais
        rocket.setScale(0.8);
        rocket.setDepth(2);
        rocket.setOrigin(0.5, 0.5);
        rocket.rotation = angle - Math.PI / 2; // Ajusta para o foguete apontar na direção do movimento
        
        // Configurações físicas
        rocket.body.setAllowGravity(false);
        rocket.setCollideWorldBounds(false);
        rocket.body.setSize(rocket.width * 0.8, rocket.height * 0.8); // Define tamanho da colisão
        
        // Propriedades do foguete
        rocket.isRocket = true;
        rocket.damage = this.rocketDamage;
        rocket.speed = this.rocketSpeed;
        rocket.angle = angle;
        rocket.isAlive = true;
        rocket.guidanceActive = false;
        rocket.guidanceStartTime = Date.now() + this.guidanceDelay;
        rocket.targetEnemy = null;
        rocket.initialDirection = angle;
        
        // Velocidade inicial (direção correta)
        rocket.setVelocity(
            Math.cos(angle) * this.rocketSpeed,
            Math.sin(angle) * this.rocketSpeed
        );
        
        console.log('🚀 Foguete criado com direção correta:', {
            shipRotation: this.playerShip.ship.rotation.toFixed(3),
            calculatedAngle: angle.toFixed(3),
            angleDegrees: (angle * 180 / Math.PI).toFixed(1),
            velocityX: (Math.cos(angle) * this.rocketSpeed).toFixed(1),
            velocityY: (Math.sin(angle) * this.rocketSpeed).toFixed(1)
        });
        
        // Animação do foguete
        if (!this.scene.anims.exists('rocket_anim')) {
            this.scene.anims.create({
                key: 'rocket_anim',
                frames: [
                    { key: 'rocket', frame: 'Sprite-0002-Recovered 0.' },
                    { key: 'rocket', frame: 'Sprite-0002-Recovered 1.' }
                ],
                frameRate: 8,
                repeat: -1
            });
        }
        
        rocket.play('rocket_anim');
        
        // Trilha de partículas mais intensa
        if (this.particleEffects) {
            const trailId = this.particleEffects.createProjectileTrail(rocket);
            rocket._trailId = trailId;
        }
        
        return rocket;
    }
    
    /**
     * Atualiza todos os foguetes
     */
    update() {
        this.rockets.forEach(rocket => {
            if (rocket.active && rocket.isAlive) {
                this.updateRocketGuidance(rocket);
                this.updateRocketMovement(rocket);
                this.updateRocketTrail(rocket);
            }
        });
    }
    
    /**
     * Atualiza sistema de teleguiamento
     */
    updateRocketGuidance(rocket) {
        const currentTime = Date.now();
        
        // Verifica se deve ativar guiamento
        if (!rocket.guidanceActive && currentTime >= rocket.guidanceStartTime) {
            rocket.guidanceActive = true;
            rocket.targetEnemy = this.findNearestEnemy(rocket);
            console.log('🚀 Guiamento ativado para foguete');
        }
        
        // Se guiamento ativo, atualiza alvo
        if (rocket.guidanceActive) {
            // Verifica se alvo ainda é válido
            if (!rocket.targetEnemy || !rocket.targetEnemy.active) {
                rocket.targetEnemy = this.findNearestEnemy(rocket);
            }
            
            // Aplica guiamento se tem alvo
            if (rocket.targetEnemy && rocket.targetEnemy.active) {
                this.applyGuidance(rocket);
            }
        }
    }
    
    /**
     * Encontra o inimigo mais próximo
     */
    findNearestEnemy(rocket) {
        // Primeiro, verifica se há um alvo travado pelo sistema de lock-on
        if (this.scene.getLockedTarget) {
            const lockedTarget = this.scene.getLockedTarget();
            if (lockedTarget && lockedTarget.active) {
                console.log('🎯 Foguete usando alvo travado pelo lock-on!');
                return lockedTarget;
            }
        }
        
        // Se não há alvo travado, busca o inimigo mais próximo
        if (!this.enemyManager) return null;
        
        const enemies = this.enemyManager.getAliveEnemies();
        if (enemies.length === 0) return null;
        
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        enemies.forEach(enemy => {
            if (enemy.active) {
                const distance = Phaser.Math.Distance.Between(
                    rocket.x, rocket.y,
                    enemy.x, enemy.y
                );
                
                if (distance < nearestDistance && distance <= this.guidanceRange) {
                    nearestDistance = distance;
                    nearestEnemy = enemy;
                }
            }
        });
        
        return nearestEnemy;
    }
    
    /**
     * Aplica guiamento físico realista
     */
    applyGuidance(rocket) {
        if (!rocket.targetEnemy) return;
        
        // Calcula direção para o alvo
        const targetAngle = Phaser.Math.Angle.Between(
            rocket.x, rocket.y,
            rocket.targetEnemy.x, rocket.targetEnemy.y
        );
        
        // Calcula diferença angular
        let angleDiff = targetAngle - rocket.angle;
        
        // Normaliza ângulo para [-π, π]
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Aplica curva gradual (física realista)
        const maxTurn = this.turnRate;
        const turnAmount = Phaser.Math.Clamp(angleDiff, -maxTurn, maxTurn);
        
        rocket.angle += turnAmount;
        
        // Atualiza velocidade baseada na nova direção
        const velocityX = Math.cos(rocket.angle) * this.rocketSpeed;
        const velocityY = Math.sin(rocket.angle) * this.rocketSpeed;
        
        rocket.setVelocity(velocityX, velocityY);
        
        // Debug visual (opcional)
        if (this.scene.debug) {
            this.scene.graphics.lineStyle(2, 0xff0000, 0.5);
            this.scene.graphics.lineBetween(
                rocket.x, rocket.y,
                rocket.targetEnemy.x, rocket.targetEnemy.y
            );
        }
    }
    
    /**
     * Atualiza movimento do foguete
     */
    updateRocketMovement(rocket) {
        // Verifica se foguete saiu do alcance
        const distanceFromShip = Phaser.Math.Distance.Between(
            rocket.x, rocket.y,
            this.playerShip.ship.x, this.playerShip.ship.y
        );
        
        if (distanceFromShip > this.rocketRange) {
            this.destroyRocket(rocket);
            return;
        }
    }
    
    /**
     * Atualiza trilha de partículas
     * Nota: O trail segue automaticamente o foguete via 'follow' property
     */
    updateRocketTrail(rocket) {
        // O trail effect segue automaticamente o foguete
        // Não é necessário atualizar manualmente
    }
    
    /**
     * Destrói um foguete
     */
    destroyRocket(rocket) {
        if (!rocket || !rocket.active) return;
        
        // Remove trilha de partículas
        if (rocket._trailId && this.particleEffects) {
            this.particleEffects.removeEmitter(rocket._trailId);
        }
        
        // Remove do array
        const index = this.rockets.indexOf(rocket);
        if (index > -1) {
            this.rockets.splice(index, 1);
        }
        
        // Destrói o sprite
        rocket.destroy();
        
        console.log('🚀 Foguete destruído');
    }
    
    /**
     * Aplica culling para otimização
     */
    cullRockets() {
        if (!this.playerShip || !this.playerShip.ship) return;
        
        const sx = this.playerShip.ship.x;
        const sy = this.playerShip.ship.y;
        const cullRadius = 1500;
        
        this.rockets.forEach(rocket => {
            if (rocket.active) {
                const dx = rocket.x - sx;
                const dy = rocket.y - sy;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                rocket.setVisible(distance < cullRadius);
            }
        });
    }
    
    /**
     * Limpeza de foguetes distantes
     */
    cleanupDistantRockets() {
        if (!this.playerShip || !this.playerShip.ship) return;
        
        const cleanupRadius = 3000;
        
        this.rockets.forEach((rocket, index) => {
            if (rocket.active) {
                const distance = Phaser.Math.Distance.Between(
                    this.playerShip.ship.x, this.playerShip.ship.y,
                    rocket.x, rocket.y
                );
                
                if (distance > cleanupRadius) {
                    console.log(`🚀 Removendo foguete distante ${index}`);
                    this.destroyRocket(rocket);
                }
            }
        });
    }
    
    /**
     * Obtém estatísticas dos foguetes
     */
    getRocketStats() {
        const activeRockets = this.rockets.filter(rocket => rocket.active);
        const guidedRockets = activeRockets.filter(rocket => rocket.guidanceActive);
        
        return {
            totalRockets: this.rockets.length,
            activeRockets: activeRockets.length,
            guidedRockets: guidedRockets.length,
            isOnCooldown: this.isOnCooldown,
            cooldownRemaining: this.isOnCooldown ? 
                Math.max(0, this.cooldownDuration - (Date.now() - this.lastFireTime)) : 0
        };
    }
    
    /**
     * Configura parâmetros dos foguetes
     */
    setRocketParameters(params) {
        if (params.rocketSpeed !== undefined) this.rocketSpeed = params.rocketSpeed;
        if (params.rocketDamage !== undefined) this.rocketDamage = params.rocketDamage;
        if (params.cooldownDuration !== undefined) this.cooldownDuration = params.cooldownDuration;
        if (params.turnRate !== undefined) this.turnRate = params.turnRate;
        if (params.guidanceRange !== undefined) this.guidanceRange = params.guidanceRange;
        
        console.log('🚀 Parâmetros de foguetes atualizados:', params);
    }
    
    /**
     * Força lançamento de foguete (para testes)
     */
    forceFireRocket() {
        this.isOnCooldown = false;
        this.lastFireTime = 0;
        this.fireRocket();
    }
    
    /**
     * Destrói o manager e limpa recursos
     */
    destroy() {
        console.log('🚀 RocketManager: Destruindo...');
        
        // Destrói todos os foguetes
        this.rockets.forEach(rocket => {
            if (rocket.active) {
                this.destroyRocket(rocket);
            }
        });
        
        // Limpa arrays
        this.rockets = [];
        
        console.log('✅ RocketManager: Destruído');
    }
}
