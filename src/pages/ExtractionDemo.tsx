import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GiftBox } from '../components/extraction/GiftBox';
import { Snow } from '../components/extraction/Snow';
import { assignColorsToGifts } from '../utils/giftColors';

// Mock data for testing
const MOCK_GIFTS = [
  { id: '1', keyword: 'TECH', title: 'Cuffie Bluetooth Premium', type: 'digital' as const, message: 'Goditi la musica!' },
  { id: '2', keyword: 'RELAX', title: 'Buono SPA 50€', type: 'digital' as const, message: 'Prenditi cura di te' },
  { id: '3', keyword: 'FOOD', title: 'Box Gourmet', type: 'physical' as const, message: 'Delizie per il palato' },
  { id: '4', keyword: 'BOOK', title: 'Abbonamento Kindle Unlimited', type: 'digital' as const, message: null },
  { id: '5', keyword: 'GAME', title: 'Gioco da Tavolo', type: 'physical' as const, message: 'Divertimento assicurato!' },
  { id: '6', keyword: 'MUSIC', title: 'Spotify Premium 3 Mesi', type: 'digital' as const, message: 'Musica senza limiti' },
  { id: '7', keyword: 'TRAVEL', title: 'Zaino da Viaggio', type: 'physical' as const, message: 'Per le tue avventure' },
  { id: '8', keyword: 'COFFEE', title: 'Set Caffè Artigianale', type: 'physical' as const, message: null },
  { id: '9', keyword: 'SPORT', title: 'Borraccia Termica', type: 'physical' as const, message: 'Stay hydrated!' },
  { id: '10', keyword: 'ART', title: 'Set Acquerelli Professionali', type: 'physical' as const, message: 'Libera la creatività' },
];

type DemoMode = 'my-turn' | 'waiting' | 'already-chosen';

