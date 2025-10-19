/**
 * ProfilePage - Página de edição de perfil do usuário
 * Permite editar: username, bio, avatar
 */

import * as authService from '../../shared/services/authService.js';
import * as profileService from '../../shared/services/profileService.js';
import { navigateTo } from '../../shared/router.js';

export default class ProfilePage {
  constructor(supabaseClient) {
    this.name = 'ProfilePage';
    this.supabase = supabaseClient;
    this.state = 'loading'; // loading, viewing, editing, saving, error
    this.profile = {};
    this.errors = {};
    this.selectedAvatarFile = null;
    this.avatarPreview = null;
  }

  /**
   * Renderiza a página de perfil
   */
  render() {
    const container = document.createElement('div');
    container.className = 'profile-page';
    container.innerHTML = `
      <div class="background-primary"></div>
      <div class="stars-background"></div>
      
      <div class="profile-wrapper">
        <!-- Header -->
        <header class="profile-header">
          <div class="header-left">
            <h1 class="profile-title">👤 Meu Perfil</h1>
          </div>
          <div class="header-right">
            <button id="logoutBtn" class="logout-btn" title="Fazer logout">
              🚪 Logout
            </button>
          </div>
        </header>

        <!-- Content -->
        <div class="profile-content">
          <!-- Loading State -->
          <div id="loadingState" class="loading-state">
            <div class="spinner">⏳</div>
            <p>Carregando perfil...</p>
          </div>

          <!-- Error State -->
          <div id="errorState" class="error-state" role="alert" aria-live="polite" style="display: none;">
            <div class="error-icon" role="img" aria-label="Erro">❌</div>
            <p class="error-message" id="errorMessage"></p>
            <button id="retryBtn" class="retry-btn" aria-label="Tentar carregar novamente">
              <span role="img" aria-label="Recarregar">🔄</span> Tentar Novamente
            </button>
          </div>

          <!-- Data State -->
          <div id="dataState" class="data-state" style="display: none;">
            <div class="profile-container">
              <!-- Avatar Section -->
              <section class="avatar-section">
                <div class="avatar-display">
                  <div id="avatarPreview" class="avatar-image">
                    <span id="avatarPlaceholder">👤</span>
                  </div>
                  <p id="avatarStatus" class="avatar-status"></p>
                </div>
                <div id="avatarUploadDiv" class="avatar-upload" style="display: none;">
                  <input type="file" id="avatarInput" accept="image/jpeg,image/png,image/webp" style="display: none;" aria-label="Selecionar arquivo de avatar">
                  <button id="uploadBtn" class="upload-btn" type="button" aria-label="Trocar foto de avatar">
                    <span role="img" aria-label="Upload">📤</span> Trocar Avatar
                  </button>
                  <p id="uploadError" class="error-text" role="alert" aria-live="polite" style="display: none;"></p>
                </div>
              </section>

              <!-- Form Section -->
              <section class="form-section">
                <form id="profileForm" class="profile-form">
                  <!-- Username Field -->
                  <div class="form-group">
                    <label for="username" class="form-label">Username *</label>
                    <input 
                      type="text" 
                      id="username" 
                      class="form-input" 
                      placeholder="seu_username"
                      disabled
                      required
                    >
                    <span id="usernameError" class="field-error"></span>
                  </div>

                  <!-- Email Field (Read-only) -->
                  <div class="form-group">
                    <label for="email" class="form-label">Email (Não editável)</label>
                    <input 
                      type="email" 
                      id="email" 
                      class="form-input form-input-readonly" 
                      disabled
                    >
                  </div>

                  <!-- Bio Field -->
                  <div class="form-group">
                    <label for="bio" class="form-label">Bio (máx. 500 caracteres)</label>
                    <textarea 
                      id="bio" 
                      class="form-input form-textarea" 
                      placeholder="Escreva algo sobre você..."
                      maxlength="500"
                      disabled
                    ></textarea>
                    <div class="bio-counter">
                      <span id="bioCounter">0</span>/500
                    </div>
                    <span id="bioError" class="field-error"></span>
                  </div>

                  <!-- Success Message -->
                  <div id="successMessage" class="success-message" role="status" aria-live="polite" style="display: none;">
                    <span role="img" aria-label="Sucesso">✅</span> Perfil atualizado com sucesso!
                  </div>

                  <!-- Error Message -->
                  <div id="generalError" class="general-error" role="alert" aria-live="polite" style="display: none;"></div>

                  <!-- Action Buttons -->
                  <div class="form-actions">
                    <button id="editBtn" class="btn btn-primary" type="button" style="display: none;" aria-label="Editar perfil">
                      <span role="img" aria-label="Editar">✏️</span> Editar
                    </button>
                    <button id="saveBtn" class="btn btn-success" type="button" style="display: none;" aria-label="Salvar alterações">
                      <span class="btn-text">
                        <span role="img" aria-label="Salvar">💾</span> Salvar
                      </span>
                      <span class="btn-loader" style="display: none;" role="status" aria-label="Salvando">⏳</span>
                    </button>
                    <button id="cancelBtn" class="btn btn-secondary" type="button" style="display: none;" aria-label="Cancelar edição">
                      <span role="img" aria-label="Cancelar">❌</span> Cancelar
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </div>
        </div>
      </div>
    `;

    // Adicionar estilos
    this.addStyles();

    // Carregar dados
    this.loadProfile(container);

    // Event listeners
    this.setupEventListeners(container);

    return container;
  }

