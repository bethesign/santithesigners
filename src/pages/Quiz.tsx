import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase/client';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trophy, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: 'open' | 'multiple_choice';
  options?: QuizOption[];
  correct_answer?: string;
  time_limit: number | null;
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
  const [showingResults, setShowingResults] = useState(false);
  const [started, setStarted] = useState(false);
  const [answer, setAnswer] = useState('');
  const [position, setPosition] = useState<number | null>(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      if (!user) return;

      try {
        // Check if already answered
        const { data: existingAnswer } = await supabase
          .from('quiz_answers')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

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
          .maybeSingle();

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

  // Timer effect - counts DOWN from time_limit and auto-submits on expiry
  useEffect(() => {
    if (!started || submitted || !startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);

      const limit = question?.time_limit || 60;
      const remaining = limit - elapsed;
      setTimeRemaining(Math.max(0, remaining));

      // Auto-submit when time expires
      if (remaining <= 0 && !timeExpired && !submitted) {
        setTimeExpired(true);
        // Auto-save timeout response
        handleSubmit();
      }
    }, 100); // Update more frequently for smooth countdown

    return () => clearInterval(interval);
  }, [started, startTime, submitted, question?.time_limit, timeExpired]);

  const handleStart = () => {
    setStartTime(Date.now());
    setStarted(true);
    setTimeRemaining(question?.time_limit || 60);
    setTimeExpired(false);
  };

  const handleSubmit = async () => {
    if (!question || !user || !startTime) return;

    // Allow submit even without answer (for timeout)
    if (submitted) return; // Prevent double submission

    setLoading(true);

    try {
      // Calcola se la risposta è corretta (per multiple choice)
      const isAnswerCorrect = question.question_type === 'multiple_choice' && answer.trim()
        ? answer === question.correct_answer
        : false; // Se timeout o risposta vuota, è sbagliata

      // Save correctness to state
      setIsCorrect(isAnswerCorrect);

      // Submit answer with time and correctness
      const { error: insertError } = await supabase
        .from('quiz_answers')
        .insert({
          user_id: user.id,
          question_id: question.id,
          answer: answer.trim() || 'TIMEOUT', // Mark timeout responses
          answered_at: new Date().toISOString(),
          time_elapsed: elapsedTime,
          is_correct: isAnswerCorrect,
        });

      if (insertError) {
        console.error('Error submitting answer:', insertError);

        // If duplicate key error, it means already submitted - just show success
        if (insertError.code === '23505') {
          setSubmitted(true);
          setLoading(false);
          return;
        }

        setError('Errore durante l\'invio della risposta.');
        setLoading(false);
        return;
      }

      // Calculate position based on correctness + time
      // Logica: prima le risposte corrette ordinate per tempo, poi le errate ordinate per tempo
      const { data: allAnswers } = await supabase
        .from('quiz_answers')
        .select('user_id, is_correct, time_elapsed')
        .eq('question_id', question.id);

      if (allAnswers) {
        // Sort manually in JavaScript to handle null values correctly
        const sorted = [...allAnswers].sort((a, b) => {
          // Correct answers first
          if (a.is_correct === true && b.is_correct !== true) return -1;
          if (a.is_correct !== true && b.is_correct === true) return 1;

          // Within same correctness group, sort by time (fastest first)
          return (a.time_elapsed || 999) - (b.time_elapsed || 999);
        });

        const userPosition = sorted.findIndex(a => a.user_id === user.id);
        setPosition(userPosition + 1);

        // Count how many people answered correctly
        const correctCount = allAnswers.filter(a => a.is_correct === true).length;
        setCorrectAnswersCount(correctCount);
      }

      setShowingResults(true);
      setLoading(false);

      // Trigger confetti only if correct
      if (isAnswerCorrect) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
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
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="w-full bg-gradient-to-b from-amber-900/40 to-slate-900/60 backdrop-blur-md rounded-3xl p-8 border border-amber-500/20 shadow-2xl relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    {!started ? (
                      // Stato iniziale - Non iniziato
                      <div className="text-center relative z-10">
                        <h3 className="text-2xl font-bold text-amber-100 mb-4 leading-tight">
                          Pronto per la sfida? 🤠
                        </h3>

                        <div className="bg-black/30 p-4 rounded-xl mb-8 text-left space-y-2 border border-amber-500/10">
                          <p className="flex items-center gap-2 text-amber-200/80 text-sm">
                            <Clock size={16} /> Tempo limite: <span className="text-white font-bold">{question?.time_limit || 60} secondi</span>
                          </p>
                          <p className="flex items-center gap-2 text-amber-200/80 text-sm">
                            <AlertCircle size={16} /> Risposta unica: <span className="text-white font-bold">Non puoi cambiare!</span>
                          </p>
                        </div>

                        <button
                          onClick={handleStart}
                          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-bold text-xl shadow-lg shadow-amber-900/20 transition-all transform hover:scale-[1.02] active:scale-95"
                        >
                          Inizia Quiz! 🧠
                        </button>
                      </div>
                    ) : (
                      // Quiz iniziato - Mostra domanda e timer
                      <div className="relative z-10">
                        {/* Quiz Active Header */}
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Domanda 1/1</span>
                          <div className={`flex items-center gap-2 font-mono font-bold text-xl ${
                            timeRemaining && timeRemaining <= 5 ? 'text-red-500 animate-pulse' : 'text-white'
                          }`}>
                            <Clock size={20} />
                            00:{((timeRemaining || 0) % 60).toString().padStart(2, '0')}
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-6 leading-relaxed">
                          {question?.question_text || 'Caricamento domanda...'}
                        </h3>

                        <div className="space-y-3">
                          {question?.question_type === 'multiple_choice' && question.options ? (
                            // Multiple choice buttons
                            question.options.map((option, idx) => {
                              let btnClass = "bg-slate-800/50 hover:bg-slate-700/50 border-white/10";

                              if (showingResults) {
                                // Find correct index
                                const correctIdx = question.options?.findIndex(opt => opt.value === question.correct_answer) ?? -1;
                                if (idx === correctIdx) {
                                  btnClass = "bg-green-600/20 border-green-500 text-green-100 ring-1 ring-green-500";
                                } else if (answer === option.value) {
                                  btnClass = "bg-red-600/20 border-red-500 text-red-100";
                                } else {
                                  btnClass = "opacity-50 grayscale";
                                }
                              } else if (answer === option.value) {
                                btnClass = "bg-amber-600/30 border-amber-500/50 text-white";
                              }

                              return (
                                <button
                                  key={idx}
                                  disabled={showingResults || timeExpired}
                                  onClick={() => !showingResults && !timeExpired && setAnswer(option.value)}
                                  className={`w-full p-4 rounded-xl text-left border transition-all flex justify-between items-center ${btnClass}`}
                                >
                                  <span>{option.text}</span>
                                  {showingResults && idx === question.options?.findIndex(opt => opt.value === question.correct_answer) && (
                                    <CheckCircle2 className="text-green-400" size={20} />
                                  )}
                                  {showingResults && answer === option.value && answer !== question.correct_answer && (
                                    <AlertCircle className="text-red-400" size={20} />
                                  )}
                                </button>
                              );
                            })
                          ) : (
                            // Open-ended question
                            <Textarea
                              placeholder="Scrivi la tua risposta qui..."
                              className="min-h-[120px] text-lg bg-slate-800/50 border-white/10 text-white"
                              value={answer}
                              onChange={(e) => setAnswer(e.target.value)}
                              disabled={showingResults || timeExpired}
                            />
                          )}
                        </div>

                        {!showingResults && (
                          <button
                            onClick={handleSubmit}
                            disabled={!answer.trim() || loading || timeExpired}
                            className="w-full mt-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-amber-900/20 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Invio...' : timeExpired ? 'Tempo Scaduto' : 'Invia Risposta'}
                          </button>
                        )}

                        {showingResults && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 pt-4 border-t border-white/10"
                          >
                            <p className="text-center text-slate-300 mb-4 text-sm">
                              {answer === question?.correct_answer
                                ? "Grande! Risposta corretta! 🎉"
                                : "Magari in amore va meglio... 💔"}
                            </p>
                            <button
                              onClick={() => setSubmitted(true)}
                              className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                            >
                              Vai all'attesa ➔
                            </button>
                          </motion.div>
                        )}
                      </div>
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

                    <div className="mb-8">
                      <p className="text-xl text-white mb-2">
                        Posizione provvisoria in classifica:
                      </p>
                      <span className="text-5xl font-bold text-yellow-400 block">
                        {position ? `${position}°` : '...'}
                      </span>
                      <p className="text-sm text-white/70 mt-3">
                        {position === 1 ? '🏆 Attualmente primo!' : 'La classifica è ancora provvisoria'}
                      </p>
                    </div>

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
