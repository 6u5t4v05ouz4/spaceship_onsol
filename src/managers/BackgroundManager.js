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
     * Cria o background com sistema infinito SIMPLIFICADO (sem efeitos de luz)
     */
    createBackground() {
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;

        console.log(`🌌 Criando background simples para tela ${screenWidth}x${screenHeight}`);

        // Fundo preto sólido simples
        this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000)
            .setOrigin(0.5).setDepth(-10);
        console.log('✅ Fundo preto criado');

        // Criar múltiplos TileSprites para cobertura infinita (sem movimento)
        this.createInfiniteStarTiles();
        console.log('✅ Sistema de TileSprites infinitos criado');

        // Estrelas estáticas simples (sem efeitos de brilho)
        const starCount = Math.floor((screenWidth * screenHeight) / 8000); // Menos estrelas
        console.log(`🌌 Criando ${starCount} estrelas estáticas...`);

        for (let i = 0; i < starCount; i++) {
            const x = Phaser.Math.Between(-screenWidth/2, screenWidth/2);
            const y = Phaser.Math.Between(-screenHeight/2, screenHeight/2);
            const size = Phaser.Math.Between(1, 2);
            const star = this.scene.add.rectangle(x, y, size, size, 0x666666);
            star.setDepth(-8);
            star.setAlpha(0.6); // Brilho fixo e baixo

            // Armazenar para proteger do culling
            this.stars.push(star);
        }

        console.log(`✅ Background simples criado: ${starCount} estrelas estáticas`);
    }
    
    /**
     * Cria múltiplos TileSprites para cobertura infinita (sem movimento)
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
                starTile.setOrigin(0.5).setDepth(-9).setAlpha(0.3).setTint(0x444444); // Cinza escuro e pouco brilhante
                
                // Armazenar informações do tile
                starTile.tileX = tileX;
                starTile.tileY = tileY;
                starTile.gridX = x;
                starTile.gridY = y;
                
                this.starTiles.push(starTile);
            }
        }
        
        console.log(`✅ Criados ${this.starTiles.length} TileSprites estáticos para cobertura infinita`);
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
