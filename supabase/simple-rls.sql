-- SOLUZIONE SEMPLICE: Elimina tutte le policy complicate e usa solo quelle base

-- 1. DROP tutte le policy esistenti sulla tabella users
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- 2. DROP la funzione helper se esiste
DROP FUNCTION IF EXISTS public.is_admin();

-- 3. Crea policy SEMPLICI che funzionano
-- Gli utenti possono leggere e modificare SOLO i propri dati
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Fine. Niente admin policy per ora.
-- Gli admin gestiranno tutto tramite RPC functions con SECURITY DEFINER.
