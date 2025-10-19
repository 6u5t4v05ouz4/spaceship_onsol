/**
 * HeaderNavigation - Componente de navegação global
 * Aparece em todas as páginas para navegação consistente
 */

import * as authService from '../../shared/services/authService.js';
import { navigateTo } from '../../shared/router.js';

export default class HeaderNavigation {
  constructor() {
    this.currentPage = '';
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
            <a href="/game.html" class="nav-link nav-link-play" data-page="game" title="Jogar" target="_blank">
              <span class="nav-icon">🎮</span>
              <span class="nav-text">Play</span>
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
        </ul>
      </nav>

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
        }

        .nav-link-play:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          border-color: rgba(16, 185, 129, 0.8);
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 5px 20px rgba(16, 185, 129, 0.4);
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
}
