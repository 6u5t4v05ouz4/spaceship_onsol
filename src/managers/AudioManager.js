/**
 * AudioManager - Gerenciamento avançado de áudio com variações e camadas
 * 
 * Features:
 * - Variação de pitch aleatória
 * - Pooling de sons para performance
 * - Controle de volume por categoria
 * - Fade in/out
 */
export default class AudioManager {
    constructor(scene) {
        this.scene = scene;
        
        // Categorias de volume
        this.volumes = {
            master: 1.0,
            music: 0.6,
            sfx: 0.8,
            ui: 0.5
        };
        
        // Pool de sons para evitar criar/destruir constantemente
        this.soundPool = new Map();
    }
    
    /**
     * Reproduz um som com variação de pitch
     * @param {string} key - Chave do som
     * @param {object} options - Opções (volume, pitchVariation, category)
     */
    play(key, options = {}) {
        const {
            volume = 1.0,
            pitchVariation = 0.1, // Variação de pitch (0 = sem variação)
            category = 'sfx',
            loop = false
        } = options;
        
        // Calcula o volume final
        const finalVolume = volume * this.volumes[category] * this.volumes.master;
        
        // Calcula o pitch (rate) com variação aleatória
        const basePitch = 1.0;
        const randomPitch = basePitch + (Math.random() * 2 - 1) * pitchVariation;
        
        try {
            const sound = this.scene.sound.add(key, {
                volume: finalVolume,
                rate: randomPitch,
                loop: loop
            });
            
            sound.play();
            
            // Auto-destruição após terminar (se não for loop)
            if (!loop) {
                sound.once('complete', () => sound.destroy());
            }
            
            return sound;
        } catch (error) {
            console.warn(`Erro ao reproduzir som ${key}:`, error);
            return null;
        }
    }
    
    /**
     * Reproduz som de explosão com variação
     */
    playExplosion(size = 'medium') {
        const pitchVariations = {
            small: { variation: 0.2, volume: 0.4 },
            medium: { variation: 0.15, volume: 0.6 },
            large: { variation: 0.1, volume: 0.8 }
        };
        
        const config = pitchVariations[size] || pitchVariations.medium;
        
        this.play('explosion', {
            volume: config.volume,
            pitchVariation: config.variation,
            category: 'sfx'
        });
    }
    
    /**
     * Reproduz som de tiro com variação
     */
    playShoot() {
        this.play('bullet', {
            volume: 0.3,
            pitchVariation: 0.25,
            category: 'sfx'
        });
    }
    
    /**
     * Reproduz som de impacto
     */
    playImpact(strength = 1.0) {
        // Se não tiver som específico de impacto, usa explosão pequena
        this.play('explosion', {
            volume: 0.3 * strength,
            pitchVariation: 0.3,
            category: 'sfx'
        });
    }
    
    /**
     * Reproduz som ambiente com loop
     */
    playAmbient(key, volume = 0.3) {
        const sound = this.play(key, {
            volume: volume,
            pitchVariation: 0,
            category: 'music',
            loop: true
        });
        
        // Armazena para controle posterior
        if (sound) {
            this.soundPool.set(`ambient_${key}`, sound);
        }
        
        return sound;
    }
    
    /**
     * Para um som específico com fade out
     */
    stop(key, fadeTime = 0) {
        const sound = this.soundPool.get(key);
        if (!sound) return;
        
        if (fadeTime > 0) {
            this.scene.tweens.add({
                targets: sound,
                volume: 0,
                duration: fadeTime,
                onComplete: () => {
                    sound.stop();
                    sound.destroy();
                    this.soundPool.delete(key);
                }
            });
        } else {
            sound.stop();
            sound.destroy();
            this.soundPool.delete(key);
        }
    }
    
    /**
     * Define volume de uma categoria
     */
    setVolume(category, volume) {
        this.volumes[category] = Phaser.Math.Clamp(volume, 0, 1);
        
        // Atualiza todos os sons ativos dessa categoria
        this.soundPool.forEach((sound, key) => {
            if (key.startsWith(category)) {
                sound.setVolume(volume * this.volumes.master);
            }
        });
    }
    
    /**
     * Define volume master
     */
    setMasterVolume(volume) {
        this.volumes.master = Phaser.Math.Clamp(volume, 0, 1);
        this.scene.sound.volume = this.volumes.master;
    }
    
    /**
     * Para todos os sons
     */
    stopAll() {
        this.scene.sound.stopAll();
        this.soundPool.forEach(sound => sound.destroy());
        this.soundPool.clear();
    }
    
    /**
     * Cleanup ao destruir a cena
     */
    destroy() {
        this.stopAll();
    }
}

