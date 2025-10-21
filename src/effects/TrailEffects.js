/**
 * TrailEffects - Sistema de rastros e trilhas visuais
 * 
 * Cria rastros suaves atrás de objetos em movimento usando:
 * - Graphics trails (linhas)
 * - Sprite trails (clones com fade)
 * - Motion blur effect
 */
export default class TrailEffects {
    constructor(scene) {
        this.scene = scene;
        this.trails = new Map();
        this.graphics = this.scene.add.graphics();
        this.graphics.setDepth(5);
    }

    /**
     * Atualiza todos os trails (chamado no update do jogo)
     */
    update(time, delta) {
        // Limpa e redesenha todos os trails
        this.graphics.clear();

        // Renderiza todos os trails de linha
        this.trails.forEach((trail, id) => {
            if (trail.type === 'line' && trail.points.length > 1) {
                this.graphics.lineStyle(trail.width, trail.color, trail.alpha);
                this.graphics.beginPath();

                for (let i = 0; i < trail.points.length; i++) {
                    const point = trail.points[i];
                    if (i === 0) {
                        this.graphics.moveTo(point.x, point.y);
                    } else {
                        this.graphics.lineTo(point.x, point.y);
                    }
                }

                this.graphics.strokePath();
            }
        });
    }
    
    /**
     * Cria um trail de linha atrás de um objeto
     * @param {string} id - ID único do trail
     * @param {number} maxPoints - Número máximo de pontos no trail
     * @param {number} color - Cor da linha
     * @param {number} alpha - Transparência
     * @param {number} width - Largura da linha
     */
    createLineTrail(id, maxPoints = 8, color = 0x00ccff, alpha = 0.6, width = 2) {
        this.trails.set(id, {
            type: 'line',
            points: [],
            maxPoints: maxPoints,
            color: color,
            alpha: alpha,
            width: width
        });
    }
    
    /**
     * Atualiza a posição do trail de linha
     * @param {string} id - ID do trail
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     */
    updateLineTrail(id, x, y) {
        const trail = this.trails.get(id);
        if (!trail || trail.type !== 'line') return;
        
        // Adiciona novo ponto
        trail.points.push({ x, y });
        
        // Remove pontos antigos se exceder o máximo
        if (trail.points.length > trail.maxPoints) {
            trail.points.shift();
        }
    }
    
    /**
     * Renderiza todos os trails de linha (deve ser chamado no update)
     */
    renderLineTrails() {
        this.graphics.clear();
        
        this.trails.forEach((trail, id) => {
            if (trail.type !== 'line' || trail.points.length < 2) return;
            
            // Desenha a linha com fade gradual
            for (let i = 0; i < trail.points.length - 1; i++) {
                const p1 = trail.points[i];
                const p2 = trail.points[i + 1];
                
                // Alpha diminui quanto mais antigo o ponto
                const alphaFactor = i / trail.points.length;
                const currentAlpha = trail.alpha * alphaFactor;
                
                this.graphics.lineStyle(trail.width, trail.color, currentAlpha);
                this.graphics.lineBetween(p1.x, p1.y, p2.x, p2.y);
            }
        });
    }
    
    /**
     * Cria um trail de sprites (clones que desaparecem)
     * @param {Phaser.GameObjects.Sprite} sprite - Sprite original
     * @param {object} options - Opções do trail
     */
    createSpriteTrail(sprite, options = {}) {
        const {
            frequency = 50,      // Frequência de criação (ms)
            lifespan = 300,      // Tempo de vida de cada clone (ms)
            alphaStart = 0.6,    // Alpha inicial
            alphaEnd = 0,        // Alpha final
            tint = null,         // Tint opcional
            scaleStart = 1,      // Escala inicial
            scaleEnd = 0.8       // Escala final
        } = options;
        
        const timer = this.scene.time.addEvent({
            delay: frequency,
            callback: () => {
                // Cria clone do sprite
                const clone = this.scene.add.sprite(sprite.x, sprite.y, sprite.texture.key, sprite.frame.name);
                clone.setRotation(sprite.rotation);
                clone.setScale(sprite.scaleX * scaleStart, sprite.scaleY * scaleStart);
                clone.setAlpha(alphaStart);
                clone.setDepth(sprite.depth - 1);
                
                if (tint !== null) {
                    clone.setTint(tint);
                }
                
                // Animação de fade + escala
                this.scene.tweens.add({
                    targets: clone,
                    alpha: alphaEnd,
                    scaleX: sprite.scaleX * scaleEnd,
                    scaleY: sprite.scaleY * scaleEnd,
                    duration: lifespan,
                    ease: 'Linear',
                    onComplete: () => clone.destroy()
                });
            },
            loop: true
        });
        
        const id = `sprite_trail_${Date.now()}_${Math.random()}`;
        this.trails.set(id, {
            type: 'sprite',
            timer: timer,
            sprite: sprite
        });
        
        return id;
    }
    
    /**
     * Para e remove um trail de sprite
     */
    removeSpriteTrail(id) {
        const trail = this.trails.get(id);
        if (!trail || trail.type !== 'sprite') return;
        
        trail.timer.remove();
        this.trails.delete(id);
    }
    
    /**
     * Cria efeito de motion blur em um objeto
     * @param {Phaser.GameObjects.Sprite} sprite - Sprite alvo
     * @param {number} intensity - Intensidade do blur (1-5)
     */
    createMotionBlur(sprite, intensity = 3) {
        const id = `blur_${Date.now()}_${Math.random()}`;
        
        // Armazena posições anteriores
        const positions = [];
        const maxPositions = intensity;
        
        const updateCallback = () => {
            positions.push({ x: sprite.x, y: sprite.y, rotation: sprite.rotation });
            
            if (positions.length > maxPositions) {
                positions.shift();
            }
            
            // Cria clones transparentes nas posições anteriores
            positions.forEach((pos, index) => {
                const alpha = (index / maxPositions) * 0.3;
                const clone = this.scene.add.sprite(pos.x, pos.y, sprite.texture.key, sprite.frame.name);
                clone.setRotation(pos.rotation);
                clone.setAlpha(alpha);
                clone.setDepth(sprite.depth - 1);
                
                // Destrói rapidamente
                this.scene.time.delayedCall(50, () => clone.destroy());
            });
        };
        
        // Armazena para poder remover depois
        this.trails.set(id, {
            type: 'blur',
            updateCallback: updateCallback
        });
        
        return id;
    }
    
    /**
     * Remove um trail de linha
     */
    removeLineTrail(id) {
        this.trails.delete(id);
    }
    
    /**
     * Remove qualquer tipo de trail
     */
    removeTrail(id) {
        const trail = this.trails.get(id);
        if (!trail) return;
        
        if (trail.type === 'sprite' && trail.timer) {
            trail.timer.remove();
        }
        
        this.trails.delete(id);
    }
    
    /**
     * Limpa todos os trails
     */
    cleanup() {
        this.trails.forEach((trail, id) => {
            if (trail.type === 'sprite' && trail.timer) {
                trail.timer.remove();
            }
        });
        
        this.trails.clear();
        this.graphics.clear();
    }
}

