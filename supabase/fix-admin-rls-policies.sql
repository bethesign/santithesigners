-- ============================================
-- FIX RLS POLICIES FOR ADMIN ACCESS
-- ============================================
-- Ensure admin users can see all data in the participants panel

-- Drop and recreate users SELECT policy to allow admins to see everyone
DROP POLICY IF EXISTS "users_select" ON users;
CREATE POLICY "users_select" ON users
  FOR SELECT TO authenticated
  USING (
    -- Users can see their own data OR if they are admin, see everyone
    auth.uid() = id
    OR
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Ensure quiz_answers can be read by admins
DROP POLICY IF EXISTS "quiz_answers_select_own" ON quiz_answers;
DROP POLICY IF EXISTS "quiz_answers_select" ON quiz_answers;
CREATE POLICY "quiz_answers_select" ON quiz_answers
  FOR SELECT TO authenticated
  USING (
    -- Users can see their own answers OR admins can see all answers
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Ensure gifts can be read by admins
DROP POLICY IF EXISTS "gifts_select_own" ON gifts;
DROP POLICY IF EXISTS "gifts_select" ON gifts;
CREATE POLICY "gifts_select" ON gifts
  FOR SELECT TO authenticated
  USING (
    -- Admins can see all gifts
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Verify policies
SELECT 'Admin RLS policies updated successfully!' as status;
SELECT tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'quiz_answers', 'gifts')
ORDER BY tablename, policyname;
