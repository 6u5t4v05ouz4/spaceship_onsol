/**
 * ConnectionManager - Gerenciador robusto de conexões
 * Implementa reconexão automática, heartbeat e detecção de falhas
 * 
 * Features:
 * - Reconexão automática com backoff exponencial
 * - Heartbeat para detectar conexões mortas
 * - Preservação de estado durante reconexão
 * - Estatísticas de conectividade
 * - Fallback para diferentes estratégias de conexão
 */

export default class ConnectionManager {
  constructor(options = {}) {
    // Configurações
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectDelay = options.reconnectDelay || 1000; // ms
    this.maxReconnectDelay = options.maxReconnectDelay || 30000; // 30s
    this.heartbeatInterval = options.heartbeatInterval || 30000; // 30s
    this.heartbeatTimeout = options.heartbeatTimeout || 10000; // 10s
    this.enableHeartbeat = options.enableHeartbeat !== false;
    this.preserveState = options.preserveState !== false;
    
    // Estado interno
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    this.isConnected = false;
    this.isAuthenticated = false;
    this.lastHeartbeat = 0;
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.pendingMessages = [];
    this.savedState = null;
    
    // Estatísticas
    this.stats = {
      totalReconnects: 0,
      successfulReconnects: 0,
      failedReconnects: 0,
      averageReconnectTime: 0,
      lastReconnectTime: 0,
      connectionUptime: 0,
      lastDisconnectTime: 0,
      heartbeatFailures: 0
    };
    
    // Callbacks
    this.onConnect = options.onConnect || null;
    this.onDisconnect = options.onDisconnect || null;
    this.onReconnect = options.onReconnect || null;
    this.onHeartbeatFail = options.onHeartbeatFail || null;
    
    // Referência ao socket
    this.socket = null;
    this.socketService = null;
    
    console.log('🔌 ConnectionManager inicializado:', {
      maxReconnectAttempts: this.maxReconnectAttempts,
      reconnectDelay: this.reconnectDelay,
      enableHeartbeat: this.enableHeartbeat
    });
  }

  /**
   * Configura o socket e inicia o gerenciamento
   * @param {Object} socket - Instância do socket
   * @param {Object} socketService - Serviço de socket
   */
  setup(socket, socketService) {
    this.socket = socket;
    this.socketService = socketService;
    
    // Configurar eventos do socket
    this.setupSocketEvents();
    
    // Iniciar heartbeat se habilitado
    if (this.enableHeartbeat) {
      this.startHeartbeat();
    }
    
    console.log('✅ ConnectionManager configurado');
  }

