import{g as c,n as d}from"./main-fd77ee0d.js";import{e as m,H as u}from"./HeaderNavigation-323282c8.js";import"./phaser-aaa04cbd.js";async function f(n,e="all"){try{console.log("🛒 Fetching marketplace listings, category:",e);let t=n.from("marketplace_listings").select(`
        *,
        seller:seller_id (
          id,
          display_name,
          google_email,
          avatar_url
        )
      `).eq("status","active").order("created_at",{ascending:!1});e&&e!=="all"&&(t=t.eq("category",e));const{data:r,error:a}=await t;if(a)throw console.error("❌ Error fetching listings:",a),new Error("Failed to load marketplace listings: "+a.message);return console.log(`✅ Found ${(r==null?void 0:r.length)||0} listings`),r||[]}catch(t){throw console.error("❌ Error in getMarketplaceListings:",t),t}}async function b(n,e,t){try{console.log("💰 Purchasing listing:",t,"for buyer:",e);const{data:r,error:a}=await n.rpc("purchase_marketplace_item",{p_buyer_email:e,p_listing_id:t});if(a)throw console.error("❌ Error purchasing item:",a),new Error("Failed to purchase item: "+a.message);if(!r||r.length===0)throw new Error("No response from purchase function");const s=r[0];if(!s.success)throw console.warn("⚠️ Purchase failed:",s.message),new Error(s.message);return console.log("✅ Purchase successful:",s.message),s}catch(r){throw console.error("❌ Error in purchaseListing:",r),r}}class k{constructor(e){this.name="MarketplacePage",this.supabase=e,this.listings=[],this.filter="all",this.userCoins=0,this.userId=null}render(){const e=document.createElement("div");return e.className="marketplace-page",e.innerHTML=`
      <div class="background-primary"></div>
      <div class="stars-background"></div>

      <!-- Global Navigation Header -->
      <div id="globalHeader"></div>

      <div class="marketplace-wrapper">
        <div class="marketplace-content">
          <!-- Loading State -->
          <div id="loadingState" class="loading-state">
            <div class="spinner">⏳</div>
            <p>Loading marketplace...</p>
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
            <header class="marketplace-header">
              <h1 class="marketplace-title">🛒 Marketplace</h1>
              <p class="marketplace-subtitle">Buy items from other players</p>
              <div class="user-coins">
                <span class="coins-label">Your coins:</span>
                <span class="coins-value" id="userCoins">0</span>
                <span class="coins-icon">🪙</span>
              </div>
            </header>

            <!-- Filters -->
            <div class="marketplace-filters">
              <button class="filter-btn active" data-filter="all">All</button>
              <button class="filter-btn" data-filter="ship">Ships</button>
              <button class="filter-btn" data-filter="weapon">Weapons</button>
              <button class="filter-btn" data-filter="shield">Shields</button>
              <button class="filter-btn" data-filter="equipment">Equipment</button>
              <button class="filter-btn" data-filter="resource">Resources</button>
            </div>

            <!-- Empty State -->
            <div id="emptyState" class="empty-state" style="display: none;">
              <div class="empty-icon">📦</div>
              <h2>No items for sale yet</h2>
              <p>Players will post items here. Check back later!</p>
            </div>

            <!-- Listings Grid -->
            <div id="listingsGrid" class="listings-grid">
              <!-- Listings will be rendered here -->
            </div>
          </div>
        </div>
      </div>
    `,this.addStyles(),this.renderGlobalHeader(e),this.loadMarketplace(e),this.setupEventListeners(e),e}renderGlobalHeader(e){const t=e.querySelector("#globalHeader");if(t){const r=new u;t.appendChild(r.render())}}async loadMarketplace(e){this.showLoading(e);try{const t=await c();if(!t){this.showError(e,"Session expired. Please login again."),setTimeout(()=>d("/login"),1500);return}console.log("🔍 Ensuring user data is initialized..."),await m(this.supabase,t.user.email,t.user);const{data:r}=await this.supabase.from("user_profiles").select("id").eq("google_email",t.user.email).single();if(!r)throw new Error("Profile not found");this.userId=r.id;const{data:a}=await this.supabase.from("player_wallet").select("space_tokens").eq("user_id",this.userId).single();this.userCoins=(a==null?void 0:a.space_tokens)||0,this.listings=await f(this.supabase,this.filter),this.hideLoading(e),this.renderMarketplace(e)}catch(t){console.error("❌ Error loading marketplace:",t),this.showError(e,t.message)}}renderMarketplace(e){const t=e.querySelector("#dataState"),r=e.querySelector("#emptyState"),a=e.querySelector("#listingsGrid"),s=e.querySelector("#userCoins");if(t.style.display="block",s.textContent=this.userCoins.toLocaleString(),!this.listings||this.listings.length===0){r.style.display="flex",a.style.display="none";return}r.style.display="none",a.style.display="grid",a.innerHTML="",this.listings.forEach(i=>{const o=this.createListingCard(i);a.appendChild(o)})}createListingCard(e){var l;const t=document.createElement("div");t.className="listing-card",t.dataset.listingId=e.id;const r=this.getCategoryIcon(e.category),a=this.userCoins>=e.price_coins,s=a?"can-afford":"cannot-afford",i=e.stats||{},o=Object.entries(i).slice(0,3).map(([p,g])=>`
        <span class="stat-item">
          ${p}: <strong>${g}</strong>
        </span>
      `).join("");return t.innerHTML=`
      <div class="listing-image">
        ${e.image_url?`<img src="${e.image_url}" alt="${e.item_name}" />`:`<div class="placeholder-icon">${r}</div>`}
      </div>
      <div class="listing-info">
        <h3 class="listing-name">${r} ${e.item_name}</h3>
        <p class="listing-category">${e.category}</p>
        <p class="listing-description">${e.description||"No description"}</p>
        ${o?`<div class="listing-stats">${o}</div>`:""}
        <div class="listing-seller">
          <span class="seller-label">Seller:</span>
          <span class="seller-name">${((l=e.seller)==null?void 0:l.display_name)||"Unknown"}</span>
        </div>
        <div class="listing-price ${s}">
          <span class="price-value">${e.price_coins.toLocaleString()}</span>
          <span class="price-icon">🪙</span>
        </div>
        <button class="buy-btn ${a?"":"disabled"}" data-listing-id="${e.id}">
          ${a?"💰 Buy Now":"🔒 Insufficient Coins"}
        </button>
      </div>
    `,t}getCategoryIcon(e){return{ship:"🛸",weapon:"⚔️",shield:"🛡️",equipment:"⚙️",resource:"💎"}[e]||"📦"}setupEventListeners(e){const t=e.querySelector("#retryBtn");t&&t.addEventListener("click",()=>{this.loadMarketplace(e)});const r=e.querySelectorAll(".filter-btn");r.forEach(s=>{s.addEventListener("click",async()=>{r.forEach(i=>i.classList.remove("active")),s.classList.add("active"),this.filter=s.dataset.filter,await this.loadMarketplace(e)})});const a=e.querySelector("#listingsGrid");a&&a.addEventListener("click",async s=>{const i=s.target.closest(".buy-btn");if(i&&!i.classList.contains("disabled")){const o=i.dataset.listingId;await this.handlePurchase(e,o)}})}async handlePurchase(e,t){try{const r=await c();if(!r){alert("Session expired. Please login again."),d("/login");return}const a=this.listings.find(l=>l.id===t);if(!a){alert("Listing not found");return}const s=`Purchase ${a.item_name} for ${a.price_coins.toLocaleString()} coins?`;if(!confirm(s))return;console.log("💰 Purchasing item:",t);const i=e.querySelector(`[data-listing-id="${t}"]`);i&&(i.disabled=!0,i.textContent="⏳ Processing...");const o=await b(this.supabase,r.user.email,t);alert(o.message),await this.loadMarketplace(e)}catch(r){console.error("❌ Error purchasing item:",r),alert(r.message||"Failed to purchase item. Please try again.");const a=e.querySelector(`[data-listing-id="${t}"]`);a&&(a.disabled=!1,a.textContent="💰 Buy Now")}}showLoading(e){e.querySelector("#loadingState").style.display="flex",e.querySelector("#errorState").style.display="none",e.querySelector("#dataState").style.display="none"}hideLoading(e){e.querySelector("#loadingState").style.display="none"}showError(e,t){e.querySelector("#loadingState").style.display="none",e.querySelector("#dataState").style.display="none";const r=e.querySelector("#errorState");r.style.display="flex",e.querySelector("#errorMessage").textContent=t}addStyles(){if(document.getElementById("marketplace-page-styles"))return;const e=document.createElement("style");e.id="marketplace-page-styles",e.textContent=`
      .marketplace-page {
        min-height: 100vh;
        position: relative;
        padding-top: 80px;
      }

      .marketplace-wrapper {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
      }

      .marketplace-content {
        position: relative;
        z-index: 2;
      }

      /* Header */
      .marketplace-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .marketplace-title {
        font-size: 3rem;
        margin-bottom: 0.5rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .marketplace-subtitle {
        font-size: 1.2rem;
        color: #a0aec0;
        margin-bottom: 1rem;
      }

      .user-coins {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(102, 126, 234, 0.1);
        padding: 0.75rem 1.5rem;
        border-radius: 50px;
        border: 2px solid rgba(102, 126, 234, 0.3);
        font-size: 1.2rem;
      }

      .coins-label {
        color: #a0aec0;
      }

      .coins-value {
        color: #fbbf24;
        font-weight: bold;
        font-size: 1.4rem;
      }

      .coins-icon {
        font-size: 1.5rem;
      }

      /* Filters */
      .marketplace-filters {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
        margin-bottom: 2rem;
      }

      .filter-btn {
        padding: 0.75rem 1.5rem;
        border: 2px solid rgba(102, 126, 234, 0.3);
        background: rgba(17, 24, 39, 0.8);
        color: #e2e8f0;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1rem;
        font-weight: 500;
      }

      .filter-btn:hover {
        background: rgba(102, 126, 234, 0.2);
        border-color: rgba(102, 126, 234, 0.5);
        transform: translateY(-2px);
      }

      .filter-btn.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-color: #667eea;
        color: white;
      }

      /* Empty State */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        text-align: center;
      }

      .empty-icon {
        font-size: 5rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      .empty-state h2 {
        font-size: 2rem;
        color: #e2e8f0;
        margin-bottom: 0.5rem;
      }

      .empty-state p {
        font-size: 1.2rem;
        color: #a0aec0;
      }

      /* Listings Grid */
      .listings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 2rem;
      }

      .listing-card {
        background: rgba(17, 24, 39, 0.8);
        border: 2px solid rgba(102, 126, 234, 0.3);
        border-radius: 16px;
        overflow: hidden;
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .listing-card:hover {
        transform: translateY(-5px);
        border-color: rgba(102, 126, 234, 0.6);
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
      }

      .listing-image {
        width: 100%;
        height: 200px;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .listing-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .placeholder-icon {
        font-size: 5rem;
        opacity: 0.5;
      }

      .listing-info {
        padding: 1.5rem;
      }

      .listing-name {
        font-size: 1.5rem;
        color: #e2e8f0;
        margin-bottom: 0.5rem;
      }

      .listing-category {
        font-size: 0.9rem;
        color: #a0aec0;
        text-transform: uppercase;
        margin-bottom: 0.75rem;
      }

      .listing-description {
        font-size: 1rem;
        color: #cbd5e0;
        margin-bottom: 1rem;
        line-height: 1.5;
      }

      .listing-stats {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
        padding: 0.75rem;
        background: rgba(102, 126, 234, 0.1);
        border-radius: 8px;
      }

      .stat-item {
        font-size: 0.9rem;
        color: #a0aec0;
      }

      .stat-item strong {
        color: #667eea;
      }

      .listing-seller {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        font-size: 0.9rem;
      }

      .seller-label {
        color: #a0aec0;
      }

      .seller-name {
        color: #667eea;
        font-weight: 500;
      }

      .listing-price {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.5rem;
        margin-bottom: 1rem;
        padding: 0.75rem;
        border-radius: 8px;
      }

      .listing-price.can-afford {
        background: rgba(16, 185, 129, 0.1);
        border: 2px solid rgba(16, 185, 129, 0.3);
      }

      .listing-price.cannot-afford {
        background: rgba(239, 68, 68, 0.1);
        border: 2px solid rgba(239, 68, 68, 0.3);
      }

      .price-value {
        color: #fbbf24;
        font-weight: bold;
      }

      .price-icon {
        font-size: 1.8rem;
      }

      .buy-btn {
        width: 100%;
        padding: 1rem;
        border: none;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
      }

      .buy-btn:hover:not(.disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
      }

      .buy-btn.disabled {
        background: rgba(107, 114, 128, 0.5);
        cursor: not-allowed;
        opacity: 0.6;
      }

      /* Loading/Error States */
      .loading-state,
      .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        text-align: center;
      }

      .spinner {
        font-size: 3rem;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .error-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      .error-message {
        font-size: 1.2rem;
        color: #ef4444;
        margin-bottom: 1rem;
      }

      .retry-btn {
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 8px;
        color: white;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .retry-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
      }

      /* Responsive */
      @media (max-width: 768px) {
        .marketplace-wrapper {
          padding: 1rem;
        }

        .marketplace-title {
          font-size: 2rem;
        }

        .listings-grid {
          grid-template-columns: 1fr;
        }

        .marketplace-filters {
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }
      }
    `,document.head.appendChild(e)}}export{k as default};
