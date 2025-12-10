-- ============================================
-- VERIFICA STATO RLS POLICIES
-- ============================================
-- Esegui questo script per vedere quali policies esistono

-- 1. Verifica se RLS è abilitato sulle tabelle
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'gifts', 'quiz_answers', 'extraction', 'quiz_questions', 'settings', 'feedback')
ORDER BY tablename;

-- 2. Lista tutte le policies esistenti
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
ORDER BY tablename, policyname;

-- 3. Conta policies per tabella
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
