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
            <h1 class="dashboard-title">🎮 Dashboard</h1>
          </div>
          <div class="header-right">
            <button id="logoutBtn" class="logout-btn" title="Fazer logout">
              🚪 Logout
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
          <div id="errorState" class="error-state" style="display: none;">
            <div class="error-icon">❌</div>
            <p class="error-message" id="errorMessage"></p>
            <button id="retryBtn" class="retry-btn">🔄 Tentar Novamente</button>
          </div>

          <!-- Data State -->
          <div id="dataState" class="data-state" style="display: none;">
            <!-- User Profile -->
            <section class="profile-section">
              <div class="profile-card">
                <div class="profile-avatar">👤</div>
                <div class="profile-info">
                  <h2 id="username" class="profile-username"></h2>
                  <p id="userId" class="profile-id"></p>
                </div>
              </div>
            </section>

            <!-- Stats Grid -->
            <section class="stats-section">
              <h3 class="section-title">📊 Estatísticas</h3>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-label">Nível</div>
                  <div class="stat-value" id="level">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">XP</div>
                  <div class="stat-value" id="xp">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Moedas</div>
                  <div class="stat-value" id="coins">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Vitórias</div>
                  <div class="stat-value" id="wins">0</div>
                </div>
              </div>
            </section>

            <!-- Ships Section -->
            <section class="ships-section">
              <h3 class="section-title">🚀 Naves</h3>
              <div id="shipsGrid" class="ships-grid">
                <p class="empty-message">Nenhuma nave encontrada</p>
              </div>
            </section>

            <!-- Inventory Section -->
            <section class="inventory-section">
              <h3 class="section-title">🎒 Inventário</h3>
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

      const userId = session.user.id;
      console.log('📊 Carregando dados para usuário:', userId);

      // Buscar profile
      const profile = await this.fetchProfile(userId);
      this.data.profile = profile;

      // Buscar game data
      const gameData = await this.fetchGameData(userId);
      this.data.gameData = gameData || { level: 0, experience: 0, coins: 0, win_count: 0 };

      // Buscar inventory
      const inventory = await this.fetchInventory(userId);
      this.data.inventory = inventory || [];

      // Buscar ships
      const ships = await this.fetchShips(userId);
      this.data.ships = ships || [];

      console.log('✅ Dados carregados:', this.data);

      this.hideLoading(container);
      this.renderData(container);

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      this.showError(container, error.message);
    }
  }

  /**
   * Buscar profile do Supabase
   */
  async fetchProfile(userId) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw new Error('Erro ao carregar perfil: ' + error.message);
    }

    return data || { user_id: userId, username: 'Usuário', id: userId };
  }

  /**
   * Buscar game data do Supabase
   */
  async fetchGameData(userId) {
    const { data, error } = await this.supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Aviso ao carregar game data:', error.message);
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

    // Profile
    if (this.data.profile) {
      container.querySelector('#username').textContent = this.data.profile.username || 'Usuário';
      container.querySelector('#userId').textContent = `ID: ${this.data.profile.user_id || this.data.profile.id}`;
    }

    // Stats - Usar valores padrão se tabela vazia
    const gameData = this.data.gameData || {};
    container.querySelector('#level').textContent = gameData.current_level || gameData.level || 0;
    container.querySelector('#xp').textContent = gameData.experience || gameData.total_xp || 0;
    container.querySelector('#coins').textContent = gameData.coins || gameData.balance || 0;
    container.querySelector('#wins').textContent = gameData.wins || gameData.win_count || 0;

    // Ships/Wallet
    const shipsGrid = container.querySelector('#shipsGrid');
    if (this.data.ships.length > 0) {
      shipsGrid.innerHTML = this.data.ships.map(ship => `
        <div class="ship-card">
          <div class="ship-name">${ship.wallet_address || ship.name || 'Wallet'}</div>
          <div class="ship-rarity">${ship.balance || ship.rarity || 'N/A'}</div>
        </div>
      `).join('');
    } else {
      shipsGrid.innerHTML = '<p class="empty-message">Nenhuma carteira encontrada</p>';
    }

    // Inventory
    const inventoryGrid = container.querySelector('#inventoryGrid');
    if (this.data.inventory.length > 0) {
      inventoryGrid.innerHTML = this.data.inventory.map(item => `
        <div class="inventory-item">
          <div class="item-id">${item.item_name || item.item_id || 'Item'}</div>
          <div class="item-qty">x${item.quantity || 1}</div>
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
   * Mostrar erro
   */
  showError(container, message) {
    container.querySelector('#loadingState').style.display = 'none';
    container.querySelector('#errorState').style.display = 'flex';
    container.querySelector('#errorMessage').textContent = message;
    container.querySelector('#dataState').style.display = 'none';
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
        }

        .profile-username {
          font-size: 1.25rem;
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 700;
          margin: 0 0 0.25rem 0;
        }

        .profile-id {
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
