import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Users, HelpCircle, Save, Play, Lock, Unlock, Clock, CheckCircle2, XCircle, Trophy, Gift, Calendar, ArrowLeft } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import { supabase } from '../lib/supabase/client';
import { startInteractiveExtraction, stopInteractiveExtraction } from '../services/interactiveExtraction';

interface QuizQuestion {
  id: string;
  question_text: string;
  options: { value: string; text: string }[];
  correct_answer: string;
  time_limit: number | null;
  is_active: boolean;
}

export const Admin = () => {
  const navigate = useNavigate();
  const { participants, settings, loading, error, refreshData } = useAdminData();
  const [activeTab, setActiveTab] = useState<'DEADLINES' | 'EXTRACTION' | 'PARTICIPANTS' | 'QUIZ' | 'RESET'>('DEADLINES');

  // State for gifts deadline
  const [giftsDeadline, setGiftsDeadline] = useState(
    settings?.gifts_deadline ? new Date(settings.gifts_deadline).toISOString().slice(0, 16) : ''
  );
  const [savingGiftsDeadline, setSavingGiftsDeadline] = useState(false);

  // State for extraction date
  const [extractionDate, setExtractionDate] = useState(
    settings?.extraction_available_date ? new Date(settings.extraction_available_date).toISOString().slice(0, 16) : ''
  );
  const [savingExtractionDate, setSavingExtractionDate] = useState(false);

  // State for extraction control
  const [togglingExtraction, setTogglingExtraction] = useState(false);

  // State for quiz
  const [quizQuestion, setQuizQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [optionE, setOptionE] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [timeLimit, setTimeLimit] = useState(60); // seconds
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<QuizQuestion | null>(null);

  // Load quiz data
  React.useEffect(() => {
    loadQuizData();
  }, []);

  React.useEffect(() => {
    if (settings) {
      setGiftsDeadline(settings.gifts_deadline ? new Date(settings.gifts_deadline).toISOString().slice(0, 16) : '');
      setExtractionDate(settings.extraction_available_date ? new Date(settings.extraction_available_date).toISOString().slice(0, 16) : '');
    }
  }, [settings]);

  const loadQuizData = async () => {
    const { data: question } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    console.log('📖 Loaded active quiz question:', question);

    if (question) {
      setActiveQuestion(question);
      setQuizQuestion(question.question_text);
      if (question.options && question.options.length === 5) {
        setOptionA(question.options[0].text);
        setOptionB(question.options[1].text);
        setOptionC(question.options[2].text);
        setOptionD(question.options[3].text);
        setOptionE(question.options[4].text);
      }
      setCorrectAnswer(question.correct_answer || 'A');
      setTimeLimit(question.time_limit || 60);
      console.log('✅ Quiz state updated:', {
        id: question.id,
        question_text: question.question_text,
        options: question.options,
        correct_answer: question.correct_answer,
        time_limit: question.time_limit
      });
    } else {
      console.log('⚠️ No active quiz question found');
    }
  };

  // SAVE GIFTS DEADLINE
  const handleSaveGiftsDeadline = async () => {
    if (!giftsDeadline) {
      alert('Inserisci la data di scadenza regali');
      return;
    }

    setSavingGiftsDeadline(true);

    const { error } = await supabase
      .from('settings')
      .update({ gifts_deadline: new Date(giftsDeadline).toISOString() })
      .eq('id', settings?.id);

    if (error) {
      console.error('Error saving gifts deadline:', error);
      alert('Errore durante il salvataggio');
    } else {
      alert('Scadenza regali salvata!');
      refreshData();
    }

    setSavingGiftsDeadline(false);
  };

  // SAVE EXTRACTION DATE
  const handleSaveExtractionDate = async () => {
    if (!extractionDate) {
      alert('Inserisci la data di estrazione');
      return;
    }

    setSavingExtractionDate(true);

    const dateToSave = new Date(extractionDate).toISOString();
    console.log('🔍 Saving extraction date:', {
      input: extractionDate,
      iso: dateToSave,
      settingsId: settings?.id
    });

    // Try update first
    const { data, error } = await supabase
      .from('settings')
      .update({ extraction_available_date: dateToSave })
      .eq('id', 1)  // Force ID = 1 (standard for singleton settings)
      .select();

    if (error) {
      console.error('❌ Error saving extraction date:', error);
      alert(`Errore durante il salvataggio: ${error.message}`);
    } else if (data && data.length === 0) {
      // No rows updated - record doesn't exist, try insert
      console.warn('⚠️ No settings record found, creating one...');
      const { error: insertError } = await supabase
        .from('settings')
        .insert({
          id: 1,
          gifts_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          extraction_available_date: dateToSave
        });

      if (insertError) {
        console.error('❌ Error inserting settings:', insertError);
        alert(`Errore durante la creazione: ${insertError.message}`);
      } else {
        console.log('✅ Settings created successfully!');
        alert('Data estrazione salvata!');
        await refreshData();
      }
    } else {
      console.log('✅ Saved successfully:', data);
      alert('Data estrazione salvata!');
      await refreshData();
    }

    setSavingExtractionDate(false);
  };

  // START EXTRACTION
  const handleStartExtraction = async () => {
    setTogglingExtraction(true);
    const result = await startInteractiveExtraction();

    if (result.success) {
      alert(`Estrazione avviata! Ordine di turno creato per ${result.turnsCreated} partecipanti.`);
      refreshData();
    } else {
      alert(`Errore: ${result.message}`);
    }

    setTogglingExtraction(false);
  };

  // STOP EXTRACTION
  const handleStopExtraction = async () => {
    setTogglingExtraction(true);
    const result = await stopInteractiveExtraction();

    if (result.success) {
      alert('Estrazione fermata!');
      refreshData();
    } else {
      alert(`Errore: ${result.message}`);
    }

    setTogglingExtraction(false);
  };

  // RESET FUNCTIONS (for testing)
  const handleResetGifts = async () => {
    if (!window.confirm('ATTENZIONE: Eliminare TUTTI i regali? Questa azione è irreversibile!')) return;

    const { error } = await supabase.from('gifts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Error resetting gifts:', error);
      alert('Errore durante il reset dei regali');
    } else {
      alert('Tutti i regali sono stati eliminati! Gli utenti possono ricaricare.');
      refreshData();
    }
  };

  const handleResetQuizAnswers = async () => {
    if (!window.confirm('ATTENZIONE: Eliminare TUTTE le risposte al quiz? Questa azione è irreversibile!')) return;

    const { error } = await supabase.from('quiz_answers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Error resetting quiz answers:', error);
      alert('Errore durante il reset delle risposte');
    } else {
      alert('Tutte le risposte al quiz sono state eliminate! Gli utenti possono rispondere di nuovo.');
      refreshData();
    }
  };

  const handleResetExtraction = async () => {
    if (!window.confirm('ATTENZIONE: Eliminare TUTTA l\'estrazione? Questa azione è irreversibile!')) return;

    const { error } = await supabase.from('extraction').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Error resetting extraction:', error);
      alert('Errore durante il reset dell\'estrazione');
    } else {
      alert('Estrazione eliminata!');
      refreshData();
    }
  };

  const handleResetMyGift = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!window.confirm('Eliminare il TUO regalo per fare test?')) return;

    const { error } = await supabase.from('gifts').delete().eq('user_id', user.id);

    if (error) {
      console.error('Error resetting my gift:', error);
      alert('Errore durante il reset del tuo regalo');
    } else {
      alert('Il tuo regalo è stato eliminato! Puoi ricaricare.');
      refreshData();
    }
  };

  const handleResetMyQuiz = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!window.confirm('Eliminare la TUA risposta al quiz per fare test?')) return;

    const { error } = await supabase.from('quiz_answers').delete().eq('user_id', user.id);

    if (error) {
      console.error('Error resetting my quiz:', error);
      alert('Errore durante il reset della tua risposta');
    } else {
      alert('La tua risposta al quiz è stata eliminata! Puoi rispondere di nuovo.');
      refreshData();
    }
  };

  // SAVE QUIZ
  const handleSaveQuiz = async () => {
    if (!quizQuestion.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim() || !optionE.trim()) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    if (!timeLimit || timeLimit < 10 || timeLimit > 600) {
      alert('Il tempo limite deve essere tra 10 e 600 secondi');
      return;
    }

    setSavingQuiz(true);

    const options = [
      { value: 'A', text: optionA.trim() },
      { value: 'B', text: optionB.trim() },
      { value: 'C', text: optionC.trim() },
      { value: 'D', text: optionD.trim() },
      { value: 'E', text: optionE.trim() }
    ];

    if (activeQuestion) {
      // Update existing
      console.log('🔄 Updating quiz question:', {
        activeQuestionId: activeQuestion.id,
        question_text: quizQuestion.trim(),
        options,
        correct_answer: correctAnswer,
        time_limit: timeLimit
      });

      const { data, error } = await supabase
        .from('quiz_questions')
        .update({
          question_text: quizQuestion.trim(),
          options,
          correct_answer: correctAnswer,
          time_limit: timeLimit
        })
        .eq('id', activeQuestion.id)
        .select();

      console.log('✅ Update result:', { data, error, rowsAffected: data?.length || 0 });

      if (error) {
        console.error('Error updating question:', error);
        alert('Errore durante l\'aggiornamento');
      } else if (!data || data.length === 0) {
        console.error('❌ UPDATE returned 0 rows - question ID not found or RLS blocking');
        alert('Errore: la domanda non è stata trovata o i permessi sono sbagliati');
      } else {
        alert('Quiz aggiornato!');
        loadQuizData();
      }
    } else {
      // Create new (deactivate others first)
      await supabase
        .from('quiz_questions')
        .update({ is_active: false })
        .eq('is_active', true);

      const { error } = await supabase
        .from('quiz_questions')
        .insert({
          question_text: quizQuestion.trim(),
          question_type: 'multiple_choice',
          options,
          correct_answer: correctAnswer,
          time_limit: timeLimit,
          is_active: true
        });

      if (error) {
        console.error('Error creating question:', error);
        alert('Errore durante la creazione');
      } else {
        alert('Quiz salvato e aggiornato per tutti gli utenti!');
        loadQuizData();
      }
    }

    setSavingQuiz(false);
  };

  // SORTED PARTICIPANTS
  const sortedParticipants = [...participants].sort((a, b) => {
    // 1. Correct answers first (handle null values properly)
    if (a.quiz_is_correct === true && b.quiz_is_correct !== true) return -1;
    if (a.quiz_is_correct !== true && b.quiz_is_correct === true) return 1;

    // 2. Within same correctness group, sort by time (lowest first)
    return (a.quiz_time || 999) - (b.quiz_time || 999);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Errore: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-[Spectral]">
      {/* HEADER */}
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500">
            Admin Control Panel
          </h1>
        </div>
        <div className="text-sm text-slate-400">
          Secret Santa Admin
        </div>
      </header>

      {/* TABS */}
      <div className="flex gap-4 mb-8 border-b border-white/10 pb-1">
        <button
          onClick={() => setActiveTab('DEADLINES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'DEADLINES' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          <Calendar size={18} /> Scadenze Regali
        </button>
        <button
          onClick={() => setActiveTab('EXTRACTION')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'EXTRACTION' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          <Settings size={18} /> Estrazione
        </button>
        <button
          onClick={() => setActiveTab('PARTICIPANTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'PARTICIPANTS' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          <Users size={18} /> Partecipanti
        </button>
        <button
          onClick={() => setActiveTab('QUIZ')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'QUIZ' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          <HelpCircle size={18} /> Quiz
        </button>
        <button
          onClick={() => setActiveTab('RESET')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'RESET' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          <XCircle size={18} /> Reset (TEST)
        </button>
      </div>

      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 shadow-xl max-w-5xl mx-auto">

        {/* TAB: SCADENZE REGALI */}
        {activeTab === 'DEADLINES' && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="text-yellow-400" /> Scadenza Inserimento Regali
              </h2>
              <p className="text-slate-400 text-sm">Imposta la data e l'ora limite per l'inserimento dei regali. I membri vedranno il countdown.</p>
              <input
                type="datetime-local"
                className="bg-slate-900 border border-white/20 rounded-lg p-3 text-white w-full max-w-md focus:ring-2 focus:ring-indigo-500 outline-none [color-scheme:dark]"
                value={giftsDeadline}
                onChange={(e) => setGiftsDeadline(e.target.value)}
              />
              <button
                onClick={handleSaveGiftsDeadline}
                disabled={savingGiftsDeadline}
                className="w-full max-w-md py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all disabled:bg-slate-700 disabled:cursor-not-allowed"
              >
                <Save size={20} /> {savingGiftsDeadline ? 'Salvataggio...' : 'Salva Scadenza Regali'}
              </button>
            </div>
          </div>
        )}

        {/* TAB: EXTRACTION */}
        {activeTab === 'EXTRACTION' && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="text-yellow-400" /> Timer Inizio Evento
              </h2>
              <p className="text-slate-400 text-sm">Imposta la data e l'ora target per il conto alla rovescia sulla dashboard utenti.</p>
              <input
                type="datetime-local"
                className="bg-slate-900 border border-white/20 rounded-lg p-3 text-white w-full max-w-md focus:ring-2 focus:ring-indigo-500 outline-none [color-scheme:dark]"
                value={extractionDate}
                onChange={(e) => setExtractionDate(e.target.value)}
              />
              <button
                onClick={handleSaveExtractionDate}
                disabled={savingExtractionDate}
                className="w-full max-w-md py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all disabled:bg-slate-700 disabled:cursor-not-allowed"
              >
                <Save size={20} /> {savingExtractionDate ? 'Salvataggio...' : 'Salva Data Estrazione'}
              </button>
            </div>

            <div className="h-px bg-white/10" />

            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Play className="text-red-400" /> Stato Estrazione
              </h2>
              <p className="text-slate-400 text-sm">
                Quando "BLOCCATO", i partecipanti vedono il tabellone ma non possono aprire i pacchi.
                Sblocca per iniziare la live.
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleStartExtraction}
                  disabled={settings?.draw_enabled || togglingExtraction}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${settings?.draw_enabled ? 'bg-green-600/20 text-green-400 cursor-default' : 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/20'}`}
                >
                  <Unlock size={20} />
                  AVVIA ESTRAZIONE
                </button>

                <button
                  onClick={handleStopExtraction}
                  disabled={!settings?.draw_enabled || togglingExtraction}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${!settings?.draw_enabled ? 'bg-red-600/20 text-red-400 cursor-default' : 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/20'}`}
                >
                  <Lock size={20} />
                  BLOCCA
                </button>
              </div>

              <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${settings?.draw_enabled ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                STATO ATTUALE: {settings?.draw_enabled ? "ESTRAZIONE IN CORSO (APERTURA ABILITATA)" : "ATTESA (APERTURA BLOCCATA)"}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PARTICIPANTS */}
        {activeTab === 'PARTICIPANTS' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="text-yellow-400" /> Classifica & Stato
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-white/10 text-sm uppercase tracking-wider">
                    <th className="p-4">Pos</th>
                    <th className="p-4">Partecipante</th>
                    <th className="p-4 text-center">Regalo</th>
                    <th className="p-4 text-center">Fisico</th>
                    <th className="p-4 text-center">Quiz</th>
                    <th className="p-4 text-right">Tempo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedParticipants.map((p, index) => {
                    // Logic for row styling
                    let rowBg = 'hover:bg-white/5';
                    let scoreColor = 'text-slate-400';

                    if (index === 0 && p.quiz_is_correct) rowBg = 'bg-yellow-500/10 hover:bg-yellow-500/20 border-l-4 border-yellow-500';
                    else if (p.quiz_is_correct) rowBg = 'bg-green-500/5 hover:bg-green-500/10';
                    else if (p.quiz_is_correct === false) rowBg = 'bg-red-500/5 hover:bg-red-500/10';

                    if (p.quiz_is_correct) scoreColor = 'text-green-400 font-bold';
                    if (p.quiz_is_correct === false) scoreColor = 'text-red-400 font-bold';

                    return (
                      <tr key={p.id} className={`transition-colors ${rowBg}`}>
                        <td className="p-4 font-mono text-slate-500">#{index + 1}</td>
                        <td className="p-4">
                          <div className="font-bold text-white">{p.full_name}</div>
                        </td>
                        <td className="p-4 text-center">
                          {p.has_uploaded_gift ?
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400"><Gift size={16} /></span> :
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-500"><XCircle size={16} /></span>
                          }
                        </td>
                        <td className="p-4 text-center">
                          {p.gift_is_physical ?
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">Sì</span> :
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-500 text-xs">No</span>
                          }
                        </td>
                        <td className={`p-4 text-center ${scoreColor}`}>
                          {p.quiz_is_correct === true && "CORRETTO"}
                          {p.quiz_is_correct === false && "ERRATO"}
                          {p.quiz_is_correct === null && "..."}
                        </td>
                        <td className="p-4 text-right font-mono text-slate-300">
                          {p.quiz_time && p.quiz_time > 0 ? `${p.quiz_time.toFixed(1)}s` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: QUIZ */}
        {activeTab === 'QUIZ' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <HelpCircle className="text-purple-400" /> Configurazione Quiz
            </h2>

            <div className="space-y-4">
              {/* Question */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Domanda</label>
                <input
                  type="text"
                  value={quizQuestion}
                  onChange={(e) => setQuizQuestion(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Inserisci la domanda..."
                />
              </div>

              {/* Answers */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-400 mb-1">Risposte (Seleziona la corretta)</label>
                {[
                  { value: 'A', state: optionA, setState: setOptionA },
                  { value: 'B', state: optionB, setState: setOptionB },
                  { value: 'C', state: optionC, setState: setOptionC },
                  { value: 'D', state: optionD, setState: setOptionD },
                  { value: 'E', state: optionE, setState: setOptionE }
                ].map((option) => (
                  <div key={option.value} className="flex items-center gap-3">
                    <button
                      onClick={() => setCorrectAnswer(option.value)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${correctAnswer === option.value ? 'bg-green-500 border-green-500 text-black' : 'border-slate-600 text-slate-600 hover:border-slate-400'}`}
                    >
                      {correctAnswer === option.value && <CheckCircle2 size={16} />}
                    </button>
                    <input
                      type="text"
                      value={option.state}
                      onChange={(e) => option.setState(e.target.value)}
                      className={`flex-1 bg-slate-900 border rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none ${correctAnswer === option.value ? 'border-green-500/50' : 'border-white/10'}`}
                      placeholder={`Risposta ${option.value}`}
                    />
                  </div>
                ))}
              </div>

              {/* Time Limit */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">
                  Tempo Limite (secondi)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="10"
                    max="600"
                    step="10"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-32 bg-slate-900 border border-white/20 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <span className="text-slate-400 text-sm">
                    {Math.floor(timeLimit / 60)}:{(timeLimit % 60).toString().padStart(2, '0')} min
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveQuiz}
                  disabled={savingQuiz}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 transition-all disabled:bg-slate-700 disabled:cursor-not-allowed"
                >
                  <Save size={20} /> {savingQuiz ? 'Salvataggio...' : 'Salva Configurazione Quiz'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: RESET (TEST) */}
        {activeTab === 'RESET' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <XCircle className="text-red-400" /> Reset per Testing
            </h2>
            <p className="text-slate-400 text-sm">
              ⚠️ Usa questi pulsanti SOLO per fare test. Le azioni sono IRREVERSIBILI!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reset personali */}
              <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-amber-400">Reset Personali (Solo Tu)</h3>

                <button
                  onClick={handleResetMyGift}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Gift size={20} /> Reset Mio Regalo
                </button>
                <p className="text-xs text-slate-400">Elimina il tuo regalo per poterlo ricaricare</p>

                <button
                  onClick={handleResetMyQuiz}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <HelpCircle size={20} /> Reset Mia Risposta Quiz
                </button>
                <p className="text-xs text-slate-400">Elimina la tua risposta per rispondere di nuovo</p>
              </div>

              {/* Reset globali */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-red-400">Reset Globali (TUTTI)</h3>

                <button
                  onClick={handleResetGifts}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Gift size={20} /> Reset TUTTI i Regali
                </button>
                <p className="text-xs text-slate-400">⚠️ Elimina TUTTI i regali di TUTTI gli utenti</p>

                <button
                  onClick={handleResetQuizAnswers}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <HelpCircle size={20} /> Reset TUTTE le Risposte Quiz
                </button>
                <p className="text-xs text-slate-400">⚠️ Elimina TUTTE le risposte al quiz di TUTTI</p>

                <button
                  onClick={handleResetExtraction}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Trophy size={20} /> Reset Estrazione
                </button>
                <p className="text-xs text-slate-400">⚠️ Elimina tutta l'estrazione e l'ordine di apertura</p>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-200">
              <p className="font-bold mb-2">💡 Suggerimento:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Usa i reset personali per testare il tuo flusso</li>
                <li>Usa i reset globali solo quando necessario (es. nuova sessione test)</li>
                <li>Dopo il reset, gli utenti possono rifare l'azione (carica regalo, quiz, etc.)</li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
