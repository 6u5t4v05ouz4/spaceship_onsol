/**
 * MiningManager - Gerencia todo o sistema de mineração
 * Responsabilidades:
 * - Criação de planetas mineráveis
 * - Sistema de mineração por proximidade
 * - Efeitos visuais de mineração
 * - Cálculo de taxas de mineração
 * - Integração com economia do jogo
 */
export default class MiningManager {
    constructor(scene, collisionManager) {
        this.scene = scene;
        this.collisionManager = collisionManager;
        
        // Estado da mineração
        this.miningPlanets = [];
        this.miningTimer = null;
        this.miningInterval = 100; // 100ms entre verificações
        this.miningDistance = 200; // Distância máxima para mineração
        
        // Configurações de planetas
        this.planetCount = 8;
        this.minMiningRate = 0.1;
        this.maxMiningRate = 0.5;
        this.minScale = 0.6;
        this.maxScale = 1.2;
        
        // Referências
        this.playerShip = null;
        this.gameState = null;
        this.uiManager = null;
        this.particleEffects = null;
        this.uiAnimations = null;
        
        // Estado de mineração
        this.isMining = false;
        this.lastMiningTextTime = 0;
        this.miningTextInterval = 3000; // 3 segundos entre textos
        
        console.log('⛏️ MiningManager inicializado');
    }
    
    /**
     * Inicializa o sistema de mineração
     */
    initialize(playerShip, gameState, uiManager, particleEffects, uiAnimations) {
        this.playerShip = playerShip;
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.particleEffects = particleEffects;
        this.uiAnimations = uiAnimations;
        
        console.log('⛏️ MiningManager: Sistema inicializado');
        
        // Cria planetas mineráveis
        this.createMiningPlanets();
        
        // Configura timer de mineração
        this.setupMiningTimer();
        
        console.log('✅ MiningManager: Sistema de mineração pronto');
    }
    
    /**
     * Cria planetas mineráveis no mundo
     */
    createMiningPlanets() {
        console.log('⛏️ Criando planetas mineráveis...');
        
        // Obtém frames disponíveis
        const frameNames = this.scene.textures.exists('planets') ? 
            this.scene.textures.get('planets').getFrameNames() : null;
        
        for (let i = 0; i < this.planetCount; i++) {
            this.createSingleMiningPlanet(frameNames, i);
        }
        
        console.log(`✅ ${this.planetCount} planetas mineráveis criados`);
    }
    
