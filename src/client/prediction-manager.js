/**
 * Client-Side Prediction Manager
 * Implementa predição e interpolação para movimento suave
 */

export default class PredictionManager {
  constructor() {
    // Estado local do jogador
    this.localState = {
      x: 0,
      y: 0,
      chunkX: 0,
      chunkY: 0,
      timestamp: 0
    };

    // Fila de inputs não confirmados pelo servidor
    this.inputQueue = []; // {input, timestamp, sequence}

    // Histórico de estados para reconciliação
    this.stateHistory = []; // {x, y, timestamp, sequence}

    // Configurações
    this.INPUT_BUFFER_SIZE = 60; // 1 segundo a 60 FPS
    this.STATE_HISTORY_SIZE = 120; // 2 segundos de histórico
    this.INTERPOLATION_DELAY = 100; // 100ms de delay para interpolação

    // Estado do servidor
    this.serverState = null;
    this.lastServerUpdate = 0;

    // Controle de sequência
    this.sequenceNumber = 0;

    // Interpolação
    this.interpolationState = {
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0,
      startTime: 0,
      duration: 0
    };

    // Stats
    this.stats = {
      predictions: 0,
      corrections: 0,
      reconciliations: 0
    };
  }

  /**
   * Inicializa o prediction manager
   */
  initialize(initialState) {
    this.localState = { ...initialState, timestamp: Date.now() };
    this.serverState = { ...initialState };
    this.interpolationState.currentX = initialState.x;
    this.interpolationState.currentY = initialState.y;
    this.interpolationState.targetX = initialState.x;
    this.interpolationState.targetY = initialState.y;
  }

  /**
   * Processa input do jogador (predição)
   */
  processInput(input) {
    const timestamp = Date.now();
    const sequence = ++this.sequenceNumber;

    // Criar entrada de input
    const inputEntry = {
      input: { ...input },
      timestamp,
      sequence
    };

    // Adicionar à fila
    this.inputQueue.push(inputEntry);
    if (this.inputQueue.length > this.INPUT_BUFFER_SIZE) {
      this.inputQueue.shift();
    }

    // Aplicar predição local
    this.applyPrediction(input);

    this.stats.predictions++;

    // Retornar dados para enviar ao servidor
    return {
      ...input,
      sequence,
      timestamp
    };
  }

  /**
   * Aplica predição de movimento local
   */
  applyPrediction(input) {
    // Simular movimento baseado no input
    const deltaTime = 0.016; // ~60 FPS

    if (input.thrust) {
      // Calcular movimento baseado na thrust
      const speed = 300; // pixels por segundo
      const moveDistance = speed * deltaTime;

      // Para simplificar, movimento na direção atual
      // Em um jogo real, consideraria rotação da nave
      this.localState.x += moveDistance;
      this.localState.y += moveDistance;
    }

    // Atualizar chunk se necessário
    this.localState.chunkX = Math.floor(this.localState.x / 1000);
    this.localState.chunkY = Math.floor(this.localState.y / 1000);
    this.localState.timestamp = Date.now();

    // Adicionar ao histórico
    this.addToStateHistory({
      x: this.localState.x,
      y: this.localState.y,
      timestamp: this.localState.timestamp,
      sequence: this.sequenceNumber
    });
  }

  /**
   * Adiciona estado ao histórico
   */
  addToStateHistory(state) {
    this.stateHistory.push(state);
    if (this.stateHistory.length > this.STATE_HISTORY_SIZE) {
      this.stateHistory.shift();
    }
  }

  /**
   * Processa confirmação do servidor (reconciliação)
   */
  processServerConfirmation(data) {
    const { x, y, chunkX, chunkY, sequence, timestamp } = data;

    // Atualizar estado do servidor
    this.serverState = { x, y, chunkX, chunkY, timestamp };
    this.lastServerUpdate = Date.now();

    // Remover inputs confirmados da fila
    const confirmedInputs = this.inputQueue.filter(input => input.sequence <= sequence);
    this.inputQueue = this.inputQueue.filter(input => input.sequence > sequence);

    // Reconciliar se necessário
    if (confirmedInputs.length > 0) {
      this.reconcile(x, y, sequence);
    }

    // Iniciar interpolação para posição do servidor
    this.startInterpolation(x, y);
  }

  /**
   * Reconcilia estado local com o do servidor
   */
  reconcile(serverX, serverY, confirmedSequence) {
    // Encontrar estado local correspondente
    const localStateAtConfirmation = this.stateHistory.find(
      state => state.sequence === confirmedSequence
    );

    if (!localStateAtConfirmation) {
      console.warn('⚠️ Estado local não encontrado para reconciliação');
      return;
    }

    // Calcular diferença
    const deltaX = serverX - localStateAtConfirmation.x;
    const deltaY = serverY - localStateAtConfirmation.y;

    // Se a diferença for pequena, ignorar (within threshold)
    const threshold = 5; // 5 pixels
    if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
      return;
    }

