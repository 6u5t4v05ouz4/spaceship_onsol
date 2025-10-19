/**
 * MeteorManager - Gerencia todos os aspectos dos meteoros
 * Responsabilidades:
 * - Spawn e criação de meteoros
 * - Movimento e rotação
 * - Trail effects
 * - Culling e limpeza
 * - Integração com CollisionManager
 */
export default class MeteorManager {
    constructor(scene, collisionManager) {
        this.scene = scene;
        this.collisionManager = collisionManager;
        
        // Estado dos meteoros
        this.meteors = [];
        this.maxMeteors = 3;
        this.spawnTimer = null;
        this.spawnDelay = 8000; // 8 segundos
        
        // Configurações de spawn
        this.spawnOffset = 120;
        this.minScale = 0.5;
        this.maxScale = 0.8;
        this.minSpeed = 120;
        this.maxSpeed = 280;
        this.meteorLifetime = 25000; // 25 segundos
        
        // Configurações de movimento
        this.minHealth = 30;
        this.targetChance = 40; // 40% chance de mirar no jogador
        
        // Referência para nave do jogador
        this.playerShip = null;
        
        // Trail effects
        this.trailEffects = null;
        
        console.log('☄️ MeteorManager inicializado');
    }
    
    /**
     * Inicializa o sistema de meteoros
     */
    initialize(playerShip, trailEffects) {
        this.playerShip = playerShip;
        this.trailEffects = trailEffects;
        console.log('☄️ MeteorManager: Configurando sistema de meteoros');
        
        // Configura spawn contínuo
        this.setupSpawnTimer();
        
        console.log('✅ MeteorManager: Sistema inicializado');
    }
    
    /**
     * Configura timer de spawn contínuo
     */
    setupSpawnTimer() {
        this.spawnTimer = this.scene.time.addEvent({
            delay: this.spawnDelay,
            callback: () => {
                if (this.meteors.length < this.maxMeteors) {
                    this.spawnMeteor();
                }
            },
            callbackScope: this,
            loop: true
        });
        
        console.log('☄️ Timer de spawn configurado');
    }
    
    /**
     * Cria um novo meteoro
     */
    spawnMeteor() {
        try {
            // Calcula posição de spawn
            const spawnPos = this.calculateSpawnPosition();
            
            // Cria sprite do meteoro
            const meteor = this.scene.physics.add.sprite(
                spawnPos.x, spawnPos.y, 
                'meteoro', 
                'meteoro 0.aseprite'
            );
            
            // Configura propriedades visuais
            this.setupMeteorVisuals(meteor);
            
            // Configura propriedades físicas
            this.setupMeteorPhysics(meteor);
            
            // Configura movimento
            this.setupMeteorMovement(meteor);
            
            // Adiciona trail effect
            this.addTrailEffect(meteor);
            
            // Adiciona ao sistema de colisões
            if (this.collisionManager) {
                this.collisionManager.addToGroup('meteors', meteor);
            }
            
            // Armazena referência
            this.meteors.push(meteor);
            
            // Configura destruição automática
            this.setupMeteorDestruction(meteor);
            
            console.log(`☄️ Meteoro criado em (${spawnPos.x.toFixed(0)}, ${spawnPos.y.toFixed(0)})`);
            
        } catch (error) {
            console.error('❌ Erro ao criar meteoro:', error);
        }
    }
    
