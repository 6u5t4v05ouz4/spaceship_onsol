/**
 * BackgroundManager - Gerencia o fundo do espaço usando sistema simples e eficiente
 * Baseado no sistema do GameplaySimulation.js
 * Responsabilidades:
 * - Background sólido preto
 * - TileSprite das estrelas com parallax
 * - Estrelas procedurais individuais
 * - Animação suave de movimento
 */
export default class BackgroundManager {
    constructor(scene) {
        this.scene = scene;
        
        // Elementos do background
        this.starsBg = null;
        this.stars = []; // Armazenar estrelas para protegê-las do culling
        this.starTiles = []; // Múltiplos TileSprites para cobertura infinita
        
        // Referências
        this.playerShip = null;
        this.lastShipPosition = { x: 0, y: 0 };
        
        console.log('🌌 BackgroundManager inicializado (sistema infinito)');
    }
    
    /**
     * Inicializa o sistema de background
     */
    initialize(playerShip = null) {
        this.playerShip = playerShip;
        
        console.log('🌌 BackgroundManager: Criando background simples...');
        
        // Cria o background usando o sistema do GameplaySimulation
        this.createBackground();
        
        console.log('✅ BackgroundManager: Background simples criado com sucesso!');
    }
    
    /**
     * Cria o background com sistema infinito
     */
    createBackground() {
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;

        console.log(`🌌 Criando background infinito BRILHANTE para tela ${screenWidth}x${screenHeight}`);

        // Fundo azul escuro com brilho ao invés de preto sólido
        this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x001133)
            .setOrigin(0.5).setDepth(-10);
        console.log('✅ Fundo azul escuro criado');

        // Criar múltiplos TileSprites para cobertura infinita
        this.createInfiniteStarTiles();
        console.log('✅ Sistema de TileSprites infinitos criado');

        // Estrelas procedurais individuais MUITO MAIS BRILHANTES
        const starCount = Math.floor((screenWidth * screenHeight) / 4000); // Dobro de estrelas
        console.log(`🌌 Criando ${starCount} estrelas procedurais brilhantes...`);

