import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, ChevronRight, Clock, Gift, Heart, User, CheckCircle2, Monitor, Sparkles, AlertCircle } from 'lucide-react';
import Snow from './Snow';
import { QuizConfig } from './AdminDashboard';

// --- TYPES ---
interface UserDashboardProps {
  onEnterLive?: () => void;
  targetDate: string | null;
  quizConfig: QuizConfig;
  onQuizSubmit: (correct: boolean, timeTaken: number) => void;
  // If targetDate is reached or something, we might auto-switch stages, 
  // but for now relying on user flow or dev controls for stages is okay,
  // except PRE_EVENT -> LIVE transition should be automatic or driven by prop.
  isExtractionStarted?: boolean; // To allow button "Entra nella Live" only when started? No, user can enter but grid is locked.
}

// --- AVATAR DATA ---
const AVATARS = [
  { id: 1, name: "Santa", emoji: "🎅", bg: "bg-red-100" },
  { id: 2, name: "Mrs Claus", emoji: "👵", bg: "bg-red-200" },
  { id: 3, name: "Elfo", emoji: "🧝", bg: "bg-emerald-100" },
  { id: 4, name: "Elfa", emoji: "🧝‍♀️", bg: "bg-emerald-200" },
  { id: 5, name: "Renna", emoji: "🦌", bg: "bg-amber-100" },
  { id: 6, name: "Pupazzo", emoji: "⛄", bg: "bg-sky-100" },
  { id: 7, name: "Biscotto", emoji: "🍪", bg: "bg-orange-100" },
  { id: 8, name: "Orso", emoji: "🐻‍❄️", bg: "bg-blue-50" },
  { id: 9, name: "Pinguino", emoji: "🐧", bg: "bg-slate-200" },
  { id: 10, name: "Grinch", emoji: "🤢", bg: "bg-lime-200" }, // Grinch Classic
  { id: 11, name: "Grinch Sly", emoji: "😏", bg: "bg-green-300" }, // Grinch Sly
  { id: 12, name: "Grinch Santa", emoji: "👺", bg: "bg-green-200" }, // Grinch Disguise
  { id: 13, name: "Yeti", emoji: "🦍", bg: "bg-gray-100" },
  { id: 14, name: "Volpe", emoji: "🦊", bg: "bg-orange-200" },
  { id: 15, name: "Gufo", emoji: "🦉", bg: "bg-amber-50" },
  { id: 16, name: "Gatto Natalizio", emoji: "🐱", bg: "bg-rose-100" },
  { id: 17, name: "Cane Natalizio", emoji: "🐶", bg: "bg-yellow-100" },
  { id: 18, name: "Albero", emoji: "🎄", bg: "bg-green-100" },
  { id: 19, name: "Regalo", emoji: "🎁", bg: "bg-purple-100" },
  { id: 20, name: "Stella", emoji: "⭐", bg: "bg-yellow-200" },
];

// --- CUSTOM COMPONENTS ---

const ReindeerCowboy = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto drop-shadow-xl">
    {/* Head */}
    <path d="M60 80 Q50 150 100 180 Q150 150 140 80 Q100 70 60 80" fill="#8D6E63" />
    
    {/* Ears */}
    <ellipse cx="40" cy="90" rx="15" ry="25" fill="#8D6E63" transform="rotate(-30 40 90)" />
    <ellipse cx="160" cy="90" rx="15" ry="25" fill="#8D6E63" transform="rotate(30 160 90)" />
    
    {/* Antlers */}
    <path d="M50 70 L30 30 M30 30 L10 40 M30 30 L40 10" stroke="#5D4037" strokeWidth="8" strokeLinecap="round" />
    <path d="M150 70 L170 30 M170 30 L190 40 M170 30 L160 10" stroke="#5D4037" strokeWidth="8" strokeLinecap="round" />
    
    {/* Eyes */}
    <circle cx="80" cy="110" r="8" fill="white" />
    <circle cx="80" cy="110" r="3" fill="black" />
    <circle cx="120" cy="110" r="8" fill="white" />
    <circle cx="120" cy="110" r="3" fill="black" />
    
    {/* Blinking Nose */}
    <circle cx="100" cy="140" r="15" fill="#ef4444" className="animate-pulse">
      <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
    </circle>
    
    {/* Cowboy Hat */}
    <path d="M40 70 L160 70 L140 30 L60 30 Z" fill="#D2691E" />
    <rect x="30" y="65" width="140" height="10" rx="5" fill="#D2691E" />
    <rect x="60" y="60" width="80" height="8" fill="#8B4513" /> {/* Hat band */}
  </svg>
);

