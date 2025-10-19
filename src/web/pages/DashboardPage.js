/**
 * DashboardPage - Dashboard do usuário logado
 * Exibe estatísticas, naves, inventory e achievements
 */

import * as authService from '../../shared/services/authService.js';
import * as userInitService from '../../shared/services/userInitService.js';
import { navigateTo } from '../../shared/router.js';
import HeaderNavigation from '../components/HeaderNavigation.js';

export default class DashboardPage {
  constructor(supabaseClient) {
    this.name = 'DashboardPage';
    this.supabase = supabaseClient;
    this.data = {
      profile: null,
      gameData: null,
      inventory: [],
      ships: [],
      achievements: [],
    };
  }

  /**
   * Renderiza o dashboard
   */
  render() {
    const container = document.createElement('div');
    container.className = 'dashboard-page';
    container.innerHTML = `
      <div class="background-primary"></div>
      <div class="stars-background"></div>

      <!-- Global Navigation Header -->
      <div id="globalHeader"></div>

      <div class="dashboard-wrapper">

        <!-- Content -->
        <div class="dashboard-content">
          <!-- Loading State -->
          <div id="loadingState" class="loading-state">
            <div class="spinner">⏳</div>
            <p>Carregando dados...</p>
          </div>

          <!-- Error State -->
          <div id="errorState" class="error-state" role="alert" aria-live="polite" style="display: none;">
            <div class="error-icon" role="img" aria-label="Erro">❌</div>
            <p class="error-message" id="errorMessage"></p>
            <button id="retryBtn" class="retry-btn" aria-label="Tentar carregar dados novamente">
              <span role="img" aria-label="Recarregar">🔄</span> Tentar Novamente
            </button>
          </div>

          <!-- Data State -->
          <div id="dataState" class="data-state" style="display: none;">
            <!-- User Profile & Ship Display -->
            <div class="profile-ship-container">
              <!-- User Profile -->
              <section class="profile-section">
                <div class="profile-card">
                  <div id="profileAvatar" class="profile-avatar">👤</div>
                  <div class="profile-info">
                    <h2 id="username" class="profile-username"></h2>
                    <p id="userEmail" class="profile-email"></p>
                  </div>
                </div>
              </section>

              <!-- Ship Display -->
              <section class="ship-display-section">
                <h3 class="section-title">
                  <span role="img" aria-label="Nave">🚀</span> Sua Nave
                </h3>
                <div class="ship-display-card">
                  <div class="ship-visual">
                    <canvas id="shipCanvas" width="128" height="64"></canvas>
                  </div>
                  <div class="ship-info">
                    <h4 id="shipName" class="ship-name">Space Miner Comum</h4>
                    <div id="shipRarity" class="ship-rarity">Comum</div>
                    <div class="ship-stats">
                      <div class="ship-stat">
                        <span class="ship-stat-icon">⚡</span>
                        <span class="ship-stat-label">Velocidade:</span>
                        <span id="shipSpeed" class="ship-stat-value">100</span>
                      </div>
                      <div class="ship-stat">
                        <span class="ship-stat-icon">📦</span>
                        <span class="ship-stat-label">Carga:</span>
                        <span id="shipCargo" class="ship-stat-value">50</span>
                      </div>
                      <div class="ship-stat">
                        <span class="ship-stat-icon">⛽</span>
                        <span class="ship-stat-label">Combustível:</span>
                        <span id="shipFuel" class="ship-stat-value">100</span>
                      </div>
                      <div class="ship-stat">
                        <span class="ship-stat-icon">🛡️</span>
                        <span class="ship-stat-label">Escudo:</span>
                        <span id="shipShield" class="ship-stat-value">100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <!-- Stats Grid -->
            <section class="stats-section">
              <h3 class="section-title">
                <span role="img" aria-label="Estatísticas">📊</span> Estatísticas de Jogo
              </h3>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">🎮</div>
                  <div class="stat-label">Sessões</div>
                  <div class="stat-value" id="sessionsCount">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">⏱️</div>
                  <div class="stat-label">Tempo Jogado</div>
                  <div class="stat-value" id="playTime">0h</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🌍</div>
                  <div class="stat-label">Planetas</div>
                  <div class="stat-value" id="planetsDiscovered">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">⛏️</div>
                  <div class="stat-label">Minerações</div>
                  <div class="stat-value" id="miningSessions">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">⚔️</div>
                  <div class="stat-label">Batalhas</div>
                  <div class="stat-value" id="totalBattles">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🏆</div>
                  <div class="stat-label">Vitórias</div>
                  <div class="stat-value" id="battlesWon">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🔨</div>
                  <div class="stat-label">Itens Criados</div>
                  <div class="stat-value" id="itemsCrafted">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🚀</div>
                  <div class="stat-label">Distância</div>
                  <div class="stat-value" id="distanceTraveled">0 km</div>
                </div>
              </div>
            </section>

            <!-- Wallet Section -->
            <section class="wallet-section">
              <h3 class="section-title">
                <span role="img" aria-label="Carteira">💰</span> Carteira
              </h3>
              <div class="wallet-grid">
                <div class="wallet-card space-tokens">
                  <div class="wallet-icon">🪙</div>
                  <div class="wallet-info">
                    <div class="wallet-label">Space Tokens</div>
                    <div class="wallet-value" id="spaceTokens">0</div>
                    <div class="wallet-description">Moeda do jogo</div>
                  </div>
                </div>
                <div class="wallet-card sol-tokens">
                  <div class="wallet-icon">◎</div>
                  <div class="wallet-info">
                    <div class="wallet-label">SOL Tokens</div>
                    <div class="wallet-value" id="solTokens">0.00</div>
                    <div class="wallet-description">Blockchain Solana</div>
                  </div>
                </div>
                <div class="wallet-card total-earned">
                  <div class="wallet-icon">💎</div>
                  <div class="wallet-info">
                    <div class="wallet-label">Total Ganho</div>
                    <div class="wallet-value" id="totalEarned">0</div>
                    <div class="wallet-description">Tokens acumulados</div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Inventory Section -->
            <section class="inventory-section">
              <h3 class="section-title">
                <span role="img" aria-label="Inventário">🎒</span> Inventário de Recursos
              </h3>
              <div id="inventoryGrid" class="inventory-grid">
                <p class="empty-message">Inventário vazio - Comece a minerar!</p>
              </div>
            </section>

            <!-- Recent Activity Section -->
            <section class="activity-section">
              <h3 class="section-title">
                <span role="img" aria-label="Atividade">📜</span> Atividade Recente
              </h3>
              <div id="recentActivity" class="activity-list">
                <p class="empty-message">Nenhuma atividade recente</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    `;

    // Adicionar estilos
    this.addStyles();

    // Renderizar header de navegação global
    this.renderGlobalHeader(container);

    // Carregar dados
    this.loadData(container);

    const retryBtn = container.querySelector('#retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.loadData(container);
      });
    }


    return container;
  }

  /**
   * Renderizar header de navegação global
   */
  renderGlobalHeader(container) {
    const headerContainer = container.querySelector('#globalHeader');
    if (headerContainer) {
      const headerNav = new HeaderNavigation();
      const headerElement = headerNav.render();
      headerContainer.appendChild(headerElement);
    }
  }

  /**
   * Carrega dados do Supabase
   */
  async loadData(container) {
    this.showLoading(container);

    try {
      // Obter sessão
      const session = await authService.getSession();
      if (!session) {
        this.showError(container, 'Sessão expirada. Faça login novamente.');
        setTimeout(() => navigateTo('/login'), 1500);
        return;
      }

      const userId = session.user.id;
      const googleEmail = session.user.email;
      const googleUser = session.user;
      console.log('📊 Carregando dados para usuário:', googleEmail);

      // Ensure user is initialized before loading data
      console.log('🔍 Ensuring user data is initialized...');
      await userInitService.ensureUserInitialized(
        this.supabase, 
        googleEmail, 
        googleUser
      );

      // Buscar profile
      const profile = await this.fetchProfile(googleEmail);
      this.data.profile = profile;

      // Garantir dados do Google OAuth
      if (!this.data.profile.google_name) {
        this.data.profile.google_name = googleUser.user_metadata?.name || googleUser.email?.split('@')[0] || 'Usuário';
        this.data.profile.google_email = googleUser.email;
        this.data.profile.google_picture = googleUser.user_metadata?.picture;
        this.data.profile.display_name = this.data.profile.display_name || this.data.profile.google_name;
      }

      // Buscar player stats (substitui game_data)
      const playerStats = await this.fetchPlayerStats(userId);
      this.data.gameData = playerStats || {};

      // Buscar inventory
      const inventory = await this.fetchInventory(userId);
      this.data.inventory = inventory || [];

      // Buscar wallet (ships agora é wallet)
      const wallet = await this.fetchShips(userId);
      this.data.ships = wallet || [];

      console.log('✅ Dados carregados:', this.data);

      this.hideLoading(container);
      this.renderData(container);

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      this.showError(container, error.message);
    }
  }

  /**
   * Renderizar nave do usuário no canvas
   */
  async renderShipDisplay(container) {
    try {
      const canvas = container.querySelector('#shipCanvas');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      
      // Buscar tipo de nave do perfil do usuário
      const userShipType = this.data.profile?.ship_type || 'default_idle';
      const userShipRarity = this.data.profile?.ship_rarity || 'Comum';
      
      console.log('🚀 Renderizando nave do usuário:', { userShipType, userShipRarity });
      
      // Definir características da nave padrão (Comum)
      const rarityLevels = {
        'Comum': {
          speed: 100,
          cargo: 50,
          fuel: 100,
          shield: 100,
          color: '#CCCCCC',
          name: 'Space Miner Comum'
        },
        'Incomum': {
          speed: 200,
          cargo: 100,
          fuel: 150,
          shield: 200,
          color: '#00FF00',
          name: 'Space Miner Incomum'
        },
        'Raro': {
          speed: 300,
          cargo: 150,
          fuel: 200,
          shield: 300,
          color: '#0080FF',
          name: 'Space Miner Raro'
        },
        'Épico': {
          speed: 400,
          cargo: 175,
          fuel: 250,
          shield: 400,
          color: '#8000FF',
          name: 'Space Miner Épico'
        },
        'Lendário': {
          speed: 500,
          cargo: 200,
          fuel: 300,
          shield: 500,
          color: '#FF8000',
          name: 'Space Miner Lendário'
        }
      };

      // Usar raridade do perfil do usuário
      const selectedRarity = userShipRarity;
      const shipData = rarityLevels[selectedRarity];

      // Determinar qual sprite carregar baseado no tipo de nave
      const shipSprites = {
        'default_idle': '/assets/images/idle.png',
        'nft_custom': '/assets/images/nft_ship.png' // Para futuras integrações NFT
      };

      // Carregar sprite da nave do usuário
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = shipSprites[userShipType] || shipSprites['default_idle'];
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Limpar canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Desenhar fundo escuro
          ctx.fillStyle = '#0a0a1a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Desenhar borda com cor da raridade
          ctx.strokeStyle = shipData.color;
          ctx.lineWidth = 2;
          ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
          
          // Desenhar nave idle (32x32 sprite)
          const scale = 1; // Escala maior para nave pequena
          const offsetX = (canvas.width - img.width * scale) / 2;
          const offsetY = (canvas.height - img.height * scale) / 2;
          
          ctx.drawImage(
            img,
            offsetX, offsetY, img.width * scale, img.height * scale // destination: centralizado e escalado
          );
          
          resolve();
        };
        img.onerror = reject;
      });

      // Atualizar informações da nave
      container.querySelector('#shipName').textContent = shipData.name;
      container.querySelector('#shipRarity').textContent = selectedRarity;
      container.querySelector('#shipRarity').style.color = shipData.color;
      container.querySelector('#shipSpeed').textContent = shipData.speed;
      container.querySelector('#shipCargo').textContent = shipData.cargo;
      container.querySelector('#shipFuel').textContent = shipData.fuel;
      container.querySelector('#shipShield').textContent = shipData.shield;

      console.log('✅ Nave renderizada no dashboard:', selectedRarity);
    } catch (error) {
      console.error('❌ Erro ao renderizar nave:', error);
      // Em caso de erro, apenas mostrar placeholder
      const canvas = container.querySelector('#shipCanvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ffcc';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🚀', canvas.width / 2, canvas.height / 2 + 7);
      }
    }
  }

  /**
   * Buscar profile do Supabase (com dados Google OAuth)
   */
  async fetchProfile(userId) {
    // Primeiro buscar dados do Google OAuth da sessão atual
    const session = await authService.getSession();
    const googleUser = session?.user;

    // Depois buscar profile do banco (que pode ter dados adicionais)
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('google_email', googleUser?.email) // Buscar por email do Google
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw new Error('Erro ao carregar perfil: ' + error.message);
    }

    // Combinar dados do Google OAuth com dados do banco
    const profile = data || { id: userId };

    // Sempre priorizar dados do Google OAuth
    if (googleUser) {
      profile.google_name = googleUser.user_metadata?.name || googleUser.email?.split('@')[0] || 'Usuário';
      profile.google_email = googleUser.email;
      profile.google_picture = googleUser.user_metadata?.picture;
      profile.display_name = profile.display_name || profile.google_name;
      profile.avatar_url = profile.avatar_url || profile.google_picture;
    }

    return profile;
  }

  /**
   * Buscar estatísticas do jogador do Supabase
   */
  async fetchPlayerStats(userId) {
    const { data, error } = await this.supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Aviso ao carregar player stats:', error.message);
      return null;
    }

    return data;
  }

  /**
   * Buscar inventory do Supabase
   */
  async fetchInventory(userId) {
    const { data, error } = await this.supabase
      .from('player_inventory')
      .select('*')
      .eq('user_id', userId);

    if (error && error.code !== 'PGRST116') {
      console.warn('Aviso ao carregar inventory:', error.message);
      return [];
    }

    return data || [];
  }

  /**
   * Buscar ships do Supabase
   */
  async fetchShips(userId) {
    const { data, error } = await this.supabase
      .from('player_wallet')
      .select('*')
      .eq('user_id', userId);

    if (error && error.code !== 'PGRST116') {
      console.warn('Aviso ao carregar ships:', error.message);
      return [];
    }

    return data || [];
  }

  /**
   * Renderizar dados
   */
  renderData(container) {
    const dataState = container.querySelector('#dataState');
    dataState.style.display = 'block';

    // Profile - usar dados do Google OAuth
    if (this.data.profile) {
      const username = this.data.profile.google_name || this.data.profile.display_name || 'Usuário';
      const email = this.data.profile.google_email || 'email@exemplo.com';
      const avatarUrl = this.data.profile.google_picture || this.data.profile.avatar_url;

      container.querySelector('#username').textContent = username;
      container.querySelector('#userEmail').textContent = email;

      // Avatar do Google
      const avatarElement = container.querySelector('#profileAvatar');
      if (avatarUrl) {
        avatarElement.innerHTML = `<img src="${avatarUrl}" alt="Avatar" class="google-avatar" />`;
      } else {
        avatarElement.textContent = '👤';
      }
    }

    // Renderizar nave do usuário
    this.renderShipDisplay(container);

    // Stats - usar player_stats
    const stats = this.data.gameData || {};
    
    // Estatísticas de Jogo
    container.querySelector('#sessionsCount').textContent = stats.sessions_count || 0;
    
    // Tempo jogado (converter segundos para horas)
    const playTimeHours = Math.floor((stats.total_play_time_seconds || 0) / 3600);
    const playTimeMinutes = Math.floor(((stats.total_play_time_seconds || 0) % 3600) / 60);
    container.querySelector('#playTime').textContent = playTimeHours > 0 
      ? `${playTimeHours}h ${playTimeMinutes}m` 
      : `${playTimeMinutes}m`;
    
    container.querySelector('#planetsDiscovered').textContent = stats.planets_discovered || 0;
    container.querySelector('#miningSessions').textContent = stats.total_mining_sessions || 0;
    container.querySelector('#totalBattles').textContent = stats.total_battles || 0;
    container.querySelector('#battlesWon').textContent = stats.battles_won || 0;
    container.querySelector('#itemsCrafted').textContent = stats.total_items_crafted || 0;
    
    // Distância (converter para km)
    const distanceKm = ((stats.distance_traveled || 0) / 1000).toFixed(1);
    container.querySelector('#distanceTraveled').textContent = `${distanceKm} km`;

    // Wallet - usar player_wallet
    const wallet = this.data.ships.length > 0 ? this.data.ships[0] : null;
    
    container.querySelector('#spaceTokens').textContent = wallet ? (wallet.space_tokens || 0).toLocaleString() : '0';
    container.querySelector('#solTokens').textContent = wallet ? parseFloat(wallet.sol_tokens || 0).toFixed(4) : '0.0000';
    container.querySelector('#totalEarned').textContent = (stats.total_tokens_earned || 0).toLocaleString();

    // Inventory - usar player_inventory
    const inventoryGrid = container.querySelector('#inventoryGrid');
    if (this.data.inventory.length > 0) {
      inventoryGrid.innerHTML = this.data.inventory.map(item => `
        <div class="inventory-item">
          <div class="item-icon">📦</div>
          <div class="item-info">
            <div class="item-name">Recurso #${item.resource_type_id?.substring(0, 8) || 'N/A'}</div>
            <div class="item-quantity">Quantidade: ${item.quantity || 0}</div>
          </div>
        </div>
      `).join('');
    } else {
      inventoryGrid.innerHTML = '<p class="empty-message">Inventário vazio - Comece a minerar!</p>';
    }

    // Recent Activity - placeholder
    const activityList = container.querySelector('#recentActivity');
    if (stats.sessions_count > 0) {
      activityList.innerHTML = `
        <div class="activity-item">
          <div class="activity-icon">🎮</div>
          <div class="activity-content">
            <div class="activity-title">Sessões de jogo</div>
            <div class="activity-description">Você jogou ${stats.sessions_count} ${stats.sessions_count === 1 ? 'vez' : 'vezes'}</div>
          </div>
        </div>
        ${stats.planets_discovered > 0 ? `
        <div class="activity-item">
          <div class="activity-icon">🌍</div>
          <div class="activity-content">
            <div class="activity-title">Exploração espacial</div>
            <div class="activity-description">Descobriu ${stats.planets_discovered} ${stats.planets_discovered === 1 ? 'planeta' : 'planetas'}</div>
          </div>
        </div>
        ` : ''}
        ${stats.battles_won > 0 ? `
        <div class="activity-item">
          <div class="activity-icon">⚔️</div>
          <div class="activity-content">
            <div class="activity-title">Combates vencidos</div>
            <div class="activity-description">Venceu ${stats.battles_won} ${stats.battles_won === 1 ? 'batalha' : 'batalhas'}</div>
          </div>
        </div>
        ` : ''}
      `;
    } else {
      activityList.innerHTML = '<p class="empty-message">Nenhuma atividade recente - Comece a jogar!</p>';
    }
  }

  /**
   * Mostrar loading
   */
  showLoading(container) {
    container.querySelector('#loadingState').style.display = 'flex';
    container.querySelector('#errorState').style.display = 'none';
    container.querySelector('#dataState').style.display = 'none';
  }

  /**
   * Mostrar erro (accessible)
   */
  showError(container, message) {
    container.querySelector('#loadingState').style.display = 'none';
    const errorState = container.querySelector('#errorState');
    errorState.style.display = 'flex';
    errorState.setAttribute('role', 'alert');
    errorState.setAttribute('aria-live', 'polite');
    
    const errorMessage = container.querySelector('#errorMessage');
    errorMessage.textContent = message;
    container.querySelector('#dataState').style.display = 'none';
    
    // Anunciar para screen readers
    const announcement = document.createElement('div');
    announcement.className = 'sr-only';
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = `Erro: ${message}`;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  /**
   * Esconder loading
   */
  hideLoading(container) {
    container.querySelector('#loadingState').style.display = 'none';
  }


  /**
   * Adicionar estilos
   */
  addStyles() {
    if (!document.querySelector('style[data-page="dashboard"]')) {
      const style = document.createElement('style');
      style.setAttribute('data-page', 'dashboard');
      style.textContent = `
        .dashboard-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        .dashboard-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          padding-top: 80px; /* Espaço para o header global */
        }


        .dashboard-content {
          flex: 1;
          padding: var(--spacing-lg, 1.5rem);
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }

        /* Profile & Ship Container */
        .profile-ship-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-lg, 1.5rem);
          margin-bottom: var(--spacing-xl, 2rem);
        }

        /* Ship Display Section */
        .ship-display-section {
          background: rgba(0, 255, 204, 0.05);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-lg, 1rem);
          padding: var(--spacing-lg, 1.5rem);
        }

        .ship-display-card {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md, 1rem);
          margin-top: var(--spacing-md, 1rem);
        }

        .ship-visual {
          display: flex;
          justify-content: center;
          align-items: center;
          background: #0a0a1a;
          border-radius: var(--border-radius-md, 0.5rem);
          padding: var(--spacing-md, 1rem);
          border: 2px solid rgba(0, 255, 204, 0.3);
        }

        #shipCanvas {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
          width: 256px;
          height: 128px;
        }

        .ship-info {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm, 0.5rem);
        }

        .ship-name {
          font-size: var(--text-lg, 1.25rem);
          font-weight: 700;
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          margin: 0;
          text-align: center;
        }

        .ship-rarity {
          font-size: var(--text-base, 1rem);
          font-weight: 600;
          text-align: center;
          padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius-sm, 0.25rem);
          display: inline-block;
          margin: 0 auto;
        }

        .ship-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-sm, 0.5rem);
          margin-top: var(--spacing-sm, 0.5rem);
        }

        .ship-stat {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs, 0.25rem);
          padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.15);
          border-radius: var(--border-radius-sm, 0.25rem);
          font-size: var(--text-sm, 0.875rem);
        }

        .ship-stat-icon {
          font-size: 1rem;
        }

        .ship-stat-label {
          color: var(--text-secondary, #b0b0b0);
          font-weight: 500;
        }

        .ship-stat-value {
          color: var(--primary-cyan, #00ffcc);
          font-weight: 700;
          margin-left: auto;
        }

        .loading-state,
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md, 1rem);
          min-height: 300px;
        }

        .spinner {
          font-size: 3rem;
          animation: spin 2s linear infinite;
        }

        .error-state {
          background: rgba(255, 107, 107, 0.08);
          border: 1px solid rgba(255, 107, 107, 0.2);
          border-radius: var(--border-radius-md, 0.5rem);
          padding: var(--spacing-lg, 1.5rem);
        }

        .error-icon {
          font-size: 2.5rem;
        }

        .error-message {
          color: #ff6b6b;
          text-align: center;
          font-family: var(--font-secondary, Arial);
        }

        .retry-btn {
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
          background: linear-gradient(135deg, var(--primary-cyan, #00ffcc), var(--secondary-blue, #0099ff));
          border: none;
          border-radius: var(--border-radius-md, 0.5rem);
          color: #000;
          cursor: pointer;
          font-family: var(--font-primary, Arial);
          font-weight: 600;
          transition: var(--transition-normal, 0.3s);
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(0, 255, 204, 0.3);
        }

        .profile-section {
          margin-bottom: var(--spacing-xl, 2rem);
        }

        .profile-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-md, 1rem);
          padding: var(--spacing-md, 1rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-md, 0.5rem);
        }

        .profile-avatar {
          font-size: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(0, 255, 204, 0.1);
          border: 2px solid rgba(0, 255, 204, 0.3);
        }

        .google-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .profile-username {
          font-size: 1.25rem;
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 700;
          margin: 0 0 0.25rem 0;
        }

        .profile-email {
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          font-size: 0.875rem;
          margin: 0;
        }


        .section-title {
          font-size: 1.25rem;
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 700;
          margin-bottom: var(--spacing-md, 1rem);
        }

        .stats-section {
          margin-bottom: var(--spacing-xl, 2rem);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--spacing-md, 1rem);
        }

        .stat-card {
          padding: var(--spacing-md, 1rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-md, 0.5rem);
          text-align: center;
          transition: var(--transition-normal, 0.3s);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xs, 0.25rem);
        }

        .stat-card:hover {
          background: rgba(0, 255, 204, 0.12);
          border-color: rgba(0, 255, 204, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(0, 255, 204, 0.2);
        }

        .stat-icon {
          font-size: 2rem;
          margin-bottom: var(--spacing-xs, 0.25rem);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
        }

        .stat-value {
          font-size: 1.75rem;
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 700;
        }

        /* Wallet Section */
        .wallet-section {
          margin-bottom: var(--spacing-xl, 2rem);
        }

        .wallet-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-md, 1rem);
        }

        .wallet-card {
          padding: var(--spacing-lg, 1.5rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-lg, 1rem);
          display: flex;
          align-items: center;
          gap: var(--spacing-md, 1rem);
          transition: var(--transition-normal, 0.3s);
        }

        .wallet-card:hover {
          background: rgba(0, 255, 204, 0.12);
          border-color: rgba(0, 255, 204, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(0, 255, 204, 0.2);
        }

        .wallet-card.space-tokens {
          border-color: rgba(255, 215, 0, 0.3);
          background: rgba(255, 215, 0, 0.05);
        }

        .wallet-card.space-tokens:hover {
          border-color: rgba(255, 215, 0, 0.5);
          background: rgba(255, 215, 0, 0.1);
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
        }

        .wallet-card.sol-tokens {
          border-color: rgba(138, 43, 226, 0.3);
          background: rgba(138, 43, 226, 0.05);
        }

        .wallet-card.sol-tokens:hover {
          border-color: rgba(138, 43, 226, 0.5);
          background: rgba(138, 43, 226, 0.1);
          box-shadow: 0 0 20px rgba(138, 43, 226, 0.2);
        }

        .wallet-card.total-earned {
          border-color: rgba(0, 255, 255, 0.3);
          background: rgba(0, 255, 255, 0.05);
        }

        .wallet-card.total-earned:hover {
          border-color: rgba(0, 255, 255, 0.5);
          background: rgba(0, 255, 255, 0.1);
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
        }

        .wallet-icon {
          font-size: 3rem;
          flex-shrink: 0;
        }

        .wallet-info {
          flex: 1;
        }

        .wallet-label {
          font-size: 0.875rem;
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          margin-bottom: var(--spacing-xs, 0.25rem);
        }

        .wallet-value {
          font-size: 2rem;
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 700;
          margin-bottom: var(--spacing-xs, 0.25rem);
        }

        .wallet-description {
          font-size: 0.75rem;
          color: var(--text-tertiary, #808080);
          font-family: var(--font-secondary, Arial);
        }

        /* Inventory Section */
        .inventory-section,
        .activity-section {
          margin-bottom: var(--spacing-xl, 2rem);
        }

        .inventory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--spacing-md, 1rem);
        }

        .inventory-item {
          padding: var(--spacing-md, 1rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-md, 0.5rem);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 0.5rem);
          transition: var(--transition-normal, 0.3s);
        }

        .inventory-item:hover {
          background: rgba(0, 255, 204, 0.12);
          border-color: rgba(0, 255, 204, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(0, 255, 204, 0.2);
        }

        .item-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .item-info {
          flex: 1;
        }

        .item-name {
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: var(--spacing-xs, 0.25rem);
        }

        .item-quantity {
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          font-size: 0.75rem;
        }

        /* Activity Section */
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm, 0.5rem);
        }

        .activity-item {
          padding: var(--spacing-md, 1rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-md, 0.5rem);
          display: flex;
          align-items: center;
          gap: var(--spacing-md, 1rem);
          transition: var(--transition-normal, 0.3s);
        }

        .activity-item:hover {
          background: rgba(0, 255, 204, 0.12);
          border-color: rgba(0, 255, 204, 0.4);
          transform: translateX(5px);
        }

        .activity-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 600;
          font-size: 1rem;
          margin-bottom: var(--spacing-xs, 0.25rem);
        }

        .activity-description {
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          font-size: 0.875rem;
        }

        .empty-message {
          color: var(--text-tertiary, #808080);
          text-align: center;
          padding: var(--spacing-lg, 1.5rem);
          grid-column: 1 / -1;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: var(--spacing-md, 1rem);
            align-items: flex-start;
          }

          .dashboard-content {
            padding: var(--spacing-md, 1rem);
          }

          .profile-ship-container {
            grid-template-columns: 1fr;
            gap: var(--spacing-md, 1rem);
          }

          #shipCanvas {
            width: 192px;
            height: 96px;
          }

          .ship-stats {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }

          .ships-grid,
          .inventory-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
}
