-- ============================================
-- FIX RLS POLICIES - ADD AUTHENTICATED ROLE
-- ============================================
-- Le policies devono essere associate al ruolo 'authenticated'
-- per funzionare con utenti loggati via Supabase Auth

-- ============================================
-- 1. DROP EXISTING POLICIES
-- ============================================
DROP POLICY IF EXISTS "gifts_own" ON gifts;
DROP POLICY IF EXISTS "gifts_received" ON gifts;
DROP POLICY IF EXISTS "quiz_answers_own" ON quiz_answers;
DROP POLICY IF EXISTS "extraction_own_turn" ON extraction;
DROP POLICY IF EXISTS "extraction_revealed" ON extraction;
DROP POLICY IF EXISTS "extraction_update_own" ON extraction;

-- ============================================
-- 2. RECREATE WITH PROPER ROLE
-- ============================================

-- GIFTS: Users manage own gifts
CREATE POLICY "gifts_own" ON gifts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- GIFTS: Users can see received gifts after reveal
CREATE POLICY "gifts_received" ON gifts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM extraction
      WHERE extraction.receiver_id = auth.uid()
        AND extraction.user_id = gifts.user_id
        AND extraction.revealed_at IS NOT NULL
    )
  );

-- QUIZ_ANSWERS: Users manage own answers
CREATE POLICY "quiz_answers_own" ON quiz_answers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- EXTRACTION: Users see own turn
CREATE POLICY "extraction_own_turn" ON extraction
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- EXTRACTION: Users see revealed gifts
CREATE POLICY "extraction_revealed" ON extraction
  FOR SELECT
  TO authenticated
  USING (revealed_at IS NOT NULL);

-- EXTRACTION: Users update own turn
CREATE POLICY "extraction_update_own" ON extraction
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT
  'RLS Policies updated with authenticated role!' as status,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';
