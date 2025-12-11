import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useInteractiveExtraction } from '../hooks/useInteractiveExtraction';
import { GiftBox } from '../components/extraction/GiftBox';
import { Snow } from '../components/extraction/Snow';
import { assignColorsToGifts } from '../utils/giftColors';

export const Extraction = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentTurn,
    isMyTurn,
    myTurn,
    allTurns,
    availableGifts,
    revealingGift,
    loading,
    error,
    chooseGift
  } = useInteractiveExtraction(user?.id);

  const [choosing, setChoosing] = useState(false);

  // Assign colors to gifts
  const giftsWithColors = useMemo(() => {
    return assignColorsToGifts(availableGifts);
  }, [availableGifts]);

  const handleChooseKeyword = async (giftId: string) => {
    // Trova il regalo che si sta cercando di scegliere
    const selectedGift = giftsWithColors.find(g => g.id === giftId);

    // Impedisci di scegliere il proprio regalo
    if (selectedGift?.user_id === user?.id) {
      alert('Non puoi scegliere il tuo regalo! 🎁');
      return;
    }

    setChoosing(true);

    // Confetti happens locally when you click
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#226f54', '#da2c38', '#ffd700']
    });

    const result = await chooseGift(giftId);

    if (!result.success) {
      alert(result.message);
    }

    setChoosing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 flex items-center justify-center">
        <Snow />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Caricamento estrazione...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 flex items-center justify-center p-4">
        <Snow />
        <div className="bg-red-50 text-red-600 p-4 rounded-lg max-w-2xl relative z-10">
          {error}
        </div>
      </div>
    );
  }

  // If I've already extracted, show the gift
  if (myTurn?.revealed_at && myTurn?.gift_id) {
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
              Puoi vedere i dettagli nella dashboard
            </p>
            <Button
              className="bg-[#226f54] text-white hover:bg-[#1a5640]"
              onClick={() => navigate('/dashboard')}
            >
              Torna alla Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

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
          {currentTurn ? (
            <motion.div
              key={currentTurn.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mt-6 flex flex-col items-center gap-2"
            >
              <span className="text-sm uppercase tracking-widest text-slate-400">Tocca a</span>
              <div className="bg-white/10 backdrop-blur-md px-8 py-3 rounded-full border border-white/20 shadow-lg">
                <span className="text-2xl md:text-3xl font-bold text-yellow-300">
                  {isMyTurn ? 'Te!' : currentTurn.user.full_name}
                </span>
              </div>
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

      {/* Main Grid - Hide while revealing */}
      {!revealingGift && (
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
                  <GiftBox
                    gift={gift}
                    onClick={() => isMyTurn && !choosing && handleChooseKeyword(gift.id)}
                    isMyTurn={isMyTurn}
                    className="w-full"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </main>
      )}

      {/* Reveal Overlay / Modal - NOW SHOWS FOR EVERYONE */}
      <AnimatePresence>
        {revealingGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-lg flex flex-col items-center">

              {/* The "Hero" Gift Box */}
              <div className="relative w-64 h-64 md:w-96 md:h-96 mb-8">
                <GiftBox
                  gift={revealingGift}
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

                <h2 className="text-lg uppercase text-slate-500 font-bold mb-2">
                  {revealingGift.user.full_name} ha trovato
                </h2>

                {/* PHOTO - NEW */}
                {revealingGift.photo_url && (
                  <div className="mb-4 rounded-xl overflow-hidden border-4 border-gray-200">
                    <img
                      src={revealingGift.photo_url}
                      alt={revealingGift.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <div className="text-sm text-slate-400 mb-2 uppercase tracking-wider">
                  Keyword: <strong className="text-[#226f54]">{revealingGift.keyword}</strong>
                </div>
                <div className="text-3xl md:text-5xl font-black text-[#226f54] mb-4 leading-tight">
                  {revealingGift.title}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Tipo regalo:
                  </p>
                  <p className="text-gray-800 text-sm">
                    {revealingGift.type === 'digital' ? '💻 Digitale' : '📦 Fisico'}
                  </p>
                </div>

                {revealingGift.message && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                      Messaggio:
                    </p>
                    <p className="text-gray-800 text-sm italic">"{revealingGift.message}"</p>
                  </div>
                )}

                {/* Modal closes automatically after 5 seconds */}
                <p className="text-xs text-slate-400">Il prossimo turno inizierà tra poco...</p>
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
    </div>
  );
};
