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
  question_type: 'open' | 'multiple_choice';
  options?: QuizOption[];
  correct_answer?: string;
}

interface QuizOption {
  value: string;
  text: string;
}

export const Quiz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const [answer, setAnswer] = useState('');
  const [position, setPosition] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

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

  // Timer effect quando il quiz è iniziato
  useEffect(() => {
    if (!started || submitted) return;

    const interval = setInterval(() => {
      if (startTime) {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [started, startTime, submitted]);

  const handleStart = () => {
    setStartTime(Date.now());
    setStarted(true);
  };

  const handleSubmit = async () => {
    if (!answer.trim() || !question || !user || !startTime) return;

    setLoading(true);

    try {
      // Calcola se la risposta è corretta (per multiple choice)
      const isCorrect = question.question_type === 'multiple_choice'
        ? answer === question.correct_answer
        : null; // Per domande aperte, null (da valutare manualmente)

      // Submit answer with time and correctness
      const { error: insertError } = await supabase
        .from('quiz_answers')
        .insert({
          user_id: user.id,
          question_id: question.id,
          answer: answer.trim(),
          answered_at: new Date().toISOString(),
          time_elapsed: elapsedTime,
          is_correct: isCorrect,
        });

      if (insertError) {
        console.error('Error submitting answer:', insertError);
        setError('Errore durante l\'invio della risposta.');
        setLoading(false);
        return;
      }

      // Calculate position based on correctness + time
      // Logica: prima le risposte corrette ordinate per tempo, poi le errate ordinate per tempo
      const { data: allAnswers } = await supabase
        .from('quiz_answers')
        .select('user_id, is_correct, time_elapsed')
        .eq('question_id', question.id)
        .order('is_correct', { ascending: false, nullsFirst: false }) // corrette prima
        .order('time_elapsed', { ascending: true }); // poi per tempo

      if (allAnswers) {
        const userPosition = allAnswers.findIndex(a => a.user_id === user.id);
        setPosition(userPosition + 1);
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
      <DashboardLayout userName={user?.full_name} isAdmin={user?.role === 'admin'}>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Caricamento quiz...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userName={user?.full_name} isAdmin={user?.role === 'admin'}>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg max-w-2xl mx-auto">
          {error}
          <Button className="mt-4 bg-[#226f54] text-white hover:bg-[#1a5640]" onClick={() => navigate('/dashboard')}>
            Torna alla Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName={user?.full_name} isAdmin={user?.role === 'admin'}>
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
                    {!started ? (
                      // Stato iniziale - Non iniziato
                      <>
                        <div className="text-center mb-8">
                          <h1 className="text-3xl font-bold mb-2 text-white font-display">Quiz di Posizionamento ⚡️</h1>
                          <p className="text-white/80">
                            La correttezza della risposta determina la tua posizione.<br/>
                            A parità di correttezza, fa fede il tempo impiegato. Sii veloce e preciso!
                          </p>
                        </div>

                        <Card className="shadow-xl bg-white border-border/50 border-t-4 border-t-[#da2c38]">
                          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-6">
                            <div className="text-center">
                              <h2 className="text-2xl font-bold text-[#da2c38] mb-4">Sei pronto?</h2>
                              <p className="text-gray-700 mb-6">
                                Quando premerai "Inizia", il timer partirà e dovrai rispondere alla domanda il più velocemente possibile.
                              </p>
                              <Button
                                size="lg"
                                className="text-lg bg-[#226f54] text-white hover:bg-[#1a5640] px-12"
                                onClick={handleStart}
                              >
                                Inizia Quiz
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      // Quiz iniziato - Mostra domanda e timer
                      <>
                        <div className="text-center mb-8">
                          <h1 className="text-3xl font-bold mb-2 text-white font-display">Rispondi al Quiz! ⚡️</h1>
                          <p className="text-white/80">
                            Risposte corrette hanno priorità. A parità, vince il più veloce!
                          </p>
                        </div>

                        <Card className="shadow-xl bg-white border-border/50 border-t-4 border-t-[#da2c38]">
                          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-6">

                            {/* Timer reale */}
                            <div className="flex items-center gap-2 text-2xl font-mono font-bold text-[#da2c38]">
                              <Clock className="h-6 w-6 animate-pulse" />
                              <span>{Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
                            </div>

                            <h2 className="text-xl font-bold text-center text-[#da2c38]">
                              {question?.question_text || 'Caricamento domanda...'}
                            </h2>

                            {question?.question_type === 'multiple_choice' && question.options ? (
                              // Domanda a scelta multipla
                              <div className="w-full space-y-3">
                                {question.options.map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() => setAnswer(option.value)}
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                                      answer === option.value
                                        ? 'border-[#226f54] bg-[#226f54]/10'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    <span className="font-bold mr-2">{option.value}.</span>
                                    <span className="text-gray-800">{option.text}</span>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              // Domanda aperta
                              <Textarea
                                placeholder="Scrivi la tua risposta qui..."
                                className="min-h-[120px] text-lg bg-gray-50"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                              />
                            )}

                            <Button
                              size="lg"
                              className="w-full text-lg bg-[#226f54] text-white hover:bg-[#1a5640]"
                              onClick={handleSubmit}
                              disabled={!answer.trim() || loading}
                            >
                              {loading ? 'Invio...' : 'Invia Risposta'}
                            </Button>
                          </CardContent>
                        </Card>
                      </>
                    )}
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
                    
                    <h1 className="text-3xl font-bold mb-4 text-white font-display">Risposta inviata!</h1>
                    <p className="text-xl text-white mb-8">
                        Ti sei posizionato provvisoriamente:
                        <br/>
                        <span className="text-4xl font-bold text-white mt-2 block">
                          {position ? `${position}°` : '...'}
                        </span>
                    </p>
                    <p className="text-sm text-white/80 mb-4">
                      Redirect automatico alla dashboard...
                    </p>

                    <Button className="bg-white text-[#226f54] hover:bg-white/90" onClick={() => navigate('/dashboard')}>
                        Torna alla Dashboard
                    </Button>
                </motion.div>
            )}
          </AnimatePresence>
       </div>
    </DashboardLayout>
  );
};
