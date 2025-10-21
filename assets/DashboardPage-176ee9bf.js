import{n as g,g as f}from"./main-a44d32c9.js";import{e as y,H as x}from"./HeaderNavigation-af12f384.js";import"./phaser-aaa04cbd.js";class C{constructor(a){this.name="DashboardPage",this.supabase=a,this.data={profile:null,gameData:null,inventory:[],ships:[],achievements:[]}}render(){const a=document.createElement("div");a.className="dashboard-page",a.innerHTML=`
      <div class="background-primary"></div>
      <div class="stars-background"></div>

      <!-- Global Navigation Header -->
      <div id="globalHeader"></div>

      <div class="dashboard-wrapper">

        <!-- Content -->
        <div class="dashboard-content">
          <!-- Loading State -->
          <div id="loadingState" class="loading-state">
            <div class="spinner">⏳</div>
            <p>Carregando dados...</p>
          </div>

          <!-- Error State -->
          <div id="errorState" class="error-state" role="alert" aria-live="polite" style="display: none;">
            <div class="error-icon" role="img" aria-label="Erro">❌</div>
            <p class="error-message" id="errorMessage"></p>
            <button id="retryBtn" class="retry-btn" aria-label="Tentar carregar dados novamente">
              <span role="img" aria-label="Recarregar">🔄</span> Tentar Novamente
            </button>
          </div>

          <!-- Data State -->
          <div id="dataState" class="data-state" style="display: none;">
            <!-- User Profile & Ship Display -->
            <div class="profile-ship-container">
              <!-- User Profile -->
              <section class="profile-section">
                <div class="profile-card">
                  <div id="profileAvatar" class="profile-avatar">👤</div>
                  <div class="profile-info">
                    <h2 id="username" class="profile-username"></h2>
                    <p id="userEmail" class="profile-email"></p>
                  </div>
                </div>
              </section>

              <!-- Ship Display -->
              <section class="ship-display-section">
                <h3 class="section-title">
                  <span role="img" aria-label="Nave">🚀</span> Sua Nave
                </h3>
                <div class="ship-display-card">
                  <div class="ship-visual">
                    <canvas id="shipCanvas" width="128" height="64"></canvas>
                  </div>
                  <div class="ship-info">
                    <h4 id="shipName" class="ship-name">Space Miner Comum</h4>
                    <div id="shipRarity" class="ship-rarity">Comum</div>
                    <div class="ship-stats">
                      <div class="ship-stat">
                        <span class="ship-stat-icon">⚡</span>
                        <span class="ship-stat-label">Velocidade:</span>
                        <span id="shipSpeed" class="ship-stat-value">100</span>
                      </div>
                      <div class="ship-stat">
                        <span class="ship-stat-icon">📦</span>
                        <span class="ship-stat-label">Carga:</span>
                        <span id="shipCargo" class="ship-stat-value">50</span>
                      </div>
                      <div class="ship-stat">
                        <span class="ship-stat-icon">⛽</span>
                        <span class="ship-stat-label">Combustível:</span>
                        <span id="shipFuel" class="ship-stat-value">100</span>
                      </div>
                      <div class="ship-stat">
                        <span class="ship-stat-icon">🛡️</span>
                        <span class="ship-stat-label">Escudo:</span>
                        <span id="shipShield" class="ship-stat-value">100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <!-- Stats Grid -->
            <section class="stats-section">
              <h3 class="section-title">
                <span role="img" aria-label="Estatísticas">📊</span> Estatísticas de Jogo
              </h3>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">🎮</div>
                  <div class="stat-label">Sessões</div>
                  <div class="stat-value" id="sessionsCount">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">⏱️</div>
                  <div class="stat-label">Tempo Jogado</div>
                  <div class="stat-value" id="playTime">0h</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🌍</div>
                  <div class="stat-label">Planetas</div>
                  <div class="stat-value" id="planetsDiscovered">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">⛏️</div>
                  <div class="stat-label">Minerações</div>
                  <div class="stat-value" id="miningSessions">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">⚔️</div>
                  <div class="stat-label">Batalhas</div>
                  <div class="stat-value" id="totalBattles">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🏆</div>
                  <div class="stat-label">Vitórias</div>
                  <div class="stat-value" id="battlesWon">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🔨</div>
                  <div class="stat-label">Itens Criados</div>
                  <div class="stat-value" id="itemsCrafted">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🚀</div>
                  <div class="stat-label">Distância</div>
                  <div class="stat-value" id="distanceTraveled">0 km</div>
                </div>
              </div>
            </section>

            <!-- Wallet Section -->
            <section class="wallet-section">
              <h3 class="section-title">
                <span role="img" aria-label="Carteira">💰</span> Carteira
              </h3>
              <div class="wallet-grid">
                <div class="wallet-card space-tokens">
                  <div class="wallet-icon">🪙</div>
                  <div class="wallet-info">
                    <div class="wallet-label">Space Tokens</div>
                    <div class="wallet-value" id="spaceTokens">0</div>
                    <div class="wallet-description">Moeda do jogo</div>
                  </div>
                </div>
                <div class="wallet-card sol-tokens">
                  <div class="wallet-icon">◎</div>
                  <div class="wallet-info">
                    <div class="wallet-label">SOL Tokens</div>
                    <div class="wallet-value" id="solTokens">0.00</div>
                    <div class="wallet-description">Blockchain Solana</div>
                  </div>
                </div>
                <div class="wallet-card total-earned">
                  <div class="wallet-icon">💎</div>
                  <div class="wallet-info">
                    <div class="wallet-label">Total Ganho</div>
                    <div class="wallet-value" id="totalEarned">0</div>
                    <div class="wallet-description">Tokens acumulados</div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Inventory Section -->
            <section class="inventory-section">
              <h3 class="section-title">
                <span role="img" aria-label="Inventário">🎒</span> Inventário de Recursos
              </h3>
              <div id="inventoryGrid" class="inventory-grid">
                <p class="empty-message">Inventário vazio - Comece a minerar!</p>
              </div>
            </section>

            <!-- Quick Actions Section -->
            <section class="actions-section">
              <h3 class="section-title">
                <span role="img" aria-label="Ações">🎮</span> Ações Rápidas
              </h3>
              <div class="actions-grid">
                <button class="action-btn multiplayer-btn" id="multiplayerBtn" title="Entrar no mundo multiplayer compartilhado">
                  <div class="action-icon">🌐</div>
                  <div class="action-content">
                    <div class="action-title">MULTIPLAYER</div>
                    <div class="action-description">Jogue com outros jogadores</div>
                  </div>
                  <div class="action-arrow">→</div>
                </button>
                <button class="action-btn solo-btn" id="soloBtn" title="Jogar modo solo">
                  <div class="action-icon">🚀</div>
                  <div class="action-content">
                    <div class="action-title">MODO SOLO</div>
                    <div class="action-description">Jogue individualmente</div>
                  </div>
                  <div class="action-arrow">→</div>
                </button>
              </div>
            </section>

            <!-- Recent Activity Section -->
            <section class="activity-section">
              <h3 class="section-title">
                <span role="img" aria-label="Atividade">📜</span> Atividade Recente
              </h3>
              <div id="recentActivity" class="activity-list">
                <p class="empty-message">Nenhuma atividade recente</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    `,this.addStyles(),this.renderGlobalHeader(a),this.loadData(a);const r=a.querySelector("#retryBtn");r&&r.addEventListener("click",()=>{this.loadData(a)});const e=a.querySelector("#multiplayerBtn");e&&e.addEventListener("click",()=>{g("/multiplayer")});const i=a.querySelector("#soloBtn");return i&&i.addEventListener("click",()=>{window.location.href="/game.html"}),a}renderGlobalHeader(a){const r=a.querySelector("#globalHeader");if(r){console.log("🔍 DashboardPage: Renderizando header global...");const i=new x().render();r.appendChild(i),console.log("✅ Header global renderizado:",i)}else console.error("❌ Container #globalHeader não encontrado!")}async loadData(a){var r,e,i;this.showLoading(a);try{const t=await f();if(!t){this.showError(a,"Sessão expirada. Faça login novamente."),setTimeout(()=>g("/login"),1500);return}const s=t.user.id,o=t.user.email,d=t.user;console.log("📊 Carregando dados para usuário:",o),console.log("🔍 Ensuring user data is initialized..."),await y(this.supabase,o,d);const c=await this.fetchProfile(o);this.data.profile=c,this.data.profile.google_name||(this.data.profile.google_name=((r=d.user_metadata)==null?void 0:r.name)||((e=d.email)==null?void 0:e.split("@")[0])||"Usuário",this.data.profile.google_email=d.email,this.data.profile.google_picture=(i=d.user_metadata)==null?void 0:i.picture,this.data.profile.display_name=this.data.profile.display_name||this.data.profile.google_name);const n=await this.fetchPlayerStats(s);this.data.gameData=n||{};const p=await this.fetchInventory(s);this.data.inventory=p||[];const l=await this.fetchShips(s);this.data.ships=l||[],console.log("✅ Dados carregados:",this.data),this.hideLoading(a),this.renderData(a)}catch(t){console.error("❌ Erro ao carregar dados:",t),this.showError(a,t.message)}}async renderShipDisplay(a){var r,e;try{const i=a.querySelector("#shipCanvas");if(!i)return;const t=i.getContext("2d"),s=((r=this.data.profile)==null?void 0:r.ship_type)||"default_idle",o=((e=this.data.profile)==null?void 0:e.ship_rarity)||"Comum";console.log("🚀 Renderizando nave do usuário:",{userShipType:s,userShipRarity:o});const d={Comum:{speed:100,cargo:50,fuel:100,shield:100,color:"#CCCCCC",name:"Space Miner Comum"},Incomum:{speed:200,cargo:100,fuel:150,shield:200,color:"#00FF00",name:"Space Miner Incomum"},Raro:{speed:300,cargo:150,fuel:200,shield:300,color:"#0080FF",name:"Space Miner Raro"},Épico:{speed:400,cargo:175,fuel:250,shield:400,color:"#8000FF",name:"Space Miner Épico"},Lendário:{speed:500,cargo:200,fuel:300,shield:500,color:"#FF8000",name:"Space Miner Lendário"}},c=o,n=d[c],p={default_idle:"/assets/images/idle.png",nft_custom:"/assets/images/nft_ship.png"},l=new Image;l.crossOrigin="anonymous",l.src=p[s]||p.default_idle,await new Promise((v,h)=>{l.onload=()=>{t.clearRect(0,0,i.width,i.height),t.fillStyle="#0a0a1a",t.fillRect(0,0,i.width,i.height),t.strokeStyle=n.color,t.lineWidth=2,t.strokeRect(1,1,i.width-2,i.height-2);const m=1,b=(i.width-l.width*m)/2,u=(i.height-l.height*m)/2;t.drawImage(l,b,u,l.width*m,l.height*m),v()},l.onerror=h}),a.querySelector("#shipName").textContent=n.name,a.querySelector("#shipRarity").textContent=c,a.querySelector("#shipRarity").style.color=n.color,a.querySelector("#shipSpeed").textContent=n.speed,a.querySelector("#shipCargo").textContent=n.cargo,a.querySelector("#shipFuel").textContent=n.fuel,a.querySelector("#shipShield").textContent=n.shield,console.log("✅ Nave renderizada no dashboard:",c)}catch(i){console.error("❌ Erro ao renderizar nave:",i);const t=a.querySelector("#shipCanvas");if(t){const s=t.getContext("2d");s.fillStyle="#0a0a1a",s.fillRect(0,0,t.width,t.height),s.fillStyle="#00ffcc",s.font="20px Arial",s.textAlign="center",s.fillText("🚀",t.width/2,t.height/2+7)}}}async fetchProfile(a){var o,d,c;const r=await f(),e=r==null?void 0:r.user,{data:i,error:t}=await this.supabase.from("user_profiles").select("*").eq("google_email",e==null?void 0:e.email).single();if(t&&t.code!=="PGRST116")throw new Error("Erro ao carregar perfil: "+t.message);const s=i||{id:a};return e&&(s.google_name=((o=e.user_metadata)==null?void 0:o.name)||((d=e.email)==null?void 0:d.split("@")[0])||"Usuário",s.google_email=e.email,s.google_picture=(c=e.user_metadata)==null?void 0:c.picture,s.display_name=s.display_name||s.google_name,s.avatar_url=s.avatar_url||s.google_picture),s}async fetchPlayerStats(a){const{data:r,error:e}=await this.supabase.from("player_stats").select("*").eq("user_id",a).single();return e&&e.code!=="PGRST116"?(console.warn("Aviso ao carregar player stats:",e.message),null):r}async fetchInventory(a){const{data:r,error:e}=await this.supabase.from("player_inventory").select("*").eq("user_id",a);return e&&e.code!=="PGRST116"?(console.warn("Aviso ao carregar inventory:",e.message),[]):r||[]}async fetchShips(a){const{data:r,error:e}=await this.supabase.from("player_wallet").select("*").eq("user_id",a);return e&&e.code!=="PGRST116"?(console.warn("Aviso ao carregar ships:",e.message),[]):r||[]}renderData(a){const r=a.querySelector("#dataState");if(r.style.display="block",this.data.profile){const n=this.data.profile.google_name||this.data.profile.display_name||"Usuário",p=this.data.profile.google_email||"email@exemplo.com",l=this.data.profile.google_picture||this.data.profile.avatar_url;a.querySelector("#username").textContent=n,a.querySelector("#userEmail").textContent=p;const v=a.querySelector("#profileAvatar");l?v.innerHTML=`<img src="${l}" alt="Avatar" class="google-avatar" />`:v.textContent="👤"}this.renderShipDisplay(a);const e=this.data.gameData||{};a.querySelector("#sessionsCount").textContent=e.sessions_count||0;const i=Math.floor((e.total_play_time_seconds||0)/3600),t=Math.floor((e.total_play_time_seconds||0)%3600/60);a.querySelector("#playTime").textContent=i>0?`${i}h ${t}m`:`${t}m`,a.querySelector("#planetsDiscovered").textContent=e.planets_discovered||0,a.querySelector("#miningSessions").textContent=e.total_mining_sessions||0,a.querySelector("#totalBattles").textContent=e.total_battles||0,a.querySelector("#battlesWon").textContent=e.battles_won||0,a.querySelector("#itemsCrafted").textContent=e.total_items_crafted||0;const s=((e.distance_traveled||0)/1e3).toFixed(1);a.querySelector("#distanceTraveled").textContent=`${s} km`;const o=this.data.ships.length>0?this.data.ships[0]:null;a.querySelector("#spaceTokens").textContent=o?(o.space_tokens||0).toLocaleString():"0",a.querySelector("#solTokens").textContent=o?parseFloat(o.sol_tokens||0).toFixed(4):"0.0000",a.querySelector("#totalEarned").textContent=(e.total_tokens_earned||0).toLocaleString();const d=a.querySelector("#inventoryGrid");this.data.inventory.length>0?d.innerHTML=this.data.inventory.map(n=>{var p;return`
        <div class="inventory-item">
          <div class="item-icon">📦</div>
          <div class="item-info">
            <div class="item-name">Recurso #${((p=n.resource_type_id)==null?void 0:p.substring(0,8))||"N/A"}</div>
            <div class="item-quantity">Quantidade: ${n.quantity||0}</div>
          </div>
        </div>
      `}).join(""):d.innerHTML='<p class="empty-message">Inventário vazio - Comece a minerar!</p>';const c=a.querySelector("#recentActivity");e.sessions_count>0?c.innerHTML=`
        <div class="activity-item">
          <div class="activity-icon">🎮</div>
          <div class="activity-content">
            <div class="activity-title">Sessões de jogo</div>
            <div class="activity-description">Você jogou ${e.sessions_count} ${e.sessions_count===1?"vez":"vezes"}</div>
          </div>
        </div>
        ${e.planets_discovered>0?`
        <div class="activity-item">
          <div class="activity-icon">🌍</div>
          <div class="activity-content">
            <div class="activity-title">Exploração espacial</div>
            <div class="activity-description">Descobriu ${e.planets_discovered} ${e.planets_discovered===1?"planeta":"planetas"}</div>
          </div>
        </div>
        `:""}
        ${e.battles_won>0?`
        <div class="activity-item">
          <div class="activity-icon">⚔️</div>
          <div class="activity-content">
            <div class="activity-title">Combates vencidos</div>
            <div class="activity-description">Venceu ${e.battles_won} ${e.battles_won===1?"batalha":"batalhas"}</div>
          </div>
        </div>
        `:""}
      `:c.innerHTML='<p class="empty-message">Nenhuma atividade recente - Comece a jogar!</p>'}showLoading(a){a.querySelector("#loadingState").style.display="flex",a.querySelector("#errorState").style.display="none",a.querySelector("#dataState").style.display="none"}showError(a,r){a.querySelector("#loadingState").style.display="none";const e=a.querySelector("#errorState");e.style.display="flex",e.setAttribute("role","alert"),e.setAttribute("aria-live","polite");const i=a.querySelector("#errorMessage");i.textContent=r,a.querySelector("#dataState").style.display="none";const t=document.createElement("div");t.className="sr-only",t.setAttribute("role","status"),t.setAttribute("aria-live","polite"),t.textContent=`Erro: ${r}`,document.body.appendChild(t),setTimeout(()=>t.remove(),1e3)}hideLoading(a){a.querySelector("#loadingState").style.display="none"}addStyles(){if(!document.querySelector('style[data-page="dashboard"]')){const a=document.createElement("style");a.setAttribute("data-page","dashboard"),a.textContent=`
        .dashboard-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        .dashboard-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          padding-top: 80px; /* Espaço para o header global */
        }


        .dashboard-content {
          flex: 1;
          padding: var(--spacing-lg, 1.5rem);
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }

        /* Profile & Ship Container */
        .profile-ship-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-lg, 1.5rem);
          margin-bottom: var(--spacing-xl, 2rem);
        }

        /* Ship Display Section */
        .ship-display-section {
          background: rgba(0, 255, 204, 0.05);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-lg, 1rem);
          padding: var(--spacing-lg, 1.5rem);
        }

        .ship-display-card {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md, 1rem);
          margin-top: var(--spacing-md, 1rem);
        }

        .ship-visual {
          display: flex;
          justify-content: center;
          align-items: center;
          background: #0a0a1a;
          border-radius: var(--border-radius-md, 0.5rem);
          padding: var(--spacing-md, 1rem);
          border: 2px solid rgba(0, 255, 204, 0.3);
        }

        #shipCanvas {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
          width: 256px;
          height: 128px;
        }

        .ship-info {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm, 0.5rem);
        }

        .ship-name {
          font-size: var(--text-lg, 1.25rem);
          font-weight: 700;
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          margin: 0;
          text-align: center;
        }

        .ship-rarity {
          font-size: var(--text-base, 1rem);
          font-weight: 600;
          text-align: center;
          padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius-sm, 0.25rem);
          display: inline-block;
          margin: 0 auto;
        }

        .ship-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-sm, 0.5rem);
          margin-top: var(--spacing-sm, 0.5rem);
        }

        .ship-stat {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs, 0.25rem);
          padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.15);
          border-radius: var(--border-radius-sm, 0.25rem);
          font-size: var(--text-sm, 0.875rem);
        }

        .ship-stat-icon {
          font-size: 1rem;
        }

        .ship-stat-label {
          color: var(--text-secondary, #b0b0b0);
          font-weight: 500;
        }

        .ship-stat-value {
          color: var(--primary-cyan, #00ffcc);
          font-weight: 700;
          margin-left: auto;
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

        .profile-section {
          margin-bottom: var(--spacing-xl, 2rem);
        }

        .profile-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-md, 1rem);
          padding: var(--spacing-md, 1rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-md, 0.5rem);
        }

        .profile-avatar {
          font-size: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(0, 255, 204, 0.1);
          border: 2px solid rgba(0, 255, 204, 0.3);
        }

        .google-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .profile-username {
          font-size: 1.25rem;
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 700;
          margin: 0 0 0.25rem 0;
        }

        .profile-email {
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          font-size: 0.875rem;
          margin: 0;
        }


        .section-title {
          font-size: 1.25rem;
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 700;
          margin-bottom: var(--spacing-md, 1rem);
        }

        .stats-section {
          margin-bottom: var(--spacing-xl, 2rem);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--spacing-md, 1rem);
        }

        .stat-card {
          padding: var(--spacing-md, 1rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-md, 0.5rem);
          text-align: center;
          transition: var(--transition-normal, 0.3s);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xs, 0.25rem);
        }

        .stat-card:hover {
          background: rgba(0, 255, 204, 0.12);
          border-color: rgba(0, 255, 204, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(0, 255, 204, 0.2);
        }

        .stat-icon {
          font-size: 2rem;
          margin-bottom: var(--spacing-xs, 0.25rem);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
        }

        .stat-value {
          font-size: 1.75rem;
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 700;
        }

        /* Wallet Section */
        .wallet-section {
          margin-bottom: var(--spacing-xl, 2rem);
        }

        .wallet-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-md, 1rem);
        }

        .wallet-card {
          padding: var(--spacing-lg, 1.5rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-lg, 1rem);
          display: flex;
          align-items: center;
          gap: var(--spacing-md, 1rem);
          transition: var(--transition-normal, 0.3s);
        }

        .wallet-card:hover {
          background: rgba(0, 255, 204, 0.12);
          border-color: rgba(0, 255, 204, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(0, 255, 204, 0.2);
        }

        .wallet-card.space-tokens {
          border-color: rgba(255, 215, 0, 0.3);
          background: rgba(255, 215, 0, 0.05);
        }

        .wallet-card.space-tokens:hover {
          border-color: rgba(255, 215, 0, 0.5);
          background: rgba(255, 215, 0, 0.1);
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
        }

        .wallet-card.sol-tokens {
          border-color: rgba(138, 43, 226, 0.3);
          background: rgba(138, 43, 226, 0.05);
        }

        .wallet-card.sol-tokens:hover {
          border-color: rgba(138, 43, 226, 0.5);
          background: rgba(138, 43, 226, 0.1);
          box-shadow: 0 0 20px rgba(138, 43, 226, 0.2);
        }

        .wallet-card.total-earned {
          border-color: rgba(0, 255, 255, 0.3);
          background: rgba(0, 255, 255, 0.05);
        }

        .wallet-card.total-earned:hover {
          border-color: rgba(0, 255, 255, 0.5);
          background: rgba(0, 255, 255, 0.1);
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
        }

        .wallet-icon {
          font-size: 3rem;
          flex-shrink: 0;
        }

        .wallet-info {
          flex: 1;
        }

        .wallet-label {
          font-size: 0.875rem;
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          margin-bottom: var(--spacing-xs, 0.25rem);
        }

        .wallet-value {
          font-size: 2rem;
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 700;
          margin-bottom: var(--spacing-xs, 0.25rem);
        }

        .wallet-description {
          font-size: 0.75rem;
          color: var(--text-tertiary, #808080);
          font-family: var(--font-secondary, Arial);
        }

        /* Inventory Section */
        .inventory-section,
        .activity-section {
          margin-bottom: var(--spacing-xl, 2rem);
        }

        .inventory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--spacing-md, 1rem);
        }

        .inventory-item {
          padding: var(--spacing-md, 1rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-md, 0.5rem);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 0.5rem);
          transition: var(--transition-normal, 0.3s);
        }

        .inventory-item:hover {
          background: rgba(0, 255, 204, 0.12);
          border-color: rgba(0, 255, 204, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(0, 255, 204, 0.2);
        }

        .item-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .item-info {
          flex: 1;
        }

        .item-name {
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: var(--spacing-xs, 0.25rem);
        }

        .item-quantity {
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          font-size: 0.75rem;
        }

        /* Activity Section */
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm, 0.5rem);
        }

        .activity-item {
          padding: var(--spacing-md, 1rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-md, 0.5rem);
          display: flex;
          align-items: center;
          gap: var(--spacing-md, 1rem);
          transition: var(--transition-normal, 0.3s);
        }

        .activity-item:hover {
          background: rgba(0, 255, 204, 0.12);
          border-color: rgba(0, 255, 204, 0.4);
          transform: translateX(5px);
        }

        .activity-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          font-weight: 600;
          font-size: 1rem;
          margin-bottom: var(--spacing-xs, 0.25rem);
        }

        .activity-description {
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          font-size: 0.875rem;
        }

        .empty-message {
          color: var(--text-tertiary, #808080);
          text-align: center;
          padding: var(--spacing-lg, 1.5rem);
          grid-column: 1 / -1;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: var(--spacing-md, 1rem);
            align-items: flex-start;
          }

          .dashboard-content {
            padding: var(--spacing-md, 1rem);
          }

          .profile-ship-container {
            grid-template-columns: 1fr;
            gap: var(--spacing-md, 1rem);
          }

          #shipCanvas {
            width: 192px;
            height: 96px;
          }

          .ship-stats {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }

          .ships-grid,
          .inventory-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }

          /* Quick Actions Section */
          .actions-section {
            margin-bottom: var(--spacing-xl, 2rem);
          }

          .actions-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-md, 1rem);
            margin-top: var(--spacing-md, 1rem);
          }

          .action-btn {
            display: flex;
            align-items: center;
            gap: var(--spacing-md, 1rem);
            padding: var(--spacing-lg, 1.5rem);
            background: rgba(0, 255, 204, 0.08);
            border: 1px solid rgba(0, 255, 204, 0.2);
            border-radius: var(--border-radius-lg, 1rem);
            color: var(--color-white, #ffffff);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            position: relative;
            overflow: hidden;
          }

          .action-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: left 0.5s ease;
          }

          .action-btn:hover::before {
            left: 100%;
          }

          .action-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0, 255, 204, 0.3);
            border-color: rgba(0, 255, 204, 0.4);
          }

          /* Multiplayer Button - Destaque especial */
          .multiplayer-btn {
            background: linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(247, 37, 133, 0.2));
            border: 1px solid rgba(255, 107, 53, 0.4);
          }

          .multiplayer-btn:hover {
            background: linear-gradient(135deg, rgba(255, 107, 53, 0.3), rgba(247, 37, 133, 0.3));
            box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
          }

          .multiplayer-btn .action-icon {
            background: linear-gradient(135deg, #ff6b35, #f72585);
            color: white;
            font-size: 1.5rem;
            animation: pulse 2s ease-in-out infinite;
          }

          /* Solo Button */
          .solo-btn {
            background: linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(41, 128, 185, 0.2));
            border: 1px solid rgba(52, 152, 219, 0.4);
          }

          .solo-btn:hover {
            background: linear-gradient(135deg, rgba(52, 152, 219, 0.3), rgba(41, 128, 185, 0.3));
            box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
          }

          .solo-btn .action-icon {
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            font-size: 1.5rem;
          }

          .action-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            border-radius: var(--border-radius-md, 0.5rem);
            flex-shrink: 0;
          }

          .action-content {
            flex: 1;
          }

          .action-title {
            font-size: var(--text-lg, 1.25rem);
            font-weight: 700;
            font-family: var(--font-primary, Arial);
            margin-bottom: var(--spacing-xs, 0.25rem);
            color: var(--color-white, #ffffff);
          }

          .action-description {
            font-size: var(--text-sm, 0.875rem);
            color: var(--text-secondary, #b0b0b0);
            line-height: 1.4;
          }

          .action-arrow {
            font-size: 1.5rem;
            color: var(--primary-cyan, #00ffcc);
            transition: transform 0.3s ease;
          }

          .action-btn:hover .action-arrow {
            transform: translateX(5px);
          }

          /* Responsive Design for Actions */
          @media (max-width: 768px) {
            .actions-grid {
              grid-template-columns: 1fr;
              gap: var(--spacing-sm, 0.5rem);
            }

            .action-btn {
              padding: var(--spacing-md, 1rem);
            }

            .action-icon {
              width: 50px;
              height: 50px;
              font-size: 1.2rem;
            }

            .action-title {
              font-size: var(--text-base, 1rem);
            }

            .action-description {
              font-size: var(--text-xs, 0.75rem);
            }
          }
        }
      `,document.head.appendChild(a)}}}export{C as default};
