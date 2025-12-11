-- ============================================
-- FIX QUIZ_ANSWERS DELETE POLICY FOR ADMIN
-- ============================================
-- Allow admins to delete quiz answers for testing

-- Check existing policies
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'quiz_answers';

-- Drop existing DELETE policy if exists
DROP POLICY IF EXISTS "quiz_answers_delete" ON quiz_answers;
DROP POLICY IF EXISTS "quiz_answers_delete_own" ON quiz_answers;

-- Create new DELETE policy: users can delete their own, admins can delete all
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

-- Verify
SELECT 'Quiz answers DELETE policy updated!' as status;
SELECT tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'quiz_answers'
ORDER BY cmd, policyname;
