import{s as n}from"./main-ff34a048.js";import"./phaser-aaa04cbd.js";class l{constructor(){this.name="LoginPage",this.isLoading=!1}render(){const a=document.createElement("div");return a.className="login-page",a.innerHTML=`
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
            <!-- Error Message -->
            <div id="errorMessage" class="error-message" role="alert" aria-live="polite" style="display: none;"></div>

            <!-- OAuth Button (Only) -->
            <button id="oauthBtn" class="login-btn login-btn-google" type="button" aria-label="Fazer login com conta do Google">
              <svg class="google-icon" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="btn-text">Sign in with Google</span>
              <span class="btn-loader" style="display: none;" role="status" aria-label="Carregando">⏳</span>
            </button>

            <!-- Footer -->
            <p class="login-footer-text">
              Faça login com sua conta Google para continuar
            </p>
          </div>
        </div>
      </div>
    `,this.addStyles(),this.attachListeners(a),this.setupFormValidation(a),a}attachListeners(a){a.querySelector("#oauthBtn").addEventListener("click",()=>{this.handleOAuthLogin(a)})}setupFormValidation(a){}async handleOAuthLogin(a){const r=a.querySelector("#oauthBtn"),e=a.querySelector("#errorMessage");e.style.display="none",this.setLoading(r,!0);try{console.log("🔐 Iniciando OAuth com Google...");const t=await n("google");console.log("✅ OAuth iniciado, redirecionando...",t),t!=null&&t.url&&(window.location.href=t.url)}catch(t){console.error("❌ Erro no OAuth:",t),this.showError(e,t.message),this.setLoading(r,!1)}}showError(a,r){a.textContent=r,a.style.display="block",a.setAttribute("role","alert"),a.setAttribute("aria-live","polite"),console.error("❌ Erro exibido:",r);const e=document.createElement("div");e.className="sr-only",e.setAttribute("role","status"),e.setAttribute("aria-live","polite"),e.textContent=`Erro: ${r}`,document.body.appendChild(e),setTimeout(()=>e.remove(),1e3)}setLoading(a,r){const e=a.querySelector(".btn-text"),t=a.querySelector(".btn-loader");r?(a.disabled=!0,e&&(e.style.display="none"),t&&(t.style.display="inline"),this.isLoading=!0):(a.disabled=!1,e&&(e.style.display="inline"),t&&(t.style.display="none"),this.isLoading=!1)}addStyles(){if(!document.querySelector('style[data-page="login"]')){const a=document.createElement("style");a.setAttribute("data-page","login"),a.textContent=`
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

        .login-btn-google {
          background: #ffffff;
          border: 1px solid #dadce0;
          color: #3c4043;
          font-weight: 500;
          font-size: var(--text-sm, 0.875rem);
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
          min-height: 40px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .login-btn-google:not(:disabled):hover {
          background: #f8f9fa;
          border-color: #c4c7c5;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        .login-btn-google .google-icon {
          margin-right: var(--spacing-sm, 0.5rem);
          flex-shrink: 0;
        }

        .login-btn-google .btn-text {
          flex-grow: 1;
          text-align: center;
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
      `,document.head.appendChild(a)}}}export{l as default};
