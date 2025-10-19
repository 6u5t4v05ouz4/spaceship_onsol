/**
 * ShipManager - Gerencia a nave do jogador
 * Responsabilidades:
 * - Criação e configuração da nave
 * - Movimento e física da nave
 * - Aplicação de características NFT
 * - Efeitos visuais (propulsão, trails)
 */
export default class ShipManager {
    constructor(scene, gameState) {
        this.scene = scene;
        this.gameState = gameState;
        this.ship = null;
        this.isThrusting = false;
        this.thrustEmitterId = null;
        this.playerNameText = null;
    }

    async create() {
        try {
            console.log('🔍 ShipManager: Iniciando criação da nave...');
            
        // Cria a nave base
        console.log('🔍 ShipManager: Criando sprite da nave...');
        // Criar com física, posicionando no centro do mundo compartilhado (0, 0)
        this.ship = this.scene.physics.add.sprite(0, 0, 'ship_idle');
        console.log('✅ ShipManager: Sprite criado:', this.ship);
        
        // Verifica se a nave foi criada corretamente
        if (!this.ship) {
            console.error('❌ ShipManager: Falha ao criar sprite da nave');
            return null;
        }
        
        console.log('🔍 ShipManager: Iniciando animação...');
        this.ship.play('ship_idle');
        console.log('✅ ShipManager: Animação iniciada');
            
            // Configura física da nave
            console.log('🔍 ShipManager: Configurando física...');
            this.setupPhysics();
            console.log('✅ ShipManager: Física configurada');
            
            // Cria efeitos visuais
            console.log('🔍 ShipManager: Configurando efeitos visuais...');
            this.setupVisualEffects();
            console.log('✅ ShipManager: Efeitos visuais configurados');
            
            // Cria texto do nome do jogador
            console.log('🔍 ShipManager: Criando texto do jogador...');
            this.createPlayerNameText();
            console.log('✅ ShipManager: Texto do jogador criado');
            
            // Aplica características da nave
            console.log('🔍 ShipManager: Aplicando características da nave...');
            await this.applyShipCharacteristics();
            console.log('✅ ShipManager: Características aplicadas');
            
            console.log('🎉 ShipManager: Nave criada com sucesso!');
            return this.ship;
        } catch (error) {
            console.error('❌ ShipManager: Erro na criação da nave:', error);
            console.error('❌ Stack trace:', error.stack);
            return null;
        }
    }

    setupPhysics() {
        try {
            // Ajusta corpo de colisão da nave (circle) para melhorar detecção
            this.ship.body.setCircle(Math.max(this.ship.width, this.ship.height) / 2 * 0.6);
            this.ship.body.setOffset(
                this.ship.width * 0.5 - (Math.max(this.ship.width, this.ship.height) / 2 * 0.6), 
                this.ship.height * 0.5 - (Math.max(this.ship.width, this.ship.height) / 2 * 0.6)
            );
            
            this.ship.setMaxVelocity(this.gameState.shipMaxSpeed);
            this.ship.setCollideWorldBounds(false);
        } catch (error) {
            console.error('❌ ShipManager: Erro na configuração da física:', error);
        }
    }

    setupVisualEffects() {
        // Cria efeito de propulsão com partículas
        // Verifica se os managers de efeitos estão disponíveis
        if (this.scene.particleEffects) {
            this.thrustEmitterId = this.scene.particleEffects.createThrustEffect(this.ship);
        } else {
            console.log('⚠️ ShipManager: ParticleEffects não disponível ainda');
        }
    }

