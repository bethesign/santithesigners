# 🎄 Secret Santa 2024 - Roadmap Implementazione Completa

**Obiettivo:** Progetto completamente funzionante con tutte le logiche backend entro domani
**Data:** 9 Dicembre 2024
**Status:** In Progress

---

## 📋 Overview

Questo documento guida l'implementazione completa dell'applicazione Secret Santa, partendo dallo stato attuale (UI mock) fino ad un'applicazione full-stack funzionante con Supabase.

**Stato Attuale:**
- ✅ UI completa con design natalizio
- ✅ Componenti React + TypeScript
- ✅ Supabase client configurato
- ✅ Schema SQL definito
- ❌ Nessuna connessione backend attiva
- ❌ Routing con useState (da sostituire)
- ❌ Autenticazione mock
- ❌ Nessuna logica database

---

## 🎯 Fasi di Implementazione

### **FASE 0: Git & GitHub Setup** 🔄 INIZIALE
**Version control e preparazione deploy**

#### 0.1 Git Repository Init
- [ ] Verificare se git è già inizializzato (`git status`)
- [ ] Se non presente: `git init`
- [ ] Verificare `.gitignore` include:
  - `node_modules/`
  - `.env.local`
  - `dist/`
  - `.DS_Store`
- [ ] Commit iniziale del codice esistente

#### 0.2 GitHub Repository
- [ ] Creare repository su GitHub (pubblico o privato)
- [ ] Nome: `secret-santa-2024` o `thesigners-secret-santa`
- [ ] Collegare remote:
  ```bash
  git remote add origin <github-url>
  git branch -M main
  git push -u origin main
  ```
- [ ] Verificare push riuscito

#### 0.3 Git Workflow Setup
- [ ] Decidere strategia branching:
  - **Opzione A:** main + development (consigliato)
  - **Opzione B:** solo main (più semplice per progetto piccolo)
- [ ] Proteggere main branch (optional, se team)
- [ ] Setup commit message convention (optional)

**Deliverable:** Repository GitHub configurato con codice pushato

---

### **FASE 1: Setup Infrastrutturale** ⚡ CRITICO
**Prerequisiti per tutto il resto del progetto**

#### 1.1 Database Setup
- [ ] Verificare progetto Supabase attivo
- [ ] Eseguire `schema.sql` completo
- [ ] Eseguire `init-settings.sql` per configurazione iniziale
- [ ] Eseguire `seed.sql` per utenti test
- [ ] Verificare tabelle create correttamente
- [ ] Inserire domanda quiz default se non presente

#### 1.2 Storage Setup
- [ ] Creare bucket Supabase Storage "gifts"
- [ ] Configurare bucket come privato
- [ ] Eseguire `storage-policies.sql` per RLS policies
- [ ] Testare upload/download file

#### 1.3 TypeScript Types
- [ ] Generare/aggiornare `types/database.ts` da Supabase schema
- [ ] Definire tipi per User, Gift, Quiz, Extraction, Settings
- [ ] Esportare tipi per uso nell'app

#### 1.4 React Router Implementation
- [ ] Sostituire custom router con React Router DOM
- [ ] Setup `BrowserRouter` in `main.tsx`
- [ ] Definire routes in `App.tsx`:
  - `/` - Homepage
  - `/login` - Login
  - `/first-access` - Setup account
  - `/dashboard` - Dashboard (protected)
  - `/dashboard/gift` - Upload regalo (protected)
  - `/dashboard/gift-received` - Regalo ricevuto (protected)
  - `/quiz` - Quiz (protected)
  - `/extraction` - Live extraction (protected)
  - `/feedback` - Survey (protected)
  - `/admin` - Admin panel (protected + admin role)
- [ ] Creare `ProtectedRoute` component per route autenticate
- [ ] Creare `AdminRoute` component per route admin
- [ ] Testare navigazione

**Deliverable:** Database attivo, Storage configurato, Routing funzionante

---

### **FASE 2: Autenticazione** 🔐 CRITICO
**Fondamentale per tutto il resto**

#### 2.1 Supabase Auth Helpers
- [ ] Creare `lib/supabase/auth.ts` con helper functions:
  - `signIn(email, password)` - Login standard
  - `signUp(email, password, userData)` - Registrazione con user metadata
  - `signOut()` - Logout
  - `getSession()` - Sessione corrente
  - `getCurrentUser()` - User object completo
  - `updateUserPassword(password)` - Update password
  - `checkEmailExists(email)` - Verifica email in users table

