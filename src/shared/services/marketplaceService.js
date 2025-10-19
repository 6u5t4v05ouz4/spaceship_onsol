/**
 * MarketplaceService - Player-to-Player marketplace operations
 * Handles listing, buying, and transaction history
 */

/**
 * Get all active marketplace listings
 * @param {Object} supabase - Supabase client
 * @param {string} category - Filter by category ('all', 'ship', 'weapon', 'shield', 'resource', 'equipment')
 * @returns {Promise<Array>} - Array of listings with seller info
 */
export async function getMarketplaceListings(supabase, category = 'all') {
  try {
    console.log('🛒 Fetching marketplace listings, category:', category);

    let query = supabase
      .from('marketplace_listings')
      .select(`
        *,
        seller:seller_id (
          id,
          display_name,
          google_email,
          avatar_url
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Apply category filter if not 'all'
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching listings:', error);
      throw new Error('Failed to load marketplace listings: ' + error.message);
    }

    console.log(`✅ Found ${data?.length || 0} listings`);
    return data || [];

  } catch (error) {
    console.error('❌ Error in getMarketplaceListings:', error);
    throw error;
  }
}

/**
 * Get details of a specific listing
 * @param {Object} supabase - Supabase client
 * @param {string} listingId - UUID of the listing
 * @returns {Promise<Object>} - Listing details with seller info
 */
export async function getListingDetails(supabase, listingId) {
  try {
    console.log('🔍 Fetching listing details:', listingId);

    const { data, error } = await supabase
      .from('marketplace_listings')
      .select(`
        *,
        seller:seller_id (
          id,
          display_name,
          google_email,
          avatar_url
        )
      `)
      .eq('id', listingId)
      .single();

    if (error) {
      console.error('❌ Error fetching listing details:', error);
      throw new Error('Failed to load listing details: ' + error.message);
    }

    console.log('✅ Listing details loaded:', data.item_name);
    return data;

  } catch (error) {
    console.error('❌ Error in getListingDetails:', error);
    throw error;
  }
}

/**
 * Purchase a marketplace item
 * @param {Object} supabase - Supabase client
 * @param {string} buyerEmail - Email of the buyer
 * @param {string} listingId - UUID of the listing to purchase
 * @returns {Promise<Object>} - Purchase result {success, message, transaction_id}
 */
export async function purchaseListing(supabase, buyerEmail, listingId) {
  try {
    console.log('💰 Purchasing listing:', listingId, 'for buyer:', buyerEmail);

    const { data, error } = await supabase
      .rpc('purchase_marketplace_item', {
        p_buyer_email: buyerEmail,
        p_listing_id: listingId
      });

    if (error) {
      console.error('❌ Error purchasing item:', error);
      throw new Error('Failed to purchase item: ' + error.message);
    }

    if (!data || data.length === 0) {
      throw new Error('No response from purchase function');
    }

    const result = data[0];
    
    if (!result.success) {
      console.warn('⚠️ Purchase failed:', result.message);
      throw new Error(result.message);
    }

    console.log('✅ Purchase successful:', result.message);
    return result;

  } catch (error) {
    console.error('❌ Error in purchaseListing:', error);
    throw error;
  }
}

/**
 * Get user's own listings (as seller)
 * @param {Object} supabase - Supabase client
 * @param {string} sellerId - UUID of the seller (user_profiles.id)
 * @param {string} status - Filter by status ('all', 'active', 'sold', 'expired', 'cancelled')
 * @returns {Promise<Array>} - Array of seller's listings
 */
export async function getSellerListings(supabase, sellerId, status = 'all') {
  try {
    console.log('📋 Fetching seller listings for:', sellerId, 'status:', status);

    let query = supabase
      .from('marketplace_listings')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    // Apply status filter if not 'all'
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching seller listings:', error);
      throw new Error('Failed to load your listings: ' + error.message);
    }

    console.log(`✅ Found ${data?.length || 0} listings for seller`);
    return data || [];

  } catch (error) {
    console.error('❌ Error in getSellerListings:', error);
    throw error;
  }
}

/**
 * Get user's transaction history
 * @param {Object} supabase - Supabase client
 * @param {string} userId - UUID of the user (user_profiles.id)
 * @param {string} type - Filter by type ('all', 'purchases', 'sales')
 * @returns {Promise<Array>} - Array of transactions
 */
export async function getTransactionHistory(supabase, userId, type = 'all') {
  try {
    console.log('📜 Fetching transaction history for:', userId, 'type:', type);

    let query = supabase
      .from('transaction_history')
      .select(`
        *,
        buyer:buyer_id (
          display_name,
          google_email
        ),
        seller:seller_id (
          display_name,
          google_email
        )
      `)
      .order('created_at', { ascending: false });

    // Apply type filter
    if (type === 'purchases') {
      query = query.eq('buyer_id', userId);
    } else if (type === 'sales') {
      query = query.eq('seller_id', userId);
    } else {
      // 'all' - get both purchases and sales
      query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching transaction history:', error);
      throw new Error('Failed to load transaction history: ' + error.message);
    }

    console.log(`✅ Found ${data?.length || 0} transactions`);
    return data || [];

  } catch (error) {
    console.error('❌ Error in getTransactionHistory:', error);
    throw error;
  }
}

/**
 * Get marketplace statistics
 * @param {Object} supabase - Supabase client
 * @returns {Promise<Object>} - Stats {total_listings, total_sold, total_value}
 */
export async function getMarketplaceStats(supabase) {
  try {
    console.log('📊 Fetching marketplace stats');

    // Get active listings count
    const { count: activeCount } = await supabase
      .from('marketplace_listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get sold listings count
    const { count: soldCount } = await supabase
      .from('marketplace_listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sold');

    // Get total transaction value
    const { data: transactions } = await supabase
      .from('transaction_history')
      .select('amount_coins');

    const totalValue = transactions?.reduce((sum, t) => sum + t.amount_coins, 0) || 0;

    const stats = {
      total_listings: activeCount || 0,
      total_sold: soldCount || 0,
      total_value: totalValue
    };

    console.log('✅ Marketplace stats:', stats);
    return stats;

  } catch (error) {
    console.error('❌ Error in getMarketplaceStats:', error);
    throw error;
  }
}

export default {
  getMarketplaceListings,
  getListingDetails,
  purchaseListing,
  getSellerListings,
  getTransactionHistory,
  getMarketplaceStats
};

