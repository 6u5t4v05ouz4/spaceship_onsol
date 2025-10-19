/**
 * EnemyManager - Gerencia todos os aspectos dos inimigos
 * Responsabilidades:
 * - Spawn e criação de inimigos
 * - Movimento e IA
 * - Barras de vida
 * - Limpeza e culling
 * - Integração com CollisionManager
 */
export default class EnemyManager {
    constructor(scene, collisionManager) {
        this.scene = scene;
        this.collisionManager = collisionManager;
        
        // Estado dos inimigos
        this.enemies = [];
        this.maxEnemies = 3;
        this.spawnTimer = null;
        this.spawnDelay = 25000; // 25 segundos
        
        // Configurações de spawn
        this.spawnDistance = 800;
        this.minHealth = 150;
        this.maxHealth = 250;
        this.minSpeed = 40;
        this.maxSpeed = 120;
        
        // Referência para nave do jogador
        this.playerShip = null;
        
        console.log('🎯 EnemyManager inicializado');
    }
    
    /**
     * Inicializa o sistema de inimigos
     */
    initialize(playerShip) {
        this.playerShip = playerShip;
        console.log('🎯 EnemyManager: Configurando sistema de inimigos');
        
        // Cria inimigos iniciais
        this.createInitialEnemies();
        
        // Configura spawn contínuo
        this.setupSpawnTimer();
        
        console.log('✅ EnemyManager: Sistema inicializado');
    }
    
    /**
     * Cria inimigos iniciais
     */
    createInitialEnemies() {
        const initialCount = 2;
        for (let i = 0; i < initialCount; i++) {
            this.spawnEnemy();
        }
        console.log(`🎯 Criados ${initialCount} inimigos iniciais`);
    }
    
    /**
     * Configura timer de spawn contínuo
     */
    setupSpawnTimer() {
        this.spawnTimer = this.scene.time.addEvent({
            delay: this.spawnDelay,
            callback: () => {
                if (this.enemies.length < this.maxEnemies) {
                    this.spawnEnemy();
                }
            },
            callbackScope: this,
            loop: true
        });
        
        console.log('🎯 Timer de spawn configurado');
    }
    
    /**
     * Cria um novo inimigo
     */
    spawnEnemy() {
        try {
            // Calcula posição de spawn
            const spawnPos = this.calculateSpawnPosition();
            
            // Cria sprite do inimigo
            const enemy = this.scene.physics.add.sprite(spawnPos.x, spawnPos.y, 'enemy');
            enemy.setScale(Phaser.Math.FloatBetween(0.4, 0.6));
            enemy.setDepth(1);
            enemy.play('enemy_thrust');
            
            // Configura propriedades do inimigo
            this.setupEnemyProperties(enemy);
            
            // Cria barra de vida
            this.createHealthBar(enemy);
            
            // Configura movimento
            this.setupEnemyMovement(enemy);
            
            // Adiciona ao sistema de colisões
            if (this.collisionManager) {
                this.collisionManager.addToGroup('enemies', enemy);
            }
            
            // Armazena referência
            this.enemies.push(enemy);
            
            console.log(`🎯 Inimigo criado em (${spawnPos.x.toFixed(0)}, ${spawnPos.y.toFixed(0)})`);
            
        } catch (error) {
            console.error('❌ Erro ao criar inimigo:', error);
        }
    }
    
    /**
     * Calcula posição de spawn segura
     */
    calculateSpawnPosition() {
        // Usar posições fixas baseadas no chunk atual para consistência entre jogadores
        const multiplayerManager = this.scene.multiplayerManager;
        if (multiplayerManager && multiplayerManager.currentChunk) {
            const chunkX = multiplayerManager.currentChunk.x;
            const chunkY = multiplayerManager.currentChunk.y;
            
            // Spawn dentro do chunk atual (1000x1000 unidades)
            const chunkStartX = chunkX * 1000;
            const chunkStartY = chunkY * 1000;
            
            // Posições fixas baseadas em seed para consistência
            const seed = `${chunkX},${chunkY}`;
            const randomX = this.seededRandom(seed, this.enemies.length * 2);
            const randomY = this.seededRandom(seed, this.enemies.length * 2 + 1);
            
            const x = chunkStartX + Math.floor(randomX * 1000);
            const y = chunkStartY + Math.floor(randomY * 1000);
            
            return { x, y };
        }
        
        // Fallback para spawn aleatório no chunk (0,0)
        const x = Phaser.Math.Between(-500, 500);
        const y = Phaser.Math.Between(-500, 500);
        return { x, y };
    }
    
    /**
     * Gera número pseudo-aleatório baseado em seed (mesmo do servidor)
     */
    seededRandom(seed, index) {
        const str = `${seed}-${index}`;
        let hash = 0;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        // Normalizar para 0-1
        return Math.abs(Math.sin(hash)) % 1;
    }
    
