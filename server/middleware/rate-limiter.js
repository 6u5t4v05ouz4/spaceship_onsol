/**
 * Rate Limiter
 * Implementa rate limiting por IP e por jogador para prevenir abuse
 */

import logger from '../utils/logger.js';

class RateLimiter {
  constructor() {
    // Configurações por tipo de evento
    this.limits = {
      'auth': { max: 5, windowMs: 60000 }, // 5 tentativas por minuto
      'player:move': { max: 30, windowMs: 1000 }, // 30 movimentos por segundo
      'chunk:enter': { max: 10, windowMs: 60000 }, // 10 entradas de chunk por minuto
      'battle:attack': { max: 10, windowMs: 1000 }, // 10 ataques por segundo
      'default': { max: 100, windowMs: 60000 } // 100 requisições genéricas por minuto
    };

    // Stores por IP e por jogador
    this.ipStore = new Map(); // ip -> {event: [timestamps]}
    this.playerStore = new Map(); // playerId -> {event: [timestamps]}

    // Contadores globais
    this.globalCounter = new Map(); // event -> {count, resetTime}

    // Cleanup periódico
    this.lastCleanup = Date.now();
    this.CLEANUP_INTERVAL = 300000; // 5 minutos

    // Block list temporária
    this.blockedIPs = new Map(); // ip -> {reason, unblockTime}
    this.suspiciousPlayers = new Map(); // playerId -> {warnings, lastWarning}
  }

  /**
   * Verifica se uma requisição deve ser limitada
   * @param {Object} socket - Socket do cliente
   * @param {string} event - Nome do evento
   * @param {string} playerId - ID do jogador (se disponível)
   * @returns {Object} {allowed: boolean, reason?: string, retryAfter?: number}
   */
  checkLimit(socket, event, playerId = null) {
    try {
      // Cleanup periódico
      this.performCleanup();

      const ip = this.getClientIP(socket);

      // 1. Verificar se IP está bloqueado
      const ipBlock = this.blockedIPs.get(ip);
      if (ipBlock && ipBlock.unblockTime > Date.now()) {
        return {
          allowed: false,
          reason: `ip_blocked: ${ipBlock.reason}`,
          retryAfter: Math.ceil((ipBlock.unblockTime - Date.now()) / 1000)
        };
      }

      // 2. Verificar limites por IP
      const ipCheck = this.checkIPLimit(ip, event);
      if (!ipCheck.allowed) {
        this.handleSuspiciousActivity(ip, event, 'ip_limit_exceeded');
        return ipCheck;
      }

      // 3. Verificar limites por jogador (se disponível)
      if (playerId) {
        const playerCheck = this.checkPlayerLimit(playerId, event);
        if (!playerCheck.allowed) {
          this.handleSuspiciousActivity(ip, event, 'player_limit_exceeded', playerId);
          return playerCheck;
        }
      }

      // 4. Verificar limites globais
      const globalCheck = this.checkGlobalLimit(event);
      if (!globalCheck.allowed) {
        return globalCheck;
      }

      // Registrar requisição
      this.registerRequest(ip, playerId, event);

      return { allowed: true };

    } catch (error) {
      logger.error('❌ Erro no rate limiting:', error);
      // Em caso de erro, permitir para não quebrar o jogo
      return { allowed: true };
    }
  }

  /**
   * Verifica limites por IP
   */
  checkIPLimit(ip, event) {
    const limit = this.getLimit(event);
    const key = `${ip}:${event}`;

    if (!this.ipStore.has(key)) {
      this.ipStore.set(key, []);
    }

    const timestamps = this.ipStore.get(key);
    const now = Date.now();

    // Remover timestamps antigos
    const cutoff = now - limit.windowMs;
    for (let i = timestamps.length - 1; i >= 0; i--) {
      if (timestamps[i] < cutoff) {
        timestamps.splice(0, i + 1);
        break;
      }
    }

    // Verificar limite
    if (timestamps.length >= limit.max) {
      const oldestTimestamp = timestamps[0];
      const retryAfter = Math.ceil((oldestTimestamp + limit.windowMs - now) / 1000);

      return {
        allowed: false,
        reason: `ip_rate_limit_exceeded: ${limit.max} ${event}/${limit.windowMs}ms`,
        retryAfter
      };
    }

    return { allowed: true };
  }

