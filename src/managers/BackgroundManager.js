/**
 * BackgroundManager - Gerencia o fundo do espaço com múltiplas camadas de estrelas
 * Responsabilidades:
 * - Criação de múltiplas camadas de estrelas com diferentes profundidades
 * - Estrelas com cores variadas (branco, azul, amarelo)
 * - Efeito parallax para simular profundidade
 * - Estrelas pulsantes e cintilantes
 * - Nebulosas e efeitos atmosféricos
 * - Otimização de performance com culling
 */
export default class BackgroundManager {
    constructor(scene) {
        this.scene = scene;
        
        // Configurações do espaço
        this.spaceSize = 8000; // Tamanho do espaço (8x maior que a tela)
        this.starLayers = [];
        this.nebulas = [];
        
        // Configurações de estrelas por camada
        this.starConfigs = [
            {
                name: 'distant',
                count: 200,
                size: { min: 0.5, max: 1 },
                colors: [0xffffff, 0xf0f8ff, 0xe6f3ff], // Brancos e azuis claros
                depth: -15,
                parallaxSpeed: 0.05,
                twinkleSpeed: 0.02,
                alpha: { min: 0.3, max: 0.8 }
            },
            {
                name: 'medium',
                count: 150,
                size: { min: 1, max: 2 },
                colors: [0xffffff, 0xffffcc, 0xfff8dc], // Brancos e amarelos claros
                depth: -12,
                parallaxSpeed: 0.15,
                twinkleSpeed: 0.05,
                alpha: { min: 0.5, max: 1.0 }
            },
            {
                name: 'bright',
                count: 100,
                size: { min: 1.5, max: 3 },
                colors: [0xffffff, 0x87ceeb, 0xffd700], // Branco, azul céu, dourado
                depth: -9,
                parallaxSpeed: 0.25,
                twinkleSpeed: 0.08,
                alpha: { min: 0.7, max: 1.0 }
            },
            {
                name: 'foreground',
                count: 50,
                size: { min: 2, max: 4 },
                colors: [0xffffff, 0x00bfff, 0xffa500], // Branco, azul profundo, laranja
                depth: -6,
                parallaxSpeed: 0.4,
                twinkleSpeed: 0.12,
                alpha: { min: 0.8, max: 1.0 }
            }
        ];
        
        // Configurações de nebulosas
        this.nebulaConfigs = [
            {
                count: 3,
                colors: [0x4a0080, 0x8b008b, 0x483d8b], // Roxos e azuis escuros
                size: { min: 300, max: 600 },
                alpha: { min: 0.1, max: 0.3 },
                depth: -18
            }
        ];
        
        // Referências
        this.playerShip = null;
        this.lastUpdateTime = 0;
        this.updateInterval = 16; // ~60fps
        
        console.log('🌌 BackgroundManager inicializado');
    }
    
    /**
     * Inicializa o sistema de background
     */
    initialize(playerShip) {
        this.playerShip = playerShip;
        
        console.log('🌌 BackgroundManager: Criando espaço imenso...');
        
        // Cria o fundo base do espaço
        this.createSpaceBackground();
        
        // Cria todas as camadas de estrelas
        this.createStarLayers();
        
        // Cria nebulosas
        this.createNebulas();
        
        console.log('✅ BackgroundManager: Espaço imenso criado com sucesso!');
    }
    
    /**
     * Cria o fundo base do espaço
     */
    createSpaceBackground() {
        // Fundo principal do espaço (preto profundo)
        const spaceBg = this.scene.add.rectangle(0, 0, this.spaceSize, this.spaceSize, 0x000011);
        spaceBg.setOrigin(0.5, 0.5);
        spaceBg.setDepth(-20);
        
        // Gradiente sutil para simular profundidade
        const gradientBg = this.scene.add.rectangle(0, 0, this.spaceSize * 0.8, this.spaceSize * 0.8, 0x000022);
        gradientBg.setOrigin(0.5, 0.5);
        gradientBg.setDepth(-19);
        gradientBg.setAlpha(0.3);
        
        console.log('🌌 Fundo do espaço criado');
    }
    