    createPlayerNameText() {
        if (!this.ship) {
            console.warn('⚠️ ShipManager: Tentando criar texto do jogador sem nave');
            return;
        }
        
        this.playerNameText = this.scene.add.text(this.ship.x, this.ship.y + 40, this.gameState.playerName, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(5);
    }

    async applyShipCharacteristics() {
        // Carrega características padrão primeiro
        this.loadDefaultCharacteristics();
        
        // Se há wallet conectada, tenta carregar NFT
        if (this.scene.connectedWallet) {
            await this.loadNFTCharacteristics();
        }
    }

    loadDefaultCharacteristics() {
        try {
            // Sistema de raridades baseado na documentação
            const rarityLevels = {
                'Comum': {
                    speed: 100,
                    cargo: 50,
                    fuel: 100,
                    oxygen: 100,
                    shield: 100,
                    acceleration: 200,
                    fuelConsumption: 20,
                    fuelRecharge: 10,
                    color: '#CCCCCC',
                    description: 'Nave básica com características equilibradas'
                },
                'Incomum': {
                    speed: 200,
                    cargo: 100,
                    fuel: 150,
                    oxygen: 150,
                    shield: 200,
                    acceleration: 300,
                    fuelConsumption: 18,
                    fuelRecharge: 12,
                    color: '#00FF00',
                    description: 'Nave melhorada com vantagens moderadas'
                },
                'Raro': {
                    speed: 300,
                    cargo: 150,
                    fuel: 200,
                    oxygen: 200,
                    shield: 300,
                    acceleration: 400,
                    fuelConsumption: 16,
                    fuelRecharge: 14,
                    color: '#0080FF',
                    description: 'Nave avançada com características superiores'
                },
                'Épico': {
                    speed: 400,
                    cargo: 175,
                    fuel: 250,
                    oxygen: 250,
                    shield: 400,
                    acceleration: 500,
                    fuelConsumption: 14,
                    fuelRecharge: 16,
                    color: '#8000FF',
                    description: 'Nave épica com capacidades excepcionais'
                },
                'Lendário': {
                    speed: 500,
                    cargo: 200,
                    fuel: 300,
                    oxygen: 300,
                    shield: 500,
                    acceleration: 600,
                    fuelConsumption: 12,
                    fuelRecharge: 18,
                    color: '#FF8000',
                    description: 'Nave lendária com características máximas'
                }
            };

            // Por padrão, usa nave comum
            const selectedRarity = 'Comum'; // Pode ser alterado para testar outras raridades
            const rarityData = rarityLevels[selectedRarity];
            
            console.log(`🚀 Carregando nave de raridade: ${selectedRarity}`);
            console.log('📊 Características:', rarityData);
            
            this.gameState.setShipCharacteristics({
                shipMaxSpeed: rarityData.speed,
                shipCargoCapacity: rarityData.cargo,
                shipMaxFuel: rarityData.fuel,
                shipMaxOxygen: rarityData.oxygen,
                shipMaxHealth: rarityData.shield,
                shipAcceleration: rarityData.acceleration,
                fuelConsumptionRate: rarityData.fuelConsumption,
                fuelRechargeRate: rarityData.fuelRecharge,
                oxygenConsumptionRate: 1
            });
            
            // Cria metadata baseado na raridade
            this.gameState.shipMetadata = {
                name: `Space Miner ${selectedRarity}`,
                rarity: selectedRarity,
                rarityColor: rarityData.color,
                rarityDescription: rarityData.description,
                attributes: [
                    { trait_type: 'Raridade', value: selectedRarity },
                    { trait_type: 'Velocidade', value: rarityData.speed },
                    { trait_type: 'Carga', value: rarityData.cargo },
                    { trait_type: 'Combustível', value: rarityData.fuel },
                    { trait_type: 'Oxigênio', value: rarityData.oxygen },
                    { trait_type: 'Escudo', value: rarityData.shield }
                ]
            };
            
            console.log('✅ Características de raridade aplicadas:', selectedRarity);
            
        } catch (error) {
            console.error('❌ Erro ao carregar características de raridade:', error);
        }
    }

    async loadNFTCharacteristics() {
        try {
            const { findFirstNftImageForOwner, findFirstNftMetadataForOwner } = await import('../solana_nft.js');
            
            const [imageUrl, nftMetadata] = await Promise.all([
                findFirstNftImageForOwner(this.scene.connectedWallet, { network: 'devnet' }),
                findFirstNftMetadataForOwner(this.scene.connectedWallet, { network: 'devnet' })
            ]);
            
            if (imageUrl && nftMetadata) {
                console.log('Found NFT for wallet', this.scene.connectedWallet);
                
                // Aplica características do NFT
                this.applyNFTCharacteristics(nftMetadata);
                
                // Carrega e aplica textura do NFT
                await this.loadNFTSprite(imageUrl);
            }
        } catch (error) {
            console.error('Erro ao carregar NFT:', error);
        }
    }

    applyNFTCharacteristics(nftMetadata) {
        if (!nftMetadata || !nftMetadata.attributes) return;

        const attributes = nftMetadata.attributes;
        
        // Extrai atributos do NFT
        const characteristics = {
            shipMaxSpeed: this.getAttributeValue(attributes, 'Velocidade') || this.gameState.shipMaxSpeed,
            shipCargoCapacity: this.getAttributeValue(attributes, 'Carga') || this.gameState.shipCargoCapacity,
            shipMaxFuel: this.getAttributeValue(attributes, 'Combustível') || this.gameState.shipMaxFuel,
            shipMaxOxygen: this.getAttributeValue(attributes, 'Oxigênio') || this.gameState.shipMaxOxygen,
            shipMaxHealth: this.getAttributeValue(attributes, 'Escudo') || this.gameState.shipMaxHealth
        };
        
        this.gameState.setShipCharacteristics(characteristics);
        this.gameState.shipMetadata = nftMetadata;
        
        // Atualiza nome da nave
        if (nftMetadata.name && this.playerNameText) {
            this.playerNameText.setText(nftMetadata.name);
            const rarity = this.getAttributeValue(attributes, 'Raridade') || 'Comum';
            this.playerNameText.setColor(this.getRarityColor(rarity));
        }
        
        console.log('✅ Características NFT aplicadas:', characteristics);
    }

    async loadNFTSprite(imageUrl) {
        return new Promise((resolve) => {
            this.scene.load.image('nft_ship', imageUrl);
            this.scene.load.once('complete', () => {
                try {
                    const tex = this.scene.textures.get('nft_ship');
                    if (tex && tex.source && tex.source[0]) {
                        this.ship.setTexture('nft_ship');
                        
                        // Ajusta tamanho se muito grande
                        const maxScale = 0.6;
                        const w = this.ship.displayWidth;
                        const h = this.ship.displayHeight;
                        if (Math.max(w, h) > 256) {
                            this.ship.setScale(maxScale);
                        }
                    }
                } catch (e) {
                    console.warn('Failed to apply NFT texture', e);
                }
                resolve();
            });
            this.scene.load.start();
        });
    }

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

    // Método para trocar raridade (útil para testes)
    setRarityForTesting(rarity) {
        console.log(`🔄 Alterando raridade para: ${rarity}`);
        
        // Atualiza características do GameState
        const rarityLevels = {
            'Comum': { speed: 100, cargo: 50, fuel: 100, oxygen: 100, shield: 100, acceleration: 200 },
            'Incomum': { speed: 200, cargo: 100, fuel: 150, oxygen: 150, shield: 200, acceleration: 300 },
            'Raro': { speed: 300, cargo: 150, fuel: 200, oxygen: 200, shield: 300, acceleration: 400 },
            'Épico': { speed: 400, cargo: 175, fuel: 250, oxygen: 250, shield: 400, acceleration: 500 },
            'Lendário': { speed: 500, cargo: 200, fuel: 300, oxygen: 300, shield: 500, acceleration: 600 }
        };
        
        const rarityData = rarityLevels[rarity];
        if (rarityData) {
            this.gameState.setShipCharacteristics({
                shipMaxSpeed: rarityData.speed,
                shipCargoCapacity: rarityData.cargo,
                shipMaxFuel: rarityData.fuel,
                shipMaxOxygen: rarityData.oxygen,
                shipMaxHealth: rarityData.shield,
                shipAcceleration: rarityData.acceleration
            });
            console.log(`✅ Raridade alterada para: ${rarity}`);
        }
    }

    // === MOVEMENT CONTROL ===
    updateMovement(inputState, delta) {
        if (!this.ship || this.gameState.isGameOver) {
            console.log('⚠️ ShipManager: Nave não existe ou jogo acabou');
            return;
        }

        // Debug dos controles
        if (inputState.thrust) {
            console.log('🎮 Propulsão detectada:', {
                thrust: inputState.thrust,
                mouseX: this.scene.input.activePointer.x,
                mouseY: this.scene.input.activePointer.y
            });
            console.log('🔍 Nave posição atual:', { x: this.ship.x, y: this.ship.y });
        }

        // Rotação da nave baseada no mouse
        const worldPoint = this.scene.input.activePointer.positionToCamera(this.scene.cameras.main);
        this.ship.rotation = Phaser.Math.Angle.Between(
            this.ship.x, this.ship.y, 
            worldPoint.x, worldPoint.y
        ) + Math.PI / 2;

        // Controle de propulsão (movimento para frente na direção do mouse)
        if (inputState.thrust && this.gameState.shipFuel > 0) {
            this.startThrust(delta);
        } else {
            this.stopThrust();
            this.rechargeFuel(delta);
        }

        // Limita velocidade máxima
        this.limitVelocity();
    }

    startThrust(delta) {
        if (!this.isThrusting) {
            this.ship.play('ship_thrust', true);
            this.isThrusting = true;
            
            // Ativa efeito de propulsão
            if (this.thrustEmitterId && this.scene.particleEffects) {
                this.scene.particleEffects.setThrustEmitting(this.thrustEmitterId, true);
            }
            
            // Toca som do foguete
            if (this.scene.rocketSound && !this.scene.isRocketPlaying) {
                this.scene.rocketSound.play();
                this.scene.isRocketPlaying = true;
            }
        }

        // Aplica aceleração na direção da rotação da nave
        const angle = this.ship.rotation - Math.PI / 2; // Ajusta para direção correta
        const acceleration = this.gameState.shipAcceleration || 200;
        
        const vx = Math.cos(angle) * acceleration;
        const vy = Math.sin(angle) * acceleration;
        
        console.log('🚀 Aplicando propulsão:', {
            angle: angle,
            acceleration: acceleration,
            vx: vx,
            vy: vy,
            rotation: this.ship.rotation
        });
        
        this.ship.setAcceleration(vx, vy);

        // Consome combustível
        const deltaSec = delta / 1000;
        const fuelConsumed = this.gameState.fuelConsumptionRate * deltaSec;
        
        if (!this.gameState.consumeFuel(fuelConsumed)) {
            // Combustível esgotado
            this.ship.setAcceleration(0);
            this.ship.play('ship_idle', true);
            this.isThrusting = false;
            
            if (this.scene.isRocketPlaying) {
                this.scene.rocketSound.stop();
                this.scene.isRocketPlaying = false;
            }
        }
    }

    stopThrust() {
        if (this.isThrusting) {
            this.ship.play('ship_idle', true);
            this.isThrusting = false;
            
            // Desativa efeito de propulsão
            if (this.thrustEmitterId && this.scene.particleEffects) {
                this.scene.particleEffects.setThrustEmitting(this.thrustEmitterId, false);
            }
            
            // Para som do foguete
            if (this.scene.isRocketPlaying) {
                this.scene.rocketSound.stop();
                this.scene.isRocketPlaying = false;
            }
        }
        
        this.ship.setAcceleration(0);
    }

    rechargeFuel(delta) {
        const deltaSec = delta / 1000;
        const fuelRecharged = this.gameState.fuelRechargeRate * deltaSec;
        this.gameState.rechargeFuel(fuelRecharged);
    }

    limitVelocity() {
        const velocity = this.ship.body.velocity;
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        
        if (speed > this.gameState.shipMaxSpeed) {
            const ratio = this.gameState.shipMaxSpeed / speed;
            this.ship.setVelocity(velocity.x * ratio, velocity.y * ratio);
        }
    }

    // === UPDATE ===
    update() {
        if (!this.ship) return;

        // Atualiza posição do texto do nome
        if (this.playerNameText) {
            this.playerNameText.x = this.ship.x;
            this.playerNameText.y = this.ship.y + 40;
        }

        // Atualiza efeito de propulsão
        if (this.isThrusting && this.thrustEmitterId && this.scene.particleEffects) {
            this.scene.particleEffects.updateThrustEffect(this.thrustEmitterId);
        }
    }

    // === CLEANUP ===
    destroy() {
        if (this.thrustEmitterId && this.scene.particleEffects) {
            this.scene.particleEffects.removeEmitter(this.thrustEmitterId);
        }
        
        if (this.playerNameText) {
            this.playerNameText.destroy();
        }
        
        if (this.ship) {
            this.ship.destroy();
        }
    }
}
