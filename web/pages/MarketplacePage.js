/**
 * MarketplacePage - Player-to-Player Marketplace
 * Displays items for sale from other players
 */

import * as authService from '../../shared/services/authService.js';
import * as marketplaceService from '../../shared/services/marketplaceService.js';
import * as userInitService from '../../shared/services/userInitService.js';
import { navigateTo } from '../../shared/router.js';
import HeaderNavigation from '../components/HeaderNavigation.js';

export default class MarketplacePage {
  constructor(supabaseClient) {
    this.name = 'MarketplacePage';
    this.supabase = supabaseClient;
    this.listings = [];
    this.filter = 'all';
    this.userCoins = 0;
    this.userId = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'marketplace-page';
    container.innerHTML = `
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
    `;

    this.addStyles();
    this.renderGlobalHeader(container);
    this.loadMarketplace(container);
    this.setupEventListeners(container);

    return container;
  }

  renderGlobalHeader(container) {
    const headerContainer = container.querySelector('#globalHeader');
    if (headerContainer) {
      const headerNav = new HeaderNavigation();
      headerContainer.appendChild(headerNav.render());
    }
  }

  async loadMarketplace(container) {
    this.showLoading(container);

    try {
      const session = await authService.getSession();
      if (!session) {
        this.showError(container, 'Session expired. Please login again.');
        setTimeout(() => navigateTo('/login'), 1500);
        return;
      }

      // Ensure user is initialized
      console.log('🔍 Ensuring user data is initialized...');
      await userInitService.ensureUserInitialized(
        this.supabase,
        session.user.email,
        session.user
      );

      // Get user profile ID for wallet
      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('id')
        .eq('google_email', session.user.email)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      this.userId = profile.id;

      // Get user's coins
      const { data: wallet } = await this.supabase
        .from('player_wallet')
        .select('space_tokens')
        .eq('user_id', this.userId)
        .single();

      this.userCoins = wallet?.space_tokens || 0;

      // Load marketplace listings
      this.listings = await marketplaceService.getMarketplaceListings(
        this.supabase,
        this.filter
      );

      this.hideLoading(container);
      this.renderMarketplace(container);

    } catch (error) {
      console.error('❌ Error loading marketplace:', error);
      this.showError(container, error.message);
    }
  }

  renderMarketplace(container) {
    const dataState = container.querySelector('#dataState');
    const emptyState = container.querySelector('#emptyState');
    const listingsGrid = container.querySelector('#listingsGrid');
    const coinsValue = container.querySelector('#userCoins');

    dataState.style.display = 'block';

    // Update user coins display
    coinsValue.textContent = this.userCoins.toLocaleString();

    // Check if marketplace is empty
    if (!this.listings || this.listings.length === 0) {
      emptyState.style.display = 'flex';
      listingsGrid.style.display = 'none';
      return;
    }

    // Show listings
    emptyState.style.display = 'none';
    listingsGrid.style.display = 'grid';
    listingsGrid.innerHTML = '';

    this.listings.forEach(listing => {
      const listingCard = this.createListingCard(listing);
      listingsGrid.appendChild(listingCard);
    });
  }

  createListingCard(listing) {
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.dataset.listingId = listing.id;

    const categoryIcon = this.getCategoryIcon(listing.category);
    const canAfford = this.userCoins >= listing.price_coins;
    const affordClass = canAfford ? 'can-afford' : 'cannot-afford';

    // Parse stats
    const stats = listing.stats || {};
    const statsHtml = Object.entries(stats)
      .slice(0, 3) // Show max 3 stats
      .map(([key, value]) => `
        <span class="stat-item">
          ${key}: <strong>${value}</strong>
        </span>
      `)
      .join('');

    card.innerHTML = `
      <div class="listing-image">
        ${listing.image_url 
          ? `<img src="${listing.image_url}" alt="${listing.item_name}" />`
          : `<div class="placeholder-icon">${categoryIcon}</div>`
        }
      </div>
      <div class="listing-info">
        <h3 class="listing-name">${categoryIcon} ${listing.item_name}</h3>
        <p class="listing-category">${listing.category}</p>
        <p class="listing-description">${listing.description || 'No description'}</p>
        ${statsHtml ? `<div class="listing-stats">${statsHtml}</div>` : ''}
        <div class="listing-seller">
          <span class="seller-label">Seller:</span>
          <span class="seller-name">${listing.seller?.display_name || 'Unknown'}</span>
        </div>
        <div class="listing-price ${affordClass}">
          <span class="price-value">${listing.price_coins.toLocaleString()}</span>
          <span class="price-icon">🪙</span>
        </div>
        <button class="buy-btn ${canAfford ? '' : 'disabled'}" data-listing-id="${listing.id}">
          ${canAfford ? '💰 Buy Now' : '🔒 Insufficient Coins'}
        </button>
      </div>
    `;

    return card;
  }