  /**
   * Verifica limites por jogador
   */
  checkPlayerLimit(playerId, event) {
    const limit = this.getLimit(event);
    const key = `${playerId}:${event}`;

    if (!this.playerStore.has(key)) {
      this.playerStore.set(key, []);
    }

    const timestamps = this.playerStore.get(key);
    const now = Date.now();

    // Remover timestamps antigos
    const cutoff = now - limit.windowMs;
    for (let i = timestamps.length - 1; i >= 0; i--) {
      if (timestamps[i] < cutoff) {
        timestamps.splice(0, i + 1);
        break;
      }
    }

    // Verificar limite
    if (timestamps.length >= limit.max) {
      const oldestTimestamp = timestamps[0];
      const retryAfter = Math.ceil((oldestTimestamp + limit.windowMs - now) / 1000);

      return {
        allowed: false,
        reason: `player_rate_limit_exceeded: ${limit.max} ${event}/${limit.windowMs}ms`,
        retryAfter
      };
    }

    return { allowed: true };
  }

  /**
   * Verifica limites globais
   */
  checkGlobalLimit(event) {
    const limit = this.getLimit(event);
    const multiplier = 100; // Multiplicador para limite global (100x o limite individual)

    if (!this.globalCounter.has(event)) {
      this.globalCounter.set(event, { count: 0, resetTime: Date.now() + limit.windowMs });
    }

    const counter = this.globalCounter.get(event);
    const now = Date.now();

    // Resetar contador se passou o tempo
    if (now > counter.resetTime) {
      counter.count = 0;
      counter.resetTime = now + limit.windowMs;
    }

    // Verificar limite global
    if (counter.count >= limit.max * multiplier) {
      const retryAfter = Math.ceil((counter.resetTime - now) / 1000);

      return {
        allowed: false,
        reason: `global_rate_limit_exceeded: ${limit.max * multiplier} ${event}/${limit.windowMs}ms`,
        retryAfter
      };
    }

    return { allowed: true };
  }

  /**
   * Registra uma requisição
   */
  registerRequest(ip, playerId, event) {
    const now = Date.now();
    const key = `${ip}:${event}`;

    // Adicionar ao store de IP
    if (!this.ipStore.has(key)) {
      this.ipStore.set(key, []);
    }
    this.ipStore.get(key).push(now);

    // Adicionar ao store de jogador (se aplicável)
    if (playerId) {
      const playerKey = `${playerId}:${event}`;
      if (!this.playerStore.has(playerKey)) {
        this.playerStore.set(playerKey, []);
      }
      this.playerStore.get(playerKey).push(now);
    }

    // Incrementar contador global
    if (!this.globalCounter.has(event)) {
      this.globalCounter.set(event, { count: 0, resetTime: Date.now() + this.getLimit(event).windowMs });
    }
    this.globalCounter.get(event).count++;
  }

  /**
   * Lida com atividade suspeita
   */
  handleSuspiciousActivity(ip, event, reason, playerId = null) {
    logger.warn(`⚠️ Atividade suspeita detectada: IP=${ip}, Event=${event}, Reason=${reason}, Player=${playerId}`);

    // Verificar se jogador tem warnings anteriores
    if (playerId) {
      const suspicious = this.suspiciousPlayers.get(playerId) || { warnings: 0, lastWarning: 0 };
      suspicious.warnings++;
      suspicious.lastWarning = Date.now();
      this.suspiciousPlayers.set(playerId, suspicious);

      // Bloquear temporariamente se tiver muitos warnings
      if (suspicious.warnings >= 5) {
        const blockDuration = Math.min(300000, suspicious.warnings * 60000); // Até 5 minutos
        this.blockIP(ip, `multiple_warnings: ${suspicious.warnings}`, blockDuration);
      }
    } else {
      // Bloquear IP anônimo mais rapidamente
      this.blockIP(ip, 'suspicious_activity_anonymous', 60000); // 1 minuto
    }
  }

