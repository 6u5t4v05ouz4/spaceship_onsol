/**
 * Delta Compression
 * Comprime dados de estado do jogo enviando apenas as diferenças
 */

class DeltaCompression {
  constructor() {
    // Cache do último estado por jogador
    this.lastState = new Map(); // playerId -> lastState

    // Cleanup periódico
    this.lastCleanup = Date.now();
    this.CLEANUP_INTERVAL = 300000; // 5 minutos

    // Configurações
    this.PRIORITY_FIELDS = [
      'id', 'username', 'x', 'y', 'health', 'current_chunk'
    ];

    this.IGNORE_FIELDS = [
      'last_login', 'created_at', 'updated_at'
    ];
  }

  /**
   * Cria um delta comprimido entre dois estados
   * @param {string} playerId - ID do jogador
   * @param {Object} currentState - Estado atual
   * @returns {Object} Delta comprimido
   */
  createDelta(playerId, currentState) {
    try {
      // Cleanup periódico
      this.performCleanup();

      const previousState = this.lastState.get(playerId);

      // Se não há estado anterior, enviar estado completo
      if (!previousState) {
        this.lastState.set(playerId, this.cloneState(currentState));
        return {
          type: 'full',
          data: currentState,
          timestamp: Date.now()
        };
      }

      // Criar delta com apenas as diferenças
      const delta = this.calculateDelta(previousState, currentState);

      // Se delta for muito grande (> 80% do estado), enviar estado completo
      const deltaSize = JSON.stringify(delta).length;
      const fullSize = JSON.stringify(currentState).length;

      if (deltaSize > fullSize * 0.8) {
        this.lastState.set(playerId, this.cloneState(currentState));
        return {
          type: 'full',
          data: currentState,
          timestamp: Date.now()
        };
      }

      // Atualizar cache
      this.lastState.set(playerId, this.cloneState(currentState));

      return {
        type: 'delta',
        data: delta,
        timestamp: Date.now(),
        fromVersion: previousState._version || 0,
        toVersion: (previousState._version || 0) + 1
      };

    } catch (error) {
      console.error('❌ Erro ao criar delta:', error);
      // Fallback: enviar estado completo
      return {
        type: 'full',
        data: currentState,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Calcula as diferenças entre dois estados
   */
  calculateDelta(previous, current) {
    const delta = {};
    let hasChanges = false;

    // Adicionar versão para tracking
    const version = (previous._version || 0) + 1;

    // Comparar campos de forma ordenada por prioridade
    for (const field of this.PRIORITY_FIELDS) {
      if (this.hasFieldChanged(field, previous, current)) {
        delta[field] = current[field];
        hasChanges = true;
      }
    }

    // Comparar campos restantes
    for (const field in current) {
      if (
        this.PRIORITY_FIELDS.includes(field) ||
        this.IGNORE_FIELDS.includes(field) ||
        field.startsWith('_')
      ) {
        continue;
      }

      if (this.hasFieldChanged(field, previous, current)) {
        delta[field] = current[field];
        hasChanges = true;
      }
    }

    // Adicionar versão se houver mudanças
    if (hasChanges) {
      delta._version = version;
    }

    return delta;
  }

  /**
   * Verifica se um campo mudou entre dois estados
   */
  hasFieldChanged(field, previous, current) {
    const prevValue = previous[field];
    const currValue = current[field];

    // Tipos diferentes
    if (typeof prevValue !== typeof currValue) {
      return true;
    }

    // Valores null/undefined
    if (prevValue == null && currValue == null) {
      return false;
    }

    if (prevValue == null || currValue == null) {
      return true;
    }

    // Números - usar threshold para pequenas diferenças
    if (typeof prevValue === 'number' && typeof currValue === 'number') {
      // Para coordenadas, usar threshold maior
      if (field === 'x' || field === 'y') {
        return Math.abs(prevValue - currValue) > 1; // 1 pixel threshold
      }
      // Para saúde e outros valores, usar threshold menor
      if (field === 'health' || field === 'max_health') {
        return Math.abs(prevValue - currValue) > 0.1;
      }
      return Math.abs(prevValue - currValue) > 0.001;
    }

    // Strings - case sensitive
    if (typeof prevValue === 'string' && typeof currValue === 'string') {
      return prevValue !== currValue;
    }

    // Arrays e objetos - comparação profunda
    if (Array.isArray(prevValue) && Array.isArray(currValue)) {
      if (prevValue.length !== currValue.length) {
        return true;
      }
      return prevValue.some((val, index) => val !== currValue[index]);
    }

    // Comparação direta para outros tipos
    return prevValue !== currValue;
  }

  /**
   * Clona um estado para cache
   */
  cloneState(state) {
    // Clone raso com metadados
    const cloned = { ...state };
    cloned._version = state._version || 0;
    cloned._lastUpdate = Date.now();
    return cloned;
  }

  /**
   * Aplica um delta a um estado existente
   */
  applyDelta(currentState, deltaData) {
    try {
      if (!deltaData || typeof deltaData !== 'object') {
        return currentState;
      }

      // Aplicar mudanças do delta
      const updatedState = { ...currentState, ...deltaData };

      return updatedState;
    } catch (error) {
      console.error('❌ Erro ao aplicar delta:', error);
      return currentState;
    }
  }

  /**
   * Comprime dados de múltiplos jogadores
   */
  compressPlayersData(playerStates) {
    const compressed = {
      timestamp: Date.now(),
      full: [], // Jogadores com estado completo
      deltas: [] // Jogadores com delta
    };

    playerStates.forEach(playerState => {
      const playerId = playerState.id;
      const compressedData = this.createDelta(playerId, playerState);

      if (compressedData.type === 'full') {
        compressed.full.push({
          playerId,
          data: compressedData.data
        });
      } else {
        compressed.deltas.push({
          playerId,
          data: compressedData.data,
          fromVersion: compressedData.fromVersion,
          toVersion: compressedData.toVersion
        });
      }
    });

    return compressed;
  }

  /**
   * Comprime dados de chunk
   */
  compressChunkData(chunkData, previousChunkData) {
    if (!previousChunkData) {
      return {
        type: 'full',
        data: chunkData,
        timestamp: Date.now()
      };
    }

    const delta = this.calculateChunkDelta(previousChunkData, chunkData);
    const deltaSize = JSON.stringify(delta).length;
    const fullSize = JSON.stringify(chunkData).length;

    if (deltaSize > fullSize * 0.8) {
      return {
        type: 'full',
        data: chunkData,
        timestamp: Date.now()
      };
    }

    return {
      type: 'delta',
      data: delta,
      timestamp: Date.now()
    };
  }

  /**
   * Calcula delta para chunks
   */
  calculateChunkDelta(previous, current) {
    const delta = {};

    // Diferenças básicas do chunk
    if (previous.chunk_x !== current.chunk_x) delta.chunk_x = current.chunk_x;
    if (previous.chunk_y !== current.chunk_y) delta.chunk_y = current.chunk_y;
    if (previous.zone_type !== current.zone_type) delta.zone_type = current.zone_type;

    // Diferenças nos arrays de elementos
    ['asteroids', 'players', 'resources', 'crystals'].forEach(arrayField => {
      const deltaArray = this.calculateArrayDelta(
        previous[arrayField] || [],
        current[arrayField] || [],
        'id'
      );
      if (deltaArray.length > 0) {
        delta[arrayField] = deltaArray;
      }
    });

    return delta;
  }

  /**
   * Calcula delta para arrays baseados em ID
   */
  calculateArrayDelta(previousArray, currentArray, idField) {
    const delta = {
      added: [],
      updated: [],
      removed: []
    };

    // Maps para lookup rápido
    const previousMap = new Map(previousArray.map(item => [item[idField], item]));
    const currentMap = new Map(currentArray.map(item => [item[idField], item]));

    // Encontrar elementos removidos
    for (const [id, item] of previousMap) {
      if (!currentMap.has(id)) {
        delta.removed.push({ [idField]: id });
      }
    }

    // Encontrar elementos adicionados ou atualizados
    for (const [id, currentItem] of currentMap) {
      const previousItem = previousMap.get(id);

      if (!previousItem) {
        // Elemento adicionado
        delta.added.push(currentItem);
      } else {
        // Verificar se atualizou
        const itemDelta = this.calculateDelta(previousItem, currentItem);
        if (Object.keys(itemDelta).length > 0) {
          delta.updated.push({
            [idField]: id,
            changes: itemDelta
          });
        }
      }
    }

    // Retornar apenas se houver mudanças
    if (delta.added.length === 0 &&
        delta.updated.length === 0 &&
        delta.removed.length === 0) {
      return [];
    }

    return [delta];
  }

  /**
   * Cleanup periódico de estados antigos
   */
  performCleanup() {
    const now = Date.now();
    if (now - this.lastCleanup < this.CLEANUP_INTERVAL) {
      return;
    }

    this.lastCleanup = now;
    const cutoffTime = now - 600000; // 10 minutos

    let cleanedCount = 0;
    this.lastState.forEach((state, playerId) => {
      if (state._lastUpdate < cutoffTime) {
        this.lastState.delete(playerId);
        cleanedCount++;
      }
    });

    console.debug(`🧹 DeltaCompression cleanup: ${cleanedCount} estados removidos`);
  }

  /**
   * Obtém estatísticas da compressão
   */
  getStats() {
    const totalStates = this.lastState.size;
    let totalSize = 0;

    this.lastState.forEach(state => {
      totalSize += JSON.stringify(state).length;
    });

    return {
      totalStates,
      totalSize: Math.round(totalSize / 1024) + ' KB',
      averageSize: totalStates > 0 ? Math.round(totalSize / totalStates) : 0
    };
  }

  /**
   * Limpa cache de um jogador específico
   */
  clearPlayerCache(playerId) {
    this.lastState.delete(playerId);
  }

  /**
   * Força o envio de estado completo na próxima atualização
   */
  forceFullUpdate(playerId) {
    this.lastState.delete(playerId);
  }
}

// Singleton
const deltaCompression = new DeltaCompression();

export default deltaCompression;