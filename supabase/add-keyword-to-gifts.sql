-- Aggiungi colonna keyword alla tabella gifts
-- La keyword sarà usata durante l'estrazione live per scegliere il regalo

ALTER TABLE gifts
ADD COLUMN IF NOT EXISTS keyword TEXT;

-- Aggiungi commento per documentazione
COMMENT ON COLUMN gifts.keyword IS 'Parola chiave che identifica il regalo durante l''estrazione live';

-- Optional: crea un index per ricerche rapide
CREATE INDEX IF NOT EXISTS idx_gifts_keyword ON gifts(keyword);
