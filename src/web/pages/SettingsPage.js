/**
 * SettingsPage - User preferences and settings
 * All text in English US only (no i18n)
 */

import * as authService from '../../shared/services/authService.js';
import * as settingsService from '../../shared/services/settingsService.js';
import { navigateTo } from '../../shared/router.js';
import HeaderNavigation from '../components/HeaderNavigation.js';

export default class SettingsPage {
  constructor(supabaseClient) {
    this.name = 'SettingsPage';
    this.supabase = supabaseClient;
    this.settings = null;
    this.userId = null;
  }

  /**
   * Render settings page
   */
  render() {
    const container = document.createElement('div');
    container.className = 'settings-page';
    container.innerHTML = `
      <div class="background-primary"></div>
      <div class="stars-background"></div>

      <!-- Global Navigation Header -->
      <div id="globalHeader"></div>

      <div class="settings-wrapper">
        <!-- Content -->
        <div class="settings-content">
          <!-- Loading State -->
          <div id="loadingState" class="loading-state">
            <div class="spinner">⏳</div>
            <p>Loading settings...</p>
          </div>

          <!-- Error State -->
          <div id="errorState" class="error-state" role="alert" aria-live="polite" style="display: none;">
            <div class="error-icon" role="img" aria-label="Error">❌</div>
            <p class="error-message" id="errorMessage"></p>
            <button id="retryBtn" class="retry-btn" aria-label="Try loading settings again">
              <span role="img" aria-label="Reload">🔄</span> Try Again
            </button>
          </div>

          <!-- Data State -->
          <div id="dataState" class="data-state" style="display: none;">
            <!-- Header -->
            <header class="settings-header">
              <h1 class="settings-title">
                <span role="img" aria-label="Settings">⚙️</span> Settings
              </h1>
              <p class="settings-subtitle">Manage your preferences</p>
            </header>

            <!-- Success Message -->
            <div id="successMessage" class="success-message" role="status" aria-live="polite" style="display: none;">
              <span role="img" aria-label="Success">✅</span> Setting saved!
            </div>

            <!-- Settings Form -->
            <div class="settings-form">
              <!-- Notifications Setting -->
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-icon">🔔</div>
                  <div class="setting-details">
                    <h3 class="setting-title">Notifications</h3>
                    <p class="setting-description">Receive game notifications and updates</p>
                  </div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" id="notificationsToggle" aria-label="Enable notifications">
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <!-- Sound Setting -->
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-icon">🔊</div>
                  <div class="setting-details">
                    <h3 class="setting-title">Sound Effects</h3>
                    <p class="setting-description">Enable in-game sound effects and music</p>
                  </div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" id="soundToggle" aria-label="Enable sound">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <!-- App Info -->
            <div class="app-info">
              <div class="info-item">
                <span class="info-label">App Version:</span>
                <span class="info-value">1.0.0</span>
              </div>
              <div class="info-item">
                <span class="info-copyright">© 2025 Space Crypto Miner</span>
              </div>
            </div>

            <!-- Back Button -->
            <div class="settings-actions">
              <button id="backBtn" class="back-btn" aria-label="Back to dashboard">
                <span role="img" aria-label="Back">←</span> Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add styles
    this.addStyles();

    // Render header
    this.renderGlobalHeader(container);

    // Load settings
    this.loadSettings(container);

    // Setup event listeners
    this.setupEventListeners(container);

    return container;
  }

  /**
   * Render global header
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
   * Load user settings
   */
  async loadSettings(container) {
    this.showLoading(container);

    try {
      // Get session
      const session = await authService.getSession();
      if (!session) {
        this.showError(container, 'Session expired. Please login again.');
        setTimeout(() => navigateTo('/login'), 1500);
        return;
      }

      this.userId = session.user.email; // Use email instead of id
      console.log('⚙️ Loading settings for user:', this.userId);

      // Load settings
      this.settings = await settingsService.getUserSettings(this.supabase, this.userId);
      console.log('✅ Settings loaded:', this.settings);

      this.hideLoading(container);
      this.renderSettings(container);

    } catch (error) {
      console.error('❌ Error loading settings:', error);
      this.showError(container, error.message);
    }
  }

  /**
   * Render settings values
   */
  renderSettings(container) {
    const dataState = container.querySelector('#dataState');
    dataState.style.display = 'block';

    // Set toggle states
    const notificationsToggle = container.querySelector('#notificationsToggle');
    const soundToggle = container.querySelector('#soundToggle');

    notificationsToggle.checked = this.settings.notifications_enabled !== false;
    soundToggle.checked = this.settings.sound_enabled !== false;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners(container) {
    // Retry button
    const retryBtn = container.querySelector('#retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.loadSettings(container);
      });
    }

    // Back button
    const backBtn = container.querySelector('#backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        navigateTo('/dashboard');
      });
    }

    // Notifications toggle
    const notificationsToggle = container.querySelector('#notificationsToggle');
    if (notificationsToggle) {
      notificationsToggle.addEventListener('change', async (e) => {
        await this.handleNotificationsToggle(container, e.target.checked);
      });
    }

    // Sound toggle
    const soundToggle = container.querySelector('#soundToggle');
    if (soundToggle) {
      soundToggle.addEventListener('change', async (e) => {
        await this.handleSoundToggle(container, e.target.checked);
      });
    }
  }

  /**
   * Handle notifications toggle
   */
  async handleNotificationsToggle(container, enabled) {
    try {
      console.log('🔔 Updating notifications:', enabled);
      
      await settingsService.updateNotifications(this.supabase, this.userId, enabled);
      this.settings.notifications_enabled = enabled;
      
      this.showSuccess(container);
      console.log('✅ Notifications updated');
    } catch (error) {
      console.error('❌ Error updating notifications:', error);
      
      // Revert toggle
      const toggle = container.querySelector('#notificationsToggle');
      toggle.checked = !enabled;
      
      this.showError(container, 'Failed to save setting. Please try again.');
    }
  }

  /**
   * Handle sound toggle
   */
  async handleSoundToggle(container, enabled) {
    try {
      console.log('🔊 Updating sound:', enabled);
      
      await settingsService.updateSound(this.supabase, this.userId, enabled);
      this.settings.sound_enabled = enabled;
      
      this.showSuccess(container);
      console.log('✅ Sound updated');
    } catch (error) {
      console.error('❌ Error updating sound:', error);
      
      // Revert toggle
      const toggle = container.querySelector('#soundToggle');
      toggle.checked = !enabled;
      
      this.showError(container, 'Failed to save setting. Please try again.');
    }
  }

  /**
   * Show success message
   */
  showSuccess(container) {
    const successMessage = container.querySelector('#successMessage');
    successMessage.style.display = 'flex';
    
    // Hide after 3 seconds
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);
  }

  /**
   * Show loading
   */
  showLoading(container) {
    container.querySelector('#loadingState').style.display = 'flex';
    container.querySelector('#errorState').style.display = 'none';
    container.querySelector('#dataState').style.display = 'none';
  }

  /**
   * Show error
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
  }

  /**
   * Hide loading
   */
  hideLoading(container) {
    container.querySelector('#loadingState').style.display = 'none';
  }

  /**
   * Add styles
   */
  addStyles() {
    if (!document.querySelector('style[data-page="settings"]')) {
      const style = document.createElement('style');
      style.setAttribute('data-page', 'settings');
      style.textContent = `
        .settings-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        .settings-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          padding-top: 80px;
        }

