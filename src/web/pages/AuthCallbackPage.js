/**
 * AuthCallbackPage - Página de Processamento de OAuth Callback
 * Processa o redirecionamento do provedor OAuth (Google, etc)
 */

import * as authService from '../../shared/services/authService.js';
import { navigateTo } from '../../shared/router.js';

export default class AuthCallbackPage {
  constructor() {
    this.name = 'AuthCallbackPage';
    this.isProcessing = false;
  }

  /**
   * Renderiza a página de callback
   */
  render() {
    const container = document.createElement('div');
    container.className = 'auth-callback-page';
    container.innerHTML = `
      <div class="background-primary"></div>
      <div class="stars-background"></div>
      
      <div class="callback-wrapper">
        <div class="callback-container">
          <div class="callback-content">
            <div id="loadingState" class="loading-state">
              <div class="spinner">⏳</div>
              <p class="loading-text">Processando autenticação...</p>
              <p class="loading-subtext">Você será redirecionado em breve</p>
            </div>
            
            <div id="errorState" class="error-state" style="display: none;">
              <div class="error-icon">❌</div>
              <p class="error-title">Erro na Autenticação</p>
              <p class="error-message" id="errorMessage"></p>
              <a href="/login" class="error-link">← Voltar para Login</a>
            </div>
          </div>
        </div>
      </div>
    `;

    // Adicionar estilos
    this.addStyles();

    // Processar callback assim que renderizar
    this.processCallback(container);

    return container;
  }

  /**
   * Processa o OAuth callback
   */
  async processCallback(container) {
    // Evitar processamento múltiplo
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    try {
      // Extrair parâmetros do hash (Google OAuth envia no hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);
      
      // Combinar parâmetros do hash e query
      const error = hashParams.get('error') || queryParams.get('error');
      const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
      const code = hashParams.get('code') || queryParams.get('code');
      const accessToken = hashParams.get('access_token');

      console.log('🔐 OAuth Callback params:', { 
        error, 
        code: code ? '***' : undefined,
        accessToken: accessToken ? '***' : undefined,
        hash: window.location.hash.substring(0, 50) + '...'
      });

      // Se tem erro no callback, exibir
      if (error) {
        const errorMsg = this.translateOAuthError(error, errorDescription);
        this.showError(container, errorMsg);
        return;
      }

      // Supabase SDK com detectSessionInUrl: true já processa automaticamente
      // Apenas precisamos verificar se a session foi estabelecida
      console.log('🔐 Verificando sessão com Supabase...');
      
      // Aguardar um pouco para o SDK processar
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar se session foi criada
      const session = await authService.getSession();

      if (!session) {
        // Se tem code, tentar trocar por session
        if (code) {
          console.log('🔐 Trocando código por sessão...');
          // O SDK já deveria ter feito isso automaticamente,
          // mas vamos tentar chamar handleOAuthCallback como fallback
          try {
            const result = await authService.handleOAuthCallback();
            if (!result) {
              throw new Error('Falha ao processar autenticação');
            }
          } catch (exchangeError) {
            console.error('❌ Erro ao trocar código:', exchangeError);
            this.showError(container, 'Código de autenticação expirado. Tente novamente.');
            return;
          }
        } else {
          // Sem code e sem session = erro
          this.showError(container, 'Código de autenticação não encontrado. Tente fazer login novamente.');
          return;
        }
      }

      console.log('✅ Sessão estabelecida! Redirecionando para dashboard...');

      // Limpar URL de tokens
      window.history.replaceState({}, document.title, window.location.pathname);

      // Redirecionar para dashboard após pequeno delay para feedback
      setTimeout(() => {
        navigateTo('/dashboard');
      }, 500);

    } catch (error) {
      console.error('❌ Erro no callback:', error);
      this.showError(container, error.message);
    }
  }