  /**
   * Carregar perfil do Supabase
   */
  async loadProfile(container) {
    this.setState(container, 'loading');

    try {
      // Obter sessão
      const session = await authService.getSession();
      if (!session) {
        this.setState(container, 'error');
        this.showError(container, 'Sessão expirada. Faça login novamente.');
        setTimeout(() => navigateTo('/login'), 1500);
        return;
      }

      const userId = session.user.id;
      console.log('👤 Carregando perfil:', userId);

      // Buscar perfil
      this.profile = await profileService.getProfile(this.supabase, userId);
      this.profile.email = session.user.email;

      console.log('✅ Perfil carregado:', this.profile);

      this.setState(container, 'viewing');
      this.renderProfile(container);

    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
      this.setState(container, 'error');
      this.showError(container, error.message);
    }
  }

  /**
   * Renderizar perfil
   */
  renderProfile(container) {
    // Preencher campos
    container.querySelector('#username').value = this.profile.username || '';
    container.querySelector('#email').value = this.profile.email || '';
    container.querySelector('#bio').value = this.profile.bio || '';
    container.querySelector('#bioCounter').textContent = (this.profile.bio || '').length;

    // Avatar
    if (this.profile.avatar_url) {
      const preview = container.querySelector('#avatarPreview');
      preview.innerHTML = `<img src="${this.profile.avatar_url}" alt="Avatar">`;
      container.querySelector('#avatarStatus').textContent = '✅ Avatar definido';
    }

    // Mostrar estado viewing
    this.updateUI(container, 'viewing');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners(container) {
    // Logout
    container.querySelector('#logoutBtn').addEventListener('click', () => {
      this.handleLogout();
    });

    // Retry
    const retryBtn = container.querySelector('#retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.loadProfile(container);
      });
    }

    // Edit/Save/Cancel
    const editBtn = container.querySelector('#editBtn');
    const saveBtn = container.querySelector('#saveBtn');
    const cancelBtn = container.querySelector('#cancelBtn');

    if (editBtn) {
      editBtn.addEventListener('click', () => {
        this.setState(container, 'editing');
        this.updateUI(container, 'editing');
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSave(container);
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.setState(container, 'viewing');
        this.renderProfile(container);
        this.updateUI(container, 'viewing');
      });
    }