  /**
   * Bloqueia um IP temporariamente
   */
  blockIP(ip, reason, durationMs) {
    const unblockTime = Date.now() + durationMs;
    this.blockedIPs.set(ip, { reason, unblockTime });
    logger.warn(`🚫 IP bloqueado: ${ip} - Reason: ${reason} - Duration: ${durationMs}ms`);
  }

  /**
   * Obtém o IP do cliente
   */
  getClientIP(socket) {
    return socket.handshake.address ||
           socket.handshake.headers['x-forwarded-for'] ||
           socket.handshake.headers['x-real-ip'] ||
           'unknown';
  }

  /**
   * Obtém configuração de limite para um evento
   */
  getLimit(event) {
    return this.limits[event] || this.limits.default;
  }

  /**
   * Cleanup periódico de dados antigos
   */
  performCleanup() {
    const now = Date.now();
    if (now - this.lastCleanup < this.CLEANUP_INTERVAL) {
      return;
    }

    this.lastCleanup = now;
    const cutoffTime = now - this.CLEANUP_INTERVAL;

    let cleanedItems = 0;

    // Limpar store de IPs
    this.ipStore.forEach((timestamps, key) => {
      for (let i = timestamps.length - 1; i >= 0; i--) {
        if (timestamps[i] < cutoffTime) {
          timestamps.splice(0, i + 1);
          cleanedItems += i + 1;
          break;
        }
      }

      // Remover entries vazios
      if (timestamps.length === 0) {
        this.ipStore.delete(key);
      }
    });

    // Limpar store de jogadores
    this.playerStore.forEach((timestamps, key) => {
      for (let i = timestamps.length - 1; i >= 0; i--) {
        if (timestamps[i] < cutoffTime) {
          timestamps.splice(0, i + 1);
          cleanedItems += i + 1;
          break;
        }
      }

      // Remover entries vazios
      if (timestamps.length === 0) {
        this.playerStore.delete(key);
      }
    });

    // Limpar IPs bloqueados expirados
    this.blockedIPs.forEach((block, ip) => {
      if (block.unblockTime < now) {
        this.blockedIPs.delete(ip);
      }
    });

    // Limpar jogadores suspeitos antigos
    this.suspiciousPlayers.forEach((suspicious, playerId) => {
      if (suspicious.lastWarning < cutoffTime) {
        this.suspiciousPlayers.delete(playerId);
      }
    });

    logger.debug(`🧹 RateLimiter cleanup: ${cleanedItems} itens removidos`);
  }

  /**
   * Obtém estatísticas do rate limiter
   */
  getStats() {
    const now = Date.now();
    let activeIPs = 0;
    let activePlayers = 0;
    let totalRequests = 0;

    this.ipStore.forEach((timestamps) => {
      if (timestamps.length > 0) activeIPs++;
      totalRequests += timestamps.length;
    });

    this.playerStore.forEach((timestamps) => {
      if (timestamps.length > 0) activePlayers++;
      totalRequests += timestamps.length;
    });

    return {
      activeIPs,
      activePlayers,
      totalRequests,
      blockedIPs: this.blockedIPs.size,
      suspiciousPlayers: this.suspiciousPlayers.size,
      memoryUsage: Math.round(JSON.stringify({
        ipStore: [...this.ipStore],
        playerStore: [...this.playerStore],
        blockedIPs: [...this.blockedIPs],
        suspiciousPlayers: [...this.suspiciousPlayers]
      }).length / 1024) + ' KB'
    };
  }

  /**
   * Limpa dados de um jogador específico (usado em disconnect)
   */
  clearPlayerData(playerId) {
    // Remover do store de jogadores
    const keysToDelete = [];
    this.playerStore.forEach((timestamps, key) => {
      if (key.startsWith(playerId + ':')) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.playerStore.delete(key));

    // Remover da lista de suspeitos
    this.suspiciousPlayers.delete(playerId);

    logger.debug(`🧹 RateLimiter: Limpos dados do jogador ${playerId}`);
  }
}

// Singleton
const rateLimiter = new RateLimiter();

export default rateLimiter;