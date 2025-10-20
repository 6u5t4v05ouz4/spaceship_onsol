import{g as p,n as g}from"./main-d0ca86ab.js";import{e as f,H as u}from"./HeaderNavigation-64d23218.js";import"./phaser-aaa04cbd.js";async function c(o,s,r="all"){try{const{data:e,error:t}=await o.from("missions").select("*").eq("is_active",!0).order("difficulty",{ascending:!0}).order("reward_coins",{ascending:!0});if(t)throw new Error("Failed to load missions: "+t.message);const{data:i,error:n}=await o.from("user_mission_progress").select("*").eq("user_id",s);n&&n.code!=="PGRST116"&&console.warn("⚠️ Could not load progress:",n);const l=e.map(d=>{const a=i==null?void 0:i.find(m=>m.mission_id===d.id);return{...d,status:(a==null?void 0:a.status)||"not_started",progress:(a==null?void 0:a.progress)||0,completed_at:(a==null?void 0:a.completed_at)||null,user_progress_id:(a==null?void 0:a.id)||null}});return r!=="all"?l.filter(d=>d.status===r):l}catch(e){throw console.error("❌ Error in getMissions:",e),e}}async function v(o,s,r){try{const{data:e}=await o.from("user_mission_progress").select("id").eq("user_id",s).eq("mission_id",r).maybeSingle();if(e){const{data:t,error:i}=await o.from("user_mission_progress").update({status:"in_progress"}).eq("id",e.id).select().single();if(i)throw new Error("Failed to start mission: "+i.message);return t}else{const{data:t,error:i}=await o.from("user_mission_progress").insert([{user_id:s,mission_id:r,status:"in_progress",progress:0}]).select().single();if(i)throw new Error("Failed to start mission: "+i.message);return t}}catch(e){throw console.error("❌ Error in startMission:",e),e}}class x{constructor(s){this.name="MissionsPage",this.supabase=s,this.missions=[],this.filter="all",this.userId=null}render(){const s=document.createElement("div");return s.className="missions-page",s.innerHTML=`
      <div class="background-primary"></div>
      <div class="stars-background"></div>

      <!-- Global Navigation Header -->
      <div id="globalHeader"></div>

      <div class="missions-wrapper">
        <div class="missions-content">
          <!-- Loading State -->
          <div id="loadingState" class="loading-state">
            <div class="spinner">⏳</div>
            <p>Loading missions...</p>
          </div>

          <!-- Error State -->
          <div id="errorState" class="error-state" role="alert" style="display: none;">
            <div class="error-icon">❌</div>
            <p class="error-message" id="errorMessage"></p>
            <button id="retryBtn" class="retry-btn">🔄 Try Again</button>
          </div>

          <!-- Data State -->
          <div id="dataState" class="data-state" style="display: none;">
            <!-- Header -->
            <header class="missions-header">
              <h1 class="missions-title">🎯 Missions</h1>
              <p class="missions-subtitle">Complete missions to earn rewards</p>
            </header>

            <!-- Filters -->
            <div class="missions-filters">
              <button class="filter-btn active" data-filter="all">All</button>
              <button class="filter-btn" data-filter="not_started">Not Started</button>
              <button class="filter-btn" data-filter="in_progress">In Progress</button>
              <button class="filter-btn" data-filter="completed">Completed</button>
            </div>

            <!-- Missions Grid -->
            <div id="missionsGrid" class="missions-grid">
              <!-- Missions will be rendered here -->
            </div>
          </div>
        </div>
      </div>
    `,this.addStyles(),this.renderGlobalHeader(s),this.loadMissions(s),this.setupEventListeners(s),s}renderGlobalHeader(s){const r=s.querySelector("#globalHeader");if(r){const e=new u;r.appendChild(e.render())}}async loadMissions(s){this.showLoading(s);try{const r=await p();if(!r){this.showError(s,"Session expired. Please login again."),setTimeout(()=>g("/login"),1500);return}console.log("🔍 Ensuring user data is initialized..."),await f(this.supabase,r.user.email,r.user);const{data:e}=await this.supabase.from("user_profiles").select("id").eq("google_email",r.user.email).single();if(!e)throw new Error("Profile not found");this.userId=e.id,this.missions=await c(this.supabase,this.userId,this.filter),this.hideLoading(s),this.renderMissions(s)}catch(r){console.error("❌ Error loading missions:",r),this.showError(s,r.message)}}renderMissions(s){const r=s.querySelector("#dataState");r.style.display="block";const e=s.querySelector("#missionsGrid");if(this.missions.length===0){e.innerHTML='<p class="empty-message">No missions found for this filter.</p>';return}e.innerHTML=this.missions.map(t=>this.renderMissionCard(t)).join("")}renderMissionCard(s){const r={not_started:"⬜",in_progress:"⏳",completed:"✅"},e={easy:"#4ade80",medium:"#fbbf24",hard:"#f87171"},t={not_started:"Not Started",in_progress:"In Progress",completed:"Completed"};return`
      <div class="mission-card ${s.status}" data-mission-id="${s.id}">
        <div class="mission-icon">${s.icon}</div>
        <div class="mission-info">
          <h3 class="mission-title">${s.title}</h3>
          <p class="mission-description">${s.description}</p>
          <div class="mission-objective">
            <span class="objective-label">Objective:</span>
            <span class="objective-text">${s.objective}</span>
          </div>
          <div class="mission-rewards">
            <span class="reward">🪙 ${s.reward_coins} coins</span>
            <span class="reward">⭐ ${s.reward_exp} exp</span>
          </div>
          <div class="mission-meta">
            <span class="difficulty" style="color: ${e[s.difficulty]}">
              ${s.difficulty.toUpperCase()}
            </span>
            <span class="status-badge">
              ${r[s.status]} ${t[s.status]}
            </span>
          </div>
          ${s.status==="in_progress"?`
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${s.progress}%"></div>
              <span class="progress-text">${s.progress}%</span>
            </div>
          `:""}
        </div>
        <div class="mission-actions">
          ${s.status==="not_started"?`
            <button class="btn-start" data-mission-id="${s.id}">Start Mission</button>
          `:s.status==="in_progress"?`
            <button class="btn-continue" data-mission-id="${s.id}">Continue</button>
          `:`
            <button class="btn-completed" disabled>Completed</button>
          `}
        </div>
      </div>
    `}setupEventListeners(s){const r=s.querySelector("#retryBtn");r&&r.addEventListener("click",()=>this.loadMissions(s)),s.querySelectorAll(".filter-btn").forEach(e=>{e.addEventListener("click",async t=>{const i=t.target.dataset.filter;i!==this.filter&&(s.querySelectorAll(".filter-btn").forEach(n=>n.classList.remove("active")),t.target.classList.add("active"),this.filter=i,this.missions=await c(this.supabase,this.userId,this.filter),this.renderMissions(s),this.setupMissionActions(s))})}),this.setupMissionActions(s)}setupMissionActions(s){s.querySelectorAll(".btn-start, .btn-continue").forEach(r=>{r.addEventListener("click",async e=>{const t=e.target.dataset.missionId;try{await v(this.supabase,this.userId,t),alert("Mission started! (Game integration coming soon)"),this.loadMissions(s)}catch(i){console.error("❌ Error starting mission:",i),alert("Failed to start mission: "+i.message)}})})}showLoading(s){s.querySelector("#loadingState").style.display="flex",s.querySelector("#errorState").style.display="none",s.querySelector("#dataState").style.display="none"}showError(s,r){s.querySelector("#loadingState").style.display="none",s.querySelector("#errorState").style.display="flex",s.querySelector("#errorMessage").textContent=r,s.querySelector("#dataState").style.display="none"}hideLoading(s){s.querySelector("#loadingState").style.display="none"}addStyles(){if(!document.querySelector('style[data-page="missions"]')){const s=document.createElement("style");s.setAttribute("data-page","missions"),s.textContent=`
        .missions-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .missions-wrapper {
          position: relative;
          z-index: 10;
          padding-top: 80px;
          min-height: 100vh;
        }

        .missions-content {
          padding: var(--spacing-lg, 1.5rem);
          max-width: 1200px;
          margin: 0 auto;
        }

        .loading-state, .error-state {
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

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .missions-header {
          text-align: center;
          margin-bottom: var(--spacing-xl, 2rem);
        }

        .missions-title {
          font-size: clamp(2rem, 5vw, 3rem);
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          margin: 0 0 var(--spacing-sm, 0.5rem) 0;
        }

        .missions-subtitle {
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          margin: 0;
        }

        .missions-filters {
          display: flex;
          gap: var(--spacing-sm, 0.5rem);
          margin-bottom: var(--spacing-lg, 1.5rem);
          flex-wrap: wrap;
          justify-content: center;
        }

        .filter-btn {
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
          background: rgba(0, 255, 204, 0.1);
          border: 1px solid rgba(0, 255, 204, 0.3);
          border-radius: var(--border-radius-md, 0.5rem);
          color: var(--primary-cyan, #00ffcc);
          cursor: pointer;
          font-family: var(--font-secondary, Arial);
          transition: var(--transition-normal, 0.3s);
        }

        .filter-btn:hover {
          background: rgba(0, 255, 204, 0.2);
          border-color: rgba(0, 255, 204, 0.5);
        }

        .filter-btn.active {
          background: var(--primary-cyan, #00ffcc);
          color: #000;
          font-weight: 600;
        }

        .missions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: var(--spacing-lg, 1.5rem);
        }

        .mission-card {
          padding: var(--spacing-lg, 1.5rem);
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: var(--border-radius-lg, 1rem);
          transition: var(--transition-normal, 0.3s);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md, 1rem);
        }

        .mission-card:hover {
          background: rgba(0, 255, 204, 0.12);
          border-color: rgba(0, 255, 204, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 255, 204, 0.2);
        }

        .mission-icon {
          font-size: 3rem;
          text-align: center;
        }

        .mission-title {
          font-size: var(--text-xl, 1.5rem);
          color: var(--primary-cyan, #00ffcc);
          font-family: var(--font-primary, Arial);
          margin: 0 0 var(--spacing-sm, 0.5rem) 0;
        }

        .mission-description {
          color: var(--text-secondary, #b0b0b0);
          font-family: var(--font-secondary, Arial);
          font-size: var(--text-sm, 0.875rem);
          margin: 0 0 var(--spacing-md, 1rem) 0;
        }

        .mission-objective {
          padding: var(--spacing-sm, 0.5rem);
          background: rgba(0, 255, 204, 0.05);
          border-left: 3px solid var(--primary-cyan, #00ffcc);
          margin-bottom: var(--spacing-sm, 0.5rem);
        }

        .objective-label {
          color: var(--primary-cyan, #00ffcc);
          font-weight: 600;
          font-size: var(--text-sm, 0.875rem);
        }

        .objective-text {
          color: var(--text-primary, #fff);
          font-size: var(--text-sm, 0.875rem);
          margin-left: var(--spacing-xs, 0.25rem);
        }

        .mission-rewards {
          display: flex;
          gap: var(--spacing-md, 1rem);
          margin-bottom: var(--spacing-sm, 0.5rem);
        }

        .reward {
          color: var(--text-primary, #fff);
          font-family: var(--font-secondary, Arial);
          font-size: var(--text-sm, 0.875rem);
        }

        .mission-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .difficulty {
          font-weight: 600;
          font-size: var(--text-xs, 0.75rem);
        }

        .status-badge {
          font-size: var(--text-sm, 0.875rem);
          color: var(--text-secondary, #b0b0b0);
        }

        .progress-bar {
          position: relative;
          width: 100%;
          height: 24px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: var(--border-radius-md, 0.5rem);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-cyan, #00ffcc), var(--secondary-blue, #0099ff));
          transition: width 0.3s ease;
        }

        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #fff;
          font-weight: 600;
          font-size: var(--text-sm, 0.875rem);
        }

        .mission-actions {
          margin-top: auto;
        }

        .mission-actions button {
          width: 100%;
          padding: var(--spacing-md, 1rem);
          border: none;
          border-radius: var(--border-radius-md, 0.5rem);
          font-family: var(--font-primary, Arial);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-normal, 0.3s);
        }

        .btn-start, .btn-continue {
          background: linear-gradient(135deg, var(--primary-cyan, #00ffcc), var(--secondary-blue, #0099ff));
          color: #000;
        }

        .btn-start:hover, .btn-continue:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 255, 204, 0.3);
        }

        .btn-completed {
          background: rgba(0, 255, 204, 0.2);
          color: var(--primary-cyan, #00ffcc);
          cursor: not-allowed;
        }

        .empty-message {
          text-align: center;
          color: var(--text-secondary, #b0b0b0);
          padding: var(--spacing-xl, 2rem);
        }

        @media (max-width: 768px) {
          .missions-grid {
            grid-template-columns: 1fr;
          }
        }
      `,document.head.appendChild(s)}}}export{x as default};
