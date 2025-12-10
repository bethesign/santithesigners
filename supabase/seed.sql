-- Secret Santa 2024 - Seed Data (Development/Testing)
-- Esegui DOPO aver creato lo schema

-- ============================================
-- SEED DATA - UTENTI TEST
-- ============================================

-- Nota: Questi sono utenti pre-caricati nella tabella users
-- Le password verranno create dagli utenti al primo accesso tramite l'app

-- ============================================
-- IMPORTANT: Only add REAL email addresses
-- ============================================
-- Adding fake/test emails will cause Supabase to send confirmation emails
-- to non-existent addresses, triggering high bounce rates and restrictions.
--
-- For local testing: Use your own valid email addresses
-- For production: Add real team member emails only

-- Admin user (UPDATE WITH REAL EMAIL BEFORE PRODUCTION)
-- INSERT INTO users (email, full_name, city, role) VALUES
-- ('your-real-email@domain.com', 'Admin User', 'Milano', 'admin')
-- ON CONFLICT (email) DO NOTHING;

-- Team members (Add real emails when ready)
-- Example:
-- INSERT INTO users (email, full_name, city) VALUES
-- ('real.person@company.com', 'Real Person', 'Milano'),
-- ('another.person@company.com', 'Another Person', 'Roma')
-- ON CONFLICT (email) DO NOTHING;

-- ============================================
-- CONFIGURAZIONE SETTINGS
-- ============================================

-- Configura date evento (modifica secondo necessità)
UPDATE settings SET
  gifts_start_date = NOW(),
  gifts_deadline = NOW() + INTERVAL '7 days',
  quiz_available_date = NOW(),
  extraction_available_date = NOW() + INTERVAL '8 days',
  draw_enabled = FALSE,
  draw_started = FALSE,
  current_turn = 0
WHERE id = 1;

-- ============================================
-- DATI DI TEST (Solo per development)
-- ============================================

-- ATTENZIONE: Commenta questa sezione se vuoi iniziare con DB pulito
-- Questa sezione simula alcuni utenti che hanno già completato quiz e caricato regali

-- Simula risposte quiz per alcuni utenti (con timestamp progressivi)
-- Nota: user_id deve corrispondere agli UUID reali dalla tabella users
/*
INSERT INTO quiz_answers (user_id, question_id, answer, answered_at)
SELECT
  u.id,
  (SELECT id FROM quiz_questions WHERE is_active = true LIMIT 1),
  'Il mio film preferito è: ' || u.full_name,
  NOW() + (ROW_NUMBER() OVER (ORDER BY u.email) * INTERVAL '1 second')
FROM users u
WHERE u.email IN (
  'mario.rossi@thesigners.it',
  'lucia.bianchi@thesigners.it',
  'giovanni.verdi@thesigners.it',
  'paolo.blu@thesigners.it',
  'sara.rosa@thesigners.it'
)
ON CONFLICT (user_id, question_id) DO NOTHING;

-- Segna questi utenti come aventi caricato il regalo
UPDATE users SET has_uploaded_gift = true
WHERE email IN (
  'mario.rossi@thesigners.it',
  'lucia.bianchi@thesigners.it',
  'giovanni.verdi@thesigners.it',
  'paolo.blu@thesigners.it',
  'sara.rosa@thesigners.it'
);

-- Inserisci alcuni regali di esempio
INSERT INTO gifts (user_id, type, title, message)
SELECT
  u.id,
  CASE WHEN ROW_NUMBER() OVER (ORDER BY u.email) % 2 = 0 THEN 'digital' ELSE 'physical' END,
  'Regalo di test da ' || u.full_name,
  'Questo è un messaggio di test. Buon Natale!'
FROM users u
WHERE u.email IN (
  'mario.rossi@thesigners.it',
  'lucia.bianchi@thesigners.it',
  'giovanni.verdi@thesigners.it'
)
ON CONFLICT (user_id) DO NOTHING;
*/

-- ============================================
-- QUERY UTILI PER VERIFICA
-- ============================================

-- Verifica utenti creati
SELECT
  'Total users:' as metric,
  COUNT(*) as count
FROM users;

-- Verifica utenti con quiz completato
SELECT
  'Users with quiz completed:' as metric,
  COUNT(DISTINCT qa.user_id) as count
FROM quiz_answers qa;

-- Verifica utenti con regalo caricato
SELECT
  'Users with gift uploaded:' as metric,
  COUNT(*) as count
FROM users
WHERE has_uploaded_gift = true;

-- Verifica partecipanti validi (quiz + regalo)
SELECT
  'Valid participants:' as metric,
  COUNT(*) as count
FROM users u
WHERE u.has_uploaded_gift = true
  AND EXISTS (SELECT 1 FROM quiz_answers qa WHERE qa.user_id = u.id);

-- ============================================
-- RESET SCRIPT (Per test multipli)
-- ============================================

-- Decommenta e esegui per resettare tutto (ATTENZIONE: Cancella tutti i dati!)
/*
-- Reset extraction
DELETE FROM extraction;

-- Reset feedback
DELETE FROM feedback;

-- Reset quiz answers
DELETE FROM quiz_answers;

-- Reset gifts
DELETE FROM gifts;

-- Reset users (tranne admin)
DELETE FROM users WHERE role != 'admin';

-- Reset settings
UPDATE settings SET
  draw_enabled = FALSE,
  draw_started = FALSE,
  current_turn = 0,
  extraction_generated_at = NULL,
  extraction_started_at = NULL,
  extraction_completed_at = NULL
WHERE id = 1;

-- Verifica reset
SELECT 'Database reset completed' as status;
*/

-- ============================================
-- FINE SEED DATA
-- ============================================

SELECT 'Seed data inserted successfully!' as status;
