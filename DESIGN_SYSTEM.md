# Design System - Santi Thesigners 2024

## Palette Colori

### Colori Primari
- **Verde**: `#226f54` (primary)
- **Verde Scuro**: `#1a5640` (hover)
- **Rosso**: `#da2c38` (secondary/accents)
- **Marrone**: `#43291f` (text primary)

### Colori Testo
- **Testo Primario**: `text-gray-800` o `#43291f`
- **Testo Secondario**: `text-gray-500` o `text-gray-600`
- **Titoli Card**: `text-[#da2c38]` (rosso)

## Componenti Standardizzati

### Card Base
```tsx
<Card className="border-border/50 shadow-xl bg-white">
  <CardHeader>
    <CardTitle className="text-2xl font-bold text-center text-[#da2c38]">
      Titolo Card
    </CardTitle>
    <p className="text-center text-gray-800">
      Descrizione
    </p>
  </CardHeader>
  <CardContent>
    {/* Contenuto */}
  </CardContent>
</Card>
```

### DashboardCard (Componente Riutilizzabile)
```tsx
import { DashboardCard } from '../components/dashboard/DashboardCard';
import { Gift } from 'lucide-react';

<DashboardCard
  title="Titolo Card"
  icon={Gift}
  status="pending" // 'pending' | 'completed' | 'locked' | 'active'
  actionLabel="Vai"
  onClick={() => navigate('/path')}
>
  <p>Contenuto della card</p>
</DashboardCard>
```

**Caratteristiche DashboardCard:**
- Background bianco (`bg-white`)
- Titolo rosso (`text-[#da2c38]`)
- Testo nero (`text-gray-800`)
- Button verde (`bg-[#226f54]`)
- Border colorato a sinistra in base allo status
- Icona con background colorato
- Animazioni hover

### Button (Primary - Verde)
```tsx
<Button className="bg-[#226f54] text-white hover:bg-[#1a5640]">
  Testo Button
</Button>
```

### Input con Password Toggle
```tsx
const [showPassword, setShowPassword] = useState(false);

<div className="relative">
  <Input
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="pr-10"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
  >
    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>
```

## Font
- **Titoli**: `font-display` (Spectral, weight 800)
- **Testo**: `font-sans` (Inter)

## Note
- Tutti i titoli delle card devono essere rossi (`text-[#da2c38]`)
- I testi devono essere neri/grigio scuro (`text-gray-800`)
- I button principali devono essere verdi (`bg-[#226f54]`)
- Background delle card sempre bianco (`bg-white`)
