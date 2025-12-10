import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Users, HelpCircle, Save, Play, Lock, Unlock, Clock, CheckCircle2, XCircle, Trophy, Gift } from 'lucide-react';

// --- TYPES ---
export type QuizConfig = {
  question: string;
  answers: string[]; // 5 answers
  correctIndex: number;
  timeLimit: number; // seconds
};

export type Participant = {
  id: string;
  name: string;
  surname: string;
  hasGift: boolean;
  quizStatus: 'PENDING' | 'CORRECT' | 'WRONG';
  quizTime: number; // seconds taken
  extracted?: boolean; // If they have already opened their gift
};

interface AdminDashboardProps {
  // Extraction Props
  targetDate: string | null;
  setTargetDate: (date: string | null) => void;
  isExtractionStarted: boolean;
  setExtractionStarted: (started: boolean) => void;
  
  // Quiz Props
  quizConfig: QuizConfig;
  setQuizConfig: (config: QuizConfig) => void;

  // Participants Props
  participants: Participant[];
}

export default function AdminDashboard({
  targetDate,
  setTargetDate,
  isExtractionStarted,
  setExtractionStarted,
  quizConfig,
  setQuizConfig,
  participants
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'EXTRACTION' | 'PARTICIPANTS' | 'QUIZ'>('EXTRACTION');

  // Local state for quiz form to avoid constant re-renders on parent
  const [localQuizConfig, setLocalQuizConfig] = useState<QuizConfig>(quizConfig);

  const handleSaveQuiz = () => {
    setQuizConfig(localQuizConfig);
    alert("Quiz salvato e aggiornato per tutti gli utenti!");
  };

  const sortedParticipants = [...participants].sort((a, b) => {
    // 1. Correct answers first
    if (a.quizStatus === 'CORRECT' && b.quizStatus !== 'CORRECT') return -1;
    if (a.quizStatus !== 'CORRECT' && b.quizStatus === 'CORRECT') return 1;
    
    // 2. Sort by time (lowest first) for both correct and wrong groups
    // If status is same (both CORRECT or both WRONG/PENDING)
    return a.quizTime - b.quizTime;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-[Spectral] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500">
          Admin Control Panel
        </h1>
        <div className="text-sm text-slate-400">
          Secret Santa Admin
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-white/10 pb-1">
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
      </div>

      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 shadow-xl max-w-5xl mx-auto">
        
        {/* --- EXTRACTION TAB --- */}
        {activeTab === 'EXTRACTION' && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="text-yellow-400" /> Timer Inizio Evento
              </h2>
              <p className="text-slate-400 text-sm">Imposta la data e l'ora target per il conto alla rovescia sulla dashboard utenti.</p>
              <input 
                type="datetime-local" 
                className="bg-slate-900 border border-white/20 rounded-lg p-3 text-white w-full max-w-md focus:ring-2 focus:ring-indigo-500 outline-none"
                value={targetDate || ''}
                onChange={(e) => setTargetDate(e.target.value)}
              />
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
                  onClick={() => setExtractionStarted(true)}
                  disabled={isExtractionStarted}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isExtractionStarted ? 'bg-green-600/20 text-green-400 cursor-default' : 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/20'}`}
                >
                  <Unlock size={20} />
                  AVVIA ESTRAZIONE
                </button>

                <button
                  onClick={() => setExtractionStarted(false)}
                  disabled={!isExtractionStarted}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${!isExtractionStarted ? 'bg-red-600/20 text-red-400 cursor-default' : 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/20'}`}
                >
                  <Lock size={20} />
                  BLOCCA
                </button>
              </div>
              
              <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${isExtractionStarted ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                STATO ATTUALE: {isExtractionStarted ? "ESTRAZIONE IN CORSO (APERTURA ABILITATA)" : "ATTESA (APERTURA BLOCCATA)"}
              </div>
            </div>
          </div>
        )}

        {/* --- PARTICIPANTS TAB --- */}
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
                    <th className="p-4 text-center">Quiz</th>
                    <th className="p-4 text-right">Tempo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedParticipants.map((p, index) => {
                    // Logic for row styling
                    let rowBg = 'hover:bg-white/5';
                    let scoreColor = 'text-slate-400';
                    
                    if (index === 0 && p.quizStatus === 'CORRECT') rowBg = 'bg-yellow-500/10 hover:bg-yellow-500/20 border-l-4 border-yellow-500';
                    else if (p.quizStatus === 'CORRECT') rowBg = 'bg-green-500/5 hover:bg-green-500/10';
                    else if (p.quizStatus === 'WRONG') rowBg = 'bg-red-500/5 hover:bg-red-500/10';

                    if (p.quizStatus === 'CORRECT') scoreColor = 'text-green-400 font-bold';
                    if (p.quizStatus === 'WRONG') scoreColor = 'text-red-400 font-bold';

                    return (
                      <tr key={p.id} className={`transition-colors ${rowBg}`}>
                        <td className="p-4 font-mono text-slate-500">#{index + 1}</td>
                        <td className="p-4">
                          <div className="font-bold text-white">{p.name} {p.surname}</div>
                        </td>
                        <td className="p-4 text-center">
                          {p.hasGift ? 
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400"><Gift size={16} /></span> : 
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-500"><XCircle size={16} /></span>
                          }
                        </td>
                        <td className={`p-4 text-center ${scoreColor}`}>
                          {p.quizStatus === 'CORRECT' && "CORRETTO"}
                          {p.quizStatus === 'WRONG' && "ERRATO"}
                          {p.quizStatus === 'PENDING' && "..."}
                        </td>
                        <td className="p-4 text-right font-mono text-slate-300">
                          {p.quizTime > 0 ? `${p.quizTime.toFixed(1)}s` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- QUIZ TAB --- */}
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
                  value={localQuizConfig.question}
                  onChange={(e) => setLocalQuizConfig({...localQuizConfig, question: e.target.value})}
                  className="w-full bg-slate-900 border border-white/20 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Inserisci la domanda..."
                />
              </div>

              {/* Time Limit */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Tempo Limite (secondi)</label>
                <input 
                  type="number" 
                  value={localQuizConfig.timeLimit}
                  onChange={(e) => setLocalQuizConfig({...localQuizConfig, timeLimit: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-900 border border-white/20 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Answers */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-400 mb-1">Risposte (Seleziona la corretta)</label>
                {localQuizConfig.answers.map((ans, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <button 
                      onClick={() => setLocalQuizConfig({...localQuizConfig, correctIndex: idx})}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${localQuizConfig.correctIndex === idx ? 'bg-green-500 border-green-500 text-black' : 'border-slate-600 text-slate-600 hover:border-slate-400'}`}
                    >
                      {localQuizConfig.correctIndex === idx && <CheckCircle2 size={16} />}
                    </button>
                    <input 
                      type="text"
                      value={ans}
                      onChange={(e) => {
                        const newAnswers = [...localQuizConfig.answers];
                        newAnswers[idx] = e.target.value;
                        setLocalQuizConfig({...localQuizConfig, answers: newAnswers});
                      }}
                      className={`flex-1 bg-slate-900 border rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none ${localQuizConfig.correctIndex === idx ? 'border-green-500/50' : 'border-white/10'}`}
                      placeholder={`Risposta ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSaveQuiz}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Save size={20} /> Salva Configurazione Quiz
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}