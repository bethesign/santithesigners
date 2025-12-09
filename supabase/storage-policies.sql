-- Secret Santa 2024 - Supabase Storage Configuration
-- Esegui DOPO aver creato il bucket "gifts" nell'interfaccia Supabase Storage

-- ============================================
-- STORAGE BUCKET CONFIGURATION
-- ============================================

-- Nota: Prima di eseguire questo script, crea il bucket "gifts" nell'UI di Supabase:
-- 1. Vai su Storage nel menu laterale
-- 2. Clicca "New bucket"
-- 3. Nome: "gifts"
-- 4. Public: NO (lascia privato)
-- 5. File size limit: 10MB
-- 6. Allowed MIME types: image/*, application/pdf, video/*, audio/*, application/zip

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gifts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own files
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'gifts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gifts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gifts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read files of their gift giver (after reveal)
CREATE POLICY "Users can read received gift files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'gifts'
  AND EXISTS (
    SELECT 1 FROM extraction
    WHERE extraction.receiver_id = auth.uid()
      AND extraction.revealed_at IS NOT NULL
      AND (storage.foldername(name))[1] = extraction.user_id::text
  )
);

-- Policy: Admins can read all files
CREATE POLICY "Admins can read all files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'gifts'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Admins can manage all files
CREATE POLICY "Admins can manage all files"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'gifts'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- VERIFICA POLICIES
-- ============================================

-- Query per verificare le policies create
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;

-- ============================================
-- NOTE
-- ============================================

/*
STRUTTURA FILE STORAGE:

gifts/
  ├── {user_id_1}/
  │   ├── gift-photo.jpg
  │   └── gift-file.pdf
  ├── {user_id_2}/
  │   ├── gift-photo.png
  │   └── gift-document.pdf
  └── ...

PERMESSI:
- Ogni utente può caricare/leggere/modificare/eliminare solo nella propria cartella
- Dopo l'estrazione, gli utenti possono leggere i file del loro gift giver
- Gli admin possono vedere tutti i file

MIME TYPES CONSENTITI:
- Immagini: image/jpeg, image/png, image/webp, image/gif
- Documenti: application/pdf
- Video: video/mp4, video/quicktime
- Audio: audio/mpeg, audio/wav
- Archivi: application/zip, application/x-zip-compressed

FILE SIZE LIMIT: 10MB per file
*/

-- ============================================
-- FINE STORAGE POLICIES
-- ============================================

SELECT 'Storage policies created successfully!' as status;