  getCategoryIcon(category) {
    const icons = {
      ship: '🛸',
      weapon: '⚔️',
      shield: '🛡️',
      equipment: '⚙️',
      resource: '💎'
    };
    return icons[category] || '📦';
  }

  setupEventListeners(container) {
    // Retry button
    const retryBtn = container.querySelector('#retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.loadMarketplace(container);
      });
    }

    // Filter buttons
    const filterBtns = container.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update filter and reload
        this.filter = btn.dataset.filter;
        await this.loadMarketplace(container);
      });
    });

    // Buy buttons (event delegation)
    const listingsGrid = container.querySelector('#listingsGrid');
    if (listingsGrid) {
      listingsGrid.addEventListener('click', async (e) => {
        const buyBtn = e.target.closest('.buy-btn');
        if (buyBtn && !buyBtn.classList.contains('disabled')) {
          const listingId = buyBtn.dataset.listingId;
          await this.handlePurchase(container, listingId);
        }
      });
    }
  }

  async handlePurchase(container, listingId) {
    try {
      const session = await authService.getSession();
      if (!session) {
        alert('Session expired. Please login again.');
        navigateTo('/login');
        return;
      }

      // Confirm purchase
      const listing = this.listings.find(l => l.id === listingId);
      if (!listing) {
        alert('Listing not found');
        return;
      }

      const confirmMsg = `Purchase ${listing.item_name} for ${listing.price_coins.toLocaleString()} coins?`;
      if (!confirm(confirmMsg)) {
        return;
      }

      console.log('💰 Purchasing item:', listingId);

      // Disable button during purchase
      const buyBtn = container.querySelector(`[data-listing-id="${listingId}"]`);
      if (buyBtn) {
        buyBtn.disabled = true;
        buyBtn.textContent = '⏳ Processing...';
      }

      // Call purchase service
      const result = await marketplaceService.purchaseListing(
        this.supabase,
        session.user.email,
        listingId
      );

      // Show success message
      alert(result.message);

      // Reload marketplace to reflect changes
      await this.loadMarketplace(container);

    } catch (error) {
      console.error('❌ Error purchasing item:', error);
      alert(error.message || 'Failed to purchase item. Please try again.');
      
      // Re-enable button
      const buyBtn = container.querySelector(`[data-listing-id="${listingId}"]`);
      if (buyBtn) {
        buyBtn.disabled = false;
        buyBtn.textContent = '💰 Buy Now';
      }
    }
  }

  showLoading(container) {
    container.querySelector('#loadingState').style.display = 'flex';
    container.querySelector('#errorState').style.display = 'none';
    container.querySelector('#dataState').style.display = 'none';
  }

  hideLoading(container) {
    container.querySelector('#loadingState').style.display = 'none';
  }

  showError(container, message) {
    container.querySelector('#loadingState').style.display = 'none';
    container.querySelector('#dataState').style.display = 'none';
    const errorState = container.querySelector('#errorState');
    errorState.style.display = 'flex';
    container.querySelector('#errorMessage').textContent = message;
  }

  addStyles() {
    if (document.getElementById('marketplace-page-styles')) return;

    const style = document.createElement('style');
    style.id = 'marketplace-page-styles';
    style.textContent = `
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
    `;

    document.head.appendChild(style);
  }
}

