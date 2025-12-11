-- ============================================
-- FIX RLS POLICIES FOR QUIZ_QUESTIONS TABLE
-- ============================================

-- 1. Drop existing policies if any
DROP POLICY IF EXISTS "quiz_questions_select" ON quiz_questions;
DROP POLICY IF EXISTS "quiz_questions_update_admin" ON quiz_questions;
DROP POLICY IF EXISTS "quiz_questions_insert_admin" ON quiz_questions;

-- 2. Enable RLS
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- 3. Allow everyone to SELECT quiz questions (read-only for users)
CREATE POLICY "quiz_questions_select" ON quiz_questions
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. Allow ADMINS to UPDATE quiz questions
CREATE POLICY "quiz_questions_update_admin" ON quiz_questions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 5. Allow ADMINS to INSERT quiz questions
CREATE POLICY "quiz_questions_insert_admin" ON quiz_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 6. Verify policies were created
SELECT 'RLS Policies created successfully for quiz_questions!' as status;

SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'quiz_questions'
ORDER BY policyname;
