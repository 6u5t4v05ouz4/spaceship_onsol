/**
 * Socket Service
 * Gerencia conexão WebSocket com o servidor Node.js
 */

import { io } from 'socket.io-client';
import PredictionManager from '../client/prediction-manager.js';
import InterpolationManager from '../client/interpolation-manager.js';

// Supabase é global, carregado via script tag no HTML
const getSupabase = () => {
  if (typeof window !== 'undefined' && window.supabaseClient) {
    return window.supabaseClient;
  }
  console.warn('⚠️ Supabase client not initialized yet');
  return null;
};

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.authenticated = false;
    this.playerId = null;
    this.playerState = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;

    // Sistemas de predição e interpolação
    this.predictionManager = new PredictionManager();
    this.interpolationManager = new InterpolationManager();

    // Configuração dos sistemas
    this.configureNetworkSystems();
  }

  /**
   * Configura sistemas de rede baseado na qualidade da conexão
   */
  configureNetworkSystems() {
    // Detectar qualidade da conexão e ajustar parâmetros
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      const effectiveType = connection.effectiveType;

      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          // Conexão lenta - mais delay, menos previsão
          this.predictionManager.configure({
            interpolationDelay: 200,
            inputBufferSize: 30
          });
          this.interpolationManager.configure({
            interpolationDelay: 200,
            maxBufferSize: 20
          });
          break;

        case '3g':
          // Conexão média - configurações balanceadas
          this.predictionManager.configure({
            interpolationDelay: 150,
            inputBufferSize: 45
          });
          this.interpolationManager.configure({
            interpolationDelay: 150,
            maxBufferSize: 25
          });
          break;

        case '4g':
        default:
          // Conexão rápida - mínimo delay, máxima precisão
          this.predictionManager.configure({
            interpolationDelay: 100,
            inputBufferSize: 60
          });
          this.interpolationManager.configure({
            interpolationDelay: 100,
            maxBufferSize: 30
          });
          break;
      }
    }
  }

  /**
   * Conecta ao servidor WebSocket
   */
  connect() {
    if (this.socket?.connected) {
      console.log('✅ Já conectado ao servidor');
      return;
    }

    const serverUrl = import.meta.env.VITE_SERVER_URL || window.location.origin;
    console.log('🔌 Conectando ao servidor:', serverUrl);

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000,
    });

    this.setupListeners();
  }

  /**
   * Configura event listeners
   */
  setupListeners() {
    // ===== Conexão =====
    this.socket.on('connect', () => {
      console.log('✅ Conectado ao servidor:', this.socket.id);
      this.connected = true;
      this.reconnectAttempts = 0;

      // Disparar evento customizado
      window.dispatchEvent(new CustomEvent('socket:connected', {
        detail: { socketId: this.socket.id }
      }));

      // Auto-autenticar após conectar
      setTimeout(() => {
        this.authenticateIfNeeded();
      }, 500);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado:', reason);
      this.connected = false;
      this.authenticated = false;

      window.dispatchEvent(new CustomEvent('socket:disconnected', {
        detail: { reason }
      }));
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão:', error.message);
      this.reconnectAttempts++;

      window.dispatchEvent(new CustomEvent('socket:connect_error', {
        detail: { error: error.message, attempts: this.reconnectAttempts }
      }));
    });

    // ===== Autenticação =====
    this.socket.on('auth:success', (data) => {
      console.log('✅ Autenticado:', data.playerId);
      this.authenticated = true;
      this.playerId = data.playerId;
      this.playerState = data.playerState;

      console.log('📡 Disparando evento socket:authenticated');
      window.dispatchEvent(new CustomEvent('socket:authenticated', {
        detail: data
      }));
      console.log('✅ Estado do socketService:', {
        connected: this.connected,
        authenticated: this.authenticated,
        playerId: this.playerId
      });
    });

    this.socket.on('auth:error', (data) => {
      console.error('❌ Erro de autenticação:', data.message);
      this.authenticated = false;

      window.dispatchEvent(new CustomEvent('socket:auth:error', {
        detail: data
      }));
    });

    // ===== Chunk =====
    this.socket.on('chunk:data', (data) => {
      console.log('📦 Dados do chunk:', data.chunk.zone_type, `(${data.chunk.chunk_x}, ${data.chunk.chunk_y})`);
      console.log('  - Asteroides:', data.asteroids?.length || 0);
      console.log('  - Players:', data.players?.length || 0);
      
      // Log detalhado de cada player
      if (data.players && data.players.length > 0) {
        console.log('👥 Players recebidos:');
        data.players.forEach((player, index) => {
          console.log(`  ${index + 1}. ${player.username} (ID: ${player.id})`);
          console.log(`     - Posição: (${player.x}, ${player.y})`);
          console.log(`     - Chunk: ${player.current_chunk}`);
          console.log(`     - Health: ${player.health}/${player.max_health}`);
        });
      }

      window.dispatchEvent(new CustomEvent('socket:chunk:data', {
        detail: data
      }));
    });

    // ===== Players =====
    this.socket.on('player:joined', (data) => {
      console.log('👤 Player entrou:', data.username);
      console.log('   - ID:', data.id);
      console.log('   - Posição:', `(${data.x}, ${data.y})`);
      console.log('   - Chunk:', data.current_chunk);
      console.log('   - Health:', `${data.health}/${data.max_health}`);

      window.dispatchEvent(new CustomEvent('socket:player:joined', {
        detail: data
      }));
    });

    this.socket.on('player:left', (data) => {
      console.log('👋 Player saiu:', data.playerId);

      window.dispatchEvent(new CustomEvent('socket:player:left', {
        detail: data
      }));
    });

    this.socket.on('player:moved', (data) => {
      window.dispatchEvent(new CustomEvent('socket:player:moved', {
        detail: data
      }));
    });

    // ===== Combate =====
    this.socket.on('battle:hit', (data) => {
      console.log('💥 Você foi atingido!', {
        attacker: data.attackerName,
        damage: data.damage,
        critical: data.isCritical,
        health: `${data.health}/${data.maxHealth}`,
      });

      window.dispatchEvent(new CustomEvent('socket:battle:hit', {
        detail: data
      }));
    });

    this.socket.on('battle:attack', (data) => {
      console.log('⚔️ Combate:', `${data.attackerName} → ${data.defenderName} (-${data.damage})`);

      window.dispatchEvent(new CustomEvent('socket:battle:attack', {
        detail: data
      }));
    });

    this.socket.on('battle:attack:success', (data) => {
      console.log('✅ Ataque bem-sucedido:', data);

      window.dispatchEvent(new CustomEvent('socket:battle:attack:success', {
        detail: data
      }));
    });

    this.socket.on('battle:attack:failed', (data) => {
      console.log('❌ Ataque falhou:', data.reason);

      window.dispatchEvent(new CustomEvent('socket:battle:attack:failed', {
        detail: data
      }));
    });

    this.socket.on('player:died', (data) => {
      console.log('💀 Player morreu:', `${data.victimName} (morto por ${data.killerName})`);

      window.dispatchEvent(new CustomEvent('socket:player:died', {
        detail: data
      }));
    });

    this.socket.on('player:death', (data) => {
      console.log('💀 Você morreu!', {
        killer: data.killerName,
        respawnIn: `${data.respawnDelay / 1000}s`,
      });

      window.dispatchEvent(new CustomEvent('socket:player:death', {
        detail: data
      }));
    });

    this.socket.on('player:respawned', (data) => {
      console.log('🔄 Respawn:', data);

      window.dispatchEvent(new CustomEvent('socket:player:respawned', {
        detail: data
      }));
    });

    // ===== Erros =====
    this.socket.on('error', (data) => {
      console.error('❌ Erro:', data.message);

      window.dispatchEvent(new CustomEvent('socket:error', {
        detail: data
      }));
    });

    this.socket.on('battle:error', (data) => {
      console.error('❌ Erro de combate:', data.message);

      window.dispatchEvent(new CustomEvent('socket:battle:error', {
        detail: data
      }));
    });

    // ===== Validação e Correção =====
    this.socket.on('position:corrected', (data) => {
      console.warn('⚠️ Posição corrigida pelo servidor:', data.reason);

      // Aplicar correção no prediction manager
      this.predictionManager.processPositionCorrection(data);

      window.dispatchEvent(new CustomEvent('socket:position:corrected', {
        detail: data
      }));
    });

    // ===== Confirmação do Servidor (para predição) =====
    this.socket.on('move:confirmed', (data) => {
      // Processar confirmação no prediction manager
      this.predictionManager.processServerConfirmation(data);

      window.dispatchEvent(new CustomEvent('socket:move:confirmed', {
        detail: data
      }));
    });
  }

  /**
   * Autentica com o servidor
   */
  async authenticate() {
    if (!this.connected) {
      console.error('❌ Não conectado ao servidor');
      return false;
    }

    const supabase = getSupabase();
    if (!supabase) {
      console.error('❌ Supabase client não disponível');
      return false;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.error('❌ Sem sessão ativa no Supabase');
      return false;
    }

    console.log('🔐 Autenticando com servidor...');

    // Obter dados do usuário do Supabase
    const { data: userData } = await supabase.auth.getUser();

    this.socket.emit('auth', {
      token: session.access_token,
      userId: userData?.user?.id || `demo_${Date.now()}`,
      username: userData?.user?.user_metadata?.username || userData?.user?.email?.split('@')[0] || `Player_${Date.now().toString(36)}`
    });

    return true;
  }

  /**
   * Auto-autentica se necessário
   */
  async authenticateIfNeeded() {
    if (!this.authenticated && this.connected) {
      await this.authenticate();
    }
  }

  /**
   * Entra em um chunk
   */
  enterChunk(chunkX, chunkY) {
    if (!this.authenticated) {
      console.error('❌ Não autenticado');
      return false;
    }

    console.log(`📍 Entrando no chunk (${chunkX}, ${chunkY})`);
    this.socket.emit('chunk:enter', { chunkX, chunkY });
    return true;
  }

  /**
   * Atualiza posição com predição client-side
   */
  updatePosition(x, y, chunkX, chunkY) {
    if (!this.authenticated) return false;

    // Processar input no prediction manager
    const inputData = {
      thrust: true, // Detecção simples de movimento
      targetX: x,
      targetY: y,
      chunkX: chunkX || Math.floor(x / 1000),
      chunkY: chunkY || Math.floor(y / 1000)
    };

    const predictionData = this.predictionManager.processInput(inputData);

    // Enviar ao servidor com dados de predição
    this.socket.emit('player:move', {
      x,
      y,
      chunkX: chunkX || Math.floor(x / 1000),
      chunkY: chunkY || Math.floor(y / 1000),
      sequence: predictionData.sequence,
      timestamp: predictionData.timestamp
    });

    return true;
  }

  /**
   * Obtém posição atual predita do jogador
   */
  getPredictedPosition() {
    return this.predictionManager.getCurrentState();
  }

  /**
   * Obtém posição interpolada de outro jogador
   */
  getInterpolatedPosition(playerId) {
    return this.interpolationManager.getInterpolatedPosition(playerId);
  }

  /**
   * Atualiza entidade no interpolation manager
   */
  updateEntityPosition(playerId, position, rotation, health) {
    this.interpolationManager.updateEntity(playerId, position, rotation, health);
  }

  /**
   * Remove entidade do interpolation manager
   */
  removeEntity(playerId) {
    this.interpolationManager.removeEntity(playerId);
  }

  /**
   * Ataca outro jogador
   */
  attack(targetId) {
    if (!this.authenticated) {
      console.error('❌ Não autenticado');
      return false;
    }

    console.log(`⚔️ Atacando ${targetId}`);
    this.socket.emit('battle:attack', { targetId });
    return true;
  }

  /**
   * Solicita respawn
   */
  respawn() {
    if (!this.authenticated) {
      console.error('❌ Não autenticado');
      return false;
    }

    console.log('🔄 Solicitando respawn...');
    this.socket.emit('battle:respawn', {});
    return true;
  }

  /**
   * Desconecta
   */
  disconnect() {
    if (this.socket) {
      console.log('👋 Desconectando...');
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.authenticated = false;
      this.playerId = null;
      this.playerState = null;
    }
  }

  /**
   * Verifica se está conectado
   */
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  /**
   * Verifica se está autenticado
   */
  isAuthenticated() {
    return this.authenticated;
  }

  /**
   * Obtém ID do jogador
   */
  getPlayerId() {
    return this.playerId;
  }

  /**
   * Obtém username do jogador
   */
  getUsername() {
    return this.playerState?.username || null;
  }

  /**
   * Obtém estado do jogador
   */
  getPlayerState() {
    return this.playerState;
  }

  /**
   * Obtém socket ID
   */
  getSocketId() {
    return this.socket?.id;
  }

  /**
   * Update principal (para ser chamado a cada frame)
   */
  update() {
    // Atualizar prediction manager
    this.predictionManager.update();

    // Atualizar interpolation manager
    this.interpolationManager.update();
  }

  /**
   * Obtém estatísticas dos sistemas de rede
   */
  getNetworkStats() {
    return {
      prediction: this.predictionManager.getStats(),
      interpolation: this.interpolationManager.getStats(),
      connection: {
        connected: this.connected,
        authenticated: this.authenticated,
        latency: this.predictionManager.getEstimatedLatency()
      }
    };
  }

  /**
   * Reseta os sistemas de predição e interpolação
   */
  resetNetworkSystems() {
    this.predictionManager.reset();
    this.interpolationManager.clear();
  }

  /**
   * Inicializa os sistemas com estado inicial
   */
  initializeNetworkSystems(initialState) {
    this.predictionManager.initialize(initialState);
  }
}

// Singleton
const socketService = new SocketService();

export default socketService;

