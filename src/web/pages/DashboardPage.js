/**
 * DashboardPage - Dashboard do usuário logado
 * Exibe estatísticas, naves, inventory e achievements
 */

import * as authService from '../../shared/services/authService.js';
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
                <span role="img" aria-label="Estatísticas">📊</span> Estatísticas
              </h3>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-label">Nível</div>
                  <div class="stat-value" id="level" aria-label="Nível do jogador">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">XP</div>
                  <div class="stat-value" id="xp" aria-label="Pontos de experiência">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Moedas</div>
                  <div class="stat-value" id="coins" aria-label="Total de moedas">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Vitórias</div>
                  <div class="stat-value" id="wins" aria-label="Total de vitórias">0</div>
                </div>
              </div>
            </section>

            <!-- Ships Section -->
            <section class="ships-section">
              <h3 class="section-title">
                <span role="img" aria-label="Naves">🚀</span> Naves
              </h3>
              <div id="shipsGrid" class="ships-grid">
                <p class="empty-message">Nenhuma nave encontrada</p>
              </div>
            </section>

            <!-- Inventory Section -->
            <section class="inventory-section">
              <h3 class="section-title">
                <span role="img" aria-label="Inventário">🎒</span> Inventário
              </h3>
              <div id="inventoryGrid" class="inventory-grid">
                <p class="empty-message">Inventário vazio</p>
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

    // Stats - usar player_stats e player_wallet
    const stats = this.data.gameData || {};
    const wallet = this.data.ships.length > 0 ? this.data.ships[0] : null;
    
    container.querySelector('#level').textContent = stats.sessions_count || 0; // Usar sessions como "level"
    container.querySelector('#xp').textContent = stats.total_tokens_earned || 0; // Tokens ganhos como "XP"
    container.querySelector('#coins').textContent = wallet ? wallet.space_tokens || 0 : 0; // Space tokens
    container.querySelector('#wins').textContent = stats.battles_won || 0; // Batalhas ganhas

    // Wallet - usar campos reais: space_tokens, sol_tokens
    const shipsGrid = container.querySelector('#shipsGrid');
    if (this.data.ships.length > 0) {
      // player_wallet tem space_tokens e sol_tokens
      const wallet = this.data.ships[0]; // só há 1 wallet por user
      shipsGrid.innerHTML = `
        <div class="ship-card">
          <div class="ship-name">💰 Space Tokens</div>
          <div class="ship-rarity">${wallet.space_tokens || 0}</div>
        </div>
        <div class="ship-card">
          <div class="ship-name">◎ SOL Tokens</div>
          <div class="ship-rarity">${wallet.sol_tokens || 0}</div>
        </div>
      `;
    } else {
      shipsGrid.innerHTML = '<p class="empty-message">Carteira não encontrada</p>';
    }

    // Inventory - usar campos reais: resource_type_id, quantity
    const inventoryGrid = container.querySelector('#inventoryGrid');
    if (this.data.inventory.length > 0) {
      inventoryGrid.innerHTML = this.data.inventory.map(item => `
        <div class="inventory-item">
          <div class="item-id">Resource ${item.resource_type_id?.substring(0, 8) || 'N/A'}</div>
          <div class="item-qty">x${item.quantity || 0}</div>
        </div>
      `).join('');
    } else {
      inventoryGrid.innerHTML = '<p class="empty-message">Inventário vazio</p>';
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
        }

        .stat-card:hover {
          background: rgba(0, 255, 204, 0.12);
          border-color: rgba(0, 255, 204, 0.4);
          transform: translateY(-2px);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 1.75rem;
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 700;
        }

        .ships-section,
        .inventory-section {
          margin-bottom: var(--spacing-xl, 2rem);
        }

        .ships-grid,
        .inventory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: var(--spacing-md, 1rem);
        }

        .ship-card,
        .inventory-item {
          padding: var(--spacing-md, 1rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-md, 0.5rem);
          text-align: center;
          transition: var(--transition-normal, 0.3s);
        }

        .ship-card:hover,
        .inventory-item:hover {
          background: rgba(0, 255, 204, 0.12);
          transform: translateY(-2px);
        }

        .ship-name,
        .item-id {
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .ship-rarity,
        .item-qty {
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
