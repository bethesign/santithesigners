# Secret Santa 2024 - Thesigners

Applicazione web per gestire lo scambio di regali "Secret Santa" tra colleghi.

## 🎄 Caratteristiche

- **Homepage animata** con design natalizio
- **Background gradient radiale** verde natalizio
- **Ticker scrollanti** con frasi alternate in 3 direzioni
- **Albero di Natale** animato che dondola
- **Neve che cade** con fiocchi animati
- **CTA button "Santi Thesigners"** con effetti glow e pulse

## 🚀 Setup Progetto

### Prerequisiti

- Node.js >= 18
- npm o yarn o pnpm

### Installazione

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

Il progetto sarà disponibile su `http://localhost:5173`

### Build per Produzione

```bash
# Crea la build ottimizzata
npm run build

# Preview della build
npm run preview
```

## 📁 Struttura del Progetto

```
secretsanta/
├── pages/
│   ├── Homepage.tsx          # Landing page animata
│   ├── Login.tsx            # Autenticazione
│   ├── Dashboard.tsx        # Dashboard utente
│   ├── GiftUpload.tsx       # Caricamento regali
│   ├── Quiz.tsx             # Quiz per ordine estrazione
│   ├── Extraction.tsx       # Estrazione live
│   ├── GiftReceived.tsx     # Regalo ricevuto
│   ├── Feedback.tsx         # Survey finale
│   └── Admin.tsx            # Pannello amministrazione
├── components/              # Componenti riutilizzabili
├── styles/
│   └── globals.css          # Stili globali e animazioni
├── App.tsx                  # Router principale
└── main.tsx                 # Entry point

```

## 🎨 Design System

### Palette Colori

- **Verde Primario**: `#4a9960`
- **Verde Chiaro**: `#a8e6b5`
- **Verde Scuro**: `#2d5f3d`
- **Rosso Secondario**: `#ff6b6b`
- **Oro**: `#ffd700`

### Animazioni

- **Ticker Scroll**: Testo che scorre orizzontalmente (30s loop)
- **Tree Swing**: Albero che dondola (+/- 3 gradi, 3s loop)
- **Snowfall**: Fiocchi di neve che cadono (8-12s random)
- **Button Pulse**: Effetto glow pulsante (2s loop)
- **Tree Lights**: Lucine che lampeggiano (2s loop)

## 🛠 Tecnologie

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool veloce
- **Tailwind CSS** - Utility-first CSS
- **CSS Animations** - Animazioni native performanti

## 📝 TODO

- [ ] Configurare Supabase per database e autenticazione
- [ ] Implementare sistema di routing con React Router
- [ ] Integrare Framer Motion per animazioni avanzate
- [ ] Aggiungere shadcn/ui components
- [ ] Setup deployment su Vercel

## 🎁 Funzionalità Future

Vedi `PROJECT_REQUIREMENTS.md` per le specifiche complete del progetto.

## 📄 License

Proprietario - Thesigners © 2024
