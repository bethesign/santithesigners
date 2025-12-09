-- ============================================
-- SETUP COMPLETO SUPABASE - ESEGUI QUESTO
-- ============================================

-- 1. FIX RLS POLICIES (rimuove ricorsione infinita)
-- ============================================

-- Drop TUTTE le policy esistenti per users
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- Crea policy SEMPLICI che funzionano
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. ABILITA RLS su tutte le tabelle
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE extraction ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 3. POLICY per GIFTS
-- ============================================
DROP POLICY IF EXISTS "Users can manage own gift" ON gifts;
DROP POLICY IF EXISTS "Users can see received gift" ON gifts;
DROP POLICY IF EXISTS "gifts_select_own" ON gifts;
DROP POLICY IF EXISTS "gifts_insert_own" ON gifts;
DROP POLICY IF EXISTS "gifts_update_own" ON gifts;

CREATE POLICY "gifts_select_own" ON gifts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "gifts_insert_own" ON gifts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "gifts_update_own" ON gifts
  FOR UPDATE USING (user_id = auth.uid());

-- 4. POLICY per QUIZ
-- ============================================
DROP POLICY IF EXISTS "Everyone can read active questions" ON quiz_questions;
DROP POLICY IF EXISTS "quiz_questions_select_all" ON quiz_questions;
CREATE POLICY "quiz_questions_select_all" ON quiz_questions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own answers" ON quiz_answers;
DROP POLICY IF EXISTS "quiz_answers_select_own" ON quiz_answers;
DROP POLICY IF EXISTS "quiz_answers_insert_own" ON quiz_answers;
CREATE POLICY "quiz_answers_select_own" ON quiz_answers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "quiz_answers_insert_own" ON quiz_answers
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 5. POLICY per SETTINGS (tutti possono leggere)
-- ============================================
DROP POLICY IF EXISTS "Everyone can read settings" ON settings;
DROP POLICY IF EXISTS "settings_select_all" ON settings;
CREATE POLICY "settings_select_all" ON settings
  FOR SELECT USING (true);

-- 6. POLICY per EXTRACTION
-- ============================================
DROP POLICY IF EXISTS "Users can read own extraction" ON extraction;
DROP POLICY IF EXISTS "Everyone can read revealed extractions" ON extraction;
DROP POLICY IF EXISTS "extraction_select_own" ON extraction;
DROP POLICY IF EXISTS "extraction_select_revealed" ON extraction;

CREATE POLICY "extraction_select_own" ON extraction
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "extraction_select_revealed" ON extraction
  FOR SELECT USING (revealed_at IS NOT NULL);

-- 7. POLICY per FEEDBACK
-- ============================================
DROP POLICY IF EXISTS "Users can manage own feedback" ON feedback;
DROP POLICY IF EXISTS "feedback_select_own" ON feedback;
DROP POLICY IF EXISTS "feedback_insert_own" ON feedback;

CREATE POLICY "feedback_select_own" ON feedback
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "feedback_insert_own" ON feedback
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 8. INIZIALIZZA SETTINGS (se non esiste)
-- ============================================
INSERT INTO settings (id, gifts_deadline, extraction_available_date)
VALUES (
  1,
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '10 days'
)
ON CONFLICT (id) DO NOTHING;

-- 9. CREA DOMANDA QUIZ DEFAULT (se non esiste)
-- ============================================
INSERT INTO quiz_questions (question_text, is_active)
VALUES ('Qual è il tuo film di Natale preferito?', true)
ON CONFLICT DO NOTHING;

-- 10. VERIFICA FINALE
-- ============================================
SELECT 'Setup completato!' as status;
SELECT * FROM settings WHERE id = 1;
