-- Initialize settings table with default values
-- This is required for the dashboard to work

-- Insert default settings if not exists
INSERT INTO settings (id, gifts_deadline, extraction_available_date)
VALUES (
  1,
  NOW() + INTERVAL '7 days', -- Deadline tra 7 giorni
  NOW() + INTERVAL '10 days' -- Estrazione tra 10 giorni
)
ON CONFLICT (id) DO NOTHING;

-- Verify settings exist
SELECT * FROM settings WHERE id = 1;
