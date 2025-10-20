import{g as i,h as s,n as c}from"./main-ae15378b.js";import"./phaser-23102255.js";class p{constructor(){this.name="AuthCallbackPage",this.isProcessing=!1}render(){const e=document.createElement("div");return e.className="auth-callback-page",e.innerHTML=`
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
    `,this.addStyles(),this.processCallback(e),e}async processCallback(e){if(!this.isProcessing){this.isProcessing=!0;try{const r=new URLSearchParams(window.location.search),a=r.get("error"),o=r.get("error_description"),n=r.get("code");if(console.log("🔐 OAuth Callback params:",{error:a,code:n?"***":void 0}),a){const t=this.translateOAuthError(a,o);this.showError(e,t);return}if(console.log("🔐 Verificando sessão com Supabase..."),await new Promise(t=>setTimeout(t,500)),!await i())if(n){console.log("🔐 Trocando código por sessão...");try{if(!await s())throw new Error("Falha ao processar autenticação")}catch(t){console.error("❌ Erro ao trocar código:",t),this.showError(e,"Código de autenticação expirado. Tente novamente.");return}}else{this.showError(e,"Código de autenticação não encontrado. Tente fazer login novamente.");return}console.log("✅ Sessão estabelecida! Redirecionando para dashboard..."),window.history.replaceState({},document.title,window.location.pathname),setTimeout(()=>{c("/dashboard")},500)}catch(r){console.error("❌ Erro no callback:",r),this.showError(e,r.message)}}}translateOAuthError(e,r){const o={access_denied:"Você recusou a permissão. Tente fazer login novamente.",invalid_client:"Erro na configuração do provedor. Contate o suporte.",invalid_grant:"Código de autenticação expirado ou inválido. Tente novamente.",invalid_scope:"Escopo de permissão inválido. Contate o suporte.",server_error:"Erro no servidor de autenticação. Tente novamente em alguns momentos.",temporarily_unavailable:"Serviço temporariamente indisponível. Tente novamente."}[e]||`Erro: ${e}`;return r?`${o} (${r})`:o}showError(e,r){const a=e.querySelector("#loadingState"),o=e.querySelector("#errorState"),n=e.querySelector("#errorMessage");a.style.display="none",o.style.display="block",n.textContent=r,console.error("❌ Erro exibido:",r)}addStyles(){if(!document.querySelector('style[data-page="auth-callback"]')){const e=document.createElement("style");e.setAttribute("data-page","auth-callback"),e.textContent=`
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
      `,document.head.appendChild(e)}}}export{p as default};
