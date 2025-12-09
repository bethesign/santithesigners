# Secret Santa 2024 - Requisiti di Progetto Completi

**Versione:** 1.0  
**Data:** Dicembre 2024  
**Cliente:** Thesigners  
**Tipo Progetto:** Web Application - Secret Santa Aziendale

---

## 📋 Indice

1. [Overview del Progetto](#overview-del-progetto)
2. [Obiettivi e Scope](#obiettivi-e-scope)
3. [Architettura Tecnica](#architettura-tecnica)
4. [Database Schema](#database-schema)
5. [Logiche Funzionali Complete](#logiche-funzionali-complete)
6. [Specifiche UI/UX](#specifiche-uiux)
7. [Design System](#design-system)
8. [Flussi Utente](#flussi-utente)
9. [Pannello Admin](#pannello-admin)
10. [Sicurezza e Permessi](#sicurezza-e-permessi)
11. [Deployment e Configurazione](#deployment-e-configurazione)
12. [Checklist Implementazione](#checklist-implementazione)

---

## 1. Overview del Progetto

### Descrizione
Applicazione web per gestire lo scambio di regali "Secret Santa" tra colleghi di un'azienda. Il sistema gestisce l'intero ciclo: registrazione utenti, caricamento regali, quiz per determinare l'ordine, estrazione live sincronizzata in tempo reale, e gestione logistica per regali fisici.

### Utenti Target
- Dipendenti aziendali (20-40 anni)
- Team da 10 a 50+ persone
- Ambiente corporate ma festoso

### Caratteristiche Uniche
- **Estrazione "sealed"**: abbinamenti pre-calcolati ma nascosti, rivelati uno alla volta
- **Quiz gamification**: la velocità di risposta determina l'ordine di estrazione
- **Live show**: tutti gli utenti vedono l'estrazione in tempo reale (Supabase Realtime)
- **Gestione ibrida**: supporto sia regali digitali che fisici con logistica spedizioni

---

## 2. Obiettivi e Scope

### Obiettivi Primari
1. ✅ Facilitare lo scambio regali in modo divertente e coinvolgente
2. ✅ Garantire fairness (nessuno regala a se stesso, tutti ricevono)
3. ✅ Creare un'esperienza "live" condivisa per team remoti
4. ✅ Gestire logistica spedizioni per team distribuiti geograficamente

### Out of Scope (V1)
- ❌ Integrazione calendario (Google Calendar, Outlook)
- ❌ Notifiche push/email automatiche
- ❌ Chat tra partecipanti
- ❌ Storico anni precedenti
- ❌ Gamification avanzata (leaderboard, achievements)

### Success Metrics
- Partecipazione: >80% degli invitati carica un regalo
- Completamento: 100% estrazione senza errori tecnici
- Soddisfazione: Rating medio >4/5 nel survey finale

---

## 3. Architettura Tecnica

### Stack Tecnologico

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui (componenti)
- Framer Motion (animazioni)
- React Hook Form + Zod (validazione)

**Backend:**
- Next.js API Routes (server actions)
- Supabase (database + auth + storage + realtime)

**Deployment:**
- Vercel (hosting frontend)
- Supabase Cloud (managed backend)
- GitHub (version control)

**Tools:**
- Claude Code (sviluppo assistito)
- Figma (design)
- Figma Make (generazione UI)

### Diagramma Architettura

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  Next.js 14 App Router + TypeScript + Tailwind              │
│                                                              │
│  Pages:                                                      │
│  - / (homepage)                                              │
│  - /auth/login                                               │
│  - /auth/setup                                               │
│  - /dashboard                                                │
│  - /dashboard/gift                                           │
│  - /dashboard/gift-received                                  │
│  - /quiz                                                     │
│  - /extraction (live)                                        │
│  - /admin                                                    │
│  - /survey                                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls / Realtime
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE BACKEND                         │
│                                                              │
│  Database (PostgreSQL):                                      │
│  - users, gifts, quiz_questions, quiz_answers               │
│  - extraction, settings, feedback                            │
│                                                              │
│  Auth:                                                       │
│  - Email + Password authentication                           │
│  - Row Level Security (RLS)                                  │
│                                                              │
│  Storage:                                                    │
│  - Bucket "gifts" (photos, files)                            │
│                                                              │
│  Realtime:                                                   │
│  - extraction table (live updates)                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Deploy
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                          VERCEL                              │
│  - Edge Network CDN                                          │
│  - Auto-deploy da GitHub                                     │
│  - Environment variables                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema

### Tabelle

#### **users**
Lista pre-caricata di utenti autorizzati.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  city TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  has_uploaded_gift BOOLEAN DEFAULT FALSE,
  
  -- Shipping address
  shipping_address_street TEXT,
  shipping_address_city TEXT,
  shipping_address_zip TEXT,
  shipping_address_province TEXT,
  shipping_address_notes TEXT,
  is_shipping_address_complete BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Note:**
- Email aziendali pre-caricate da admin
- Password impostata solo al primo accesso
- `role = 'admin'` per pannello di controllo
- Indirizzo può essere inserito in anticipo o dopo estrazione

#### **gifts**
Un regalo per utente.

```sql
CREATE TABLE gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('digital', 'physical')),
  title TEXT NOT NULL,
  
  -- Digital gift fields
  url TEXT,
  file_path TEXT, -- Supabase Storage path
  
  -- Physical gift fields
  photo_url TEXT, -- Supabase Storage path
  
  -- Common
  message TEXT,
  notes TEXT, -- Private notes, visible only to giver + admin
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);
```

#### **quiz_questions**
Domande per il quiz (tipicamente una sola).

```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Default question:** "Qual è il tuo film di Natale preferito?"

#### **quiz_answers**
Risposte degli utenti con timestamp preciso.

```sql
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, question_id)
);
```

**Importanza del timestamp:** Determina l'ordine di estrazione (più veloce = prima scelta).

#### **extraction**
Abbinamenti sealed giver → receiver.

```sql
CREATE TABLE extraction (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- giver
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- sealed
  order_position INTEGER NOT NULL,
  revealed_at TIMESTAMP WITH TIME ZONE, -- NULL finché non rivelato
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id),
  UNIQUE(receiver_id),
  UNIQUE(order_position)
);
```

**Logica sealed:**
- `receiver_id` è nascosto finché `revealed_at IS NULL`
- Anche admin non può vedere prima della rivelazione (sealed)
- Abbinamenti generati in anticipo con algoritmo permutazione ciclica

#### **settings**
Configurazione globale evento (singleton).

```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  
  -- Date configuration
  gifts_start_date TIMESTAMP WITH TIME ZONE,
  gifts_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  quiz_available_date TIMESTAMP WITH TIME ZONE,
  extraction_available_date TIMESTAMP WITH TIME ZONE,
  
  -- Extraction state
  draw_enabled BOOLEAN DEFAULT FALSE, -- Admin ha attivato
  draw_started BOOLEAN DEFAULT FALSE, -- Admin ha avviato show live
  current_turn INTEGER DEFAULT 0,
  
  -- Audit timestamps
  extraction_generated_at TIMESTAMP WITH TIME ZONE,
  extraction_started_at TIMESTAMP WITH TIME ZONE,
  extraction_completed_at TIMESTAMP WITH TIME ZONE,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT single_settings_row CHECK (id = 1)
);
```

**Note:**
- Tutte le date in UTC
- Timezone unico per tutti gli utenti (stesso fuso aziendale)
- `draw_enabled` = utenti possono accedere alla pagina estrazione
- `draw_started` = estrazione live in corso

#### **feedback**
Survey post-evento.

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);
```

---

## 5. Logiche Funzionali Complete

### 5.1 Gestione Utenti e Primo Accesso

**Requisito:** Lista utenti pre-caricata, nessuna registrazione autonoma.

**Flusso:**

1. **Primo accesso:**
   - Utente inserisce email aziendale
   - Sistema verifica esistenza in `users` table
   - Se NON presente → Errore: "Non fai parte del Secret Santa"
   - Se presente e primo accesso → Redirect a `/auth/setup`

2. **Setup password:**
   - Utente crea password (validazione: min 8 char, uppercase, number)
   - Sistema crea account Supabase Auth
   - Collega `auth.users.id` a `public.users.id`
   - Opzionale: form indirizzo spedizione (skippabile)
   - Redirect a `/dashboard`

3. **Accessi successivi:**
   - Login standard con email + password
   - Supabase Auth gestisce sessione

**Admin:**
- Pre-caricamento utenti via SQL o interfaccia admin
- Campo `role = 'admin'` per accesso pannello

---

### 5.2 Dashboard Utente

**Logica di stato:**

La dashboard mostra 4 card principali, ognuna con stati multipli basati su:
- `has_uploaded_gift`
- Esistenza record in `quiz_answers`
- Valori in `settings` (deadline, draw_enabled, etc.)
- Esistenza record in `extraction` WHERE `receiver_id = current_user.id`

**Card "Il Tuo Regalo":**

```
IF has_uploaded_gift = FALSE:
  → Mostra countdown deadline
  → CTA "Carica il tuo regalo"
ELSE IF NOW() < gifts_deadline:
  → Mostra preview regalo
  → Button "Modifica"
ELSE:
  → Mostra preview regalo
  → Lock (non modificabile)
  → Testo: "Deadline scaduta"
```

**Card "Quiz":**

```
IF NOT EXISTS quiz_answer:
  → CTA "Completa il quiz!"
  → Messaggio: velocità determina ordine
ELSE:
  → Check verde "Completato!"
  → Mostra tempo risposta
  → Mostra posizione provvisoria (COUNT dove answered_at < my_time)
```

**Card "Regalo Ricevuto":**

```
IF NOT EXISTS extraction WHERE receiver_id = me AND revealed_at IS NOT NULL:
  → Empty state "Estrazione non ancora avvenuta"
ELSE:
  → Fetch gift details
  → Mostra preview
  → IF gift.type = 'physical' AND giver.city != receiver.city:
    → IF NOT is_shipping_address_complete:
      → Warning banner + form indirizzo
```

**Card "Estrazione Live":**

```
IF draw_enabled = FALSE:
  → "L'estrazione inizierà il [data]"
ELSE IF draw_started = FALSE:
  → "L'estrazione sta per iniziare!"
  → CTA "Vai alla pagina estrazione"
ELSE IF draw_started = TRUE AND current_turn <= total_participants:
  → Badge "LIVE"
  → "In corso: Turno X/Y"
  → CTA "Segui in diretta"
ELSE:
  → "Estrazione completata!"
  → Link a tutti gli abbinamenti
```

---

### 5.3 Caricamento Regalo

**Validazione pre-requisiti:**

```javascript
BEFORE saving gift:
  IF NOT EXISTS quiz_answer WHERE user_id = current_user:
    → Block save
    → Modal: "Prima devi completare il quiz!"
    → Redirect a /quiz
  
  IF NOW() >= gifts_deadline:
    → Block save
    → Error: "Deadline scaduta"
```

**Flusso upload:**

1. Utente sceglie tipo (toggle Digital/Physical)
2. Compila form appropriato:
   - **Digital:** Title (required), URL (optional), File upload (optional), Message, Notes
   - **Physical:** Title (required), Photo upload (required), Message
3. Click "Salva"
4. Validazione quiz (vedi sopra)
5. Upload file a Supabase Storage (bucket `gifts`, path: `{userId}/filename`)
6. INSERT/UPDATE in `gifts` table
7. UPDATE `users.has_uploaded_gift = TRUE`
8. Toast success + redirect `/dashboard`

**Note:**
- Modificabile finché `NOW() < gifts_deadline`
- Dopo deadline: read-only

---

### 5.4 Quiz

**Obiettivo:** Determinare ordine estrazione in base a velocità di risposta.

**Flusso:**

1. Utente accede a `/quiz`
2. Fetch domanda attiva da `quiz_questions`
3. Mostra domanda + textarea risposta
4. Optional: timer visuale millisecondi
5. Click "Invia risposta"
6. INSERT in `quiz_answers`:
   ```sql
   INSERT INTO quiz_answers (user_id, question_id, answer, answered_at)
   VALUES (current_user_id, question_id, user_answer, NOW());
   ```
7. Calcola posizione provvisoria:
   ```sql
   SELECT COUNT(*) + 1 
   FROM quiz_answers 
   WHERE answered_at < my_answered_at
   ```
8. Mostra conferma con posizione
9. Redirect `/dashboard`

**Quiz forzato:**
- Se utente va a caricare regalo SENZA aver fatto quiz → blocco + redirect obbligatorio
- Step obbligatorio prima di finalizzare regalo

**Finestra temporale:**
- Disponibile: da primo accesso utente fino a `extraction_started`
- Nessun timeout assoluto rigido
- Chi risponde più tardi va semplicemente ultimo

---

### 5.5 Condizione di Partecipazione

**Per partecipare all'estrazione, utente DEVE:**

```sql
has_uploaded_gift = TRUE
AND
EXISTS (SELECT 1 FROM quiz_answers WHERE user_id = user.id)
```

**Utenti esclusi:**
- Vedono pagina estrazione in **sola lettura**
- Non sono inclusi in `extraction` table
- Non ricevono regalo
- Possono comunque fare survey finale
- Messaggio: "Non hai partecipato. Puoi seguire l'estrazione degli altri."

---

### 5.6 Generazione Estrazione Sealed

**Trigger:** Admin clicca "Genera Estrazione Sealed" nel pannello admin.

**Algoritmo (API endpoint `/api/admin/generate-extraction`):**

```javascript
1. Verifica auth (solo admin)

2. Fetch partecipanti validi:
   SELECT users.* 
   FROM users
   WHERE has_uploaded_gift = TRUE
   AND EXISTS (SELECT 1 FROM quiz_answers WHERE quiz_answers.user_id = users.id)

3. Ordina per velocità quiz (ASC):
   ORDER BY quiz_answers.answered_at ASC

4. Genera permutazione ciclica casuale:
   
   participants = [A, B, C, D, E, ...] // ordinati per quiz
   
   // Shuffle casuale per abbinamenti
   shuffled = shuffle(participants)
   
   assignments = []
   for i in 0..shuffled.length-1:
     giver = shuffled[i]
     receiver = shuffled[(i + 1) % shuffled.length] // ciclico
     
     assignments.push({
       user_id: giver.id,
       receiver_id: receiver.id,
       order_position: i + 1 // ordine da quiz, NON da shuffle
     })
   
5. Transaction:
   BEGIN;
   DELETE FROM extraction; // se già esiste e draw_enabled = false
   INSERT INTO extraction (user_id, receiver_id, order_position) VALUES [...];
   UPDATE settings SET extraction_generated_at = NOW();
   COMMIT;

6. Return success + count abbinamenti
```

**Garanzie matematiche:**
- Permutazione ciclica garantisce che tutti sono sia giver che receiver
- Nessuno regala a se stesso
- Tutti ricevono esattamente un regalo
- Zero rischio di deadlock

**Sealed:**
- `receiver_id` è nascosto (NULL in SELECT per non-admin e non-revealed)
- Nemmeno admin può vedere prima di `revealed_at`
- Opzionale: admin può rigenerare SOLO se `draw_enabled = FALSE`

---

### 5.7 Attivazione Estrazione

**Admin clicca "Attiva Estrazione":**

```sql
UPDATE settings 
SET draw_enabled = TRUE,
    extraction_available_date = NOW();
```

**Effetti:**
- Utenti possono ora accedere a `/extraction`
- Vedono: "L'estrazione inizierà a breve. Resta connesso."
- Admin può vedere pannello "Controllo Live"

**Non ancora iniziata:** `draw_started = FALSE`

---

### 5.8 Avvio Estrazione Live

**Admin clicca "Avvia Estrazione":**

```sql
UPDATE settings 
SET draw_started = TRUE,
    current_turn = 1,
    extraction_started_at = NOW();
```

**Effetti:**
- Tutti gli utenti vedono aggiornamento realtime
- Mostra: "Turno 1 - Tocca a [Nome del primo utente]"

---

### 5.9 Processo Estrazione Live (Turni)

**Per ogni turno:**

```javascript
// Client-side logic (utente di turno)

1. Fetch current turn da settings:
   current_turn = settings.current_turn

2. Fetch utente di turno:
   SELECT user_id FROM extraction 
   WHERE order_position = current_turn
   
3. IF user_id == current_user.id:
   → Mostra button "Scopri a chi fai il regalo"
   
   ELSE:
   → Mostra "In attesa che [Nome] effettui la sua estrazione..."

4. Click "Scopri":
   
   API call POST /api/extraction/reveal:
   
   a) Fetch extraction WHERE user_id = current_user AND revealed_at IS NULL
   b) receiver = extraction.receiver_id
   c) UPDATE extraction SET revealed_at = NOW() WHERE id = extraction.id
   d) Broadcast Supabase Realtime event
   e) UPDATE settings SET current_turn = current_turn + 1
   f) Return receiver details

5. UI: Modal con animazione reveal + confetti
   → "🎁 Regalerai a: [Nome Receiver]!"

6. Tutti i client ricevono update realtime:
   → Aggiungono card "[Giver] → [Receiver]" alla lista
   → Auto-scroll to bottom
   → Celebrative animation

7. Sistema incrementa turno automaticamente
   → current_turn = 2
   → Ripete per prossimo utente
```

**Realtime Subscription (client-side):**

```javascript
// Tutti gli utenti su /extraction subscribono a:
supabase
  .channel('extraction-live')
  .on('postgres_changes', 
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'extraction',
      filter: 'revealed_at=neq.null'
    }, 
    (payload) => {
      // Aggiungi nuova card rivelata
      addRevealedCard(payload.new);
      // Animation + sound effect
    }
  )
  .subscribe();

// Subscribe anche a settings.current_turn
supabase
  .channel('settings-turn')
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'settings'
    },
    (payload) => {
      updateCurrentTurn(payload.new.current_turn);
    }
  )
  .subscribe();
```

---

### 5.10 Completamento Estrazione

**Condizione:**

```javascript
IF current_turn > total_participants:
  → Estrazione completata
  
  UPDATE settings 
  SET extraction_completed_at = NOW();
```

**UI:**
- Mostra: "🎉 Estrazione completata!"
- Lista completa di tutti gli abbinamenti visibile
- Link: "Vai alla tua dashboard" per vedere regalo ricevuto

---

### 5.11 Regalo Ricevuto e Indirizzo Spedizione

**Dopo estrazione completata:**

1. Utente va su dashboard → "Regalo Ricevuto" card
2. Fetch:
   ```sql
   SELECT gifts.*, users.full_name as giver_name, users.city as giver_city
   FROM extraction
   JOIN gifts ON gifts.user_id = extraction.user_id
   JOIN users ON users.id = extraction.user_id
   WHERE extraction.receiver_id = current_user.id
   ```

3. Mostra dettagli regalo

4. **IF regalo fisico AND giver.city != current_user.city:**
   ```javascript
   IF NOT is_shipping_address_complete:
     → Mostra form indirizzo (obbligatorio)
     → "Inserisci il tuo indirizzo per ricevere il regalo"
     → Campi: via, città, CAP, provincia, note
     → Button "Salva indirizzo"
     
     On save:
     UPDATE users 
     SET shipping_address_street = ...,
         shipping_address_city = ...,
         shipping_address_zip = ...,
         shipping_address_province = ...,
         shipping_address_notes = ...,
         is_shipping_address_complete = TRUE
     WHERE id = current_user.id;
     
     → Toast: "Indirizzo salvato! Il mittente è stato notificato."
   ```

5. **Giver side (chi deve spedire):**
   - Nella dashboard, sezione "A chi devi fare il regalo"
   - Mostra destinatario
   - IF regalo fisico AND città diversa:
     → Mostra indirizzo destinatario (fetch da users WHERE id = receiver_id)

**Visibilità indirizzo:**
- Owner (destinatario)
- Giver (solo se regalo fisico E città diversa E dopo estrazione)
- Admin (sempre)

---

### 5.12 Survey Finale

**Accessibile quando:** `settings.extraction_completed_at IS NOT NULL`

**Flusso:**

1. Utente accede a `/survey`
2. Check se già fatto:
   ```sql
   SELECT * FROM feedback WHERE user_id = current_user.id
   ```
3. Se già fatto → Mostra "Grazie per il feedback!"
4. Se non fatto → Form:
   - Rating 1-5 stelle (component interattivo)
   - Textarea commento (opzionale)
   - Button "Invia feedback"
5. On submit:
   ```sql
   INSERT INTO feedback (user_id, rating, comment)
   VALUES (current_user.id, rating_value, comment_text);
   ```
6. Success message + auto-redirect `/dashboard` dopo 3s

**Note:** Tutti possono fare survey, anche chi non ha partecipato.

---

## 6. Specifiche UI/UX

### 6.1 Homepage Pubblica

**Obiettivo:** Landing page accattivante, entry point per login.

**Design:**

```
Background:
- Radial gradient verde natalizio
  - Centro: #a8e6b5
  - Bordi: #2d5f3d

Ticker scorrevoli (fondo schermo):
- 3 righe orizzontali
- Direzioni alternate: DX → SX → DX
- Colori alternati:
  - Riga 1: Bianco su rgba(255,255,255,0.1)
  - Riga 2: Oro (#ffd700) su rgba(255,215,0,0.1)
  - Riga 3: Rosso (#ff6b6b) su rgba(255,107,107,0.1)
- Testi esempio:
  - "✨ Secret Santa 2024 ✨ Fai un regalo, ricevi un regalo ✨"
  - "🎁 Divertiti con il team 🎁 Chi sarà il tuo Secret Santa? 🎁"
  - "❄️ Natale in ufficio ❄️ Scambio regali tra colleghi ❄️"
- Font: 2rem, bold, uppercase, letter-spacing 0.1em
- Animazione: translateX infinite loop, 30s duration

Albero di Natale (centro-basso):
- SVG o immagine moderna, minimal
- Width: 300px
- Posizionato: bottom 15%, center horizontal
- Animazione: dondola (swing)
  - Keyframes: rotate da -3deg a +3deg
  - Duration: 3s ease-in-out infinite
  - Transform-origin: bottom center

Hero Content (centro):
- H1: "Secret Santa"
  - Font-size: 6rem (96px)
  - Font-weight: 900
  - Color: White
  - Text-shadow: glow dorato
  - Letter-spacing: 0.05em

- Subtitle: "2024"
  - Font-size: 2rem
  - Color: rgba(255,255,255,0.9)
  - Font-weight: 300

- CTA Button: "Santi Thesigners"
  - Background: linear-gradient rosso (#ff6b6b → #ee5a52)
  - Color: White
  - Font-size: 2rem, bold, uppercase
  - Padding: 1.5rem 4rem
  - Border-radius: 50px (fully rounded)
  - Shadow: 0 8px 20px rgba(0,0,0,0.3) + glow rosso
  - Icon: 🎅 emoji (2.5rem, animated bounce)
  - Hover: scale(1.05) + translateY(-5px) + shadow increase
  - Active: scale(0.98)
  - Link: /auth/login

Optional - Neve che cade:
- Fiocchi neve (❅ ❆) bianchi, opacity 0.8
- Animazione: translateY da top a bottom
- Durate random (8-12s)
- Posizioni left random (10%, 20%, 30%, etc.)
```

**Responsive Mobile:**
- H1: 3rem
- CTA: 1.5rem, padding 1rem 2rem
- Ticker: 1.2rem
- Albero: 200px width

---

### 6.2 Pagine Autenticazione

**Layout comune (Login + Setup):**

```
Desktop (1440px):
- Split 50/50 verticale

Left Side:
- Background: radial gradient verde (come homepage)
- Decorazione: illustrazione natalizia (albero, regalo)
- Floating elements: neve, gift boxes

Right Side:
- Background: White
- Content: centered, 400px max-width
- Logo top
- Card centrale con form

Mobile (375px):
- Stack verticale
- Top: decorazione semplificata (100px height)
- Form: full width minus 16px margins
```

**Login Page:**
- Logo "Secret Santa 🎄" (H2, green)
- Heading: "Bentornato!" (H1)
- Subheading: "Accedi per partecipare allo scambio regali"
- Form in card:
  - Email input (icon mail left, 48px height)
  - Password input (conditional, icon lock left, toggle eye right)
  - Link "Password dimenticata?" (se password visibile)
  - Button "Accedi" o "Continua" (primary red, full width)
- Footer note: info primo accesso

**Setup Password Page:**
- Progress stepper (2 step)
- Welcome "Ciao, [Nome]! 👋"
- Step 1: Password creation
  - Password input
  - Requirements checklist (realtime validation)
  - Strength indicator (weak/medium/strong)
  - Confirm password input
  - Button "Continua"
- Step 2: Shipping address (optional)
  - Info banner: "Necessario solo se riceverai regalo fisico..."
  - Form: via, città, CAP, provincia, note
  - Button "Compila dopo" (ghost) + "Salva" (primary)

---

### 6.3 Dashboard Utente

**Layout:**

```
Header (fixed):
- Height: 72px
- Background: White, shadow XS
- Logo left
- User menu right (avatar + name + dropdown)
- Badge "LIVE" se estrazione in corso

Main Content:
- Background: Gray 50
- Page title: "Ciao, [Nome]! 🎁"
- Subtitle: "Mancano X giorni all'estrazione"

Grid (desktop):
- 2 columns: 60% / 40%
- Gap: 24px
- Mobile: stack verticale

LEFT COLUMN:

Card 1: "Il Tuo Regalo"
- Header: gift icon + title + badge status
- Body:
  - State A (not uploaded):
    - Empty illustration
    - Countdown component (3 boxes: GG HH MM)
    - CTA "Carica il tuo regalo" (primary, full width)
  
  - State B (uploaded, before deadline):
    - Preview (thumbnail + details)
    - Buttons: "Visualizza" + "Modifica"
  
  - State C (uploaded, after deadline):
    - Preview con lock icon
    - Text: "Deadline scaduta - non più modificabile"

Card 2: "Quiz"
- Header: help-circle icon + title
- Body:
  - State A (not completed):
    - Clock icon
    - Text: "Completa il quiz per determinare l'ordine!"
    - Info box: velocità conta
    - Button "Inizia il quiz" (secondary gold)
  
  - State B (completed):
    - Check-circle icon
    - "Quiz completato!"
    - Info box: tempo risposta + posizione provvisoria

RIGHT COLUMN:

Card 1: "Regalo Ricevuto"
- Header: package icon + title
- Body:
  - State A (before extraction):
    - Empty illustration (gift + question mark)
    - "L'estrazione non è ancora avvenuta"
  
  - State B (after extraction):
    - Gift preview
    - Button "Visualizza dettagli"
    - Se fisico + città diversa:
      - Warning banner "Inserisci indirizzo"

Card 2: "Estrazione Live"
- Header: users icon + title + badge "LIVE"
- Body:
  - State A (not started):
    - Calendar icon
    - "L'estrazione inizierà il [data]"
  
  - State B (ready):
    - TV icon con glow
    - "L'estrazione sta per iniziare!"
    - Button "Vai alla pagina estrazione" (primary, glow)
  
  - State C (in progress):
    - Progress bar
    - "Turno X/Y - È il turno di [Nome]"
    - Button "Segui in diretta" (animated pulse)
  
  - State D (completed):
    - Check-circle icon
    - "Estrazione completata!"
    - Summary stats
    - Button "Vedi tutti gli abbinamenti"
```

**Componenti:**

**Countdown:**
```
┌────────┐  ┌────────┐  ┌────────┐
│   03   │  │   14   │  │   23   │
│ Giorni │  │  Ore   │  │  Min   │
└────────┘  └────────┘  └────────┘

- Box: white bg, 2px gray border, 12px radius, 16px padding, 80px width
- Number: H3 (28px/700) green
- Label: Caption gray
```

---

### 6.4 Gift Upload Page

**Layout:**

```
Header: "Carica il tuo regalo"
Countdown: deadline (same as dashboard)

Toggle Tabs (prominent):
┌─────────────┬─────────────┐
│  Digitale   │   Fisico    │
│   (active)  │ (inactive)  │
└─────────────┴─────────────┘

DIGITAL GIFT FORM:
┌─────────────────────────────────────┐
│ Titolo*                             │
│ [___________________________]       │
│                                     │
│ URL (opzionale)                     │
│ [___________________________]       │
│                                     │
│ Oppure carica un file               │
│ ┌─────────────────────────┐        │
│ │   Drag & Drop zone      │        │
│ │   or click to browse    │        │
│ └─────────────────────────┘        │
│                                     │
│ Messaggio per il destinatario       │
│ [___________________________]       │
│ [___________________________]       │
│                                     │
│ Note private (solo tu e admin)      │
│ [___________________________]       │
│                                     │
│ [  Salva regalo  ] (full width)    │
└─────────────────────────────────────┘

PHYSICAL GIFT FORM:
┌─────────────────────────────────────┐
│ Titolo*                             │
│ [___________________________]       │
│                                     │
│ Foto del regalo                     │
│ ┌─────────────────────────┐        │
│ │   Upload photo          │        │
│ │   (with preview)        │        │
│ └─────────────────────────┘        │
│                                     │
│ Messaggio per il destinatario       │
│ [___________________________]       │
│ [___________________________]       │
│                                     │
│ [  Salva regalo  ] (full width)    │
└─────────────────────────────────────┘
```

**Validazioni:**
- Title: required, max 100 chars
- URL: valid URL format se fornito
- File upload: max 10MB, types: pdf, jpg, png, mp3, mp4, zip
- Photo upload: max 5MB, types: jpg, png, webp
- Pre-save check: quiz completato (altrimenti modal block)

---

### 6.5 Quiz Page

**Layout:**

```
Center-aligned single card:

┌────────────────────────────────────────┐
│                                        │
│          Rispondi al quiz! 🎯          │
│                                        │
│  La tua velocità determinerà l'ordine  │
│  di estrazione. Più veloce rispondi,   │
│  prima sceglierai il destinatario!     │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │                                  │ │
│  │  [Domanda qui]                   │ │
│  │                                  │ │
│  │  Qual è il tuo film di Natale    │ │
│  │  preferito?                       │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  La tua risposta:                      │
│  ┌──────────────────────────────────┐ │
│  │                                  │ │
│  │  [Textarea]                      │ │
│  │                                  │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Optional: Timer ⏱️ 00:00.000          │
│                                        │
│  [     Invia risposta     ]            │
│                                        │
└────────────────────────────────────────┘

SUCCESS STATE (dopo submit):
┌────────────────────────────────────────┐
│                                        │
│              ✅ Risposta inviata!      │
│                                        │
│          [Confetti animation]          │
│                                        │
│  Tempo di risposta: 00:00:03.245       │
│  Posizione provvisoria: 7° su 15       │
│                                        │
│  L'ordine finale sarà confermato       │
│  prima dell'estrazione                 │
│                                        │
│  [Auto-redirect dopo 3s...]            │
│                                        │
└────────────────────────────────────────┘
```

---

### 6.6 Extraction Live Page

**Layout:**

```
HEADER:
┌──────────────────────────────────────────┐
│  Secret Santa 2024 - Estrazione Live 🎄  │
│  Status: [In attesa|In corso|Completata] │
└──────────────────────────────────────────┘

MAIN CONTENT:

IF waiting to start:
┌────────────────────────────────────────┐
│                                        │
│  L'estrazione inizierà a breve.        │
│  Resta connesso!                       │
│                                        │
│  [Loading animation]                   │
│                                        │
└────────────────────────────────────────┘

IF in progress (YOUR TURN):
┌────────────────────────────────────────┐
│                                        │
│     Turno 7/15 - È IL TUO TURNO! 🎉    │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │                                  │ │
│  │  [ Scopri a chi fai il regalo ]  │ │
│  │                                  │ │
│  │  (animated button with glow)     │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘

IF in progress (NOT YOUR TURN):
┌────────────────────────────────────────┐
│                                        │
│     Turno 7/15 - Tocca a Mario Rossi   │
│                                        │
│  In attesa che Mario effettui          │
│  la sua estrazione...                  │
│                                        │
│  [Pulsing dots animation]              │
│                                        │
└────────────────────────────────────────┘

REVEALED ASSIGNMENTS (below, realtime):
┌────────────────────────────────────────┐
│  Abbinamenti Rivelati                  │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 🎁 Mario → Lucia                 │ │
│  │    [animation + confetti]        │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 🎁 Lucia → Giovanni              │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 🎁 Giovanni → ...                │ │
│  │    [New card animates in]        │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘

IF completed:
┌────────────────────────────────────────┐
│                                        │
│   🎉 Estrazione Completata! 🎉         │
│                                        │
│  15 partecipanti                       │
│  15 regali scambiati                   │
│                                        │
│  [Lista completa abbinamenti]          │
│                                        │
│  [  Vai alla tua dashboard  ]          │
│                                        │
└────────────────────────────────────────┘
```

**Reveal Animation (Modal):**

```
On click "Scopri":

1. Fullscreen modal overlay (blur background)

2. Card flip 3D animation:
   Front: "?" large icon
   Back: "🎁 Regalerai a: [Nome]!"

3. Confetti explosion (canvas-confetti)

4. Optional: sound effect jingle

5. Auto-close dopo 3s

6. Card appare nella lista "Abbinamenti Rivelati" per tutti
```

**Realtime Behaviors:**
- Nuova card rivelata → slide-in from bottom + glow effect
- Current turn change → update header + badge
- Completion → confetti fullscreen + success message

---

### 6.7 Admin Dashboard

**Layout: Tabbed Interface**

```
TABS:
┌─────────┬─────────┬──────────────┬────────────┬─────────────┐
│Overview │  Date   │ Participants │ Generation │ Live Control│
└─────────┴─────────┴──────────────┴────────────┴─────────────┘

TAB 1 - OVERVIEW:
┌────────────────────────────────────────────────────┐
│  Stats Cards (4 across):                           │
│  ┌──────────┬──────────┬──────────┬──────────┐   │
│  │  Total   │  Gifts   │  Quiz    │  Valid   │   │
│  │  Users   │ Uploaded │Completed │Particip. │   │
│  │    20    │  15/20   │  15/20   │    15    │   │
│  └──────────┴──────────┴──────────┴──────────┘   │
│                                                    │
│  Excluded Users (5):                               │
│  - Anna Rossi (no gift)                            │
│  - Marco Bianchi (no quiz)                         │
│  ...                                               │
└────────────────────────────────────────────────────┘

TAB 2 - DATE CONFIG:
┌────────────────────────────────────────────────────┐
│  Configurazione Date                               │
│                                                    │
│  Inizio inserimento regali:                        │
│  [Date picker] [Time picker]                       │
│                                                    │
│  Deadline inserimento regali:                      │
│  [Date picker] [Time picker] *required             │
│                                                    │
│  Quiz disponibile da:                              │
│  [Date picker] [Time picker]                       │
│                                                    │
│  Estrazione disponibile da:                        │
│  [Date picker] [Time picker]                       │
│                                                    │
│  [  Salva configurazione  ]                        │
│                                                    │
│  Timeline Preview:                                 │
│  [Visual timeline chart]                           │
└────────────────────────────────────────────────────┘

TAB 3 - PARTICIPANTS:
┌────────────────────────────────────────────────────┐
│  Tabella Partecipanti                              │
│  [Search] [Filter: All|Valid|Excluded]             │
│                                                    │
│  Nome      Email         Città  Gift Quiz  Time   │
│  ────────────────────────────────────────────────  │
│  Mario R.  mario@...     Milano  ✓    ✓   00:03   │
│  Lucia B.  lucia@...     Roma    ✓    ✓   00:04   │
│  Anna N.   anna@...      Torino  ✗    ✗   -       │
│  ...                                               │
└────────────────────────────────────────────────────┘

TAB 4 - GENERATION:
┌────────────────────────────────────────────────────┐
│  Classifica Quiz (Ordine Estrazione):              │
│                                                    │
│  Pos  Nome             Tempo Risposta             │
│  ─────────────────────────────────────────────    │
│   1   Mario Rossi      00:00:03.245               │
│   2   Lucia Bianchi    00:00:04.891               │
│   3   Giovanni Verdi   00:00:05.123               │
│  ...                                               │
│                                                    │
│  Partecipanti validi: 15                           │
│                                                    │
│  [  Genera Estrazione Sealed  ] (primary)         │
│                                                    │
│  AFTER GENERATION:                                 │
│  ✅ Estrazione generata con successo!              │
│  15 abbinamenti creati                             │
│  Gli abbinamenti sono sealed - nessuno può vederli │
│                                                    │
│  [Visualizza Ordine Turni] [Rigenera] [Attiva]    │
└────────────────────────────────────────────────────┘

TAB 5 - LIVE CONTROL:
┌────────────────────────────────────────────────────┐
│  Controllo Estrazione Live                         │
│                                                    │
│  Status: ⏸️ Non avviata / ▶️ In corso / ✅ Completa │
│                                                    │
│  Turno attuale: 5/15                               │
│  In attesa di: Giovanni Verdi                      │
│                                                    │
│  [  Avvia Estrazione  ] (se non avviata)          │
│  [  Prossimo Turno Forzato  ] (emergency)         │
│  [  Pausa  ] / [  Riprendi  ]                     │
│                                                    │
│  Abbinamenti Rivelati:                             │
│  ┌────────────────────────────────────────────┐   │
│  │ Ord  Giver          Receiver             │   │
│  │ ──────────────────────────────────────────│   │
│  │  1   Mario Rossi    Lucia Bianchi ✅     │   │
│  │  2   Lucia Bianchi  Stefano Neri ✅      │   │
│  │  3   Giovanni Verdi ... ⏳               │   │
│  │  4   ...            ... 🔒               │   │
│  └────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

**Actions:**

**Generate Extraction:**
- Button disabled until:
  - At least 3 valid participants
  - Gifts deadline passed (optional, can force)
- On click → API call → loading → success/error toast
- After success: enable "Visualizza Ordine", "Rigenera", "Attiva"

**Activate Extraction:**
- Confirmation modal: "Attivare l'estrazione? Gli utenti potranno accedere."
- On confirm → `UPDATE settings SET draw_enabled = TRUE`
- Success → tab switches to "Live Control"

**Start Extraction:**
- Big prominent button
- On click → `UPDATE settings SET draw_started = TRUE, current_turn = 1`
- UI updates to show current turn realtime

**Force Next Turn:**
- Emergency button (ghost variant, gray)
- On click → reveals current user's assignment + increments turn
- Use case: user disconnected

**Pause/Resume:**
- Temporarily freezes `current_turn`
- UI shows "PAUSED" badge

---

### 6.8 Gift Received Detail Page

```
HEADER:
┌────────────────────────────────────────┐
│  Hai ricevuto un regalo! 🎁            │
└────────────────────────────────────────┘

GIFT CARD:
┌────────────────────────────────────────┐
│  [Preview: Image or Icon]              │
│                                        │
│  Titolo: "Abbonamento Spotify"         │
│  Tipo: [Badge: Digitale]               │
│                                        │
│  Messaggio:                            │
│  "Buon Natale! Spero ti piaccia..."    │
│                                        │
│  IF DIGITAL:                           │
│  URL: https://spotify.com/gift         │
│  [  Apri Link  ]                       │
│                                        │
│  Oppure scarica file:                  │
│  [  Download File  ]                   │
│                                        │
│  IF PHYSICAL:                          │
│  [Photo gallery/carousel]              │
│                                        │
└────────────────────────────────────────┘

IF PHYSICAL + DIFFERENT CITY + NO ADDRESS:
┌────────────────────────────────────────┐
│  ⚠️ Inserisci il tuo indirizzo         │
│                                        │
│  Il mittente vive in un'altra città.   │
│  Inserisci il tuo indirizzo per        │
│  ricevere la spedizione.               │
│                                        │
│  [Form indirizzo completo]             │
│                                        │
│  [  Salva indirizzo  ]                 │
└────────────────────────────────────────┘

INFO CARD:
┌────────────────────────────────────────┐
│  Info spedizione                       │
│                                        │
│  Riceverai da: Mario Rossi             │
│  Città mittente: Milano                │
│  Tua città: Roma                       │
│                                        │
│  IF address saved:                     │
│  ✅ Indirizzo inviato al mittente      │
└────────────────────────────────────────┘

FOOTER:
[  Torna alla dashboard  ]
```

---

### 6.9 Survey Page

```
CENTER CARD:
┌────────────────────────────────────────┐
│                                        │
│          Com'è andata? ⭐              │
│                                        │
│  Aiutaci a migliorare l'evento del     │
│  prossimo anno!                        │
│                                        │
│  Rating:                               │
│  ⭐ ⭐ ⭐ ⭐ ⭐ (interactive stars)       │
│                                        │
│  Commento (opzionale):                 │
│  ┌──────────────────────────────────┐ │
│  │                                  │ │
│  │  [Textarea]                      │ │
│  │                                  │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  [     Invia feedback     ]            │
│                                        │
└────────────────────────────────────────┘

SUCCESS STATE:
┌────────────────────────────────────────┐
│                                        │
│         ✅ Grazie per il feedback!     │
│                                        │
│  [Checkmark animation]                 │
│                                        │
│  Il tuo contributo è prezioso per noi. │
│                                        │
│  [Redirect in 3...2...1...]            │
│                                        │
└────────────────────────────────────────┘
```

---

## 7. Design System

### Color Palette

```css
:root {
  /* Primary - Green */
  --green-primary: #4a9960;
  --green-light: #a8e6b5;
  --green-dark: #2d5f3d;
  
  /* Secondary - Red */
  --red-primary: #ff6b6b;
  --red-light: #ff9999;
  --red-dark: #cc5555;
  
  /* Accent - Gold */
  --gold: #ffd700;
  
  /* Neutrals */
  --white: #ffffff;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-500: #6b7280;
  --gray-900: #111827;
  
  /* Semantic */
  --success: var(--green-primary);
  --warning: var(--gold);
  --error: var(--red-primary);
  --info: var(--gray-500);
}
```

### Typography

```css
/* Font Family */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Headings */
--h1: 48px / 56px / 700 / -0.02em;
--h2: 36px / 44px / 700 / -0.01em;
--h3: 28px / 36px / 600 / 0em;
--h4: 24px / 32px / 600 / 0em;
--h5: 20px / 28px / 600 / 0em;

/* Body */
--body-large: 18px / 28px / 400 / 0em;
--body-default: 16px / 24px / 400 / 0em;
--body-small: 14px / 20px / 400 / 0em;
--caption: 12px / 16px / 400 / 0em;

/* Button */
--button-large: 16px / 24px / 600 / 0.01em;
--button-default: 14px / 20px / 600 / 0.01em;
```

### Spacing

```css
/* 8px base unit */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
--space-24: 96px;
```

### Border Radius

```css
--radius-sm: 6px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-full: 9999px;
```

### Shadows

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
--shadow-glow: 0 0 40px rgba(255, 215, 0, 0.4);
```

### Component Specifications

#### Button

```
Primary:
- Background: var(--red-primary)
- Text: var(--white)
- Padding: 12px 24px (medium), 16px 32px (large)
- Border-radius: var(--radius-full)
- Shadow: var(--shadow-md)
- Hover: --red-light bg + --shadow-lg + scale(1.02)
- Active: --red-dark bg + --shadow-sm

Secondary:
- Background: transparent
- Text: var(--green-dark)
- Border: 2px solid var(--green-primary)
- Hover: --green-light bg
- Active: --green-primary bg + white text

Ghost:
- Background: transparent
- Text: var(--gray-500)
- Hover: --gray-100 bg
```

#### Input

```
- Height: 48px (large), 40px (default)
- Padding: 12px 16px
- Border: 1px solid var(--gray-200)
- Border-radius: var(--radius-sm)
- Font: var(--body-default)
- Focus: border --green-primary + --shadow-glow (green variant)
- Error: border --red-primary
- Disabled: bg --gray-50 + text --gray-500
```

#### Card

```
- Background: var(--white)
- Border: 1px solid var(--gray-100)
- Border-radius: var(--radius-md)
- Padding: 24px
- Shadow: var(--shadow-sm)
- Hover: --shadow-md
```

#### Badge

```
- Padding: 4px 12px
- Border-radius: var(--radius-full)
- Font: var(--caption) / 600

Success: --green-light bg + --green-dark text
Warning: --gold bg + --gray-900 text
Error: --red-light bg + --red-dark text
Info: --gray-100 bg + --gray-900 text
```

---

## 8. Flussi Utente

### 8.1 First Time User Journey

```
1. Utente riceve link Secret Santa
   ↓
2. Arriva su homepage (/)
   - Vede animazioni festive
   - Click "Santi Thesigners"
   ↓
3. Login page (/auth/login)
   - Inserisce email
   - Sistema verifica: email in users table?
   - Se NO → error
   - Se SÌ + primo accesso → redirect /auth/setup
   ↓
4. Setup password (/auth/setup)
   - Step 1: Crea password + conferma
   - Step 2 (optional): Inserisce indirizzo spedizione
   - Click "Salva e completa"
   - Sistema crea auth account
   ↓
5. Dashboard (/dashboard)
   - Vede 4 card:
     - Regalo: "Carica regalo" + countdown
     - Quiz: "Completa il quiz!"
     - Regalo ricevuto: empty
     - Estrazione: "Inizierà il [data]"
   ↓
6a. Click "Completa il quiz" → /quiz
    - Risponde domanda
    - Vede posizione provvisoria
    - Redirect dashboard
    ↓
6b. Click "Carica regalo" → /dashboard/gift
    - Se quiz non fatto → modal block → redirect /quiz
    - Se quiz fatto → form disponibile
    - Upload regalo (digital o physical)
    - Salva
    - Redirect dashboard
    ↓
7. Dashboard aggiornata:
   - Regalo: preview + "Modifica" (se prima deadline)
   - Quiz: check verde + tempo
   - Regalo ricevuto: ancora empty
   - Estrazione: ancora "Inizierà..."
   ↓
8. [Aspetta estrazione...]
   ↓
9. Riceve notifica (UI o email): "Estrazione iniziata!"
   - Click "Vai alla pagina estrazione" da dashboard
   ↓
10. Extraction live page (/extraction)
    - Se non è il tuo turno: "In attesa di [Nome]..."
    - Vede abbinamenti rivelati in realtime
    ↓
11. Quando è il tuo turno:
    - Vede "È IL TUO TURNO!"
    - Click "Scopri a chi fai il regalo"
    - Modal animation → "Regalerai a: [Nome]!"
    - Card appare in lista pubblica
    ↓
12. Estrazione completa
    - Vede tutti gli abbinamenti
    - Click "Vai alla dashboard"
    ↓
13. Dashboard: "Regalo Ricevuto" ora ha contenuto
    - Click "Visualizza dettagli" → /dashboard/gift-received
    - Vede regalo + messaggio
    - Se fisico + città diversa → form indirizzo (se non già inserito)
    ↓
14. Post-evento: /survey
    - Rating 1-5 stelle
    - Commento opzionale
    - Submit
    ↓
15. Fine 🎉
```

### 8.2 Returning User (Secondo Accesso)

```
1. Homepage → Click "Santi Thesigners"
   ↓
2. Login page
   - Inserisce email + password
   - Login
   ↓
3. Dashboard
   - Vede stato attuale (regalo caricato, quiz fatto, etc.)
   - Può modificare regalo (se prima deadline)
   ↓
[Prosegue come first time user dal punto 8 in poi]
```

### 8.3 Admin Journey

```
1. Admin login (stessa pagina, ma role = 'admin')
   ↓
2. Dashboard + link "Admin Panel" nel menu
   ↓
3. Admin panel (/admin)
   - Tab Overview: vede stats
   - Tab Date Config: configura deadline
   - Tab Participants: monitora chi ha caricato cosa
   ↓
4. Quando deadline regali scaduta:
   - Tab Generation: vede classifica quiz
   - Click "Genera Estrazione Sealed"
   - Sistema crea abbinamenti
   - Conferma: "15 abbinamenti creati"
   ↓
5. Click "Attiva Estrazione"
   - Conferma modal
   - Sistema setta draw_enabled = true
   - Utenti possono ora accedere a /extraction
   ↓
6. Tab Live Control:
   - Click "Avvia Estrazione"
   - Sistema setta draw_started = true, current_turn = 1
   - Tutti gli utenti vedono "Turno 1"
   ↓
7. Monitora estrazione in corso:
   - Vede turno corrente
   - Vede abbinamenti rivelati
   - Se necessario: "Prossimo Turno Forzato"
   ↓
8. Estrazione completa:
   - Status: "Completata"
   - Vede tutti gli abbinamenti
   - Tab Participants: può vedere chi ha ricevuto cosa
   ↓
9. Post-evento:
   - Può vedere feedback utenti
   - Esporta report
   ↓
10. Fine ciclo
```

---

## 9. Pannello Admin

### Funzionalità Complete

#### Tab 1: Overview
- **Cards Stats:** Total users, gifts uploaded, quiz completed, valid participants
- **Lista esclusi:** Utenti senza regalo o quiz, con reason
- **Quick actions:** Link diretti a generation, live control

#### Tab 2: Date Configuration
- **Form configurazione:**
  - Gifts start date (optional)
  - Gifts deadline (required)
  - Quiz available date (optional)
  - Extraction available date (optional)
- **Timeline preview:** Visual chart con milestone
- **Validazioni:**
  - Deadline non può essere nel passato
  - Se utenti hanno già caricato, warning su modifica
- **Save button:** Aggiorna `settings` table

#### Tab 3: Participants
- **Tabella completa:**
  - Columns: Nome, Email, Città, Regalo (✓/✗), Quiz (✓/✗), Tempo risposta
  - Sortable per ogni colonna
  - Search bar (cerca per nome/email)
  - Filter: All / Valid / Excluded
- **Row actions:**
  - View details (modal con info utente completo)
  - Edit (admin può modificare dati utente se necessario)
- **Export button:** Download CSV partecipanti

#### Tab 4: Generation
- **Classifica quiz:**
  - Tabella ordinata per `answered_at` ASC
  - Mostra: Posizione, Nome, Tempo preciso (ms)
- **Status indicator:**
  - "Partecipanti validi: X"
  - "Pronto per generazione" (verde) o "Non pronto" (grigio)
- **Button "Genera Estrazione Sealed":**
  - Disabled se < 3 partecipanti
  - Click → API call → loading state
  - Success:
    - "✅ Estrazione generata con successo!"
    - "15 abbinamenti creati"
    - "Gli abbinamenti sono sealed"
  - Abilita 3 nuovi button:
    - **"Visualizza Ordine Turni":** Modal con lista turni (senza destinatari)
    - **"Rigenera":** Disponibile solo se `draw_enabled = false`
      - Conferma modal: "Rigenerare? Abbinamenti attuali persi."
      - Delete + re-generate
    - **"Attiva Estrazione":** Primary button
      - Conferma modal: "Attivare? Utenti potranno accedere."
      - Update `settings.draw_enabled = true`
      - Redirect a Tab 5 (Live Control)

#### Tab 5: Live Control
- **Status badge:** Not Started / In Progress / Completed
- **Current turn indicator:**
  - "Turno X/Y"
  - "In attesa di: [Nome]"
- **Control buttons:**
  - **"Avvia Estrazione":** (se `draw_started = false`)
    - Update `settings.draw_started = true, current_turn = 1`
  - **"Prossimo Turno Forzato":** (emergency, ghost button)
    - Modal: "Forzare turno? [Nome] perderà l'opportunità di scegliere."
    - API: rivela abbinamento sealed + increment turn
  - **"Pausa":** Blocca temporaneamente turno
  - **"Riprendi":** Riattiva dopo pausa
- **Abbinamenti rivelati table:**
  - Columns: Ord, Giver, Receiver, Status (✅/⏳/🔒)
  - Realtime updates
  - Revealed: mostra nome receiver
  - Not revealed: "..." con lock icon
- **Progress bar:** Visual X/Y turni completati

---

## 10. Sicurezza e Permessi

### Row Level Security (RLS)

**Supabase RLS policies implementate su tutte le tabelle.**

#### Users Table

```sql
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data (except role)
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

#### Gifts Table

```sql
-- Users can read/update their own gift
CREATE POLICY "Users can manage own gift" ON gifts
  FOR ALL USING (user_id = auth.uid());

-- After extraction, users can see received gift
CREATE POLICY "Users can see received gift" ON gifts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM extraction 
      WHERE extraction.receiver_id = auth.uid() 
        AND extraction.revealed_at IS NOT NULL
        AND gifts.user_id = extraction.user_id
    )
  );

-- Admins can read all gifts
CREATE POLICY "Admins can read all gifts" ON gifts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

#### Extraction Table

```sql
-- Users can read their own row (but receiver_id hidden until revealed)
CREATE POLICY "Users can read own extraction" ON extraction
  FOR SELECT USING (user_id = auth.uid());

-- Everyone can read revealed extractions (for live page)
CREATE POLICY "Everyone can read revealed extractions" ON extraction
  FOR SELECT USING (revealed_at IS NOT NULL);

-- Admins can read all (but receiver_id still hidden if not revealed)
CREATE POLICY "Admins can read all extractions" ON extraction
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can manage (create/delete)
CREATE POLICY "Admins can manage extractions" ON extraction
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

**Note:** `receiver_id` è nascosto tramite query SELECT condizionale:

```sql
-- In application code:
SELECT 
  id,
  user_id,
  CASE 
    WHEN revealed_at IS NOT NULL THEN receiver_id 
    ELSE NULL 
  END as receiver_id,
  order_position,
  revealed_at
FROM extraction;
```

#### Settings Table

```sql
-- Everyone can read settings
CREATE POLICY "Everyone can read settings" ON settings
  FOR SELECT USING (true);

-- Only admins can update
CREATE POLICY "Admins can update settings" ON settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

### API Endpoints Protetti

**Tutti gli endpoint admin richiedono verifica role:**

```typescript
// Middleware esempio
export async function requireAdmin(req: Request) {
  const user = await getUser(req);
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (userData?.role !== 'admin') {
    return new Response('Forbidden', { status: 403 });
  }
  
  return user;
}

// Uso:
// /api/admin/generate-extraction/route.ts
export async function POST(req: Request) {
  await requireAdmin(req);
  
  // ... logica generazione
}
```

### Supabase Storage Security

**Bucket "gifts" policies:**

```sql
-- Users can upload to their own folder
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gifts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can read their own files
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'gifts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can read files of their gift giver (after reveal)
CREATE POLICY "Users can read received gift files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'gifts'
  AND EXISTS (
    SELECT 1 FROM extraction
    WHERE extraction.receiver_id = auth.uid()
      AND extraction.revealed_at IS NOT NULL
      AND (storage.foldername(name))[1] = extraction.user_id::text
  )
);

-- Admins can read all
CREATE POLICY "Admins can read all files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'gifts'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

## 11. Deployment e Configurazione

### Environment Variables

**.env.local (development):**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... (secret, only server-side)
```

**Vercel Environment Variables (production):**
- Stesso set, configurato in Vercel dashboard
- `SUPABASE_SERVICE_ROLE_KEY` marcato come "Secret"

### Supabase Configuration

**Database:**
- Region: Europe West (Ireland) per latenza ottimale
- Piano: Pro (per realtime + storage illimitato)

**Realtime:**
- Abilitato su tabella `extraction`
- Abilitato su tabella `settings` (solo per current_turn)

**Storage:**
- Bucket `gifts`:
  - Public: false
  - File size limit: 10MB per file
  - Allowed MIME types: image/*, application/pdf, video/*, audio/*, application/zip

**Auth:**
- Email provider abilitato
- Password requirements: min 8 chars
- Email confirmation: disabled (utenti pre-caricati)

### Vercel Configuration

**Build Settings:**
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**Domains:**
- Production: `secretsanta.thesigners.it` (custom domain)
- Preview: auto-generated per ogni PR

**Analytics:**
- Vercel Analytics abilitato
- Web Vitals tracking

---

## 12. Checklist Implementazione

### Phase 1: Setup (Giorno 1, mattina)

- [ ] Crea repository GitHub
- [ ] Setup progetto Next.js 14 + TypeScript
- [ ] Installa dipendenze: Tailwind, shadcn/ui, Supabase client
- [ ] Crea progetto Supabase
- [ ] Esegui script SQL database schema
- [ ] Configura .env.local con credenziali Supabase
- [ ] Setup Supabase Storage bucket "gifts"
- [ ] Abilita Realtime su extraction e settings
- [ ] Commit iniziale

### Phase 2: Design System + Homepage (Giorno 1, pomeriggio)

- [ ] Crea Design System in Figma (context prompt)
- [ ] Genera componenti base in Figma Make
- [ ] Implementa homepage (/)
  - [ ] Background gradient
  - [ ] Ticker scorrevoli
  - [ ] Albero animato
  - [ ] CTA button
  - [ ] Neve (optional)
- [ ] Test responsive mobile
- [ ] Commit

### Phase 3: Autenticazione (Giorno 1, sera)

- [ ] Implementa `/auth/login`
  - [ ] Form email
  - [ ] Validazione email in users table
  - [ ] Gestione primo accesso vs returning user
  - [ ] Error states
- [ ] Implementa `/auth/setup`
  - [ ] Stepper 2 step
  - [ ] Password creation con validazione
  - [ ] Form indirizzo (opzionale)
  - [ ] Supabase Auth signup
- [ ] Setup middleware protezione route
- [ ] Test login flow completo
- [ ] Commit

### Phase 4: Dashboard Utente (Giorno 2, mattina)

- [ ] Implementa layout dashboard
  - [ ] Header con user menu
  - [ ] Grid 2 colonne responsive
- [ ] Card "Il Tuo Regalo"
  - [ ] Stati: not uploaded, uploaded, locked
  - [ ] Countdown component
  - [ ] Integration con gifts table
- [ ] Card "Quiz"
  - [ ] Stati: not completed, completed
  - [ ] Fetch da quiz_answers
- [ ] Card "Regalo Ricevuto"
  - [ ] Stati: before/after extraction
- [ ] Card "Estrazione Live"
  - [ ] Stati basati su settings
- [ ] Test stati multipli
- [ ] Commit

### Phase 5: Gift Upload (Giorno 2, pomeriggio)

- [ ] Implementa `/dashboard/gift`
  - [ ] Toggle Digital/Physical
  - [ ] Form digital (title, URL, file upload, message, notes)
  - [ ] Form physical (title, photo upload, message)
  - [ ] Validazione quiz pre-requisito
  - [ ] Upload files a Supabase Storage
  - [ ] Save/update in gifts table
- [ ] Test upload entrambi i tipi
- [ ] Test modifica prima/dopo deadline
- [ ] Commit

### Phase 6: Quiz (Giorno 2, sera)

- [ ] Implementa `/quiz`
  - [ ] Fetch domanda da quiz_questions
  - [ ] Form risposta
  - [ ] Timer millisecondi (optional)
  - [ ] Save in quiz_answers con timestamp
  - [ ] Success state con posizione
- [ ] Test velocità timestamp
- [ ] Commit

### Phase 7: Admin Panel - Parte 1 (Giorno 3, mattina)

- [ ] Implementa `/admin` layout
  - [ ] Verifica role admin in middleware
  - [ ] Tabbed interface
- [ ] Tab Overview
  - [ ] Stats cards
  - [ ] Lista esclusi
- [ ] Tab Date Configuration
  - [ ] Form date picker
  - [ ] Save in settings
  - [ ] Timeline preview
- [ ] Tab Participants
  - [ ] Tabella con sorting/filtering
  - [ ] Search bar
- [ ] Commit

### Phase 8: Admin Panel - Parte 2 (Giorno 3, pomeriggio)

- [ ] Tab Generation
  - [ ] Classifica quiz display
  - [ ] Button "Genera Estrazione"
  - [ ] API `/api/admin/generate-extraction`
    - [ ] Fetch partecipanti validi
    - [ ] Algoritmo permutazione ciclica
    - [ ] Insert in extraction
  - [ ] Post-generation UI (buttons rigenera/attiva)
- [ ] Test generazione con 3, 5, 10 utenti
- [ ] Commit

### Phase 9: Extraction Live - Parte 1 (Giorno 3, sera)

- [ ] Implementa `/extraction` layout
  - [ ] Status badge
  - [ ] Current turn indicator
- [ ] Stati waiting/in progress/completed
- [ ] Logica "your turn" vs "not your turn"
- [ ] Button "Scopri" per utente corrente
- [ ] Commit

### Phase 10: Extraction Live - Parte 2 (Giorno 4, mattina)

- [ ] API `/api/extraction/reveal`
  - [ ] Update revealed_at
  - [ ] Increment current_turn
  - [ ] Return receiver details
- [ ] Reveal animation (modal + confetti)
- [ ] Lista "Abbinamenti Rivelati" con cards
- [ ] Supabase Realtime subscription
  - [ ] Listen extraction updates
  - [ ] Listen settings.current_turn updates
  - [ ] Auto-scroll new cards
- [ ] Test realtime sync con 2+ browser
- [ ] Commit

### Phase 11: Admin Live Control (Giorno 4, pomeriggio)

- [ ] Tab Live Control
  - [ ] Status display
  - [ ] Button "Avvia Estrazione"
  - [ ] Button "Prossimo Turno Forzato"
  - [ ] Buttons Pausa/Riprendi
  - [ ] Tabella abbinamenti rivelati
- [ ] Test controlli admin durante estrazione
- [ ] Commit

### Phase 12: Gift Received + Shipping (Giorno 4, sera)

- [ ] Implementa `/dashboard/gift-received`
  - [ ] Display gift details
  - [ ] Differentiate digital vs physical
  - [ ] Form indirizzo (se necessario)
  - [ ] Save address in users table
- [ ] Visibilità indirizzo per giver
  - [ ] Display in dashboard giver side
  - [ ] Only if physical + different city
- [ ] Test flow completo indirizzo
- [ ] Commit

### Phase 13: Survey (Giorno 5, mattina)

- [ ] Implementa `/survey`
  - [ ] Rating stars component
  - [ ] Comment textarea
  - [ ] Save in feedback table
  - [ ] Success state
- [ ] Test submit
- [ ] Commit

### Phase 14: Polish & Testing (Giorno 5, pomeriggio)

- [ ] Animazioni:
  - [ ] Framer Motion per page transitions
  - [ ] Confetti reveal
  - [ ] Loading states
  - [ ] Skeleton loaders
- [ ] Error handling:
  - [ ] Error boundaries
  - [ ] Toast notifications
  - [ ] Retry logic
- [ ] Accessibility:
  - [ ] ARIA labels
  - [ ] Keyboard navigation
  - [ ] Focus management
  - [ ] Screen reader announcements
- [ ] Mobile responsive check su tutte le pagine
- [ ] Commit

### Phase 15: Deploy (Giorno 5, sera)

- [ ] Commit finale repository
- [ ] Push to GitHub main branch
- [ ] Deploy su Vercel
  - [ ] Configura environment variables
  - [ ] Setup custom domain (optional)
  - [ ] Verifica build success
- [ ] Test su production URL
- [ ] Configura Supabase production settings
  - [ ] URL allowed in Auth
  - [ ] CORS settings
- [ ] Smoke test completo flow

### Phase 16: Data Setup (Pre-evento)

- [ ] Pre-carica utenti in users table
  - [ ] SQL script con email aziendali
  - [ ] Almeno 1 admin
- [ ] Configura date in settings via admin panel
- [ ] Insert quiz question
- [ ] Test con utenti fake (5-10)
- [ ] Reset database
- [ ] Evento ready 🚀

---

## Appendice A: SQL Scripts Utili

### Popolamento Utenti Test

```sql
-- Clear esistenti (solo development!)
TRUNCATE users, gifts, quiz_answers, extraction, feedback RESTART IDENTITY CASCADE;

-- Admin
INSERT INTO users (email, full_name, city, role) VALUES
('admin@thesigners.it', 'Admin User', 'Milano', 'admin');

-- Utenti test
INSERT INTO users (email, full_name, city) VALUES
('mario.rossi@thesigners.it', 'Mario Rossi', 'Milano'),
('lucia.bianchi@thesigners.it', 'Lucia Bianchi', 'Roma'),
('giovanni.verdi@thesigners.it', 'Giovanni Verdi', 'Milano'),
('anna.neri@thesigners.it', 'Anna Neri', 'Torino'),
('paolo.blu@thesigners.it', 'Paolo Blu', 'Milano'),
('sara.rosa@thesigners.it', 'Sara Rosa', 'Roma'),
('marco.gialli@thesigners.it', 'Marco Gialli', 'Napoli'),
('elena.viola@thesigners.it', 'Elena Viola', 'Milano'),
('luca.arancio@thesigners.it', 'Luca Arancio', 'Bologna'),
('sofia.grigia@thesigners.it', 'Sofia Grigia', 'Firenze');

-- Simula alcuni utenti che hanno caricato
UPDATE users SET has_uploaded_gift = true 
WHERE email IN (
  'mario.rossi@thesigners.it',
  'lucia.bianchi@thesigners.it',
  'giovanni.verdi@thesigners.it',
  'paolo.blu@thesigners.it',
  'sara.rosa@thesigners.it'
);

-- Simula risposte quiz con timestamp progressivi
INSERT INTO quiz_answers (user_id, question_id, answer, answered_at)
SELECT 
  u.id,
  (SELECT id FROM quiz_questions LIMIT 1),
  'Film preferito: ' || u.full_name,
  NOW() + (ROW_NUMBER() OVER (ORDER BY u.full_name) || ' seconds')::INTERVAL
FROM users u
WHERE u.has_uploaded_gift = true;
```

### Reset Estrazione (per test ripetuti)

```sql
-- Reset extraction e settings
DELETE FROM extraction;

UPDATE settings SET
  draw_enabled = false,
  draw_started = false,
  current_turn = 0,
  extraction_generated_at = NULL,
  extraction_started_at = NULL,
  extraction_completed_at = NULL;
```

### Query Diagnostica

```sql
-- Vedi partecipanti validi con ordine
SELECT 
  u.full_name,
  u.has_uploaded_gift,
  qa.answered_at,
  RANK() OVER (ORDER BY qa.answered_at) as position
FROM users u
LEFT JOIN quiz_answers qa ON qa.user_id = u.id
WHERE u.has_uploaded_gift = true
  AND qa.id IS NOT NULL
ORDER BY qa.answered_at;

-- Vedi stato estrazione
SELECT 
  e.order_position,
  giver.full_name as giver_name,
  receiver.full_name as receiver_name,
  e.revealed_at
FROM extraction e
JOIN users giver ON giver.id = e.user_id
JOIN users receiver ON receiver.id = e.receiver_id
ORDER BY e.order_position;
```

---

## Appendice B: Prompt Claude Code Essenziali

### Struttura Progetto

```
Crea la struttura base del progetto Next.js 14 Secret Santa:

/app
  /auth
    /login - pagina login
    /setup - first access setup
  /dashboard - dashboard utente
    /gift - upload regalo
    /gift-received - dettagli regalo ricevuto
  /admin - pannello admin (protetto)
  /extraction - estrazione live
  /quiz - pagina quiz
  /survey - feedback finale
  /api
    /admin
      /generate-extraction - API generazione sealed
    /extraction
      /reveal - API reveal abbinamento
/components
  /ui - shadcn components
  /shared - componenti custom
/lib
  /supabase - client e helpers
  /utils - utility functions
/types - TypeScript types

Configura:
- next.config.js
- tailwind.config.ts con palette natalizia
- .env.local template
- tsconfig.json strict mode
```

### Supabase Client

```
Setup Supabase client in /lib/supabase/client.ts

Include:
- Browser client con anon key
- Server client con service role (only server-side)
- Auth helpers:
  - signIn(email, password)
  - signUp(email, password)
  - signOut()
  - getSession()
  - getCurrentUser()
- Query helpers per tabelle principali
- Realtime subscription helper per extraction
- Storage helpers per upload files

Use TypeScript types da /types/database.ts
```

### Homepage Animata

```
Implementa homepage (app/page.tsx) con design festivo:

- Background radial gradient verde
- 3 ticker scorrevoli (alternating directions)
- Albero centro che dondola (swing animation)
- Hero: "Secret Santa" + "2024" + CTA "Santi Thesigners"
- Optional: neve che cade

Usa Tailwind + custom CSS animations
CTA link: /auth/login
Responsive mobile
```

### Dashboard con Stati Multipli

```
Implementa dashboard (app/dashboard/page.tsx)

Layout: header + 2 col grid (60/40 desktop, stack mobile)

LEFT:
- Card "Regalo": 3 stati (not uploaded, uploaded before deadline, locked)
- Card "Quiz": 2 stati (not completed, completed)

RIGHT:
- Card "Regalo Ricevuto": 2 stati (before extraction, after)
- Card "Estrazione Live": 4 stati (not started, ready, in progress, completed)

Fetch data da Supabase:
- users (current user)
- gifts (user's gift)
- quiz_answers (user's answer)
- extraction (where receiver_id = user, only if revealed)
- settings (per stati globali)

Include countdown component per deadline
Realtime subscription per extraction updates
```

### Estrazione Live con Realtime

```
Implementa pagina estrazione live (app/extraction/page.tsx)

Layout:
- Header con status badge
- Current turn indicator
- IF your turn: button "Scopri" (prominent, glow)
- IF not your turn: "In attesa di [Nome]..."
- Lista "Abbinamenti Rivelati" (cards in tempo reale)

Logica:
1. Fetch current_turn da settings
2. Fetch extraction WHERE order_position = current_turn
3. Compare con current user
4. On click "Scopri": API call /api/extraction/reveal
5. Modal animation reveal con confetti
6. Broadcast realtime a tutti

Supabase Realtime:
- Subscribe extraction table (on UPDATE where revealed_at changes)
- Subscribe settings table (on UPDATE current_turn)
- Auto-update UI senza refresh

Use framer-motion per animations
Use canvas-confetti per celebrazione
```

---

**Fine Documento**

**Note Finali:**
- Questo documento è la single source of truth per tutto il progetto
- Mantenerlo aggiornato durante sviluppo se emergono modifiche
- Utilizzare come reference per prompt a Claude Code, Figma Make, e discussioni con team
- Versioning: salvare snapshot a milestone importanti

**Contatti:**
- Project Lead: [Nome]
- Tech Lead: [Nome]
- Designer: [Nome]

**Last Updated:** 2024-12-08
