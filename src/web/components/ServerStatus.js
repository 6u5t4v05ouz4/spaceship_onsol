/**
 * Server Status Component
 * Mostra status da conexão com o servidor Node.js
 */

import socketService from '../../services/socketService.js';

export default class ServerStatus {
  constructor() {
    this.container = null;
    this.statusDot = null;
    this.statusText = null;
    this.playerInfo = null;
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'server-status-widget';
    this.container.innerHTML = `
      <div class="server-status-header">
        <h3>🌐 Status do Servidor</h3>
      </div>
      <div class="server-status-content">
        <div class="status-row">
          <span class="status-label">Conexão:</span>
          <div class="status-indicator">
            <span class="status-dot offline" data-status-dot></span>
            <span class="status-text" data-status-text>Desconectado</span>
          </div>
        </div>
        <div class="status-row">
          <span class="status-label">Autenticação:</span>
          <div class="status-indicator">
            <span class="status-dot offline" data-auth-dot></span>
            <span class="status-text" data-auth-text>Não autenticado</span>
          </div>
        </div>
        <div class="player-info" data-player-info style="display: none;">
          <div class="status-row">
            <span class="status-label">Player ID:</span>
            <span class="status-value" data-player-id>-</span>
          </div>
          <div class="status-row">
            <span class="status-label">Socket ID:</span>
            <span class="status-value" data-socket-id>-</span>
          </div>
        </div>
        <button class="btn btn-sm btn-primary" data-connect-btn style="margin-top: 1rem;">
          Conectar
        </button>
      </div>
    `;

    // Referências
    this.statusDot = this.container.querySelector('[data-status-dot]');
    this.statusText = this.container.querySelector('[data-status-text]');
    this.authDot = this.container.querySelector('[data-auth-dot]');
    this.authText = this.container.querySelector('[data-auth-text]');
    this.playerInfo = this.container.querySelector('[data-player-info]');
    this.playerIdEl = this.container.querySelector('[data-player-id]');
    this.socketIdEl = this.container.querySelector('[data-socket-id]');
    this.connectBtn = this.container.querySelector('[data-connect-btn]');

    // Event listeners
    this.setupEventListeners();

    // Estado inicial
    this.updateStatus();

    // Auto-conectar se não estiver conectado
    if (!socketService.isConnected()) {
      socketService.connect();
    }

    return this.container;
  }

  setupEventListeners() {
    // Botão de conectar
    this.connectBtn.addEventListener('click', () => {
      if (socketService.isConnected()) {
        socketService.disconnect();
        this.connectBtn.textContent = 'Conectar';
      } else {
        socketService.connect();
        this.connectBtn.textContent = 'Conectando...';
        this.connectBtn.disabled = true;
      }
    });

    // Socket events
    window.addEventListener('socket:connected', () => {
      this.updateStatus();
      this.connectBtn.textContent = 'Desconectar';
      this.connectBtn.disabled = false;
    });

    window.addEventListener('socket:disconnected', () => {
      this.updateStatus();
      this.connectBtn.textContent = 'Conectar';
      this.connectBtn.disabled = false;
    });

    window.addEventListener('socket:authenticated', () => {
      this.updateStatus();
    });

    window.addEventListener('socket:auth:error', () => {
      this.updateStatus();
    });

    window.addEventListener('socket:connect_error', (e) => {
      this.connectBtn.textContent = `Reconectar (${e.detail.attempts}/${socketService.maxReconnectAttempts})`;
      this.connectBtn.disabled = false;
    });
  }

  updateStatus() {
    const isConnected = socketService.isConnected();
    const isAuthenticated = socketService.isAuthenticated();

    // Status de conexão
    if (isConnected) {
      this.statusDot.className = 'status-dot online';
      this.statusText.textContent = 'Conectado';
    } else {
      this.statusDot.className = 'status-dot offline';
      this.statusText.textContent = 'Desconectado';
    }

    // Status de autenticação
    if (isAuthenticated) {
      this.authDot.className = 'status-dot online';
      this.authText.textContent = 'Autenticado';
      this.playerInfo.style.display = 'block';

      // Informações do player
      const playerId = socketService.getPlayerId();
      const socketId = socketService.getSocketId();

      this.playerIdEl.textContent = playerId ? playerId.substring(0, 8) + '...' : '-';
      this.socketIdEl.textContent = socketId || '-';
    } else {
      this.authDot.className = 'status-dot offline';
      this.authText.textContent = 'Não autenticado';
      this.playerInfo.style.display = 'none';
    }
  }

  destroy() {
    // Cleanup
    window.removeEventListener('socket:connected', this.updateStatus);
    window.removeEventListener('socket:disconnected', this.updateStatus);
    window.removeEventListener('socket:authenticated', this.updateStatus);
    window.removeEventListener('socket:auth:error', this.updateStatus);
  }
}

