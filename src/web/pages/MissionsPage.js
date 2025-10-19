/**
 * MissionsPage - Display available missions
 */

import * as authService from '../../shared/services/authService.js';
import * as missionsService from '../../shared/services/missionsService.js';
import { navigateTo } from '../../shared/router.js';
import HeaderNavigation from '../components/HeaderNavigation.js';

export default class MissionsPage {
  constructor(supabaseClient) {
    this.name = 'MissionsPage';
    this.supabase = supabaseClient;
    this.missions = [];
    this.filter = 'all';
    this.userId = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'missions-page';
    container.innerHTML = `
      <div class="background-primary"></div>
      <div class="stars-background"></div>

      <!-- Global Navigation Header -->
      <div id="globalHeader"></div>

      <div class="missions-wrapper">
        <div class="missions-content">
          <!-- Loading State -->
          <div id="loadingState" class="loading-state">
            <div class="spinner">⏳</div>
            <p>Loading missions...</p>
          </div>

          <!-- Error State -->
          <div id="errorState" class="error-state" role="alert" style="display: none;">
            <div class="error-icon">❌</div>
            <p class="error-message" id="errorMessage"></p>
            <button id="retryBtn" class="retry-btn">🔄 Try Again</button>
          </div>

          <!-- Data State -->
          <div id="dataState" class="data-state" style="display: none;">
            <!-- Header -->
            <header class="missions-header">
              <h1 class="missions-title">🎯 Missions</h1>
              <p class="missions-subtitle">Complete missions to earn rewards</p>
            </header>

            <!-- Filters -->
            <div class="missions-filters">
              <button class="filter-btn active" data-filter="all">All</button>
              <button class="filter-btn" data-filter="not_started">Not Started</button>
              <button class="filter-btn" data-filter="in_progress">In Progress</button>
              <button class="filter-btn" data-filter="completed">Completed</button>
            </div>

            <!-- Missions Grid -->
            <div id="missionsGrid" class="missions-grid">
              <!-- Missions will be rendered here -->
            </div>
          </div>
        </div>
      </div>
    `;

    this.addStyles();
    this.renderGlobalHeader(container);
    this.loadMissions(container);
    this.setupEventListeners(container);

    return container;
  }

  renderGlobalHeader(container) {
    const headerContainer = container.querySelector('#globalHeader');
    if (headerContainer) {
      const headerNav = new HeaderNavigation();
      headerContainer.appendChild(headerNav.render());
    }
  }

  async loadMissions(container) {
    this.showLoading(container);

    try {
      const session = await authService.getSession();
      if (!session) {
        this.showError(container, 'Session expired. Please login again.');
        setTimeout(() => navigateTo('/login'), 1500);
        return;
      }

      // Get user profile ID
      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('id')
        .eq('google_email', session.user.email)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      this.userId = profile.id;
      this.missions = await missionsService.getMissions(this.supabase, this.userId, this.filter);

      this.hideLoading(container);
      this.renderMissions(container);
    } catch (error) {
      console.error('❌ Error loading missions:', error);
      this.showError(container, error.message);
    }
  }

  renderMissions(container) {
    const dataState = container.querySelector('#dataState');
    dataState.style.display = 'block';

    const grid = container.querySelector('#missionsGrid');
    
    if (this.missions.length === 0) {
      grid.innerHTML = '<p class="empty-message">No missions found for this filter.</p>';
      return;
    }

    grid.innerHTML = this.missions.map(mission => this.renderMissionCard(mission)).join('');
  }

