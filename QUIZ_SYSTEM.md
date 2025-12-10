# 📝 Sistema Quiz Migliorato

## Concept

Quiz con domande a scelta multipla (5 opzioni) dove conta:
1. **Prima** la correttezza della risposta
2. **Poi** il tempo impiegato (a parità di correttezza)

## Flusso Utente

### 1. Stato Iniziale
- Titolo: "Quiz di Posizionamento"
- Spiegazione: correttezza > tempo
- Button: "Inizia Quiz"

### 2. Quiz Iniziato
- **Timer parte** quando premi "Inizia"
- Mostra la domanda
- 5 opzioni cliccabili (A, B, C, D, E)
- Timer visibile in tempo reale (MM:SS)

### 3. Submit
- Salva:
  - Risposta data
  - Tempo impiegato (in secondi)
  - Se corretta (`is_correct`)
- Calcola posizione provvisoria

### 4. Classifica
**Logica ordinamento:**
```sql
ORDER BY
  CASE WHEN is_correct THEN 0 ELSE 1 END ASC,  -- corrette prima
  time_elapsed ASC                               -- poi per tempo
```

**Esempi:**
- Alice: corretta in 30s → Posizione 1
- Bob: corretta in 45s → Posizione 2
- Carlo: errata in 20s → Posizione 3 (anche se più veloce, ha sbagliato)
- Diana: errata in 25s → Posizione 4

## Database Schema

### Tabella `quiz_questions`
```sql
- id (UUID)
- question_text (TEXT) - "Qual è la capitale d'Italia?"
- question_type (TEXT) - 'multiple_choice'
- options (JSONB) - [{value: 'A', text: 'Milano'}, {value: 'B', text: 'Roma'}, ...]
- correct_answer (TEXT) - 'B'
- is_active (BOOLEAN)
```

### Tabella `quiz_answers`
```sql
- id (UUID)
- user_id (UUID FK)
- question_id (UUID FK)
- answer (TEXT) - 'B'
- answered_at (TIMESTAMP)
- time_elapsed (INTEGER) - secondi
- is_correct (BOOLEAN) - true/false
```

## Esempio JSON Options

```json
[
  {"value": "A", "text": "Milano"},
  {"value": "B", "text": "Roma"},
  {"value": "C", "text": "Napoli"},
  {"value": "D", "text": "Torino"},
  {"value": "E", "text": "Firenze"}
]
```

## Admin Panel Features

### Sezione Quiz (da implementare)
1. **Crea/Modifica Domanda**
   - Testo domanda
   - 5 opzioni (A-E)
   - Seleziona risposta corretta
   - Attiva/Disattiva

2. **Classifica Live**
   - Tabella con:
     - Nome utente
     - Risposta data
     - Tempo impiegato
     - ✅/❌ Correttezza
     - Posizione finale
   - Ordinata per: correttezza → tempo

3. **Statistiche**
   - Tot risposte
   - % risposte corrette
   - Tempo medio
   - Grafico distribuzione

## UI Components

### QuizOption Button
```tsx
<button
  onClick={() => setAnswer('A')}
  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
    answer === 'A'
      ? 'border-[#226f54] bg-[#226f54]/10'
      : 'border-gray-200 hover:border-gray-300'
  }`}
>
  <span className="font-bold mr-2">A.</span>
  <span className="text-gray-800">Milano</span>
</button>
```

### Timer Display
```tsx
<div className="flex items-center gap-2 text-2xl font-mono font-bold text-[#da2c38]">
  <Clock className="h-6 w-6 animate-pulse" />
  <span>{formatTime(elapsedTime)}</span>
</div>
```

## Migration SQL

File: `supabase/update-quiz-schema.sql`

Da eseguire per aggiungere:
- `question_type`
- `options` (JSONB)
- `correct_answer`
- `time_elapsed`
- `is_correct`

## TODO

- [x] Schema database aggiornato
- [x] Quiz.tsx con stato "Inizia"
- [x] Timer funzionante
- [x] UI opzioni multiple
- [x] Salvataggio tempo + correttezza
- [x] Classifica corretta
- [x] Admin: form crea/modifica domanda
- [x] Admin: visualizza classifica
- [ ] Admin: statistiche (grafico distribuzione)
- [ ] Testing con dati reali