    /**
     * Calcula posição de spawn baseada na câmera
     */
    calculateSpawnPosition() {
        const cam = this.scene.cameras && this.scene.cameras.main ? this.scene.cameras.main : null;
        let x, y;
        
        if (cam) {
            // Spawn nas bordas da viewport da câmera
            const halfW = cam.width / 2 / cam.zoom;
            const halfH = cam.height / 2 / cam.zoom;
            const centerX = cam.scrollX + halfW;
            const centerY = cam.scrollY + halfH;
            const side = Phaser.Math.Between(0, 3);
            
            switch (side) {
                case 0: // Esquerda
                    x = centerX - halfW - this.spawnOffset;
                    y = Phaser.Math.Between(centerY - halfH, centerY + halfH);
                    break;
                case 1: // Direita
                    x = centerX + halfW + this.spawnOffset;
                    y = Phaser.Math.Between(centerY - halfH, centerY + halfH);
                    break;
                case 2: // Cima
                    x = Phaser.Math.Between(centerX - halfW, centerX + halfW);
                    y = centerY - halfH - this.spawnOffset;
                    break;
                case 3: // Baixo
                    x = Phaser.Math.Between(centerX - halfW, centerX + halfW);
                    y = centerY + halfH + this.spawnOffset;
                    break;
            }
        } else {
            // Fallback para spawn aleatório
            const minX = -2000, maxX = 2000, minY = -2000, maxY = 2000;
            const side = Phaser.Math.Between(0, 3);
            
            switch (side) {
                case 0: // Esquerda
                    x = minX - 100;
                    y = Phaser.Math.Between(minY, maxY);
                    break;
                case 1: // Direita
                    x = maxX + 100;
                    y = Phaser.Math.Between(minY, maxY);
                    break;
                case 2: // Cima
                    x = Phaser.Math.Between(minX, maxX);
                    y = minY - 100;
                    break;
                case 3: // Baixo
                    x = Phaser.Math.Between(minX, maxX);
                    y = maxY + 100;
                    break;
            }
        }
        
        return { x, y };
    }
    
    /**
     * Configura propriedades visuais do meteoro
     */
    setupMeteorVisuals(meteor) {
        meteor.setScale(Phaser.Math.FloatBetween(this.minScale, this.maxScale));
        meteor.setDepth(1);
        meteor.setOrigin(0.5);
        
        // Inicia animação
        meteor.play('meteoro_anim');
        
        console.log(`☄️ Meteoro visual configurado - Escala: ${meteor.scale.toFixed(2)}`);
    }
    
    /**
     * Configura propriedades físicas do meteoro
     */
    setupMeteorPhysics(meteor) {
        meteor.body.setAllowGravity(false);
        meteor.setCollideWorldBounds(false);
        meteor.body.setDrag(0);
        meteor.body.setMaxVelocity(1000);
        
        // Configura corpo circular
        if (meteor.body) {
            const radius = Math.max(meteor.displayWidth, meteor.displayHeight) * 0.45;
            meteor.body.setCircle(radius);
            meteor.body.setOffset(
                (meteor.displayWidth - radius) / 2, 
                (meteor.displayHeight - radius) / 2
            );
        }
        
        // Propriedades do meteoro
        meteor.health = this.minHealth;
        meteor.isAlive = true;
        
        console.log(`☄️ Meteoro física configurada - Saúde: ${meteor.health}`);
    }
    
    /**
     * Configura movimento do meteoro
     */
    setupMeteorMovement(meteor) {
        // Calcula direção inteligente
        const target = this.calculateMeteorTarget();
        const angle = Phaser.Math.Angle.Between(meteor.x, meteor.y, target.x, target.y);
        const speed = Phaser.Math.Between(this.minSpeed, this.maxSpeed);
        
        // Armazena propriedades de movimento
        meteor.vx = Math.cos(angle) * speed;
        meteor.vy = Math.sin(angle) * speed;
        meteor.moveAngle = angle;
        
        // Aplica velocidade inicial
        meteor.setVelocity(meteor.vx, meteor.vy);
        meteor.rotation = angle;
        
        console.log(`☄️ Movimento configurado - Velocidade: ${speed.toFixed(1)}, Ângulo: ${(angle * 180 / Math.PI).toFixed(1)}°`);
    }
    
    /**
     * Calcula alvo do meteoro
     */
    calculateMeteorTarget() {
        // Chance de mirar no jogador
        if (this.playerShip && Phaser.Math.Between(0, 100) < this.targetChance) {
            return {
                x: this.playerShip.x + Phaser.Math.Between(-200, 200),
                y: this.playerShip.y + Phaser.Math.Between(-200, 200)
            };
        } else {
            // Movimento aleatório
            return {
                x: Phaser.Math.Between(-600, 600),
                y: Phaser.Math.Between(-600, 600)
            };
        }
    }
    