        .settings-content {
          flex: 1;
          padding: var(--spacing-lg, 1.5rem);
          max-width: 800px;
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

        /* Header */
        .settings-header {
          margin-bottom: var(--spacing-xl, 2rem);
          text-align: center;
        }

        .settings-title {
          font-size: clamp(2rem, 5vw, 3rem);
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 700;
          margin: 0 0 var(--spacing-sm, 0.5rem) 0;
          text-shadow: 0 0 20px rgba(0, 255, 204, 0.3);
        }

        .settings-subtitle {
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          font-size: var(--text-base, 1rem);
          margin: 0;
        }

        /* Success Message */
        .success-message {
          display: none;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm, 0.5rem);
          padding: var(--spacing-md, 1rem);
          background: rgba(0, 255, 204, 0.1);
          border: 1px solid rgba(0, 255, 204, 0.3);
          border-radius: var(--border-radius-md, 0.5rem);
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-secondary, Arial);
          font-weight: 600;
          margin-bottom: var(--spacing-lg, 1.5rem);
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Settings Form */
        .settings-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md, 1rem);
          margin-bottom: var(--spacing-xl, 2rem);
        }

        .setting-item {
          padding: var(--spacing-lg, 1.5rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-lg, 1rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-md, 1rem);
          transition: var(--transition-normal, 0.3s);
        }

        .setting-item:hover {
          background: rgba(0, 255, 204, 0.12);
          border-color: rgba(0, 255, 204, 0.4);
          transform: translateX(5px);
        }

        .setting-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-md, 1rem);
          flex: 1;
        }

        .setting-icon {
          font-size: 2.5rem;
          flex-shrink: 0;
        }

        .setting-details {
          flex: 1;
        }

        .setting-title {
          font-size: var(--text-lg, 1.25rem);
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 700;
          margin: 0 0 var(--spacing-xs, 0.25rem) 0;
        }

        .setting-description {
          font-size: var(--text-sm, 0.875rem);
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          margin: 0;
        }

        /* Toggle Switch */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
          flex-shrink: 0;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: 0.4s;
          border-radius: 34px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: var(--primary-cyan, #00ffcc);
          border-color: var(--primary-cyan, #00ffcc);
          box-shadow: 0 0 10px rgba(0, 255, 204, 0.5);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        input:focus + .toggle-slider {
          box-shadow: 0 0 1px var(--primary-cyan, #00ffcc);
        }

        /* App Info */
        .app-info {
          padding: var(--spacing-lg, 1.5rem);
          background: rgba(0, 255, 204, 0.05);
          border: 1px solid rgba(0, 255, 204, 0.1);
          border-radius: var(--border-radius-md, 0.5rem);
          text-align: center;
          margin-bottom: var(--spacing-lg, 1.5rem);
        }

        .info-item {
          margin-bottom: var(--spacing-sm, 0.5rem);
        }

        .info-item:last-child {
          margin-bottom: 0;
        }

        .info-label {
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          font-size: var(--text-sm, 0.875rem);
          margin-right: var(--spacing-xs, 0.25rem);
        }

        .info-value {
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 600;
          font-size: var(--text-sm, 0.875rem);
        }

        .info-copyright {
          color: var(--text-tertiary, #808080);
          font-family: var(--font-secondary, Arial);
          font-size: var(--text-xs, 0.75rem);
        }

        /* Actions */
        .settings-actions {
          display: flex;
          justify-content: center;
        }

        .back-btn {
          padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
          background: rgba(0, 255, 204, 0.1);
          border: 1px solid rgba(0, 255, 204, 0.3);
          border-radius: var(--border-radius-md, 0.5rem);
          color: var(--primary-cyan, #00ffcc);
          cursor: pointer;
          font-family: var(--font-secondary, Arial);
          font-weight: 600;
          font-size: var(--text-base, 1rem);
          transition: var(--transition-normal, 0.3s);
        }

        .back-btn:hover {
          background: rgba(0, 255, 204, 0.2);
          border-color: rgba(0, 255, 204, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(0, 255, 204, 0.2);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .settings-content {
            padding: var(--spacing-md, 1rem);
          }

          .setting-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .setting-info {
            width: 100%;
          }

          .toggle-switch {
            align-self: flex-end;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
}

