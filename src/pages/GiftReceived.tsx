import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Gift, ExternalLink, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GiftReceived = () => {
  const navigate = useNavigate();
  const [isRevealed, setIsRevealed] = useState(false);

  // Mock received gift data
  const receivedGift = {
    title: "Buono Amazon 50€",
    sender: "Secret Santa", // Usually anonymous
    message: "Spero che ti piaccia! Buon Natale!",
    type: "digital",
    link: "https://amazon.it",
    image: null, // or a URL
  };

  return (
    <DashboardLayout userName="Mario" isLive={true}>
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">Il tuo Regalo</h1>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AnimatePresence mode="wait">
            {!isRevealed ? (
              <motion.div
                key="wrapped"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="text-center space-y-8"
              >
                <div 
                  className="cursor-pointer group relative"
                  onClick={() => setIsRevealed(true)}
                >
                  <motion.div 
                    animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    className="w-64 h-64 bg-brand-primary rounded-2xl shadow-xl flex items-center justify-center relative overflow-hidden border-4 border-brand-gold"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50" />
                    <Gift className="w-32 h-32 text-white drop-shadow-lg" />
                    
                    {/* Ribbon */}
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-brand-gold shadow-sm" />
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 bg-brand-gold shadow-sm" />
                  </motion.div>
                  <div className="mt-8">
                     <Button size="lg" className="rounded-full px-8 text-lg font-bold bg-brand-secondary hover:bg-brand-secondary/90 text-white shadow-lg shadow-red-200">
                        Apri il Regalo!
                     </Button>
                  </div>
                </div>
                <p className="text-gray-500 animate-pulse">Clicca sul pacco per aprirlo</p>
              </motion.div>
            ) : (
              <motion.div
                key="revealed"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-full"
              >
                <Card className="w-full border-t-8 border-t-brand-secondary overflow-hidden">
                  <div className="bg-brand-secondary/10 p-6 flex flex-col items-center justify-center text-center">
                    <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-md mb-4">
                        <PartyPopper className="h-10 w-10 text-brand-secondary" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-1">{receivedGift.title}</h2>
                    <p className="text-gray-500 text-sm uppercase tracking-widest font-semibold">Buon Natale!</p>
                  </div>
                  
                  <CardContent className="space-y-6 pt-8 px-8 pb-8">
                    <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 relative">
                        <div className="absolute -top-3 left-6 bg-white px-2 text-xs font-bold text-gray-400 uppercase">Messaggio</div>
                        <p className="text-gray-700 italic text-lg leading-relaxed">"{receivedGift.message}"</p>
                    </div>

                    {receivedGift.type === 'digital' && receivedGift.link && (
                        <div className="flex justify-center">
                            <Button className="w-full sm:w-auto" asChild>
                                <a href={receivedGift.link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Accedi al Regalo
                                </a>
                            </Button>
                        </div>
                    )}

                    <div className="flex justify-center pt-4">
                        <Button variant="outline" onClick={() => navigate('/feedback')}>
                            Lascia un Feedback
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};
