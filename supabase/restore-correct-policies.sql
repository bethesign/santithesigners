-- ============================================
-- RESTORE CORRECT RLS POLICIES
-- ============================================
-- Ripristina le policies corrette dopo il debug
-- Gli utenti possono accedere SOLO ai propri dati

-- ============================================
-- 1. DROP TEMPORARY POLICIES
-- ============================================
DROP POLICY IF EXISTS "gifts_temp_all" ON gifts;
DROP POLICY IF EXISTS "quiz_answers_temp_all" ON quiz_answers;
DROP POLICY IF EXISTS "extraction_temp_all" ON extraction;
DROP POLICY IF EXISTS "gifts_own" ON gifts;
DROP POLICY IF EXISTS "gifts_received" ON gifts;
DROP POLICY IF EXISTS "quiz_answers_own" ON quiz_answers;
DROP POLICY IF EXISTS "extraction_own_turn" ON extraction;
DROP POLICY IF EXISTS "extraction_revealed" ON extraction;
DROP POLICY IF EXISTS "extraction_update_own" ON extraction;

-- ============================================
-- 2. GIFTS POLICIES
-- ============================================

-- Users can manage their own gifts (create, read, update, delete)
CREATE POLICY "gifts_own" ON gifts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can see gifts they received (after extraction is revealed)
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

-- ============================================
-- 3. QUIZ_ANSWERS POLICIES
-- ============================================

-- Users can manage their own quiz answers
CREATE POLICY "quiz_answers_own" ON quiz_answers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. EXTRACTION POLICIES
-- ============================================

-- Users can see their own extraction turn
CREATE POLICY "extraction_own_turn" ON extraction
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can see all revealed extractions (for live event)
CREATE POLICY "extraction_revealed" ON extraction
  FOR SELECT
  TO authenticated
  USING (revealed_at IS NOT NULL);

-- Users can update their own turn (when they reveal their gift)
CREATE POLICY "extraction_update_own" ON extraction
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT
  '✅ Correct RLS policies restored!' as status,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';

-- Show all policies
SELECT
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('gifts', 'quiz_answers', 'extraction')
ORDER BY tablename, policyname;
