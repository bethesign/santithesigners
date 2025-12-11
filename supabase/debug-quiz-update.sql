-- ============================================
-- DEBUG QUIZ UPDATE ISSUE
-- ============================================

-- 1. Show ALL quiz questions (active and inactive)
SELECT
  id,
  question_text,
  question_type,
  is_active,
  correct_answer,
  time_limit,
  created_at
FROM quiz_questions
ORDER BY created_at DESC;

-- 2. Check RLS policies on quiz_questions
SELECT
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'quiz_questions';

-- 3. Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'quiz_questions';

-- 4. Test if you can UPDATE directly (bypassing RLS as postgres user)
-- This will tell us if the issue is RLS or something else
-- NOTE: Copy the actual ID from the first query above
-- UPDATE quiz_questions
-- SET time_limit = 65
-- WHERE id = 'YOUR_ACTUAL_ID_HERE';