  /**
   * Configura eventos do socket
   */
  setupSocketEvents() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Socket conectado');
      this.handleConnect();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket desconectado:', reason);
      this.handleDisconnect(reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão:', error);
      this.handleConnectionError(error);
    });

    this.socket.on('pong', (data) => {
      this.handleHeartbeatResponse(data);
    });

    // Eventos de autenticação
    this.socket.on('auth:success', (data) => {
      console.log('🔐 Autenticação bem-sucedida');
      this.isAuthenticated = true;
      this.handleReconnectSuccess();
    });

    this.socket.on('auth:error', (error) => {
      console.error('❌ Erro de autenticação:', error);
      this.handleAuthError(error);
    });
  }

  /**
   * Manipula evento de conexão
   */
  handleConnect() {
    this.isConnected = true;
    this.isReconnecting = false;
    this.reconnectAttempts = 0;
    this.stats.connectionUptime = Date.now();
    
    // Processar mensagens pendentes
    this.processPendingMessages();
    
    // Restaurar estado se necessário
    if (this.preserveState && this.savedState) {
      this.restoreState();
    }
    
    // Callback de conexão
    if (this.onConnect) {
      this.onConnect();
    }
    
    console.log('✅ Conexão estabelecida');
  }

  /**
   * Manipula evento de desconexão
   */
  handleDisconnect(reason) {
    this.isConnected = false;
    this.isAuthenticated = false;
    this.stats.lastDisconnectTime = Date.now();
    
    // Salvar estado se necessário
    if (this.preserveState) {
      this.saveState();
    }
    
    // Callback de desconexão
    if (this.onDisconnect) {
      this.onDisconnect(reason);
    }
    
    // Tentar reconectar se não foi intencional
    if (reason !== 'io client disconnect' && !this.isReconnecting) {
      this.attemptReconnect();
    }
    
    console.log('❌ Desconectado:', reason);
  }

  /**
   * Manipula erro de conexão
   */
  handleConnectionError(error) {
    console.error('❌ Erro de conexão:', error.message);
    
    if (!this.isReconnecting) {
      this.attemptReconnect();
    }
  }

  /**
   * Tenta reconectar com backoff exponencial
   */
  attemptReconnect() {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('⏹️ Limite de tentativas de reconexão atingido');
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;
    this.stats.totalReconnects++;

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.performReconnect();
    }, delay);
  }

  /**
   * Executa a reconexão
   */
  performReconnect() {
    if (!this.socket) {
      console.error('❌ Socket não disponível para reconexão');
      this.handleReconnectFailure();
      return;
    }

    const startTime = Date.now();
    
    try {
      // Tentar reconectar
      this.socket.connect();
      
      // Timeout para reconexão
      const reconnectTimeout = setTimeout(() => {
        if (!this.isConnected) {
          console.log('⏰ Timeout na reconexão');
          this.handleReconnectFailure();
        }
      }, this.heartbeatTimeout);

      // Limpar timeout quando conectar
      this.socket.once('connect', () => {
        clearTimeout(reconnectTimeout);
        const reconnectTime = Date.now() - startTime;
        this.stats.averageReconnectTime = 
          (this.stats.averageReconnectTime + reconnectTime) / 2;
        this.stats.lastReconnectTime = reconnectTime;
      });

    } catch (error) {
      console.error('❌ Erro na reconexão:', error);
      this.handleReconnectFailure();
    }
  }

  /**
   * Manipula sucesso na reconexão
   */
  handleReconnectSuccess() {
    this.isReconnecting = false;
    this.reconnectAttempts = 0;
    this.stats.successfulReconnects++;
    
    // Callback de reconexão
    if (this.onReconnect) {
      this.onReconnect();
    }
    
    console.log('✅ Reconexão bem-sucedida');
  }

  /**
   * Manipula falha na reconexão
   */
  handleReconnectFailure() {
    this.isReconnecting = false;
    this.stats.failedReconnects++;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      // Tentar novamente
      setTimeout(() => {
        this.attemptReconnect();
      }, 1000);
    } else {
      console.error('❌ Falha definitiva na reconexão');
    }
  }

  /**
   * Manipula erro de autenticação
   */
  handleAuthError(error) {
    console.error('❌ Erro de autenticação durante reconexão:', error);
    this.handleReconnectFailure();
  }

  /**
   * Inicia o sistema de heartbeat
   */
  startHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.heartbeatInterval);

    console.log('💓 Heartbeat iniciado');
  }

  /**
   * Para o sistema de heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    console.log('💓 Heartbeat parado');
  }

  /**
   * Envia heartbeat para o servidor
   */
  sendHeartbeat() {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit('ping', { timestamp: Date.now() });
    this.lastHeartbeat = Date.now();

    // Timeout para resposta do heartbeat
    setTimeout(() => {
      if (this.lastHeartbeat === this.lastHeartbeat) {
        this.handleHeartbeatFailure();
      }
    }, this.heartbeatTimeout);
  }

  /**
   * Manipula resposta do heartbeat
   */
  handleHeartbeatResponse(data) {
    const latency = Date.now() - data.timestamp;
    console.log(`💓 Heartbeat recebido (latência: ${latency}ms)`);
  }

  /**
   * Manipula falha no heartbeat
   */
  handleHeartbeatFailure() {
    console.warn('💔 Falha no heartbeat');
    this.stats.heartbeatFailures++;
    
    // Callback de falha no heartbeat
    if (this.onHeartbeatFail) {
      this.onHeartbeatFail();
    }
    
    // Tentar reconectar se conectado mas sem heartbeat
    if (this.isConnected) {
      this.handleDisconnect('heartbeat_failure');
    }
  }

  /**
   * Salva estado atual para preservação durante reconexão
   */
  saveState() {
    if (!this.preserveState) return;

    this.savedState = {
      playerId: this.socketService?.getPlayerId?.() || null,
      username: this.socketService?.getUsername?.() || null,
      currentChunk: this.socketService?.getCurrentChunk?.() || null,
      timestamp: Date.now()
    };

    console.log('💾 Estado salvo para reconexão');
  }

  /**
   * Restaura estado após reconexão
   */
  restoreState() {
    if (!this.preserveState || !this.savedState) return;

    console.log('🔄 Restaurando estado após reconexão:', this.savedState);

    // Reautenticar se necessário
    if (this.savedState.playerId && this.socketService?.authenticate) {
      this.socketService.authenticate();
    }

    // Restaurar chunk se necessário
    if (this.savedState.currentChunk && this.socketService?.enterChunk) {
      this.socketService.enterChunk(
        this.savedState.currentChunk.x,
        this.savedState.currentChunk.y
      );
    }

    this.savedState = null;
  }

  /**
   * Adiciona mensagem à fila de mensagens pendentes
   * @param {string} event - Nome do evento
   * @param {Object} data - Dados da mensagem
   */
  queueMessage(event, data) {
    this.pendingMessages.push({
      event,
      data,
      timestamp: Date.now()
    });

    // Limitar tamanho da fila
    if (this.pendingMessages.length > 100) {
      this.pendingMessages.shift();
    }
  }

  /**
   * Processa mensagens pendentes após reconexão
   */
  processPendingMessages() {
    if (this.pendingMessages.length === 0) return;

    console.log(`📤 Processando ${this.pendingMessages.length} mensagens pendentes`);

    for (const message of this.pendingMessages) {
      if (this.socket && this.isConnected) {
        this.socket.emit(message.event, message.data);
      }
    }

    this.pendingMessages = [];
  }

  /**
   * Força desconexão e limpa recursos
   */
  disconnect() {
    console.log('🔌 Desconectando ConnectionManager...');
    
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.disconnect();
    }
    
    this.isConnected = false;
    this.isAuthenticated = false;
    this.isReconnecting = false;
    
    console.log('✅ ConnectionManager desconectado');
  }

  /**
   * Obtém estatísticas de conectividade
   * @returns {Object} Estatísticas detalhadas
   */
  getStats() {
    const now = Date.now();
    const uptime = this.isConnected ? now - this.stats.connectionUptime : 0;
    
    return {
      ...this.stats,
      isConnected: this.isConnected,
      isAuthenticated: this.isAuthenticated,
      isReconnecting: this.isReconnecting,
      reconnectAttempts: this.reconnectAttempts,
      uptime: uptime,
      pendingMessages: this.pendingMessages.length,
      config: {
        maxReconnectAttempts: this.maxReconnectAttempts,
        reconnectDelay: this.reconnectDelay,
        heartbeatInterval: this.heartbeatInterval,
        enableHeartbeat: this.enableHeartbeat,
        preserveState: this.preserveState
      }
    };
  }

  /**
   * Reseta estatísticas
   */
  resetStats() {
    this.stats = {
      totalReconnects: 0,
      successfulReconnects: 0,
      failedReconnects: 0,
      averageReconnectTime: 0,
      lastReconnectTime: 0,
      connectionUptime: 0,
      lastDisconnectTime: 0,
      heartbeatFailures: 0
    };
  }

  /**
   * Destrói o ConnectionManager
   */
  destroy() {
    console.log('🧹 Destruindo ConnectionManager...');
    
    this.disconnect();
    this.pendingMessages = [];
    this.savedState = null;
    
    console.log('✅ ConnectionManager destruído');
  }
}
