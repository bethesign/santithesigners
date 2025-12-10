-- Aggiorna schema quiz per supportare risposte multiple choice

-- 1. Modifica tabella quiz_questions per supportare opzioni multiple
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'open' CHECK (question_type IN ('open', 'multiple_choice')),
ADD COLUMN IF NOT EXISTS options JSONB, -- Array di opzioni: [{value: 'A', text: 'Risposta A'}, ...]
ADD COLUMN IF NOT EXISTS correct_answer TEXT; -- L'opzione corretta (es: 'A', 'B', 'C', 'D', 'E')

COMMENT ON COLUMN quiz_questions.question_type IS 'Tipo di domanda: open (testo libero) o multiple_choice (scelta multipla)';
COMMENT ON COLUMN quiz_questions.options IS 'Array JSON di opzioni per domande multiple choice';
COMMENT ON COLUMN quiz_questions.correct_answer IS 'Risposta corretta per domande multiple choice (es: A, B, C)';

-- 2. Modifica tabella quiz_answers per registrare tempo e correttezza
ALTER TABLE quiz_answers
ADD COLUMN IF NOT EXISTS is_correct BOOLEAN,
ADD COLUMN IF NOT EXISTS time_elapsed INTEGER; -- Tempo in secondi dall'inizio quiz

COMMENT ON COLUMN quiz_answers.is_correct IS 'Se la risposta è corretta (per domande multiple choice)';
COMMENT ON COLUMN quiz_answers.time_elapsed IS 'Tempo impiegato in secondi dall''inizio del quiz';

-- 3. Crea indici per migliorare performance query classifiche
CREATE INDEX IF NOT EXISTS idx_quiz_answers_correct_time ON quiz_answers(is_correct, time_elapsed);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question ON quiz_answers(question_id);

-- 4. Aggiorna la posizione basata su correttezza + tempo
-- La logica sarà:
-- 1. Prima: risposte corrette ordinate per tempo
-- 2. Dopo: risposte errate ordinate per tempo

-- Esempio query per classifica:
-- SELECT
--   u.full_name,
--   qa.answer,
--   qa.is_correct,
--   qa.time_elapsed,
--   ROW_NUMBER() OVER (
--     ORDER BY
--       CASE WHEN qa.is_correct THEN 0 ELSE 1 END, -- corrette prima
--       qa.time_elapsed ASC -- poi per tempo
--   ) as position
-- FROM quiz_answers qa
-- JOIN users u ON qa.user_id = u.id
-- WHERE qa.question_id = 'xxx'
-- ORDER BY position;
