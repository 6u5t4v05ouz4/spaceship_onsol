/**
 * NetworkOptimizer - Otimizador de dados de rede
 * Reduz o tamanho dos pacotes enviados e melhora a performance
 * 
 * Features:
 * - Compressão de dados de movimento
 * - Delta sync para enviar apenas mudanças
 * - Throttling inteligente de mensagens
 * - Estatísticas de uso de banda
 */

export default class NetworkOptimizer {
  constructor(options = {}) {
    // Configurações
    this.movementThrottle = options.movementThrottle || 100; // ms
    this.maxMessageSize = options.maxMessageSize || 8192; // bytes
    this.enableDeltaSync = options.enableDeltaSync !== false;
    this.enableCompression = options.enableCompression !== false;
    
    // Estado interno
    this.lastSentData = new Map(); // Para delta sync
    this.messageQueue = [];
    this.stats = {
      messagesSent: 0,
      messagesCompressed: 0,
      bytesSaved: 0,
      averageMessageSize: 0,
      compressionRatio: 0
    };
    
    // Throttling
    this.lastMovementTime = 0;
    this.pendingMovement = null;
    
    console.log('🌐 NetworkOptimizer inicializado:', {
      movementThrottle: this.movementThrottle,
      enableDeltaSync: this.enableDeltaSync,
      enableCompression: this.enableCompression
    });
  }

  /**
   * Otimiza dados de movimento antes do envio
   * @param {Object} movementData - Dados de movimento
   * @returns {Object|null} Dados otimizados ou null se deve ser ignorado
   */
  optimizeMovementData(movementData) {
    const now = Date.now();
    
    // Throttling de movimento
    if (now - this.lastMovementTime < this.movementThrottle) {
      // Armazenar movimento pendente
      this.pendingMovement = movementData;
      return null;
    }
    
    // Processar movimento pendente se existir
    if (this.pendingMovement) {
      movementData = this.pendingMovement;
      this.pendingMovement = null;
    }
    
    // Otimizar dados
    const optimizedData = {
      x: Math.round(movementData.x),
      y: Math.round(movementData.y),
      chunkX: movementData.chunkX,
      chunkY: movementData.chunkY,
      t: now // timestamp
    };
    
    // Delta sync - enviar apenas se houve mudança significativa
    if (this.enableDeltaSync) {
      const lastData = this.lastSentData.get('movement');
      if (lastData && this.isMovementSimilar(lastData, optimizedData)) {
        return null; // Ignorar movimento similar
      }
      this.lastSentData.set('movement', optimizedData);
    }
    
    this.lastMovementTime = now;
    this.stats.messagesSent++;
    
    return optimizedData;
  }

  /**
   * Otimiza dados de chunk antes do envio
   * @param {Object} chunkData - Dados do chunk
   * @returns {Object} Dados otimizados
   */
  optimizeChunkData(chunkData) {
    const optimizedData = {
      chunk: {
        chunkX: chunkData.chunk.chunkX,
        chunkY: chunkData.chunk.chunkY,
        zoneType: chunkData.chunk.zoneType
      },
      // Otimizar elementos - remover dados desnecessários
      asteroids: this.optimizeElements(chunkData.asteroids, ['id', 'x', 'y', 'size', 'health']),
      crystals: this.optimizeElements(chunkData.crystals, ['id', 'x', 'y', 'value', 'energy']),
      resources: this.optimizeElements(chunkData.resources, ['id', 'x', 'y', 'resource_type', 'amount']),
      planets: this.optimizeElements(chunkData.planets, ['id', 'x', 'y', 'planet_type', 'size']),
      npcs: this.optimizeElements(chunkData.npcs, ['id', 'x', 'y', 'ship_type', 'behavior']),
      stations: this.optimizeElements(chunkData.stations, ['id', 'x', 'y', 'station_type', 'services']),
      players: chunkData.players, // Players já estão otimizados
      timestamp: Date.now()
    };
    
    this.stats.messagesSent++;
    return optimizedData;
  }

  /**
   * Otimiza lista de elementos removendo campos desnecessários
   * @param {Array} elements - Lista de elementos
   * @param {Array} keepFields - Campos a manter
   * @returns {Array} Elementos otimizados
   */
  optimizeElements(elements, keepFields) {
    if (!Array.isArray(elements)) return [];
    
    return elements.map(element => {
      const optimized = {};
      keepFields.forEach(field => {
        if (element[field] !== undefined) {
          optimized[field] = element[field];
        }
      });
      return optimized;
    });
  }

