/**
 * Movement Validator
 * Valida movimentos dos jogadores no servidor para prevenir cheats
 */

import logger from '../utils/logger.js';

class MovementValidator {
  constructor() {
    // Constantes de validação
    this.MAX_SPEED = 500; // pixels por segundo
    this.MAX_TELEPORT_DISTANCE = 2000; // distância máxima de teleport
    this.UPDATE_INTERVAL = 100; // intervalo de atualização esperado (ms)
    this.MAX_ACCELERATION = 1000; // aceleração máxima por segundo²

    // Cache de posições recentes por jogador
    this.playerHistory = new Map(); // playerId -> array de posições

    // Cleanup periódico
    this.lastCleanup = Date.now();
    this.CLEANUP_INTERVAL = 60000; // 1 minuto
  }

  /**
   * Valida movimento do jogador
   * @param {string} playerId - ID do jogador
   * @param {Object} newPosition - Nova posição {x, y, timestamp}
   * @param {Object} currentData - Dados atuais do jogador
   * @returns {Object} {valid: boolean, reason?: string}
   */
  validateMovement(playerId, newPosition, currentData) {
    try {
      // Cleanup periódico do histórico
      this.performCleanup();

      // Obter histórico do jogador
      const history = this.getPlayerHistory(playerId);

      // Se não há histórico, primeira posição é válida
      if (history.length === 0) {
        this.addPositionToHistory(playerId, newPosition);
        return { valid: true };
      }

      const lastPosition = history[history.length - 1];

      // 1. Validar dados básicos
      if (!this.validatePositionData(newPosition)) {
        return { valid: false, reason: 'invalid_position_data' };
      }

      // 2. Validar timestamp
      if (!this.validateTimestamp(newPosition, lastPosition)) {
        return { valid: false, reason: 'invalid_timestamp' };
      }

      // 3. Validar velocidade máxima
      const speedValidation = this.validateSpeed(newPosition, lastPosition);
      if (!speedValidation.valid) {
        logger.warn(`⚠️ Speed validation failed for player ${playerId}: ${speedValidation.reason}`);
        return speedValidation;
      }

      // 4. Validar teleport (distância muito grande em tempo curto)
      const teleportValidation = this.validateTeleport(newPosition, lastPosition);
      if (!teleportValidation.valid) {
        logger.warn(`⚠️ Teleport detected for player ${playerId}: ${teleportValidation.reason}`);
        return teleportValidation;
      }

      // 5. Validar aceleração (mudança brusca de velocidade)
      const accelerationValidation = this.validateAcceleration(newPosition, history);
      if (!accelerationValidation.valid) {
        logger.warn(`⚠️ Acceleration validation failed for player ${playerId}: ${accelerationValidation.reason}`);
        return accelerationValidation;
      }

      // 6. Validar bounds do mundo
      const boundsValidation = this.validateWorldBounds(newPosition, currentData);
      if (!boundsValidation.valid) {
        return boundsValidation;
      }

      // Adicionar ao histórico e retornar válido
      this.addPositionToHistory(playerId, newPosition);
      return { valid: true };

    } catch (error) {
      logger.error('❌ Erro na validação de movimento:', error);
      // Em caso de erro, permite o movimento para não quebrar o jogo
      return { valid: true };
    }
  }

  /**
   * Valida dados básicos da posição
   */
  validatePositionData(position) {
    return (
      position &&
      typeof position.x === 'number' && !isNaN(position.x) &&
      typeof position.y === 'number' && !isNaN(position.y) &&
      typeof position.timestamp === 'number' && position.timestamp > 0
    );
  }

  /**
   * Valida se o timestamp é válido e crescente
   */
  validateTimestamp(newPosition, lastPosition) {
    return newPosition.timestamp > lastPosition.timestamp;
  }

  /**
   * Valida velocidade máxima
   */
  validateSpeed(newPosition, lastPosition) {
    const deltaTime = (newPosition.timestamp - lastPosition.timestamp) / 1000; // segundos
    const deltaX = newPosition.x - lastPosition.x;
    const deltaY = newPosition.y - lastPosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const speed = distance / deltaTime;

    if (speed > this.MAX_SPEED) {
      return {
        valid: false,
        reason: `excessive_speed: ${speed.toFixed(2)}px/s > ${this.MAX_SPEED}px/s`
      };
    }

    return { valid: true };
  }

  /**
   * Valida teleports (movimentos impossíveis)
   */
  validateTeleport(newPosition, lastPosition) {
    const deltaX = newPosition.x - lastPosition.x;
    const deltaY = newPosition.y - lastPosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > this.MAX_TELEPORT_DISTANCE) {
      return {
        valid: false,
        reason: `teleport_detected: ${distance.toFixed(2)}px > ${this.MAX_TELEPORT_DISTANCE}px`
      };
    }

