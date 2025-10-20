/**
 * MultiplayerGamePage - Página do jogo multiplayer
 * Gerencia a inicialização do Phaser com a MultiplayerGameScene
 * Baseada na estrutura das outras páginas do sistema SPA
 */

import * as authService from '../../shared/services/authService.js';
import { navigateTo } from '../../shared/router.js';
import HeaderNavigation from '../components/HeaderNavigation.js';

export default class MultiplayerGamePage {
  constructor(supabaseClient) {
    this.name = 'MultiplayerGamePage';
    this.supabase = supabaseClient;
    this.gameInstance = null;
    this.container = null;

    // Dados do jogador para passar para o jogo
    this.playerData = {
      playerName: '',
      walletAddress: null,
      userId: null
    };
  }

  /**
   * Renderiza a página do jogo multiplayer
   */
  render() {
    this.container = document.createElement('div');
    this.container.className = 'multiplayer-game-page';
    this.container.innerHTML = `
      <div class="background-primary"></div>
      <div class="stars-background"></div>

      <!-- Global Navigation Header -->
      <div id="globalHeader"></div>

      <!-- Game Container -->
      <div class="game-container">
        <!-- Loading State -->
        <div id="gameLoadingState" class="game-loading-state">
          <div class="loading-content">
            <div class="spinner">🚀</div>
            <h2>Iniciando Mundo Multiplayer</h2>
            <p>Conectando ao servidor...</p>
            <div class="loading-progress">
              <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
              </div>
              <span id="loadingText">Autenticando...</span>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div id="gameErrorState" class="game-error-state" role="alert" aria-live="polite" style="display: none;">
          <div class="error-content">
            <div class="error-icon" role="img" aria-label="Erro">❌</div>
            <h2>Erro ao Conectar</h2>
            <p class="error-message" id="gameErrorMessage"></p>
            <div class="error-actions">
              <button id="retryConnectionBtn" class="retry-btn">
                <span role="img" aria-label="Recarregar">🔄</span> Tentar Novamente
              </button>
              <button id="backToDashboardBtn" class="back-btn">
                <span role="img" aria-label="Voltar">🏠</span> Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>

        <!-- Game Canvas Container -->
        <div id="gameCanvasContainer" class="game-canvas-container" style="display: none;">
          <!-- O Phaser vai renderizar aqui -->
          <div id="gameCanvas"></div>

          <!-- Game UI Overlay -->
          <div class="game-ui-overlay">
            <!-- Player Info -->
            <div class="player-info">
              <div class="player-avatar" id="playerAvatar">👤</div>
              <div class="player-details">
                <span class="player-name" id="playerName"></span>
                <span class="player-location" id="playerLocation">Chunk (0, 0)</span>
              </div>
            </div>

            <!-- Multiplayer Stats -->
            <div class="multiplayer-stats">
              <div class="stat-item">
                <span class="stat-icon">👥</span>
                <span class="stat-label">Players:</span>
                <span class="stat-value" id="playersCount">1</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">🌍</span>
                <span class="stat-label">Chunk:</span>
                <span class="stat-value" id="currentChunk">(0, 0)</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">📶</span>
                <span class="stat-label">Ping:</span>
                <span class="stat-value" id="pingValue">--</span>
              </div>
            </div>

            <!-- Controls Help -->
            <div class="controls-help">
              <button class="help-toggle" id="helpToggle">?</button>
              <div class="help-content" id="helpContent" style="display: none;">
                <h4>Controles</h4>
                <div class="control-item">
                  <kbd>W A S D</kbd> ou <kbd>Setas</kbd> - Mover
                </div>
                <div class="control-item">
                  <kbd>Mouse</kbd> - Mirar
                </div>
                <div class="control-item">
                  <kbd>Clique Esquerdo</kbd> - Atirar
                </div>
                <div class="control-item">
                  <kbd>E</kbd> - Testar Explosão
                </div>
                <div class="control-item">
                  <kbd>ESC</kbd> - Menu Pausa
                </div>
              </div>
            </div>
          </div>

          <!-- Disconnect Button -->
          <button class="disconnect-btn" id="disconnectBtn" title="Desconectar e voltar">
            <span>🚪</span>
          </button>
        </div>
      </div>
    `;

    // Inicializa componentes
    this.initializeComponents();

    // Configura eventos
    this.setupEvents();

    // Inicia o jogo
    this.initializeGame();

    return this.container;
  }

  /**
   * Inicializa componentes da página
   */
  initializeComponents() {
    // Header Navigation
    const headerContainer = this.container.querySelector('#globalHeader');
    const headerNav = new HeaderNavigation(this.supabase);
    headerContainer.appendChild(headerNav.render());
  }

