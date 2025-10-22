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
     * Cria o background com sistema infinito (mantendo estrelas bonitas, sem nebulosas)
     */
    createBackground() {
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;

        console.log(`🌌 Criando background com estrelas bonitas para tela ${screenWidth}x${screenHeight}`);

        // Fundo azul escuro (mantido do original)
        this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x001133)
            .setOrigin(0.5).setDepth(-10);
        console.log('✅ Fundo azul escuro criado');

        // Criar múltiplos TileSprites para cobertura infinita
        this.createInfiniteStarTiles();
        console.log('✅ Sistema de TileSprites infinitos criado');

        // Estrelas procedurais individuais bonitas (com pulsação visível)
        const starCount = Math.floor((screenWidth * screenHeight) / 4000);
        console.log(`🌌 Criando ${starCount} estrelas bonitas com pulsação visível...`);

        for (let i = 0; i < starCount; i++) {
            const x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
            const y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
            const size = Phaser.Math.Between(0.5, 2);
            
            // Criar estrela circular pequena
            const star = this.scene.add.circle(x, y, size, 0xffffff);
            star.setDepth(-8);
            star.setAlpha(Phaser.Math.FloatBetween(0.2, 0.6)); // Brilho inicial mais baixo

            // Adicionar pulsação visível para mais estrelas
            if (Math.random() < 0.6) { // 60% das estrelas têm pulsação
                this.scene.tweens.add({
                    targets: star,
                    alpha: { from: 0.1, to: 1 }, // Variação muito maior de brilho
                    scale: { from: 0.8, to: 1.2 }, // Pequena variação de tamanho
                    duration: Phaser.Math.Between(1000, 2500), // Mais rápido
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }

            // Armazenar para proteger do culling
            this.stars.push(star);
        }

        // Adicionar estrelas grandes bonitas esparsas (com pulsação visível)
        const bigStarCount = Math.floor((screenWidth * screenHeight) / 60000);
        console.log(`🌌 Criando ${bigStarCount} estrelas grandes bonitas com pulsação visível...`);

        for (let i = 0; i < bigStarCount; i++) {
            const x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
            const y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
            
            // Criar estrela grande circular
            const bigStar = this.scene.add.circle(x, y, 3, 0xaaccff);
            bigStar.setDepth(-8);
            bigStar.setAlpha(0.5);

            // Pulsação visível para estrelas grandes
            this.scene.tweens.add({
                targets: bigStar,
                alpha: { from: 0.2, to: 1 }, // Variação muito maior de brilho
                scale: { from: 0.9, to: 1.3 }, // Variação de tamanho mais visível
                duration: Phaser.Math.Between(1500, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.stars.push(bigStar);
        }

        console.log(`✅ Background com estrelas bonitas criado: ${starCount + bigStarCount} estrelas com brilho pulsante`);
    }
    
    /**
     * Cria múltiplos TileSprites para cobertura infinita (com parallax sutil)
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
                starTile.setOrigin(0.5).setDepth(-9).setAlpha(0.6).setTint(0xaaaaff); // Azul claro e brilhante
                
                // Adicionar movimento parallax muito sutil
                this.scene.tweens.add({
                    targets: starTile,
                    tilePositionX: { from: 0, to: tileSize * 0.1 }, // Movimento muito pequeno
                    tilePositionY: { from: 0, to: tileSize * 0.1 }, // Movimento muito pequeno
                    duration: 300000, // 5 minutos para movimento extremamente lento
                    repeat: -1,
                    ease: 'Linear'
                });
                
                // Armazenar informações do tile
                starTile.tileX = tileX;
                starTile.tileY = tileY;
                starTile.gridX = x;
                starTile.gridY = y;
                
                this.starTiles.push(starTile);
            }
        }
        
        console.log(`✅ Criados ${this.starTiles.length} TileSprites com parallax sutil para cobertura infinita`);
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