  renderMissionCard(mission) {
    const statusIcons = {
      'not_started': '⬜',
      'in_progress': '⏳',
      'completed': '✅'
    };

    const difficultyColors = {
      'easy': '#4ade80',
      'medium': '#fbbf24',
      'hard': '#f87171'
    };

    const statusLabels = {
      'not_started': 'Not Started',
      'in_progress': 'In Progress',
      'completed': 'Completed'
    };

    return `
      <div class="mission-card ${mission.status}" data-mission-id="${mission.id}">
        <div class="mission-icon">${mission.icon}</div>
        <div class="mission-info">
          <h3 class="mission-title">${mission.title}</h3>
          <p class="mission-description">${mission.description}</p>
          <div class="mission-objective">
            <span class="objective-label">Objective:</span>
            <span class="objective-text">${mission.objective}</span>
          </div>
          <div class="mission-rewards">
            <span class="reward">🪙 ${mission.reward_coins} coins</span>
            <span class="reward">⭐ ${mission.reward_exp} exp</span>
          </div>
          <div class="mission-meta">
            <span class="difficulty" style="color: ${difficultyColors[mission.difficulty]}">
              ${mission.difficulty.toUpperCase()}
            </span>
            <span class="status-badge">
              ${statusIcons[mission.status]} ${statusLabels[mission.status]}
            </span>
          </div>
          ${mission.status === 'in_progress' ? `
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${mission.progress}%"></div>
              <span class="progress-text">${mission.progress}%</span>
            </div>
          ` : ''}
        </div>
        <div class="mission-actions">
          ${mission.status === 'not_started' ? `
            <button class="btn-start" data-mission-id="${mission.id}">Start Mission</button>
          ` : mission.status === 'in_progress' ? `
            <button class="btn-continue" data-mission-id="${mission.id}">Continue</button>
          ` : `
            <button class="btn-completed" disabled>Completed</button>
          `}
        </div>
      </div>
    `;
  }