#### 2.2 Auth Context/Provider
- [ ] Creare `contexts/AuthContext.tsx`
- [ ] Implementare AuthProvider con:
  - State: user, session, loading
  - useEffect per auth state change listener
  - Funzioni: login, logout, signup, refresh
- [ ] Wrappare app in AuthProvider

#### 2.3 Login Page Integration
- [ ] Implementare logica check email in users table
- [ ] Gestire primo accesso vs returning user
- [ ] Implementare login con Supabase Auth
- [ ] Error handling (credenziali errate, email non autorizzata)
- [ ] Redirect a dashboard dopo login
- [ ] Redirect a first-access se primo accesso

#### 2.4 First Access Page Integration
- [ ] Implementare creazione account Supabase Auth
- [ ] Collegare auth.users.id a public.users.id (via metadata o trigger)
- [ ] Form indirizzo spedizione (opzionale)
- [ ] Update users table con indirizzo se fornito
- [ ] Redirect a dashboard dopo setup

#### 2.5 Protected Routes
- [ ] Implementare middleware in ProtectedRoute:
  - Check sessione attiva
  - Redirect a /login se non autenticato
  - Loading state durante check
- [ ] Implementare AdminRoute:
  - Check role = 'admin' in users table
  - Redirect a /dashboard se non admin

#### 2.6 Auth UI States
- [ ] Loading spinner durante auth check
- [ ] Error boundaries per errori auth
- [ ] Logout button in DashboardLayout
- [ ] Session persistence

**Deliverable:** Sistema autenticazione completo e funzionante

---

### **FASE 3: Dashboard Utente** 📊 ALTA PRIORITÀ
**Hub principale dell'applicazione**

