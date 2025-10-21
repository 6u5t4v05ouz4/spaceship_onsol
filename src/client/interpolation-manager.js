/**
 * Interpolation Manager
 * Gerencia interpolação suave de outros jogadores e entidades
 */

export default class InterpolationManager {
  constructor() {
    // Map de entidades interpoladas
    this.entities = new Map(); // entityId -> interpolation data

    // Configurações
    this.INTERPOLATION_DELAY = 100; // 100ms de delay
    this.MAX_BUFFER_SIZE = 30; // 0.5 segundos a 60 FPS
    this.EXTRAPOLATION_TIME = 200; // 200ms de extrapolação

    // Stats
    this.stats = {
      entities: 0,
      updatesPerSecond: 0,
      smoothTransitions: 0
    };
  }

  /**
   * Adiciona ou atualiza entidade para interpolação
   */
  updateEntity(entityId, position, rotation = null, health = null) {
    const timestamp = Date.now();

    if (!this.entities.has(entityId)) {
      // Nova entidade
      this.entities.set(entityId, {
        id: entityId,
        buffer: [],
        currentPosition: { x: position.x, y: position.y },
        targetPosition: { x: position.x, y: position.y },
        currentRotation: rotation || 0,
        targetRotation: rotation || 0,
        currentHealth: health,
        targetHealth: health,
        lastUpdate: timestamp,
        isMoving: false,
        isVisible: true
      });
    }

    const entity = this.entities.get(entityId);

    // Adicionar nova posição ao buffer
    entity.buffer.push({
      x: position.x,
      y: position.y,
      rotation,
      health,
      timestamp
    });

    // Manter buffer limitado
    if (entity.buffer.length > this.MAX_BUFFER_SIZE) {
      entity.buffer.shift();
    }

    // Atualizar alvo de interpolação
    entity.targetPosition = { x: position.x, y: position.y };
    entity.targetRotation = rotation || 0;
    entity.targetHealth = health;
    entity.lastUpdate = timestamp;

    // Detectar se está em movimento
    if (entity.currentPosition.x !== position.x || entity.currentPosition.y !== position.y) {
      entity.isMoving = true;
    }
  }

  /**
   * Remove entidade da interpolação
   */
  removeEntity(entityId) {
    this.entities.delete(entityId);
  }

  /**
   * Obtém posição interpolada de uma entidade
   */
  getInterpolatedPosition(entityId) {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return null;
    }

    const now = Date.now();
    const renderTime = now - this.INTERPOLATION_DELAY;

    // Encontrar posições no buffer para interpolação
    const positions = this.findPositionsForTime(entity, renderTime);

    if (!positions) {
      // Sem dados suficientes, usar extrapolação ou última posição conhecida
      return this.extrapolateOrUseLastPosition(entity, renderTime);
    }

    // Interpolar entre as duas posições
    const interpolated = this.interpolate(
      positions.start,
      positions.end,
      (renderTime - positions.start.timestamp) / (positions.end.timestamp - positions.start.timestamp)
    );

    // Adicionar suavidade com easing
    const smoothed = this.applyEasing(interpolated, entity.currentPosition);

