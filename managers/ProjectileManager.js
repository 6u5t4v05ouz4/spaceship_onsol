/**
 * ProjectileManager - Gerencia todos os aspectos dos projéteis
 * Responsabilidades:
 * - Criação e disparo de projéteis
 * - Movimento e animação
 * - Trail effects
 * - Limpeza automática
 * - Integração com CollisionManager
 */
export default class ProjectileManager {
    constructor(scene, collisionManager) {
        this.scene = scene;
        this.collisionManager = collisionManager;
        
        // Estado dos projéteis
        this.projectiles = [];
        this.maxProjectiles = 50; // Limite para performance
        
        // Configurações de disparo
        this.projectileSpeed = 800;
        this.projectileLifetime = 3000; // 3 segundos
        this.projectileScale = 0.6;
        
        // Configurações de movimento
        this.manualSpeed = 12; // Exatamente igual ao GameScene antigo
        
        // Referência para nave do jogador
        this.playerShip = null;
        
        // Efeitos
        this.particleEffects = null;
        this.audioManager = null;
        this.juiceManager = null;
        
        console.log('💥 ProjectileManager inicializado');
    }
    
    /**
     * Inicializa o sistema de projéteis
     */
    initialize(playerShip, particleEffects, audioManager, juiceManager) {
        this.playerShip = playerShip;
        this.particleEffects = particleEffects;
        this.audioManager = audioManager;
        this.juiceManager = juiceManager;
        
        console.log('💥 ProjectileManager: Sistema inicializado');
    }
    
