/**
 * UIAnimations - Animações suaves e satisfatórias para elementos de UI
 * 
 * Features:
 * - Counter animations (números que sobem/descem suavemente)
 * - Bar drain/fill animations
 * - Pulse effects
 * - Float text (damage numbers, +crypto)
 * - Achievement popups
 */
export default class UIAnimations {
    constructor(scene) {
        this.scene = scene;
        this.floatingTexts = [];
    }
    
    /**
     * Anima um contador de número (ex: crypto balance)
     * @param {Phaser.GameObjects.Text} textObject - Objeto de texto
     * @param {number} from - Valor inicial
     * @param {number} to - Valor final
     * @param {number} duration - Duração em ms
     * @param {function} formatter - Função para formatar o número
     */
    animateCounter(textObject, from, to, duration = 500, formatter = null) {
        const data = { value: from };
        
        this.scene.tweens.add({
            targets: data,
            value: to,
            duration: duration,
            ease: 'Cubic.easeOut',
            onUpdate: () => {
                const displayValue = formatter ? formatter(data.value) : data.value.toFixed(2);
                textObject.setText(displayValue);
            }
        });
    }
    
    /**
     * Anima uma barra de vida/combustível (smooth drain/fill)
     * @param {Phaser.GameObjects.Rectangle} barObject - Objeto da barra
     * @param {number} from - Valor inicial (0-1)
     * @param {number} to - Valor final (0-1)
     * @param {number} duration - Duração em ms
     * @param {string} easing - Tipo de easing
     */
    animateBar(barObject, from, to, duration = 300, easing = 'Cubic.easeOut') {
        // Salva a largura original
        if (!barObject.originalWidth) {
            barObject.originalWidth = barObject.width;
        }
        
        this.scene.tweens.add({
            targets: barObject,
            scaleX: to,
            duration: duration,
            ease: easing
        });
    }
    
    /**
     * Cria texto flutuante (ex: +50 crypto, -10 HP)
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     * @param {string} text - Texto a exibir
     * @param {object} options - Opções de estilo e animação
     */
    createFloatingText(x, y, text, options = {}) {
        const {
            color = '#ffffff',
            fontSize = '24px',
            duration = 1500,
            distance = 80,
            fadeDelay = 500
        } = options;
        
        const floatText = this.scene.add.text(x, y, text, {
            fontFamily: 'Arial',
            fontSize: fontSize,
            color: color,
            stroke: '#000000',
            strokeThickness: 4,
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1000);
        
        // Adiciona à lista de textos flutuantes
        this.floatingTexts.push(floatText);
        
        // Animação de movimento para cima
        this.scene.tweens.add({
            targets: floatText,
            y: y - distance,
            duration: duration,
            ease: 'Cubic.easeOut'
        });
        
        // Animação de fade out
        this.scene.tweens.add({
            targets: floatText,
            alpha: 0,
            duration: duration - fadeDelay,
            delay: fadeDelay,
            onComplete: () => {
                floatText.destroy();
                const index = this.floatingTexts.indexOf(floatText);
                if (index > -1) {
                    this.floatingTexts.splice(index, 1);
                }
            }
        });
        
        return floatText;
    }
    
    /**
     * Mostra ganho de crypto com animação
     */
    showCryptoGain(x, y, amount) {
        const text = `+${amount.toFixed(2)} ⬡`;
        return this.createFloatingText(x, y, text, {
            color: '#00ff00',
            fontSize: '20px',
            duration: 1200,
            distance: 60
        });
    }
    
    /**
     * Mostra dano recebido
     */
    showDamage(x, y, amount) {
        const text = `-${Math.round(amount)}`;
        return this.createFloatingText(x, y, text, {
            color: '#ff0000',
            fontSize: '28px',
            duration: 1000,
            distance: 50
        });
    }
    
    /**
     * Cria efeito de pulso em um objeto (scale bounce)
     * @param {Phaser.GameObjects.GameObject} target - Objeto alvo
     * @param {number} scale - Escala máxima
     * @param {number} duration - Duração em ms
     * @param {number} repeat - Número de repetições (-1 = infinito)
     */
    pulse(target, scale = 1.1, duration = 300, repeat = 0) {
        // Cancela pulsos anteriores
        this.scene.tweens.killTweensOf(target);
        
        return this.scene.tweens.add({
            targets: target,
            scale: scale,
            duration: duration / 2,
            yoyo: true,
            repeat: repeat,
            ease: 'Sine.easeInOut'
        });
    }
    
    /**
     * Efeito de shake em texto (quando algo importante acontece)
     */
    shakeText(textObject, intensity = 5, duration = 200) {
        const originalX = textObject.x;
        const originalY = textObject.y;
        
        const shakeInterval = this.scene.time.addEvent({
            delay: 16,
            repeat: duration / 16,
            callback: () => {
                textObject.x = originalX + Phaser.Math.Between(-intensity, intensity);
                textObject.y = originalY + Phaser.Math.Between(-intensity, intensity);
            },
            callbackScope: this
        });
        
        this.scene.time.delayedCall(duration, () => {
            shakeInterval.remove();
            textObject.x = originalX;
            textObject.y = originalY;
        });
    }
    
    /**
     * Mostra popup de achievement/notificação
     * @param {string} title - Título
     * @param {string} description - Descrição
     * @param {number} duration - Tempo em tela (ms)
     */
    showAchievement(title, description, duration = 3000) {
        const centerX = this.scene.cameras.main.width / 2;
        const startY = -150;
        const targetY = 100;
        
        // Container do achievement
        const container = this.scene.add.container(centerX, startY);
        container.setDepth(2000);
        container.setScrollFactor(0);
        
        // Background
        const bg = this.scene.add.rectangle(0, 0, 400, 100, 0x001a18, 0.95);
        bg.setStrokeStyle(2, 0x00ffcc);
        
        // Título
        const titleText = this.scene.add.text(0, -20, title, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#00ffcc',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Descrição
        const descText = this.scene.add.text(0, 15, description, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#aef7ee'
        }).setOrigin(0.5);
        
        container.add([bg, titleText, descText]);
        
        // Animação de entrada (slide down)
        this.scene.tweens.add({
            targets: container,
            y: targetY,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // Animação de saída (slide up + fade)
        this.scene.time.delayedCall(duration, () => {
            this.scene.tweens.add({
                targets: container,
                y: startY,
                alpha: 0,
                duration: 400,
                ease: 'Back.easeIn',
                onComplete: () => container.destroy()
            });
        });
        
        return container;
    }
    
    /**
     * Efeito de glow pulsante em texto (ex: quando vida está baixa)
     */
    glowPulse(textObject, color = '#ff0000') {
        // Remove glow anterior se existir
        this.scene.tweens.killTweensOf(textObject);
        
        const data = { glowAlpha: 0 };
        
        return this.scene.tweens.add({
            targets: data,
            glowAlpha: 1,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                // Simula glow mudando o shadow blur
                textObject.setShadow(0, 0, color, 10 * data.glowAlpha, false, true);
            }
        });
    }
    
    /**
     * Remove o efeito de glow
     */
    removeGlow(textObject) {
        this.scene.tweens.killTweensOf(textObject);
        textObject.setShadow(0, 0, 'transparent', 0);
    }
    
    /**
     * Limpa todos os textos flutuantes
     */
    cleanup() {
        this.floatingTexts.forEach(text => {
            if (text && text.active) {
                text.destroy();
            }
        });
        this.floatingTexts = [];
    }
}

