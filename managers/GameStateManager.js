/**
 * GameStateManager - Gerencia o estado global do jogo
 * Responsabilidades:
 * - Estado do jogador (vida, combustível, oxigênio, carga)
 * - Pontuação e estatísticas
 * - Transições de estado (jogando, pausado, game over)
 * - Persistência de dados
 */
export default class GameStateManager {
    constructor(scene) {
        this.scene = scene;
        this.reset();
    }

    reset() {
        // Estado do jogador
        this.playerName = 'Pilot';
        this.shipMaxHealth = 100;
        this.shipHealth = 100;
        this.shipMaxFuel = 100;
        this.shipFuel = 100;
        this.shipMaxOxygen = 100;
        this.shipOxygen = 100;
        this.shipCargoCapacity = 50;
        this.currentCargo = 0;
        
        // Estatísticas do jogo
        this.cryptoBalance = 0;
        this.enemiesKilled = 0;
        this.meteorsDestroyed = 0;
        this.score = 0;
        this.level = 1;
        
        // Estado do jogo
        this.isGameOver = false;
        this.isPaused = false;
        this.gameStartTime = Date.now();
        
        // Configurações da nave
        this.shipMaxSpeed = 500;
        this.shipAcceleration = 800;
        this.fuelConsumptionRate = 20;
        this.fuelRechargeRate = 10;
        this.oxygenConsumptionRate = 1;
        
        // Metadata da nave
        this.shipMetadata = null;
    }

    // === GETTERS ===
    getPlayerStats() {
        return {
            name: this.playerName,
            health: this.shipHealth,
            maxHealth: this.shipMaxHealth,
            fuel: this.shipFuel,
            maxFuel: this.shipMaxFuel,
            oxygen: this.shipOxygen,
            maxOxygen: this.shipMaxOxygen,
            cargo: this.currentCargo,
            maxCargo: this.shipCargoCapacity,
            crypto: this.cryptoBalance
        };
    }

    getGameStats() {
        return {
            score: this.score,
            level: this.level,
            enemiesKilled: this.enemiesKilled,
            meteorsDestroyed: this.meteorsDestroyed,
            playTime: Date.now() - this.gameStartTime
        };
    }

    // === SETTERS ===
    setPlayerName(name) {
        this.playerName = name;
    }

    setShipCharacteristics(characteristics) {
        Object.assign(this, characteristics);
        // Reinicializa valores atuais
        this.shipFuel = this.shipMaxFuel;
        this.shipOxygen = this.shipMaxOxygen;
        this.shipHealth = this.shipMaxHealth;
        this.currentCargo = 0;
    }

    // === HEALTH MANAGEMENT ===
    takeDamage(amount) {
        if (this.isGameOver) return false;
        
        this.shipHealth = Math.max(0, this.shipHealth - amount);
        
        if (this.shipHealth <= 0) {
            this.triggerGameOver('Vida esgotada!');
            return true;
        }
        
        return false;
    }

    heal(amount) {
        this.shipHealth = Math.min(this.shipMaxHealth, this.shipHealth + amount);
    }

    // === FUEL MANAGEMENT ===
    consumeFuel(amount) {
        this.shipFuel = Math.max(0, this.shipFuel - amount);
        return this.shipFuel > 0;
    }

    rechargeFuel(amount) {
        this.shipFuel = Math.min(this.shipMaxFuel, this.shipFuel + amount);
    }

    // === OXYGEN MANAGEMENT ===
    consumeOxygen(amount) {
        this.shipOxygen = Math.max(0, this.shipOxygen - amount);
        
        if (this.shipOxygen <= 0) {
            this.triggerGameOver('Oxigênio esgotado!');
            return false;
        }
        
        return true;
    }

    // === CARGO MANAGEMENT ===
    addCargo(amount) {
        const canAdd = this.currentCargo + amount <= this.shipCargoCapacity;
        if (canAdd) {
            this.currentCargo += amount;
        }
        return canAdd;
    }

    removeCargo(amount) {
        this.currentCargo = Math.max(0, this.currentCargo - amount);
    }

    // === CRYPTO MANAGEMENT ===
    addCrypto(amount) {
        this.cryptoBalance += amount;
        this.score += Math.floor(amount * 10); // Converte crypto em pontos
    }

    // === STATISTICS ===
    incrementEnemiesKilled() {
        this.enemiesKilled++;
        this.score += 100;
    }

    incrementMeteorsDestroyed() {
        this.meteorsDestroyed++;
        this.score += 50;
    }

    // === GAME STATE ===
    triggerGameOver(reason = '') {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        this.scene.events.emit('gameover', {
            reason,
            stats: this.getGameStats(),
            playerStats: this.getPlayerStats()
        });
    }

    pause() {
        this.isPaused = true;
        this.scene.events.emit('pause');
    }

    resume() {
        this.isPaused = false;
        this.scene.events.emit('resume');
    }

    // === PERSISTENCE ===
    saveToLocalStorage() {
        const saveData = {
            playerName: this.playerName,
            cryptoBalance: this.cryptoBalance,
            score: this.score,
            level: this.level,
            shipMetadata: this.shipMetadata,
            timestamp: Date.now()
        };
        
        localStorage.setItem('spaceCryptoMiner_save', JSON.stringify(saveData));
    }

    loadFromLocalStorage() {
        try {
            const saveData = localStorage.getItem('spaceCryptoMiner_save');
            if (saveData) {
                const data = JSON.parse(saveData);
                this.playerName = data.playerName || this.playerName;
                this.cryptoBalance = data.cryptoBalance || 0;
                this.score = data.score || 0;
                this.level = data.level || 1;
                this.shipMetadata = data.shipMetadata || null;
                return true;
            }
        } catch (error) {
            console.error('Erro ao carregar save:', error);
        }
        return false;
    }

    // === VALIDATION ===
    validateState() {
        const issues = [];
        
        if (this.shipHealth < 0 || this.shipHealth > this.shipMaxHealth) {
            issues.push('Health out of bounds');
        }
        
        if (this.shipFuel < 0 || this.shipFuel > this.shipMaxFuel) {
            issues.push('Fuel out of bounds');
        }
        
        if (this.shipOxygen < 0 || this.shipOxygen > this.shipMaxOxygen) {
            issues.push('Oxygen out of bounds');
        }
        
        if (this.currentCargo < 0 || this.currentCargo > this.shipCargoCapacity) {
            issues.push('Cargo out of bounds');
        }
        
        return issues;
    }
}