  /**
   * Traduz erros OAuth para português amigável
   */
  translateOAuthError(error, description) {
    const translations = {
      'access_denied': 'Você recusou a permissão. Tente fazer login novamente.',
      'invalid_client': 'Erro na configuração do provedor. Contate o suporte.',
      'invalid_grant': 'Código de autenticação expirado ou inválido. Tente novamente.',
      'invalid_scope': 'Escopo de permissão inválido. Contate o suporte.',
      'server_error': 'Erro no servidor de autenticação. Tente novamente em alguns momentos.',
      'temporarily_unavailable': 'Serviço temporariamente indisponível. Tente novamente.',
    };

    const msg = translations[error] || `Erro: ${error}`;
    return description ? `${msg} (${description})` : msg;
  }

  /**
   * Mostrar erro
   */
  showError(container, message) {
    const loadingState = container.querySelector('#loadingState');
    const errorState = container.querySelector('#errorState');
    const errorMessage = container.querySelector('#errorMessage');

    loadingState.style.display = 'none';
    errorState.style.display = 'block';
    errorMessage.textContent = message;

    console.error('❌ Erro exibido:', message);
  }

  /**
   * Adicionar estilos
   */
  addStyles() {
    if (!document.querySelector('style[data-page="auth-callback"]')) {
      const style = document.createElement('style');
      style.setAttribute('data-page', 'auth-callback');
      style.textContent = `
        .auth-callback-page {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .callback-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .callback-container {
          text-align: center;
          max-width: 500px;
          width: 100%;
          padding: var(--spacing-lg, 1.5rem);
        }

        .callback-content {
          animation: fadeIn 0.5s ease-in;
        }

        .loading-state,
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-lg, 1.5rem);
        }

        .spinner {
          font-size: 3rem;
          animation: spin 2s linear infinite;
        }

        .loading-text {
          font-size: clamp(1rem, 2vw, 1.5rem);
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 700;
          margin: 0;
          text-shadow: 0 0 20px rgba(0, 255, 204, 0.3);
        }

        .loading-subtext {
          font-size: var(--text-sm, 0.875rem);
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          margin: 0;
          opacity: 0.8;
        }

        .error-state {
          padding: var(--spacing-lg, 1.5rem);
          background: rgba(255, 107, 107, 0.08);
          border: 1px solid rgba(255, 107, 107, 0.2);
          border-radius: var(--border-radius-md, 0.5rem);
          backdrop-filter: blur(10px);
          animation: shake 0.3s ease-in-out;
        }

        .error-icon {
          font-size: 3rem;
          margin: 0;
        }

        .error-title {
          font-size: clamp(1rem, 3vw, 1.5rem);
          color: #ff6b6b;
          font-family: var(--font-primary, Arial);
          font-weight: 700;
          margin: 0;
        }

        .error-message {
          font-size: var(--text-sm, 0.875rem);
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          margin: 0;
          line-height: 1.6;
        }

        .error-link {
          display: inline-block;
          margin-top: var(--spacing-md, 1rem);
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
          background: rgba(0, 255, 204, 0.1);
          border: 1px solid rgba(0, 255, 204, 0.3);
          border-radius: var(--border-radius-md, 0.5rem);
          color: var(--primary-cyan, #00ffcc);
          text-decoration: none;
          font-family: var(--font-secondary, Arial);
          font-size: var(--text-sm, 0.875rem);
          transition: var(--transition-normal, 0.3s);
        }

        .error-link:hover {
          background: rgba(0, 255, 204, 0.15);
          border-color: rgba(0, 255, 204, 0.5);
          text-shadow: 0 0 10px rgba(0, 255, 204, 0.3);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @media (max-width: 768px) {
          .callback-container {
            padding: var(--spacing-md, 1rem);
          }

          .spinner {
            font-size: 2rem;
          }

          .loading-text {
            font-size: 1rem;
          }

          .error-state {
            padding: var(--spacing-md, 1rem);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
}