    /**
     * Configura propriedades do inimigo
     */
    setupEnemyProperties(enemy) {
        // Saúde
        const baseHealth = Phaser.Math.Between(this.minHealth, this.maxHealth);
        enemy.health = baseHealth;
        enemy.maxHealth = baseHealth;
        
        // Velocidade
        enemy.speed = Phaser.Math.FloatBetween(this.minSpeed, this.maxSpeed);
        
        // Propriedades de movimento
        enemy.lastMoveTime = 0;
        enemy.moveInterval = Phaser.Math.Between(1500, 4000);
        
        // Estado
        enemy.isAlive = true;
        enemy.damageTaken = 0;
        
        console.log(`🎯 Inimigo configurado - Saúde: ${baseHealth}, Velocidade: ${enemy.speed.toFixed(1)}`);
    }
    
    /**
     * Cria barra de vida do inimigo
     */
    createHealthBar(enemy) {
        const healthBarWidth = 40;
        const healthBarHeight = 5;
        
        // Fundo da barra
        enemy.healthBarBg = this.scene.add.rectangle(
            enemy.x, enemy.y + 30, healthBarWidth, healthBarHeight, 0x000000
        ).setOrigin(0.5).setDepth(2);
        
        // Barra de vida
        enemy.healthBar = this.scene.add.rectangle(
            enemy.x, enemy.y + 30, healthBarWidth, healthBarHeight, 0x00ff00
        ).setOrigin(0.5).setDepth(3);
        
        // Armazena dimensões para atualização
        enemy.healthBarWidth = healthBarWidth;
        enemy.healthBarHeight = healthBarHeight;
    }
    
    /**
     * Configura movimento do inimigo
     */
    setupEnemyMovement(enemy) {
        const movementEvent = this.scene.time.addEvent({
            delay: enemy.moveInterval,
            callback: () => {
                if (!enemy || !enemy.active || !enemy.body || !enemy.isAlive) return;
                
                this.updateEnemyMovement(enemy);
            },
            callbackScope: this,
            loop: true
        });
        
        enemy._movementTimer = movementEvent;
    }
    
    /**
     * Atualiza movimento do inimigo
     */
    updateEnemyMovement(enemy) {
        let angle;
        
        // 30% de chance de perseguir o jogador
        if (this.playerShip && Phaser.Math.Between(0, 100) < 30) {
            angle = Phaser.Math.Angle.Between(
                enemy.x, enemy.y, 
                this.playerShip.x, this.playerShip.y
            );
            // Adiciona variação para não ser muito preciso
            angle += Phaser.Math.FloatBetween(-0.5, 0.5);
        } else {
            // Movimento aleatório
            angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        }
        
        // Aplica velocidade
        enemy.setVelocity(
            Math.cos(angle) * enemy.speed,
            Math.sin(angle) * enemy.speed
        );
        
        enemy.lastMoveTime = this.scene.time.now;
    }
    
    /**
     * Atualiza todos os inimigos
     */
    update() {
        this.enemies.forEach(enemy => {
            if (enemy.active && enemy.isAlive) {
                this.updateEnemyVisuals(enemy);
                this.updateEnemyRotation(enemy);
            }
        });
    }
    
    /**
     * Atualiza elementos visuais do inimigo
     */
    updateEnemyVisuals(enemy) {
        // Atualiza posição das barras de vida
        if (enemy.healthBarBg) {
            enemy.healthBarBg.x = enemy.x;
            enemy.healthBarBg.y = enemy.y + 30;
        }
        
        if (enemy.healthBar) {
            enemy.healthBar.x = enemy.x;
            enemy.healthBar.y = enemy.y + 30;
            
            // Atualiza tamanho da barra baseado na saúde
            const healthPercent = enemy.health / enemy.maxHealth;
            const currentWidth = enemy.healthBarWidth * healthPercent;
            
            enemy.healthBar.width = Math.max(0, currentWidth);
            
            // Muda cor baseado na saúde
            if (healthPercent > 0.6) {
                enemy.healthBar.fillColor = 0x00ff00; // Verde
            } else if (healthPercent > 0.3) {
                enemy.healthBar.fillColor = 0xffff00; // Amarelo
            } else {
                enemy.healthBar.fillColor = 0xff0000; // Vermelho
            }
        }
    }
    
    /**
     * Atualiza rotação do inimigo
     */
    updateEnemyRotation(enemy) {
        if (enemy.body && (enemy.body.velocity.x !== 0 || enemy.body.velocity.y !== 0)) {
            // Rotação baseada na direção do movimento
            enemy.rotation = Phaser.Math.Angle.Between(
                enemy.x - enemy.body.velocity.x, 
                enemy.y - enemy.body.velocity.y,
                enemy.x, 
                enemy.y
            ) + Math.PI / 2;
        }
        
        // Rotação constante adicional para efeito visual
        enemy.rotation += 0.01;
    }
    
