/**
 * RedisManager - Gerenciador de estado distribuído com Redis
 * Substitui o Map local por Redis para escalabilidade horizontal
 * 
 * Features:
 * - Estado compartilhado entre instâncias do servidor
 * - TTL automático para limpeza de dados
 * - Operações atômicas para consistência
 * - Pub/Sub para comunicação entre instâncias
 * - Fallback para Map local se Redis não disponível
 */

import Redis from 'ioredis';

export default class RedisManager {
  constructor(options = {}) {
    // Configurações
    this.host = options.host || process.env.REDIS_HOST || 'localhost';
    this.port = options.port || process.env.REDIS_PORT || 6379;
    this.password = options.password || process.env.REDIS_PASSWORD || null;
    this.db = options.db || process.env.REDIS_DB || 0;
    this.keyPrefix = options.keyPrefix || 'space_crypto_miner:';
    this.defaultTTL = options.defaultTTL || 3600; // 1 hora
    this.enableFallback = options.enableFallback !== false;
    
    // Estado interno
    this.redis = null;
    this.pubSub = null;
    this.isConnected = false;
    this.fallbackMap = new Map(); // Fallback local
    this.useFallback = false;
    
    // Estatísticas
    this.stats = {
      operations: 0,
      hits: 0,
      misses: 0,
      errors: 0,
      fallbackOperations: 0,
      connectedAt: null,
      lastError: null
    };
    
    // Callbacks
    this.onConnect = options.onConnect || null;
    this.onDisconnect = options.onDisconnect || null;
    this.onError = options.onError || null;
    
    console.log('🔴 RedisManager inicializado:', {
      host: this.host,
      port: this.port,
      keyPrefix: this.keyPrefix,
      enableFallback: this.enableFallback
    });
  }

  /**
   * Conecta ao Redis
   * @returns {Promise<boolean>} True se conectou com sucesso
   */
  async connect() {
    try {
      console.log('🔴 Conectando ao Redis...');
      
      // Configuração do cliente principal
      this.redis = new Redis({
        host: this.host,
        port: this.port,
        password: this.password,
        db: this.db,
        keyPrefix: this.keyPrefix,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000
      });

      // Configuração do cliente Pub/Sub
      this.pubSub = new Redis({
        host: this.host,
        port: this.port,
        password: this.password,
        db: this.db,
        keyPrefix: this.keyPrefix,
        lazyConnect: true
      });

      // Event listeners do cliente principal
      this.redis.on('connect', () => {
        console.log('✅ Redis conectado');
        this.isConnected = true;
        this.useFallback = false;
        this.stats.connectedAt = Date.now();
        
        if (this.onConnect) {
          this.onConnect();
        }
      });

      this.redis.on('error', (error) => {
        console.error('❌ Erro no Redis:', error.message);
        this.stats.errors++;
        this.stats.lastError = error.message;
        
        if (this.enableFallback && !this.useFallback) {
          console.log('🔄 Ativando fallback local...');
          this.useFallback = true;
        }
        
        if (this.onError) {
          this.onError(error);
        }
      });

      this.redis.on('close', () => {
        console.log('🔴 Redis desconectado');
        this.isConnected = false;
        
        if (this.enableFallback) {
          this.useFallback = true;
        }
        
        if (this.onDisconnect) {
          this.onDisconnect();
        }
      });

      // Conectar
      await this.redis.connect();
      await this.pubSub.connect();
      
      // Testar conexão
      await this.redis.ping();
      
      console.log('✅ Redis conectado e funcionando');
      return true;

    } catch (error) {
      console.error('❌ Falha ao conectar ao Redis:', error.message);
      
      if (this.enableFallback) {
        console.log('🔄 Usando fallback local');
        this.useFallback = true;
        return true;
      }
      
      return false;
    }
  }

