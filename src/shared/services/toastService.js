/**
 * =====================================================
 * TOAST SERVICE - Sistema Global de Notificações
 * ===================================================== 
 * 
 * Implementação de Toast/Snackbar acessível (WCAG 2.1)
 * com suporte a múltiplos tipos e fila de notificações.
 */

class ToastService {
  constructor() {
    this.toasts = [];
    this.container = null;
    this.maxToasts = 3;
    this.init();
  }

  /**
   * Inicializa o container de toasts
   */
  init() {
    if (typeof document === 'undefined') return;

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'toast-container';
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-atomic', 'false');
    this.container.setAttribute('role', 'status');
    
    document.body.appendChild(this.container);
    this.addStyles();
  }

  /**
   * Mostra um toast
   * @param {string} message - Mensagem a exibir
   * @param {string} type - Tipo: 'info', 'success', 'warning', 'error'
   * @param {number} duration - Duração em ms (0 = infinito)
   */
  show(message, type = 'info', duration = 5000) {
    const toast = this.createToast(message, type);
    
    // Limitar número de toasts
    if (this.toasts.length >= this.maxToasts) {
      const oldestToast = this.toasts.shift();
      this.hide(oldestToast.element);
    }

    this.toasts.push({ element: toast, type, message });
    this.container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('toast-visible');
    });

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        this.hide(toast);
      }, duration);
    }

    return toast;
  }

  /**
   * Cria elemento de toast
   */
  createToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    
    const icon = this.getIcon(type);
    const iconLabel = this.getIconLabel(type);
    
    toast.innerHTML = `
      <div class="toast-icon" role="img" aria-label="${iconLabel}">${icon}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" aria-label="Fechar notificação" type="button">
        <span aria-hidden="true">×</span>
      </button>
    `;

    // Event listener para fechar
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.hide(toast));

    return toast;
  }

  /**
   * Esconde um toast
   */
  hide(toast) {
    if (!toast || !toast.parentElement) return;

    toast.classList.remove('toast-visible');
    toast.classList.add('toast-hiding');

    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
      // Remove da lista
      this.toasts = this.toasts.filter(t => t.element !== toast);
    }, 300);
  }

  /**
   * Atalhos para tipos específicos
   */
  success(message, duration = 5000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 7000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 6000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 5000) {
    return this.show(message, 'info', duration);
  }

  /**
   * Limpa todos os toasts
   */
  clearAll() {
    this.toasts.forEach(({ element }) => this.hide(element));
    this.toasts = [];
  }

  /**
   * Retorna ícone baseado no tipo
   */
  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  /**
   * Retorna label do ícone para screen readers
   */
  getIconLabel(type) {
    const labels = {
      success: 'Sucesso',
      error: 'Erro',
      warning: 'Aviso',
      info: 'Informação'
    };
    return labels[type] || labels.info;
  }

  /**
   * Adiciona estilos CSS
   */
  addStyles() {
    if (document.getElementById('toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      /* Container de Toasts */
      .toast-container {
        position: fixed;
        top: var(--spacing-lg, 24px);
        right: var(--spacing-lg, 24px);
        z-index: var(--z-overlay, 1200);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm, 8px);
        max-width: 400px;
        pointer-events: none;
      }

      /* Toast Individual */
      .toast {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm, 8px);
        padding: var(--spacing-md, 16px);
        background: var(--panel-bg, rgba(26, 26, 46, 0.95));
        border-radius: var(--border-radius-sm, 8px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        border-left: 4px solid var(--primary-cyan, #00ffcc);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        pointer-events: auto;
        min-width: 300px;
        max-width: 100%;
      }

      .toast-visible {
        opacity: 1;
        transform: translateX(0);
      }

      .toast-hiding {
        opacity: 0;
        transform: translateX(100%);
      }

      /* Tipos de Toast */
      .toast-success {
        border-left-color: var(--success, #00ff00);
      }

      .toast-error {
        border-left-color: var(--error, #ff4444);
      }

      .toast-warning {
        border-left-color: var(--warning, #ffaa00);
      }

      .toast-info {
        border-left-color: var(--primary-cyan, #00ffcc);
      }

      /* Ícone do Toast */
      .toast-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: bold;
      }

      .toast-success .toast-icon {
        color: var(--success, #00ff00);
      }

      .toast-error .toast-icon {
        color: var(--error, #ff4444);
      }

      .toast-warning .toast-icon {
        color: var(--warning, #ffaa00);
      }

      .toast-info .toast-icon {
        color: var(--primary-cyan, #00ffcc);
      }

      /* Mensagem do Toast */
      .toast-message {
        flex: 1;
        color: var(--text-primary, #ffffff);
        font-size: var(--text-body, 14px);
        line-height: 1.5;
      }

      /* Botão de Fechar */
      .toast-close {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: var(--text-muted, #99ddee);
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        transition: color 0.2s ease;
        padding: 0;
      }

      .toast-close:hover {
        color: var(--text-primary, #ffffff);
      }

      .toast-close:focus-visible {
        outline: 2px solid var(--primary-cyan, #00ffcc);
        outline-offset: 2px;
        border-radius: 2px;
      }

      /* Responsividade Mobile */
      @media (max-width: 768px) {
        .toast-container {
          top: var(--spacing-sm, 8px);
          right: var(--spacing-sm, 8px);
          left: var(--spacing-sm, 8px);
          max-width: none;
        }

        .toast {
          min-width: auto;
          width: 100%;
        }
      }

      /* Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        .toast {
          transition: opacity 0.1s ease;
          transform: none;
        }

        .toast-visible {
          transform: none;
        }

        .toast-hiding {
          transform: none;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Exportar instância singleton
const toastService = new ToastService();

export default toastService;

// Exportar também como named exports para conveniência
export const toast = {
  show: (message, type, duration) => toastService.show(message, type, duration),
  success: (message, duration) => toastService.success(message, duration),
  error: (message, duration) => toastService.error(message, duration),
  warning: (message, duration) => toastService.warning(message, duration),
  info: (message, duration) => toastService.info(message, duration),
  clearAll: () => toastService.clearAll()
};