    /**
     * Aplica dano ao inimigo
     */
    damageEnemy(enemy, damage) {
        if (!enemy || !enemy.isAlive) return false;
        
        enemy.health -= damage;
        enemy.damageTaken += damage;
        
        console.log(`🎯 Inimigo recebeu ${damage} de dano. Saúde restante: ${enemy.health}`);
        
        // Efeito visual de dano
        this.createDamageEffect(enemy);
        
        // Verifica se morreu
        if (enemy.health <= 0) {
            this.killEnemy(enemy);
            return true; // Inimigo morreu
        }
        
        return false; // Inimigo ainda vivo
    }
    
    /**
     * Cria efeito visual de dano
     */
    createDamageEffect(enemy) {
        // Flash branco
        enemy.setTint(0xffffff);
        this.scene.time.delayedCall(100, () => {
            if (enemy && enemy.active) {
                enemy.clearTint();
            }
        });
        
        // Efeito de partículas se disponível
        if (this.scene.particleEffects) {
            this.scene.particleEffects.createHitEffect(enemy.x, enemy.y);
        }
    }
    
    /**
     * Mata o inimigo
     */
    killEnemy(enemy) {
        if (!enemy || !enemy.isAlive) return;
        
        console.log('🎯 Inimigo morto!');
        
        enemy.isAlive = false;
        
        // Para o movimento
        if (enemy._movementTimer) {
            enemy._movementTimer.remove();
        }
        
        // Efeito de explosão
        this.createDeathExplosion(enemy);
        
        // Remove do sistema de colisões
        if (this.collisionManager) {
            this.collisionManager.removeFromGroup('enemies', enemy);
        }
        
        // Remove barras de vida
        if (enemy.healthBarBg) enemy.healthBarBg.destroy();
        if (enemy.healthBar) enemy.healthBar.destroy();
        
        // Destrói o inimigo
        this.scene.time.delayedCall(500, () => {
            if (enemy && enemy.active) {
                enemy.destroy();
            }
        });
        
        // Remove da lista
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
    }
    
    /**
     * Cria explosão de morte
     */
    createDeathExplosion(enemy) {
        if (this.scene.particleEffects) {
            this.scene.particleEffects.createExplosion(enemy.x, enemy.y, 'medium');
        }
        
        if (this.scene.audioManager) {
            this.scene.audioManager.playExplosion('medium');
        }
        
        // Efeito de tela shake
        if (this.scene.juiceManager) {
            this.scene.juiceManager.screenShake(20, 0.5);
        }
    }
    
    /**
     * Aplica culling para otimização
     */
    cullEnemies() {
        if (!this.playerShip) return;
        
        const sx = this.playerShip.x;
        const sy = this.playerShip.y;
        const cullRadius = 1200;
        const cullRadiusSquared = cullRadius * cullRadius;
        
        this.enemies.forEach(enemy => {
            if (!enemy) return;
            
            const dx = enemy.x - sx;
            const dy = enemy.y - sy;
            const distanceSquared = dx * dx + dy * dy;
            const isVisible = distanceSquared <= cullRadiusSquared;
            
            // Atualiza visibilidade
            enemy.setVisible(isVisible);
            
            if (enemy.body) {
                enemy.body.enable = isVisible;
            }
            
            enemy.active = isVisible;
            
            // Controla animação baseado na visibilidade
            if (isVisible) {
                if (enemy.anims && !enemy.anims.isPlaying) {
                    enemy.play('enemy_thrust', true);
                }
            } else {
                if (enemy.anims && enemy.anims.isPlaying) {
                    enemy.anims.pause();
                }
            }
        });
    }
    
    /**
     * Limpeza de inimigos distantes
     */
    cleanupDistantEnemies() {
        if (!this.playerShip) return;
        
        const cleanupRadius = 3600; // 3x cull radius
        
        this.enemies.forEach((enemy, index) => {
            if (enemy.active) {
                const distance = Phaser.Math.Distance.Between(
                    this.playerShip.x, this.playerShip.y, 
                    enemy.x, enemy.y
                );
                
                if (distance > cleanupRadius) {
                    console.log('🎯 Removendo inimigo distante');
                    this.killEnemy(enemy);
                }
            }
        });
    }
    
    /**
     * Obtém lista de inimigos vivos
     */
    getAliveEnemies() {
        return this.enemies.filter(enemy => enemy.active && enemy.isAlive);
    }
    
    /**
     * Obtém contagem de inimigos
     */
    getEnemyCount() {
        return this.enemies.length;
    }
    
    /**
     * Destrói o manager e limpa recursos
     */
    destroy() {
        console.log('🎯 EnemyManager: Destruindo...');
        
        // Para timer de spawn
        if (this.spawnTimer) {
            this.spawnTimer.remove();
        }
        
        // Destrói todos os inimigos
        this.enemies.forEach(enemy => {
            if (enemy._movementTimer) {
                enemy._movementTimer.remove();
            }
            if (enemy.healthBarBg) enemy.healthBarBg.destroy();
            if (enemy.healthBar) enemy.healthBar.destroy();
            if (enemy.active) enemy.destroy();
        });
        
        // Limpa arrays
        this.enemies = [];
        
        console.log('✅ EnemyManager: Destruído');
    }
}
