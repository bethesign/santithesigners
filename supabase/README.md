# Supabase Setup - Secret Santa 2024

## 📋 Prerequisiti

- Account Supabase (crea su [supabase.com](https://supabase.com))
- Progetto Supabase creato

---

## 🚀 Setup Passo-Passo

### 1. Crea Progetto Supabase

1. Vai su [app.supabase.com](https://app.supabase.com)
2. Clicca "New Project"
3. Compila i campi:
   - **Name**: Secret Santa 2024
   - **Database Password**: (genera una password sicura e salvala!)
   - **Region**: Europe West (Ireland) - per latenza ottimale
   - **Pricing Plan**: Free tier va bene per test, Pro per produzione
4. Clicca "Create new project"
5. Aspetta 2-3 minuti per la creazione

### 2. Esegui Schema Database

1. Nel dashboard Supabase, vai su **SQL Editor** (menu laterale)
2. Clicca "+ New query"
3. Copia e incolla il contenuto del file `schema.sql`
4. Clicca "Run" (o Cmd/Ctrl + Enter)
5. Verifica che tutte le tabelle siano state create:
   - users
   - gifts
   - quiz_questions
   - quiz_answers
   - extraction
   - settings
   - feedback

### 3. Inserisci Dati di Test (Opzionale)

1. Nel SQL Editor, crea una nuova query
2. Copia e incolla il contenuto del file `seed.sql`
3. **IMPORTANTE**: Modifica le email nel file con quelle reali del tuo team
4. Clicca "Run"
5. Verifica che gli utenti siano stati creati nella tabella `users`

### 4. Configura Storage

#### 4.1 Crea Bucket

1. Vai su **Storage** nel menu laterale
2. Clicca "+ New bucket"
3. Compila i campi:
   - **Name**: `gifts` (esatto, tutto minuscolo)
   - **Public bucket**: NO (lascia privato)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: Lascia vuoto (configureremo via policy)
4. Clicca "Create bucket"

#### 4.2 Applica Policies Storage

1. Torna al **SQL Editor**
2. Crea una nuova query
3. Copia e incolla il contenuto del file `storage-policies.sql`
4. Clicca "Run"
5. Verifica che le policies siano state create

### 5. Abilita Realtime

1. Vai su **Database** → **Replication** nel menu laterale
2. Trova la tabella `extraction`
3. Clicca sul toggle per abilitare "Realtime"
4. Ripeti per la tabella `settings`

**NOTA**: Se non vedi l'opzione Replication, usa questo SQL:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE extraction;
ALTER PUBLICATION supabase_realtime ADD TABLE settings;
```

### 6. Configura Authentication

1. Vai su **Authentication** → **Providers**
2. Verifica che **Email** sia abilitato (dovrebbe esserlo di default)
3. Vai su **Authentication** → **Email Templates**
4. **IMPORTANTE**: Disabilita "Confirm email" perché gli utenti sono pre-caricati
   - Vai su **Settings** → **Auth**
   - Scorri fino a "Email confirmation"
   - Imposta su **OFF**

### 7. Ottieni Credenziali API

1. Vai su **Settings** → **API** nel menu laterale
2. Troverai:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJxxx...` (chiave pubblica)
   - **service_role**: `eyJxxx...` (chiave segreta - **NON condividere**)

3. Copia queste credenziali nel file `.env.local` del progetto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... # SOLO server-side
```

### 8. Configura URL Autorizzati

1. Vai su **Authentication** → **URL Configuration**
2. Aggiungi i tuoi URL:
   - **Site URL**: `http://localhost:5173` (development)
   - **Redirect URLs**: `http://localhost:5173/**` (development)

3. Prima del deploy in produzione, aggiungi anche:
   - `https://tuodominio.vercel.app`
   - `https://tuodominio.vercel.app/**`

---

## ✅ Verifica Setup

Esegui queste query nel SQL Editor per verificare che tutto sia configurato correttamente:

### Verifica Tabelle

```sql
SELECT
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Dovresti vedere: users, gifts, quiz_questions, quiz_answers, extraction, settings, feedback

### Verifica RLS Policies

```sql
SELECT
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Dovresti vedere multiple policies per ogni tabella.

### Verifica Storage Bucket

```sql
SELECT
  id,
  name,
  public
FROM storage.buckets;
```

Dovresti vedere il bucket "gifts" con public = false.

### Verifica Realtime

```sql
SELECT
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

Dovresti vedere: extraction, settings

### Verifica Utenti

```sql
SELECT
  email,
  full_name,
  city,
  role
FROM users
ORDER BY email;
```

Dovresti vedere gli utenti inseriti dal seed.

---

## 🔒 Sicurezza

### Chiavi da Proteggere

- ✅ **anon public key**: OK per frontend (è pubblica)
- ⚠️ **service_role key**: MAI esporre al frontend, solo server-side
- 🔐 **Database password**: Salva in un password manager

### Row Level Security (RLS)

Tutte le tabelle hanno RLS abilitato. Le policies assicurano che:

- Gli utenti vedono solo i propri dati
- I destinatari vedono i regali solo dopo l'estrazione
- Gli admin vedono tutto
- Gli abbinamenti sono "sealed" fino alla rivelazione

### Storage Security

- Gli utenti possono caricare solo nella propria cartella (`/gifts/{user_id}/`)
- I destinatari vedono i file solo dopo la rivelazione
- Gli admin vedono tutti i file

---

## 🧪 Test del Setup

### Test 1: Connessione Database

Esegui nel SQL Editor:

```sql
SELECT NOW() as current_time, version() as postgres_version;
```

Se vedi il timestamp, la connessione funziona!

### Test 2: RLS Funzionante

```sql
-- Questa query dovrebbe fallire (RLS blocca accesso diretto)
SELECT * FROM users;
```

Se ottieni un errore "permission denied" o 0 risultati, RLS funziona!

### Test 3: Settings Singleton

```sql
SELECT * FROM settings;
```

Dovresti vedere esattamente 1 riga con id = 1.

---

## 🛠 Utility Scripts

### Reset Database (Development Only!)

```sql
-- ATTENZIONE: Cancella tutti i dati!
TRUNCATE users, gifts, quiz_answers, extraction, feedback RESTART IDENTITY CASCADE;

-- Reinserisci admin
INSERT INTO users (email, full_name, city, role)
VALUES ('admin@thesigners.it', 'Admin User', 'Milano', 'admin');

-- Reset settings
UPDATE settings SET
  draw_enabled = FALSE,
  draw_started = FALSE,
  current_turn = 0,
  extraction_generated_at = NULL,
  extraction_started_at = NULL,
  extraction_completed_at = NULL;
```

### Visualizza Partecipanti Validi

```sql
SELECT
  u.full_name,
  u.email,
  u.city,
  u.has_uploaded_gift,
  qa.answered_at,
  RANK() OVER (ORDER BY qa.answered_at) as quiz_position
FROM users u
LEFT JOIN quiz_answers qa ON qa.user_id = u.id
WHERE u.has_uploaded_gift = true AND qa.id IS NOT NULL
ORDER BY qa.answered_at;
```

### Visualizza Stato Estrazione

```sql
SELECT
  e.order_position,
  giver.full_name as giver,
  CASE
    WHEN e.revealed_at IS NULL THEN '🔒 Sealed'
    ELSE receiver.full_name
  END as receiver,
  e.revealed_at
FROM extraction e
JOIN users giver ON giver.id = e.user_id
JOIN users receiver ON receiver.id = e.receiver_id
ORDER BY e.order_position;
```

---

## 📞 Troubleshooting

### Problema: "relation does not exist"
- Verifica che `schema.sql` sia stato eseguito completamente
- Controlla che non ci siano errori nel SQL Editor

### Problema: "permission denied for table"
- Verifica che RLS sia abilitato
- Controlla che le policies siano state create
- Verifica di essere autenticato (auth.uid() non null)

### Problema: "bucket not found"
- Verifica che il bucket "gifts" sia stato creato
- Controlla che il nome sia esattamente "gifts" (minuscolo)

### Problema: Realtime non funziona
- Verifica che le tabelle siano state aggiunte alla pubblicazione
- Controlla i log nel dashboard Supabase
- Verifica che il client Supabase sia configurato correttamente

---

## 📚 Risorse Utili

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)

---

## ✨ Prossimi Passi

Dopo aver completato questo setup:

1. ✅ Torna al progetto Next.js
2. ✅ Configura `.env.local` con le credenziali
3. ✅ Installa il client Supabase: `npm install @supabase/supabase-js`
4. ✅ Inizia a implementare l'autenticazione

---

**Setup completato!** 🎉

Il database è pronto per l'applicazione Secret Santa.
