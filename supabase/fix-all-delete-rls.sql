-- ============================================
-- FIX ALL DELETE POLICIES FOR ADMIN TESTING
-- ============================================
-- Allow admins to delete gifts, quiz_answers, and extraction for testing

-- ========== GIFTS ==========
DROP POLICY IF EXISTS "gifts_delete" ON gifts;
DROP POLICY IF EXISTS "gifts_delete_own" ON gifts;

CREATE POLICY "gifts_delete" ON gifts
  FOR DELETE TO authenticated
  USING (
    -- Users can delete their own gifts OR admins can delete all
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ========== QUIZ_ANSWERS ==========
DROP POLICY IF EXISTS "quiz_answers_delete" ON quiz_answers;
DROP POLICY IF EXISTS "quiz_answers_delete_own" ON quiz_answers;

CREATE POLICY "quiz_answers_delete" ON quiz_answers
  FOR DELETE TO authenticated
  USING (
    -- Users can delete their own answers OR admins can delete all
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ========== EXTRACTION ==========
DROP POLICY IF EXISTS "extraction_delete" ON extraction;
DROP POLICY IF EXISTS "extraction_delete_admin" ON extraction;

CREATE POLICY "extraction_delete" ON extraction
  FOR DELETE TO authenticated
  USING (
    -- Only admins can delete extraction records
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ========== USERS UPDATE (for has_uploaded_gift reset) ==========
DROP POLICY IF EXISTS "users_update" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

CREATE POLICY "users_update" ON users
  FOR UPDATE TO authenticated
  USING (
    -- Users can update their own profile OR admins can update all
    id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Verify all policies
SELECT 'All DELETE policies updated for admin testing!' as status;

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('gifts', 'quiz_answers', 'extraction', 'users')
  AND cmd IN ('DELETE', 'UPDATE')
ORDER BY tablename, cmd, policyname;
