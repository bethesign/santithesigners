-- Script completo per cancellare utente test
-- Esegui questo nel SQL Editor di Supabase

-- 1. Prima trova l'UUID dell'utente
SELECT
  au.id as auth_id,
  au.email as auth_email,
  pu.id as public_id,
  pu.email as public_email
FROM auth.users au
LEFT JOIN public.users pu ON au.email = pu.email
WHERE au.email = 'admin@thesigners.it';

-- 2. Cancella prima da public.users (CASCADE cancellerà tutto il resto automaticamente)
DELETE FROM public.users
WHERE email = 'admin@thesigners.it';

-- 3. Poi cancella da auth.users
DELETE FROM auth.users
WHERE email = 'admin@thesigners.it';

-- 4. Verifica che sia stato cancellato
SELECT
  'Auth user exists' as check_type,
  COUNT(*) as count
FROM auth.users
WHERE email = 'admin@thesigners.it'
UNION ALL
SELECT
  'Public user exists' as check_type,
  COUNT(*) as count
FROM public.users
WHERE email = 'admin@thesigners.it';

-- Se vedi ancora record, prova questo approccio più aggressivo:
-- (SOLO se i comandi sopra non funzionano)

-- Disabilita temporaneamente il trigger
ALTER TABLE auth.users DISABLE TRIGGER ALL;

-- Cancella forzatamente
DELETE FROM auth.users WHERE email = 'admin@thesigners.it';

-- Riabilita il trigger
ALTER TABLE auth.users ENABLE TRIGGER ALL;
