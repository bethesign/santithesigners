-- ============================================
-- FIX RLS POLICIES FOR GIFTS TABLE
-- ============================================

-- 1. Drop existing policies
DROP POLICY IF EXISTS "gifts_select_own" ON gifts;
DROP POLICY IF EXISTS "gifts_select_all" ON gifts;
DROP POLICY IF EXISTS "gifts_insert_own" ON gifts;
DROP POLICY IF EXISTS "gifts_update_own" ON gifts;
DROP POLICY IF EXISTS "gifts_delete_own" ON gifts;

-- 2. Enable RLS
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- 3. Allow users to SELECT ALL gifts (needed for extraction)
-- During extraction, users need to see other people's gifts to choose
CREATE POLICY "gifts_select_all" ON gifts
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. Allow users to INSERT only their own gifts
CREATE POLICY "gifts_insert_own" ON gifts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5. Allow users to UPDATE only their own gifts
CREATE POLICY "gifts_update_own" ON gifts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Allow users to DELETE only their own gifts (or admins for reset)
CREATE POLICY "gifts_delete_own" ON gifts
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 7. Verify policies were created
SELECT 'RLS Policies created successfully for gifts table!' as status;

SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'gifts'
ORDER BY policyname;
