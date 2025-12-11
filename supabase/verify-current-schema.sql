-- ============================================
-- VERIFY CURRENT DATABASE SCHEMA
-- ============================================
-- Check which columns exist in quiz_questions and quiz_answers

SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('quiz_questions', 'quiz_answers')
  AND table_schema = 'public'
ORDER BY
  CASE table_name
    WHEN 'quiz_questions' THEN 1
    WHEN 'quiz_answers' THEN 2
  END,
  ordinal_position;