    /**
     * Cria todas as camadas de estrelas
     */
    createStarLayers() {
        this.starConfigs.forEach((config, layerIndex) => {
            console.log(`🌌 Criando camada ${config.name} com ${config.count} estrelas...`);
            
            const layer = {
                name: config.name,
                group: this.scene.add.group(),
                config: config,
                stars: []
            };
            
            // Cria estrelas para esta camada
            for (let i = 0; i < config.count; i++) {
                const star = this.createStar(config, layerIndex);
                layer.group.add(star);
                layer.stars.push(star);
            }
            
            this.starLayers.push(layer);
            console.log(`✅ Camada ${config.name} criada com ${layer.stars.length} estrelas`);
        });
        
        console.log(`🌌 Total: ${this.starLayers.length} camadas de estrelas criadas`);
    }
    
    /**
     * Cria uma estrela individual
     */
    createStar(config, layerIndex) {
        // Posição aleatória no espaço
        const x = Phaser.Math.Between(-this.spaceSize/2, this.spaceSize/2);
        const y = Phaser.Math.Between(-this.spaceSize/2, this.spaceSize/2);
        
        // Tamanho aleatório
        const size = Phaser.Math.FloatBetween(config.size.min, config.size.max);
        
        // Cor aleatória
        const color = Phaser.Utils.Array.GetRandom(config.colors);
        
        // Cria a estrela como círculo
        const star = this.scene.add.circle(x, y, size, color);
        star.setDepth(config.depth);
        
        // Propriedades da estrela
        star.initialX = x;
        star.initialY = y;
        star.baseAlpha = Phaser.Math.FloatBetween(config.alpha.min, config.alpha.max);
        star.twinklePhase = Phaser.Math.FloatBetween(0, Math.PI * 2);
        star.twinkleSpeed = config.twinkleSpeed;
        star.layerIndex = layerIndex;
        
        // Aplica alpha inicial
        star.setAlpha(star.baseAlpha);
        
        return star;
    }
    
    /**
     * Cria nebulosas para adicionar atmosfera
     */
    createNebulas() {
        this.nebulaConfigs.forEach(config => {
            for (let i = 0; i < config.count; i++) {
                const nebula = this.createNebula(config);
                this.nebulas.push(nebula);
            }
        });
        
        console.log(`🌌 ${this.nebulas.length} nebulosas criadas`);
    }
    
    /**
     * Cria uma nebulosa individual
     */
    createNebula(config) {
        const x = Phaser.Math.Between(-this.spaceSize/2, this.spaceSize/2);
        const y = Phaser.Math.Between(-this.spaceSize/2, this.spaceSize/2);
        const size = Phaser.Math.Between(config.size.min, config.size.max);
        const color = Phaser.Utils.Array.GetRandom(config.colors);
        const alpha = Phaser.Math.FloatBetween(config.alpha.min, config.alpha.max);
        
        const nebula = this.scene.add.circle(x, y, size, color);
        nebula.setDepth(config.depth);
        nebula.setAlpha(alpha);
        nebula.initialX = x;
        nebula.initialY = y;
        
        return nebula;
    }
    
    /**
     * Atualiza o background (parallax e efeitos)
     */
    update(time, delta) {
        if (!this.playerShip || !this.playerShip.ship) return;
        
        // Limita atualização para performance
        if (time - this.lastUpdateTime < this.updateInterval) return;
        this.lastUpdateTime = time;
        
        const camera = this.scene.cameras.main;
        const scrollX = camera.scrollX;
        const scrollY = camera.scrollY;
        
        // Atualiza parallax das estrelas
        this.updateStarParallax(scrollX, scrollY);
        
        // Atualiza efeitos de cintilação
        this.updateStarTwinkle(time);
        
        // Atualiza parallax das nebulosas
        this.updateNebulaParallax(scrollX, scrollY);
        
        // Aplica culling para otimização
        this.cullDistantStars(scrollX, scrollY);
    }
    
    /**
     * Atualiza o efeito parallax das estrelas
     */
    updateStarParallax(scrollX, scrollY) {
        this.starLayers.forEach(layer => {
            const parallaxSpeed = layer.config.parallaxSpeed;
            
            layer.stars.forEach(star => {
                if (star.active) {
                    star.x = star.initialX - scrollX * parallaxSpeed;
                    star.y = star.initialY - scrollY * parallaxSpeed;
                }
            });
        });
    }
    
