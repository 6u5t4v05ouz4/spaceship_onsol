import Phaser from 'phaser';

/**
 * ParticleEffects - Sistema de partículas para diversos efeitos visuais
 * 
 * Gerencia:
 * - Propulsão da nave
 * - Explosões
 * - Trilhas de projéteis
 * - Efeitos de mineração
 * - Debris
 */
export default class ParticleEffects {
    constructor(scene) {
        this.scene = scene;
        this.emitters = new Map(); // Armazena emitters ativos
        
        // Cria texturas procedurais para partículas
        this.createParticleTextures();
    }
    
    /**
     * Cria texturas procedurais para partículas
     */
    createParticleTextures() {
        // Partícula básica (círculo branco)
        if (!this.scene.textures.exists('particle_basic')) {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(4, 4, 4);
            graphics.generateTexture('particle_basic', 8, 8);
            graphics.destroy();
        }
        
        // Partícula de faísca (alongada)
        if (!this.scene.textures.exists('particle_spark')) {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(0, 0, 8, 2);
            graphics.generateTexture('particle_spark', 8, 2);
            graphics.destroy();
        }
        
        // Partícula quadrada (debris)
        if (!this.scene.textures.exists('particle_square')) {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(0, 0, 4, 4);
            graphics.generateTexture('particle_square', 4, 4);
            graphics.destroy();
        }
    }
    
    /**
     * Cria efeito de propulsão para a nave
     * @param {Phaser.GameObjects.Sprite} ship - Sprite da nave
     * @returns {string} ID do emitter
     */
    createThrustEffect(ship) {
        const emitter = this.scene.add.particles(0, 0, 'particle_basic', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 300,
            frequency: 60, // Reduzido de 30 para 60 (menos partículas)
            tint: [0xff6600, 0xff9900, 0x00ccff],
            blendMode: 'ADD',
            follow: ship,
            followOffset: { x: 0, y: 0 }, // Será atualizado dinamicamente
            emitting: false
        });
        
        emitter.setDepth(ship.depth - 1);
        
        const id = `thrust_${Date.now()}`;
        this.emitters.set(id, { emitter, ship });
        