    return { valid: true };
  }

  /**
   * Valida aceleração (mudança brusca de velocidade)
   */
  validateAcceleration(newPosition, history) {
    if (history.length < 2) {
      return { valid: true }; // Não há dados suficientes
    }

    // Calcular velocidade atual
    const lastPos = history[history.length - 1];
    const currentSpeed = this.calculateSpeed(newPosition, lastPos);

    // Calcular velocidade anterior
    const prevPos = history[history.length - 2];
    const previousSpeed = this.calculateSpeed(lastPos, prevPos);

    // Calcular aceleração
    const deltaTime = (newPosition.timestamp - prevPos.timestamp) / 1000;
    const acceleration = Math.abs(currentSpeed - previousSpeed) / deltaTime;

    if (acceleration > this.MAX_ACCELERATION) {
      return {
        valid: false,
        reason: `excessive_acceleration: ${acceleration.toFixed(2)}px/s² > ${this.MAX_ACCELERATION}px/s²`
      };
    }

    return { valid: true };
  }

  /**
   * Valida bounds do mundo
   */
  validateWorldBounds(position, currentData) {
    // Definir bounds baseado no chunk atual ou mundo global
    const chunkX = Math.floor(position.x / 1000);
    const chunkY = Math.floor(position.y / 1000);

    // Permitir chunks entre -100 e 100 (mundo de 200x200 chunks)
    const MIN_CHUNK = -100;
    const MAX_CHUNK = 100;

    if (chunkX < MIN_CHUNK || chunkX > MAX_CHUNK ||
        chunkY < MIN_CHUNK || chunkY > MAX_CHUNK) {
      return {
        valid: false,
        reason: `out_of_bounds: chunk(${chunkX}, ${chunkY}) outside range [${MIN_CHUNK}, ${MAX_CHUNK}]`
      };
    }

    return { valid: true };
  }

  /**
   * Calcula velocidade entre duas posições
   */
  calculateSpeed(pos1, pos2) {
    const deltaTime = (pos1.timestamp - pos2.timestamp) / 1000;
    if (deltaTime <= 0) return 0;

    const deltaX = pos1.x - pos2.x;
    const deltaY = pos1.y - pos2.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    return distance / deltaTime;
  }

  /**
   * Obtém histórico de posições do jogador
   */
  getPlayerHistory(playerId) {
    if (!this.playerHistory.has(playerId)) {
      this.playerHistory.set(playerId, []);
    }
    return this.playerHistory.get(playerId);
  }

  /**
   * Adiciona posição ao histórico do jogador
   */
  addPositionToHistory(playerId, position) {
    const history = this.getPlayerHistory(playerId);
    history.push({
      x: position.x,
      y: position.y,
      timestamp: position.timestamp
    });

    // Manter apenas últimas 20 posições (últimos ~2 segundos a 100ms)
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
  }

  /**
   * Cleanup periódico de históricos antigos
   */
  performCleanup() {
    const now = Date.now();
    if (now - this.lastCleanup < this.CLEANUP_INTERVAL) {
      return;
    }

    this.lastCleanup = now;
    const cutoffTime = now - 300000; // 5 minutos

    let cleanedCount = 0;
    this.playerHistory.forEach((history, playerId) => {
      const originalLength = history.length;

      // Remover posições antigas
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].timestamp < cutoffTime) {
          history.splice(0, i + 1);
          break;
        }
      }

      // Remover histórico vazio
      if (history.length === 0) {
        this.playerHistory.delete(playerId);
      }

      cleanedCount += originalLength - history.length;
    });

    logger.debug(`🧹 MovementValidator cleanup: ${cleanedCount} posições removidas`);
  }

  /**
   * Obtém estatísticas de validação
   */
  getStats() {
    const totalPlayers = this.playerHistory.size;
    let totalPositions = 0;

    this.playerHistory.forEach(history => {
      totalPositions += history.length;
    });

    return {
      totalPlayers,
      totalPositions,
      averagePositionsPerPlayer: totalPlayers > 0 ? totalPositions / totalPlayers : 0,
      memoryUsage: Math.round(JSON.stringify([...this.playerHistory]).length / 1024) + ' KB'
    };
  }

  /**
   * Limpa histórico de um jogador específico (usado em disconnect)
   */
  clearPlayerHistory(playerId) {
    this.playerHistory.delete(playerId);
  }
}

// Singleton
const movementValidator = new MovementValidator();

export default movementValidator;