-- ============================================
-- VERIFY QUIZ DATA
-- ============================================
-- Check how many active questions exist and their data

-- Count active questions
SELECT
  'Active Questions' as check_type,
  COUNT(*) as count
FROM quiz_questions
WHERE is_active = true;

-- Show recent questions
SELECT
  id,
  question_text,
  is_active,
  created_at,
  -- Try to access new columns if they exist
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quiz_questions' AND column_name = 'question_type'
  ) THEN 'has question_type column' ELSE 'MISSING question_type' END as type_status,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quiz_questions' AND column_name = 'options'
  ) THEN 'has options column' ELSE 'MISSING options' END as options_status
FROM quiz_questions
ORDER BY created_at DESC
LIMIT 5;