  /**
   * Desconecta do Redis
   */
  async disconnect() {
    console.log('🔴 Desconectando do Redis...');
    
    if (this.redis) {
      await this.redis.disconnect();
      this.redis = null;
    }
    
    if (this.pubSub) {
      await this.pubSub.disconnect();
      this.pubSub = null;
    }
    
    this.isConnected = false;
    console.log('✅ Redis desconectado');
  }

  /**
   * Armazena dados de um jogador
   * @param {string} playerId - ID do jogador
   * @param {Object} data - Dados do jogador
   * @param {number} ttl - TTL em segundos (opcional)
   * @returns {Promise<boolean>} True se armazenou com sucesso
   */
  async setPlayerState(playerId, data, ttl = null) {
    try {
      const key = `player:${playerId}`;
      const value = JSON.stringify({
        ...data,
        updatedAt: Date.now()
      });
      
      if (this.useFallback) {
        this.fallbackMap.set(key, value);
        this.stats.fallbackOperations++;
        return true;
      }
      
      if (ttl) {
        await this.redis.setex(key, ttl, value);
      } else {
        await this.redis.setex(key, this.defaultTTL, value);
      }
      
      this.stats.operations++;
      return true;

    } catch (error) {
      console.error('❌ Erro ao armazenar estado do jogador:', error.message);
      this.stats.errors++;
      
      if (this.enableFallback) {
        this.fallbackMap.set(`player:${playerId}`, JSON.stringify(data));
        this.stats.fallbackOperations++;
        return true;
      }
      
      return false;
    }
  }

  /**
   * Recupera dados de um jogador
   * @param {string} playerId - ID do jogador
   * @returns {Promise<Object|null>} Dados do jogador ou null
   */
  async getPlayerState(playerId) {
    try {
      const key = `player:${playerId}`;
      
      if (this.useFallback) {
        const value = this.fallbackMap.get(key);
        if (value) {
          this.stats.hits++;
          this.stats.fallbackOperations++;
          return JSON.parse(value);
        }
        this.stats.misses++;
        return null;
      }
      
      const value = await this.redis.get(key);
      
      if (value) {
        this.stats.hits++;
        return JSON.parse(value);
      } else {
        this.stats.misses++;
        return null;
      }

    } catch (error) {
      console.error('❌ Erro ao recuperar estado do jogador:', error.message);
      this.stats.errors++;
      
      if (this.enableFallback) {
        const value = this.fallbackMap.get(`player:${playerId}`);
        if (value) {
          this.stats.fallbackOperations++;
          return JSON.parse(value);
        }
      }
      
      return null;
    }
  }

  /**
   * Remove dados de um jogador
   * @param {string} playerId - ID do jogador
   * @returns {Promise<boolean>} True se removeu com sucesso
   */
  async removePlayerState(playerId) {
    try {
      const key = `player:${playerId}`;
      
      if (this.useFallback) {
        this.fallbackMap.delete(key);
        this.stats.fallbackOperations++;
        return true;
      }
      
      await this.redis.del(key);
      this.stats.operations++;
      return true;

    } catch (error) {
      console.error('❌ Erro ao remover estado do jogador:', error.message);
      this.stats.errors++;
      
      if (this.enableFallback) {
        this.fallbackMap.delete(`player:${playerId}`);
        this.stats.fallbackOperations++;
        return true;
      }
      
      return false;
    }
  }

  /**
   * Adiciona jogador a um chunk
   * @param {string} chunkId - ID do chunk
   * @param {string} playerId - ID do jogador
   * @returns {Promise<boolean>} True se adicionou com sucesso
   */
  async addPlayerToChunk(chunkId, playerId) {
    try {
      const key = `chunk:${chunkId}:players`;
      
      if (this.useFallback) {
        const players = this.fallbackMap.get(key) || [];
        if (!players.includes(playerId)) {
          players.push(playerId);
          this.fallbackMap.set(key, players);
        }
        this.stats.fallbackOperations++;
        return true;
      }
      
      await this.redis.sadd(key, playerId);
      await this.redis.expire(key, this.defaultTTL);
      this.stats.operations++;
      return true;

    } catch (error) {
      console.error('❌ Erro ao adicionar jogador ao chunk:', error.message);
      this.stats.errors++;
      
      if (this.enableFallback) {
        const players = this.fallbackMap.get(`chunk:${chunkId}:players`) || [];
        if (!players.includes(playerId)) {
          players.push(playerId);
          this.fallbackMap.set(`chunk:${chunkId}:players`, players);
        }
        this.stats.fallbackOperations++;
        return true;
      }
      
      return false;
    }
  }

