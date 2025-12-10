import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Gift, X, Layout, Monitor, Settings } from 'lucide-react';
import UserDashboard from './components/UserDashboard';
import AdminDashboard, { QuizConfig, Participant } from './components/AdminDashboard';
import Snow from './components/Snow';

// --- DATA CONFIGURATION ---

const PARTICIPANTS_NAMES = [
  "Alessandro", "Bea", "Carlo", "Diana", "Edoardo", 
  "Francesca", "Giorgio", "Ilaria", "Luca", "Martina",
  "Nicola", "Olivia", "Paolo", "Quinta", "Riccardo",
  "Sara", "Tommaso", "Umberto", "Valentina", "Zeno"
];

// Mock Initial Participants Data for Admin View
const INITIAL_PARTICIPANTS_DATA: Participant[] = PARTICIPANTS_NAMES.map((name, idx) => ({
  id: `p-${idx}`,
  name: name,
  surname: "", // Mock surname not strictly needed for this demo
  hasGift: Math.random() > 0.2, // 80% have gifts
  quizStatus: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'CORRECT' : 'WRONG') : 'PENDING',
  quizTime: Math.random() * 30 + 5 // Random time between 5 and 35s
}));

const GIFT_DATA = [
  { id: 1, label: "Stella", content: "Buono Amazon 20€", color: "bg-red-600" },
  { id: 2, label: "Fiocco", content: "Tazza Personalizzata", color: "bg-emerald-600" },
  { id: 3, label: "Slitta", content: "Netflix 1 Mese", color: "bg-blue-600" },
  { id: 4, label: "Camino", content: "Set Candele", color: "bg-amber-500" },
  { id: 5, label: "Renne", content: "Cioccolatini Gourmet", color: "bg-purple-600" },
  { id: 6, label: "Elfo", content: "Calzini Buffi", color: "bg-red-700" },
  { id: 7, label: "Zenzero", content: "Borraccia Termica", color: "bg-teal-600" },
  { id: 8, label: "Neve", content: "Cuffie Bluetooth", color: "bg-indigo-600" },
  { id: 9, label: "Calza", content: "Agenda 2025", color: "bg-rose-500" },
  { id: 10, label: "Luci", content: "Powerbank", color: "bg-yellow-500" },
  { id: 11, label: "Abete", content: "Gioco da Tavolo", color: "bg-green-700" },
  { id: 12, label: "Candela", content: "Vino Pregiato", color: "bg-red-500" },
  { id: 13, label: "Angelo", content: "Abbonamento Spotify", color: "bg-sky-500" },
  { id: 14, label: "Campana", content: "Smart Tag", color: "bg-orange-500" },
  { id: 15, label: "Biscotto", content: "Kit Aperitivo", color: "bg-amber-600" },
  { id: 16, label: "Torrone", content: "Cassa Bluetooth", color: "bg-pink-600" },
  { id: 17, label: "Pandoro", content: "Set Tisane", color: "bg-lime-600" },
  { id: 18, label: "Vischio", content: "Echo Dot", color: "bg-cyan-600" },
  { id: 19, label: "Agrifoglio", content: "Polaroid", color: "bg-emerald-700" },
  { id: 20, label: "Inverno", content: "Mystery Box", color: "bg-violet-600" },
];

const INITIAL_QUIZ_CONFIG: QuizConfig = {
  question: "Quante renne trainano la slitta di Babbo Natale (inclusa Rudolph)?",
  answers: ["7", "8", "9", "10", "12"],
  correctIndex: 2, // 9
  timeLimit: 15
};

// --- COMPONENTS ---