    /**
     * Adiciona trail effect ao meteoro
     */
    addTrailEffect(meteor) {
        if (this.trailEffects) {
            meteor.trailId = this.trailEffects.createLineTrail(
                `meteor_${Date.now()}_${Math.random()}`, 
                15, 0xff6600, 0.4, 2
            );
            console.log(`☄️ Trail effect adicionado: ${meteor.trailId}`);
        }
    }
    
    /**
     * Configura destruição automática do meteoro
     */
    setupMeteorDestruction(meteor) {
        this.scene.time.delayedCall(this.meteorLifetime, () => { 
            if (meteor && meteor.active) {
                this.destroyMeteor(meteor);
            }
        });
    }
    
    /**
     * Atualiza todos os meteoros
     */
    update() {
        this.meteors.forEach(meteor => {
            if (meteor.active && meteor.isAlive) {
                this.updateMeteorMovement(meteor);
                this.updateMeteorRotation(meteor);
                this.updateTrailEffect(meteor);
            }
        });
    }
    
    /**
     * Atualiza movimento do meteoro
     */
    updateMeteorMovement(meteor) {
        if (meteor.body) {
            // Reaplica velocidade se necessário (para manter movimento constante)
            if (meteor.vx !== undefined && meteor.vy !== undefined) {
                const currentSpeed = Math.sqrt(
                    meteor.body.velocity.x * meteor.body.velocity.x + 
                    meteor.body.velocity.y * meteor.body.velocity.y
                );
                
                // Se a velocidade caiu muito, reaplica
                if (currentSpeed < 10) {
                    meteor.setVelocity(meteor.vx, meteor.vy);
                }
            }
        }
    }
    
    /**
     * Atualiza rotação do meteoro
     */
    updateMeteorRotation(meteor) {
        if (meteor.body && (meteor.body.velocity.x !== 0 || meteor.body.velocity.y !== 0)) {
            meteor.rotation = Phaser.Math.Angle.Between(
                meteor.x - meteor.body.velocity.x, 
                meteor.y - meteor.body.velocity.y,
                meteor.x, 
                meteor.y
            ) + Math.PI / 2;
        }
    }
    
    /**
     * Atualiza trail effect do meteoro
     */
    updateTrailEffect(meteor) {
        if (meteor.trailId && this.trailEffects) {
            this.trailEffects.updateLineTrail(meteor.trailId, meteor.x, meteor.y);
        }
    }
    
    /**
     * Aplica dano ao meteoro
     */
    damageMeteor(meteor, damage) {
        if (!meteor || !meteor.isAlive) return false;
        
        meteor.health -= damage;
        
        console.log(`☄️ Meteoro recebeu ${damage} de dano. Saúde restante: ${meteor.health}`);
        
        // Efeito visual de dano
        this.createDamageEffect(meteor);
        
        // Verifica se foi destruído
        if (meteor.health <= 0) {
            this.destroyMeteor(meteor);
            return true; // Meteoro destruído
        }
        
        return false; // Meteoro ainda vivo
    }
    
    /**
     * Cria efeito visual de dano
     */
    createDamageEffect(meteor) {
        // Flash branco
        meteor.setTint(0xffffff);
        this.scene.time.delayedCall(100, () => {
            if (meteor && meteor.active) {
                meteor.clearTint();
            }
        });
        
        // Efeito de partículas se disponível
        if (this.scene.particleEffects) {
            this.scene.particleEffects.createHitEffect(meteor.x, meteor.y);
        }
    }
    
    /**
     * Destrói o meteoro
     */
    destroyMeteor(meteor) {
        if (!meteor || !meteor.isAlive) return;
        
        console.log('☄️ Meteoro destruído!');
        
        meteor.isAlive = false;
        
        // Efeito de explosão
        this.createDestructionEffect(meteor);
        
        // Remove do sistema de colisões
        if (this.collisionManager) {
            this.collisionManager.removeFromGroup('meteors', meteor);
        }
        
        // Remove trail effect
        if (meteor.trailId && this.trailEffects) {
            this.trailEffects.removeTrail(meteor.trailId);
        }
        
        // Destrói o meteoro
        this.scene.time.delayedCall(500, () => {
            if (meteor && meteor.active) {
                meteor.destroy();
            }
        });
        
        // Remove da lista
        const index = this.meteors.indexOf(meteor);
        if (index > -1) {
            this.meteors.splice(index, 1);
        }
    }
    
