/**
 * UIManager - Gerencia toda a interface do usuário
 * Responsabilidades:
 * - Criação e atualização de elementos UI
 * - Barras de vida, combustível, oxigênio
 * - Textos informativos e estatísticas
 * - Animações de UI
 * - Responsividade e layout
 */
export default class UIManager {
    constructor(scene, gameState) {
        this.scene = scene;
        this.gameState = gameState;
        this.uiElements = new Map();
        this.createUI();
    }

    createUI() {
        // Estilo base para os textos da UI
        this.titleStyle = {
            fontSize: '13px',
            fill: '#00d4ff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        };
        
        this.valueStyle = {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        };

        // Container principal da UI
        this.createUIPanel();
        
        // Elementos da UI
        this.createCryptoDisplay();
        this.createHealthBar();
        this.createFuelBar();
        this.createOxygenBar();
        this.createCargoDisplay();
        this.createSpeedDisplay();
        this.createRarityDisplay();
        this.createCoordinatesDisplay();
    }

    createUIPanel() {
        const startX = 16;
        const startY = 16;
        const panelWidth = 320;
        const panelHeight = 320;
        
        // Painel de fundo semi-transparente
        this.uiElements.set('panel', this.scene.add.rectangle(
            startX, startY, panelWidth, panelHeight, 0x0a0a0f, 0.85
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(18));
        
        // Bordas do painel com efeito neon
        this.uiElements.set('panelBorder', this.scene.add.rectangle(
            startX, startY, panelWidth, panelHeight, 0x00d4ff, 0
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(18)
        .setStrokeStyle(2, 0x00d4ff, 0.8));
        
        // Borda interna sutil
        this.uiElements.set('panelInnerBorder', this.scene.add.rectangle(
            startX + 3, startY + 3, panelWidth - 6, panelHeight - 6, 0x00d4ff, 0
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(18)
        .setStrokeStyle(1, 0x00d4ff, 0.3));
    }

    createCryptoDisplay() {
        const startX = 16;
        const startY = 16;
        const panelPadding = 18;
        const contentX = startX + panelPadding;
        let currentY = startY + panelPadding;
        
        // Título
        this.scene.add.text(contentX, currentY, '💰 CRYPTO', this.titleStyle)
            .setScrollFactor(0).setDepth(20);
        currentY += 20;
        
        // Valor
        this.uiElements.set('cryptoText', this.scene.add.text(contentX, currentY, '0.00', { 
            ...this.valueStyle, 
            fill: '#00ff88',
            fontSize: '22px'
        }).setScrollFactor(0).setDepth(20));
        
        this.currentY = currentY + 32;
    }

    createHealthBar() {
        const startX = 16;
        const panelPadding = 18;
        const contentX = startX + panelPadding;
        const barWidth = 320 - (panelPadding * 2);
        let currentY = this.currentY;
        
        // Título
        this.scene.add.text(contentX, currentY, '❤️ HEALTH', this.titleStyle)
            .setScrollFactor(0).setDepth(20);
        currentY += 20;
        
        const healthBarHeight = 20;
        
        // Fundo da barra
        this.uiElements.set('healthBarBg', this.scene.add.rectangle(
            contentX, currentY, barWidth, healthBarHeight, 0x220000, 0.9
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(19)
        .setStrokeStyle(1, 0x660000, 0.6));
        
        // Barra de vida
        this.uiElements.set('healthBar', this.scene.add.rectangle(
            contentX + 1, currentY + 1, barWidth - 2, healthBarHeight - 2, 0xff0000, 1
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(20));
        
        // Texto da vida
        this.uiElements.set('healthText', this.scene.add.text(
            contentX + barWidth/2, currentY + healthBarHeight/2, '100/100', { 
            fontSize: '13px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(21));
        
        this.currentY = currentY + healthBarHeight + 16;
    }

    createFuelBar() {
        const startX = 16;
        const panelPadding = 18;
        const contentX = startX + panelPadding;
        const barWidth = 320 - (panelPadding * 2);
        let currentY = this.currentY;
        
        // Título
        this.scene.add.text(contentX, currentY, '⚡ FUEL', this.titleStyle)
            .setScrollFactor(0).setDepth(20);
        currentY += 20;
        
        const fuelBarHeight = 18;
        
        // Fundo da barra
        this.uiElements.set('fuelBarBg', this.scene.add.rectangle(
            contentX, currentY, barWidth, fuelBarHeight, 0x001a22, 0.9
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(19)
        .setStrokeStyle(1, 0x004466, 0.6));
        
        // Barra de combustível
        this.uiElements.set('fuelBar', this.scene.add.rectangle(
            contentX + 1, currentY + 1, barWidth - 2, fuelBarHeight - 2, 0x00aaff, 1
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(20));
        
        // Texto do combustível
        this.uiElements.set('fuelText', this.scene.add.text(
            contentX + barWidth/2, currentY + fuelBarHeight/2, '100/100', { 
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(21));
        
        this.currentY = currentY + fuelBarHeight + 16;
    }

    createOxygenBar() {
        const startX = 16;
        const panelPadding = 18;
        const contentX = startX + panelPadding;
        const barWidth = 320 - (panelPadding * 2);
        let currentY = this.currentY;
        
        // Título
        this.scene.add.text(contentX, currentY, '🫁 OXYGEN', this.titleStyle)
            .setScrollFactor(0).setDepth(20);
        currentY += 20;
        
        const oxygenBarHeight = 18;
        
        // Fundo da barra
        this.uiElements.set('oxygenBarBg', this.scene.add.rectangle(
            contentX, currentY, barWidth, oxygenBarHeight, 0x001122, 0.9
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(19)
        .setStrokeStyle(1, 0x004466, 0.6));
        
        // Barra de oxigênio
        this.uiElements.set('oxygenBar', this.scene.add.rectangle(
            contentX + 1, currentY + 1, barWidth - 2, oxygenBarHeight - 2, 0x00ccff, 1
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(20));
        
        // Texto do oxigênio
        this.uiElements.set('oxygenText', this.scene.add.text(
            contentX + barWidth/2, currentY + oxygenBarHeight/2, '100/100', { 
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(21));
        
        this.currentY = currentY + oxygenBarHeight + 16;
    }

    createCargoDisplay() {
        const startX = 16;
        const panelPadding = 18;
        const contentX = startX + panelPadding;
        let currentY = this.currentY;
        
        // Título
        this.scene.add.text(contentX, currentY, '📦 CARGO', this.titleStyle)
            .setScrollFactor(0).setDepth(20);
        currentY += 20;
        
        // Texto da carga
        this.uiElements.set('cargoText', this.scene.add.text(contentX, currentY, '0/50 kg', { 
            fontSize: '16px',
            fill: '#ffaa00',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(20));
        
        this.currentY = currentY + 25;
    }

    createSpeedDisplay() {
        const startX = 16;
        const panelPadding = 18;
        const contentX = startX + panelPadding;
        let currentY = this.currentY;
        
        // Texto da velocidade
        this.uiElements.set('speedText', this.scene.add.text(contentX, currentY, '🚀 SPEED: 0 km/h', { 
            fontSize: '13px',
            fill: '#55aaff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(20));
        
        this.currentY = currentY + 20;
    }

    createRarityDisplay() {
        const startX = 16;
        const panelPadding = 18;
        const contentX = startX + panelPadding;
        let currentY = this.currentY;
        
        // Texto da raridade
        this.uiElements.set('rarityText', this.scene.add.text(contentX, currentY, '', { 
            fontSize: '12px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(20));
    }

    createCoordinatesDisplay() {
        // Painel de coordenadas no canto superior direito
        const screenWidth = this.scene.game.config.width;
        const panelWidth = 280;
        const panelHeight = 140;
        const startX = screenWidth - panelWidth - 16;
        const startY = 16;
        
        // Painel de fundo
        this.uiElements.set('coordsPanel', this.scene.add.rectangle(
            startX, startY, panelWidth, panelHeight, 0x0a0a0f, 0.85
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(18));
        
        // Borda do painel
        this.uiElements.set('coordsPanelBorder', this.scene.add.rectangle(
            startX, startY, panelWidth, panelHeight, 0x00d4ff, 0
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(18)
        .setStrokeStyle(2, 0x00d4ff, 0.8));
        
        const contentX = startX + 18;
        let currentY = startY + 18;
        
        // Título
        this.scene.add.text(contentX, currentY, '📍 POSIÇÃO', {
            fontSize: '13px',
            fill: '#00d4ff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(20);
        currentY += 25;
        
        // Coordenadas X, Y
        this.uiElements.set('coordsText', this.scene.add.text(contentX, currentY, 'X: 0 | Y: 0', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(20));
        currentY += 25;
        
        // Chunk atual
        this.uiElements.set('chunkText', this.scene.add.text(contentX, currentY, 'Chunk: (0, 0)', {
            fontSize: '14px',
            fill: '#00ff88',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(20));
        currentY += 25;
        
        // Zona atual
        this.uiElements.set('zoneText', this.scene.add.text(contentX, currentY, 'Zona: Safe', {
            fontSize: '14px',
            fill: '#00ff88',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(20));
        currentY += 25;
        
        // Players no chunk
        this.uiElements.set('playersText', this.scene.add.text(contentX, currentY, 'Players: 0', {
            fontSize: '12px',
            fill: '#ffaa00',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(20));
    }

    // === UPDATE METHODS ===
    update() {
        this.updateHealthBar();
        this.updateFuelBar();
        this.updateOxygenBar();
        this.updateCargoDisplay();
        this.updateSpeedDisplay();
        this.updateRarityDisplay();
        this.updateCoordinatesDisplay();
    }

    updateHealthBar() {
        const healthBar = this.uiElements.get('healthBar');
        const healthText = this.uiElements.get('healthText');
        
        if (!healthBar || !healthText) return;
        
        const healthPercent = Math.max(0, this.gameState.shipHealth / this.gameState.shipMaxHealth);
        
        // Anima mudança na barra
        if (Math.abs(healthBar.scaleX - healthPercent) > 0.01) {
            if (this.scene.uiAnimations) {
                this.scene.uiAnimations.animateBar(healthBar, healthBar.scaleX, healthPercent, 250);
            } else {
                healthBar.setScale(healthPercent, 1);
            }
        }
        
        // Atualiza texto
        healthText.setText(`${Math.round(this.gameState.shipHealth)}/${this.gameState.shipMaxHealth}`);
        
        // Efeito de glow quando vida está baixa
        if (healthPercent < 0.3 && !healthText._glowing) {
            healthText._glowing = true;
            if (this.scene.uiAnimations) {
                this.scene.uiAnimations.glowPulse(healthText, '#ff0000');
            }
        } else if (healthPercent >= 0.3 && healthText._glowing) {
            healthText._glowing = false;
            if (this.scene.uiAnimations) {
                this.scene.uiAnimations.removeGlow(healthText);
            }
        }
    }

    updateFuelBar() {
        const fuelBar = this.uiElements.get('fuelBar');
        const fuelText = this.uiElements.get('fuelText');
        
        if (!fuelBar || !fuelText) return;
        
        const fuelPercent = Math.max(0, this.gameState.shipFuel / this.gameState.shipMaxFuel);
        
        // Anima mudança na barra
        if (Math.abs(fuelBar.scaleX - fuelPercent) > 0.01) {
            if (this.scene.uiAnimations) {
                this.scene.uiAnimations.animateBar(fuelBar, fuelBar.scaleX, fuelPercent, 200, 'Linear');
            } else {
                fuelBar.setScale(fuelPercent, 1);
            }
        }
        
        // Atualiza texto
        fuelText.setText(`${Math.round(this.gameState.shipFuel)}/${this.gameState.shipMaxFuel}`);
        
        // Muda cor quando combustível está baixo
        if (fuelPercent < 0.2 && !fuelBar._pulsing) {
            fuelBar._pulsing = true;
            fuelBar.setFillStyle(0xff6600);
        } else if (fuelPercent >= 0.2 && fuelBar._pulsing) {
            fuelBar._pulsing = false;
            fuelBar.setFillStyle(0x00aaff);
        }
    }

    updateOxygenBar() {
        const oxygenBar = this.uiElements.get('oxygenBar');
        const oxygenText = this.uiElements.get('oxygenText');
        
        if (!oxygenBar || !oxygenText) return;
        
        const oxygenPercent = Math.max(0, this.gameState.shipOxygen / this.gameState.shipMaxOxygen);
        
        // Anima mudança na barra
        if (Math.abs(oxygenBar.scaleX - oxygenPercent) > 0.01) {
            if (this.scene.uiAnimations) {
                this.scene.uiAnimations.animateBar(oxygenBar, oxygenBar.scaleX, oxygenPercent, 200, 'Linear');
            } else {
                oxygenBar.setScale(oxygenPercent, 1);
            }
        }
        
        // Atualiza texto
        oxygenText.setText(`${Math.round(this.gameState.shipOxygen)}/${this.gameState.shipMaxOxygen}`);
        
        // Muda cor baseada no nível
        if (oxygenPercent < 0.25) {
            oxygenBar.setFillStyle(0xff0000); // Vermelho quando crítico
        } else if (oxygenPercent < 0.5) {
            oxygenBar.setFillStyle(0xffaa00); // Laranja quando baixo
        } else {
            oxygenBar.setFillStyle(0x00ccff); // Azul normal
        }
    }

    updateCargoDisplay() {
        const cargoText = this.uiElements.get('cargoText');
        
        if (!cargoText) return;
        
        cargoText.setText(`${this.gameState.currentCargo}/${this.gameState.shipCargoCapacity} kg`);
        
        // Muda cor baseada na capacidade
        const cargoPercent = this.gameState.currentCargo / this.gameState.shipCargoCapacity;
        if (cargoPercent >= 0.9) {
            cargoText.setColor('#ff4444'); // Vermelho quando quase cheio
        } else if (cargoPercent >= 0.7) {
            cargoText.setColor('#ffaa00'); // Laranja quando 70% cheio
        } else {
            cargoText.setColor('#ffaa00'); // Laranja normal
        }
    }

    updateSpeedDisplay() {
        const speedText = this.uiElements.get('speedText');
        
        if (!speedText || !this.scene.ship) return;
        
        const velocity = this.scene.ship.body.velocity;
        const speed = Math.round(Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y));
        
        speedText.setText(`🚀 SPEED: ${speed}/${this.gameState.shipMaxSpeed} km/h`);
        
        // Muda a cor da velocidade com base na velocidade
        const speedPercent = Math.min(1, speed / this.gameState.shipMaxSpeed);
        const r = Math.round(85 + 170 * speedPercent);
        const g = Math.round(170 - 170 * speedPercent);
        const b = 255;
        speedText.setColor(`rgb(${r},${g},${b})`);
    }

    updateRarityDisplay() {
        const rarityText = this.uiElements.get('rarityText');
        
        if (!rarityText || !this.gameState.shipMetadata) return;
        
        const raridade = this.getAttributeValue(this.gameState.shipMetadata.attributes, 'Raridade') || 'Comum';
        rarityText.setText(`⭐ ${raridade.toUpperCase()}`);
        rarityText.setColor(this.getRarityColor(raridade));
    }

    updateCoordinatesDisplay() {
        const coordsText = this.uiElements.get('coordsText');
        const chunkText = this.uiElements.get('chunkText');
        const zoneText = this.uiElements.get('zoneText');
        const playersText = this.uiElements.get('playersText');
        
        if (!coordsText || !chunkText || !zoneText || !playersText) return;
        
        // Obter posição da nave
        const ship = this.scene.shipManager?.ship;
        if (!ship) return;
        
        const x = Math.round(ship.x);
        const y = Math.round(ship.y);
        
        // Atualizar coordenadas
        coordsText.setText(`X: ${x} | Y: ${y}`);
        
        // Calcular chunk
        const chunkX = Math.floor(x / 1000);
        const chunkY = Math.floor(y / 1000);
        chunkText.setText(`Chunk: (${chunkX}, ${chunkY})`);
        
        // Calcular distância da origem para determinar zona
        const distance = Math.sqrt(chunkX * chunkX + chunkY * chunkY);
        let zoneName = 'Safe';
        let zoneColor = '#00ff88'; // Verde
        
        if (distance >= 50) {
            zoneName = 'Hostile (PvP)';
            zoneColor = '#ff4444'; // Vermelho
        } else if (distance >= 20) {
            zoneName = 'Transition';
            zoneColor = '#ffaa00'; // Laranja
        }
        
        zoneText.setText(`Zona: ${zoneName}`);
        zoneText.setColor(zoneColor);
        
        // Contar players no chunk atual
        const multiplayerManager = this.scene.multiplayerManager;
        let playersInChunk = 1; // Você mesmo
        
        console.log('🔍 UIManager: Contando players...');
        console.log('🔍 UIManager: multiplayerManager:', !!multiplayerManager);
        console.log('🔍 UIManager: otherPlayers:', multiplayerManager?.otherPlayers);
        console.log('🔍 UIManager: otherPlayers.size:', multiplayerManager?.otherPlayers?.size);
        
        if (multiplayerManager && multiplayerManager.otherPlayers) {
            const currentChunk = `${chunkX},${chunkY}`;
            console.log('🔍 UIManager: currentChunk:', currentChunk);
            
            multiplayerManager.otherPlayers.forEach((player, playerId) => {
                console.log(`🔍 UIManager: Player ${playerId}:`, player);
                console.log(`🔍 UIManager: player.data:`, player.data);
                console.log(`🔍 UIManager: player.data?.current_chunk:`, player.data?.current_chunk);
                
                if (player.data && player.data.current_chunk === currentChunk) {
                    console.log(`🔍 UIManager: ✅ Player ${playerId} está no chunk atual`);
                    playersInChunk++;
                } else {
                    console.log(`🔍 UIManager: ❌ Player ${playerId} NÃO está no chunk atual`);
                }
            });
        }
        
        console.log('🔍 UIManager: Total playersInChunk:', playersInChunk);
        playersText.setText(`Players: ${playersInChunk}`);
        
        // Mudar cor baseado na quantidade de players
        if (playersInChunk > 1) {
            playersText.setColor('#00ff88'); // Verde quando tem outros players
        } else {
            playersText.setColor('#ffaa00'); // Laranja quando está sozinho
        }
    }

    // === CRYPTO DISPLAY ===
    updateCryptoDisplay(oldValue, newValue) {
        const cryptoText = this.uiElements.get('cryptoText');
        
        if (!cryptoText) return;
        
        // Anima contador se disponível
        if (this.scene.uiAnimations) {
            this.scene.uiAnimations.animateCounter(
                cryptoText, 
                oldValue, 
                newValue, 
                500,
                (value) => `${value.toFixed(2)}`
            );
        } else {
            cryptoText.setText(newValue.toFixed(2));
        }
    }

    // === UTILITY METHODS ===
    getAttributeValue(attributes, traitType) {
        if (!attributes || !Array.isArray(attributes)) return null;
        
        const attribute = attributes.find(attr => 
            attr.trait_type === traitType || attr.trait_type === traitType.toLowerCase()
        );
        
        return attribute ? attribute.value : null;
    }

    getRarityColor(rarity) {
        const colors = {
            'Comum': '#CCCCCC',
            'Incomum': '#00FF00',
            'Raro': '#0080FF',
            'Épico': '#A020F0',
            'Lendário': '#FFD700'
        };
        return colors[rarity] || '#FFFFFF';
    }

    // === CLEANUP ===
    destroy() {
        this.uiElements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        this.uiElements.clear();
    }
}
