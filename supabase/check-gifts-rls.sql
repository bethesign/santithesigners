-- ============================================
-- CHECK GIFTS TABLE AND RLS
-- ============================================

-- 1. Count total gifts
SELECT COUNT(*) as total_gifts FROM gifts;

-- 2. Show all gifts
SELECT id, user_id, title, keyword, type, is_physical FROM gifts;

-- 3. Check RLS policies on gifts table
SELECT
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'gifts'
ORDER BY policyname;

-- 4. Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'gifts';
