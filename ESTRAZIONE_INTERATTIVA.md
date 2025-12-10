# 🎁 Meccanismo di Estrazione Interattiva

## Concept

L'estrazione NON è predeterminata. Gli utenti scelgono il regalo in tempo reale cliccando sulla **parola chiave** che li attrae di più.

## Come Funziona

### 1. **Fase Upload Regalo**
Ogni utente carica il proprio regalo E sceglie una **keyword** (parola chiave):
- **Titolo**: "Buono Amazon 50€"
- **Keyword**: "SHOPPING" o "TECH" o "MARE"
- La keyword viene salvata in MAIUSCOLO nel database
- La keyword rappresenta il tema/categoria del regalo

### 2. **Fase Estrazione Live**

#### Scenario A: È il tuo turno
1. Vedi tutte le **keyword disponibili** (dei regali non ancora estratti)
2. Le keyword sono visualizzate come **card/button cliccabili**
3. **Clicchi sulla keyword** che ti attrae
4. Il sistema:
   - Assegna QUEL regalo specifico a te
   - Marca la keyword/regalo come "estratto"
   - Passa al turno successivo
   - **RIVELA** il regalo completo (titolo, foto, messaggio)

#### Scenario B: Non è il tuo turno
1. Vedi chi sta estraendo ora
2. Vedi le keyword ancora disponibili (disabilitate, non cliccabili)
3. Aspetti il tuo turno

#### Scenario C: Hai già estratto
1. Vedi il regalo che hai scelto
2. Vedi le keyword ancora disponibili per gli altri
3. Segui chi sta estraendo

## Database Schema

### Tabella `gifts`
```sql
- id
- user_id (chi ha CARICATO il regalo)
- title
- keyword (NUOVA COLONNA) TEXT NOT NULL
- type (digital/physical)
- url / file_path / photo_url
- message
- notes
- created_at
```

### Tabella `extraction` (MODIFICATA)
```sql
- id
- user_id (chi RICEVE il regalo)
- gift_id (NUOVA COLONNA) - FK a gifts.id
- order_position (ordine turno)
- revealed_at (quando ha cliccato sulla keyword)
- created_at
```

**CAMBIAMENTO CHIAVE:**
- ❌ PRIMA: extraction generata in anticipo con gift_id predefinito
- ✅ ORA: extraction ha gift_id = NULL finché l'utente non sceglie la keyword

## Flusso di Estrazione

### Admin Panel
1. Admin clicca "Inizia Estrazione"
2. Sistema crea record in `extraction` per ogni utente:
   - `user_id`: utente che deve estrarre
   - `gift_id`: NULL (sarà assegnato quando l'utente sceglie)
   - `order_position`: basato su quiz answer speed
   - `revealed_at`: NULL

### User Extraction Page
1. Query disponibili: `SELECT * FROM gifts WHERE id NOT IN (SELECT gift_id FROM extraction WHERE gift_id IS NOT NULL)`
2. Mostra solo le **keyword** dei regali disponibili
3. User clicca keyword "TECH"
4. Sistema:
   ```sql
   UPDATE extraction
   SET gift_id = (SELECT id FROM gifts WHERE keyword = 'TECH' LIMIT 1),
       revealed_at = NOW()
   WHERE user_id = current_user AND gift_id IS NULL
   ```
5. Mostra il regalo completo all'utente
6. Passa al turno successivo

## Vantaggi

✅ **Più coinvolgente**: gli utenti partecipano attivamente
✅ **Elemento sorpresa**: scegli la keyword senza sapere il regalo esatto
✅ **Fair play**: tutti vedono le stesse keyword
✅ **Trasparente**: nessuna pre-assegnazione nascosta
✅ **Flessibile**: facile gestire duplicati o ritiri

## UI/UX

### Keyword Display
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   VIAGGIO   │  │    TECH     │  │     MARE    │
│             │  │             │  │             │
│   Clicca    │  │   Clicca    │  │   Clicca    │
└─────────────┘  └─────────────┘  └─────────────┘

┌─────────────┐  ┌─────────────┐
│  SHOPPING   │  │    RELAX    │
│             │  │             │
│   Clicca    │  │   Clicca    │
└─────────────┘  └─────────────┘
```

### After Click
```
🎁 Hai scelto: TECH

Regalo: Abbonamento Spotify Premium 6 mesi
Da: Mario Rossi

Messaggio: "Buon ascolto! 🎵"
```

## SQL Migration

File: `supabase/add-keyword-to-gifts.sql`
```sql
ALTER TABLE gifts
ADD COLUMN IF NOT EXISTS keyword TEXT;

CREATE INDEX IF NOT EXISTS idx_gifts_keyword ON gifts(keyword);
```

## Files da Modificare

1. ✅ `supabase/add-keyword-to-gifts.sql` - Migration
2. ✅ `src/hooks/useGiftUpload.ts` - Aggiunta keyword al form
3. ✅ `src/pages/GiftUpload.tsx` - Campo keyword nell'UI
4. ⏳ `src/services/extractionAlgorithm.ts` - NON genera più gift_id
5. ⏳ `src/pages/Extraction.tsx` - UI per scegliere keyword
6. ⏳ `src/hooks/useExtraction.ts` - Logica scelta keyword

## Next Steps

- [ ] Eseguire migration SQL
- [ ] Testare upload regalo con keyword
- [ ] Modificare algoritmo estrazione (no pre-assegnazione)
- [ ] Implementare UI scelta keyword
- [ ] Implementare logica reveal con keyword
- [ ] Testare flusso completo
