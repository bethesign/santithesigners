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
import { supabase } from '../lib/supabase/client';

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
    chooseGift,
    closeReveal
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

  // ADMIN: Auto-assign gift to current turn user
  const handleAdminAutoAssign = async () => {
    if (!currentTurn || !user) return;

    const confirmed = window.confirm(`Assegnare automaticamente un regalo a ${currentTurn.user.full_name}?`);
    if (!confirmed) return;

    setChoosing(true);

    try {
      // Find an available gift
      const takenGiftIds = allTurns
        .filter(t => t.revealed_at && t.gift_id)
        .map(t => t.gift_id);

      const availableGift = availableGifts.find(g => !takenGiftIds.includes(g.id));

      if (!availableGift) {
        alert('Nessun regalo disponibile!');
        setChoosing(false);
        return;
      }

      // Assign gift and close turn
      const { error: updateError } = await supabase
        .from('extraction')
        .update({
          gift_id: availableGift.id,
          revealed_at: new Date().toISOString()
        })
        .eq('id', currentTurn.id);

      if (updateError) {
        alert(`Errore: ${updateError.message}`);
        setChoosing(false);
        return;
      }

      // Clear live_state to move to next turn
      await supabase
        .from('live_state')
        .update({
          revealing_gift_id: null,
          revealed_at: null
        })
        .eq('id', 1);

      // Reload data
      window.location.reload();
    } catch (err: any) {
      alert(`Errore: ${err.message}`);
      setChoosing(false);
    }
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

  // Debug logging
  console.log('🔍 Extraction State:', {
    currentTurn,
    isMyTurn,
    myTurn,
    allTurnsCount: allTurns.length,
    availableGiftsCount: availableGifts.length,
    revealingGift: !!revealingGift
  });

  // If extraction is completely finished (no more gifts available), show completion message
  // Only show if ALL turns are completed (all have revealed_at)
  const allTurnsCompleted = allTurns.length > 0 && allTurns.every(t => t.revealed_at);

  console.log('🏁 Completion check:', {
    allTurnsCompleted,
    hasRevealingGift: !!revealingGift,
    shouldShowCompletion: allTurnsCompleted && !revealingGift,
    allTurns: allTurns.map(t => ({
      user: t.user.full_name,
      revealed: !!t.revealed_at
    }))
  });

  if (allTurnsCompleted && !revealingGift) {
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
              Estrazione Completata!
            </h1>
            <p className="text-gray-600 mb-8">
              Tutti i regali sono stati scelti. Torna alla dashboard per vedere i dettagli.
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
              className="mt-6 flex flex-col items-center gap-3"
            >
              <span className="text-sm uppercase tracking-widest text-slate-400">Tocca a</span>
              <div className="bg-white/10 backdrop-blur-md px-8 py-3 rounded-full border border-white/20 shadow-lg">
                <span className="text-2xl md:text-3xl font-bold text-yellow-300">
                  {isMyTurn ? 'Te!' : currentTurn.user.full_name}
                </span>
              </div>

              {/* Admin: Auto-assign button */}
              {user?.role === 'admin' && !isMyTurn && !revealingGift && (
                <button
                  onClick={handleAdminAutoAssign}
                  disabled={choosing}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  {choosing ? 'Assegnazione...' : 'Assegna Regalo Automatico'}
                </button>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
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
                  {revealingGift.chosen_by_user_id === user?.id ? 'Hai trovato' : `${revealingGift.chosen_by_user_name} ha trovato`}
                </h2>

                <div className="text-3xl md:text-5xl font-black text-red-600 mb-6 leading-tight">
                  {revealingGift.title}
                </div>

                {/* Photo and Message Row */}
                {(revealingGift.photo_url || revealingGift.message) && (
                  <div className="flex gap-4 mb-6 w-full">
                    {/* Photo on the left */}
                    {revealingGift.photo_url && (
                      <div className="flex-shrink-0 rounded-xl overflow-hidden border-4 border-gray-200">
                        <img
                          src={revealingGift.photo_url}
                          alt={revealingGift.title}
                          className="w-32 h-32 object-cover"
                        />
                      </div>
                    )}

                    {/* Message on the right */}
                    {revealingGift.message && (
                      <div className="flex-1 bg-blue-50 rounded-xl p-4 text-left">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                          Messaggio:
                        </p>
                        <p className="text-gray-800 text-sm italic">"{revealingGift.message}"</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Show button only for the person who chose this gift */}
                {revealingGift.chosen_by_user_id === user?.id ? (
                  <button
                    onClick={async () => {
                      await closeReveal();
                      // Stay on extraction page to see next turn
                    }}
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
                ) : (
                  <p className="text-xs text-slate-400">Aspettando che {revealingGift.chosen_by_user_name} continui...</p>
                )}
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
