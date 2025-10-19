/**
 * HeaderNavigation - Componente de navegação global
 * Aparece em todas as páginas para navegação consistente
 */

import * as authService from '../../shared/services/authService.js';
import { navigateTo } from '../../shared/router.js';
import ServerStatus from './ServerStatus.js';
import socketService from '../../services/socketService.js';

export default class HeaderNavigation {
  constructor() {
    this.currentPage = '';
    this.serverStatusComponent = null;
    this.dropdownOpen = false;
  }

  /**
   * Renderiza o header de navegação
   */
  render() {
    const container = document.createElement('header');
    container.className = 'global-header';
    container.innerHTML = `
      <!-- Logo/Brand -->
      <div class="header-brand">
        <a href="/" class="brand-link" title="Voltar para home">
          <span class="brand-icon">🚀</span>
          <span class="brand-text">Space Crypto Miner</span>
        </a>
      </div>

      <!-- Navigation Menu -->
      <nav class="header-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <a href="/game.html" class="nav-link nav-link-play disabled" data-page="game" title="Servidor não disponível" target="_blank">
              <span class="nav-icon">🎮</span>
              <span class="nav-text">Play</span>
              <span class="play-status-indicator">⚠️</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="/dashboard" class="nav-link" data-page="dashboard" title="Dashboard">
              <span class="nav-icon">📊</span>
              <span class="nav-text">Dashboard</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="/profile" class="nav-link" data-page="profile" title="Meu Perfil">
              <span class="nav-icon">👤</span>
              <span class="nav-text">Perfil</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="/missions" class="nav-link" data-page="missions" title="Missões">
              <span class="nav-icon">🎯</span>
              <span class="nav-text">Missões</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="/marketplace" class="nav-link" data-page="marketplace" title="Mercado">
              <span class="nav-icon">🛒</span>
              <span class="nav-text">Mercado</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="/config" class="nav-link" data-page="config" title="Configurações">
              <span class="nav-icon">⚙️</span>
              <span class="nav-text">Config</span>
            </a>
          </li>
          <li class="nav-item">
            <button class="nav-link nav-link-server" id="serverStatusBtn" data-page="server" title="Status do Servidor">
              <span class="nav-icon">🌐</span>
              <span class="nav-text">Servidor</span>
              <span class="status-dot" id="headerStatusDot"></span>
            </button>
          </li>
        </ul>
      </nav>

      <!-- Server Status Dropdown -->
      <div id="serverStatusDropdown" class="server-status-dropdown" style="display: none;">
        <div id="serverStatusContent"></div>
      </div>

      <!-- User Actions -->
      <div class="header-actions">
        <button id="logoutBtn" class="action-btn logout-btn" title="Fazer logout">
          <span class="btn-icon">🚪</span>
          <span class="btn-text">Logout</span>
        </button>
      </div>

      <!-- Mobile Menu Toggle -->
      <button id="mobileMenuToggle" class="mobile-menu-toggle" aria-label="Toggle navigation menu">
        <span class="hamburger-icon">☰</span>
      </button>
    `;

    // Adicionar estilos
    this.addStyles();

    // Configurar event listeners
    this.setupEventListeners(container);

    // Atualizar estado ativo baseado na página atual
    this.updateActivePage();

    return container;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners(container) {
    // Logout button
    const logoutBtn = container.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.handleLogout();
      });
    }

    // Mobile menu toggle
    const mobileToggle = container.querySelector('#mobileMenuToggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        this.toggleMobileMenu(container);
      });
    }

    // Server status button
    const serverStatusBtn = container.querySelector('#serverStatusBtn');
    if (serverStatusBtn) {
      serverStatusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleServerStatusDropdown(container);
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const dropdown = container.querySelector('#serverStatusDropdown');
      const btn = container.querySelector('#serverStatusBtn');
      
      if (dropdown && btn && this.dropdownOpen) {
        if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
          this.closeServerStatusDropdown(container);
        }
      }
    });

    // Initialize server status component
    this.initializeServerStatus(container);

    // Update header status dot
    this.updateHeaderStatusDot(container);
    
    // Initialize play button state
    this.updatePlayButtonState(container);

    // Navigation links - prevent default and use router (except Play button)
    const navLinks = container.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      // Skip Play button - let it open game.html in new tab
      if (link.classList.contains('nav-link-play')) {
        return;
      }
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          navigateTo(href);
        }
      });
    });

    // Brand link
    const brandLink = container.querySelector('.brand-link');
    if (brandLink) {
      brandLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/');
      });
    }
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
   * Toggle mobile menu
   */
  toggleMobileMenu(container) {
    const nav = container.querySelector('.header-nav');
    const toggle = container.querySelector('#mobileMenuToggle');

    if (nav && toggle) {
      const isOpen = nav.classList.contains('mobile-open');

      if (isOpen) {
        nav.classList.remove('mobile-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.querySelector('.hamburger-icon').textContent = '☰';
      } else {
        nav.classList.add('mobile-open');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.querySelector('.hamburger-icon').textContent = '✕';
      }
    }
  }

  /**
   * Initialize server status component
   */
  initializeServerStatus(container) {
    const contentDiv = container.querySelector('#serverStatusContent');
    if (contentDiv && !this.serverStatusComponent) {
      this.serverStatusComponent = new ServerStatus();
      const statusElement = this.serverStatusComponent.render();
      contentDiv.appendChild(statusElement);

      // Auto-connect if not connected
      if (!socketService.isConnected()) {
        socketService.connect();
      }
    }
  }

  /**
   * Toggle server status dropdown
   */
  toggleServerStatusDropdown(container) {
    if (this.dropdownOpen) {
      this.closeServerStatusDropdown(container);
    } else {
      this.openServerStatusDropdown(container);
    }
  }

  /**
   * Open server status dropdown
   */
  openServerStatusDropdown(container) {
    const dropdown = container.querySelector('#serverStatusDropdown');
    if (dropdown) {
      dropdown.style.display = 'block';
      this.dropdownOpen = true;

      // Animate
      setTimeout(() => {
        dropdown.classList.add('open');
      }, 10);
    }
  }

  /**
   * Close server status dropdown
   */
  closeServerStatusDropdown(container) {
    const dropdown = container.querySelector('#serverStatusDropdown');
    if (dropdown) {
      dropdown.classList.remove('open');
      
      setTimeout(() => {
        dropdown.style.display = 'none';
        this.dropdownOpen = false;
      }, 300);
    }
  }

  /**
   * Update header status dot
   */
  updateHeaderStatusDot(container) {
    const statusDot = container.querySelector('#headerStatusDot');
    if (!statusDot) return;

    const updateDot = () => {
      const isConnected = socketService.isConnected();
      const isAuthenticated = socketService.isAuthenticated();

      if (isAuthenticated) {
        statusDot.className = 'status-dot online';
      } else if (isConnected) {
        statusDot.className = 'status-dot connecting';
      } else {
        statusDot.className = 'status-dot offline';
      }
      
      // Also update play button state
      this.updatePlayButtonState(container);
    };

    // Initial update
    updateDot();

    // Listen to socket events
    window.addEventListener('socket:connected', updateDot);
    window.addEventListener('socket:disconnected', updateDot);
    window.addEventListener('socket:authenticated', updateDot);
    window.addEventListener('socket:auth:error', updateDot);

    // Update every 5 seconds
    setInterval(updateDot, 5000);
  }

  /**
   * Update active page indicator
   */
  updateActivePage() {
    // Determinar página atual pela URL
    const path = window.location.pathname;

    let activePage = 'dashboard'; // default

    if (path === '/' || path === '/index.html') {
      activePage = 'home';
    } else if (path.includes('/dashboard')) {
      activePage = 'dashboard';
    } else if (path.includes('/profile')) {
      activePage = 'profile';
    } else if (path.includes('/missions')) {
      activePage = 'missions';
    } else if (path.includes('/marketplace')) {
      activePage = 'marketplace';
    } else if (path.includes('/config')) {
      activePage = 'config';
    }

    // Atualizar classe active nos links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const page = link.getAttribute('data-page');
      if (page === activePage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /**
   * Add styles
   */
  addStyles() {
    if (!document.querySelector('style[data-component="header-navigation"]')) {
      const style = document.createElement('style');
      style.setAttribute('data-component', 'header-navigation');
      style.textContent = `
        .global-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: var(--z-header, 100);
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 255, 204, 0.2);
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 60px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        /* Brand */
        .header-brand {
          display: flex;
          align-items: center;
        }

        .brand-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 0.5rem);
          color: var(--primary-cyan, #00ffcc);
          text-decoration: none;
          font-weight: 700;
          font-size: clamp(1.1rem, 3vw, 1.4rem);
          transition: var(--transition-normal, 0.3s);
        }

        .brand-link:hover {
          color: var(--secondary-blue, #0099ff);
          transform: translateY(-1px);
        }

        .brand-icon {
          font-size: 1.5rem;
          animation: float 3s ease-in-out infinite;
        }

        .brand-text {
          font-family: var(--font-primary, Arial);
          letter-spacing: 0.5px;
        }

        /* Navigation */
        .header-nav {
          display: flex;
          align-items: center;
        }

        .nav-list {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: var(--spacing-md, 1rem);
        }

        .nav-item {
          display: flex;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs, 0.25rem);
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
          color: var(--text-secondary, #b0b0b0);
          text-decoration: none;
          font-family: var(--font-secondary, Arial);
          font-weight: 500;
          font-size: var(--text-sm, 0.875rem);
          border-radius: var(--border-radius-md, 0.5rem);
          transition: var(--transition-normal, 0.3s);
          border: 1px solid transparent;
        }

        .nav-link:hover {
          color: var(--primary-cyan, #00ffcc);
          background: rgba(0, 255, 204, 0.1);
          border-color: rgba(0, 255, 204, 0.3);
          transform: translateY(-2px);
        }

        .nav-link.active {
          color: var(--primary-cyan, #00ffcc);
          background: rgba(0, 255, 204, 0.15);
          border-color: rgba(0, 255, 204, 0.4);
          box-shadow: 0 0 10px rgba(0, 255, 204, 0.2);
        }

        /* Play Button - Special styling */
        .nav-link-play {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-color: rgba(16, 185, 129, 0.5);
          color: white !important;
          font-weight: 600;
          position: relative;
        }

        .nav-link-play:hover:not(.disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          border-color: rgba(16, 185, 129, 0.8);
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 5px 20px rgba(16, 185, 129, 0.4);
        }
        
        /* Play Button - Disabled state */
        .nav-link-play.disabled {
          background: linear-gradient(135deg, #666, #444);
          border-color: rgba(102, 102, 102, 0.5);
          color: #999 !important;
          cursor: not-allowed;
          opacity: 0.6;
          box-shadow: none;
        }
        
        .nav-link-play.disabled:hover {
          transform: none;
          box-shadow: none;
        }
        
        .play-status-indicator {
          position: absolute;
          top: -5px;
          right: -5px;
          font-size: 0.8em;
          background: rgba(255, 0, 0, 0.8);
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .nav-link-play:not(.disabled) .play-status-indicator {
          background: rgba(0, 255, 136, 0.8);
        }

        .nav-link-play .nav-icon {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .nav-icon {
          font-size: 1.1rem;
        }

        /* Server Status Button */
        .nav-link-server {
          position: relative;
          background: none;
          border: 1px solid transparent;
          cursor: pointer;
        }

        .nav-link-server .status-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--text-muted);
        }

        .nav-link-server .status-dot.online {
          background-color: var(--success);
          box-shadow: 0 0 8px var(--success);
          animation: pulse-dot 2s ease-in-out infinite;
        }

        .nav-link-server .status-dot.connecting {
          background-color: #ffa500;
          box-shadow: 0 0 8px #ffa500;
          animation: pulse-dot 1s ease-in-out infinite;
        }

        .nav-link-server .status-dot.offline {
          background-color: var(--text-muted);
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        /* Server Status Dropdown */
        .server-status-dropdown {
          position: fixed;
          top: 70px;
          right: 20px;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(0, 255, 204, 0.3);
          border-radius: var(--border-radius-lg, 0.75rem);
          padding: 0;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          z-index: 999;
          min-width: 320px;
          max-width: 400px;
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.3s ease;
        }

        .server-status-dropdown.open {
          opacity: 1;
          transform: translateY(0);
        }

        .server-status-dropdown .server-status-widget {
          margin: 0;
          border: none;
          border-radius: 0;
        }

        /* Actions */
        .header-actions {
          display: flex;
          align-items: center;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs, 0.25rem);
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
          background: rgba(255, 107, 107, 0.2);
          border: 1px solid rgba(255, 107, 107, 0.4);
          border-radius: var(--border-radius-md, 0.5rem);
          color: #ff6b6b;
          cursor: pointer;
          font-family: var(--font-secondary, Arial);
          font-weight: 600;
          font-size: var(--text-sm, 0.875rem);
          transition: var(--transition-normal, 0.3s);
        }

        .action-btn:hover {
          background: rgba(255, 107, 107, 0.3);
          border-color: rgba(255, 107, 107, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
        }

        /* Mobile Menu Toggle */
        .mobile-menu-toggle {
          display: none;
          background: none;
          border: 1px solid rgba(0, 255, 204, 0.3);
          border-radius: var(--border-radius-md, 0.5rem);
          color: var(--primary-cyan, #00ffcc);
          cursor: pointer;
          padding: var(--spacing-sm, 0.5rem);
          font-size: var(--text-lg, 1.25rem);
          transition: var(--transition-normal, 0.3s);
        }

        .mobile-menu-toggle:hover {
          background: rgba(0, 255, 204, 0.1);
          border-color: rgba(0, 255, 204, 0.5);
        }

        /* Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .global-header {
            padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
            min-height: 50px;
          }

          .brand-text {
            display: none;
          }

          .nav-list {
            position: fixed;
            top: 100%;
            left: 0;
            right: 0;
            flex-direction: column;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(15px);
            border-top: 1px solid rgba(0, 255, 204, 0.2);
            padding: var(--spacing-md, 1rem);
            gap: var(--spacing-sm, 0.5rem);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
          }

          .nav-list.mobile-open {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }

          .nav-link {
            padding: var(--spacing-md, 1rem);
            font-size: var(--text-base, 1rem);
            justify-content: flex-start;
            border: 1px solid rgba(0, 255, 204, 0.1);
          }

          .nav-link:hover,
          .nav-link.active {
            border-color: rgba(0, 255, 204, 0.4);
          }

          .action-btn .btn-text {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .header-actions {
            margin-right: var(--spacing-sm, 0.5rem);
          }
        }

        @media (max-width: 480px) {
          .global-header {
            padding: var(--spacing-xs, 0.25rem);
          }

          .nav-link {
            padding: var(--spacing-lg, 1.5rem) var(--spacing-md, 1rem);
          }

          .brand-link {
            font-size: 1.1rem;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Updates the Play button state based on server status
   */
  updatePlayButtonState(container) {
    const playButton = container.querySelector('.nav-link-play');
    const statusIndicator = container.querySelector('.play-status-indicator');
    
    if (!playButton || !statusIndicator) return;
    
    // Check server status
    const serverStatus = this.getServerStatus();
    
    if (serverStatus.isConnected && serverStatus.isAuthenticated) {
      // Server is OK - enable play button
      playButton.classList.remove('disabled');
      playButton.title = 'Jogar';
      statusIndicator.textContent = '✅';
      
      // Allow clicking
      playButton.onclick = null;
    } else {
      // Server is not OK - disable play button
      playButton.classList.add('disabled');
      playButton.title = 'Servidor não disponível';
      statusIndicator.textContent = '⚠️';
      
      // Prevent clicking
      playButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        alert('Servidor não disponível. Verifique a conexão.');
        return false;
      };
    }
  }

  /**
   * Gets current server status
   */
  getServerStatus() {
    // Try to get status from ServerStatus component
    const serverStatusWidget = document.querySelector('.server-status-widget');
    if (serverStatusWidget) {
      const statusDot = serverStatusWidget.querySelector('[data-status-dot]');
      const authDot = serverStatusWidget.querySelector('[data-auth-dot]');
      
      const isConnected = statusDot && statusDot.classList.contains('online');
      const isAuthenticated = authDot && authDot.classList.contains('online');
      
      return { isConnected, isAuthenticated };
    }
    
    // Fallback - assume disconnected
    return { isConnected: false, isAuthenticated: false };
  }
}
