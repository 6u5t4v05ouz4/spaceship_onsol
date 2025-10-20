// =====================================================
// CHUNK GENERATOR - Sistema de Geração Compartilhada
// =====================================================

import databaseService from './database-service.js';
import logger from './utils/logger.js';

class ChunkGenerator {
  constructor() {
    this.generatedChunks = new Set();
  }

  /**
   * Gera elementos para um chunk específico
   */
  async generateChunkElements(chunkX, chunkY) {
    try {
      // Verificar se o chunk já foi gerado
      const existingElements = await databaseService.getChunkElements(chunkX, chunkY);
      if (existingElements.length > 0) {
        logger.info(`📦 Chunk (${chunkX}, ${chunkY}) já existe com ${existingElements.length} elementos`);
        return existingElements;
      }

      // Gerar seed determinístico para o chunk
      const seed = this.generateChunkSeed(chunkX, chunkY);
      await databaseService.setChunkSeed(chunkX, chunkY, seed);

      // Gerar elementos baseados no seed
      const elements = await this.generateElementsFromSeed(chunkX, chunkY, seed);
      
      logger.info(`🎲 Chunk (${chunkX}, ${chunkY}) gerado com ${elements.length} elementos`);
      return elements;

    } catch (error) {
      logger.error(`❌ Erro ao gerar chunk (${chunkX}, ${chunkY}):`, error);
      throw error;
    }
  }

  /**
   * Gera seed determinístico para o chunk
   */
  generateChunkSeed(chunkX, chunkY) {
    // Usar coordenadas do chunk para gerar seed determinístico
    const seed = `${chunkX},${chunkY}`;
    return seed;
  }

  /**
   * Gera elementos baseados no seed
   */
  async generateElementsFromSeed(chunkX, chunkY, seed) {
    const elements = [];
    
    // Configurações de densidade por chunk
    const config = {
      meteors: { count: 15, minDistance: 50 },
      npcs: { count: 8, minDistance: 80 },
      planets: { count: 5, minDistance: 100 }
    };

    // Gerar meteoros
    for (let i = 0; i < config.meteors.count; i++) {
      const position = this.generatePosition(seed, 'meteor', i, config.meteors.minDistance);
      const element = await databaseService.createElement(
        chunkX, chunkY, 'meteor', 
        position.x, position.y,
        {
          health: this.seededRandom(seed, `meteor-health-${i}`) * 100 + 50,
          speed: this.seededRandom(seed, `meteor-speed-${i}`) * 50 + 20,
          size: this.seededRandom(seed, `meteor-size-${i}`) * 0.5 + 0.5
        }
      );
      elements.push(element);
    }

    // Gerar NPCs
    for (let i = 0; i < config.npcs.count; i++) {
      const position = this.generatePosition(seed, 'npc', i, config.npcs.minDistance);
      const element = await databaseService.createElement(
        chunkX, chunkY, 'npc',
        position.x, position.y,
        {
          health: this.seededRandom(seed, `npc-health-${i}`) * 200 + 100,
          speed: this.seededRandom(seed, `npc-speed-${i}`) * 80 + 40,
          aiType: ['patrol', 'aggressive', 'defensive'][Math.floor(this.seededRandom(seed, `npc-ai-${i}`) * 3)]
        }
      );
      elements.push(element);
    }

    // Gerar planetas
    for (let i = 0; i < config.planets.count; i++) {
      const position = this.generatePosition(seed, 'planet', i, config.planets.minDistance);
      const element = await databaseService.createElement(
        chunkX, chunkY, 'planet',
        position.x, position.y,
        {
          miningRate: this.seededRandom(seed, `planet-rate-${i}`) * 0.5 + 0.1,
          resourceType: ['iron', 'gold', 'crystal'][Math.floor(this.seededRandom(seed, `planet-resource-${i}`) * 3)],
          capacity: this.seededRandom(seed, `planet-capacity-${i}`) * 1000 + 500
        }
      );
      elements.push(element);
    }

    return elements;
  }

  /**
   * Gera posição baseada no seed (determinístico)
   */
  generatePosition(seed, type, index, minDistance) {
    // Usar seed + tipo + índice para gerar posição determinística
    const seedString = `${seed}-${type}-${index}`;
    
    // Gerar posição dentro do chunk (1000x1000 unidades)
    const x = (this.seededRandom(seedString, 'x') - 0.5) * 1000;
    const y = (this.seededRandom(seedString, 'y') - 0.5) * 1000;
    
    return { x, y };
  }

  /**
   * Gera número pseudo-aleatório baseado em seed
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
   * Limpa elementos antigos
   */
  async cleanupOldElements() {
    try {
      await databaseService.cleanupOldElements();
    } catch (error) {
      logger.error('❌ Erro na limpeza de elementos:', error);
    }
  }
}

export default new ChunkGenerator();
