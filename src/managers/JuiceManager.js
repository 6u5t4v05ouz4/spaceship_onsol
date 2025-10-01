import Phaser from 'phaser';

/**
 * JuiceManager - Sistema centralizado para gerenciar todos os efeitos de game feel
 * 
 * Este manager coordena:
 * - Screen shake (tremor de câmera)
 * - Flash effects (efeitos de flash)
 * - Time scale (slow motion)
 * - Configurações de intensidade
 */
export default class JuiceManager {
    constructor(scene) {
        this.scene = scene;
        
        // Configurações de intensidade (0 a 1)
        this.config = {
            screenShake: 1.0,      // Intensidade do screen shake
            flashEffects: 1.0,     // Intensidade dos flashes
            particles: 1.0,        // Intensidade das partículas
            slowMotion: 1.0,       // Intensidade do slow motion
            soundEffects: 1.0,     // Volume dos efeitos sonoros
            enabled: true          // Master switch
        };
        
        // Estado do screen shake
        this.shakeState = {
            duration: 0,
            intensity: 0,
            originalX: 0,
            originalY: 0
        };
    }
    
    /**
     * Screen Shake - Tremor de câmera
     * @param {number} duration - Duração em ms
     * @param {number} intensity - Intensidade (0-10)
     */
    screenShake(duration = 200, intensity = 5) {
        if (!this.config.enabled || this.config.screenShake === 0) return;
        
        const camera = this.scene.cameras.main;
        const adjustedIntensity = intensity * this.config.screenShake;
        
        camera.shake(duration, adjustedIntensity * 0.01);
    }
    
    /**
     * Flash Effect - Efeito de flash na tela
     * @param {number} duration - Duração em ms
     * @param {number} color - Cor hex (ex: 0xffffff)
     * @param {number} alpha - Opacidade (0-1)
     */
    flash(duration = 100, color = 0xffffff, alpha = 0.5) {
        if (!this.config.enabled || this.config.flashEffects === 0) return;
        
        const camera = this.scene.cameras.main;
        const adjustedAlpha = alpha * this.config.flashEffects;
        
        camera.flash(duration, 
            ((color >> 16) & 0xff),  // R
            ((color >> 8) & 0xff),   // G
            (color & 0xff),          // B
            false,
            null,
            adjustedAlpha
        );
    }
    
    /**
     * Slow Motion - Reduz temporariamente o time scale
     * @param {number} duration - Duração em ms
     * @param {number} scale - Escala de tempo (0-1)
     */
    slowMotion(duration = 200, scale = 0.3) {
        if (!this.config.enabled || this.config.slowMotion === 0) return;
        
        const adjustedScale = 1 - ((1 - scale) * this.config.slowMotion);
        
        this.scene.time.timeScale = adjustedScale;
        
        this.scene.time.delayedCall(duration, () => {
            this.scene.time.timeScale = 1;
        });
    }
    
    /**
     * Impact Effect - Combinação de shake + flash + slowmo
     * @param {number} intensity - Intensidade (small, medium, large)
     */
    impactEffect(intensity = 'medium') {
        const presets = {
            small: { shake: 3, flash: 80, flashAlpha: 0.3, slowDuration: 0 },
            medium: { shake: 6, flash: 120, flashAlpha: 0.5, slowDuration: 100 },
            large: { shake: 10, flash: 200, flashAlpha: 0.7, slowDuration: 200 }
        };
        
        const preset = presets[intensity] || presets.medium;
        
        this.screenShake(preset.flash, preset.shake);
        this.flash(preset.flash, 0xffffff, preset.flashAlpha);
        
        if (preset.slowDuration > 0) {
            this.slowMotion(preset.slowDuration, 0.5);
        }
    }
    
    /**
     * Damage Flash - Flash vermelho quando o jogador toma dano
     * @param {Phaser.GameObjects.Sprite} sprite - Sprite que vai piscar
     * @param {number} duration - Duração em ms
     */
    damageFlash(sprite, duration = 100) {
        if (!this.config.enabled) return;
        
        // Salva o tint original
        const originalTint = sprite.tintTopLeft;
        
        // Aplica tint vermelho
        sprite.setTint(0xff0000);
        
        // Remove o tint após a duração
        this.scene.time.delayedCall(duration, () => {
            sprite.clearTint();
            if (originalTint !== 0xffffff) {
                sprite.setTint(originalTint);
            }
        });
    }
    
    /**
     * Pulse Effect - Faz um objeto pulsar (escalar)
     * @param {Phaser.GameObjects.GameObject} target - Objeto alvo
     * @param {number} scale - Escala máxima
     * @param {number} duration - Duração em ms
     */
    pulse(target, scale = 1.2, duration = 300) {
        if (!this.config.enabled) return;
        
        const originalScale = target.scale;
        
        this.scene.tweens.add({
            targets: target,
            scale: scale,
            duration: duration / 2,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }
    
    /**
     * Fade In Effect - Fade in suave
     */
    fadeIn(duration = 500) {
        this.scene.cameras.main.fadeIn(duration, 0, 0, 0);
    }
    
    /**
     * Fade Out Effect - Fade out suave
     */
    fadeOut(duration = 500, callback = null) {
        this.scene.cameras.main.fadeOut(duration, 0, 0, 0);
        
        if (callback) {
            this.scene.time.delayedCall(duration, callback);
        }
    }
    
    /**
     * Atualiza as configurações
     */
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
    
    /**
     * Retorna as configurações atuais
     */
    getConfig() {
        return { ...this.config };
    }
}