    return smoothed;
  }

  /**
   * Encontra duas posições no buffer para um tempo específico
   */
  findPositionsForTime(entity, targetTime) {
    const buffer = entity.buffer;
    if (buffer.length < 2) {
      return null;
    }

    let start = null;
    let end = null;

    // Encontrar posições que envolvem o tempo alvo
    for (let i = 0; i < buffer.length - 1; i++) {
      if (buffer[i].timestamp <= targetTime && buffer[i + 1].timestamp >= targetTime) {
        start = buffer[i];
        end = buffer[i + 1];
        break;
      }
    }

    if (!start || !end) {
      return null;
    }

    return { start, end };
  }

  /**
   * Extrapola ou usa última posição conhecida
   */
  extrapolateOrUseLastPosition(entity, targetTime) {
    const now = Date.now();
    const lastBufferEntry = entity.buffer[entity.buffer.length - 1];

    if (!lastBufferEntry) {
      return entity.currentPosition;
    }

    const timeSinceLastUpdate = now - lastBufferEntry.timestamp;

    // Se muito tempo se passou, não extrapolar
    if (timeSinceLastUpdate > this.EXTRAPOLATION_TIME) {
      entity.isVisible = false;
      return entity.currentPosition;
    }

    entity.isVisible = true;

    // Extrapolação linear simples
    if (entity.buffer.length >= 2) {
      const previous = entity.buffer[entity.buffer.length - 2];
      const current = entity.buffer[entity.buffer.length - 1];

      const deltaTime = current.timestamp - previous.timestamp;
      if (deltaTime > 0) {
        const velocityX = (current.x - previous.x) / deltaTime;
        const velocityY = (current.y - previous.y) / deltaTime;

        const extrapolationTime = targetTime - current.timestamp;
        const extrapolatedX = current.x + velocityX * extrapolationTime;
        const extrapolatedY = current.y + velocityY * extrapolationTime;

        return { x: extrapolatedX, y: extrapolatedY };
      }
    }

    return {
      x: lastBufferEntry.x,
      y: lastBufferEntry.y
    };
  }

  /**
   * Interpola linear entre duas posições
   */
  interpolate(start, end, t) {
    // Clamp t entre 0 e 1
    t = Math.max(0, Math.min(1, t));

    return {
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
      rotation: start.rotation !== undefined && end.rotation !== undefined
        ? start.rotation + (end.rotation - start.rotation) * t
        : end.rotation || 0,
      health: end.health
    };
  }

  /**
   * Aplica easing para suavizar transições
   */
  applyEasing(target, current) {
    const smoothingFactor = 0.15; // Fator de suavização

    const x = current.x + (target.x - current.x) * smoothingFactor;
    const y = current.y + (target.y - current.y) * smoothingFactor;

    // Detectar se a transição está suave
    const distance = Math.sqrt(
      Math.pow(target.x - current.x, 2) + Math.pow(target.y - current.y, 2)
    );

    if (distance > 1) {
      this.stats.smoothTransitions++;
    }

    return { x, y, rotation: target.rotation, health: target.health };
  }

  /**
   * Obtém rotação interpolada
   */
  getInterpolatedRotation(entityId) {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return 0;
    }

    const current = entity.currentRotation;
    const target = entity.targetRotation;

    // Interpolação angular mais curta
    let delta = target - current;
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;

    return current + delta * 0.1; // Suavização
  }

  /**
   * Obtém saúde interpolada
   */
  getInterpolatedHealth(entityId) {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return null;
    }

    // Saúde geralmente não precisa de interpolação suave
    // Mas podemos adicionar uma pequena transição
    const current = entity.currentHealth;
    const target = entity.targetHealth;

    if (current === null || current === undefined) {
      return target;
    }

    if (target === null || target === undefined) {
      return current;
    }

    // Transição suave de saúde
    const healthDiff = target - current;
    if (Math.abs(healthDiff) < 1) {
      return target;
    }

    return current + healthDiff * 0.2;
  }

  /**
   * Verifica se entidade está visível
   */
  isEntityVisible(entityId) {
    const entity = this.entities.get(entityId);
    return entity ? entity.isVisible : false;
  }

  /**
   * Verifica se entidade está em movimento
   */
  isEntityMoving(entityId) {
    const entity = this.entities.get(entityId);
    return entity ? entity.isMoving : false;
  }

  /**
   * Update principal (chamado a cada frame)
   */
  update() {
    const now = Date.now();

    this.entities.forEach(entity => {
      // Atualizar posição atual
      const interpolated = this.getInterpolatedPosition(entity.id);
      if (interpolated) {
        entity.currentPosition = { x: interpolated.x, y: interpolated.y };
        entity.currentRotation = interpolated.rotation;
        entity.currentHealth = interpolated.health;
      }

      // Cleanup de buffer antigo
      const cutoffTime = now - 1000; // 1 segundo
      entity.buffer = entity.buffer.filter(entry => entry.timestamp > cutoffTime);

      // Remover entidades muito antigas
      if (now - entity.lastUpdate > 5000) { // 5 segundos
        this.entities.delete(entity.id);
      }
    });

    // Atualizar stats
    this.stats.entities = this.entities.size;
    this.stats.updatesPerSecond = this.calculateUpdatesPerSecond();
  }

  /**
   * Calcula atualizações por segundo
   */
  calculateUpdatesPerSecond() {
    let totalUpdates = 0;
    this.entities.forEach(entity => {
      totalUpdates += entity.buffer.length;
    });
    return totalUpdates;
  }

  /**
   * Obtém estatísticas
   */
  getStats() {
    return {
      ...this.stats,
      memoryUsage: Math.round(JSON.stringify([...this.entities]).length / 1024) + ' KB'
    };
  }

  /**
   * Limpa todas as entidades
   */
  clear() {
    this.entities.clear();
    this.stats = {
      entities: 0,
      updatesPerSecond: 0,
      smoothTransitions: 0
    };
  }

  /**
   * Configura parâmetros
   */
  configure(options) {
    if (options.interpolationDelay !== undefined) {
      this.INTERPOLATION_DELAY = options.interpolationDelay;
    }
    if (options.maxBufferSize !== undefined) {
      this.MAX_BUFFER_SIZE = options.maxBufferSize;
    }
    if (options.extrapolationTime !== undefined) {
      this.EXTRAPOLATION_TIME = options.extrapolationTime;
    }
  }

  /**
   * Força sincronização imediata (teleporte)
   */
  forceTeleport(entityId, position) {
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.currentPosition = { x: position.x, y: position.y };
      entity.targetPosition = { x: position.x, y: position.y };
      entity.buffer = []; // Limpar buffer para evitar interpolação
    }
  }
}