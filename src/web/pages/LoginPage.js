/**
 * LoginPage - Página de Login do Space Crypto Miner
 * Suporta email/senha e OAuth (Google)
 */

import * as authService from '../../shared/services/authService.js';
import { navigateTo } from '../../shared/router.js';

export default class LoginPage {
  constructor() {
    this.name = 'LoginPage';
    this.isLoading = false;
  }

  /**
   * Renderiza a página de login
   */
  render() {
    const container = document.createElement('div');
    container.className = 'login-page';
    container.innerHTML = `
      <div class="background-primary"></div>
      <div class="stars-background"></div>
      
      <div class="login-wrapper">
        <!-- Back Link -->
        <a href="/" class="login-back-link" title="Voltar para home">
          ← Voltar
        </a>
        
        <!-- Main Container -->
        <div class="login-container">
          <!-- Header -->
          <div class="login-header">
            <div class="login-ships">
              <img src="/assets/icones/0067.png" alt="Nave" class="ship-side">
              <img src="/assets/icones/0089.png" alt="Nave" class="ship-center">
              <img src="/assets/icones/0106.png" alt="Nave" class="ship-side">
            </div>
            <h1 class="login-title">Space Crypto Miner</h1>
            <p class="login-subtitle">Faça login para continuar sua jornada espacial</p>
          </div>
          
          <!-- Content -->
          <div class="login-content">
            <!-- Form Email/Senha -->
            <form id="loginForm" class="login-form">
              <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  class="form-input"
                  placeholder="seu@email.com"
                  required
                  aria-label="Email"
                />
              </div>

              <div class="form-group">
                <label for="password" class="form-label">Senha</label>
                <input
                  type="password"
                  id="password"
                  class="form-input"
                  placeholder="••••••••"
                  required
                  aria-label="Senha"
                />
              </div>

              <!-- Error Message -->
              <div id="errorMessage" class="error-message" role="alert" aria-live="polite" style="display: none;"></div>

              <!-- Submit Button -->
              <button type="submit" id="loginBtn" class="login-btn login-btn-primary" disabled aria-label="Fazer login com email e senha">
                <span class="btn-text">
                  <span role="img" aria-label="Foguete">🚀</span> Fazer Login
                </span>
                <span class="btn-loader" style="display: none;" role="status" aria-label="Carregando">⏳</span>
              </button>
            </form>

            <!-- Divider -->
            <div class="login-divider">
              <span>ou</span>
            </div>

            <!-- OAuth Button -->
            <button id="oauthBtn" class="login-btn login-btn-oauth" type="button" aria-label="Fazer login com conta do Google">
              <span class="btn-text">
                <span role="img" aria-label="Google">🔍</span> Login com Google
              </span>
              <span class="btn-loader" style="display: none;" role="status" aria-label="Carregando">⏳</span>
            </button>

            <!-- Footer -->
            <p class="login-footer-text">
              Não tem uma conta? 
              <a href="#" class="login-link" id="signupLink">Crie uma aqui</a>
            </p>
          </div>
        </div>
      </div>
    `;

    // Adicionar estilos
    this.addStyles();

    // Adicionar event listeners
    this.attachListeners(container);

    // Validar e habilitar botão quando campos forem preenchidos
    this.setupFormValidation(container);

    return container;
  }

