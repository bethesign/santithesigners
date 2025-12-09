-- CLEANUP: Rimuovi completamente gli utenti corrotti da auth

-- 1. Prima disabilita il trigger che linka auth.users a public.users
ALTER TABLE auth.users DISABLE TRIGGER ALL;

-- 2. Cancella gli utenti corrotti da auth.users
DELETE FROM auth.users WHERE email = 'admin@thesigners.it';
DELETE FROM auth.users WHERE email = 'mario.rossi@thesigners.it';

-- 3. Riabilita i trigger
ALTER TABLE auth.users ENABLE TRIGGER ALL;

-- 4. Verifica che siano stati rimossi
SELECT email, created_at FROM auth.users WHERE email IN ('admin@thesigners.it', 'mario.rossi@thesigners.it');

-- Dovrebbe restituire 0 righe

-- 5. Verifica che gli utenti esistano ancora in public.users (devono esistere!)
SELECT email, full_name FROM public.users WHERE email IN ('admin@thesigners.it', 'mario.rossi@thesigners.it');

-- Dovrebbe restituire le righe con i dati degli utenti
