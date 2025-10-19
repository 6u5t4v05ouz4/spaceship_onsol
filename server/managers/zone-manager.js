/**
 * Zone Manager
 * Gerencia zonas, regras e cálculos de distância
 */

import logger from '../utils/logger.js';

class ZoneManager {
  constructor() {
    // Definição de zonas
    this.zones = {
      safe: {
        name: 'Zona Segura',
        minDistance: 0,
        maxDistance: 20,
        pvpAllowed: false,
        lootMultiplier: 1.0,
        enemySpawnChance: 0,
        asteroidDensity: 'low', // low, medium, high
        color: '#00ff88',
      },
      transition: {
        name: 'Zona de Transição',
        minDistance: 20,
        maxDistance: 50,
        pvpAllowed: false,
        lootMultiplier: 1.5,
        enemySpawnChance: 0.3,
        asteroidDensity: 'medium',
        color: '#ffaa00',
      },
      hostile: {
        name: 'Zona Hostil',
        minDistance: 50,
        maxDistance: Infinity,
        pvpAllowed: true,
        lootMultiplier: 2.0,
        enemySpawnChance: 0.7,
        asteroidDensity: 'high',
        color: '#ff0000',
      },
    };
  }

  /**
   * Calcula distância euclidiana da origem
   * @param {number} chunkX
   * @param {number} chunkY
   * @returns {number}
   */
  calculateDistance(chunkX, chunkY) {
    return Math.sqrt(chunkX * chunkX + chunkY * chunkY);
  }

  /**
   * Determina zona baseada em coordenadas
   * @param {number} chunkX
   * @param {number} chunkY
   * @returns {Object} Zona com todas as propriedades
   */
  getZone(chunkX, chunkY) {
    const distance = this.calculateDistance(chunkX, chunkY);

    for (const [type, zone] of Object.entries(this.zones)) {
      if (distance >= zone.minDistance && distance < zone.maxDistance) {
        return {
          type,
          distance,
          ...zone,
        };
      }
    }

    // Fallback para zona hostil
    return {
      type: 'hostile',
      distance,
      ...this.zones.hostile,
    };
  }

  /**
   * Calcula loot multiplier baseado em distância
   * @param {number} distance
   * @returns {number}
   */
  calculateLootMultiplier(distance) {
    // Base: 1.0
    // +0.01 por unidade de distância
    // Max: 5.0
    return Math.min(1.0 + distance * 0.01, 5.0);
  }

  /**
   * Calcula densidade de asteroides
   * @param {string} density - 'low', 'medium', 'high'
   * @returns {number} Número de asteroides
   */
  getAsteroidCount(density) {
    const densityMap = {
      low: { min: 3, max: 8 },
      medium: { min: 8, max: 15 },
      high: { min: 15, max: 25 },
    };

    const range = densityMap[density] || densityMap.medium;
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  /**
   * Verifica se deve spawnar inimigo
   * @param {number} spawnChance - 0.0 a 1.0
   * @returns {boolean}
   */
  shouldSpawnEnemy(spawnChance) {
    return Math.random() < spawnChance;
  }

  /**
   * Calcula número de inimigos para spawnar
   * @param {number} spawnChance
   * @returns {number}
   */
  getEnemyCount(spawnChance) {
    if (!this.shouldSpawnEnemy(spawnChance)) {
      return 0;
    }

    // 1-3 inimigos em zonas de transição
    // 2-5 inimigos em zonas hostis
    if (spawnChance >= 0.7) {
      return Math.floor(Math.random() * 4) + 2; // 2-5
    } else if (spawnChance >= 0.3) {
      return Math.floor(Math.random() * 3) + 1; // 1-3
    }

    return 0;
  }

  /**
   * Gera seed determinística para um chunk
   * @param {number} chunkX
   * @param {number} chunkY
   * @returns {string}
   */
  generateSeed(chunkX, chunkY) {
    return `${chunkX},${chunkY}`;
  }

  /**
   * Determina bioma baseado em coordenadas
   * @param {number} chunkX
   * @param {number} chunkY
   * @returns {string}
   */
  getBiome(chunkX, chunkY) {
    const distance = this.calculateDistance(chunkX, chunkY);

    // Biomas baseados em distância e padrão
    const pattern = (chunkX + chunkY) % 4;

    if (distance < 10) {
      return 'asteroid_field';
    } else if (distance < 30) {
      return pattern === 0 ? 'asteroid_field' : 'nebula';
    } else if (distance < 60) {
      return pattern < 2 ? 'nebula' : 'debris_field';
    } else {
      return pattern === 0 ? 'asteroid_field' : pattern === 1 ? 'nebula' : 'void';
    }
  }

  /**
   * Valida se ação é permitida na zona
   * @param {string} zoneType
   * @param {string} action - 'pvp', 'mining', 'trading'
   * @returns {boolean}
   */
  isActionAllowed(zoneType, action) {
    const zone = this.zones[zoneType];

    if (!zone) {
      return false;
    }

    switch (action) {
      case 'pvp':
        return zone.pvpAllowed;
      case 'mining':
        return true; // Sempre permitido
      case 'trading':
        return zoneType === 'safe'; // Apenas em zona segura
      default:
        return false;
    }
  }

  /**
   * Obtém informações completas de uma zona
   * @param {number} chunkX
   * @param {number} chunkY
   * @returns {Object}
   */
  getZoneInfo(chunkX, chunkY) {
    const zone = this.getZone(chunkX, chunkY);
    const biome = this.getBiome(chunkX, chunkY);
    const seed = this.generateSeed(chunkX, chunkY);
    const asteroidCount = this.getAsteroidCount(zone.asteroidDensity);
    const enemyCount = this.getEnemyCount(zone.enemySpawnChance);

    return {
      chunkX,
      chunkY,
      zone: zone.type,
      zoneName: zone.name,
      distance: zone.distance,
      pvpAllowed: zone.pvpAllowed,
      lootMultiplier: this.calculateLootMultiplier(zone.distance),
      biome,
      seed,
      asteroidCount,
      enemyCount,
      color: zone.color,
    };
  }

  /**
   * Obtém estatísticas de todas as zonas
   * @returns {Object}
   */
  getZoneStats() {
    return {
      zones: Object.keys(this.zones).map((type) => ({
        type,
        ...this.zones[type],
      })),
      totalZones: Object.keys(this.zones).length,
    };
  }
}

// Singleton
const zoneManager = new ZoneManager();

export default zoneManager;

