-- ============================================================================
-- INITIALIZE USER DATA FUNCTION
-- ============================================================================
-- This function creates all necessary default data for a new user
-- in a single transaction to avoid inconsistencies
-- Called automatically after first Google OAuth login
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.initialize_user_data(TEXT, TEXT, TEXT, TEXT);

-- Create function to initialize all user data
CREATE OR REPLACE FUNCTION public.initialize_user_data(
  p_google_email TEXT,
  p_display_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_auth_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  profile_id UUID,
  settings_id UUID,
  stats_id UUID,
  wallet_id UUID,
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_profile_id UUID;
  v_settings_id UUID;
  v_stats_id UUID;
  v_wallet_id UUID;
  v_display_name TEXT;
BEGIN
  -- Set default display name if not provided
  v_display_name := COALESCE(p_display_name, split_part(p_google_email, '@', 1));

  -- Check if user profile already exists
  SELECT id INTO v_profile_id
  FROM public.user_profiles
  WHERE google_email = p_google_email;

  IF v_profile_id IS NOT NULL THEN
    -- User already initialized, return existing IDs
    RETURN QUERY
    SELECT 
      v_profile_id,
      us.id as settings_id,
      ps.id as stats_id,
      pw.id as wallet_id,
      TRUE as success,
      'User already initialized'::TEXT as message
    FROM public.user_settings us
    LEFT JOIN public.player_stats ps ON ps.user_id = v_profile_id
    LEFT JOIN public.player_wallet pw ON pw.user_id = v_profile_id
    WHERE us.user_id = v_profile_id
    LIMIT 1;
    RETURN;
  END IF;

  -- Start transaction (implicit in function)
  
  -- 1. Create user profile
  INSERT INTO public.user_profiles (
    google_email,
    display_name,
    avatar_url,
    ship_type,
    ship_rarity
  ) VALUES (
    p_google_email,
    v_display_name,
    p_avatar_url,
    'default_idle',  -- Default ship for users without NFT
    'Comum'          -- Default rarity
  )
  RETURNING id INTO v_profile_id;

  -- 2. Create user settings
  INSERT INTO public.user_settings (
    user_id,
    notifications_enabled,
    sound_enabled
  ) VALUES (
    v_profile_id,
    TRUE,  -- Notifications enabled by default
    TRUE   -- Sound enabled by default
  )
  RETURNING id INTO v_settings_id;

  -- 3. Create player stats
  INSERT INTO public.player_stats (
    user_id,
    sessions_count,
    total_play_time_seconds,
    planets_discovered,
    total_mining_sessions,
    total_battles,
    battles_won,
    total_items_crafted,
    distance_traveled,
    total_tokens_earned
  ) VALUES (
    v_profile_id,
    0,  -- No sessions yet
    0,  -- No play time yet
    0,  -- No planets discovered
    0,  -- No mining sessions
    0,  -- No battles
    0,  -- No wins
    0,  -- No items crafted
    0,  -- No distance traveled
    0   -- No tokens earned
  )
  RETURNING id INTO v_stats_id;

  -- 4. Create player wallet
  INSERT INTO public.player_wallet (
    user_id,
    space_tokens,
    sol_tokens
  ) VALUES (
    v_profile_id,
    0,    -- Start with 0 space tokens
    0.0   -- Start with 0 SOL tokens
  )
  RETURNING id INTO v_wallet_id;

  -- Return success
  RETURN QUERY
  SELECT 
    v_profile_id,
    v_settings_id,
    v_stats_id,
    v_wallet_id,
    TRUE as success,
    'User data initialized successfully'::TEXT as message;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error
    RETURN QUERY
    SELECT 
      NULL::UUID,
      NULL::UUID,
      NULL::UUID,
      NULL::UUID,
      FALSE as success,
      SQLERRM::TEXT as message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.initialize_user_data(TEXT, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_user_data(TEXT, TEXT, TEXT, UUID) TO anon;

-- Add comment
COMMENT ON FUNCTION public.initialize_user_data IS 
'Initializes all necessary data for a new user in a single transaction. 
Called automatically after first Google OAuth login.
Returns profile_id, settings_id, stats_id, wallet_id, success flag, and message.';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Test the function (replace with actual email)
-- SELECT * FROM public.initialize_user_data('test@example.com', 'Test User', NULL, NULL);