  /**
   * Attach event listeners
   */
  attachListeners(container) {
    const loginForm = container.querySelector('#loginForm');
    const loginBtn = container.querySelector('#loginBtn');
    const oauthBtn = container.querySelector('#oauthBtn');
    const signupLink = container.querySelector('#signupLink');

    // Login form submit
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleEmailPasswordLogin(container);
    });

    // OAuth button
    oauthBtn.addEventListener('click', () => {
      this.handleOAuthLogin(container);
    });

    // Signup link (placeholder)
    signupLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Signup ainda não está implementado. Use o teste ou contato.');
    });

    // Enable login button when form is valid
    const emailInput = container.querySelector('#email');
    const passwordInput = container.querySelector('#password');

    [emailInput, passwordInput].forEach(input => {
      input.addEventListener('input', () => {
        const isValid = authService.isValidEmail(emailInput.value) && 
                       authService.isValidPassword(passwordInput.value);
        loginBtn.disabled = !isValid;
      });
    });
  }

  /**
   * Setup form validation
   */
  setupFormValidation(container) {
    const emailInput = container.querySelector('#email');
    const passwordInput = container.querySelector('#password');
    const loginBtn = container.querySelector('#loginBtn');

    const validate = () => {
      const isValid = authService.isValidEmail(emailInput.value.trim()) && 
                     authService.isValidPassword(passwordInput.value.trim());
      loginBtn.disabled = !isValid;
    };

    emailInput.addEventListener('blur', validate);
    passwordInput.addEventListener('blur', validate);
    
    // Initial validation
    validate();
  }

  /**
   * Handle email/password login
   */
  async handleEmailPasswordLogin(container) {
    const email = container.querySelector('#email').value.trim();
    const password = container.querySelector('#password').value.trim();
    const loginBtn = container.querySelector('#loginBtn');
    const errorDiv = container.querySelector('#errorMessage');

    // Reset error
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    // Validar inputs
    if (!authService.isValidEmail(email)) {
      this.showError(errorDiv, 'Email inválido');
      return;
    }

    if (!authService.isValidPassword(password)) {
      this.showError(errorDiv, 'Senha deve ter no mínimo 6 caracteres');
      return;
    }

    // Show loading state
    this.setLoading(loginBtn, true);

    try {
      // Chamada ao Supabase
      const data = await authService.signIn(email, password);
      
      console.log('✅ Login bem-sucedido!', data);
      
      // Redirecionar após pequeno delay para feedback
      setTimeout(() => {
        navigateTo('/dashboard');
      }, 500);

    } catch (error) {
      console.error('❌ Erro no login:', error);
      this.showError(errorDiv, error.message);
    } finally {
      this.setLoading(loginBtn, false);
    }
  }

  /**
   * Handle OAuth login (Google)
   */
  async handleOAuthLogin(container) {
    const oauthBtn = container.querySelector('#oauthBtn');
    const errorDiv = container.querySelector('#errorMessage');

    // Reset error
    errorDiv.style.display = 'none';

    this.setLoading(oauthBtn, true);

    try {
      console.log('🔐 Iniciando OAuth com Google...');
      
      const data = await authService.signInWithOAuth('google');
      
      console.log('✅ OAuth iniciado, redirecionando...', data);
      
      // Redirecionar para URL OAuth
      if (data?.url) {
        window.location.href = data.url;
      }

    } catch (error) {
      console.error('❌ Erro no OAuth:', error);
      this.showError(errorDiv, error.message);
      this.setLoading(oauthBtn, false);
    }
  }

  /**
   * Show error message (accessible)
   */
  showError(errorDiv, message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'polite');
    console.error('❌ Erro exibido:', message);
    
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
   * Set loading state
   */
  setLoading(button, isLoading) {
    const text = button.querySelector('.btn-text');
    const loader = button.querySelector('.btn-loader');

    if (isLoading) {
      button.disabled = true;
      // Apenas atualizar se os elementos existem
      if (text) text.style.display = 'none';
      if (loader) loader.style.display = 'inline';
      this.isLoading = true;
    } else {
      button.disabled = false;
      // Apenas atualizar se os elementos existem
      if (text) text.style.display = 'inline';
      if (loader) loader.style.display = 'none';
      this.isLoading = false;
    }
  }

  /**
   * Add styles
   */
  addStyles() {
    if (!document.querySelector('style[data-page="login"]')) {
      const style = document.createElement('style');
      style.setAttribute('data-page', 'login');
      style.textContent = `
        .login-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: var(--spacing-lg, 1.5rem) var(--spacing-md, 1rem);
        }

        .login-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
        }

        .login-back-link {
          position: fixed;
          top: var(--spacing-lg, 1.5rem);
          left: var(--spacing-lg, 1.5rem);
          color: var(--text-secondary, #b0b0b0);
          text-decoration: none;
          font-family: var(--font-secondary, Arial);
          font-size: var(--text-sm, 0.875rem);
          transition: var(--transition-normal, 0.3s);
          z-index: 100;
        }

        .login-back-link:hover {
          color: var(--primary-cyan, #00ffcc);
          text-shadow: 0 0 10px rgba(0, 255, 204, 0.3);
        }

        .login-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          max-width: 500px;
          width: 100%;
          margin: 0 auto;
        }

        .login-header {
          text-align: center;
          margin-bottom: 3rem;
          animation: fadeInDown 0.6s ease-out;
        }

        .login-ships {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm, 0.5rem);
          margin-bottom: var(--spacing-md, 1rem);
        }

        .ship-side {
          width: 60px;
          height: 60px;
          opacity: 0.7;
          animation: float 3s ease-in-out infinite;
        }

        .ship-center {
          width: 100px;
          height: 100px;
          opacity: 1;
          animation: float 3s ease-in-out infinite 0.2s;
        }

        .login-title {
          font-size: clamp(1.5rem, 5vw, 2.5rem);
          font-weight: 700;
          color: var(--primary-cyan, #00ffcc);
          text-shadow: 0 0 20px rgba(0, 255, 204, 0.4);
          letter-spacing: 1px;
          margin-bottom: var(--spacing-sm, 0.5rem);
          font-family: var(--font-primary, Arial);
        }

        .login-subtitle {
          font-size: clamp(0.875rem, 2vw, 1rem);
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          max-width: 400px;
          line-height: 1.5;
        }

        .login-content {
          width: 100%;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md, 1rem);
          margin-bottom: var(--spacing-lg, 1.5rem);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs, 0.25rem);
        }

        .form-label {
          font-family: var(--font-secondary, Arial);
          font-size: var(--text-sm, 0.875rem);
          color: var(--text-secondary, #b0b0b0);
          font-weight: 600;
        }

        .form-input {
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-md, 0.5rem);
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
          font-size: var(--text-sm, 0.875rem);
          color: var(--text-primary, #ffffff);
          font-family: var(--font-secondary, Arial);
          transition: var(--transition-normal, 0.3s);
          outline: none;
        }

        .form-input:focus {
          background: rgba(0, 255, 204, 0.12);
          border-color: var(--primary-cyan, #00ffcc);
          box-shadow: 0 0 15px rgba(0, 255, 204, 0.2);
        }

        .form-input::placeholder {
          color: var(--text-tertiary, #808080);
        }

        .error-message {
          background: rgba(255, 107, 107, 0.15);
          border: 1px solid rgba(255, 107, 107, 0.4);
          border-radius: var(--border-radius-md, 0.5rem);
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
          color: #ff6b6b;
          font-size: var(--text-sm, 0.875rem);
          font-family: var(--font-secondary, Arial);
          animation: shake 0.3s ease-in-out;
        }

        .login-btn {
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
          border: none;
          border-radius: var(--border-radius-md, 0.5rem);
          font-size: var(--text-sm, 0.875rem);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: var(--transition-normal, 0.3s);
          font-family: var(--font-primary, Arial);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-xs, 0.25rem);
          min-height: 44px;
        }

        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-btn-primary {
          background: linear-gradient(135deg, var(--primary-cyan, #00ffcc), var(--secondary-blue, #0099ff));
          color: #000;
          box-shadow: 0 0 20px rgba(0, 255, 204, 0.2);
        }

        .login-btn-primary:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(0, 255, 204, 0.4);
        }

        .login-btn-oauth {
          background: rgba(66, 133, 244, 0.2);
          border: 1px solid rgba(66, 133, 244, 0.5);
          color: var(--primary-cyan, #00ffcc);
        }

        .login-btn-oauth:not(:disabled):hover {
          background: rgba(66, 133, 244, 0.3);
          border-color: rgba(66, 133, 244, 0.8);
        }

        .btn-loader {
          animation: spin 1s linear infinite;
        }

        .login-divider {
          display: flex;
          align-items: center;
          gap: var(--spacing-md, 1rem);
          margin: var(--spacing-lg, 1.5rem) 0;
          color: var(--text-tertiary, #808080);
          font-family: var(--font-secondary, Arial);
          font-size: var(--text-sm, 0.875rem);
        }

        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(0, 255, 204, 0.1);
        }

        .login-footer-text {
          text-align: center;
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          font-size: var(--text-sm, 0.875rem);
          margin-top: var(--spacing-md, 1rem);
        }

        .login-link {
          color: var(--primary-cyan, #00ffcc);
          text-decoration: none;
          transition: var(--transition-normal, 0.3s);
        }

        .login-link:hover {
          text-decoration: underline;
          text-shadow: 0 0 10px rgba(0, 255, 204, 0.3);
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        @media (max-width: 768px) {
          .login-page {
            padding: var(--spacing-md, 1rem);
          }

          .login-back-link {
            position: static;
            margin-bottom: var(--spacing-md, 1rem);
            display: inline-block;
          }

          .ship-side {
            width: 50px;
            height: 50px;
          }

          .ship-center {
            width: 80px;
            height: 80px;
          }

          .login-header {
            margin-bottom: 2rem;
          }

          .login-btn {
            min-height: 40px;
            font-size: var(--text-xs, 0.8rem);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
}
