/**
 * ChunkManager - Gerenciador de chunks com cleanup automático
 * Resolve o problema de chunks não sendo descarregados adequadamente da memória
 * 
 * Features:
 * - Cleanup automático de chunks inativos
 * - TTL configurável por chunk
 * - Estatísticas de uso de memória
 * - Integração com sistema multiplayer existente
 */

export default class ChunkManager {
  constructor(options = {}) {
    // Configurações
    this.chunkTTL = options.chunkTTL || 300000; // 5 minutos
    this.cleanupInterval = options.cleanupInterval || 60000; // 1 minuto
    this.maxChunksInMemory = options.maxChunksInMemory || 100;
    this.enableStats = options.enableStats !== false;
    
    // Estado interno
    this.activeChunks = new Map();
    this.chunkAccessTimes = new Map();
    this.stats = {
      totalChunksLoaded: 0,
      totalChunksUnloaded: 0,
      currentChunksInMemory: 0,
      lastCleanupTime: 0,
      cleanupDuration: 0
    };
    
    // Controle de cleanup
    this.cleanupTimer = null;
    this.isCleaningUp = false;
    
    console.log('🧮 ChunkManager inicializado:', {
      chunkTTL: this.chunkTTL,
      cleanupInterval: this.cleanupInterval,
      maxChunksInMemory: this.maxChunksInMemory
    });
  }

  /**
   * Inicia o sistema de cleanup automático
   */
  startCleanup() {
    if (this.cleanupTimer) {
      console.warn('⚠️ Cleanup já está rodando');
      return;
    }

    console.log('🔄 Iniciando cleanup automático de chunks...');
    
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.cleanupInterval);
    
