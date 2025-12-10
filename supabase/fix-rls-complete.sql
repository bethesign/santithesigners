-- ============================================
-- FIX COMPLETO RLS POLICIES
-- ============================================
-- Questo script risolve gli errori 406 (Not Acceptable)
-- che impediscono il caricamento dei dati nella dashboard
--
-- ESEGUI QUESTO SCRIPT NEL SUPABASE DASHBOARD
-- ============================================

-- ============================================
-- 1. USERS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- Policy semplice: utenti leggono/modificano solo i propri dati
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. GIFTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can manage own gift" ON gifts;
DROP POLICY IF EXISTS "Users can see received gift" ON gifts;
DROP POLICY IF EXISTS "Admins can read all gifts" ON gifts;

-- Gli utenti possono gestire il proprio regalo
CREATE POLICY "gifts_own" ON gifts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Gli utenti possono vedere il regalo ricevuto dopo l'estrazione
CREATE POLICY "gifts_received" ON gifts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM extraction
      WHERE extraction.receiver_id = auth.uid()
        AND extraction.user_id = gifts.user_id
        AND extraction.revealed_at IS NOT NULL
    )
  );

-- ============================================
-- 3. QUIZ_ANSWERS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can manage own answers" ON quiz_answers;
DROP POLICY IF EXISTS "Admins can read all answers" ON quiz_answers;

-- Gli utenti possono gestire le proprie risposte
CREATE POLICY "quiz_answers_own" ON quiz_answers
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. EXTRACTION TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can read own extraction" ON extraction;
DROP POLICY IF EXISTS "Everyone can read revealed extractions" ON extraction;
DROP POLICY IF EXISTS "Admins can manage extractions" ON extraction;

-- Gli utenti possono vedere il proprio turno
CREATE POLICY "extraction_own_turn" ON extraction
  FOR SELECT
  USING (auth.uid() = user_id);

-- Gli utenti possono vedere i regali rivelati (per la live)
CREATE POLICY "extraction_revealed" ON extraction
  FOR SELECT
  USING (revealed_at IS NOT NULL);

-- Gli utenti possono aggiornare il proprio turno (quando aprono)
CREATE POLICY "extraction_update_own" ON extraction
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. QUIZ_QUESTIONS TABLE
-- ============================================
DROP POLICY IF EXISTS "Everyone can read active questions" ON quiz_questions;
DROP POLICY IF EXISTS "Admins can manage questions" ON quiz_questions;
DROP POLICY IF EXISTS "quiz_questions_select_all" ON quiz_questions;

-- Tutti possono leggere le domande attive
CREATE POLICY "quiz_questions_read_active" ON quiz_questions
  FOR SELECT
  USING (is_active = true);

-- ============================================
-- 6. SETTINGS TABLE
-- ============================================
DROP POLICY IF EXISTS "Everyone can read settings" ON settings;
DROP POLICY IF EXISTS "Admins can update settings" ON settings;

-- Tutti possono leggere le impostazioni
CREATE POLICY "settings_read_all" ON settings
  FOR SELECT
  USING (true);

-- ============================================
-- 7. FEEDBACK TABLE (se esiste)
-- ============================================
DROP POLICY IF EXISTS "Users can create feedback" ON feedback;
DROP POLICY IF EXISTS "Users can read own feedback" ON feedback;

-- Gli utenti possono creare feedback
CREATE POLICY "feedback_create" ON feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Gli utenti possono leggere il proprio feedback
CREATE POLICY "feedback_read_own" ON feedback
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- VERIFICA
-- ============================================
SELECT
  'RLS Policies fixed successfully!' as status,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies;

-- Mostra tutte le policy create
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
