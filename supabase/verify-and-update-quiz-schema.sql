-- Verifica e aggiorna schema quiz se necessario
-- Esegui questo nel Supabase Dashboard → SQL Editor

-- Verifica colonne esistenti
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'quiz_questions'
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'quiz_answers'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Se le colonne non esistono, eseguile:

-- 1. Aggiungi colonne a quiz_questions
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('open', 'multiple_choice')),
ADD COLUMN IF NOT EXISTS options JSONB,
ADD COLUMN IF NOT EXISTS correct_answer TEXT;

-- 2. Aggiungi colonne a quiz_answers
ALTER TABLE quiz_answers
ADD COLUMN IF NOT EXISTS is_correct BOOLEAN,
ADD COLUMN IF NOT EXISTS time_elapsed INTEGER;

-- 3. Crea indici
CREATE INDEX IF NOT EXISTS idx_quiz_answers_correct_time ON quiz_answers(is_correct, time_elapsed);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question ON quiz_answers(question_id);

-- 4. Verifica risultato
SELECT 'Schema aggiornato!' as status;
