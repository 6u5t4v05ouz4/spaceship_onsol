/**
 * =====================================================
 * LOADING SPINNER - Componente Unificado de Loading
 * ===================================================== 
 * 
 * Componente acessível (WCAG 2.1) para estados de carregamento.
 */

export class LoadingSpinner {
  /**
   * Renderiza um spinner de loading
   * @param {string} type - Tipo: 'default', 'inline', 'overlay'
   * @param {string} message - Mensagem de loading
   * @param {string} size - Tamanho: 'sm', 'md', 'lg'
   */
  static render(type = 'default', message = 'Carregando...', size = 'md') {
    const spinner = document.createElement('div');
    spinner.className = `loading-spinner loading-spinner-${type} loading-spinner-${size}`;
    spinner.setAttribute('role', 'status');
    spinner.setAttribute('aria-live', 'polite');
    spinner.setAttribute('aria-busy', 'true');

    spinner.innerHTML = `
      <div class="spinner-animation"></div>
      <p class="spinner-message">${message}</p>
      <span class="sr-only">${message}</span>
    `;

    return spinner;
  }

  /**
   * Renderiza um skeleton screen
   * @param {string} layout - Layout: 'card', 'list', 'text'
   */
  static renderSkeleton(layout = 'card') {
    const skeleton = document.createElement('div');
    skeleton.className = `skeleton skeleton-${layout}`;
    skeleton.setAttribute('aria-busy', 'true');
    skeleton.setAttribute('aria-label', 'Carregando conteúdo');

    if (layout === 'card') {
      skeleton.innerHTML = `
        <div class="skeleton-header"></div>
        <div class="skeleton-body">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      `;
    } else if (layout === 'list') {
      skeleton.innerHTML = `
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
      `;
    } else if (layout === 'text') {
      skeleton.innerHTML = `
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      `;
    }

    return skeleton;
  }

  /**
   * Adiciona estilos CSS
   */
  static addStyles() {
    if (document.getElementById('loading-spinner-styles')) return;

    const style = document.createElement('style');
    style.id = 'loading-spinner-styles';
    style.textContent = `
      /* =====================================================
         LOADING SPINNER
         ===================================================== */

      .loading-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-md, 16px);
        padding: var(--spacing-lg, 24px);
      }

      .loading-spinner-inline {
        flex-direction: row;
        padding: var(--spacing-sm, 8px);
      }

      .loading-spinner-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
        z-index: var(--z-overlay, 1200);
      }

      /* Animação do Spinner */
      .spinner-animation {
        width: 48px;
        height: 48px;
        border: 4px solid var(--primary-cyan-dark, rgba(0, 255, 204, 0.1));
        border-top: 4px solid var(--primary-cyan, #00ffcc);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-spinner-sm .spinner-animation {
        width: 24px;
        height: 24px;
        border-width: 2px;
      }

      .loading-spinner-lg .spinner-animation {
        width: 64px;
        height: 64px;
        border-width: 6px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Mensagem do Spinner */
      .spinner-message {
        color: var(--text-secondary, #c0f7f0);
        font-size: var(--text-body, 14px);
        font-weight: 500;
        margin: 0;
        text-align: center;
      }

      .loading-spinner-inline .spinner-message {
        font-size: var(--text-body-sm, 12px);
      }

      /* =====================================================
         SKELETON SCREENS
         ===================================================== */

      .skeleton {
        padding: var(--spacing-md, 16px);
        background: var(--card-bg, rgba(0, 0, 0, 0.6));
        border-radius: var(--border-radius-sm, 8px);
        border: 1px solid var(--primary-cyan-dark, rgba(0, 255, 204, 0.1));
      }

      .skeleton-header {
        width: 100%;
        height: 60px;
        background: linear-gradient(
          90deg,
          var(--primary-cyan-dark, rgba(0, 255, 204, 0.1)) 0%,
          var(--primary-cyan-light, rgba(0, 255, 204, 0.3)) 50%,
          var(--primary-cyan-dark, rgba(0, 255, 204, 0.1)) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: var(--border-radius-sm, 8px);
        margin-bottom: var(--spacing-md, 16px);
      }

      .skeleton-body {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm, 8px);
      }

      .skeleton-line {
        width: 100%;
        height: 16px;
        background: linear-gradient(
          90deg,
          var(--primary-cyan-dark, rgba(0, 255, 204, 0.1)) 0%,
          var(--primary-cyan-light, rgba(0, 255, 204, 0.3)) 50%,
          var(--primary-cyan-dark, rgba(0, 255, 204, 0.1)) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: var(--border-radius-xs, 4px);
      }

      .skeleton-line.short {
        width: 60%;
      }

      .skeleton-item {
        width: 100%;
        height: 40px;
        background: linear-gradient(
          90deg,
          var(--primary-cyan-dark, rgba(0, 255, 204, 0.1)) 0%,
          var(--primary-cyan-light, rgba(0, 255, 204, 0.3)) 50%,
          var(--primary-cyan-dark, rgba(0, 255, 204, 0.1)) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: var(--border-radius-xs, 4px);
        margin-bottom: var(--spacing-sm, 8px);
      }

      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      /* Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        .spinner-animation {
          animation: none;
          border-top-color: var(--primary-cyan, #00ffcc);
        }

        .skeleton-header,
        .skeleton-line,
        .skeleton-item {
          animation: none;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Inicializar estilos
if (typeof document !== 'undefined') {
  LoadingSpinner.addStyles();
}

export default LoadingSpinner;