    /**
     * Cria efeito de destruição
     */
    createDestructionEffect(meteor) {
        if (this.scene.particleEffects) {
            this.scene.particleEffects.createExplosion(meteor.x, meteor.y, 'small');
        }
        
        if (this.scene.audioManager) {
            this.scene.audioManager.playExplosion('small');
        }
        
        // Efeito de tela shake leve
        if (this.scene.juiceManager) {
            this.scene.juiceManager.screenShake(10, 0.3);
        }
    }
    
    /**
     * Aplica culling para otimização
     */
    cullMeteors() {
        if (!this.playerShip) return;
        
        const sx = this.playerShip.x;
        const sy = this.playerShip.y;
        const cullRadius = 1200;
        const cullRadiusSquared = cullRadius * cullRadius;
        
        this.meteors.forEach(meteor => {
            if (!meteor) return;
            
            const dx = meteor.x - sx;
            const dy = meteor.y - sy;
            const distanceSquared = dx * dx + dy * dy;
            const isVisible = distanceSquared <= cullRadiusSquared;
            
            // Atualiza visibilidade
            meteor.setVisible(isVisible);
            
            if (meteor.body) {
                meteor.body.enable = isVisible;
            }
            
            meteor.active = isVisible;
            
            // Atualiza trail baseado na visibilidade
            if (isVisible && meteor.trailId && this.trailEffects) {
                this.trailEffects.updateLineTrail(meteor.trailId, meteor.x, meteor.y);
            }
            
            // Destrói se muito distante
            if (distanceSquared > (cullRadius * 2) * (cullRadius * 2)) {
                this.destroyMeteor(meteor);
            }
        });
    }
    
    /**
     * Limpeza de meteoros distantes
     */
    cleanupDistantMeteors() {
        if (!this.playerShip) return;
        
        const cleanupRadius = 3600; // 3x cull radius
        
        this.meteors.forEach((meteor, index) => {
            if (meteor.active) {
                const distance = Phaser.Math.Distance.Between(
                    this.playerShip.x, this.playerShip.y, 
                    meteor.x, meteor.y
                );
                
                if (distance > cleanupRadius) {
                    console.log('☄️ Removendo meteoro distante');
                    this.destroyMeteor(meteor);
                }
            }
        });
    }
    
    /**
     * Obtém lista de meteoros vivos
     */
    getAliveMeteors() {
        return this.meteors.filter(meteor => meteor.active && meteor.isAlive);
    }
    
    /**
     * Obtém contagem de meteoros
     */
    getMeteorCount() {
        return this.meteors.length;
    }
    
    /**
     * Configura parâmetros de spawn
     */
    setSpawnParameters(params) {
        if (params.maxMeteors !== undefined) this.maxMeteors = params.maxMeteors;
        if (params.spawnDelay !== undefined) this.spawnDelay = params.spawnDelay;
        if (params.targetChance !== undefined) this.targetChance = params.targetChance;
        
        console.log('☄️ Parâmetros de spawn atualizados:', params);
    }
    
    /**
     * Destrói o manager e limpa recursos
     */
    destroy() {
        console.log('☄️ MeteorManager: Destruindo...');
        
        // Para timer de spawn
        if (this.spawnTimer) {
            this.spawnTimer.remove();
        }
        
        // Destrói todos os meteoros
        this.meteors.forEach(meteor => {
            if (meteor.trailId && this.trailEffects) {
                this.trailEffects.removeTrail(meteor.trailId);
            }
            if (meteor.active) meteor.destroy();
        });
        
        // Limpa arrays
        this.meteors = [];
        
        console.log('✅ MeteorManager: Destruído');
    }
}
