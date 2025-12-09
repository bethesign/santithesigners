-- Secret Santa 2024 - Database Schema
-- Esegui questo script nel SQL Editor di Supabase

-- ============================================
-- 1. USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  city TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  has_uploaded_gift BOOLEAN DEFAULT FALSE,

  -- Shipping address
  shipping_address_street TEXT,
  shipping_address_city TEXT,
  shipping_address_zip TEXT,
  shipping_address_province TEXT,
  shipping_address_notes TEXT,
  is_shipping_address_complete BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index per performance
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

-- ============================================
-- 2. GIFTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type TEXT NOT NULL CHECK (type IN ('digital', 'physical')),
  title TEXT NOT NULL,

  -- Digital gift fields
  url TEXT,
  file_path TEXT, -- Supabase Storage path

  -- Physical gift fields
  photo_url TEXT, -- Supabase Storage path

  -- Common
  message TEXT,
  notes TEXT, -- Private notes, visible only to giver + admin

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Index per performance
CREATE INDEX IF NOT EXISTS gifts_user_id_idx ON gifts(user_id);
CREATE INDEX IF NOT EXISTS gifts_type_idx ON gifts(type);

-- ============================================
-- 3. QUIZ_QUESTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserisci domanda default
INSERT INTO quiz_questions (question_text, is_active)
VALUES ('Qual è il tuo film di Natale preferito?', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. QUIZ_ANSWERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, question_id)
);

-- Index per performance (fondamentale per ordinamento velocità)
CREATE INDEX IF NOT EXISTS quiz_answers_answered_at_idx ON quiz_answers(answered_at);
CREATE INDEX IF NOT EXISTS quiz_answers_user_id_idx ON quiz_answers(user_id);

-- ============================================
-- 5. EXTRACTION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS extraction (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- giver
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- sealed
  order_position INTEGER NOT NULL,
  revealed_at TIMESTAMP WITH TIME ZONE, -- NULL finché non rivelato
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id),
  UNIQUE(receiver_id),
  UNIQUE(order_position)
);

-- Index per performance
CREATE INDEX IF NOT EXISTS extraction_user_id_idx ON extraction(user_id);
CREATE INDEX IF NOT EXISTS extraction_receiver_id_idx ON extraction(receiver_id);
CREATE INDEX IF NOT EXISTS extraction_order_position_idx ON extraction(order_position);
CREATE INDEX IF NOT EXISTS extraction_revealed_at_idx ON extraction(revealed_at);

-- ============================================
-- 6. SETTINGS TABLE (Singleton)
-- ============================================

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,

  -- Date configuration
  gifts_start_date TIMESTAMP WITH TIME ZONE,
  gifts_deadline TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  quiz_available_date TIMESTAMP WITH TIME ZONE,
  extraction_available_date TIMESTAMP WITH TIME ZONE,

  -- Extraction state
  draw_enabled BOOLEAN DEFAULT FALSE,
  draw_started BOOLEAN DEFAULT FALSE,
  current_turn INTEGER DEFAULT 0,

  -- Audit timestamps
  extraction_generated_at TIMESTAMP WITH TIME ZONE,
  extraction_started_at TIMESTAMP WITH TIME ZONE,
  extraction_completed_at TIMESTAMP WITH TIME ZONE,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT single_settings_row CHECK (id = 1)
);

-- Inserisci riga singleton
INSERT INTO settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ============================================
-- 7. FEEDBACK TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Index per performance
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON feedback(user_id);
CREATE INDEX IF NOT EXISTS feedback_rating_idx ON feedback(rating);

-- ============================================
-- 8. TRIGGERS per updated_at
-- ============================================

-- Function per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger per gifts
DROP TRIGGER IF EXISTS update_gifts_updated_at ON gifts;
CREATE TRIGGER update_gifts_updated_at
    BEFORE UPDATE ON gifts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger per settings
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Abilita RLS su tutte le tabelle
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE extraction ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- GIFTS POLICIES
-- ============================================

-- Users can manage their own gift
CREATE POLICY "Users can manage own gift" ON gifts
  FOR ALL USING (user_id = auth.uid());

-- After extraction, users can see received gift
CREATE POLICY "Users can see received gift" ON gifts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM extraction
      WHERE extraction.receiver_id = auth.uid()
        AND extraction.revealed_at IS NOT NULL
        AND gifts.user_id = extraction.user_id
    )
  );

-- Admins can read all gifts
CREATE POLICY "Admins can read all gifts" ON gifts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- QUIZ_QUESTIONS POLICIES
-- ============================================

-- Everyone can read active questions
CREATE POLICY "Everyone can read active questions" ON quiz_questions
  FOR SELECT USING (is_active = true);

-- Admins can manage questions
CREATE POLICY "Admins can manage questions" ON quiz_questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- QUIZ_ANSWERS POLICIES
-- ============================================

-- Users can manage their own answers
CREATE POLICY "Users can manage own answers" ON quiz_answers
  FOR ALL USING (user_id = auth.uid());

-- Admins can read all answers
CREATE POLICY "Admins can read all answers" ON quiz_answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- EXTRACTION POLICIES
-- ============================================

-- Users can read their own extraction row
CREATE POLICY "Users can read own extraction" ON extraction
  FOR SELECT USING (user_id = auth.uid());

-- Everyone can read revealed extractions
CREATE POLICY "Everyone can read revealed extractions" ON extraction
  FOR SELECT USING (revealed_at IS NOT NULL);

-- Admins can manage all extractions
CREATE POLICY "Admins can manage extractions" ON extraction
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- SETTINGS POLICIES
-- ============================================

-- Everyone can read settings
CREATE POLICY "Everyone can read settings" ON settings
  FOR SELECT USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update settings" ON settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- FEEDBACK POLICIES
-- ============================================

-- Users can manage their own feedback
CREATE POLICY "Users can manage own feedback" ON feedback
  FOR ALL USING (user_id = auth.uid());

-- Admins can read all feedback
CREATE POLICY "Admins can read all feedback" ON feedback
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- REALTIME
-- ============================================

-- Abilita realtime su extraction (per live page)
ALTER PUBLICATION supabase_realtime ADD TABLE extraction;

-- Abilita realtime su settings (per current_turn)
ALTER PUBLICATION supabase_realtime ADD TABLE settings;

-- ============================================
-- FINE SCHEMA
-- ============================================

-- Verifica che tutto sia stato creato
SELECT
  'Tables created successfully!' as status,
  COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'gifts', 'quiz_questions', 'quiz_answers', 'extraction', 'settings', 'feedback');