    /**
     * Cria um único planeta minerável
     */
    createSingleMiningPlanet(frameNames, index) {
        // Usar posições fixas baseadas no chunk atual para consistência entre jogadores
        const multiplayerManager = this.scene.multiplayerManager;
        let x, y;
        
        if (multiplayerManager && multiplayerManager.currentChunk) {
            const chunkX = multiplayerManager.currentChunk.x;
            const chunkY = multiplayerManager.currentChunk.y;
            
            // Spawn dentro do chunk atual (1000x1000 unidades)
            const chunkStartX = chunkX * 1000;
            const chunkStartY = chunkY * 1000;
            
            // Posições fixas baseadas em seed para consistência
            const seed = `${chunkX},${chunkY}`;
            const randomX = this.seededRandom(seed, index * 2);
            const randomY = this.seededRandom(seed, index * 2 + 1);
            
            x = chunkStartX + Math.floor(randomX * 1000);
            y = chunkStartY + Math.floor(randomY * 1000);
        } else {
            // Fallback para spawn aleatório no chunk (0,0)
            x = Phaser.Math.Between(-500, 500);
            y = Phaser.Math.Between(-500, 500);
        }
        
        // Frame aleatório
        let frameName = null;
        if (frameNames && frameNames.length > 0) {
            const candidates = frameNames.filter(n => n !== "__BASE");
            frameName = Phaser.Utils.Array.GetRandom(candidates);
        }
        
        // Cria o planeta
        const planet = frameName ? 
            this.scene.add.image(x, y, 'planets', frameName) : 
            this.scene.add.image(x, y, 'planets');
        
        // Configura propriedades visuais
        planet.setScale(Phaser.Math.FloatBetween(this.minScale, this.maxScale));
        planet.setDepth(-0.5);
        
        // Configura propriedades de mineração
        planet.isMiningPlanet = true;
        planet.miningRate = Phaser.Math.FloatBetween(this.minMiningRate, this.maxMiningRate);
        planet.isPulsing = false;
        planet.planetIndex = index;
        
        // Adiciona ao sistema de colisões
        if (this.collisionManager) {
            this.collisionManager.addToGroup('miningPlanets', planet);
        }
        
        // Armazena referência
        this.miningPlanets.push(planet);
        
        console.log(`⛏️ Planeta ${index} criado em (${x}, ${y}) - Taxa: ${planet.miningRate.toFixed(2)}`);
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
     * Configura timer de mineração
     */
    setupMiningTimer() {
        this.miningTimer = this.scene.time.addEvent({
            delay: this.miningInterval,
            callback: () => {
                this.processMining();
            },
            callbackScope: this,
            loop: true
        });
        
        console.log('⛏️ Timer de mineração configurado');
    }
    
    /**
     * Processa a mineração (método principal)
     */
    processMining() {
        if (!this.playerShip || !this.playerShip.ship) {
            console.log('⚠️ MiningManager: Nave não disponível');
            return;
        }
        
        console.log('⛏️ MiningManager: Processando mineração...');
        
        const miningPlanets = this.collisionManager ? 
            this.collisionManager.getGroup('miningPlanets') : null;
        
        if (!miningPlanets) {
            console.log('⚠️ MiningManager: Grupo de planetas não encontrado');
            return;
        }
        
        console.log(`⛏️ MiningManager: ${miningPlanets.getChildren().length} planetas encontrados`);
        
        let totalRate = 0;
        let isMining = false;
        
        // Verifica distância aos planetas mineráveis
        miningPlanets.getChildren().forEach(planet => {
            const distance = Phaser.Math.Distance.Between(
                this.playerShip.ship.x, this.playerShip.ship.y, 
                planet.x, planet.y
            );
            
            if (distance < this.miningDistance) {
                isMining = true;
                console.log(`⛏️ Mineração ativa! Distância: ${distance.toFixed(1)}px, Taxa: ${planet.miningRate.toFixed(2)}`);
                this.handlePlanetMining(planet, distance);
                
                // Calcula taxa de mineração com bônus de proximidade
                const proximityBonus = Math.max(0, (this.miningDistance - distance) / this.miningDistance);
                const rate = planet.miningRate * (1 + proximityBonus);
                totalRate += rate;
                
            } else {
                this.handlePlanetNotMining(planet);
            }
        });
        
        // Atualiza estado de mineração
        this.isMining = isMining;
        
        // Se está minerando, adiciona crypto
        if (totalRate > 0) {
            this.addCryptoFromMining(totalRate);
        }
    }
    
    /**
     * Manipula mineração de um planeta específico
     */
    handlePlanetMining(planet, distance) {
        // Efeito de partículas de mineração
        if (this.particleEffects) {
            this.particleEffects.createMiningEffect(
                planet.x, planet.y, 
                this.playerShip.ship.x, this.playerShip.ship.y
            );
        }
        
        // Pulso no planeta
        if (!planet.isPulsing) {
            planet.isPulsing = true;
            if (this.uiAnimations) {
                this.uiAnimations.pulse(planet, 1.05, 1000, -1);
            }
        }
    }
    
    /**
     * Manipula quando não está minerando um planeta
     */
    handlePlanetNotMining(planet) {
        if (planet.isPulsing) {
            planet.isPulsing = false;
            this.scene.tweens.killTweensOf(planet);
            planet.setScale(planet.scale);
        }
    }
    
    /**
     * Adiciona crypto baseado na mineração
     */
    addCryptoFromMining(totalRate) {
        if (!this.gameState) return;
        
        const oldBalance = this.gameState.cryptoBalance;
        this.gameState.addCrypto(totalRate);
        
        // Atualiza UI
        if (this.uiManager) {
            this.uiManager.updateCryptoDisplay(oldBalance, this.gameState.cryptoBalance);
        }
        
        // Mostra texto flutuante ocasionalmente
        if (!this.lastMiningTextTime || Date.now() - this.lastMiningTextTime > this.miningTextInterval) {
            if (this.uiAnimations) {
                this.uiAnimations.showCryptoGain(
                    this.playerShip.ship.x, 
                    this.playerShip.ship.y - 50, 
                    totalRate
                );
            }
            this.lastMiningTextTime = Date.now();
        }
    }
    
    /**
     * Atualiza o sistema de mineração
     */
    update() {
        // O processamento principal é feito pelo timer
        // Este método pode ser usado para atualizações adicionais se necessário
    }
    
    /**
     * Aplica culling para otimização
     */
    cullMiningPlanets() {
        if (!this.playerShip || !this.playerShip.ship) return;
        
        const sx = this.playerShip.ship.x;
        const sy = this.playerShip.ship.y;
        const cullRadius = 1200;
        const cullRadiusSquared = cullRadius * cullRadius;
        
        this.miningPlanets.forEach(planet => {
            if (!planet) return;
            
            const dx = planet.x - sx;
            const dy = planet.y - sy;
            const distanceSquared = dx * dx + dy * dy;
            const isVisible = distanceSquared <= cullRadiusSquared;
            
            // Atualiza visibilidade
            planet.setVisible(isVisible);
            
            // Para animações quando não visível
            if (!isVisible && planet.isPulsing) {
                planet.isPulsing = false;
                this.scene.tweens.killTweensOf(planet);
                planet.setScale(planet.scale);
            }
        });
    }
    
    /**
     * Limpeza de planetas distantes
     */
    cleanupDistantPlanets() {
        if (!this.playerShip || !this.playerShip.ship) return;
        
        const cleanupRadius = 3600; // 3x cull radius
        
        this.miningPlanets.forEach((planet, index) => {
            if (planet.active) {
                const distance = Phaser.Math.Distance.Between(
                    this.playerShip.ship.x, this.playerShip.ship.y, 
                    planet.x, planet.y
                );
                
                if (distance > cleanupRadius) {
                    console.log(`⛏️ Removendo planeta distante ${index}`);
                    planet.destroy();
                    this.miningPlanets.splice(index, 1);
                }
            }
        });
    }
    
    /**
     * Obtém estatísticas de mineração
     */
    getMiningStats() {
        const activePlanets = this.miningPlanets.filter(planet => planet.active);
        const pulsingPlanets = activePlanets.filter(planet => planet.isPulsing);
        
        return {
            totalPlanets: this.miningPlanets.length,
            activePlanets: activePlanets.length,
            miningPlanets: pulsingPlanets.length,
            isMining: this.isMining,
            miningDistance: this.miningDistance
        };
    }
    
    /**
     * Configura parâmetros de mineração
     */
    setMiningParameters(params) {
        if (params.miningDistance !== undefined) this.miningDistance = params.miningDistance;
        if (params.miningInterval !== undefined) this.miningInterval = params.miningInterval;
        if (params.minMiningRate !== undefined) this.minMiningRate = params.minMiningRate;
        if (params.maxMiningRate !== undefined) this.maxMiningRate = params.maxMiningRate;
        
        console.log('⛏️ Parâmetros de mineração atualizados:', params);
    }
    
    /**
     * Cria planeta minerável adicional
     */
    createAdditionalPlanet() {
        const frameNames = this.scene.textures.exists('planets') ? 
            this.scene.textures.get('planets').getFrameNames() : null;
        
        this.createSingleMiningPlanet(frameNames, this.miningPlanets.length);
        console.log('⛏️ Planeta adicional criado');
    }
    
    /**
     * Destrói o manager e limpa recursos
     */
    destroy() {
        console.log('⛏️ MiningManager: Destruindo...');
        
        // Para timer de mineração
        if (this.miningTimer) {
            this.miningTimer.remove();
        }
        
        // Destrói todos os planetas
        this.miningPlanets.forEach(planet => {
            if (planet.active) {
                planet.destroy();
            }
        });
        
        // Limpa arrays
        this.miningPlanets = [];
        
        console.log('✅ MiningManager: Destruído');
    }
}
