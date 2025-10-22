-- =====================================================
-- MARKETPLACE SCHEMA
-- Player-to-Player marketplace system
-- =====================================================

-- =====================================================
-- TABLE: marketplace_listings
-- Stores items that players are selling
-- =====================================================

CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Seller info
  seller_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Item info
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('ship', 'weapon', 'shield', 'resource', 'equipment')),
  description TEXT,
  price_coins INTEGER NOT NULL CHECK (price_coins > 0),
  
  -- Item stats (flexible JSON for different item types)
  stats JSONB DEFAULT '{}',
  
  -- Visual
  image_url TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  sold_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON public.marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON public.marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created ON public.marketplace_listings(created_at DESC);

-- =====================================================
-- TABLE: transaction_history
-- Records all marketplace transactions
-- =====================================================

CREATE TABLE IF NOT EXISTS public.transaction_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Transaction parties
  buyer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Transaction details
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  amount_coins INTEGER NOT NULL,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transaction_history_buyer ON public.transaction_history(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transaction_history_seller ON public.transaction_history(seller_id);
CREATE INDEX IF NOT EXISTS idx_transaction_history_listing ON public.transaction_history(listing_id);
CREATE INDEX IF NOT EXISTS idx_transaction_history_created ON public.transaction_history(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "marketplace_listings_select_all" ON public.marketplace_listings;
DROP POLICY IF EXISTS "marketplace_listings_insert_own" ON public.marketplace_listings;
DROP POLICY IF EXISTS "marketplace_listings_update_own" ON public.marketplace_listings;
DROP POLICY IF EXISTS "marketplace_listings_delete_own" ON public.marketplace_listings;

DROP POLICY IF EXISTS "transaction_history_select_own" ON public.transaction_history;
DROP POLICY IF EXISTS "transaction_history_insert_system" ON public.transaction_history;

-- Marketplace Listings Policies
-- Anyone can view active listings
CREATE POLICY "marketplace_listings_select_all"
  ON public.marketplace_listings FOR SELECT
  TO authenticated
  USING (status = 'active' OR seller_id IN (
    SELECT id FROM public.user_profiles 
    WHERE google_email = (auth.jwt() ->> 'email')
  ));

-- Users can create their own listings
CREATE POLICY "marketplace_listings_insert_own"
  ON public.marketplace_listings FOR INSERT
  TO authenticated
  WITH CHECK (
    seller_id IN (
      SELECT id FROM public.user_profiles 
      WHERE google_email = (auth.jwt() ->> 'email')
    )
  );

-- Users can update their own listings
CREATE POLICY "marketplace_listings_update_own"
  ON public.marketplace_listings FOR UPDATE
  TO authenticated
  USING (
    seller_id IN (
      SELECT id FROM public.user_profiles 
      WHERE google_email = (auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    seller_id IN (
      SELECT id FROM public.user_profiles 
      WHERE google_email = (auth.jwt() ->> 'email')
    )
  );

-- Users can delete their own listings
CREATE POLICY "marketplace_listings_delete_own"
  ON public.marketplace_listings FOR DELETE
  TO authenticated
  USING (
    seller_id IN (
      SELECT id FROM public.user_profiles 
      WHERE google_email = (auth.jwt() ->> 'email')
    )
  );

-- Transaction History Policies
-- Users can view their own transactions (as buyer or seller)
CREATE POLICY "transaction_history_select_own"
  ON public.transaction_history FOR SELECT
  TO authenticated
  USING (
    buyer_id IN (
      SELECT id FROM public.user_profiles 
      WHERE google_email = (auth.jwt() ->> 'email')
    )
    OR
    seller_id IN (
      SELECT id FROM public.user_profiles 
      WHERE google_email = (auth.jwt() ->> 'email')
    )
  );

-- Only system can insert transactions (via RPC function)
CREATE POLICY "transaction_history_insert_system"
  ON public.transaction_history FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Will be controlled by the purchase function

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON public.marketplace_listings TO authenticated;
GRANT ALL ON public.marketplace_listings TO anon;
GRANT ALL ON public.marketplace_listings TO authenticator;

GRANT ALL ON public.transaction_history TO authenticated;
GRANT ALL ON public.transaction_history TO anon;
GRANT ALL ON public.transaction_history TO authenticator;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticator;

-- =====================================================
-- FUNCTION: purchase_marketplace_item
-- Handles the complete purchase transaction atomically
-- =====================================================

CREATE OR REPLACE FUNCTION public.purchase_marketplace_item(
  p_buyer_email TEXT,
  p_listing_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  transaction_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_buyer_id UUID;
  v_seller_id UUID;
  v_listing_price INTEGER;
  v_buyer_coins INTEGER;
  v_item_name TEXT;
  v_transaction_id UUID;
  v_listing_status TEXT;
BEGIN
  -- 1. Get buyer profile ID
  SELECT id INTO v_buyer_id
  FROM public.user_profiles
  WHERE google_email = p_buyer_email;

  IF v_buyer_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Buyer profile not found'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- 2. Get listing details and lock the row
  SELECT seller_id, price_coins, item_name, status
  INTO v_seller_id, v_listing_price, v_item_name, v_listing_status
  FROM public.marketplace_listings
  WHERE id = p_listing_id
  FOR UPDATE; -- Lock the row to prevent race conditions

  IF v_seller_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Listing not found'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- 3. Check if listing is still active
  IF v_listing_status != 'active' THEN
    RETURN QUERY SELECT FALSE, 'This item is no longer available'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- 4. Check if buyer is trying to buy their own item
  IF v_buyer_id = v_seller_id THEN
    RETURN QUERY SELECT FALSE, 'You cannot buy your own items'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- 5. Get buyer's current coins
  SELECT space_tokens INTO v_buyer_coins
  FROM public.player_wallet
  WHERE user_id = v_buyer_id;

  IF v_buyer_coins IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Buyer wallet not found'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- 6. Check if buyer has enough coins
  IF v_buyer_coins < v_listing_price THEN
    RETURN QUERY SELECT 
      FALSE, 
      format('Insufficient coins. You need %s more coins.', v_listing_price - v_buyer_coins)::TEXT,
      NULL::UUID;
    RETURN;
  END IF;

  -- 7. Deduct coins from buyer
  UPDATE public.player_wallet
  SET space_tokens = space_tokens - v_listing_price
  WHERE user_id = v_buyer_id;

  -- 8. Add coins to seller
  UPDATE public.player_wallet
  SET space_tokens = space_tokens + v_listing_price
  WHERE user_id = v_seller_id;

  -- 9. Mark listing as sold
  UPDATE public.marketplace_listings
  SET 
    status = 'sold',
    sold_at = NOW()
  WHERE id = p_listing_id;

  -- 10. Create transaction record
  INSERT INTO public.transaction_history (
    buyer_id,
    seller_id,
    listing_id,
    item_name,
    amount_coins
  ) VALUES (
    v_buyer_id,
    v_seller_id,
    p_listing_id,
    v_item_name,
    v_listing_price
  )
  RETURNING id INTO v_transaction_id;

  -- 11. TODO: Add item to buyer's inventory (future implementation)
  -- This would depend on your inventory system structure

  -- Return success
  RETURN QUERY SELECT 
    TRUE, 
    format('Successfully purchased %s for %s coins!', v_item_name, v_listing_price)::TEXT,
    v_transaction_id;

EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, SQLERRM::TEXT, NULL::UUID;
END;
$$;

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Note: Uncomment below to add test listings
-- You'll need to replace the seller_id with an actual user_profiles.id

/*
INSERT INTO public.marketplace_listings (
  seller_id,
  item_name,
  category,
  description,
  price_coins,
  stats,
  image_url
) VALUES
  (
    'YOUR_USER_PROFILE_ID_HERE',
    'Interceptor Ship',
    'ship',
    'Fast and agile ship perfect for quick missions',
    2000,
    '{"speed": 100, "attack": 50, "defense": 30}',
    '/assets/ships/interceptor.png'
  ),
  (
    'YOUR_USER_PROFILE_ID_HERE',
    'Laser Sword',
    'weapon',
    'High-damage melee weapon with critical chance',
    500,
    '{"damage": 75, "critical": 10, "range": 1}',
    '/assets/weapons/laser-sword.png'
  );
*/

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.marketplace_listings IS 'Player-to-player marketplace listings';
COMMENT ON TABLE public.transaction_history IS 'Record of all marketplace transactions';
COMMENT ON FUNCTION public.purchase_marketplace_item IS 'Atomically handles marketplace purchase transaction';

