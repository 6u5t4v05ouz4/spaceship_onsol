import{n,g as r,_ as o}from"./main-ae15378b.js";import{H as l}from"./HeaderNavigation-97490218.js";import"./phaser-23102255.js";class u{constructor(e){this.name="MultiplayerGamePage",this.supabase=e,this.gameInstance=null,this.container=null,this.playerData={playerName:"",walletAddress:null,userId:null}}render(){return this.container=document.createElement("div"),this.container.className="multiplayer-game-page",this.container.innerHTML=`
      <div class="background-primary"></div>
      <div class="stars-background"></div>

      <!-- Global Navigation Header -->
      <div id="globalHeader"></div>

      <!-- Game Container -->
      <div class="game-container">
        <!-- Loading State -->
        <div id="gameLoadingState" class="game-loading-state">
          <div class="loading-content">
            <div class="spinner">🚀</div>
            <h2>Iniciando Mundo Multiplayer</h2>
            <p>Conectando ao servidor...</p>
            <div class="loading-progress">
              <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
              </div>
              <span id="loadingText">Autenticando...</span>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div id="gameErrorState" class="game-error-state" role="alert" aria-live="polite" style="display: none;">
          <div class="error-content">
            <div class="error-icon" role="img" aria-label="Erro">❌</div>
            <h2>Erro ao Conectar</h2>
            <p class="error-message" id="gameErrorMessage"></p>
            <div class="error-actions">
              <button id="retryConnectionBtn" class="retry-btn">
                <span role="img" aria-label="Recarregar">🔄</span> Tentar Novamente
              </button>
              <button id="backToDashboardBtn" class="back-btn">
                <span role="img" aria-label="Voltar">🏠</span> Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>

        <!-- Game Canvas Container -->
        <div id="gameCanvasContainer" class="game-canvas-container" style="display: none;">
          <!-- O Phaser vai renderizar aqui -->
          <div id="gameCanvas"></div>

          <!-- Game UI Overlay -->
          <div class="game-ui-overlay">
            <!-- Player Info -->
            <div class="player-info">
              <div class="player-avatar" id="playerAvatar">👤</div>
              <div class="player-details">
                <span class="player-name" id="playerName"></span>
                <span class="player-location" id="playerLocation">Chunk (0, 0)</span>
              </div>
            </div>

            <!-- Multiplayer Stats -->
            <div class="multiplayer-stats">
              <div class="stat-item">
                <span class="stat-icon">👥</span>
                <span class="stat-label">Players:</span>
                <span class="stat-value" id="playersCount">1</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">🌍</span>
                <span class="stat-label">Chunk:</span>
                <span class="stat-value" id="currentChunk">(0, 0)</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">📶</span>
                <span class="stat-label">Ping:</span>
                <span class="stat-value" id="pingValue">--</span>
              </div>
            </div>

            <!-- Controls Help -->
            <div class="controls-help">
              <button class="help-toggle" id="helpToggle">?</button>
              <div class="help-content" id="helpContent" style="display: none;">
                <h4>Controles</h4>
                <div class="control-item">
                  <kbd>W A S D</kbd> ou <kbd>Setas</kbd> - Mover
                </div>
                <div class="control-item">
                  <kbd>Mouse</kbd> - Mirar
                </div>
                <div class="control-item">
                  <kbd>Clique Esquerdo</kbd> - Atirar
                </div>
                <div class="control-item">
                  <kbd>E</kbd> - Testar Explosão
                </div>
                <div class="control-item">
                  <kbd>ESC</kbd> - Menu Pausa
                </div>
              </div>
            </div>
          </div>

          <!-- Disconnect Button -->
          <button class="disconnect-btn" id="disconnectBtn" title="Desconectar e voltar">
            <span>🚪</span>
          </button>
        </div>
      </div>
    `,this.initializeComponents(),this.setupEvents(),this.initializeGame(),this.container}initializeComponents(){const e=this.container.querySelector("#globalHeader"),t=new l(this.supabase);e.appendChild(t.render())}setupEvents(){const e=this.container.querySelector("#retryConnectionBtn");e&&e.addEventListener("click",()=>{this.hideError(),this.showLoading(),this.initializeGame()});const t=this.container.querySelector("#backToDashboardBtn");t&&t.addEventListener("click",()=>{n("/dashboard")});const a=this.container.querySelector("#disconnectBtn");a&&a.addEventListener("click",()=>{this.disconnect()});const s=this.container.querySelector("#helpToggle"),i=this.container.querySelector("#helpContent");s&&i&&s.addEventListener("click",()=>{i.style.display=i.style.display==="none"?"block":"none"}),window.addEventListener("beforeunload",()=>{this.cleanup()})}async initializeGame(){var e,t;try{this.updateLoadingProgress("Autenticando...",20);const a=await r();if(!a)throw new Error("Usuário não autenticado");this.updateLoadingProgress("Carregando perfil...",40);const{data:s,error:i}=await this.supabase.from("profiles").select("*").eq("id",a.user.id).single();i||!s?(console.warn("Perfil não encontrado, usando dados básicos"),this.playerData={playerName:((e=a.user.email)==null?void 0:e.split("@")[0])||"Player",walletAddress:null,userId:a.user.id}):this.playerData={playerName:s.username||((t=a.user.email)==null?void 0:t.split("@")[0])||"Player",walletAddress:s.wallet_address||null,userId:a.user.id},this.updateLoadingProgress("Carregando assets do jogo...",60),await this.loadPhaserScript(),this.updateLoadingProgress("Inicializando mundo multiplayer...",80),await this.startPhaserGame(),this.updateLoadingProgress("Conectado!",100),setTimeout(()=>{this.hideLoading(),this.showGame()},500)}catch(a){console.error("Erro ao inicializar jogo multiplayer:",a),this.showError(a.message)}}async loadPhaserScript(){return new Promise((e,t)=>{if(window.Phaser){e();return}const a=document.createElement("script");a.src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js",a.onload=e,a.onerror=t,document.head.appendChild(a)})}async startPhaserGame(){const{default:e}=await o(()=>import("./MultiplayerGameScene-6fc582bd.js"),["assets/MultiplayerGameScene-6fc582bd.js","assets/main-ae15378b.js","assets/phaser-23102255.js","assets/index-7c2f8fd6.css","assets/HeaderNavigation-97490218.js"]),t={type:Phaser.AUTO,width:window.innerWidth,height:window.innerHeight,backgroundColor:"#000000",parent:"gameCanvas",physics:{default:"arcade",arcade:{gravity:{x:0,y:0},debug:!1,fps:60}},scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH,width:"100%",height:"100%"},scene:[e],audio:{disableWebAudio:!1}};return this.gameInstance=new Phaser.Game(t),new Promise(a=>{this.gameInstance.events.on("ready",()=>{console.log("✅ Jogo multiplayer inicializado"),this.updatePlayerInfo(),a()})})}updatePlayerInfo(){const e=this.container.querySelector("#playerName"),t=this.container.querySelector("#playerAvatar");e&&(e.textContent=this.playerData.playerName),t&&(t.textContent="👤")}updateLoadingProgress(e,t){const a=this.container.querySelector("#loadingText"),s=this.container.querySelector("#progressFill");a&&(a.textContent=e),s&&(s.style.width=`${t}%`)}showLoading(){const e=this.container.querySelector("#gameLoadingState"),t=this.container.querySelector("#gameErrorState"),a=this.container.querySelector("#gameCanvasContainer");e&&(e.style.display="flex"),t&&(t.style.display="none"),a&&(a.style.display="none")}hideLoading(){const e=this.container.querySelector("#gameLoadingState");e&&(e.style.display="none")}showGame(){const e=this.container.querySelector("#gameCanvasContainer");e&&(e.style.display="block")}showError(e){const t=this.container.querySelector("#gameLoadingState"),a=this.container.querySelector("#gameErrorState"),s=this.container.querySelector("#gameErrorMessage");t&&(t.style.display="none"),a&&(a.style.display="flex"),s&&(s.textContent=e)}hideError(){const e=this.container.querySelector("#gameErrorState");e&&(e.style.display="none")}disconnect(){console.log("🔌 Desconectando do jogo multiplayer..."),this.gameInstance&&(this.gameInstance.destroy(!0),this.gameInstance=null),n("/dashboard")}cleanup(){this.gameInstance&&(this.gameInstance.destroy(!0),this.gameInstance=null),console.log("🧹 MultiplayerGamePage limpo")}destroy(){this.cleanup(),this.container&&(this.container.remove(),this.container=null)}}export{u as default};
