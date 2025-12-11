-- ============================================
-- FIX RLS POLICIES FOR EXTRACTION TABLE
-- ============================================

-- 1. Drop existing policies if any
DROP POLICY IF EXISTS "extraction_select" ON extraction;
DROP POLICY IF EXISTS "extraction_insert_admin" ON extraction;
DROP POLICY IF EXISTS "extraction_update_admin" ON extraction;
DROP POLICY IF EXISTS "extraction_delete_admin" ON extraction;

-- 2. Enable RLS
ALTER TABLE extraction ENABLE ROW LEVEL SECURITY;

-- 3. Allow everyone to SELECT extraction records (read-only for users)
CREATE POLICY "extraction_select" ON extraction
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. Allow ADMINS to INSERT extraction records
CREATE POLICY "extraction_insert_admin" ON extraction
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 5. Allow ADMINS to UPDATE extraction records
CREATE POLICY "extraction_update_admin" ON extraction
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 6. Allow ADMINS to DELETE extraction records
CREATE POLICY "extraction_delete_admin" ON extraction
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 7. Verify policies were created
SELECT 'RLS Policies created successfully for extraction table!' as status;

SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'extraction'
ORDER BY policyname;
