-- ============================================
-- TEMPORARY: ALLOW ALL POLICIES FOR TESTING
-- ============================================
-- ATTENZIONE: Questo script è SOLO PER DEBUG
-- Permette l'accesso a tutti i dati autenticati
-- NON USARE IN PRODUZIONE

-- Drop existing policies
DROP POLICY IF EXISTS "gifts_own" ON gifts;
DROP POLICY IF EXISTS "gifts_received" ON gifts;
DROP POLICY IF EXISTS "quiz_answers_own" ON quiz_answers;
DROP POLICY IF EXISTS "extraction_own_turn" ON extraction;
DROP POLICY IF EXISTS "extraction_revealed" ON extraction;
DROP POLICY IF EXISTS "extraction_update_own" ON extraction;

-- Create TEMPORARY allow-all policies
CREATE POLICY "gifts_temp_all" ON gifts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "quiz_answers_temp_all" ON quiz_answers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "extraction_temp_all" ON extraction
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verification
SELECT 'TEMPORARY allow-all policies created. Check if 406 errors disappear.' as status;