    // Avatar upload
    const uploadBtn = container.querySelector('#uploadBtn');
    const avatarInput = container.querySelector('#avatarInput');

    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => {
        avatarInput.click();
      });
    }

    if (avatarInput) {
      avatarInput.addEventListener('change', (e) => {
        this.handleAvatarSelect(e, container);
      });
    }

    // Bio counter
    const bioField = container.querySelector('#bio');
    if (bioField) {
      bioField.addEventListener('input', (e) => {
        container.querySelector('#bioCounter').textContent = e.target.value.length;
      });
    }

    // Form validation
    container.querySelector('#username').addEventListener('input', () => {
      this.clearFieldError(container, 'username');
    });

    container.querySelector('#bio').addEventListener('input', () => {
      this.clearFieldError(container, 'bio');
    });
  }

  /**
   * Handle avatar selection
   */
  handleAvatarSelect(event, container) {
    const file = event.target.files[0];
    const errorDiv = container.querySelector('#uploadError');

    if (!file) return;

    // Validar
    const error = profileService.validateAvatarFile(file);
    if (error) {
      errorDiv.textContent = error;
      errorDiv.style.display = 'block';
      return;
    }

    errorDiv.style.display = 'none';

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = container.querySelector('#avatarPreview');
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      this.selectedAvatarFile = file;
      container.querySelector('#avatarStatus').textContent = '📤 Pronto para upload';
    };
    reader.readAsDataURL(file);
  }

  /**
   * Handle save
   */
  async handleSave(container) {
    // Limpar erros
    this.errors = {};
    this.clearAllErrors(container);

    // Validar
    const formData = {
      username: container.querySelector('#username').value,
      bio: container.querySelector('#bio').value,
      avatar_url: this.profile.avatar_url // Manter avatar atual
    };

    // Se tem novo avatar, fazer upload
    if (this.selectedAvatarFile) {
      try {
        this.setState(container, 'saving');
        const session = await authService.getSession();
        const avatarUrl = await profileService.uploadAvatar(
          this.supabase,
          session.user.id,
          this.selectedAvatarFile
        );
        formData.avatar_url = avatarUrl;
        this.selectedAvatarFile = null;
      } catch (error) {
        this.showFieldError(container, 'upload', error.message);
        this.setState(container, 'editing');
        return;
      }
    }

    // Validar dados
    const validationErrors = profileService.validateProfileData(formData);
    if (validationErrors) {
      this.errors = validationErrors;
      Object.entries(validationErrors).forEach(([field, msg]) => {
        this.showFieldError(container, field, msg);
      });
      this.setState(container, 'editing');
      return;
    }

    // Salvar
    try {
      this.setState(container, 'saving');
      const session = await authService.getSession();

      this.profile = await profileService.updateProfile(
        this.supabase,
        session.user.id,
        formData
      );

      console.log('✅ Perfil salvo:', this.profile);

      this.setState(container, 'viewing');
      this.showSuccessMessage(container);
      this.updateUI(container, 'viewing');
      this.renderProfile(container);

    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      const errorMsg = error.message || 'Erro ao salvar perfil';
      container.querySelector('#generalError').textContent = errorMsg;
      container.querySelector('#generalError').style.display = 'block';
      this.setState(container, 'editing');
    }
  }

  /**
   * Atualizar UI baseado no estado
   */
  updateUI(container, state) {
    const editBtn = container.querySelector('#editBtn');
    const saveBtn = container.querySelector('#saveBtn');
    const cancelBtn = container.querySelector('#cancelBtn');
    const uploadDiv = container.querySelector('#avatarUploadDiv');

    const usernameField = container.querySelector('#username');
    const bioField = container.querySelector('#bio');

    if (state === 'viewing') {
      editBtn.style.display = 'block';
      saveBtn.style.display = 'none';
      cancelBtn.style.display = 'none';
      uploadDiv.style.display = 'none';

      usernameField.disabled = true;
      bioField.disabled = true;
    } else if (state === 'editing') {
      editBtn.style.display = 'none';
      saveBtn.style.display = 'block';
      cancelBtn.style.display = 'block';
      uploadDiv.style.display = 'block';

      usernameField.disabled = false;
      bioField.disabled = false;
      usernameField.focus();
    } else if (state === 'saving') {
      saveBtn.disabled = true;
      cancelBtn.disabled = true;
      const loader = saveBtn.querySelector('.btn-loader');
      const text = saveBtn.querySelector('.btn-text');
      if (text) text.style.display = 'none';
      if (loader) loader.style.display = 'inline';
    }
  }

  /**
   * Mostrar mensagem de sucesso
   */
  showSuccessMessage(container) {
    const successMsg = container.querySelector('#successMessage');
    successMsg.style.display = 'block';
    setTimeout(() => {
      successMsg.style.display = 'none';
    }, 3000);
  }

  /**
   * Mostrar erro em campo (accessible)
   */
  showFieldError(container, field, message) {
    const errorDiv = container.querySelector(`#${field}Error`);
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      errorDiv.setAttribute('role', 'alert');
      errorDiv.setAttribute('aria-live', 'polite');
      
      // Marcar campo como inválido
      const input = container.querySelector(`#${field}`);
      if (input) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', `${field}Error`);
      }
    }
  }

  /**
   * Limpar erro em campo
   */
  clearFieldError(container, field) {
    const errorDiv = container.querySelector(`#${field}Error`);
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
  }

  /**
   * Limpar todos os erros
   */
  clearAllErrors(container) {
    container.querySelectorAll('.field-error, .general-error').forEach(el => {
      el.style.display = 'none';
    });
  }

  /**
   * Mostrar erro (accessible)
   */
  showError(container, message) {
    const errorMsg = container.querySelector('#errorMessage');
    errorMsg.textContent = message;
    errorMsg.setAttribute('role', 'alert');
    errorMsg.setAttribute('aria-live', 'polite');
  }

  /**
   * Mudar estado
   */
  setState(container, newState) {
    this.state = newState;
    if (newState === 'loading') {
      this.showLoadingState(container);
    } else if (newState === 'error') {
      this.showErrorState(container);
    } else if (newState === 'viewing' || newState === 'editing' || newState === 'saving') {
      this.showDataState(container);
    }
  }

  /**
   * Mostrar loading
   */
  showLoadingState(container) {
    container.querySelector('#loadingState').style.display = 'flex';
    container.querySelector('#errorState').style.display = 'none';
    container.querySelector('#dataState').style.display = 'none';
  }

  /**
   * Mostrar erro
   */
  showErrorState(container) {
    container.querySelector('#loadingState').style.display = 'none';
    container.querySelector('#errorState').style.display = 'flex';
    container.querySelector('#dataState').style.display = 'none';
  }

  /**
   * Mostrar dados
   */
  showDataState(container) {
    container.querySelector('#loadingState').style.display = 'none';
    container.querySelector('#errorState').style.display = 'none';
    container.querySelector('#dataState').style.display = 'block';
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
    if (!document.querySelector('style[data-page="profile"]')) {
      const style = document.createElement('style');
      style.setAttribute('data-page', 'profile');
      style.textContent = `
        .profile-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        .profile-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg, 1.5rem);
          background: rgba(0, 255, 204, 0.05);
          border-bottom: 1px solid rgba(0, 255, 204, 0.1);
        }

        .profile-title {
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

        .profile-content {
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

        .profile-container {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg, 1.5rem);
        }

        .avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md, 1rem);
          padding: var(--spacing-lg, 1.5rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-md, 0.5rem);
        }

        .avatar-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm, 0.5rem);
        }

        .avatar-image {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(0, 255, 204, 0.1);
          border: 2px solid rgba(0, 255, 204, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          overflow: hidden;
        }

        .avatar-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-status {
          color: var(--text-secondary, #b0b0b0);
          font-size: 0.875rem;
          margin: 0;
        }

        .avatar-upload {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm, 0.5rem);
        }

        .upload-btn {
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

        .upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(0, 255, 204, 0.3);
        }

        .upload-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-section {
          padding: var(--spacing-lg, 1.5rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-md, 0.5rem);
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md, 1rem);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm, 0.5rem);
        }

        .form-label {
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 600;
          font-size: 0.95rem;
        }

        .form-input,
        .form-textarea {
          padding: var(--spacing-sm, 0.5rem);
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-md, 0.5rem);
          color: var(--text-primary, #fff);
          font-family: var(--font-secondary, Arial);
          font-size: 0.95rem;
          transition: var(--transition-normal, 0.3s);
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--primary-cyan, #00ffcc);
          box-shadow: 0 0 15px rgba(0, 255, 204, 0.2);
          background: rgba(0, 255, 204, 0.05);
        }

        .form-input:disabled {
          background: rgba(0, 0, 0, 0.1);
          color: var(--text-secondary, #b0b0b0);
          cursor: not-allowed;
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .bio-counter {
          font-size: 0.8rem;
          color: var(--text-secondary, #b0b0b0);
          text-align: right;
        }

        .field-error {
          color: #ff6b6b;
          font-size: 0.85rem;
          font-family: var(--font-secondary, Arial);
          display: none;
        }

        .general-error {
          padding: var(--spacing-md, 1rem);
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: var(--border-radius-md, 0.5rem);
          color: #ff6b6b;
          text-align: center;
          display: none;
        }

        .success-message {
          padding: var(--spacing-md, 1rem);
          background: rgba(0, 255, 102, 0.1);
          border: 1px solid rgba(0, 255, 102, 0.3);
          border-radius: var(--border-radius-md, 0.5rem);
          color: #00ff66;
          text-align: center;
          display: none;
        }

        .form-actions {
          display: flex;
          gap: var(--spacing-md, 1rem);
          justify-content: flex-end;
          margin-top: var(--spacing-md, 1rem);
        }

        .btn {
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
          border: none;
          border-radius: var(--border-radius-md, 0.5rem);
          cursor: pointer;
          font-family: var(--font-primary, Arial);
          font-weight: 600;
          transition: var(--transition-normal, 0.3s);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 0.5rem);
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary-cyan, #00ffcc), var(--secondary-blue, #0099ff));
          color: #000;
        }

        .btn-success {
          background: rgba(0, 255, 102, 0.2);
          border: 1px solid rgba(0, 255, 102, 0.4);
          color: #00ff66;
        }

        .btn-secondary {
          background: rgba(255, 107, 107, 0.2);
          border: 1px solid rgba(255, 107, 107, 0.4);
          color: #ff6b6b;
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(0, 255, 204, 0.2);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-loader {
          display: none;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            gap: var(--spacing-md, 1rem);
            align-items: flex-start;
          }

          .profile-content {
            padding: var(--spacing-md, 1rem);
          }

          .form-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
}
