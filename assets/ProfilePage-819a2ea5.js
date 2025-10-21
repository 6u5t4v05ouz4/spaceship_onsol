import{g as p,n as m}from"./main-eea56608.js";import{e as f,H as v}from"./HeaderNavigation-4f1c9bdf.js";import"./phaser-aaa04cbd.js";async function b(s,e){try{const{data:r,error:a}=await s.from("user_profiles").select("*").eq("google_email",e).single();if(a&&a.code!=="PGRST116")throw new Error("Erro ao buscar perfil: "+a.message);return r||{id:e,username:"Usuário",bio:"",avatar_url:null,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}}catch(r){throw console.error("❌ Erro em getProfile:",r),r}}function u(s){const e={};return!s.username||s.username.trim().length===0?e.username="Username é obrigatório":s.username.trim().length<3?e.username="Username deve ter pelo menos 3 caracteres":s.username.length>50?e.username="Username não pode exceder 50 caracteres":/^[a-zA-Z0-9_]+$/.test(s.username)||(e.username="Username pode conter apenas letras, números e underscore"),s.bio&&s.bio.length>500&&(e.bio="Bio não pode exceder 500 caracteres"),Object.keys(e).length>0?e:null}async function y(s,e,r){var a;try{const t=u(r);if(t){const n=Object.entries(t).map(([d,c])=>`${d}: ${c}`).join("; ");throw new Error(n)}const o={username:r.username.trim(),bio:((a=r.bio)==null?void 0:a.trim())||null,updated_at:new Date().toISOString()};r.avatar_url&&(o.avatar_url=r.avatar_url);const{data:l,error:i}=await s.from("user_profiles").update(o).eq("google_email",e).select().single();if(i)throw new Error("Erro ao salvar perfil: "+i.message);return console.log("✅ Perfil atualizado:",l),l}catch(t){throw console.error("❌ Erro em updateProfile:",t),t}}async function h(s,e,r){try{const a=g(r);if(a)throw new Error(a);const t=e.split("@")[0].replace(/[^a-zA-Z0-9]/g,"_"),o=r.name.split(".").pop(),l=`${t}-${Date.now()}.${o}`;console.log("📤 Upload de avatar:",l);const{error:i}=await s.storage.from("avatars").upload(l,r,{upsert:!0});if(i)throw new Error("Erro ao fazer upload: "+i.message);const{data:n}=s.storage.from("avatars").getPublicUrl(l);return console.log("✅ Avatar uploadado:",n.publicUrl),n.publicUrl}catch(a){throw console.error("❌ Erro em uploadAvatar:",a),a}}function g(s){const r=["image/jpeg","image/png","image/webp"];return s?s.size>5242880?`Arquivo muito grande. Máximo: 5MB (seu arquivo: ${(s.size/1024/1024).toFixed(2)}MB)`:r.includes(s.type)?null:"Formato não suportado. Use: JPG, PNG ou WebP":"Arquivo não selecionado"}class E{constructor(e){this.name="ProfilePage",this.supabase=e,this.state="loading",this.profile={},this.errors={},this.selectedAvatarFile=null,this.avatarPreview=null}render(){const e=document.createElement("div");return e.className="profile-page",e.innerHTML=`
      <div class="background-primary"></div>
      <div class="stars-background"></div>

      <!-- Global Navigation Header -->
      <div id="globalHeader"></div>

      <div class="profile-wrapper">

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
    `,this.addStyles(),this.renderGlobalHeader(e),this.loadProfile(e),this.setupEventListeners(e),e}renderGlobalHeader(e){const r=e.querySelector("#globalHeader");if(r){const t=new v().render();r.appendChild(t)}}async loadProfile(e){var r,a,t;this.setState(e,"loading");try{const o=await p();if(!o){this.setState(e,"error"),this.showError(e,"Sessão expirada. Faça login novamente."),setTimeout(()=>m("/login"),1500);return}const l=o.user.email,i=o.user;console.log("👤 Carregando perfil para:",l),console.log("🔍 Ensuring user data is initialized..."),await f(this.supabase,l,i),this.profile=await b(this.supabase,l),this.profile.google_name=((r=i.user_metadata)==null?void 0:r.name)||((a=i.email)==null?void 0:a.split("@")[0])||"Usuário",this.profile.google_email=i.email,this.profile.google_picture=(t=i.user_metadata)==null?void 0:t.picture,this.profile.display_name=this.profile.display_name||this.profile.google_name,this.profile.username=this.profile.username||this.profile.google_name,this.profile.avatar_url=this.profile.avatar_url||this.profile.google_picture,console.log("✅ Perfil carregado com dados Google:",this.profile),this.setState(e,"viewing"),this.renderProfile(e)}catch(o){console.error("❌ Erro ao carregar perfil:",o),this.setState(e,"error"),this.showError(e,o.message)}}renderProfile(e){e.querySelector("#username").value=this.profile.username||this.profile.google_name||"",e.querySelector("#email").value=this.profile.google_email||"",e.querySelector("#bio").value=this.profile.bio||"",e.querySelector("#bioCounter").textContent=(this.profile.bio||"").length;const r=this.profile.avatar_url||this.profile.google_picture;if(r){const a=e.querySelector("#avatarPreview");a.innerHTML=`<img src="${r}" alt="Avatar">`,e.querySelector("#avatarStatus").textContent=this.profile.avatar_url?"✅ Avatar personalizado":"✅ Avatar do Google"}else e.querySelector("#avatarStatus").textContent="👤 Sem avatar";this.updateUI(e,"viewing")}setupEventListeners(e){const r=e.querySelector("#retryBtn");r&&r.addEventListener("click",()=>{this.loadProfile(e)});const a=e.querySelector("#editBtn"),t=e.querySelector("#saveBtn"),o=e.querySelector("#cancelBtn");a&&a.addEventListener("click",()=>{this.setState(e,"editing"),this.updateUI(e,"editing")}),t&&t.addEventListener("click",d=>{d.preventDefault(),this.handleSave(e)}),o&&o.addEventListener("click",()=>{this.setState(e,"viewing"),this.renderProfile(e),this.updateUI(e,"viewing")});const l=e.querySelector("#uploadBtn"),i=e.querySelector("#avatarInput");l&&l.addEventListener("click",()=>{i.click()}),i&&i.addEventListener("change",d=>{this.handleAvatarSelect(d,e)});const n=e.querySelector("#bio");n&&n.addEventListener("input",d=>{e.querySelector("#bioCounter").textContent=d.target.value.length}),e.querySelector("#username").addEventListener("input",()=>{this.clearFieldError(e,"username")}),e.querySelector("#bio").addEventListener("input",()=>{this.clearFieldError(e,"bio")})}handleAvatarSelect(e,r){const a=e.target.files[0],t=r.querySelector("#uploadError");if(!a)return;const o=g(a);if(o){t.textContent=o,t.style.display="block";return}t.style.display="none";const l=new FileReader;l.onload=i=>{const n=r.querySelector("#avatarPreview");n.innerHTML=`<img src="${i.target.result}" alt="Preview">`,this.selectedAvatarFile=a,r.querySelector("#avatarStatus").textContent="📤 Pronto para upload"},l.readAsDataURL(a)}async handleSave(e){this.errors={},this.clearAllErrors(e);const r={username:e.querySelector("#username").value,bio:e.querySelector("#bio").value,avatar_url:this.profile.avatar_url};if(this.selectedAvatarFile)try{this.setState(e,"saving");const t=await p(),o=await h(this.supabase,t.user.email,this.selectedAvatarFile);r.avatar_url=o,this.selectedAvatarFile=null}catch(t){this.showFieldError(e,"upload",t.message),this.setState(e,"editing");return}const a=u(r);if(a){this.errors=a,Object.entries(a).forEach(([t,o])=>{this.showFieldError(e,t,o)}),this.setState(e,"editing");return}try{this.setState(e,"saving");const t=await p();this.profile=await y(this.supabase,t.user.email,r),console.log("✅ Perfil salvo:",this.profile),this.setState(e,"viewing"),this.showSuccessMessage(e),this.updateUI(e,"viewing"),this.renderProfile(e)}catch(t){console.error("❌ Erro ao salvar:",t);const o=t.message||"Erro ao salvar perfil";e.querySelector("#generalError").textContent=o,e.querySelector("#generalError").style.display="block",this.setState(e,"editing")}}updateUI(e,r){const a=e.querySelector("#editBtn"),t=e.querySelector("#saveBtn"),o=e.querySelector("#cancelBtn"),l=e.querySelector("#avatarUploadDiv"),i=e.querySelector("#username"),n=e.querySelector("#bio");if(r==="viewing")a.style.display="block",t.style.display="none",o.style.display="none",l.style.display="none",i.disabled=!0,n.disabled=!0;else if(r==="editing")a.style.display="none",t.style.display="block",o.style.display="block",l.style.display="block",i.disabled=!1,n.disabled=!1,i.focus();else if(r==="saving"){t.disabled=!0,o.disabled=!0;const d=t.querySelector(".btn-loader"),c=t.querySelector(".btn-text");c&&(c.style.display="none"),d&&(d.style.display="inline")}}showSuccessMessage(e){const r=e.querySelector("#successMessage");r.style.display="block",setTimeout(()=>{r.style.display="none"},3e3)}showFieldError(e,r,a){const t=e.querySelector(`#${r}Error`);if(t){t.textContent=a,t.style.display="block",t.setAttribute("role","alert"),t.setAttribute("aria-live","polite");const o=e.querySelector(`#${r}`);o&&(o.setAttribute("aria-invalid","true"),o.setAttribute("aria-describedby",`${r}Error`))}}clearFieldError(e,r){const a=e.querySelector(`#${r}Error`);a&&(a.style.display="none")}clearAllErrors(e){e.querySelectorAll(".field-error, .general-error").forEach(r=>{r.style.display="none"})}showError(e,r){const a=e.querySelector("#errorMessage");a.textContent=r,a.setAttribute("role","alert"),a.setAttribute("aria-live","polite")}setState(e,r){this.state=r,r==="loading"?this.showLoadingState(e):r==="error"?this.showErrorState(e):(r==="viewing"||r==="editing"||r==="saving")&&this.showDataState(e)}showLoadingState(e){e.querySelector("#loadingState").style.display="flex",e.querySelector("#errorState").style.display="none",e.querySelector("#dataState").style.display="none"}showErrorState(e){e.querySelector("#loadingState").style.display="none",e.querySelector("#errorState").style.display="flex",e.querySelector("#dataState").style.display="none"}showDataState(e){e.querySelector("#loadingState").style.display="none",e.querySelector("#errorState").style.display="none",e.querySelector("#dataState").style.display="block"}addStyles(){if(!document.querySelector('style[data-page="profile"]')){const e=document.createElement("style");e.setAttribute("data-page","profile"),e.textContent=`
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
          padding-top: 80px; /* Espaço para o header global */
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
      `,document.head.appendChild(e)}}}export{E as default};