    console.log('✅ Cleanup automático iniciado');
  }

  /**
   * Para o sistema de cleanup automático
   */
  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
      console.log('⏹️ Cleanup automático parado');
    }
  }

  /**
   * Carrega um chunk na memória
   * @param {string} chunkId - ID do chunk (formato: "x,y")
   * @param {Object} chunkData - Dados do chunk
   * @returns {Object} Dados do chunk carregado
   */
  loadChunk(chunkId, chunkData) {
    const now = Date.now();
    
    // Verificar se já está carregado
    if (this.activeChunks.has(chunkId)) {
      this.updateChunkAccess(chunkId);
      console.log(`📦 Chunk ${chunkId} já estava carregado, atualizando acesso`);
      return this.activeChunks.get(chunkId);
    }

    // Verificar limite de memória
    if (this.activeChunks.size >= this.maxChunksInMemory) {
      console.warn(`⚠️ Limite de chunks atingido (${this.maxChunksInMemory}), forçando cleanup`);
      this.performCleanup(true); // Cleanup forçado
    }

    // Carregar novo chunk
    this.activeChunks.set(chunkId, {
      id: chunkId,
      data: chunkData,
      loadedAt: now,
      lastAccessed: now,
      accessCount: 1,
      size: this.calculateChunkSize(chunkData)
    });

    this.chunkAccessTimes.set(chunkId, now);
    this.stats.totalChunksLoaded++;
    this.stats.currentChunksInMemory = this.activeChunks.size;

    console.log(`📦 Chunk ${chunkId} carregado:`, {
      size: this.calculateChunkSize(chunkData),
      totalChunks: this.activeChunks.size
    });

    return this.activeChunks.get(chunkId);
  }

  /**
   * Descarrega um chunk da memória
   * @param {string} chunkId - ID do chunk
   * @param {boolean} force - Forçar descarregamento mesmo se recentemente acessado
   * @returns {boolean} True se foi descarregado
   */
  unloadChunk(chunkId, force = false) {
    if (!this.activeChunks.has(chunkId)) {
      return false;
    }

    const chunk = this.activeChunks.get(chunkId);
    const now = Date.now();
    const timeSinceAccess = now - chunk.lastAccessed;

    // Verificar se pode descarregar
    if (!force && timeSinceAccess < this.chunkTTL) {
      console.log(`⏳ Chunk ${chunkId} ainda está ativo (${timeSinceAccess}ms desde último acesso)`);
      return false;
    }

    // Descarregar chunk
    this.activeChunks.delete(chunkId);
    this.chunkAccessTimes.delete(chunkId);
    this.stats.totalChunksUnloaded++;
    this.stats.currentChunksInMemory = this.activeChunks.size;

    console.log(`🗑️ Chunk ${chunkId} descarregado:`, {
      timeInMemory: now - chunk.loadedAt,
      accessCount: chunk.accessCount,
      size: chunk.size
    });

    return true;
  }

  /**
   * Atualiza o tempo de acesso de um chunk
   * @param {string} chunkId - ID do chunk
   */
  updateChunkAccess(chunkId) {
    const now = Date.now();
    
    if (this.activeChunks.has(chunkId)) {
      const chunk = this.activeChunks.get(chunkId);
      chunk.lastAccessed = now;
      chunk.accessCount++;
      this.chunkAccessTimes.set(chunkId, now);
    }
  }

  /**
   * Obtém dados de um chunk
   * @param {string} chunkId - ID do chunk
   * @returns {Object|null} Dados do chunk ou null se não encontrado
   */
  getChunk(chunkId) {
    if (!this.activeChunks.has(chunkId)) {
      return null;
    }

    this.updateChunkAccess(chunkId);
    return this.activeChunks.get(chunkId);
  }

  /**
   * Verifica se um chunk está carregado
   * @param {string} chunkId - ID do chunk
   * @returns {boolean} True se está carregado
   */
  isChunkLoaded(chunkId) {
    return this.activeChunks.has(chunkId);
  }

  /**
   * Executa cleanup de chunks inativos
   * @param {boolean} force - Forçar cleanup mesmo de chunks recentes
   */
  performCleanup(force = false) {
    if (this.isCleaningUp) {
      console.log('⏳ Cleanup já em andamento, pulando...');
      return;
    }

    const startTime = Date.now();
    this.isCleaningUp = true;

    console.log('🧹 Iniciando cleanup de chunks...');
    
    let chunksUnloaded = 0;
    const now = Date.now();
    const chunksToUnload = [];

    // Identificar chunks para descarregar
    for (const [chunkId, chunk] of this.activeChunks) {
      const timeSinceAccess = now - chunk.lastAccessed;
      
      if (force || timeSinceAccess > this.chunkTTL) {
        chunksToUnload.push(chunkId);
      }
    }

    // Descarregar chunks identificados
    for (const chunkId of chunksToUnload) {
      if (this.unloadChunk(chunkId, force)) {
        chunksUnloaded++;
      }
    }

    // Atualizar estatísticas
    const cleanupDuration = Date.now() - startTime;
    this.stats.lastCleanupTime = now;
    this.stats.cleanupDuration = cleanupDuration;

    this.isCleaningUp = false;

    console.log(`✅ Cleanup concluído:`, {
      chunksUnloaded,
      duration: `${cleanupDuration}ms`,
      chunksRemaining: this.activeChunks.size,
      memoryUsage: this.getMemoryUsage()
    });

    // Emitir evento de cleanup se disponível
    if (this.onCleanupComplete) {
      this.onCleanupComplete({
        chunksUnloaded,
        duration: cleanupDuration,
        chunksRemaining: this.activeChunks.size
      });
    }
  }

  /**
   * Calcula o tamanho aproximado de um chunk em bytes
   * @param {Object} chunkData - Dados do chunk
   * @returns {number} Tamanho em bytes
   */
  calculateChunkSize(chunkData) {
    try {
      return JSON.stringify(chunkData).length * 2; // Aproximação (UTF-16)
    } catch (error) {
      console.warn('⚠️ Erro ao calcular tamanho do chunk:', error);
      return 1024; // Tamanho padrão
    }
  }

  /**
   * Obtém estatísticas de uso de memória
   * @returns {Object} Estatísticas detalhadas
   */
  getMemoryUsage() {
    let totalSize = 0;
    const chunkSizes = [];

    for (const [chunkId, chunk] of this.activeChunks) {
      totalSize += chunk.size;
      chunkSizes.push({
        id: chunkId,
        size: chunk.size,
        accessCount: chunk.accessCount,
        timeInMemory: Date.now() - chunk.loadedAt
      });
    }

    return {
      totalChunks: this.activeChunks.size,
      totalSizeBytes: totalSize,
      totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
      averageChunkSize: this.activeChunks.size > 0 ? Math.round(totalSize / this.activeChunks.size) : 0,
      chunkSizes: chunkSizes.sort((a, b) => b.size - a.size) // Maiores primeiro
    };
  }

  /**
   * Obtém estatísticas gerais do ChunkManager
   * @returns {Object} Estatísticas completas
   */
  getStats() {
    const memoryUsage = this.getMemoryUsage();
    
    return {
      ...this.stats,
      ...memoryUsage,
      isCleanupRunning: this.isCleaningUp,
      cleanupTimerActive: this.cleanupTimer !== null,
      config: {
        chunkTTL: this.chunkTTL,
        cleanupInterval: this.cleanupInterval,
        maxChunksInMemory: this.maxChunksInMemory
      }
    };
  }

  /**
   * Força descarregamento de todos os chunks
   */
  unloadAllChunks() {
    console.log('🗑️ Descarregando todos os chunks...');
    
    const chunkIds = Array.from(this.activeChunks.keys());
    let unloadedCount = 0;

    for (const chunkId of chunkIds) {
      if (this.unloadChunk(chunkId, true)) {
        unloadedCount++;
      }
    }

    console.log(`✅ ${unloadedCount} chunks descarregados`);
    return unloadedCount;
  }

  /**
   * Obtém lista de chunks ativos
   * @returns {Array} Lista de IDs de chunks ativos
   */
  getActiveChunkIds() {
    return Array.from(this.activeChunks.keys());
  }

  /**
   * Destrói o ChunkManager e limpa todos os recursos
   */
  destroy() {
    console.log('🧹 Destruindo ChunkManager...');
    
    this.stopCleanup();
    this.unloadAllChunks();
    
    this.activeChunks.clear();
    this.chunkAccessTimes.clear();
    
    console.log('✅ ChunkManager destruído');
  }
}