  /**
   * Configura eventos da página
   */
  setupEvents() {
    // Botão de tentar novamente
    const retryBtn = this.container.querySelector('#retryConnectionBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.hideError();
        this.showLoading();
        this.initializeGame();
      });
    }

    // Botão de voltar ao dashboard
    const backBtn = this.container.querySelector('#backToDashboardBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        navigateTo('/dashboard');
      });
    }

    // Botão de desconectar
    const disconnectBtn = this.container.querySelector('#disconnectBtn');
    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => {
        this.disconnect();
      });
    }

    // Toggle de ajuda
    const helpToggle = this.container.querySelector('#helpToggle');
    const helpContent = this.container.querySelector('#helpContent');
    if (helpToggle && helpContent) {
      helpToggle.addEventListener('click', () => {
        helpContent.style.display = helpContent.style.display === 'none' ? 'block' : 'none';
      });
    }

    // Cleanup ao sair da página
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  /**
   * Inicializa o jogo Phaser
   */
  async initializeGame() {
    try {
      this.updateLoadingProgress('Autenticando...', 20);

      // Obtém dados do usuário
      const session = await authService.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      this.updateLoadingProgress('Carregando perfil...', 40);

      // Obtém perfil do usuário
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !profile) {
        console.warn('Perfil não encontrado, usando dados básicos');
        this.playerData = {
          playerName: session.user.email?.split('@')[0] || 'Player',
          walletAddress: null,
          userId: session.user.id
        };
      } else {
        this.playerData = {
          playerName: profile.username || session.user.email?.split('@')[0] || 'Player',
          walletAddress: profile.wallet_address || null,
          userId: session.user.id
        };
      }

      this.updateLoadingProgress('Carregando assets do jogo...', 60);

      // Carrega o script do Phaser se ainda não estiver carregado
      await this.loadPhaserScript();

      this.updateLoadingProgress('Inicializando mundo multiplayer...', 80);

      // Inicializa o jogo
      await this.startPhaserGame();

      this.updateLoadingProgress('Conectado!', 100);

      // Mostra o jogo após um breve delay
      setTimeout(() => {
        this.hideLoading();
        this.showGame();
      }, 500);

    } catch (error) {
      console.error('Erro ao inicializar jogo multiplayer:', error);
      this.showError(error.message);
    }
  }

  /**
   * Carrega o script do Phaser se necessário
   */
  async loadPhaserScript() {
    return new Promise((resolve, reject) => {
      if (window.Phaser) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Inicia o jogo Phaser
   */
  async startPhaserGame() {
    // Carrega a cena multiplayer
    const { default: MultiplayerGameScene } = await import('../../scenes/MultiplayerGameScene.js');

    // Configuração do jogo
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#000000',
      parent: 'gameCanvas',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
          fps: 60
        }
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%'
      },
      scene: [MultiplayerGameScene],
      audio: {
        disableWebAudio: false
      }
    };

    // Inicializa o jogo
    this.gameInstance = new Phaser.Game(config);

    // Aguarda o jogo estar pronto
    return new Promise((resolve) => {
      this.gameInstance.events.on('ready', () => {
        console.log('✅ Jogo multiplayer inicializado');
        this.updatePlayerInfo();
        resolve();
      });
    });
  }

  /**
   * Atualiza informações do jogador na UI
   */
  updatePlayerInfo() {
    const playerNameEl = this.container.querySelector('#playerName');
    const playerAvatarEl = this.container.querySelector('#playerAvatar');

    if (playerNameEl) {
      playerNameEl.textContent = this.playerData.playerName;
    }

    if (playerAvatarEl) {
      playerAvatarEl.textContent = '👤';
    }
  }

  /**
   * Atualiza a barra de progresso de loading
   */
  updateLoadingProgress(text, progress) {
    const loadingText = this.container.querySelector('#loadingText');
    const progressFill = this.container.querySelector('#progressFill');

    if (loadingText) {
      loadingText.textContent = text;
    }

    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }
  }

  /**
   * Mostra estado de loading
   */
  showLoading() {
    const loadingState = this.container.querySelector('#gameLoadingState');
    const errorState = this.container.querySelector('#gameErrorState');
    const gameContainer = this.container.querySelector('#gameCanvasContainer');

    if (loadingState) loadingState.style.display = 'flex';
    if (errorState) errorState.style.display = 'none';
    if (gameContainer) gameContainer.style.display = 'none';
  }

  /**
   * Esconde estado de loading
   */
  hideLoading() {
    const loadingState = this.container.querySelector('#gameLoadingState');
    if (loadingState) loadingState.style.display = 'none';
  }

  /**
   * Mostra o jogo
   */
  showGame() {
    const gameContainer = this.container.querySelector('#gameCanvasContainer');
    if (gameContainer) gameContainer.style.display = 'block';
  }

  /**
   * Mostra estado de erro
   */
  showError(message) {
    const loadingState = this.container.querySelector('#gameLoadingState');
    const errorState = this.container.querySelector('#gameErrorState');
    const errorMessage = this.container.querySelector('#gameErrorMessage');

    if (loadingState) loadingState.style.display = 'none';
    if (errorState) errorState.style.display = 'flex';
    if (errorMessage) errorMessage.textContent = message;
  }

  /**
   * Esconde estado de erro
   */
  hideError() {
    const errorState = this.container.querySelector('#gameErrorState');
    if (errorState) errorState.style.display = 'none';
  }

  /**
   * Desconecta do jogo e volta ao dashboard
   */
  disconnect() {
    console.log('🔌 Desconectando do jogo multiplayer...');

    // Para o jogo
    if (this.gameInstance) {
      this.gameInstance.destroy(true);
      this.gameInstance = null;
    }

    // Volta ao dashboard
    navigateTo('/dashboard');
  }

  /**
   * Cleanup de recursos
   */
  cleanup() {
    if (this.gameInstance) {
      this.gameInstance.destroy(true);
      this.gameInstance = null;
    }

    console.log('🧹 MultiplayerGamePage limpo');
  }

  /**
   * Destrói a página
   */
  destroy() {
    this.cleanup();
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}