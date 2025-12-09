import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Trophy, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Quiz = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    setSubmitted(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <DashboardLayout>
       <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto">
          
          <AnimatePresence mode="wait">
            {!submitted ? (
                <motion.div 
                    key="question"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Rispondi al Quiz! ⚡️</h1>
                        <p className="text-gray-500">
                            La velocità di risposta determinerà l'ordine di estrazione. Sii rapido!
                        </p>
                    </div>

                    <Card className="shadow-xl border-t-4 border-t-brand-accent">
                        <CardContent className="pt-8 pb-8 flex flex-col items-center gap-6">
                            
                            {/* Timer (Visual) */}
                            <div className="flex items-center gap-2 text-2xl font-mono font-bold text-brand-secondary">
                                <Clock className="h-6 w-6 animate-pulse" />
                                <span>00:12:45</span>
                            </div>

                            <h2 className="text-xl font-bold text-center">
                                Qual è il tuo ricordo natalizio più imbarazzante in ufficio?
                            </h2>

                            <Textarea 
                                placeholder="Scrivi la tua risposta qui..." 
                                className="min-h-[120px] text-lg bg-gray-50"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                            />

                            <Button 
                                size="lg" 
                                className="w-full text-lg shadow-lg shadow-brand-primary/20"
                                onClick={handleSubmit}
                                disabled={!answer}
                            >
                                Invia Risposta
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <motion.div 
                    key="success"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center w-full"
                >
                    <div className="h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600 shadow-inner">
                        <Trophy className="h-12 w-12" />
                    </div>
                    
                    <h1 className="text-3xl font-bold mb-4 text-green-700">Risposta inviata!</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Ti sei posizionato provvisoriamente:
                        <br/>
                        <span className="text-4xl font-bold text-brand-primary mt-2 block">5°</span>
                    </p>

                    <Button variant="outline" onClick={() => navigate('/dashboard')}>
                        Torna alla Dashboard
                    </Button>
                </motion.div>
            )}
          </AnimatePresence>
       </div>
    </DashboardLayout>
  );
};
