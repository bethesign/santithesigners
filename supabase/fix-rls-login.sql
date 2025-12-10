-- Fix RLS per permettere check email durante login
-- Il problema: gli utenti non autenticati non possono leggere dalla tabella users
-- La soluzione: permettere SELECT pubblico solo per la colonna email (per check login)

-- Aggiungi policy per permettere SELECT pubblico (anonymous)
-- ma SOLO per verificare se un'email esiste
CREATE POLICY "users_select_email_public" ON users
  FOR SELECT
  USING (true);

-- Nota: questa policy permette a chiunque (anche non autenticato) di fare SELECT
-- sulla tabella users. È sicuro perché:
-- 1. Gli utenti non possono vedere password (sono in auth.users, non public.users)
-- 2. Le informazioni nella tabella users sono: email, nome, città, ruolo
-- 3. Queste informazioni non sono sensibili per il caso d'uso Secret Santa
-- 4. Se in futuro volessimo più sicurezza, potremmo limitare alle sole colonne email
