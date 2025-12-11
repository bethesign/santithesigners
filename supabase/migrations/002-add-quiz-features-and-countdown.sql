-- ============================================
-- MIGRATION: Add Quiz Features & Countdown Timer
-- Date: 2025-12-11
-- Purpose: Fix quiz data mismatch and add countdown feature
-- ============================================

-- 1. EXTEND quiz_questions table
ALTER TABLE quiz_questions
  ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'multiple_choice'
    CHECK (question_type IN ('open', 'multiple_choice')),
  ADD COLUMN IF NOT EXISTS options JSONB,
  ADD COLUMN IF NOT EXISTS correct_answer TEXT,
  ADD COLUMN IF NOT EXISTS time_limit INTEGER CHECK (time_limit > 0);

-- Add comments for documentation
COMMENT ON COLUMN quiz_questions.question_type IS 'Question type: open (free text) or multiple_choice';
COMMENT ON COLUMN quiz_questions.options IS 'JSON array: [{value: "A", text: "Answer text"}, ...]';
COMMENT ON COLUMN quiz_questions.correct_answer IS 'Correct option value (e.g., "A", "B", "C", "D", "E")';
COMMENT ON COLUMN quiz_questions.time_limit IS 'Time limit in seconds (e.g., 60 for 1 minute, 300 for 5 minutes)';

-- 2. EXTEND quiz_answers table
ALTER TABLE quiz_answers
  ADD COLUMN IF NOT EXISTS is_correct BOOLEAN,
  ADD COLUMN IF NOT EXISTS time_elapsed INTEGER;

COMMENT ON COLUMN quiz_answers.is_correct IS 'Whether answer is correct (null for open-ended questions)';
COMMENT ON COLUMN quiz_answers.time_elapsed IS 'Time taken to answer in seconds';

-- 3. CREATE INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_quiz_answers_correct_time
  ON quiz_answers(question_id, is_correct DESC NULLS LAST, time_elapsed ASC);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_active
  ON quiz_questions(is_active) WHERE is_active = true;

-- 4. DATA CLEANUP: Ensure only ONE active question
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
  FROM quiz_questions
  WHERE is_active = true
)
UPDATE quiz_questions
SET is_active = false
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- 5. VERIFY migration success
SELECT
  'Migration successful!' as status,
  (SELECT COUNT(*) FROM quiz_questions WHERE is_active = true) as active_questions,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = 'quiz_questions' AND column_name = 'time_limit') as has_time_limit,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = 'quiz_questions' AND column_name = 'options') as has_options,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = 'quiz_answers' AND column_name = 'is_correct') as has_is_correct;