    // Aplicar correção
    this.localState.x += deltaX;
    this.localState.y += deltaY;

    // Reaplicar inputs não confirmados
    const unconfirmedInputs = this.inputQueue.filter(input => input.sequence > confirmedSequence);
    unconfirmedInputs.forEach(inputEntry => {
      this.applyPrediction(inputEntry.input);
    });

    this.stats.reconciliations++;
    this.stats.corrections++;

    console.debug(`🔧 Reconciliação: correção de (${deltaX.toFixed(1)}, ${deltaY.toFixed(1)})`);
  }

  /**
   * Inicia interpolação suave para posição do servidor
   */
  startInterpolation(targetX, targetY) {
    this.interpolationState.targetX = targetX;
    this.interpolationState.targetY = targetY;
    this.interpolationState.startTime = Date.now();
    this.interpolationState.duration = 100; // 100ms para interpolação
  }

  /**
   * Obtém posição interpolada atual
   */
  getInterpolatedPosition() {
    const now = Date.now();
    const elapsed = now - this.interpolationState.startTime;

    if (elapsed >= this.interpolationState.duration) {
      // Interpolação completa
      return {
        x: this.interpolationState.targetX,
        y: this.interpolationState.targetY
      };
    }

    // Calcular progresso da interpolação (ease-in-out)
    const progress = this.easeInOutQuad(elapsed / this.interpolationState.duration);

    // Interpolar posição
    const x = this.lerp(
      this.interpolationState.currentX,
      this.interpolationState.targetX,
      progress
    );
    const y = this.lerp(
      this.interpolationState.currentY,
      this.interpolationState.targetY,
      progress
    );

    return { x, y };
  }

  /**
   * Função de interpolação linear
   */
  lerp(start, end, t) {
    return start + (end - start) * t;
  }

  /**
   * Função ease-in-out quad
   */
  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /**
   * Processa correção de posição do servidor
   */
  processPositionCorrection(data) {
    const { x, y, chunkX, chunkY, reason } = data;

    console.warn(`⚠️ Correção de posição recebida: ${reason}`);

    // Força reconciliação imediata
    this.localState.x = x;
    this.localState.y = y;
    this.localState.chunkX = chunkX;
    this.localState.chunkY = chunkY;

    // Limpar fila de inputs
    this.inputQueue = [];

    // Iniciar interpolação para posição corrigida
    this.startInterpolation(x, y);

    this.stats.corrections++;
  }

  /**
   * Obtém estado atual do jogador
   */
  getCurrentState() {
    // Retorna posição interpolada se disponível
    const interpolated = this.getInterpolatedPosition();

    return {
      ...this.localState,
      x: interpolated.x,
      y: interpolated.y
    };
  }

  /**
   * Update principal (chamado a cada frame)
   */
  update() {
    // Atualizar interpolação
    const interpolated = this.getInterpolatedPosition();
    this.interpolationState.currentX = interpolated.x;
    this.interpolationState.currentY = interpolated.y;

    // Cleanup de estados antigos
    const cutoffTime = Date.now() - 2000; // 2 segundos
    this.stateHistory = this.stateHistory.filter(
      state => state.timestamp > cutoffTime
    );

    // Cleanup de inputs antigos
    const inputCutoffTime = Date.now() - 1000; // 1 segundo
    this.inputQueue = this.inputQueue.filter(
      input => input.timestamp > inputCutoffTime
    );
  }

  /**
   * Verifica se há reconciliação pendente
   */
  hasPendingReconciliation() {
    return this.inputQueue.length > 0;
  }

  /**
   * Obtém latência estimada
   */
  getEstimatedLatency() {
    if (this.lastServerUpdate === 0) return 0;

    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastServerUpdate;

    // Estimar latência baseada no tempo desde última atualização
    return Math.min(timeSinceLastUpdate, 500); // Máximo 500ms
  }

  /**
   * Obtém estatísticas
   */
  getStats() {
    const pendingInputs = this.inputQueue.length;
    const historySize = this.stateHistory.size;
    const latency = this.getEstimatedLatency();

    return {
      ...this.stats,
      pendingInputs,
      historySize,
      latency,
      localState: this.localState,
      serverState: this.serverState
    };
  }

  /**
   * Reseta o prediction manager
   */
  reset() {
    this.inputQueue = [];
    this.stateHistory = [];
    this.sequenceNumber = 0;
    this.stats = {
      predictions: 0,
      corrections: 0,
      reconciliations: 0
    };
  }

  /**
   * Configura parâmetros
   */
  configure(options) {
    if (options.interpolationDelay !== undefined) {
      this.INTERPOLATION_DELAY = options.interpolationDelay;
    }
    if (options.inputBufferSize !== undefined) {
      this.INPUT_BUFFER_SIZE = options.inputBufferSize;
    }
    if (options.stateHistorySize !== undefined) {
      this.STATE_HISTORY_SIZE = options.stateHistorySize;
    }
  }
}