        for (let i = 0; i < starCount; i++) {
            const x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
            const y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
            const size = Phaser.Math.Between(1, 4);
            const star = this.scene.add.rectangle(x, y, size, size, 0xffffff);
            star.setDepth(-8);
            star.setAlpha(Phaser.Math.FloatBetween(0.8, 1)); // Brilho mínimo muito alto

            // Adicionar efeito de brilho pulsante para MAIS estrelas
            if (Math.random() < 0.6) { // 60% das estrelas têm efeito de brilho
                this.scene.tweens.add({
                    targets: star,
                    alpha: { from: 0.8, to: 1 },
                    scale: { from: 1, to: 1.5 },
                    duration: Phaser.Math.Between(1000, 3000),
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }

            // Armazenar para proteger do culling
            this.stars.push(star);
        }

        // Adicionar estrelas grandes brilhantes esparsas
        const bigStarCount = Math.floor((screenWidth * screenHeight) / 50000);
        console.log(`🌌 Criando ${bigStarCount} estrelas grandes brilhantes...`);

        for (let i = 0; i < bigStarCount; i++) {
            const x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
            const y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
            const bigStar = this.scene.add.rectangle(x, y, 6, 6, 0xaaccff);
            bigStar.setDepth(-8);
            bigStar.setAlpha(0.9);

            // Brilho intenso pulsante
            this.scene.tweens.add({
                targets: bigStar,
                alpha: { from: 0.7, to: 1 },
                scale: { from: 1, to: 2 },
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.stars.push(bigStar);
        }

        // Adicionar nebulosas luminosas
        this.createNebulas();

        console.log(`✅ Background infinito brilhante criado: ${starCount + bigStarCount} estrelas procedurais`);
    }
    
    /**
     * Cria múltiplos TileSprites para cobertura infinita
     */
    createInfiniteStarTiles() {
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;
        const tileSize = Math.max(screenWidth, screenHeight) * 2; // Tamanho maior que a tela
        
        // Criar uma grade de TileSprites (3x3 para cobertura completa)
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                const tileX = x * tileSize;
                const tileY = y * tileSize;
                
                const starTile = this.scene.add.tileSprite(tileX, tileY, tileSize, tileSize, 'stars');
                starTile.setOrigin(0.5).setDepth(-9).setAlpha(1.0).setTint(0xaaaaff); // Azul claro e muito brilhante
                
                // Armazenar informações do tile
                starTile.tileX = tileX;
                starTile.tileY = tileY;
                starTile.gridX = x;
                starTile.gridY = y;
                
                this.starTiles.push(starTile);
            }
        }
        
        console.log(`✅ Criados ${this.starTiles.length} TileSprites para cobertura infinita`);
    }

    /**
     * Cria nebulosas luminosas para profundidade visual
     */
    createNebulas() {
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;

        // Criar nebulosas BRILHANTES para dar mais vida ao fundo
        const nebulaColors = [0x6666aa, 0x66aa66, 0xaa8866, 0x6688aa]; // Cores mais claras e brilhantes

        for (let i = 0; i < 5; i++) { // Mais nebulosas
            const x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
            const y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
            const color = nebulaColors[i % nebulaColors.length];

            // Criar forma oval para nebulosa com mais brilho
            const nebula = this.scene.add.graphics();
            nebula.setDepth(-7);
            nebula.fillStyle(color, 0.25); // Muito mais brilhante
            nebula.fillEllipse(x, y, Phaser.Math.Between(300, 600), Phaser.Math.Between(200, 400));
            nebula.fillStyle(color, 0.15); // Ainda brilhante
            nebula.fillEllipse(x + 50, y + 30, Phaser.Math.Between(200, 400), Phaser.Math.Between(150, 300));

            // Adicionar movimento lento com brilho pulsante
            this.scene.tweens.add({
                targets: nebula,
                x: x + Phaser.Math.Between(-30, 30),
                y: y + Phaser.Math.Between(-30, 30),
                alpha: { from: 0.8, to: 1 },
                duration: Phaser.Math.Between(8000, 15000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        console.log('✅ Nebulosas luminosas criadas');
    }
    
    /**
     * Atualiza o background com sistema infinito
     */
    update(time, delta) {
        if (!this.playerShip || !this.playerShip.ship) return;
        
        const ship = this.playerShip.ship;
        const shipX = ship.x;
        const shipY = ship.y;
        
        // Animação MAIS DINÂMICA de todos os TileSprites
        this.starTiles.forEach(tile => {
            if (tile && tile.active) {
                tile.tilePositionX += 0.3; // Movimento mais rápido
                tile.tilePositionY += 0.1;
            }
        });
        
        // Reposicionar tiles conforme a nave se move
        this.repositionTiles(shipX, shipY);
        
        // Proteger estrelas do culling
        this.protectStarsFromCulling();
        
        // Atualizar posição da nave
        this.lastShipPosition.x = shipX;
        this.lastShipPosition.y = shipY;
    }
    
    /**
     * Reposiciona os tiles conforme a nave se move
     */
    repositionTiles(shipX, shipY) {
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;
        const tileSize = Math.max(screenWidth, screenHeight) * 2;
        
        // Verificar se precisa reposicionar tiles
        const threshold = tileSize * 0.5; // Metade do tamanho do tile
        
        this.starTiles.forEach(tile => {
            if (tile && tile.active) {
                const dx = shipX - tile.tileX;
                const dy = shipY - tile.tileY;
                
                // Se o tile está muito longe, reposicionar
                if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
                    // Calcular nova posição baseada na posição da nave
                    const newGridX = Math.round(shipX / tileSize);
                    const newGridY = Math.round(shipY / tileSize);
                    
                    // Reposicionar tile
                    tile.tileX = newGridX * tileSize;
                    tile.tileY = newGridY * tileSize;
                    tile.x = tile.tileX;
                    tile.y = tile.tileY;
                    
                    // Atualizar grid
                    tile.gridX = newGridX;
                    tile.gridY = newGridY;
                }
            }
        });
    }
    
    /**
     * Protege as estrelas do sistema de culling
     */
    protectStarsFromCulling() {
        this.stars.forEach(star => {
            if (star && star.active) {
                // Garantir que as estrelas sempre estejam visíveis
                star.setVisible(true);
                // Resetar posição se necessário (proteção extra)
                if (star.x === 0 && star.y === 0) {
                    // Estrela foi resetada, reposicionar
                    const screenWidth = this.scene.scale.width;
                    const screenHeight = this.scene.scale.height;
                    star.x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
                    star.y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
                }
            }
        });
    }
    
    /**
     * Obtém estatísticas do background
     */
    getBackgroundStats() {
        return {
            starTiles: this.starTiles.length,
            activeTiles: this.starTiles.filter(tile => tile && tile.active).length,
            starsCount: this.stars.length,
            visibleStars: this.stars.filter(star => star && star.visible).length,
            system: 'Infinite Background System'
        };
    }
    
    /**
     * Destrói o manager e limpa recursos
     */
    destroy() {
        console.log('🌌 BackgroundManager: Destruindo...');
        
        // Destrói todos os TileSprites
        this.starTiles.forEach(tile => {
            if (tile && tile.active) {
                tile.destroy();
            }
        });
        
        // Destrói estrelas procedurais
        this.stars.forEach(star => {
            if (star && star.active) {
                star.destroy();
            }
        });
        
        // Limpa arrays
        this.starTiles = [];
        this.stars = [];
        
        console.log('✅ BackgroundManager: Destruído');
    }
}
