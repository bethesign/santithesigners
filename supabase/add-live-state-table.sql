-- ============================================
-- CREATE LIVE_STATE TABLE FOR SHARED EXTRACTION EVENT
-- ============================================

-- Create table to track live reveal state
CREATE TABLE IF NOT EXISTS live_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  revealing_gift_id UUID REFERENCES gifts(id) ON DELETE SET NULL,
  revealed_at TIMESTAMPTZ,
  CHECK (id = 1)  -- Ensure only one row exists
);

-- Insert the single row
INSERT INTO live_state (id, revealing_gift_id, revealed_at)
VALUES (1, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE live_state ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read live state
CREATE POLICY "live_state_select" ON live_state
  FOR SELECT TO authenticated USING (true);

-- Allow everyone to update (anyone whose turn it is can trigger reveal)
-- The turn validation happens in application code
CREATE POLICY "live_state_update_all" ON live_state
  FOR UPDATE TO authenticated USING (true);

-- Verify creation
SELECT 'live_state table created successfully!' as status;
SELECT * FROM live_state;
