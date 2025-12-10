-- Migration: Aggiorna extraction per supportare estrazione interattiva
-- L'estrazione non è più pre-generata ma i partecipanti scelgono le keyword

-- 1. Rimuovi vincolo UNIQUE su receiver_id (non serve più)
ALTER TABLE extraction DROP CONSTRAINT IF EXISTS extraction_receiver_id_key;

-- 2. Aggiungi colonna gift_id (il regalo scelto dall'utente)
ALTER TABLE extraction ADD COLUMN IF NOT EXISTS gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE;

-- 3. Rendi receiver_id nullable (sarà popolato quando viene scelto il regalo)
-- In realtà receiver_id non serve più, ma lo manteniamo per retrocompatibilità
-- Verrà popolato automaticamente quando gift_id viene assegnato

-- 4. Crea indice per gift_id
CREATE INDEX IF NOT EXISTS extraction_gift_id_idx ON extraction(gift_id);

-- 5. Aggiungi vincolo UNIQUE su gift_id (un regalo può essere scelto una sola volta)
ALTER TABLE extraction ADD CONSTRAINT extraction_gift_id_unique UNIQUE(gift_id);

-- 6. Commenti
COMMENT ON COLUMN extraction.user_id IS 'Utente che riceve il regalo (in ordine di turno)';
COMMENT ON COLUMN extraction.gift_id IS 'Regalo scelto dall''utente cliccando sulla keyword (NULL finché non sceglie)';
COMMENT ON COLUMN extraction.receiver_id IS 'DEPRECATO: era il receiver pre-assegnato, ora popolato dopo scelta';
COMMENT ON COLUMN extraction.order_position IS 'Ordine di estrazione basato su classifica quiz';
COMMENT ON COLUMN extraction.revealed_at IS 'Timestamp quando l''utente ha scelto la keyword e visto il regalo';

-- Note:
-- - user_id: chi riceve il regalo (ordine basato su quiz)
-- - gift_id: quale regalo ha scelto (NULL finché non clicca keyword)
-- - order_position: ordine del turno (1, 2, 3...)
-- - revealed_at: quando ha fatto la scelta
