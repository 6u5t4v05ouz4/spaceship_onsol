/**
 * DashboardPage - Dashboard do usuário logado
 * Exibe estatísticas, naves, inventory e achievements
 */

import * as authService from '../../shared/services/authService.js';
import { navigateTo } from '../../shared/router.js';

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
      
      <div class="dashboard-wrapper">
        <!-- Header -->
        <header class="dashboard-header">
          <div class="header-left">
            <h1 class="dashboard-title">
              <span role="img" aria-label="Controle de jogo">🎮</span> Dashboard
            </h1>
          </div>
          <div class="header-right">
            <button id="logoutBtn" class="logout-btn" aria-label="Fazer logout da conta">
              <span role="img" aria-label="Porta">🚪</span> Logout
            </button>
          </div>
        </header>

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

            <!-- Navigation Menu -->
            <section class="navigation-section">
              <h3 class="section-title">
                <span role="img" aria-label="Navegação">🧭</span> Navegação
              </h3>
              <div class="navigation-grid">
                <button id="profileBtn" class="nav-btn" aria-label="Ir para perfil">
                  <span class="nav-icon">👤</span>
                  <span class="nav-text">Perfil</span>
                </button>
                <button id="configBtn" class="nav-btn" aria-label="Ir para configurações">
                  <span class="nav-icon">⚙️</span>
                  <span class="nav-text">Config</span>
                </button>
                <button id="missionsBtn" class="nav-btn" aria-label="Ir para missões">
                  <span class="nav-icon">🎯</span>
                  <span class="nav-text">Missões</span>
                </button>
                <button id="marketplaceBtn" class="nav-btn" aria-label="Ir para marketplace">
                  <span class="nav-icon">🛒</span>
                  <span class="nav-text">Marketplace</span>
                </button>
              </div>
            </section>

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

    // Carregar dados
    this.loadData(container);

    // Event listeners
    container.querySelector('#logoutBtn').addEventListener('click', () => {
      this.handleLogout();
    });

    const retryBtn = container.querySelector('#retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.loadData(container);
      });
    }

    // Navigation buttons
    const profileBtn = container.querySelector('#profileBtn');
    const configBtn = container.querySelector('#configBtn');
    const missionsBtn = container.querySelector('#missionsBtn');
    const marketplaceBtn = container.querySelector('#marketplaceBtn');

    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        navigateTo('/profile');
      });
    }

    if (configBtn) {
      configBtn.addEventListener('click', () => {
        navigateTo('/config');
      });
    }

    if (missionsBtn) {
      missionsBtn.addEventListener('click', () => {
        navigateTo('/missions');
      });
    }

    if (marketplaceBtn) {
      marketplaceBtn.addEventListener('click', () => {
        navigateTo('/marketplace');
      });
    }

    return container;
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
   * Handle logout
   */
  async handleLogout() {
    try {
      await authService.signOut();
      navigateTo('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      navigateTo('/login');
    }
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
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg, 1.5rem);
          background: rgba(0, 255, 204, 0.05);
          border-bottom: 1px solid rgba(0, 255, 204, 0.1);
        }

        .dashboard-title {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 700;
          margin: 0;
          text-shadow: 0 0 15px rgba(0, 255, 204, 0.2);
        }

        .logout-btn {
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
          background: rgba(255, 107, 107, 0.2);
          border: 1px solid rgba(255, 107, 107, 0.4);
          border-radius: var(--border-radius-md, 0.5rem);
          color: #ff6b6b;
          cursor: pointer;
          font-family: var(--font-primary, Arial);
          font-weight: 600;
          transition: var(--transition-normal, 0.3s);
        }

        .logout-btn:hover {
          background: rgba(255, 107, 107, 0.3);
          box-shadow: 0 0 15px rgba(255, 107, 107, 0.2);
        }

        .dashboard-content {
          flex: 1;
          padding: var(--spacing-lg, 1.5rem);
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
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

        .navigation-section {
          margin-bottom: var(--spacing-xl, 2rem);
        }

        .navigation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: var(--spacing-md, 1rem);
        }

        .nav-btn {
          padding: var(--spacing-md, 1rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-md, 0.5rem);
          color: var(--text-primary, #ffffff);
          cursor: pointer;
          font-family: var(--font-secondary, Arial);
          font-size: var(--text-sm, 0.875rem);
          font-weight: 600;
          transition: var(--transition-normal, 0.3s);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xs, 0.25rem);
          min-height: 80px;
        }

        .nav-btn:hover {
          background: rgba(0, 255, 204, 0.15);
          border-color: rgba(0, 255, 204, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(0, 255, 204, 0.2);
        }

        .nav-btn:focus-visible {
          outline: 2px solid var(--primary-cyan, #00ffcc);
          outline-offset: 2px;
        }

        .nav-icon {
          font-size: 1.5rem;
          margin-bottom: var(--spacing-xs, 0.25rem);
        }

        .nav-text {
          text-align: center;
          line-height: 1.2;
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