    /**
     * Atualiza o efeito de cintilação das estrelas
     */
    updateStarTwinkle(time) {
        this.starLayers.forEach(layer => {
            layer.stars.forEach(star => {
                if (star.active) {
                    // Atualiza fase da cintilação
                    star.twinklePhase += star.twinkleSpeed;
                    
                    // Calcula alpha com cintilação
                    const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
                    const currentAlpha = star.baseAlpha * twinkle;
                    
                    star.setAlpha(currentAlpha);
                }
            });
        });
    }
    
    /**
     * Atualiza parallax das nebulosas
     */
    updateNebulaParallax(scrollX, scrollY) {
        this.nebulas.forEach(nebula => {
            if (nebula.active) {
                nebula.x = nebula.initialX - scrollX * 0.02; // Movimento muito lento
                nebula.y = nebula.initialY - scrollY * 0.02;
            }
        });
    }
    
    /**
     * Aplica culling para otimização
     */
    cullDistantStars(scrollX, scrollY) {
        const cullRadius = 2000; // Raio de culling
        
        this.starLayers.forEach(layer => {
            layer.stars.forEach(star => {
                if (star.active) {
                    const dx = star.x - scrollX;
                    const dy = star.y - scrollY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Mostra/esconde estrelas baseado na distância
                    star.setVisible(distance < cullRadius);
                }
            });
        });
        
        // Culling para nebulosas
        this.nebulas.forEach(nebula => {
            if (nebula.active) {
                const dx = nebula.x - scrollX;
                const dy = nebula.y - scrollY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                nebula.setVisible(distance < cullRadius * 1.5); // Nebulosas têm raio maior
            }
        });
    }
    
    /**
     * Obtém estatísticas do background
     */
    getBackgroundStats() {
        let totalStars = 0;
        let visibleStars = 0;
        
        this.starLayers.forEach(layer => {
            totalStars += layer.stars.length;
            visibleStars += layer.stars.filter(star => star.visible).length;
        });
        
        const visibleNebulas = this.nebulas.filter(nebula => nebula.visible).length;
        
        return {
            layers: this.starLayers.length,
            totalStars: totalStars,
            visibleStars: visibleStars,
            totalNebulas: this.nebulas.length,
            visibleNebulas: visibleNebulas,
            spaceSize: this.spaceSize
        };
    }
    
    /**
     * Configura parâmetros do background
     */
    setBackgroundParameters(params) {
        if (params.spaceSize !== undefined) this.spaceSize = params.spaceSize;
        if (params.updateInterval !== undefined) this.updateInterval = params.updateInterval;
        
        console.log('🌌 Parâmetros do background atualizados:', params);
    }
    
    /**
     * Adiciona estrelas extras a uma camada específica
     */
    addStarsToLayer(layerName, count) {
        const layer = this.starLayers.find(l => l.name === layerName);
        if (!layer) {
            console.warn(`⚠️ Camada ${layerName} não encontrada`);
            return;
        }
        
        const config = layer.config;
        for (let i = 0; i < count; i++) {
            const star = this.createStar(config, layer.layerIndex);
            layer.group.add(star);
            layer.stars.push(star);
        }
        
        console.log(`🌌 ${count} estrelas adicionadas à camada ${layerName}`);
    }
    
    /**
     * Destrói o manager e limpa recursos
     */
    destroy() {
        console.log('🌌 BackgroundManager: Destruindo...');
        
        // Destrói todas as camadas de estrelas
        this.starLayers.forEach(layer => {
            layer.stars.forEach(star => {
                if (star.active) {
                    star.destroy();
                }
            });
            layer.group.destroy();
        });
        
        // Destrói nebulosas
        this.nebulas.forEach(nebula => {
            if (nebula.active) {
                nebula.destroy();
            }
        });
        
        // Limpa arrays
        this.starLayers = [];
        this.nebulas = [];
        
        console.log('✅ BackgroundManager: Destruído');
    }
}