    /**
     * Dispara um projétil da nave do jogador
     * CÓPIA EXATA do GameScene antigo que funcionava
     */
    fireProjectile() {
        if (!this.playerShip) {
            console.warn('⚠️ ProjectileManager: Nave do jogador não disponível');
            return;
        }
        
        // Verifica limite de projéteis
        if (this.projectiles.length >= this.maxProjectiles) {
            console.log('💥 Limite de projéteis atingido');
            return;
        }
        
        try {
            // Recuo leve da nave (juice!) - EXATO do GameScene antigo
            if (this.juiceManager) {
                this.juiceManager.screenShake(40, 1);
            }
            
            // Cria um novo projétil (minibullet) na posição da nave - EXATO do GameScene antigo
            // Calcula primeiro o ângulo de disparo para garantir que o sprite fique alinhado à direção
            const angle = this.playerShip.rotation - Math.PI/2;
            const offsetX = Math.cos(angle) * 30;
            const offsetY = Math.sin(angle) * 30;
            
            // Usa o atlas 'minibullet' para os tiros atuais - EXATO do GameScene antigo
            const projectile = this.scene.physics.add.sprite(
                this.playerShip.x + offsetX,
                this.playerShip.y + offsetY,
                'minibullet',
                'minibullet 0.aseprite'
            );
            
            projectile.setScale(0.6);
            projectile.setDepth(1);
            projectile.setOrigin(0.5, 0.5);
            projectile.body.setAllowGravity(false);
            projectile.setCollideWorldBounds(false);
            
            // Define propriedades do projétil
            projectile.isAlive = true;

            // Define a rotação do projétil igual ao ângulo de movimento (corrige orientação "deitada") - EXATO do GameScene antigo
            projectile.rotation = angle;

            // Desabilita física para usar apenas movimento manual
            projectile.body.setEnable(false);

            // Adiciona ao sistema de colisões
            if (this.collisionManager) {
                this.collisionManager.addToGroup('projectiles', projectile);
            }

            // Também define propriedades de movimento manual para compatibilidade com o loop de update - EXATO do GameScene antigo
            const manualSpeed = 12; // pixels por frame
            projectile.speedX = Math.cos(angle) * manualSpeed;
            projectile.speedY = Math.sin(angle) * manualSpeed;

            // Cria/usa animação do minibullet - EXATO do GameScene antigo
            if (!this.scene.anims.exists('minibullet_anim')) {
                this.scene.anims.create({
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
            
            // Adiciona trilha de partículas ao projétil (otimizado) - EXATO do GameScene antigo
            if (this.particleEffects) {
                const trailId = this.particleEffects.createProjectileTrail(projectile);
                projectile._trailId = trailId; // Armazena para limpar depois
            }
            
            // Armazena referência
            this.projectiles.push(projectile);
            
            // Remove o projétil após 3 segundos com efeitos de explosão
            this.scene.time.delayedCall(3000, () => {
                if (projectile && projectile.active) {
                    this.destroyProjectile(projectile, true); // Com efeitos de explosão
                }
            });
            
            console.log(`💥 Projétil disparado (método exato do GameScene antigo) - Ângulo: ${(angle * 180 / Math.PI).toFixed(1)}°`);
            
        } catch (error) {
            console.error('❌ Erro ao disparar projétil:', error);
        }
    }
    
    /**
     * Calcula dados do projétil (posição, direção, etc.)
     * Baseado no GameScene antigo que funcionava
     */
    calculateProjectileData() {
        // Usa exatamente a mesma lógica do GameScene antigo
        const angle = this.playerShip.rotation - Math.PI / 2;
        const offsetX = Math.cos(angle) * 30;
        const offsetY = Math.sin(angle) * 30;
        
        console.log('🎯 Projétil (baseado no GameScene antigo):', {
            shipRotation: this.playerShip.rotation.toFixed(3),
            shipRotationDegrees: (this.playerShip.rotation * 180 / Math.PI).toFixed(1),
            calculatedAngle: angle.toFixed(3),
            angleDegrees: (angle * 180 / Math.PI).toFixed(1),
            offsetX: offsetX.toFixed(1),
            offsetY: offsetY.toFixed(1),
            spawnX: (this.playerShip.x + offsetX).toFixed(1),
            spawnY: (this.playerShip.y + offsetY).toFixed(1),
            speedX: (Math.cos(angle) * this.manualSpeed).toFixed(1),
            speedY: (Math.sin(angle) * this.manualSpeed).toFixed(1)
        });
        
        return {
            x: this.playerShip.x + offsetX,
            y: this.playerShip.y + offsetY,
            angle: angle,
            speedX: Math.cos(angle) * this.manualSpeed,
            speedY: Math.sin(angle) * this.manualSpeed
        };
    }
    
    /**
     * Cria o sprite do projétil
     */
    createProjectile(data) {
        const projectile = this.scene.physics.add.sprite(
            data.x, data.y,
            'minibullet',
            'minibullet 0.aseprite'
        );
        
        // Configura propriedades visuais
        projectile.setScale(this.projectileScale);
        projectile.setDepth(1);
        projectile.setOrigin(0.5, 0.5);
        projectile.rotation = data.angle; // Usa o mesmo ângulo do movimento
        
        console.log('🎯 Rotação do projétil:', {
            angle: data.angle,
            angleDegrees: (data.angle * 180 / Math.PI).toFixed(1),
            projectileRotation: projectile.rotation,
            projectileRotationDegrees: (projectile.rotation * 180 / Math.PI).toFixed(1)
        });
        
        // Configura propriedades físicas (igual ao GameScene antigo)
        projectile.body.setAllowGravity(false);
        projectile.setCollideWorldBounds(false);
        
        // Armazena dados de movimento
        projectile.speedX = data.speedX;
        projectile.speedY = data.speedY;
        projectile.angle = data.angle;
        
        // Propriedades do projétil
        projectile.isAlive = true;
        projectile.damage = 25; // Dano padrão
        
        return projectile;
    }
    
    /**
     * Configura movimento do projétil
     * Baseado no GameScene antigo que funcionava
     */
    setupProjectileMovement(projectile, data) {
        // Desabilita física para usar movimento manual
        projectile.body.setEnable(false);
        
        console.log('🚀 Configuração do movimento manual:', {
            angle: data.angle,
            angleDegrees: (data.angle * 180 / Math.PI).toFixed(1),
            speedX: data.speedX.toFixed(1),
            speedY: data.speedY.toFixed(1),
            manualSpeed: this.manualSpeed
        });
        
        // Cria animação do projétil se não existir
        this.ensureProjectileAnimation();
        
        // Inicia animação
        projectile.play('minibullet_anim');
    }
    
    /**
     * Garante que a animação do projétil existe
     */
    ensureProjectileAnimation() {
        if (!this.scene.anims.exists('minibullet_anim')) {
            this.scene.anims.create({
                key: 'minibullet_anim',
                frames: [
                    { key: 'minibullet', frame: 'minibullet 0.aseprite' },
                    { key: 'minibullet', frame: 'minibullet 1.aseprite' }
                ],
                frameRate: 12,
                repeat: -1
            });
        }
    }
    
    /**
     * Adiciona trail effect ao projétil
     */
    addTrailEffect(projectile) {
        if (this.particleEffects) {
            const trailId = this.particleEffects.createProjectileTrail(projectile);
            projectile._trailId = trailId;
            console.log(`💥 Trail effect adicionado: ${trailId}`);
        }
    }
    
    /**
     * Configura destruição automática do projétil
     */
    setupProjectileDestruction(projectile) {
        this.scene.time.delayedCall(this.projectileLifetime, () => {
            if (projectile && projectile.active) {
                this.destroyProjectile(projectile);
            }
        });
    }
    
    /**
     * Atualiza todos os projéteis
     */
    update() {
        console.log(`🚀 ProjectileManager: Update chamado - ${this.projectiles.length} projéteis`);
        
        this.projectiles.forEach((projectile, index) => {
            if (projectile.active && projectile.isAlive) {
                console.log(`🚀 Projétil ${index}: Ativo e vivo, atualizando movimento`);
                this.updateProjectileMovement(projectile);
                this.updateTrailEffect(projectile);
            } else {
                console.log(`🚀 Projétil ${index}: Inativo ou morto - Active: ${projectile.active}, isAlive: ${projectile.isAlive}`);
            }
        });
    }
    
    /**
     * Atualiza movimento do projétil (movimento manual para melhor controle)
     */
    updateProjectileMovement(projectile) {
        if (projectile.speedX !== undefined && projectile.speedY !== undefined) {
            const oldX = projectile.x;
            const oldY = projectile.y;
            
            projectile.x += projectile.speedX;
            projectile.y += projectile.speedY;
            
            // Debug do movimento (sempre por enquanto)
            console.log('🚀 Movimento do projétil:', {
                oldX: oldX.toFixed(1),
                oldY: oldY.toFixed(1),
                newX: projectile.x.toFixed(1),
                newY: projectile.y.toFixed(1),
                speedX: projectile.speedX.toFixed(1),
                speedY: projectile.speedY.toFixed(1),
                isAlive: projectile.isAlive,
                active: projectile.active
            });
        } else {
            console.log('⚠️ Projétil sem speedX/Y:', {
                speedX: projectile.speedX,
                speedY: projectile.speedY,
                isAlive: projectile.isAlive,
                active: projectile.active
            });
        }
    }
    
    /**
     * Atualiza trail effect do projétil
     * Nota: O trail segue automaticamente o projétil via 'follow' property
     */
    updateTrailEffect(projectile) {
        // O trail effect segue automaticamente o projétil
        // Não é necessário atualizar manualmente
    }
    
    /**
     * Destrói um projétil específico com efeitos de explosão
     */
    destroyProjectile(projectile, createExplosion = true) {
        if (!projectile || !projectile.isAlive) return;

        console.log('💥 Projétil destruído com efeitos');

        projectile.isAlive = false;

        // Cria efeitos de explosão (se solicitado)
        if (createExplosion) {
            this.createProjectileExplosion(projectile);
        }

        // Remove trail effect
        if (projectile._trailId && this.particleEffects) {
            this.particleEffects.removeEmitter(projectile._trailId);
        }

        // Remove do sistema de colisões
        if (this.collisionManager) {
            this.collisionManager.removeFromGroup('projectiles', projectile);
        }

        // Destrói o sprite
        if (projectile.active) {
            projectile.destroy();
        }

        // Remove da lista
        const index = this.projectiles.indexOf(projectile);
        if (index > -1) {
            this.projectiles.splice(index, 1);
        }
    }

    /**
     * Cria efeitos de explosão para projéteis
     */
    createProjectileExplosion(projectile) {
        // Animação de explosão (baseado no CollisionManager)
        if (this.scene && this.scene.textures.exists('explosion')) {
            const explosion = this.scene.add.sprite(projectile.x, projectile.y, 'explosion');
            explosion.setDepth(100);

            // Usa a animação de explosão existente ou cria uma nova
            if (this.scene.anims.exists('explosion_anim')) {
                explosion.play('explosion_anim');
            } else {
                // Cria animação de explosão se não existir
                this.createExplosionAnimation();
                explosion.play('explosion_anim');
            }

            explosion.once('animationcomplete', () => {
                explosion.destroy();
            });
        }

        // Efeito de partículas de explosão pequena
        if (this.particleEffects) {
            this.particleEffects.createExplosion(projectile.x, projectile.y, 'small');
        }

        // Efeito de impacto (faíscas)
        if (this.particleEffects) {
            this.particleEffects.createImpactSparks(
                projectile.x, projectile.y,
                Phaser.Math.RadToDeg(projectile.rotation || 0)
            );
        }

        // Screen shake pequeno
        if (this.juiceManager) {
            this.juiceManager.screenShake(30, 1);
        }

        // Som de explosão pequena
        if (this.audioManager) {
            this.audioManager.playExplosion('small');
        }
    }

    /**
     * Cria animação de explosão (baseado no GameSceneModular)
     */
    createExplosionAnimation() {
        if (this.scene.anims.exists('explosion_anim')) return;

        let explosionFrameNames = this.scene.textures.exists('explosion') ?
            this.scene.textures.get('explosion').getFrameNames().filter(n => n !== '__BASE') : [];

        explosionFrameNames = explosionFrameNames.sort((a, b) => {
            const ra = a.match(/(\d+)/g);
            const rb = b.match(/(\d+)/g);
            const na = ra ? parseInt(ra[ra.length-1], 10) : 0;
            const nb = rb ? parseInt(rb[rb.length-1], 10) : 0;
            return na - nb;
        });

        if (explosionFrameNames.length > 0) {
            const explosionFrames = explosionFrameNames.map(fn => ({ key: 'explosion', frame: fn }));

            this.scene.anims.create({
                key: 'explosion_anim',
                frames: explosionFrames,
                frameRate: 15,
                repeat: 0
            });
        }
    }
    
    /**
     * Destrói todos os projéteis
     */
    destroyAllProjectiles() {
        console.log('💥 Destruindo todos os projéteis');
        
        this.projectiles.forEach(projectile => {
            this.destroyProjectile(projectile);
        });
        
        this.projectiles = [];
    }
    
    /**
     * Limpeza de projéteis distantes
     */
    cleanupDistantProjectiles() {
        if (!this.playerShip) return;
        
        const cleanupRadius = 2000; // Raio de limpeza
        
        this.projectiles.forEach((projectile, index) => {
            if (projectile.active) {
                const distance = Phaser.Math.Distance.Between(
                    this.playerShip.x, this.playerShip.y, 
                    projectile.x, projectile.y
                );
                
                if (distance > cleanupRadius) {
                    console.log('💥 Removendo projétil distante');
                    this.destroyProjectile(projectile);
                }
            }
        });
    }
    
    /**
     * Aplica culling para otimização
     */
    cullProjectiles() {
        if (!this.playerShip) return;
        
        const sx = this.playerShip.x;
        const sy = this.playerShip.y;
        const cullRadius = 1200;
        const cullRadiusSquared = cullRadius * cullRadius;
        
        this.projectiles.forEach(projectile => {
            if (!projectile) return;
            
            const dx = projectile.x - sx;
            const dy = projectile.y - sy;
            const distanceSquared = dx * dx + dy * dy;
            const isVisible = distanceSquared <= cullRadiusSquared;
            
            // Atualiza visibilidade
            projectile.setVisible(isVisible);
            
            if (projectile.body) {
                projectile.body.enable = isVisible;
            }
            
            projectile.active = isVisible;
            
            // Trail effect segue automaticamente o projétil
            // Não é necessário atualizar manualmente
            
            // Destrói se muito distante
            if (distanceSquared > (cullRadius * 2) * (cullRadius * 2)) {
                this.destroyProjectile(projectile);
            }
        });
    }
    
    /**
     * Obtém lista de projéteis vivos
     */
    getAliveProjectiles() {
        return this.projectiles.filter(projectile => projectile.active && projectile.isAlive);
    }
    
    /**
     * Obtém contagem de projéteis
     */
    getProjectileCount() {
        return this.projectiles.length;
    }
    
    /**
     * Configura parâmetros de disparo
     */
    setProjectileParameters(params) {
        if (params.projectileSpeed !== undefined) this.projectileSpeed = params.projectileSpeed;
        if (params.projectileLifetime !== undefined) this.projectileLifetime = params.projectileLifetime;
        if (params.projectileScale !== undefined) this.projectileScale = params.projectileScale;
        if (params.maxProjectiles !== undefined) this.maxProjectiles = params.maxProjectiles;
        
        console.log('💥 Parâmetros de projétil atualizados:', params);
    }
    
    /**
     * Cria projétil especial (para efeitos especiais)
     */
    createSpecialProjectile(x, y, angle, options = {}) {
        const projectile = this.scene.physics.add.sprite(x, y, 'minibullet', 'minibullet 0.aseprite');
        
        // Configurações especiais
        const scale = options.scale || this.projectileScale;
        const speed = options.speed || this.projectileSpeed;
        const lifetime = options.lifetime || this.projectileLifetime;
        const damage = options.damage || 25;
        
        projectile.setScale(scale);
        projectile.setDepth(1);
        projectile.setOrigin(0.5, 0.5);
        projectile.rotation = angle;
        projectile.body.setAllowGravity(false);
        projectile.setCollideWorldBounds(false);
        
        // Propriedades
        projectile.speedX = Math.cos(angle) * this.manualSpeed;
        projectile.speedY = Math.sin(angle) * this.manualSpeed;
        projectile.angle = angle;
        projectile.isAlive = true;
        projectile.damage = damage;
        
        // Movimento
        projectile.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        projectile.play('minibullet_anim');
        
        // Trail effect
        if (this.particleEffects) {
            projectile._trailId = this.particleEffects.createProjectileTrail(projectile);
        }
        
        // Adiciona ao sistema
        if (this.collisionManager) {
            this.collisionManager.addToGroup('projectiles', projectile);
        }
        
        this.projectiles.push(projectile);
        
        // Destruição automática
        this.scene.time.delayedCall(lifetime, () => {
            if (projectile && projectile.active) {
                this.destroyProjectile(projectile);
            }
        });
        
        console.log(`💥 Projétil especial criado`);
        return projectile;
    }
    
    /**
     * Destrói o manager e limpa recursos
     */
    destroy() {
        console.log('💥 ProjectileManager: Destruindo...');
        
        // Destrói todos os projéteis
        this.destroyAllProjectiles();
        
        console.log('✅ ProjectileManager: Destruído');
    }
}