#### 3.1 Dashboard Data Fetching
- [ ] Creare `hooks/useUserData.ts` per fetch dati utente
- [ ] Fetch from users table (current user)
- [ ] Fetch from gifts table (user's gift)
- [ ] Fetch from quiz_answers table (user's answer)
- [ ] Fetch from settings table (deadline, draw_enabled, etc.)
- [ ] Fetch from extraction table (receiver_id = user, only if revealed)
- [ ] Handle loading states
- [ ] Handle errors

#### 3.2 Dashboard Card States - "Il Tuo Regalo"
- [ ] Implementare 3 stati:
  - **Not Uploaded:** Countdown deadline + CTA "Carica Regalo"
  - **Uploaded Before Deadline:** Preview + Button "Modifica"
  - **Locked After Deadline:** Preview + Lock icon + "Deadline scaduta"
- [ ] Countdown component con data reale da settings.gifts_deadline
- [ ] Preview regalo: thumbnail + titolo + tipo

#### 3.3 Dashboard Card States - "Quiz"
- [ ] Implementare 2 stati:
  - **Not Completed:** CTA "Completa il quiz!"
  - **Completed:** Check verde + tempo risposta + posizione provvisoria
- [ ] Calcolo posizione provvisoria:
  ```sql
  SELECT COUNT(*) + 1 FROM quiz_answers
  WHERE answered_at < my_answered_at
  ```

#### 3.4 Dashboard Card States - "Regalo Ricevuto"
- [ ] Implementare 2 stati:
  - **Before Extraction:** Empty state
  - **After Extraction:** Preview regalo + CTA "Visualizza"
- [ ] Warning banner se regalo fisico + città diversa + no indirizzo

#### 3.5 Dashboard Card States - "Estrazione Live"
- [ ] Implementare 4 stati:
  - **Not Started:** "Inizierà il [data]"
  - **Ready:** "Sta per iniziare!" + Badge
  - **In Progress:** "Turno X/Y" + CTA "Segui in diretta" + LIVE badge
  - **Completed:** "Completata!" + Link abbinamenti
- [ ] Basare stati su settings (draw_enabled, draw_started, current_turn)

#### 3.6 Realtime Updates
- [ ] Subscribe a settings table per aggiornamenti draw_started/current_turn
- [ ] Subscribe a extraction table per reveal del proprio regalo ricevuto
- [ ] Auto-refresh card states quando cambiano dati

**Deliverable:** Dashboard completamente funzionale con dati real-time

---

### **FASE 4: Quiz System** 📝 ALTA PRIORITÀ
**Determina ordine estrazione**

#### 4.1 Quiz Page - Data Fetching
- [ ] Fetch domanda attiva da quiz_questions table
- [ ] Check se utente ha già risposto
- [ ] Se già risposto: mostra success state + redirect

#### 4.2 Quiz Page - Form & Submission
- [ ] Form con textarea risposta
- [ ] Timer millisecondi (opzionale, visual only)
- [ ] Validazione risposta (non vuota)
- [ ] Submit answer:
  ```sql
  INSERT INTO quiz_answers (user_id, question_id, answer, answered_at)
  VALUES (current_user.id, question_id, answer_text, NOW())
  ```
- [ ] Timestamp preciso con milliseconds

#### 4.3 Quiz Page - Success State
- [ ] Calcola posizione provvisoria immediatamente dopo submit
- [ ] Mostra tempo di risposta
- [ ] Confetti animation
- [ ] Auto-redirect a dashboard dopo 3s

#### 4.4 Quiz Prerequisito per Regalo
- [ ] Blocco in GiftUpload se quiz non completato
- [ ] Modal "Prima devi completare il quiz!"
- [ ] Redirect automatico a /quiz

**Deliverable:** Sistema quiz completo con timestamp preciso

---

### **FASE 5: Gift Upload** 🎁 ALTA PRIORITÀ
**Core feature per partecipazione**

#### 5.1 Gift Upload - Form Digital
- [ ] Toggle Digital/Physical (controlled component)
- [ ] Form fields digital:
  - Title (required, max 100 chars)
  - URL (optional, validation URL format)
  - File upload (optional, max 10MB)
  - Message (textarea)
  - Notes (textarea, private)
- [ ] Validazione Zod schema

#### 5.2 Gift Upload - Form Physical
- [ ] Form fields physical:
  - Title (required)
  - Photo upload (required, max 5MB)
  - Message (textarea)
- [ ] Preview immagine dopo upload

#### 5.3 Gift Upload - File Upload to Storage
- [ ] Upload file a Supabase Storage bucket "gifts"
- [ ] Path: `{userId}/filename-{timestamp}.ext`
- [ ] Progress indicator durante upload
- [ ] Error handling (file troppo grande, formato non supportato)
- [ ] Ottenere public URL dopo upload (o signed URL se privato)

#### 5.4 Gift Upload - Database Save
- [ ] Check prerequisito quiz completato
- [ ] INSERT o UPDATE in gifts table:
  - Se già esiste regalo: UPDATE
  - Se nuovo: INSERT
- [ ] Update users.has_uploaded_gift = true
- [ ] Gestire transazione (file upload + db save atomic)

#### 5.5 Gift Upload - Edit Mode
- [ ] Se ha_uploaded_gift = true: mostrare dati esistenti
- [ ] Pre-popolare form con dati attuali
- [ ] Allow modifica solo se NOW() < gifts_deadline
- [ ] Delete vecchio file da storage se cambiato

#### 5.6 Gift Upload - Deadline Check
- [ ] Fetch gifts_deadline da settings
- [ ] Bloccare submit se deadline passata
- [ ] UI read-only dopo deadline

**Deliverable:** Upload regali funzionante con storage

---

### **FASE 6: Admin Panel - Parte 1** 👨‍💼 MEDIA PRIORITÀ
**Gestione configurazione e partecipanti**

#### 6.1 Admin Layout & Tabs
- [ ] Verificare role = 'admin' in middleware
- [ ] Layout con 5 tabs:
  - Overview
  - Date Configuration
  - Participants
  - Generation
  - Live Control

#### 6.2 Tab Overview
- [ ] Stats cards:
  - Total users (COUNT from users)
  - Gifts uploaded (COUNT where has_uploaded_gift = true)
  - Quiz completed (COUNT quiz_answers)
  - Valid participants (quiz + gift)
- [ ] Lista utenti esclusi con reason (no gift / no quiz)

#### 6.3 Tab Date Configuration
- [ ] Form con date pickers:
  - gifts_start_date (optional)
  - gifts_deadline (required)
  - quiz_available_date (optional)
  - extraction_available_date (optional)
- [ ] Save in settings table (UPDATE WHERE id = 1)
- [ ] Validazioni (deadline non nel passato)
- [ ] Timeline preview visuale

#### 6.4 Tab Participants
- [ ] Tabella con columns:
  - Nome, Email, Città, Regalo (✓/✗), Quiz (✓/✗), Tempo risposta
- [ ] Sortable columns
- [ ] Search bar (filter per nome/email)
- [ ] Filter: All / Valid / Excluded
- [ ] Export CSV button (optional)

**Deliverable:** Admin panel configurazione base

---

### **FASE 7: Extraction - Generation Algorithm** 🎲 CRITICO
**Cuore del sistema sealed**

#### 7.1 Generation API Endpoint
- [ ] Creare API endpoint (può essere una client function se non serve backend API)
- [ ] Auth check: solo admin può generare
- [ ] Fetch partecipanti validi:
  ```sql
  SELECT users.* FROM users
  WHERE has_uploaded_gift = TRUE
  AND EXISTS (SELECT 1 FROM quiz_answers WHERE quiz_answers.user_id = users.id)
  ```
- [ ] Ordina per quiz speed (quiz_answers.answered_at ASC)

#### 7.2 Cyclic Permutation Algorithm
- [ ] Implementare algoritmo:
  ```javascript
  // participants già ordinati per quiz
  const shuffled = shuffle(participants) // random shuffle
  const assignments = []
  for (let i = 0; i < shuffled.length; i++) {
    const giver = shuffled[i]
    const receiver = shuffled[(i + 1) % shuffled.length] // ciclico
    const order_position = // posizione originale da quiz, non da shuffle
    assignments.push({ user_id: giver.id, receiver_id: receiver.id, order_position })
  }
  ```
- [ ] Garantire:
  - Nessuno regala a se stesso
  - Tutti ricevono e danno
  - Ordine basato su quiz

#### 7.3 Extraction Save
- [ ] Transaction:
  ```sql
  BEGIN;
  DELETE FROM extraction; -- se già esiste
  INSERT INTO extraction (user_id, receiver_id, order_position) VALUES (...);
  UPDATE settings SET extraction_generated_at = NOW();
  COMMIT;
  ```
- [ ] receiver_id rimane sealed (NULL in SELECT fino a revealed_at)

#### 7.4 Admin UI - Generation Tab
- [ ] Mostrare classifica quiz (ordinata per tempo)
- [ ] Button "Genera Estrazione Sealed"
- [ ] Disabled se < 3 partecipanti
- [ ] Loading state durante generazione
- [ ] Success message: "X abbinamenti creati"
- [ ] Abilita buttons: "Visualizza Ordine", "Rigenera", "Attiva"

#### 7.5 Rigenera Function
- [ ] Disponibile solo se draw_enabled = false
- [ ] Confirmation modal: "Rigenerare? Abbinamenti attuali persi"
- [ ] Delete + re-generate

#### 7.6 Attiva Estrazione
- [ ] Button "Attiva Estrazione"
- [ ] Confirmation modal
- [ ] Update settings SET draw_enabled = true, extraction_available_date = NOW()
- [ ] Redirect a tab Live Control

**Deliverable:** Algoritmo generazione funzionante e testato

---

### **FASE 8: Extraction Live - User Side** 🎭 MEDIA PRIORITÀ
**Esperienza live per utenti**

#### 8.1 Extraction Page - States
- [ ] Implementare stati UI:
  - **Waiting:** "L'estrazione inizierà a breve" (draw_enabled = true, draw_started = false)
  - **In Progress - Not Your Turn:** "In attesa di [Nome]..."
  - **In Progress - Your Turn:** "È IL TUO TURNO!" + Button "Scopri"
  - **Completed:** Lista completa abbinamenti

#### 8.2 Extraction Page - Current Turn Logic
- [ ] Fetch settings.current_turn
- [ ] Fetch extraction WHERE order_position = current_turn
- [ ] Compare con current_user.id
- [ ] Show/hide "Scopri" button accordingly

#### 8.3 Reveal API
- [ ] Create reveal endpoint/function
- [ ] Verificare è il turno dell'utente (order_position = current_turn)
- [ ] Fetch extraction WHERE user_id = current_user AND revealed_at IS NULL
- [ ] Update extraction SET revealed_at = NOW() WHERE id = ...
- [ ] Increment settings.current_turn = current_turn + 1
- [ ] Return receiver details

#### 8.4 Reveal Animation
- [ ] Modal fullscreen con blur background
- [ ] Card flip 3D animation (front: "?", back: "Regalerai a [Nome]!")
- [ ] Confetti explosion (canvas-confetti)
- [ ] Auto-close dopo 3s

#### 8.5 Realtime Subscription
- [ ] Subscribe a extraction table:
  ```javascript
  supabase.channel('extraction-live')
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'extraction', filter: 'revealed_at=neq.null' },
      (payload) => { addRevealedCard(payload.new) }
    )
    .subscribe()
  ```
- [ ] Subscribe a settings.current_turn
- [ ] Auto-update UI quando nuova card rivelata

#### 8.6 Revealed Assignments List
- [ ] Lista cards con abbinamenti rivelati
- [ ] Format: "🎁 [Giver] → [Receiver]"
- [ ] Animazione slide-in per nuove card
- [ ] Auto-scroll to bottom
- [ ] Glow effect su nuova card

**Deliverable:** Estrazione live funzionante con realtime

---

### **FASE 9: Admin Panel - Live Control** 🎮 MEDIA PRIORITÀ
**Controllo admin durante estrazione**

#### 9.1 Tab Live Control - Status Display
- [ ] Status badge: Not Started / In Progress / Completed
- [ ] Current turn indicator: "Turno X/Y"
- [ ] Nome utente corrente: "In attesa di [Nome]"
- [ ] Progress bar visuale

#### 9.2 Control Buttons
- [ ] **"Avvia Estrazione"** (se draw_started = false):
  - Update settings SET draw_started = true, current_turn = 1, extraction_started_at = NOW()
- [ ] **"Prossimo Turno Forzato"** (emergency):
  - Modal confirmation
  - Reveal abbinamento corrente + increment turn
- [ ] **"Pausa"** / **"Riprendi"**:
  - Flag in settings o session state
  - Blocca/sblocca incremento turno

#### 9.3 Revealed Assignments Table
- [ ] Tabella columns: Ord, Giver, Receiver, Status
- [ ] Realtime updates (same subscription as user page)
- [ ] Status icons: ✅ (revealed) / ⏳ (current) / 🔒 (sealed)
- [ ] Sealed: mostra "..." invece di nome receiver

#### 9.4 Completion Detection
- [ ] Check se current_turn > total_participants
- [ ] Auto-update settings.extraction_completed_at = NOW()
- [ ] UI success message

**Deliverable:** Admin controllo live completo

---

### **FASE 10: Gift Received & Shipping** 📦 BASSA PRIORITÀ
**Post-estrazione**

#### 10.1 Gift Received Page - Data Fetching
- [ ] Fetch regalo ricevuto:
  ```sql
  SELECT gifts.*, users.full_name as giver_name, users.city as giver_city
  FROM extraction
  JOIN gifts ON gifts.user_id = extraction.user_id
  JOIN users ON users.id = extraction.user_id
  WHERE extraction.receiver_id = current_user.id
  AND extraction.revealed_at IS NOT NULL
  ```

#### 10.2 Gift Display
- [ ] Mostrare dettagli regalo:
  - Tipo (badge Digital/Physical)
  - Titolo
  - Messaggio
  - Se digital: URL (link) + File download button
  - Se physical: Photo gallery
- [ ] Mittente info (nome, città)

#### 10.3 Shipping Address Form
- [ ] Show form se:
  - Regalo fisico AND
  - giver.city != receiver.city AND
  - NOT is_shipping_address_complete
- [ ] Form fields:
  - Via, Città, CAP, Provincia, Note
- [ ] Save in users table:
  ```sql
  UPDATE users SET
    shipping_address_street = ...,
    shipping_address_city = ...,
    shipping_address_zip = ...,
    shipping_address_province = ...,
    shipping_address_notes = ...,
    is_shipping_address_complete = true
  WHERE id = current_user.id
  ```

#### 10.4 Giver View Address
- [ ] Nella dashboard giver, card "A chi devi fare il regalo"
- [ ] Mostra destinatario
- [ ] Se regalo fisico + città diversa:
  - Mostra indirizzo destinatario (dopo che l'ha inserito)
  - "In attesa di indirizzo..." se non ancora inserito

**Deliverable:** Gestione regali ricevuti e indirizzi

---

### **FASE 11: Feedback System** ⭐ BASSA PRIORITÀ
**Survey post-evento**

#### 11.1 Feedback Page
- [ ] Check accessibilità: settings.extraction_completed_at IS NOT NULL
- [ ] Check se già fatto survey (SELECT FROM feedback WHERE user_id = ...)
- [ ] Se già fatto: mostra "Grazie per il feedback!"

#### 11.2 Survey Form
- [ ] Rating component (1-5 stelle, interactive)
- [ ] Textarea commento (optional)
- [ ] Validazione: rating required
- [ ] Submit:
  ```sql
  INSERT INTO feedback (user_id, rating, comment)
  VALUES (current_user.id, rating_value, comment_text)
  ```

#### 11.3 Success State
- [ ] Checkmark animation
- [ ] Message: "Grazie per il feedback!"
- [ ] Auto-redirect a /dashboard dopo 3s

#### 11.4 Admin View Feedback (Optional)
- [ ] Tab in admin panel
- [ ] Lista feedback con rating e commenti
- [ ] Stats: rating medio, count feedback

**Deliverable:** Sistema feedback completo

---

### **FASE 12: Security & RLS Policies** 🔒 CRITICO
**Fondamentale per produzione**

#### 12.1 Enable RLS on All Tables
- [ ] `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`
- [ ] `ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;`
- [ ] `ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;`
- [ ] `ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;`
- [ ] `ALTER TABLE extraction ENABLE ROW LEVEL SECURITY;`
- [ ] `ALTER TABLE settings ENABLE ROW LEVEL SECURITY;`
- [ ] `ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;`

#### 12.2 Users Table Policies
- [ ] Users can read own data
- [ ] Users can update own data (except role)
- [ ] Admins can read all users
- [ ] Admins can update all users

#### 12.3 Gifts Table Policies
- [ ] Users can CRUD own gift
- [ ] Users can read received gift (after reveal)
- [ ] Admins can read all gifts

#### 12.4 Extraction Table Policies
- [ ] Users can read own extraction row
- [ ] Everyone can read revealed extractions
- [ ] receiver_id hidden until revealed (in query, not policy)
- [ ] Only admins can INSERT/DELETE

#### 12.5 Settings Table Policies
- [ ] Everyone can read settings
- [ ] Only admins can update settings

#### 12.6 Quiz Tables Policies
- [ ] Everyone can read quiz_questions (where is_active)
- [ ] Users can INSERT own quiz_answer
- [ ] Users can read own quiz_answer
- [ ] Admins can read all quiz_answers

#### 12.7 Feedback Policies
- [ ] Users can INSERT/read own feedback
- [ ] Admins can read all feedback

#### 12.8 Storage Policies
- [ ] Users can upload to own folder (gifts/{userId}/...)
- [ ] Users can read own files
- [ ] Users can read giver's files (after reveal)
- [ ] Admins can read all files

**Deliverable:** Database completamente protetto

---

### **FASE 13: Deployment Vercel** 🚀 DEPLOY
**Pubblicazione applicazione**

#### 13.1 Preparazione Environment Variables
- [ ] Creare file `.env.production` (template, NON committare)
- [ ] Lista variabili necessarie:
  ```
  VITE_SUPABASE_URL=https://xxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJxxx...
  ```
- [ ] Verificare che Supabase project sia in piano adeguato (non free tier se produzione)

#### 13.2 Build Test Locale
- [ ] Eseguire `npm run build`
- [ ] Verificare build success senza errori
- [ ] Testare build con `npm run preview`
- [ ] Verificare funzionalità in preview mode
- [ ] Fix eventuali warning/errori di build

#### 13.3 Vercel Project Setup
- [ ] Login su Vercel (vercel.com)
- [ ] Click "New Project"
- [ ] Import repository GitHub
- [ ] Selezionare `thesigners-secret-santa` repository

#### 13.4 Vercel Configuration
- [ ] Framework Preset: **Vite** (auto-detect)
- [ ] Build Command: `npm run build` (default)
- [ ] Output Directory: `dist` (default)
- [ ] Install Command: `npm install` (default)
- [ ] Root Directory: `./` (default)

#### 13.5 Environment Variables in Vercel
- [ ] Nella sezione "Environment Variables":
  - [ ] Aggiungere `VITE_SUPABASE_URL`
    - Value: URL del progetto Supabase
    - Environment: Production, Preview, Development (tutti)
  - [ ] Aggiungere `VITE_SUPABASE_ANON_KEY`
    - Value: Anon key da Supabase
    - Environment: Production, Preview, Development (tutti)
- [ ] Salvare configuration

#### 13.6 First Deploy
- [ ] Click "Deploy"
- [ ] Attendere build (2-3 minuti)
- [ ] Verificare deploy success
- [ ] Ottenere URL: `https://secret-santa-xxx.vercel.app`

#### 13.7 Supabase Configuration for Production
- [ ] Andare su Supabase Dashboard → Authentication → URL Configuration
- [ ] Aggiungere Vercel URL ai "Site URL":
  - `https://secret-santa-xxx.vercel.app`
- [ ] Aggiungere ai "Redirect URLs":
  - `https://secret-santa-xxx.vercel.app/**`
- [ ] Salvare settings

#### 13.8 Custom Domain (Optional)
- [ ] Se hai dominio (es. `secretsanta.thesigners.it`):
  - [ ] Vercel → Project Settings → Domains
  - [ ] Add Domain: `secretsanta.thesigners.it`
  - [ ] Configurare DNS secondo istruzioni Vercel:
    - Type: CNAME
    - Name: `secretsanta` (o `@` se root)
    - Value: `cname.vercel-dns.com`
  - [ ] Attendere propagazione DNS (5-30 min)
  - [ ] Verificare HTTPS attivo automaticamente

#### 13.9 Auto-Deploy Setup
- [ ] Vercel → Project Settings → Git
- [ ] Verificare integrazione attiva:
  - ✅ Production Branch: `main`
  - ✅ Auto-deploy on push: ON
- [ ] Test: fare un commit e push su main
- [ ] Verificare auto-deploy trigger
- [ ] Controllare deploy success

#### 13.10 Preview Deployments (Optional)
- [ ] Abilitare preview deployments per branch feature:
  - Ogni branch pushed → automatic preview URL
  - Utile per testing features
- [ ] Preview URL format: `https://secret-santa-git-[branch]-xxx.vercel.app`

#### 13.11 Production Testing
- [ ] Aprire URL production
- [ ] Test completo flow:
  - [ ] Homepage carica correttamente
  - [ ] Login funziona
  - [ ] Dashboard fetch dati da Supabase
  - [ ] Upload regalo funziona
  - [ ] Realtime extraction funziona
- [ ] Test su mobile (responsive)
- [ ] Test su browser diversi (Chrome, Safari, Firefox)

#### 13.12 Monitoring & Analytics
- [ ] Abilitare Vercel Analytics (optional):
  - Project Settings → Analytics → Enable
- [ ] Abilitare Vercel Speed Insights (optional)
- [ ] Setup error tracking (Sentry, optional)

#### 13.13 Post-Deploy Checklist
- [ ] Verificare environment variables corrette
- [ ] Verificare Supabase RLS policies attive
- [ ] Verificare nessun dato sensibile in logs
- [ ] Testare con utenti test
- [ ] Condividere URL con stakeholders

**Deliverable:** Applicazione live su Vercel con auto-deploy

---

### **FASE 14: Testing & Polish** ✨ FINALE
**Verifica e rifinitura**

#### 14.1 End-to-End Testing Flow
- [ ] Test completo flusso utente:
  1. Primo accesso → Setup password
  2. Login
  3. Completa quiz
  4. Carica regalo
  5. Vedi dashboard aggiornata
  6. Aspetta estrazione
  7. Partecipa a estrazione
  8. Vedi regalo ricevuto
  9. Inserisci indirizzo (se necessario)
  10. Completa feedback

#### 14.2 Test Admin Flow
- [ ] Login come admin
- [ ] Configura date
- [ ] Vedi participants
- [ ] Genera estrazione
- [ ] Attiva estrazione
- [ ] Avvia estrazione live
- [ ] Monitora progressi
- [ ] Verifica completion

#### 14.3 Error Handling
- [ ] Error boundaries in componenti critici
- [ ] Toast notifications per errori
- [ ] Retry logic per network failures
- [ ] Fallback UI per loading states
- [ ] Validation messages chiare

#### 14.4 UX Polish
- [ ] Loading skeletons dove appropriato
- [ ] Smooth transitions tra stati
- [ ] Confetti animations
- [ ] Celebrative feedback
- [ ] Mobile responsive check tutte le pagine

#### 14.5 Performance
- [ ] Lazy loading pages (React.lazy + Suspense)
- [ ] Debounce search inputs
- [ ] Pagination se > 50 utenti
- [ ] Optimize images
- [ ] Minimize re-renders

#### 14.6 Data Cleanup Scripts
- [ ] Script per reset estrazione (dev only)
- [ ] Script per cleanup test data
- [ ] Script per pre-load utenti production

**Deliverable:** Applicazione testata e rifinita

---

## 🚨 Priorità Assolute per Demo Funzionante

Se il tempo è limitato, implementare IN ORDINE:

1. **FASE 1** - Setup Database + Routing (30 min)
2. **FASE 2** - Autenticazione (1h)
3. **FASE 3** - Dashboard (1h)
4. **FASE 4** - Quiz (30 min)
5. **FASE 5** - Gift Upload (1h)
6. **FASE 7** - Generation Algorithm (1h)
7. **FASE 8** - Extraction Live Basic (1.5h)
8. **FASE 12** - RLS Policies Base (30 min)

**Totale Core Features: ~7 ore**

Le fasi 6, 9, 10, 11, 14 possono essere semplificate o skippate per MVP.

---

## 🔄 Git Workflow Durante Sviluppo

### Strategia Consigliata
```bash
# All'inizio di ogni fase
git checkout -b feature/fase-X-nome
# Lavoro...
git add .
git commit -m "feat: descrizione chiara"
git push origin feature/fase-X-nome

# Quando fase completata
git checkout main
git merge feature/fase-X-nome
git push origin main
# → Trigger auto-deploy Vercel
```

### Commit Message Convention
- `feat: nuova feature` - Nuove funzionalità
- `fix: correzione bug` - Bug fix
- `refactor: refactoring` - Refactoring codice
- `style: styling` - Modifiche UI/CSS
- `chore: maintenance` - Manutenzione, dipendenze
- `docs: documentazione` - Documentazione

### Branch Strategy
- `main` - Branch produzione (protetto, auto-deploy)
- `development` - Branch sviluppo (optional)
- `feature/*` - Branch feature temporanei
- `hotfix/*` - Fix urgenti

### Deployment Flow
1. **Local Development** → Test locale
2. **Git Push** → GitHub repository
3. **Vercel Auto-Deploy** → Build & Deploy automatico
4. **Production** → Live su Vercel URL

---

## 🌐 Vercel Configuration Files

### vercel.json (Optional)
Se serve configurazione custom, creare `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Environment Variables Structure
```env
# Production (.env.production - NON committare)
VITE_SUPABASE_URL=https://iqsghoezjqoqsnggtkgx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Development (.env.local - già presente)
VITE_SUPABASE_URL=https://iqsghoezjqoqsnggtkgx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**IMPORTANTE:**
- `.env.local` è già in `.gitignore` ✅
- Mai committare chiavi API
- Usare Vercel dashboard per variabili production

---

## 📝 Note Implementazione

### Gestione Stato
- Usare Context API per Auth
- Usare SWR o React Query per data fetching (opzionale, o plain useEffect)
- Realtime con Supabase channels

### File Upload
```typescript
// Upload pattern
const uploadFile = async (file: File, userId: string) => {
  const filePath = `${userId}/${file.name}-${Date.now()}`
  const { data, error } = await supabase.storage
    .from('gifts')
    .upload(filePath, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('gifts')
    .getPublicUrl(filePath)

  return publicUrl
}
```

### Realtime Pattern
```typescript
useEffect(() => {
  const channel = supabase
    .channel('extraction-live')
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'extraction' },
      (payload) => handleUpdate(payload)
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [])
```

### Sealed Receiver Pattern
```typescript
// Query che nasconde receiver_id finché non revealed
const { data } = await supabase
  .from('extraction')
  .select(`
    id,
    user_id,
    receiver_id,
    order_position,
    revealed_at
  `)
  .eq('user_id', userId)
  .single()

// Usa receiver_id solo se revealed_at !== null
const receiverId = data.revealed_at ? data.receiver_id : null
```

---

## ✅ Checklist Finale Pre-Consegna

### Funzionalità
- [ ] Tutti gli utenti test possono fare login
- [ ] Dashboard mostra dati corretti da DB
- [ ] Quiz funziona e salva timestamp
- [ ] Upload regalo funziona (sia digital che physical)
- [ ] Admin può generare estrazione
- [ ] Estrazione live funziona con realtime
- [ ] Regalo ricevuto è visibile dopo estrazione
- [ ] RLS policies attive e testate
- [ ] Nessun error nella console
- [ ] Applicazione responsive su mobile

### Deployment
- [ ] Codice su GitHub (repository aggiornato)
- [ ] Vercel project configurato
- [ ] Environment variables in Vercel
- [ ] Build production funziona (`npm run build`)
- [ ] Applicazione live su Vercel URL
- [ ] Supabase URL configuration aggiornata
- [ ] Auto-deploy attivo (push → deploy)
- [ ] Custom domain configurato (se applicabile)
- [ ] HTTPS funzionante
- [ ] Test su production URL completo

---

## 🎯 Success Criteria

**Il progetto è completo quando:**
1. ✅ Un utente può fare login
2. ✅ Un utente può completare il quiz
3. ✅ Un utente può caricare un regalo
4. ✅ Admin può generare e avviare l'estrazione
5. ✅ L'estrazione live funziona in realtime per tutti
6. ✅ Gli utenti vedono il regalo ricevuto dopo la reveal
7. ✅ Tutte le logiche definite in PROJECT_REQUIREMENTS.md sono implementate
8. ✅ Nessun dato sensibile esposto (RLS attivo)

---

**Ultima modifica:** 9 Dicembre 2024
**Prossimo step:** Approvazione roadmap → Inizio implementazione FASE 1