const CountdownTimer = ({ label, targetDate }: { label: string, targetDate: Date }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-2xl border border-white/10 w-full">
      <h3 className="text-yellow-400 font-bold tracking-widest uppercase text-sm mb-4">{label}</h3>
      <div className="flex gap-4 text-center">
        {['00', '12', '45'].map((num, i) => (
          <div key={i} className="flex flex-col">
             <span className="text-4xl font-mono font-bold bg-white/10 rounded-lg p-3 min-w-[3.5rem] backdrop-blur-sm border border-white/5">
               {num}
             </span>
             <span className="text-xs text-slate-400 mt-2 uppercase">{['ore', 'min', 'sec'][i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

export default function UserDashboard({ onEnterLive, targetDate, quizConfig, onQuizSubmit, isExtractionStarted }: UserDashboardProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  
  // States: 'ENTRY' | 'QUIZ' | 'PRE_EVENT' | 'LIVE' | 'GIFT_ENTRY'
  const [stage, setStage] = useState<'ENTRY' | 'QUIZ' | 'PRE_EVENT' | 'LIVE' | 'GIFT_ENTRY'>('ENTRY');
  
  // Quiz State
  const [quizState, setQuizState] = useState({
    started: false,
    startTime: 0,
    selectedAnswer: null as number | null,
    isSubmitted: false,
    timeLeft: quizConfig.timeLimit
  });

  // Countdown for Quiz
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizState.started && !quizState.isSubmitted && quizState.timeLeft > 0) {
      timer = setInterval(() => {
        setQuizState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (quizState.timeLeft === 0 && !quizState.isSubmitted) {
      // Time over - auto submit as wrong
      handleQuizAnswer(-1); // -1 means no answer selected
    }
    return () => clearInterval(timer);
  }, [quizState.started, quizState.isSubmitted, quizState.timeLeft]);

  const handleStartQuiz = () => {
    setQuizState({
      ...quizState,
      started: true,
      startTime: Date.now(),
      timeLeft: quizConfig.timeLimit
    });
  };

  const handleQuizAnswer = (idx: number) => {
    const timeTaken = (Date.now() - quizState.startTime) / 1000;
    const isCorrect = idx === quizConfig.correctIndex;
    
    setQuizState(prev => ({
      ...prev,
      selectedAnswer: idx,
      isSubmitted: true
    }));

    // Notify Parent (Admin Dashboard)
    onQuizSubmit(isCorrect, timeTaken);
  };
  
  // Gift Form State
  const [giftType, setGiftType] = useState<'physical' | 'digital'>('physical');
  const [giftData, setGiftData] = useState({
    name: '',
    keyword: '',
    link: '',
    message: '',
    image: null as string | null
  });

  const handleGiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, save data here
    setStage('QUIZ');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGiftData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 overflow-x-hidden relative">
      <Snow />
      {/* Ambient Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0" />
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0">
        <h1 className="text-2xl md:text-3xl font-semibold font-[Spectral] text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-200 to-red-400">
          Santi Thesigners
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button 
              onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
              className="flex items-center gap-2 hover:bg-white/10 p-1.5 rounded-full transition-colors pr-3 border border-transparent hover:border-white/10"
            >
              <div className={`w-10 h-10 rounded-full ${selectedAvatar.bg} flex items-center justify-center text-2xl shadow-inner border-2 border-slate-700`}>
                {selectedAvatar.emoji}
              </div>
              <span className="hidden md:block text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                Ciao, {selectedAvatar.name}!
              </span>
            </button>

            {/* Avatar Selector Dropdown */}
            <AnimatePresence>
              {isAvatarMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-white/20 rounded-xl shadow-2xl p-4 grid grid-cols-4 gap-2 z-50 max-h-80 overflow-y-auto"
                >
                  <div className="col-span-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Scegli il tuo alter ego</div>
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => {
                        setSelectedAvatar(avatar);
                        setIsAvatarMenuOpen(false);
                      }}
                      className={`aspect-square rounded-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform ${avatar.bg} ${selectedAvatar.id === avatar.id ? 'ring-2 ring-yellow-400' : ''}`}
                      title={avatar.name}
                    >
                      {avatar.emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/5">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-8 flex flex-col gap-8">
        
        {/* Welcome Message */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h2 className="text-3xl font-bold text-slate-100">
            Ciao thesigner! <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 font-[Spectral] italic">
              È il momento di dirci cosa porti in dono
            </span>
          </h2>
        </motion.div>

        {/* WIDGETS AREA */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* STAGE 1: ENTRY & COUNTDOWN */}
            {stage === 'ENTRY' && (
              <motion.div
                key="stage-entry"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Santa aspetta te! 🎅</h3>
                  <p className="text-slate-300">Inserisci il tuo regalo prima che scada il tempo.</p>
                </div>

                <CountdownTimer label="Chiusura Consegne" targetDate={targetDate ? new Date(targetDate) : new Date(Date.now() + 86400000)} />

                <div className="mt-8">
                  <button 
                    onClick={() => setStage('GIFT_ENTRY')}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-900/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Gift size={20} />
                    Inserisci Regalo
                  </button>
                </div>
              </motion.div>
            )}

            {/* STAGE 1.5: GIFT ENTRY FORM */}
            {stage === 'GIFT_ENTRY' && (
              <motion.div
                key="stage-gift-entry"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl"
              >
                <div className="flex items-center gap-2 mb-6">
                  <button 
                    onClick={() => setStage('ENTRY')}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <ChevronRight className="rotate-180" size={24} />
                  </button>
                  <h3 className="text-xl font-bold text-white">Dettagli Regalo</h3>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-slate-900/80 rounded-xl mb-6 border border-white/5 relative">
                  <div className="grid grid-cols-2 w-full relative z-10">
                    <button
                      onClick={() => setGiftType('physical')}
                      className={`py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${giftType === 'physical' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <Gift size={16} />
                      Regalo Fisico
                    </button>
                    <button
                      onClick={() => setGiftType('digital')}
                      className={`py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${giftType === 'digital' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <Monitor size={16} />
                      Regalo Digitale
                    </button>
                  </div>
                  {/* Active Tab Indicator */}
                  <motion.div 
                    className="absolute top-1 bottom-1 bg-indigo-600 rounded-lg shadow-lg z-0"
                    initial={false}
                    animate={{ 
                      left: giftType === 'physical' ? '4px' : '50%', 
                      width: 'calc(50% - 6px)',
                      x: giftType === 'physical' ? 0 : 2 
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </div>

                <form onSubmit={handleGiftSubmit} className="space-y-5">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Cosa regali?</label>
                    <input 
                      type="text" 
                      required
                      placeholder={giftType === 'physical' ? "Es. Tazza natalizia fatta a mano" : "Es. Abbonamento Spotify 3 mesi"}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                      value={giftData.name}
                      onChange={(e) => setGiftData({...giftData, name: e.target.value})}
                    />
                  </div>

                  {/* Keyword */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Keyword (sul pacco)</label>
                    <input 
                      type="text" 
                      required
                      maxLength={20}
                      placeholder="Es. 'Fragile', 'Profumato', 'Musicale'..."
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                      value={giftData.keyword}
                      onChange={(e) => setGiftData({...giftData, keyword: e.target.value})}
                    />
                    <p className="text-[10px] text-slate-500 ml-1">Questa parola apparirà sul pacco misterioso prima dell'apertura.</p>
                  </div>

                  {/* Link (Digital Only) */}
                  <AnimatePresence>
                    {giftType === 'digital' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-1.5"
                      >
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Link al regalo</label>
                        <input 
                          type="url" 
                          required
                          placeholder="https://..."
                          className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                          value={giftData.link}
                          onChange={(e) => setGiftData({...giftData, link: e.target.value})}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Photo Upload */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Foto del regalo</label>
                    <div className="relative group cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`w-full h-32 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 overflow-hidden ${giftData.image ? 'border-indigo-500/50 bg-slate-900/80' : 'border-white/10 bg-slate-900/30 group-hover:bg-slate-900/50 group-hover:border-white/20'}`}>
                        {giftData.image ? (
                           <>
                             <img src={giftData.image} alt="Preview" className="w-full h-full object-cover opacity-50" />
                             <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                               <CheckCircle2 className="text-green-400" size={24} />
                             </div>
                           </>
                        ) : (
                          <>
                            <div className="p-3 bg-slate-800 rounded-full text-slate-400 group-hover:text-indigo-400 transition-colors">
                              <Sparkles size={20} />
                            </div>
                            <span className="text-xs text-slate-500 font-medium">Clicca per caricare una foto</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Messaggio per il destinatario</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Scrivi un pensiero carino (o un indizio)..."
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600 resize-none"
                      value={giftData.message}
                      onChange={(e) => setGiftData({...giftData, message: e.target.value})}
                    />
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-900/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                      <Gift size={20} />
                      Salva e Partecipa
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STAGE 2: QUIZ */}
            {stage === 'QUIZ' && (
              <motion.div
                key="stage-quiz"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-gradient-to-b from-amber-900/40 to-slate-900/60 backdrop-blur-md rounded-3xl p-8 border border-amber-500/20 shadow-2xl relative overflow-hidden"
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 p-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                {!quizState.started ? (
                  <>
                     <div className="text-center relative z-10">
                        <motion.div
                          animate={{ rotate: [0, 5, 0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                          className="mb-6"
                        >
                           <ReindeerCowboy />
                        </motion.div>

                        <h3 className="text-2xl font-bold text-amber-100 mb-4 leading-tight">
                          Pronto per la sfida? 🤠
                        </h3>
                        
                        <div className="bg-black/30 p-4 rounded-xl mb-8 text-left space-y-2 border border-amber-500/10">
                          <p className="flex items-center gap-2 text-amber-200/80 text-sm">
                            <Clock size={16} /> Tempo limite: <span className="text-white font-bold">{quizConfig.timeLimit} secondi</span>
                          </p>
                          <p className="flex items-center gap-2 text-amber-200/80 text-sm">
                            <AlertCircle size={16} /> Risposta unica: <span className="text-white font-bold">Non puoi cambiare!</span>
                          </p>
                        </div>

                        <button 
                          onClick={handleStartQuiz}
                          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-bold text-xl shadow-lg shadow-amber-900/20 transition-all transform hover:scale-[1.02] active:scale-95"
                        >
                          Inizia Quiz! 🐎
                        </button>
                     </div>
                  </>
                ) : (
                  <div className="relative z-10">
                    {/* Quiz Active Header */}
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Domanda 1/1</span>
                      <div className={`flex items-center gap-2 font-mono font-bold text-xl ${quizState.timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        <Clock size={20} />
                        00:{quizState.timeLeft.toString().padStart(2, '0')}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-6 leading-relaxed">
                      {quizConfig.question}
                    </h3>

                    <div className="space-y-3">
                      {quizConfig.answers.map((answer, idx) => {
                         let btnClass = "bg-slate-800/50 hover:bg-slate-700/50 border-white/10";
                         
                         if (quizState.isSubmitted) {
                            if (idx === quizConfig.correctIndex) {
                              btnClass = "bg-green-600/20 border-green-500 text-green-100 ring-1 ring-green-500"; // Always show correct one
                            } else if (quizState.selectedAnswer === idx) {
                              btnClass = "bg-red-600/20 border-red-500 text-red-100"; // Wrong selection
                            } else {
                              btnClass = "opacity-50 grayscale";
                            }
                         }

                         return (
                          <button
                            key={idx}
                            disabled={quizState.isSubmitted}
                            onClick={() => handleQuizAnswer(idx)}
                            className={`w-full p-4 rounded-xl text-left border transition-all flex justify-between items-center ${btnClass}`}
                          >
                            <span>{answer}</span>
                            {quizState.isSubmitted && idx === quizConfig.correctIndex && <CheckCircle2 className="text-green-400" size={20} />}
                            {quizState.isSubmitted && quizState.selectedAnswer === idx && idx !== quizConfig.correctIndex && <AlertCircle className="text-red-400" size={20} />}
                          </button>
                         )
                      })}
                    </div>

                    {quizState.isSubmitted && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 pt-4 border-t border-white/10"
                      >
                         <p className="text-center text-slate-300 mb-4 text-sm">
                           {quizState.selectedAnswer === quizConfig.correctIndex ? 
                             "Grande! Risposta corretta! 🎉" : 
                             "Ahi ahi! Sarai fortunato in amore... 💔"}
                         </p>
                         <button 
                           onClick={() => setStage('PRE_EVENT')}
                           className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                         >
                           Vai all'attesa ➔
                         </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* STAGE 3: PRE-EVENT (Ugly Sweaters) */}
            {stage === 'PRE_EVENT' && (
              <motion.div
                key="stage-pre-event"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl text-center"
              >
                 <div className="mb-6 flex justify-center">
                    <div className="bg-indigo-500/20 p-4 rounded-full">
                       <Clock size={48} className="text-indigo-300" />
                    </div>
                 </div>

                 <h3 className="text-2xl font-bold text-white mb-2">
                   Maglioni brutti e a te e famiglia is coming
                 </h3>
                 <p className="text-slate-400 mb-8">
                   Il Secret Santa che non volevi sta arrivando... Preparati psicologicamente.
                 </p>

                 <CountdownTimer label="Inizio Evento" targetDate={new Date()} />
              </motion.div>
            )}

            {/* STAGE 4: LIVE CTA */}
            {stage === 'LIVE' && (
              <motion.div
                key="stage-live"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-red-600 to-rose-700 rounded-3xl p-10 border border-red-400/30 shadow-[0_0_50px_rgba(225,29,72,0.4)] text-center"
              >
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="mb-6 inline-block"
                >
                  <Gift size={64} className="text-white drop-shadow-md" />
                </motion.div>
                
                <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-wide font-[Spectral]">
                  Ci siamo!
                </h3>
                <p className="text-red-100 text-lg mb-8 font-medium">
                  In bocca alla renna! Che la fortuna sia con te.
                </p>

                <button 
                  onClick={onEnterLive}
                  className="w-full py-5 bg-white text-red-600 rounded-xl font-black text-xl hover:bg-red-50 transition-colors shadow-xl flex items-center justify-center gap-3"
                >
                  Entra nella Live
                  <ChevronRight strokeWidth={3} />
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* --- DEV CONTROLS (Removed in prod, useful for demo) --- */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2 bg-black/80 p-2 rounded-lg backdrop-blur text-xs">
        <button onClick={() => setStage('ENTRY')} className={`px-2 py-1 rounded ${stage === 'ENTRY' ? 'bg-white text-black' : 'text-gray-400'}`}>1. Entry</button>
        <button onClick={() => setStage('QUIZ')} className={`px-2 py-1 rounded ${stage === 'QUIZ' ? 'bg-white text-black' : 'text-gray-400'}`}>2. Quiz</button>
        <button onClick={() => setStage('PRE_EVENT')} className={`px-2 py-1 rounded ${stage === 'PRE_EVENT' ? 'bg-white text-black' : 'text-gray-400'}`}>3. Wait</button>
        <button onClick={() => setStage('LIVE')} className={`px-2 py-1 rounded ${stage === 'LIVE' ? 'bg-white text-black' : 'text-gray-400'}`}>4. Live</button>
      </div>

      <footer className="text-center text-slate-600 text-sm py-8">
        © 2025 Santi Thesigners - Powered by North Pole Tech
      </footer>
    </div>
  );
}
