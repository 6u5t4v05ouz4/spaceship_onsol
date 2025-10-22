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
-- IMPORTANT: Use auth.jwt() ->> 'email' directly to avoid "permission denied for table users"
-- Do NOT query auth.users table as it requires special permissions

CREATE POLICY "user_settings_select_policy"
  ON user_settings FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE google_email = (auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "user_settings_insert_policy"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE google_email = (auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "user_settings_update_policy"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE google_email = (auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE google_email = (auth.jwt() ->> 'email')
    )
  );

-- Grant permissions to all necessary roles
-- This is crucial - RLS policies won't work without these grants
GRANT ALL ON user_settings TO authenticated;
GRANT ALL ON user_settings TO anon;
GRANT ALL ON user_settings TO authenticator; -- PostgREST uses this role

-- Also grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticator;

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'user_settings'
ORDER BY policyname;