        return id;
    }
    
    /**
     * Atualiza a posição do efeito de propulsão
     * Deve ser chamado no update() quando a nave rotaciona
     */
    updateThrustEffect(id) {
        const data = this.emitters.get(id);
        if (!data) return;
        
        const { emitter, ship } = data;
        
        // Calcula a posição oposta à direção da nave
        const angle = ship.rotation - Math.PI / 2;
        const offsetDistance = 20; // Distância da traseira da nave
        
        const offsetX = -Math.cos(angle) * offsetDistance;
        const offsetY = -Math.sin(angle) * offsetDistance;
        
        emitter.setPosition(ship.x + offsetX, ship.y + offsetY);
        
        // Atualiza a direção das partículas (oposta ao movimento)
        emitter.setAngle({ min: Phaser.Math.RadToDeg(angle) + 160, max: Phaser.Math.RadToDeg(angle) + 200 });
    }
    
    /**
     * Liga/desliga o efeito de propulsão
     */
    setThrustEmitting(id, emitting) {
        const data = this.emitters.get(id);
        if (!data) return;
        data.emitter.setVisible(emitting);
        data.emitter.emitting = emitting;
    }
    
    /**
     * Cria explosão de partículas
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     * @param {string} type - Tipo: 'small', 'medium', 'large'
     */
    createExplosion(x, y, type = 'medium') {
        const configs = {
            small: {
                particleCount: 5, // Reduzido de 15 para 5
                speed: { min: 50, max: 150 },
                scale: { start: 0.4, end: 0 },
                lifespan: 300 // Reduzido de 400 para 300
            },
            medium: {
                particleCount: 10, // Reduzido de 30 para 10
                speed: { min: 100, max: 250 },
                scale: { start: 0.6, end: 0 }, // Reduzido de 0.8 para 0.6
                lifespan: 400 // Reduzido de 600 para 400
            },
            large: {
                particleCount: 15, // Reduzido de 50 para 15
                speed: { min: 150, max: 350 },
                scale: { start: 0.8, end: 0 }, // Reduzido de 1.2 para 0.8
                lifespan: 500 // Reduzido de 800 para 500
            }
        };
        
        const config = configs[type] || configs.medium;
        
        // Partículas principais (fogo)
        const fireEmitter = this.scene.add.particles(x, y, 'particle_basic', {
            speed: config.speed,
            scale: config.scale,
            alpha: { start: 1, end: 0 },
            lifespan: config.lifespan,
            tint: [0xff0000, 0xff6600, 0xff9900, 0xffcc00],
            blendMode: 'ADD',
            quantity: config.particleCount,
            emitting: false
        });
        
        fireEmitter.setDepth(100);
        fireEmitter.explode();
        
        // Debris (quadrados)
        const debrisEmitter = this.scene.add.particles(x, y, 'particle_square', {
            speed: { min: config.speed.min * 0.6, max: config.speed.max * 0.6 },
            scale: { start: 0.8, end: 0.2 },
            alpha: { start: 1, end: 0 },
            lifespan: config.lifespan * 1.5,
            tint: [0x666666, 0x888888, 0xaaaaaa],
            rotate: { min: 0, max: 360 },
            quantity: Math.floor(config.particleCount * 0.5),
            emitting: false
        });
        
        debrisEmitter.setDepth(99);
        debrisEmitter.explode();
        
        // Auto-destruição após completar
        this.scene.time.delayedCall(config.lifespan * 2, () => {
            fireEmitter.destroy();
            debrisEmitter.destroy();
        });
    }
    
    /**
     * Cria faíscas de impacto
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     * @param {number} angle - Ângulo de impacto
     */
    createImpactSparks(x, y, angle = 0) {
        const emitter = this.scene.add.particles(x, y, 'particle_spark', {
            speed: { min: 100, max: 200 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 300,
            angle: { min: angle - 45, max: angle + 45 },
            tint: [0xffff00, 0xffffff, 0xff9900],
            blendMode: 'ADD',
            quantity: 8,
            emitting: false
        });
        
        emitter.setDepth(101);
        emitter.explode();
        
        this.scene.time.delayedCall(600, () => emitter.destroy());
    }
    
    /**
     * Cria efeito de mineração (partículas saindo do planeta)
     * @param {number} x - Posição X do planeta
     * @param {number} y - Posição Y do planeta
     * @param {number} targetX - Posição X da nave
     * @param {number} targetY - Posição Y da nave
     */
    createMiningEffect(x, y, targetX, targetY) {
        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        
        const emitter = this.scene.add.particles(x, y, 'particle_basic', {
            speed: 150,
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 800,
            angle: { min: Phaser.Math.RadToDeg(angle) - 15, max: Phaser.Math.RadToDeg(angle) + 15 },
            tint: [0x00ff00, 0x00ffcc, 0xffff00],
            blendMode: 'ADD',
            frequency: 200,
            quantity: 1
        });
        
        emitter.setDepth(10);
        
        // Auto-destruição
        this.scene.time.delayedCall(1000, () => emitter.destroy());
    }
    
    /**
     * Cria trilha para projéteis
     * @param {Phaser.GameObjects.Sprite} projectile - Projétil
     * @returns {string} ID do emitter
     */
    createProjectileTrail(projectile) {
        const emitter = this.scene.add.particles(0, 0, 'particle_basic', {
            speed: 10,
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.4, end: 0 },
            lifespan: 150, // Reduzido de 200 para 150
            frequency: 40, // Reduzido de 20 para 40 (menos partículas)
            tint: [0x00ccff],
            blendMode: 'ADD',
            follow: projectile,
            emitting: true
        });
        
        emitter.setDepth(projectile.depth - 1);
        
        const id = `trail_${Date.now()}_${Math.random()}`;
        this.emitters.set(id, { emitter, projectile });
        
        return id;
    }
    
    /**
     * Remove um emitter e limpa recursos
     */
    removeEmitter(id) {
        const data = this.emitters.get(id);
        if (!data) return;
        
        data.emitter.destroy();
        this.emitters.delete(id);
    }
    
    /**
     * Limpa todos os emitters
     */
    cleanup() {
        this.emitters.forEach(data => data.emitter.destroy());
        this.emitters.clear();
    }
}

