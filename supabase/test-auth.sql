-- ============================================
-- TEST AUTHENTICATION
-- ============================================
-- Questo script deve essere eseguito tramite il client (non SQL Editor)
-- perché auth.uid() funziona solo con richieste autenticate

-- INVECE, verifica se ci sono utenti nella tabella users
SELECT
  id,
  email,
  full_name,
  role
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- Verifica se ci sono dati nelle altre tabelle
SELECT 'gifts' as table_name, COUNT(*) as row_count FROM gifts
UNION ALL
SELECT 'quiz_answers', COUNT(*) FROM quiz_answers
UNION ALL
SELECT 'extraction', COUNT(*) FROM extraction;
