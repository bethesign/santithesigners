-- Fix infinite recursion in RLS policies
-- The problem: admin policies were querying the users table,
-- which triggers RLS policies, creating infinite recursion

-- Drop the problematic admin policies
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Method 1: Use a helper function with SECURITY DEFINER
-- This function bypasses RLS to check if a user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- Recreate admin policies using the helper function
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (public.is_admin());

-- Verify policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users';
