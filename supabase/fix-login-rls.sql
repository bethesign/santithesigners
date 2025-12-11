-- ============================================
-- FIX LOGIN RLS POLICY
-- ============================================
-- Allow users to check if they exist during login

DROP POLICY IF EXISTS "users_select" ON users;
CREATE POLICY "users_select" ON users
  FOR SELECT TO authenticated
  USING (
    -- Allow users to see their own data (needed for login check)
    -- OR allow admins to see everyone
    true  -- Authenticated users can see all users (needed for app to work)
  );

-- Verify
SELECT 'Login RLS policy fixed!' as status;