export const ExtractionDemo = () => {
  const navigate = useNavigate();
  const [demoMode, setDemoMode] = useState<DemoMode>('my-turn');
  const [availableGifts, setAvailableGifts] = useState(MOCK_GIFTS);
  const [revealedGift, setRevealedGift] = useState<any>(null);
  const [choosing, setChoosing] = useState(false);

  const giftsWithColors = useMemo(() => assignColorsToGifts(availableGifts), [availableGifts]);

  const handleChooseKeyword = (gift: any) => {
    if (demoMode !== 'my-turn') return;

    setChoosing(true);

    setTimeout(() => {
      setRevealedGift(gift);
      setAvailableGifts(prev => prev.filter(g => g.id !== gift.id));

      // Confetti!
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#226f54', '#da2c38', '#ffd700']
      });

      setChoosing(false);
    }, 500);
  };

  const handleReset = () => {
    setAvailableGifts(MOCK_GIFTS);
    setRevealedGift(null);
    setChoosing(false);
  };

  const handleCloseReveal = () => {
    setRevealedGift(null);
    if (demoMode === 'my-turn') {
      setDemoMode('already-chosen');
    }
  };

  // Demo Mode: Already Chosen
  if (demoMode === 'already-chosen' && !revealedGift) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 flex items-center justify-center p-4">
        <Snow />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-12 rounded-3xl shadow-2xl"
          >
            <Sparkles className="h-16 w-16 text-[#ffd700] mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-[#226f54] mb-4">
              Hai già scelto il tuo regalo!
            </h1>
            <p className="text-gray-600 mb-8">
              Demo completata!
            </p>
            <Button
              className="bg-[#226f54] text-white hover:bg-[#1a5640]"
              onClick={handleReset}
            >
              Reset Demo
            </Button>
          </motion.div>
        </div>

        {/* Demo Controls */}
        <div className="fixed top-4 left-4 z-[100] bg-white p-4 rounded-lg shadow-xl border-2 border-blue-500">
          <h3 className="font-bold text-gray-900 mb-2 text-sm">🎮 DEMO MODE</h3>
          <div className="flex flex-col gap-2">
            <Button size="sm" onClick={() => setDemoMode('my-turn')} variant="outline">
              È il mio turno
            </Button>
            <Button size="sm" onClick={() => setDemoMode('waiting')} variant="outline">
              Sto aspettando
            </Button>
            <Button size="sm" onClick={handleReset} variant="outline" className="bg-red-100">
              Reset
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isMyTurn = demoMode === 'my-turn';
  const currentUserName = isMyTurn ? 'Te!' : 'Mario Rossi';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 font-sans overflow-x-hidden selection:bg-red-500 selection:text-white">
      <Snow />

      {/* Header */}
      <header className="relative z-10 py-8 px-4 text-center">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-block"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold font-display tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-200 to-red-400 drop-shadow-sm mb-2" style={{ fontWeight: 800 }}>
            SECRET SANTA
          </h1>
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50" />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-6 flex flex-col items-center gap-2"
          >
            <span className="text-sm uppercase tracking-widest text-slate-400">Tocca a</span>
            <div className="bg-white/10 backdrop-blur-md px-8 py-3 rounded-full border border-white/20 shadow-lg">
              <span className="text-2xl md:text-3xl font-bold text-yellow-300">
                {currentUserName}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8"
        >
          <AnimatePresence>
            {giftsWithColors.map((gift) => (
              <motion.div
                key={gift.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
              >
                {revealedGift?.id !== gift.id && (
                  <GiftBox
                    gift={gift}
                    onClick={() => isMyTurn && !choosing && handleChooseKeyword(gift)}
                    isMyTurn={isMyTurn}
                    className="w-full"
                  />
                )}
                {revealedGift?.id === gift.id && <div className="w-full aspect-square bg-transparent" />}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Reveal Overlay / Modal */}
      <AnimatePresence>
        {revealedGift && (
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
                  gift={revealedGift}
                  isOpen={true}
                  isMyTurn={true}
                  className="w-full h-full text-2xl"
                />
              </div>

              {/* Reveal Content */}
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
                className="bg-white text-slate-900 p-8 rounded-2xl shadow-2xl text-center w-full max-w-md border-4 border-yellow-400"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mb-4 inline-block text-yellow-500"
                >
                  <Sparkles size={48} />
                </motion.div>

                <h2 className="text-lg uppercase text-slate-500 font-bold mb-2">Hai scelto</h2>
                <div className="text-sm text-slate-400 mb-2 uppercase tracking-wider">
                  Keyword: <strong className="text-[#226f54]">{revealedGift.keyword}</strong>
                </div>
                <div className="text-3xl md:text-5xl font-black text-[#226f54] mb-4 leading-tight">
                  {revealedGift.title}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Tipo regalo:
                  </p>
                  <p className="text-gray-800 text-sm">
                    {revealedGift.type === 'digital' ? '💻 Digitale' : '📦 Fisico'}
                  </p>
                </div>

                {revealedGift.message && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                      Messaggio:
                    </p>
                    <p className="text-gray-800 text-sm italic">"{revealedGift.message}"</p>
                  </div>
                )}

                <Button
                  onClick={handleCloseReveal}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 group"
                >
                  Continua
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    →
                  </motion.span>
                </Button>
              </motion.div>
            </div>

            {/* Confetti Effect */}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-slate-500 text-sm z-0 pointer-events-none">
        Pacchi rimanenti: {giftsWithColors.length}
      </div>

      {/* Demo Controls */}
      <div className="fixed top-4 left-4 z-[100] bg-white p-4 rounded-lg shadow-xl border-2 border-blue-500">
        <h3 className="font-bold text-gray-900 mb-2 text-sm">🎮 DEMO MODE</h3>
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            onClick={() => setDemoMode('my-turn')}
            variant={demoMode === 'my-turn' ? 'default' : 'outline'}
            className={demoMode === 'my-turn' ? 'bg-[#226f54] text-white' : ''}
          >
            È il mio turno
          </Button>
          <Button
            size="sm"
            onClick={() => setDemoMode('waiting')}
            variant={demoMode === 'waiting' ? 'default' : 'outline'}
            className={demoMode === 'waiting' ? 'bg-[#226f54] text-white' : ''}
          >
            Sto aspettando
          </Button>
          <Button
            size="sm"
            onClick={() => setDemoMode('already-chosen')}
            variant="outline"
          >
            Ho già scelto
          </Button>
          <div className="h-px bg-gray-300 my-1" />
          <Button size="sm" onClick={handleReset} variant="outline" className="bg-red-50 hover:bg-red-100">
            🔄 Reset
          </Button>
        </div>
      </div>
    </div>
  );
};
