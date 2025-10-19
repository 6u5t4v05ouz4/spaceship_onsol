/**
 * Chunk Generator
 * Geração procedural de asteroides e conteúdo de chunks
 */

import zoneManager from '../managers/zone-manager.js';
import logger from '../utils/logger.js';

class ChunkGenerator {
  constructor() {
    // Tipos de recursos
    this.resourceTypes = ['iron', 'copper', 'silver', 'gold', 'platinum', 'crystal'];

    // Tamanhos de asteroides
    this.asteroidSizes = ['small', 'medium', 'large'];
  }

  /**
   * Gera número pseudo-aleatório baseado em seed
   * @param {string} seed
   * @param {number} index
   * @returns {number} Entre 0 e 1
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
   * Seleciona tipo de recurso baseado em raridade e zona
   * @param {number} random - 0 a 1
   * @param {number} lootMultiplier
   * @returns {string}
   */
  selectResourceType(random, lootMultiplier) {
    // Recursos mais raros em zonas mais distantes
    const adjustedRandom = random * (2 - lootMultiplier * 0.2);

    if (adjustedRandom < 0.4) return 'iron'; // 40%
    if (adjustedRandom < 0.7) return 'copper'; // 30%
    if (adjustedRandom < 0.85) return 'silver'; // 15%
    if (adjustedRandom < 0.95) return 'gold'; // 10%
    if (adjustedRandom < 0.99) return 'platinum'; // 4%
    return 'crystal'; // 1%
  }

  /**
   * Seleciona tamanho do asteroide
   * @param {number} random - 0 a 1
   * @returns {string}
   */
  selectAsteroidSize(random) {
    if (random < 0.5) return 'small'; // 50%
    if (random < 0.85) return 'medium'; // 35%
    return 'large'; // 15%
  }

  /**
   * Calcula quantidade de recursos baseado em tamanho
   * @param {string} size
   * @param {number} lootMultiplier
   * @returns {number}
   */
  calculateResources(size, lootMultiplier) {
    const baseResources = {
      small: 50,
      medium: 100,
      large: 200,
    };

    const base = baseResources[size] || 100;
    const randomVariation = 0.8 + Math.random() * 0.4; // 80% - 120%

    return Math.floor(base * lootMultiplier * randomVariation);
  }

  /**
   * Gera posição dentro do chunk (evitando sobreposição)
   * @param {number} index
   * @param {number} total
   * @param {string} seed
   * @param {Array} existingPositions
   * @returns {Object} {x, y}
   */
  generatePosition(index, total, seed, existingPositions = []) {
    const chunkSize = 1000; // Tamanho do chunk em unidades
    const minDistance = 80; // Distância mínima entre asteroides

    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      const randomX = this.seededRandom(seed, index * 2 + attempts);
      const randomY = this.seededRandom(seed, index * 2 + 1 + attempts);

      const x = Math.floor(randomX * chunkSize - chunkSize / 2);
      const y = Math.floor(randomY * chunkSize - chunkSize / 2);

      // Verificar distância de outros asteroides
      const tooClose = existingPositions.some((pos) => {
        const dx = pos.x - x;
        const dy = pos.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < minDistance;
      });

      if (!tooClose) {
        return { x, y };
      }

      attempts++;
    }

    // Fallback: posição em grid
    const gridSize = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const spacing = chunkSize / (gridSize + 1);

    return {
      x: Math.floor(col * spacing - chunkSize / 2 + spacing),
      y: Math.floor(row * spacing - chunkSize / 2 + spacing),
    };
  }

  /**
   * Gera asteroides para um chunk
   * @param {number} chunkX
   * @param {number} chunkY
   * @param {string} chunkId - UUID do chunk no banco
   * @returns {Array<Object>}
   */
  generateAsteroids(chunkX, chunkY, chunkId) {
    const zoneInfo = zoneManager.getZoneInfo(chunkX, chunkY);
    const { seed, asteroidCount, lootMultiplier } = zoneInfo;

    const asteroids = [];
    const existingPositions = [];

    for (let i = 0; i < asteroidCount; i++) {
      // Posição
      const position = this.generatePosition(i, asteroidCount, seed, existingPositions);
      existingPositions.push(position);

      // Tamanho
      const sizeRandom = this.seededRandom(seed, i * 100);
      const size = this.selectAsteroidSize(sizeRandom);

      // Tipo de recurso
      const resourceRandom = this.seededRandom(seed, i * 100 + 50);
      const resourceType = this.selectResourceType(resourceRandom, lootMultiplier);

      // Quantidade de recursos
      const resources = this.calculateResources(size, lootMultiplier);

      // Rotação
      const rotationRandom = this.seededRandom(seed, i * 100 + 75);
      const rotation = rotationRandom * 360;

      asteroids.push({
        chunk_id: chunkId,
        x: position.x,
        y: position.y,
        resources,
        max_resources: resources,
        resource_type: resourceType,
        size,
        rotation,
        is_depleted: false,
      });
    }

    logger.debug(
      `🪨 Gerados ${asteroids.length} asteroides para chunk (${chunkX}, ${chunkY}) - Zona: ${zoneInfo.zone}`
    );

    return asteroids;
  }

  /**
   * Regenera recursos de um asteroide depletado
   * @param {Object} asteroid
   * @param {number} regenerationRate - 0.0 a 1.0
   * @returns {Object} Asteroide atualizado
   */
  regenerateAsteroid(asteroid, regenerationRate = 0.1) {
    if (!asteroid.is_depleted) {
      return asteroid;
    }

    const newResources = Math.min(
      asteroid.max_resources,
      asteroid.resources + Math.floor(asteroid.max_resources * regenerationRate)
    );

    return {
      ...asteroid,
      resources: newResources,
      is_depleted: newResources === 0,
    };
  }

  /**
   * Gera informações completas de um chunk
   * @param {number} chunkX
   * @param {number} chunkY
   * @returns {Object}
   */
  generateChunkData(chunkX, chunkY) {
    const zoneInfo = zoneManager.getZoneInfo(chunkX, chunkY);

    return {
      chunk_x: chunkX,
      chunk_y: chunkY,
      zone_type: zoneInfo.zone,
      distance_from_origin: zoneInfo.distance,
      loot_multiplier: zoneInfo.lootMultiplier,
      pvp_allowed: zoneInfo.pvpAllowed,
      seed: zoneInfo.seed,
      biome_type: zoneInfo.biome,
    };
  }

  /**
   * Obtém estatísticas do gerador
   * @returns {Object}
   */
  getStats() {
    return {
      resourceTypes: this.resourceTypes,
      asteroidSizes: this.asteroidSizes,
      chunkSize: 1000,
      minAsteroidDistance: 80,
    };
  }
}

// Singleton
const chunkGenerator = new ChunkGenerator();

export default chunkGenerator;