// 3D CSS Box Component
const GiftBox = ({ gift, onClick, isOpen, className = "" }: { gift: any, onClick?: () => void, isOpen?: boolean, className?: string }) => {
  return (
    <motion.div
      layoutId={`gift-container-${gift.id}`}
      className={`relative group ${isOpen ? '' : 'cursor-pointer'} perspective-1000 ${className}`}
      onClick={onClick}
      whileHover={!isOpen ? { scale: 1.05, rotate: 2 } : {}}
      whileTap={!isOpen ? { scale: 0.95 } : {}}
    >
      {/* Box Body */}
      <motion.div
        layoutId={`gift-body-${gift.id}`}
        className={`relative w-full aspect-square rounded-xl shadow-2xl flex items-center justify-center overflow-hidden ${gift.color} border-b-8 border-black/20`}
      >
        {/* Ribbon Vertical */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1/5 bg-yellow-400/90 shadow-sm" />
        {/* Ribbon Horizontal */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1/5 bg-yellow-400/90 shadow-sm" />
        
        {/* Label (Word) */}
        <motion.span 
          layoutId={`gift-label-${gift.id}`}
          className="relative z-10 text-white font-semibold font-[Spectral] text-lg md:text-xl drop-shadow-md uppercase tracking-wider bg-black/30 px-3 py-1 rounded backdrop-blur-sm"
        >
          {gift.label}
        </motion.span>
      </motion.div>

      {/* Box Lid */}
      <motion.div
        layoutId={`gift-lid-${gift.id}`}
        className={`absolute -top-2 left-0 right-0 h-1/4 rounded-lg shadow-xl z-20 ${gift.color} brightness-110 flex items-center justify-center`}
        animate={isOpen ? { y: -200, opacity: 0, rotate: -20 } : { y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: "backIn" }}
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1/5 bg-yellow-400" />
        {/* Bow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 -mt-6 text-yellow-300 drop-shadow-lg">
           <Gift size={64} strokeWidth={1} fill="#fde047" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [view, setView] = useState<'EXTRACTION' | 'DASHBOARD' | 'ADMIN_DASHBOARD'>('DASHBOARD');
  
  // GLOBAL STATE
  const [isExtractionStarted, setExtractionStarted] = useState(false);
  const [targetDate, setTargetDate] = useState<string | null>(null);
  
  const [gifts, setGifts] = useState(GIFT_DATA);
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS_DATA);
  const [quizConfig, setQuizConfig] = useState<QuizConfig>(INITIAL_QUIZ_CONFIG);
  
  // Extraction State
  const [selectedGiftId, setSelectedGiftId] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Computed: Next participant to pick a gift
  // Filter out those who have already 'extracted' a gift (marked as extracted)
  const availableParticipants = participants.filter(p => !p.extracted);
  const currentParticipant = availableParticipants.length > 0 ? availableParticipants[0].name : null;
  const selectedGift = gifts.find(g => g.id === selectedGiftId);

  // Handle clicking a gift in the grid
  const handleGiftClick = (id: number) => {
    if (!isExtractionStarted) {
        alert("L'estrazione non è ancora iniziata! L'admin deve sbloccarla.");
        return;
    }
    if (selectedGiftId) return; // Already opening one
    if (!currentParticipant) return;

    setSelectedGiftId(id);
    
    // Auto reveal sequence
    setTimeout(() => {
      setIsRevealed(true);
    }, 800);
  };

  // Close modal and mark gift/participant as processed
  const handleNext = () => {
    setIsRevealed(false);
    setSelectedGiftId(null);
    
    // Remove the opened gift from the list and mark participant as extracted
    setTimeout(() => {
      setGifts(prev => prev.filter(g => g.id !== selectedGiftId));
      
      setParticipants(prev => {
        const next = [...prev];
        // Find the first non-extracted participant and mark them
        const currentIdx = next.findIndex(p => !p.extracted);
        if (currentIdx !== -1) {
            next[currentIdx] = { ...next[currentIdx], extracted: true };
        }
        return next;
      });

    }, 300); // Wait for exit animation
  };

  // Mock Quiz Submit Handler (Updates the first participant for demo purposes)
  const handleQuizSubmit = (correct: boolean, timeTaken: number) => {
      setParticipants(prev => {
          const next = [...prev];
          // Update the first participant ("Alessandro") just to show it works in Admin Panel
          // Or find "myself" if we had a logged in user concept.
          if (next[0]) {
              next[0] = {
                  ...next[0],
                  quizStatus: correct ? 'CORRECT' : 'WRONG',
                  quizTime: timeTaken
              };
          }
          return next;
      });
  };

  // --- RENDER VIEWS ---

  if (view === 'ADMIN_DASHBOARD') {
      return (
          <>
            <AdminDashboard 
                targetDate={targetDate}
                setTargetDate={setTargetDate}
                isExtractionStarted={isExtractionStarted}
                setExtractionStarted={setExtractionStarted}
                quizConfig={quizConfig}
                setQuizConfig={setQuizConfig}
                participants={participants}
            />
            {/* Dev Nav */}
            <div className="fixed top-4 right-4 z-[60] flex gap-2">
                <button 
                  onClick={() => setView('EXTRACTION')}
                  className="bg-black/80 hover:bg-black text-white p-2 rounded-lg text-xs backdrop-blur border border-white/20 flex items-center gap-2"
                >
                   <Monitor size={14} /> Live View
                </button>
                <button 
                  onClick={() => setView('DASHBOARD')}
                  className="bg-black/80 hover:bg-black text-white p-2 rounded-lg text-xs backdrop-blur border border-white/20 flex items-center gap-2"
                >
                   <Layout size={14} /> User App
                </button>
            </div>
          </>
      );
  }

  if (view === 'DASHBOARD') {
    return (
      <>
         <UserDashboard 
            onEnterLive={() => setView('EXTRACTION')} 
            targetDate={targetDate}
            quizConfig={quizConfig}
            onQuizSubmit={handleQuizSubmit}
            isExtractionStarted={isExtractionStarted}
         />
         {/* View Switcher Button (Dev Only) */}
         <div className="fixed top-4 right-4 z-[60] flex gap-2">
            <button 
              onClick={() => setView('ADMIN_DASHBOARD')}
              className="bg-black/80 hover:bg-black text-white p-2 rounded-lg text-xs backdrop-blur border border-white/20 flex items-center gap-2"
            >
               <Settings size={14} /> Admin
            </button>
         </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 font-sans overflow-x-hidden selection:bg-red-500 selection:text-white relative">
      <Snow />
      
      {/* View Switcher Button (Dev Only) */}
      <div className="fixed top-4 right-4 z-[60] flex gap-2">
        <button 
          onClick={() => setView('DASHBOARD')}
          className="bg-black/80 hover:bg-black text-white p-2 rounded-lg text-xs backdrop-blur border border-white/20 flex items-center gap-2"
        >
            <Layout size={14} /> User View
        </button>
        <button 
          onClick={() => setView('ADMIN_DASHBOARD')}
          className="bg-black/80 hover:bg-black text-white p-2 rounded-lg text-xs backdrop-blur border border-white/20 flex items-center gap-2"
        >
            <Settings size={14} /> Admin
        </button>
      </div>

      {/* Header */}
      <header className="relative z-10 py-8 px-4 text-center">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-block"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-200 to-red-400 drop-shadow-sm mb-2 font-[Spectral]">
            SECRET SANTA
          </h1>
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50" />
        </motion.div>

        <AnimatePresence mode="wait">
          {currentParticipant ? (
            <motion.div
              key={currentParticipant}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mt-6 flex flex-col items-center gap-2"
            >
              <span className="text-sm uppercase tracking-widest text-slate-400">Tocca a</span>
              <div className="bg-white/10 backdrop-blur-md px-8 py-3 rounded-full border border-white/20 shadow-lg">
                <span className="text-2xl md:text-3xl font-bold text-yellow-300">
                  {currentParticipant}
                </span>
              </div>
              {!isExtractionStarted && (
                  <div className="mt-2 text-xs text-red-400 font-bold bg-red-900/30 px-3 py-1 rounded border border-red-500/20">
                      🔒 IN ATTESA DI SBLOCCO
                  </div>
              )}
            </motion.div>
          ) : (
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6"
            >
              <span className="text-2xl text-red-300 font-bold">Estrazione Completata! 🎄</span>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        <motion.div 
          layout
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8 ${!isExtractionStarted ? 'opacity-50 grayscale' : ''} transition-all duration-500`}
        >
          <AnimatePresence>
            {gifts.map((gift) => (
              <motion.div
                key={gift.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
              >
                {/* Only render if not the currently selected one (to prevent duplication during layoutId transition) */}
                {selectedGiftId !== gift.id && (
                  <GiftBox 
                    gift={gift} 
                    onClick={() => handleGiftClick(gift.id)}
                    className="w-full"
                  />
                )}
                {/* Placeholder to keep grid space while animating out */}
                {selectedGiftId === gift.id && <div className="w-full aspect-square bg-transparent" />}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Reveal Overlay / Modal */}
      <AnimatePresence>
        {selectedGiftId && selectedGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-lg flex flex-col items-center">
              
              {/* The "Hero" Gift */}
              <div className="relative w-64 h-64 md:w-96 md:h-96 mb-8">
                 <GiftBox 
                    gift={selectedGift} 
                    isOpen={isRevealed}
                    className="w-full h-full text-2xl" 
                 />
              </div>

              {/* Reveal Content */}
              {isRevealed && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                  className="bg-white text-slate-900 p-8 rounded-2xl shadow-2xl text-center w-full max-w-md border-4 border-yellow-400"
                >
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ delay: 0.4 }}
                    className="mb-4 inline-block text-yellow-500"
                  >
                    <Sparkles size={48} />
                  </motion.div>
                  
                  <h2 className="text-lg uppercase text-slate-500 font-bold mb-2">Hai trovato</h2>
                  <div className="text-3xl md:text-5xl font-black text-red-600 mb-8 leading-tight">
                    {selectedGift.content}
                  </div>

                  <button 
                    onClick={handleNext}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 group"
                  >
                    Prossimo
                    <motion.span 
                      animate={{ x: [0, 5, 0] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      →
                    </motion.span>
                  </button>
                </motion.div>
              )}
            </div>

            {/* Confetti Effect (CSS only for simplicity) */}
            {isRevealed && (
               <div className="fixed inset-0 pointer-events-none overflow-hidden">
                 {[...Array(20)].map((_, i) => (
                   <motion.div
                     key={`confetti-${i}`}
                     className={`absolute w-3 h-3 rounded-sm ${['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500'][i % 4]}`}
                     initial={{ 
                       x: "50vw", 
                       y: "50vh", 
                       scale: 0 
                      }}
                     animate={{ 
                       x: `calc(50vw + ${(Math.random() - 0.5) * 100}vw)`, 
                       y: `calc(50vh + ${(Math.random() - 0.5) * 100}vh)`,
                       rotate: Math.random() * 360,
                       scale: 1,
                       opacity: [1, 1, 0]
                     }}
                     transition={{ duration: 2, ease: "easeOut" }}
                   />
                 ))}
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Footer Info */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-slate-500 text-sm z-0 pointer-events-none">
        Pacchi rimanenti: {gifts.length}
      </div>
    </div>
  );
}
