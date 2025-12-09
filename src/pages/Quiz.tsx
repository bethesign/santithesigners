import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase/client';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trophy, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  id: string;
  question_text: string;
}

export const Quiz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [answer, setAnswer] = useState('');
  const [position, setPosition] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [startTime] = useState(Date.now());

  useEffect(() => {
    async function loadQuiz() {
      if (!user) return;

      try {
        // Check if already answered
        const { data: existingAnswer } = await supabase
          .from('quiz_answers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (existingAnswer) {
          // Already answered - calculate position and show success
          const { count } = await supabase
            .from('quiz_answers')
            .select('*', { count: 'exact', head: true })
            .lt('answered_at', existingAnswer.answered_at);

          setPosition((count ?? 0) + 1);
          setSubmitted(true);
          setLoading(false);
          return;
        }

        // Fetch active question
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('is_active', true)
          .single();

        if (questionError || !questionData) {
          setError('Nessuna domanda disponibile al momento.');
          setLoading(false);
          return;
        }

        setQuestion(questionData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError('Errore durante il caricamento del quiz.');
        setLoading(false);
      }
    }

    loadQuiz();
  }, [user]);

  const handleSubmit = async () => {
    if (!answer.trim() || !question || !user) return;

    setLoading(true);

    try {
      // Submit answer with precise timestamp
      const { error: insertError } = await supabase
        .from('quiz_answers')
        .insert({
          user_id: user.id,
          question_id: question.id,
          answer: answer.trim(),
          answered_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error submitting answer:', insertError);
        setError('Errore durante l\'invio della risposta.');
        setLoading(false);
        return;
      }

      // Calculate position
      const { data: answerData } = await supabase
        .from('quiz_answers')
        .select('answered_at')
        .eq('user_id', user.id)
        .single();

      if (answerData) {
        const { count } = await supabase
          .from('quiz_answers')
          .select('*', { count: 'exact', head: true })
          .lt('answered_at', answerData.answered_at);

        setPosition((count ?? 0) + 1);
      }

      setSubmitted(true);
      setLoading(false);

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError('Errore imprevisto.');
      setLoading(false);
    }
  };

  if (loading && !submitted) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento quiz...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg max-w-2xl mx-auto">
          {error}
          <Button className="mt-4" onClick={() => navigate('/dashboard')}>
            Torna alla Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

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
                                {question?.question_text || 'Caricamento domanda...'}
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
                                disabled={!answer.trim() || loading}
                            >
                                {loading ? 'Invio...' : 'Invia Risposta'}
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
                        <span className="text-4xl font-bold text-brand-primary mt-2 block">
                          {position ? `${position}°` : '...'}
                        </span>
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Redirect automatico alla dashboard...
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