  /**
   * Verifica se dois movimentos são similares (para delta sync)
   * @param {Object} lastData - Último movimento enviado
   * @param {Object} currentData - Movimento atual
   * @returns {boolean} True se são similares
   */
  isMovementSimilar(lastData, currentData) {
    const threshold = 5; // pixels
    
    return (
      Math.abs(lastData.x - currentData.x) < threshold &&
      Math.abs(lastData.y - currentData.y) < threshold &&
      lastData.chunkX === currentData.chunkX &&
      lastData.chunkY === currentData.chunkY
    );
  }

  /**
   * Compressa dados usando técnicas simples
   * @param {Object} data - Dados para comprimir
   * @returns {Object} Dados comprimidos
   */
  compressData(data) {
    if (!this.enableCompression) return data;
    
    try {
      const jsonString = JSON.stringify(data);
      const originalSize = jsonString.length;
      
      // Compressão simples - remover espaços e usar nomes curtos
      const compressed = jsonString
        .replace(/\s+/g, '') // Remover espaços
        .replace(/"chunkX"/g, '"cx"')
        .replace(/"chunkY"/g, '"cy"')
        .replace(/"timestamp"/g, '"t"')
        .replace(/"playerId"/g, '"pid"')
        .replace(/"username"/g, '"un"')
        .replace(/"health"/g, '"hp"')
        .replace(/"maxHealth"/g, '"mhp"');
      
      const compressedSize = compressed.length;
      const savedBytes = originalSize - compressedSize;
      
      this.stats.messagesCompressed++;
      this.stats.bytesSaved += savedBytes;
      this.stats.compressionRatio = this.stats.bytesSaved / (this.stats.messagesSent * originalSize);
      
      return JSON.parse(compressed);
    } catch (error) {
      console.warn('⚠️ Erro na compressão, usando dados originais:', error);
      return data;
    }
  }

  /**
   * Descomprime dados comprimidos
   * @param {Object} compressedData - Dados comprimidos
   * @returns {Object} Dados descomprimidos
   */
  decompressData(compressedData) {
    if (!this.enableCompression) return compressedData;
    
    try {
      const jsonString = JSON.stringify(compressedData);
      
      // Descompressão - restaurar nomes originais
      const decompressed = jsonString
        .replace(/"cx"/g, '"chunkX"')
        .replace(/"cy"/g, '"chunkY"')
        .replace(/"t"/g, '"timestamp"')
        .replace(/"pid"/g, '"playerId"')
        .replace(/"un"/g, '"username"')
        .replace(/"hp"/g, '"health"')
        .replace(/"mhp"/g, '"maxHealth"');
      
      return JSON.parse(decompressed);
    } catch (error) {
      console.warn('⚠️ Erro na descompressão, usando dados comprimidos:', error);
      return compressedData;
    }
  }

  /**
   * Processa movimento pendente (chamado pelo throttle)
   * @returns {Object|null} Movimento pendente ou null
   */
  processPendingMovement() {
    if (this.pendingMovement) {
      const movement = this.pendingMovement;
      this.pendingMovement = null;
      return this.optimizeMovementData(movement);
    }
    return null;
  }

  /**
   * Obtém estatísticas de uso de rede
   * @returns {Object} Estatísticas detalhadas
   */
  getStats() {
    return {
      ...this.stats,
      averageMessageSize: this.stats.messagesSent > 0 ? 
        this.stats.bytesSaved / this.stats.messagesSent : 0,
      compressionRatio: this.stats.compressionRatio,
      pendingMovement: this.pendingMovement !== null,
      config: {
        movementThrottle: this.movementThrottle,
        enableDeltaSync: this.enableDeltaSync,
        enableCompression: this.enableCompression
      }
    };
  }

  /**
   * Reseta estatísticas
   */
  resetStats() {
    this.stats = {
      messagesSent: 0,
      messagesCompressed: 0,
      bytesSaved: 0,
      averageMessageSize: 0,
      compressionRatio: 0
    };
    this.lastSentData.clear();
  }

  /**
   * Destrói o NetworkOptimizer
   */
  destroy() {
    console.log('🧹 Destruindo NetworkOptimizer...');
    this.lastSentData.clear();
    this.messageQueue = [];
    this.pendingMovement = null;
    console.log('✅ NetworkOptimizer destruído');
  }
}