  /**
   * Remove jogador de um chunk
   * @param {string} chunkId - ID do chunk
   * @param {string} playerId - ID do jogador
   * @returns {Promise<boolean>} True se removeu com sucesso
   */
  async removePlayerFromChunk(chunkId, playerId) {
    try {
      const key = `chunk:${chunkId}:players`;
      
      if (this.useFallback) {
        const players = this.fallbackMap.get(key) || [];
        const index = players.indexOf(playerId);
        if (index > -1) {
          players.splice(index, 1);
          this.fallbackMap.set(key, players);
        }
        this.stats.fallbackOperations++;
        return true;
      }
      
      await this.redis.srem(key, playerId);
      this.stats.operations++;
      return true;

    } catch (error) {
      console.error('❌ Erro ao remover jogador do chunk:', error.message);
      this.stats.errors++;
      
      if (this.enableFallback) {
        const players = this.fallbackMap.get(`chunk:${chunkId}:players`) || [];
        const index = players.indexOf(playerId);
        if (index > -1) {
          players.splice(index, 1);
          this.fallbackMap.set(`chunk:${chunkId}:players`, players);
        }
        this.stats.fallbackOperations++;
        return true;
      }
      
      return false;
    }
  }

  /**
   * Obtém jogadores em um chunk
   * @param {string} chunkId - ID do chunk
   * @returns {Promise<Array>} Lista de IDs dos jogadores
   */
  async getPlayersInChunk(chunkId) {
    try {
      const key = `chunk:${chunkId}:players`;
      
      if (this.useFallback) {
        const players = this.fallbackMap.get(key) || [];
        this.stats.fallbackOperations++;
        return players;
      }
      
      const players = await this.redis.smembers(key);
      this.stats.operations++;
      return players;

    } catch (error) {
      console.error('❌ Erro ao obter jogadores do chunk:', error.message);
      this.stats.errors++;
      
      if (this.enableFallback) {
        const players = this.fallbackMap.get(`chunk:${chunkId}:players`) || [];
        this.stats.fallbackOperations++;
        return players;
      }
      
      return [];
    }
  }

  /**
   * Armazena dados de um chunk
   * @param {string} chunkId - ID do chunk
   * @param {Object} data - Dados do chunk
   * @param {number} ttl - TTL em segundos (opcional)
   * @returns {Promise<boolean>} True se armazenou com sucesso
   */
  async setChunkData(chunkId, data, ttl = null) {
    try {
      const key = `chunk:${chunkId}:data`;
      const value = JSON.stringify({
        ...data,
        updatedAt: Date.now()
      });
      
      if (this.useFallback) {
        this.fallbackMap.set(key, value);
        this.stats.fallbackOperations++;
        return true;
      }
      
      if (ttl) {
        await this.redis.setex(key, ttl, value);
      } else {
        await this.redis.setex(key, this.defaultTTL, value);
      }
      
      this.stats.operations++;
      return true;

    } catch (error) {
      console.error('❌ Erro ao armazenar dados do chunk:', error.message);
      this.stats.errors++;
      
      if (this.enableFallback) {
        this.fallbackMap.set(`chunk:${chunkId}:data`, JSON.stringify(data));
        this.stats.fallbackOperations++;
        return true;
      }
      
      return false;
    }
  }