  setupEventListeners(container) {
    // Retry button
    const retryBtn = container.querySelector('#retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.loadMissions(container));
    }

    // Filter buttons
    container.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const newFilter = e.target.dataset.filter;
        if (newFilter === this.filter) return;

        // Update active state
        container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Update filter and reload
        this.filter = newFilter;
        this.missions = await missionsService.getMissions(this.supabase, this.userId, this.filter);
        this.renderMissions(container);
        this.setupMissionActions(container);
      });
    });

    this.setupMissionActions(container);
  }

  setupMissionActions(container) {
    // Start mission buttons
    container.querySelectorAll('.btn-start, .btn-continue').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const missionId = e.target.dataset.missionId;
        try {
          await missionsService.startMission(this.supabase, this.userId, missionId);
          // TODO: Navigate to game
          alert('Mission started! (Game integration coming soon)');
          this.loadMissions(container);
        } catch (error) {
          console.error('❌ Error starting mission:', error);
          alert('Failed to start mission: ' + error.message);
        }
      });
    });
  }

  showLoading(container) {
    container.querySelector('#loadingState').style.display = 'flex';
    container.querySelector('#errorState').style.display = 'none';
    container.querySelector('#dataState').style.display = 'none';
  }

  showError(container, message) {
    container.querySelector('#loadingState').style.display = 'none';
    container.querySelector('#errorState').style.display = 'flex';
    container.querySelector('#errorMessage').textContent = message;
    container.querySelector('#dataState').style.display = 'none';
  }

  hideLoading(container) {
    container.querySelector('#loadingState').style.display = 'none';
  }

  addStyles() {
    if (!document.querySelector('style[data-page="missions"]')) {
      const style = document.createElement('style');
      style.setAttribute('data-page', 'missions');
      style.textContent = `
        .missions-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .missions-wrapper {
          position: relative;
          z-index: 10;
          padding-top: 80px;
          min-height: 100vh;
        }

        .missions-content {
          padding: var(--spacing-lg, 1.5rem);
          max-width: 1200px;
          margin: 0 auto;
        }

        .loading-state, .error-state {
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

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .missions-header {
          text-align: center;
          margin-bottom: var(--spacing-xl, 2rem);
        }

        .missions-title {
          font-size: clamp(2rem, 5vw, 3rem);
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          margin: 0 0 var(--spacing-sm, 0.5rem) 0;
        }

        .missions-subtitle {
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          margin: 0;
        }

        .missions-filters {
          display: flex;
          gap: var(--spacing-sm, 0.5rem);
          margin-bottom: var(--spacing-lg, 1.5rem);
          flex-wrap: wrap;
          justify-content: center;
        }

        .filter-btn {
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
          background: rgba(0, 255, 204, 0.1);
          border: 1px solid rgba(0, 255, 204, 0.3);
          border-radius: var(--border-radius-md, 0.5rem);
          color: var(--primary-cyan, #00ffcc);
          cursor: pointer;
          font-family: var(--font-secondary, Arial);
          transition: var(--transition-normal, 0.3s);
        }

        .filter-btn:hover {
          background: rgba(0, 255, 204, 0.2);
          border-color: rgba(0, 255, 204, 0.5);
        }

        .filter-btn.active {
          background: var(--primary-cyan, #00ffcc);
          color: #000;
          font-weight: 600;
        }

        .missions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: var(--spacing-lg, 1.5rem);
        }

        .mission-card {
          padding: var(--spacing-lg, 1.5rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-lg, 1rem);
          transition: var(--transition-normal, 0.3s);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md, 1rem);
        }

        .mission-card:hover {
          background: rgba(0, 255, 204, 0.12);
          border-color: rgba(0, 255, 204, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 255, 204, 0.2);
        }

        .mission-icon {
          font-size: 3rem;
          text-align: center;
        }

        .mission-title {
          font-size: var(--text-xl, 1.5rem);
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          margin: 0 0 var(--spacing-sm, 0.5rem) 0;
        }

        .mission-description {
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          font-size: var(--text-sm, 0.875rem);
          margin: 0 0 var(--spacing-md, 1rem) 0;
        }

        .mission-objective {
          padding: var(--spacing-sm, 0.5rem);
          background: rgba(0, 255, 204, 0.05);
          border-left: 3px solid var(--primary-cyan, #00ffcc);
          margin-bottom: var(--spacing-sm, 0.5rem);
        }

        .objective-label {
          color: var(--primary-cyan, #00ffcc);
          font-weight: 600;
          font-size: var(--text-sm, 0.875rem);
        }

        .objective-text {
          color: var(--text-primary, #fff);
          font-size: var(--text-sm, 0.875rem);
          margin-left: var(--spacing-xs, 0.25rem);
        }

        .mission-rewards {
          display: flex;
          gap: var(--spacing-md, 1rem);
          margin-bottom: var(--spacing-sm, 0.5rem);
        }

        .reward {
          color: var(--text-primary, #fff);
          font-family: var(--font-secondary, Arial);
          font-size: var(--text-sm, 0.875rem);
        }

        .mission-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .difficulty {
          font-weight: 600;
          font-size: var(--text-xs, 0.75rem);
        }

        .status-badge {
          font-size: var(--text-sm, 0.875rem);
          color: var(--text-secondary, #b0b0b0);
        }

        .progress-bar {
          position: relative;
          width: 100%;
          height: 24px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: var(--border-radius-md, 0.5rem);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-cyan, #00ffcc), var(--secondary-blue, #0099ff));
          transition: width 0.3s ease;
        }

        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #fff;
          font-weight: 600;
          font-size: var(--text-sm, 0.875rem);
        }

        .mission-actions {
          margin-top: auto;
        }

        .mission-actions button {
          width: 100%;
          padding: var(--spacing-md, 1rem);
          border: none;
          border-radius: var(--border-radius-md, 0.5rem);
          font-family: var(--font-primary, Arial);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-normal, 0.3s);
        }

        .btn-start, .btn-continue {
          background: linear-gradient(135deg, var(--primary-cyan, #00ffcc), var(--secondary-blue, #0099ff));
          color: #000;
        }

        .btn-start:hover, .btn-continue:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 255, 204, 0.3);
        }

        .btn-completed {
          background: rgba(0, 255, 204, 0.2);
          color: var(--primary-cyan, #00ffcc);
          cursor: not-allowed;
        }

        .empty-message {
          text-align: center;
          color: var(--text-secondary, #b0b0b0);
          padding: var(--spacing-xl, 2rem);
        }

        @media (max-width: 768px) {
          .missions-grid {
            grid-template-columns: 1fr;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
}

