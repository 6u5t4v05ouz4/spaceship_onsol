/**
 * Battle Events
 * Handlers para eventos WebSocket relacionados a combate
 */

import battleEngine from '../engines/battle-engine.js';
import cacheManager from '../managers/cache-manager.js';
import logger from '../utils/logger.js';

/**
 * Handler: battle:attack
 * Processa ataque PvP
 */
export async function handleAttack(socket, data, io) {
  try {
    const attacker = cacheManager.getPlayerBySocket(socket.id);

    if (!attacker) {
      socket.emit('battle:error', { message: 'Você não está autenticado' });
      return;
    }

    const { targetId } = data;

    if (!targetId) {
      socket.emit('battle:error', { message: 'Alvo não especificado' });
      return;
    }

    logger.debug(`⚔️ ${attacker.username} tentando atacar ${targetId}`);

    // Processar ataque
    const result = await battleEngine.processAttack(attacker.id, targetId, io);

    if (result.success) {
      // Confirmar ataque para o atacante
      socket.emit('battle:attack:success', {
        targetId,
        damage: result.damage,
        isCritical: result.isCritical,
        targetHealth: result.health,
        wasFatal: result.wasFatal,
      });
    } else {
      // Erro no ataque
      socket.emit('battle:attack:failed', {
        reason: result.reason,
      });
    }
  } catch (error) {
    logger.error('❌ Erro no handleAttack:', error);
    socket.emit('battle:error', { message: 'Erro ao processar ataque' });
  }
}

/**
 * Handler: battle:respawn
 * Processa respawn após morte
 */
export async function handleRespawn(socket, data, io) {
  try {
    const player = cacheManager.getPlayerBySocket(socket.id);

    if (!player) {
      socket.emit('battle:error', { message: 'Você não está autenticado' });
      return;
    }

    logger.debug(`🔄 ${player.username} solicitando respawn`);

    // Processar respawn
    const result = await battleEngine.processRespawn(player.id, io);

    if (result.success) {
      // Respawn bem-sucedido (já foi emitido pelo battleEngine)
      logger.info(`✅ ${player.username} respawnou com sucesso`);
    } else {
      socket.emit('battle:error', { message: result.reason });
    }
  } catch (error) {
    logger.error('❌ Erro no handleRespawn:', error);
    socket.emit('battle:error', { message: 'Erro ao processar respawn' });
  }
}

export default {
  handleAttack,
  handleRespawn,
};

