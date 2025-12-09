-- Fix RLS per permettere il check dell'email durante login

-- Aggiungi policy per permettere a CHIUNQUE (anche non autenticato)
-- di verificare se un'email esiste (ma solo email e full_name)
CREATE POLICY "Anyone can check if email exists" ON users
  FOR SELECT
  USING (true);

-- NOTA: Questo permette a chiunque di leggere la tabella users
-- ma le altre policy RLS limitano comunque UPDATE/DELETE
-- In alternativa, usa la funzione RPC sopra per maggiore sicurezza
