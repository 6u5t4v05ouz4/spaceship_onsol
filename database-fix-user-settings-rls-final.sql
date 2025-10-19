-- Fix user_settings RLS policies to work with authenticated users
-- Date: 2025-10-19
-- Issue: 403 permission denied when accessing user_settings

-- Re-enable RLS (in case it was disabled)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON user_settings;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON user_settings;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_settings;

-- Create new policies for authenticated users
-- These policies use auth.uid() to get the authenticated user's ID
-- Then query auth.users to get their email
-- Then match against user_profiles.google_email to get the profile ID

CREATE POLICY "authenticated_users_select_own_settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE google_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "authenticated_users_insert_own_settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE google_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "authenticated_users_update_own_settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE google_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE google_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'user_settings'
ORDER BY policyname;

