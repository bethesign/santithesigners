import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, User, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Extraction = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [turn, setTurn] = useState(1);
  const totalTurns = 15;
  const [isMyTurn, setIsMyTurn] = useState(false); // Demo toggle
  const [revealed, setRevealed] = useState(false);
  const [assignments, setAssignments] = useState<{giver: string, receiver: string}[]>([]);

  // Demo effect to simulate turns
  useEffect(() => {
    // Just for demo, let's say after 3 seconds it becomes my turn
    const timer = setTimeout(() => setIsMyTurn(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleReveal = () => {
    setRevealed(true);
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#ff6b6b', '#4a9960', '#ffd700']
    });
    // Add to assignments list
    setAssignments(prev => [{giver: 'Mario (Tu)', receiver: 'Luigi'}, ...prev]);
  };

  return (
    <DashboardLayout onNavigate={onNavigate} isLive={true}>
      <div className="max-w-4xl mx-auto space-y-8 text-center">
        
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border text-sm font-bold text-gray-700">
           <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
           LIVE EXTRACTION • Turno {turn}/{totalTurns}
        </div>

        {/* Main Interaction Area */}
        <div className="min-h-[400px] flex items-center justify-center">
            <AnimatePresence mode="wait">
                {!revealed ? (
                    <motion.div
                        key="waiting"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.1, opacity: 0 }}
                        className="flex flex-col items-center"
                    >
                        {isMyTurn ? (
                            <>
                                <motion.div 
                                    animate={{ 
                                        boxShadow: ["0px 0px 0px 0px rgba(255,107,107,0)", "0px 0px 20px 10px rgba(255,107,107,0.3)", "0px 0px 0px 0px rgba(255,107,107,0)"] 
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="rounded-full"
                                >
                                    <Button 
                                        className="h-48 w-48 rounded-full text-2xl font-bold bg-gradient-to-br from-brand-secondary to-red-500 shadow-2xl hover:scale-105 transition-transform"
                                        onClick={handleReveal}
                                    >
                                        SCOPRI<br/>A CHI FAI<br/>IL REGALO
                                    </Button>
                                </motion.div>
                                <p className="mt-8 text-xl font-medium animate-bounce text-gray-600">È il tuo turno! Clicca il pulsante!</p>
                            </>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <div className="h-32 w-32 rounded-full border-4 border-gray-100 flex items-center justify-center bg-white shadow-lg z-10 relative">
                                        <User className="h-12 w-12 text-gray-300" />
                                    </div>
                                    <div className="absolute inset-0 border-4 border-t-brand-primary rounded-full animate-spin" />
                                </div>
                                <h2 className="text-2xl font-bold mt-6">Tocca a Giulia...</h2>
                                <p className="text-gray-500">Sta effettuando l'estrazione</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="revealed"
                        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        className="bg-white p-12 rounded-3xl shadow-2xl border-4 border-brand-gold relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-brand-gold" />
                        <Sparkles className="h-12 w-12 text-brand-gold mx-auto mb-4 animate-spin-slow" />
                        <h2 className="text-gray-500 font-medium mb-2">Devi fare il regalo a...</h2>
                        <h1 className="text-5xl font-black text-brand-primary-dark mb-6">LUIGI</h1>
                        
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">I suoi desideri:</p>
                            <p className="text-gray-800 italic">"Vorrei qualcosa di tecnologico o un libro di cucina..."</p>
                        </div>

                        <Button onClick={() => onNavigate('dashboard')} variant="outline">
                            Torna alla Dashboard
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Assignments Feed */}
        <div className="max-w-2xl mx-auto mt-12 border-t pt-8">
            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-6">Abbinamenti Rivelati</h3>
            <div className="space-y-3">
                {assignments.map((assign, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border"
                    >
                        <div className="flex items-center gap-3">
                            <div className="font-bold text-gray-900">{assign.giver}</div>
                            <ArrowRight className="h-4 w-4 text-gray-300" />
                            <div className="font-bold text-brand-secondary">{assign.receiver}</div>
                        </div>
                        <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">APPENA RIVELATO</span>
                    </motion.div>
                ))}
                {/* Fake previous assignments */}
                <div className="flex items-center justify-between bg-white/50 p-4 rounded-xl border border-dashed text-gray-500">
                    <div className="flex items-center gap-3">
                        <div className="font-medium">Marco</div>
                        <ArrowRight className="h-4 w-4" />
                        <div className="font-medium">Sofia</div>
                    </div>
                    <span className="text-xs">2 min fa</span>
                </div>
            </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