  /**
   * Recupera dados de um chunk
   * @param {string} chunkId - ID do chunk
   * @returns {Promise<Object|null>} Dados do chunk ou null
   */
  async getChunkData(chunkId) {
    try {
      const key = `chunk:${chunkId}:data`;
      
      if (this.useFallback) {
        const value = this.fallbackMap.get(key);
        if (value) {
          this.stats.hits++;
          this.stats.fallbackOperations++;
          return JSON.parse(value);
        }
        this.stats.misses++;
        return null;
      }
      
      const value = await this.redis.get(key);
      
      if (value) {
        this.stats.hits++;
        return JSON.parse(value);
      } else {
        this.stats.misses++;
        return null;
      }

    } catch (error) {
      console.error('❌ Erro ao recuperar dados do chunk:', error.message);
      this.stats.errors++;
      
      if (this.enableFallback) {
        const value = this.fallbackMap.get(`chunk:${chunkId}:data`);
        if (value) {
          this.stats.fallbackOperations++;
          return JSON.parse(value);
        }
      }
      
      return null;
    }
  }

  /**
   * Publica mensagem para outras instâncias
   * @param {string} channel - Canal de publicação
   * @param {Object} message - Mensagem para publicar
   * @returns {Promise<boolean>} True se publicou com sucesso
   */
  async publish(channel, message) {
    try {
      if (this.useFallback) {
        // Em fallback, não há comunicação entre instâncias
        console.log('⚠️ Pub/Sub não disponível em modo fallback');
        return false;
      }
      
      await this.pubSub.publish(channel, JSON.stringify(message));
      this.stats.operations++;
      return true;

    } catch (error) {
      console.error('❌ Erro ao publicar mensagem:', error.message);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Subscreve a um canal
   * @param {string} channel - Canal para subscrever
   * @param {Function} callback - Callback para mensagens recebidas
   * @returns {Promise<boolean>} True se subscreveu com sucesso
   */
  async subscribe(channel, callback) {
    try {
      if (this.useFallback) {
        console.log('⚠️ Pub/Sub não disponível em modo fallback');
        return false;
      }
      
      await this.pubSub.subscribe(channel);
      
      this.pubSub.on('message', (receivedChannel, message) => {
        if (receivedChannel === `${this.keyPrefix}${channel}`) {
          try {
            const data = JSON.parse(message);
            callback(data);
          } catch (error) {
            console.error('❌ Erro ao processar mensagem:', error.message);
          }
        }
      });
      
      this.stats.operations++;
      return true;

    } catch (error) {
      console.error('❌ Erro ao subscrever canal:', error.message);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Obtém estatísticas do RedisManager
   * @returns {Object} Estatísticas detalhadas
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 ? 
      (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 : 0;
    
    return {
      ...this.stats,
      isConnected: this.isConnected,
      useFallback: this.useFallback,
      hitRate: Math.round(hitRate * 100) / 100,
      uptime: this.stats.connectedAt ? Date.now() - this.stats.connectedAt : 0,
      config: {
        host: this.host,
        port: this.port,
        keyPrefix: this.keyPrefix,
        defaultTTL: this.defaultTTL,
        enableFallback: this.enableFallback
      }
    };
  }

  /**
   * Limpa todos os dados (apenas para desenvolvimento)
   * @returns {Promise<boolean>} True se limpou com sucesso
   */
  async flushAll() {
    try {
      if (this.useFallback) {
        this.fallbackMap.clear();
        this.stats.fallbackOperations++;
        return true;
      }
      
      await this.redis.flushdb();
      this.stats.operations++;
      console.log('🧹 Redis limpo');
      return true;

    } catch (error) {
      console.error('❌ Erro ao limpar Redis:', error.message);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Destrói o RedisManager
   */
  async destroy() {
    console.log('🧹 Destruindo RedisManager...');
    
    await this.disconnect();
    this.fallbackMap.clear();
    
    console.log('✅ RedisManager destruído');
  }
}
