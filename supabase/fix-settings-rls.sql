-- ============================================
-- FIX RLS POLICIES FOR SETTINGS TABLE
-- ============================================

-- 1. Drop existing policies if any
DROP POLICY IF EXISTS "settings_select" ON settings;
DROP POLICY IF EXISTS "settings_update_admin" ON settings;
DROP POLICY IF EXISTS "settings_insert_admin" ON settings;

-- 2. Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 3. Allow everyone to SELECT settings (read-only for users)
CREATE POLICY "settings_select" ON settings
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. Allow ADMINS to UPDATE settings
CREATE POLICY "settings_update_admin" ON settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 5. Allow ADMINS to INSERT settings (for initial setup)
CREATE POLICY "settings_insert_admin" ON settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 6. Ensure settings record exists with ID = 1
INSERT INTO settings (id, gifts_deadline)
VALUES (1, NOW() + INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

-- 7. Verify
SELECT 'RLS Policies created successfully!' as status;
SELECT * FROM settings WHERE id = 1;
