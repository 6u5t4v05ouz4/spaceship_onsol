/**
 * Cache Manager
 * Gerencia estado em tempo real dos jogadores em memória
 * Sincroniza com Supabase em intervalos ou eventos críticos
 */

import { supabaseAdmin } from '../config/supabase.js';
import logger from '../utils/logger.js';

class CacheManager {
  constructor() {
    // Map de jogadores online: playerId -> playerData
    this.playersOnline = new Map();

    // Set de IDs que precisam de update crítico (health = 0, etc)
    this.criticalUpdates = new Set();

    // Set de IDs que precisam de batch update (resources, position)
    this.batchUpdates = new Set();

    // Intervalo de sync (5 segundos)
    this.syncInterval = null;
    this.SYNC_INTERVAL_MS = 5000;

    // Estatísticas
    this.stats = {
      totalPlayers: 0,
      totalUpdates: 0,
      totalCriticalUpdates: 0,
      lastSyncAt: null,
    };
  }

  /**
   * Inicia o cache manager
   */
  start() {
    logger.info('🚀 Cache Manager iniciado');

    // Iniciar sync periódico
    this.syncInterval = setInterval(() => {
      this.syncToDatabase();
    }, this.SYNC_INTERVAL_MS);
  }

  /**
   * Para o cache manager
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    // Sync final antes de parar
    this.syncToDatabase();

    logger.info('✅ Cache Manager parado');
  }

  /**
   * Adiciona jogador ao cache
   * @param {string} playerId - UUID do player
   * @param {Object} data - Dados do player
   */
  addPlayer(playerId, data) {
    this.playersOnline.set(playerId, {
      ...data,
      is_in_game: false, // Por padrão, jogadores não estão no multiplayer
      lastUpdate: Date.now(),
    });

    this.stats.totalPlayers = this.playersOnline.size;

    logger.debug(`➕ Player adicionado ao cache: ${data.username} (${playerId}) - is_in_game: false`);
  }

  /**
   * Remove jogador do cache
   * @param {string} playerId - UUID do player
   */
  removePlayer(playerId) {
    const player = this.playersOnline.get(playerId);

    if (player) {
      // Marcar para sync final
      this.batchUpdates.add(playerId);

      // Remover do cache
      this.playersOnline.delete(playerId);

      this.stats.totalPlayers = this.playersOnline.size;

      logger.debug(`➖ Player removido do cache: ${player.username} (${playerId})`);
    }
  }

  /**
   * Obtém jogador do cache
   * @param {string} playerId - UUID do player
   * @returns {Object|null}
   */
  getPlayer(playerId) {
    return this.playersOnline.get(playerId) || null;
  }

  /**
   * Obtém jogador por socket ID
   * @param {string} socketId - ID do socket
   * @returns {Object|null}
   */
  getPlayerBySocket(socketId) {
    for (const [playerId, player] of this.playersOnline.entries()) {
      if (player.socketId === socketId) {
        return { ...player, id: playerId };
      }
    }
    return null;
  }

  /**
   * Atualiza posição do jogador
   * @param {string} playerId - UUID do player
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @param {string} currentChunk - Chunk atual (formato: "x,y")
   */
  updatePosition(playerId, x, y, currentChunk) {
    const player = this.playersOnline.get(playerId);

    if (player) {
      player.x = x;
      player.y = y;
      player.current_chunk = currentChunk;
      player.lastUpdate = Date.now();

      // Marcar para batch update
      this.batchUpdates.add(playerId);

      logger.debug(`📍 Posição atualizada: ${player.username} -> (${x}, ${y}) chunk ${currentChunk}`);
    }
  }

  /**
   * Aplica dano ao jogador
   * @param {string} playerId - UUID do player
   * @param {number} damage - Quantidade de dano
   * @returns {number} Health atual após dano
   */
  takeDamage(playerId, damage) {
    const player = this.playersOnline.get(playerId);

    if (!player) {
      logger.warn(`⚠️ Player ${playerId} não encontrado no cache`);
      return 0;
    }

    // Aplicar dano
    player.health = Math.max(0, player.health - damage);
    player.lastUpdate = Date.now();

    logger.debug(`💥 Dano aplicado: ${player.username} -${damage} HP (${player.health}/${player.max_health})`);

    // Se morreu, marcar como crítico
    if (player.health === 0) {
      this.criticalUpdates.add(playerId);
      this.stats.totalCriticalUpdates++;
      logger.warn(`💀 Player morreu: ${player.username}`);
    } else {
      this.batchUpdates.add(playerId);
    }

    this.stats.totalUpdates++;

    return player.health;
  }

