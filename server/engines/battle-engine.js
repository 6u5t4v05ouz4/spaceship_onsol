/**
 * Battle Engine
 * Sistema de combate PvP com validação de zona e distância
 */

import { supabaseAdmin } from '../config/supabase.js';
import cacheManager from '../managers/cache-manager.js';
import zoneManager from '../managers/zone-manager.js';
import logger from '../utils/logger.js';

class BattleEngine {
  constructor() {
    // Configurações de combate
    this.config = {
      maxAttackDistance: 500, // Distância máxima para atacar (unidades)
      baseDamage: 10, // Dano base
      armorReduction: 0.5, // Cada ponto de armadura reduz 0.5 de dano
      criticalChance: 0.1, // 10% de chance de crítico
      criticalMultiplier: 2.0, // Crítico causa 2x dano
      respawnDelay: 5000, // 5 segundos para respawn
    };
  }

  /**
   * Calcula distância entre dois jogadores
   * @param {Object} attacker
   * @param {Object} defender
   * @returns {number}
   */
  calculateDistance(attacker, defender) {
    const dx = attacker.x - defender.x;
    const dy = attacker.y - defender.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Valida se ataque é permitido
   * @param {Object} attacker
   * @param {Object} defender
   * @returns {Object} { valid: boolean, reason: string }
   */
  validateAttack(attacker, defender) {
    // 1. Validar se jogadores existem
    if (!attacker || !defender) {
      return { valid: false, reason: 'Jogador não encontrado' };
    }

    // 2. Validar se não é auto-ataque
    if (attacker.id === defender.id) {
      return { valid: false, reason: 'Não é possível atacar a si mesmo' };
    }

    // 3. Validar se defender está vivo
    if (defender.health <= 0) {
      return { valid: false, reason: 'Alvo já está morto' };
    }

    // 4. Validar se estão no mesmo chunk
    if (attacker.current_chunk !== defender.current_chunk) {
      return { valid: false, reason: 'Alvo está em outro chunk' };
    }

    // 5. Validar zona (PvP permitido?)
    const [chunkX, chunkY] = attacker.current_chunk.split(',').map(Number);
    const zone = zoneManager.getZone(chunkX, chunkY);

    if (!zone.pvpAllowed) {
      return { valid: false, reason: `PvP não permitido em ${zone.name}` };
    }

    // 6. Validar distância
    const distance = this.calculateDistance(attacker, defender);

    if (distance > this.config.maxAttackDistance) {
      return { valid: false, reason: 'Alvo muito distante' };
    }

    return { valid: true };
  }

  /**
   * Calcula dano do ataque
   * @param {Object} attacker
   * @param {Object} defender
   * @returns {Object} { damage: number, isCritical: boolean }
   */
  calculateDamage(attacker, defender) {
    // Dano base do atacante
    const baseDamage = attacker.weapon_damage || this.config.baseDamage;

    // Redução por armadura
    const armor = defender.armor || 0;
    const armorReduction = armor * this.config.armorReduction;

    // Dano após armadura (mínimo 1)
    let damage = Math.max(1, baseDamage - armorReduction);

    // Chance de crítico
    const isCritical = Math.random() < this.config.criticalChance;

    if (isCritical) {
      damage *= this.config.criticalMultiplier;
    }

    return {
      damage: Math.floor(damage),
      isCritical,
    };
  }

  /**
   * Processa ataque PvP
   * @param {string} attackerId - ID do atacante
   * @param {string} defenderId - ID do defensor
   * @param {Object} io - Socket.io instance
   * @returns {Object} Resultado do ataque
   */
  async processAttack(attackerId, defenderId, io) {
    try {
      // 1. Obter jogadores do cache
      const attacker = cacheManager.getPlayer(attackerId);
      const defender = cacheManager.getPlayer(defenderId);

      // 2. Validar ataque
      const validation = this.validateAttack(attacker, defender);

      if (!validation.valid) {
        logger.debug(`⚔️ Ataque negado: ${validation.reason}`);
        return {
          success: false,
          reason: validation.reason,
        };
      }

      // 3. Calcular dano
      const { damage, isCritical } = this.calculateDamage(attacker, defender);

      // 4. Aplicar dano no cache
      const newHealth = cacheManager.takeDamage(defenderId, damage);

      const wasFatal = newHealth === 0;

      logger.info(
        `⚔️ ${attacker.username} atacou ${defender.username}: -${damage} HP ${isCritical ? '(CRÍTICO!)' : ''} (${newHealth}/${defender.max_health})`
      );

      // 5. Persistir no battle_log
      const [chunkX, chunkY] = attacker.current_chunk.split(',').map(Number);
      const zone = zoneManager.getZone(chunkX, chunkY);

      const { data: battleLog, error: logError } = await supabaseAdmin
        .from('battle_log')
        .insert({
          attacker_id: attackerId,
          defender_id: defenderId,
          chunk_id: null, // TODO: buscar chunk_id do banco se necessário
          chunk_coords: attacker.current_chunk,
          damage,
          defender_health_before: defender.health,
          defender_health_after: newHealth,
          was_fatal: wasFatal,
          attacker_weapon_damage: attacker.weapon_damage,
          defender_armor: defender.armor,
        })
        .select()
        .single();

      if (logError) {
        logger.error('❌ Erro ao salvar battle_log:', logError);
      }

      // 6. Broadcast para o defensor
      if (defender.socketId) {
        io.to(defender.socketId).emit('battle:hit', {
          attackerId,
          attackerName: attacker.username,
          damage,
          isCritical,
          health: newHealth,
          maxHealth: defender.max_health,
          wasFatal,
        });
      }

      // 7. Broadcast para o chunk (outros players veem o combate)
      io.to(`chunk:${attacker.current_chunk}`).emit('battle:attack', {
        attackerId,
        attackerName: attacker.username,
        defenderId,
        defenderName: defender.username,
        damage,
        isCritical,
        defenderHealth: newHealth,
        wasFatal,
      });

      // 8. Se foi fatal, processar morte
      if (wasFatal) {
        await this.processDeath(defender, attacker, io);
      }

      return {
        success: true,
        damage,
        isCritical,
        health: newHealth,
        wasFatal,
        battleLogId: battleLog?.id,
      };
    } catch (error) {
      logger.error('❌ Erro ao processar ataque:', error);
      return {
        success: false,
        reason: 'Erro interno ao processar ataque',
      };
    }
  }

  /**
   * Processa morte de um jogador
   * @param {Object} victim
   * @param {Object} killer
   * @param {Object} io
   */
  async processDeath(victim, killer, io) {
    try {
      logger.warn(`💀 ${victim.username} foi morto por ${killer.username}`);

      // 1. Broadcast morte para o chunk
      io.to(`chunk:${victim.current_chunk}`).emit('player:died', {
        victimId: victim.id,
        victimName: victim.username,
        killerId: killer.id,
        killerName: killer.username,
      });

      // 2. Notificar vítima
      if (victim.socketId) {
        io.to(victim.socketId).emit('player:death', {
          killerId: killer.id,
          killerName: killer.username,
          respawnDelay: this.config.respawnDelay,
        });
      }

      // 3. Agendar respawn (em produção, isso seria gerenciado pelo cliente)
      // Por enquanto, apenas logamos
      logger.info(`⏳ ${victim.username} respawnará em ${this.config.respawnDelay / 1000}s`);

      // 4. TODO: Drop de itens/recursos (implementar futuramente)
      // 5. TODO: Atualizar estatísticas de kill/death (implementar futuramente)
    } catch (error) {
      logger.error('❌ Erro ao processar morte:', error);
    }
  }

  /**
   * Processa respawn de um jogador
   * @param {string} playerId
   * @param {Object} io
   * @returns {Object} Nova posição
   */
  async processRespawn(playerId, io) {
    try {
      const player = cacheManager.getPlayer(playerId);

      if (!player) {
        return { success: false, reason: 'Jogador não encontrado' };
      }

      // 1. Restaurar health
      const newHealth = player.max_health;

      // Atualizar no cache (simulando respawn)
      const cachedPlayer = cacheManager.getPlayer(playerId);
      if (cachedPlayer) {
        cachedPlayer.health = newHealth;
        cachedPlayer.lastUpdate = Date.now();
        cacheManager.criticalUpdates.add(playerId);
      }

      // 2. Respawn na zona segura (0, 0)
      const respawnChunk = '0,0';
      const respawnX = Math.floor(Math.random() * 200) - 100;
      const respawnY = Math.floor(Math.random() * 200) - 100;

      cacheManager.updatePosition(playerId, respawnX, respawnY, respawnChunk);

      logger.info(`🔄 ${player.username} respawnou em (${respawnX}, ${respawnY})`);

      // 3. Broadcast respawn
      if (player.socketId) {
        io.to(player.socketId).emit('player:respawned', {
          x: respawnX,
          y: respawnY,
          chunk: respawnChunk,
          health: newHealth,
        });
      }

      return {
        success: true,
        x: respawnX,
        y: respawnY,
        chunk: respawnChunk,
        health: newHealth,
      };
    } catch (error) {
      logger.error('❌ Erro ao processar respawn:', error);
      return {
        success: false,
        reason: 'Erro interno ao processar respawn',
      };
    }
  }

  /**
   * Obtém estatísticas do battle engine
   * @returns {Object}
   */
  getStats() {
    return {
      config: this.config,
      formulas: {
        damage: 'weapon_damage - (armor * 0.5)',
        critical: '10% chance, 2x damage',
        maxDistance: '500 units',
      },
    };
  }
}

// Singleton
const battleEngine = new BattleEngine();

export default battleEngine;

