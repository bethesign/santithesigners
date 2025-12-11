-- ============================================
-- VERIFY RLS POLICIES FOR QUIZ_QUESTIONS
-- ============================================

-- 1. Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'quiz_questions';

-- 2. List all policies on quiz_questions
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'quiz_questions'
ORDER BY policyname;

-- 3. Check current active question
SELECT
  id,
  question_text,
  question_type,
  correct_answer,
  time_limit,
  is_active,
  created_at
FROM quiz_questions
WHERE is_active = true;

-- 4. Verify admin user role (replace with your email)
-- NOTE: Update the email to match the logged-in admin user
SELECT id, email, role
FROM users
WHERE role = 'admin';