  /**
   * Coleta recursos
   * @param {string} playerId - UUID do player
   * @param {number} amount - Quantidade de recursos
   * @returns {number} Total de recursos após coleta
   */
  collectResources(playerId, amount) {
    const player = this.playersOnline.get(playerId);

    if (!player) {
      logger.warn(`⚠️ Player ${playerId} não encontrado no cache`);
      return 0;
    }

    // Adicionar recursos
    player.resources = (player.resources || 0) + amount;
    player.lastUpdate = Date.now();

    // Marcar para batch update
    this.batchUpdates.add(playerId);

    this.stats.totalUpdates++;

    logger.debug(`⛏️ Recursos coletados: ${player.username} +${amount} (total: ${player.resources})`);

    return player.resources;
  }

  /**
   * Obtém todos os jogadores em um chunk (apenas jogadores ativos no multiplayer)
   * @param {string} chunkId - ID do chunk (formato: "x,y")
   * @returns {Array<Object>}
   */
  getPlayersInChunk(chunkId) {
    const players = [];

    for (const [playerId, player] of this.playersOnline.entries()) {
      // Apenas incluir jogadores que estão no multiplayer (is_in_game = true)
      if (player.current_chunk === chunkId && player.is_in_game) {
        players.push({ ...player, id: playerId });
      }
    }

    return players;
  }

  /**
   * Obtém todos os jogadores online
   * @returns {Array<Object>}
   */
  getAllPlayers() {
    const players = [];

    for (const [playerId, player] of this.playersOnline.entries()) {
      players.push({ ...player, id: playerId });
    }

    return players;
  }

  /**
   * Atualiza status do jogador no multiplayer
   * @param {string} playerId - UUID do player
   * @param {boolean} isInGame - Se está no multiplayer
   */
  setPlayerGameStatus(playerId, isInGame) {
    const player = this.playersOnline.get(playerId);

    if (player) {
      player.is_in_game = isInGame;
      player.lastUpdate = Date.now();

      logger.debug(`🎮 Status do jogo atualizado: ${player.username} is_in_game=${isInGame}`);
    }
  }

  /**
   * Sincroniza cache com banco de dados
   */
  async syncToDatabase() {
    try {
      // 1. Processar updates críticos primeiro
      if (this.criticalUpdates.size > 0) {
        await this.processCriticalUpdates();
      }

      // 2. Processar batch updates
      if (this.batchUpdates.size > 0) {
        await this.processBatchUpdates();
      }

      this.stats.lastSyncAt = new Date().toISOString();

      logger.debug(
        `🔄 Sync completo: ${this.criticalUpdates.size} críticos, ${this.batchUpdates.size} batch`
      );
    } catch (error) {
      logger.error('❌ Erro ao sincronizar cache:', error);
    }
  }

  /**
   * Processa updates críticos (morte, etc)
   */
  async processCriticalUpdates() {
    const updates = [];

    for (const playerId of this.criticalUpdates) {
      const player = this.playersOnline.get(playerId);

      if (player) {
        updates.push({
          id: playerId,
          health: player.health,
          x: player.x,
          y: player.y,
          current_chunk: player.current_chunk,
          resources: player.resources,
          is_online: player.health > 0, // Se morreu, marca como offline
          updated_at: new Date().toISOString(),
        });
      }
    }

    if (updates.length > 0) {
      // Upsert em batch
      const { error } = await supabaseAdmin.from('player_state').upsert(updates, {
        onConflict: 'id',
      });

      if (error) {
        logger.error('❌ Erro ao processar updates críticos:', error);
      } else {
        logger.info(`✅ ${updates.length} updates críticos salvos`);
        this.criticalUpdates.clear();
      }
    }
  }

  /**
   * Processa batch updates (posição, recursos)
   */
  async processBatchUpdates() {
    const updates = [];

    for (const playerId of this.batchUpdates) {
      const player = this.playersOnline.get(playerId);

      if (player) {
        updates.push({
          id: playerId,
          x: player.x,
          y: player.y,
          current_chunk: player.current_chunk,
          resources: player.resources,
          health: player.health,
          energy: player.energy,
          updated_at: new Date().toISOString(),
        });
      }
    }

    if (updates.length > 0) {
      // Upsert em batch
      const { error } = await supabaseAdmin.from('player_state').upsert(updates, {
        onConflict: 'id',
      });

      if (error) {
        logger.error('❌ Erro ao processar batch updates:', {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          updates: updates.map(u => ({ id: u.id, chunk: u.current_chunk }))
        });
      } else {
        logger.debug(`✅ ${updates.length} batch updates salvos`);
        this.batchUpdates.clear();
      }
    }
  }

  /**
   * Obtém estatísticas do cache
   * @returns {Object}
   */
  getStats() {
    return {
      ...this.stats,
      playersOnline: this.playersOnline.size,
      pendingCriticalUpdates: this.criticalUpdates.size,
      pendingBatchUpdates: this.batchUpdates.size,
    };
  }
}

// Singleton
const cacheManager = new CacheManager();

export default cacheManager;

