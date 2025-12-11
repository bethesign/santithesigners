-- Check current active question details
SELECT
  id,
  question_text,
  question_type,
  options,
  correct_answer,
  time_limit,
  is_active,
  created_at
FROM quiz_questions
WHERE is_active = true;
