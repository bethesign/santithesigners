import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Play, Calendar, Users, HelpCircle, Settings as SettingsIcon, Clock } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import { supabase } from '../lib/supabase/client';
import { startInteractiveExtraction, stopInteractiveExtraction } from '../services/interactiveExtraction';

interface QuizQuestion {
  id: string;
  question_text: string;
  options: { value: string; text: string }[];
  correct_answer: string;
  is_active: boolean;
}

export const Admin = () => {
  const navigate = useNavigate();
  const { participants, settings, loading, error, refreshData } = useAdminData();

  // State for deadline management
  const [giftsDeadline, setGiftsDeadline] = useState(
    settings?.gifts_deadline ? new Date(settings.gifts_deadline).toISOString().slice(0, 16) : ''
  );
  const [extractionDate, setExtractionDate] = useState(
    settings?.draw_date ? new Date(settings.draw_date).toISOString().slice(0, 16) : ''
  );
  const [savingDeadlines, setSavingDeadlines] = useState(false);

  // State for extraction
  const [startingExtraction, setStartingExtraction] = useState(false);
  const [stoppingExtraction, setStoppingExtraction] = useState(false);

  // State for quiz
  const [quizQuestion, setQuizQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [optionE, setOptionE] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<QuizQuestion | null>(null);

  // Load quiz data
  React.useEffect(() => {
    loadQuizData();
  }, []);

  const loadQuizData = async () => {
    const { data: question } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('is_active', true)
      .single();

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
    }
  };

  // 1. IMPOSTAZIONE TERMINE INSERIMENTO REGALI
  const handleSaveDeadlines = async () => {
    if (!giftsDeadline || !extractionDate) {
      alert('Inserisci entrambe le date');
      return;
    }

    setSavingDeadlines(true);

    const { error } = await supabase
      .from('settings')
      .update({
        gifts_deadline: new Date(giftsDeadline).toISOString(),
        draw_date: new Date(extractionDate).toISOString()
      })
      .eq('id', settings?.id);

    if (error) {
      console.error('Error saving deadlines:', error);
      alert('Errore durante il salvataggio');
    } else {
      alert('Date salvate con successo!');
      refreshData();
    }

    setSavingDeadlines(false);
  };

  // 2. ESTRAZIONE
  const handleStartExtraction = async () => {
    if (!confirm('Sei sicuro di voler avviare l\'estrazione live? I partecipanti potranno iniziare a scegliere i regali.')) {
      return;
    }

    setStartingExtraction(true);
    const result = await startInteractiveExtraction();

    if (result.success) {
      alert(`Estrazione avviata! Ordine di turno creato per ${result.turnsCreated} partecipanti.`);
      refreshData();
      navigate('/extraction');
    } else {
      alert(`Errore: ${result.message}`);
    }

    setStartingExtraction(false);
  };

  const handleStopExtraction = async () => {
    if (!confirm('Sei sicuro di voler fermare l\'estrazione? I partecipanti non potranno più scegliere.')) {
      return;
    }

    setStoppingExtraction(true);
    const result = await stopInteractiveExtraction();

    if (result.success) {
      alert('Estrazione fermata!');
      refreshData();
    } else {
      alert(`Errore: ${result.message}`);
    }

    setStoppingExtraction(false);
  };

  // 4. CONFIGURAZIONE QUIZ
  const handleSaveQuiz = async () => {
    if (!quizQuestion.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim() || !optionE.trim()) {
      alert('Compila tutti i campi obbligatori');
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
      const { error } = await supabase
        .from('quiz_questions')
        .update({
          question_text: quizQuestion.trim(),
          options,
          correct_answer: correctAnswer
        })
        .eq('id', activeQuestion.id);

      if (error) {
        console.error('Error updating question:', error);
        alert('Errore durante l\'aggiornamento');
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
          is_active: true
        });

      if (error) {
        console.error('Error creating question:', error);
        alert('Errore durante la creazione');
      } else {
        alert('Quiz creato!');
        loadQuizData();
      }
    }

    setSavingQuiz(false);
  };

  if (loading) {
    return (
      <DashboardLayout userName="Admin">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-white">Caricamento...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userName="Admin">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Errore: {error}
        </div>
      </DashboardLayout>
    );
  }

  const stats = {
    total: participants.length,
    withGifts: participants.filter(p => p.has_uploaded_gift).length,
    withQuiz: participants.filter(p => p.quiz_completed).length,
    ready: participants.filter(p => p.has_uploaded_gift && p.quiz_completed).length,
  };

  return (
    <DashboardLayout userName="Admin" isAdmin={true}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-extrabold font-display text-white" style={{ fontWeight: 800 }}>
                Pannello Amministratore
              </h1>
              <p className="text-white/60">Gestisci l'evento Secret Santa</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border-border/50 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Partecipanti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold font-display text-gray-800" style={{ fontWeight: 800 }}>
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Con Regalo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold font-display text-blue-600" style={{ fontWeight: 800 }}>
                {stats.withGifts}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Quiz Fatto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold font-display text-amber-600" style={{ fontWeight: 800 }}>
                {stats.withQuiz}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pronti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold font-display text-green-600" style={{ fontWeight: 800 }}>
                {stats.ready}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs per le 4 macro funzioni */}
        <Tabs defaultValue="deadlines" className="w-full">
          <TabsList>
            <TabsTrigger value="deadlines">
              <Calendar className="h-4 w-4 mr-2" />
              Date & Scadenze
            </TabsTrigger>
            <TabsTrigger value="extraction">
              <Play className="h-4 w-4 mr-2" />
              Estrazione
            </TabsTrigger>
            <TabsTrigger value="participants">
              <Users className="h-4 w-4 mr-2" />
              Partecipanti
            </TabsTrigger>
            <TabsTrigger value="quiz">
              <HelpCircle className="h-4 w-4 mr-2" />
              Quiz
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: DATE E SCADENZE */}
          <TabsContent value="deadlines" className="mt-4">
            <Card className="bg-white border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#da2c38] font-extrabold font-display" style={{ fontWeight: 800 }}>
                  Imposta Date e Scadenze
                </CardTitle>
                <CardDescription>
                  Configura la deadline per l'inserimento regali e la data dell'estrazione live
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Scadenza Inserimento Regali
                  </label>
                  <Input
                    type="datetime-local"
                    value={giftsDeadline}
                    onChange={(e) => setGiftsDeadline(e.target.value)}
                    className="max-w-sm"
                  />
                  <p className="text-xs text-gray-500">
                    I membri vedranno il countdown fino a questa data
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Data e Ora Estrazione Live
                  </label>
                  <Input
                    type="datetime-local"
                    value={extractionDate}
                    onChange={(e) => setExtractionDate(e.target.value)}
                    className="max-w-sm"
                  />
                  <p className="text-xs text-gray-500">
                    I membri vedranno il countdown fino all'inizio dell'estrazione
                  </p>
                </div>

                <Button
                  onClick={handleSaveDeadlines}
                  disabled={savingDeadlines}
                  className="bg-[#226f54] text-white hover:bg-[#1a5640]"
                >
                  {savingDeadlines ? 'Salvataggio...' : 'Salva Date'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: ESTRAZIONE */}
          <TabsContent value="extraction" className="mt-4">
            <Card className="bg-white border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#da2c38] font-extrabold font-display" style={{ fontWeight: 800 }}>
                  Gestione Estrazione Live
                </CardTitle>
                <CardDescription>
                  Avvia o ferma l'estrazione interattiva. I partecipanti sceglieranno i regali in base all'ordine del quiz.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Stato Estrazione</div>
                    {settings?.draw_enabled ? (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        🟢 LIVE - Attiva
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 border-gray-300">
                        ⚪ Non Avviata
                      </Badge>
                    )}
                  </div>
                </div>

                {!settings?.draw_enabled ? (
                  <Button
                    onClick={handleStartExtraction}
                    disabled={startingExtraction || stats.ready === 0}
                    className="w-full bg-[#da2c38] text-white hover:bg-red-700"
                  >
                    {startingExtraction ? 'Avvio in corso...' : 'Avvia Estrazione Live'}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate('/extraction')}
                      className="flex-1 bg-[#226f54] text-white hover:bg-[#1a5640]"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Vai alla Live
                    </Button>
                    <Button
                      onClick={handleStopExtraction}
                      disabled={stoppingExtraction}
                      variant="destructive"
                    >
                      {stoppingExtraction ? 'Arresto...' : 'Ferma Estrazione'}
                    </Button>
                  </div>
                )}

                {stats.ready === 0 && !settings?.draw_enabled && (
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                    ⚠️ Nessun partecipante pronto. Assicurati che abbiano caricato il regalo e fatto il quiz.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: PARTECIPANTI */}
          <TabsContent value="participants" className="mt-4">
            <Card className="bg-white border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#da2c38] font-extrabold font-display" style={{ fontWeight: 800 }}>
                  Elenco Partecipanti
                </CardTitle>
                <CardDescription>
                  Classifica e stato di avanzamento per ogni membro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Nome</TableHead>
                      <TableHead className="text-center font-bold">Regalo</TableHead>
                      <TableHead className="text-center font-bold">Fisico</TableHead>
                      <TableHead className="text-center font-bold">Quiz</TableHead>
                      <TableHead className="text-right font-bold">Tempo (sec)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants
                      .sort((a, b) => {
                        // Sort by quiz completion and time
                        if (a.quiz_completed && !b.quiz_completed) return -1;
                        if (!a.quiz_completed && b.quiz_completed) return 1;
                        if (a.quiz_completed && b.quiz_completed) {
                          return (a.quiz_time || 999) - (b.quiz_time || 999);
                        }
                        return 0;
                      })
                      .map((participant, index) => (
                        <TableRow key={participant.id}>
                          <TableCell className="font-medium">
                            {index + 1}. {participant.full_name}
                          </TableCell>
                          <TableCell className="text-center">
                            {participant.has_uploaded_gift ? (
                              <Badge className="bg-green-100 text-green-700">✓</Badge>
                            ) : (
                              <Badge variant="secondary">✗</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {participant.gift_is_physical ? (
                              <Badge className="bg-blue-100 text-blue-700">Sì</Badge>
                            ) : (
                              <Badge variant="secondary">No</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {participant.quiz_completed ? (
                              <Badge className="bg-green-100 text-green-700">✓</Badge>
                            ) : (
                              <Badge variant="secondary">✗</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {participant.quiz_time ? participant.quiz_time.toFixed(1) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: QUIZ */}
          <TabsContent value="quiz" className="mt-4">
            <Card className="bg-white border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#da2c38] font-extrabold font-display" style={{ fontWeight: 800 }}>
                  Configurazione Quiz
                </CardTitle>
                <CardDescription>
                  Crea o modifica la domanda a risposta multipla (5 opzioni)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Domanda</label>
                  <Input
                    value={quizQuestion}
                    onChange={(e) => setQuizQuestion(e.target.value)}
                    placeholder="Es: Qual è il colore del cavallo bianco di Napoleone?"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Opzione A</label>
                    <Input
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      placeholder="Prima risposta"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Opzione B</label>
                    <Input
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      placeholder="Seconda risposta"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Opzione C</label>
                    <Input
                      value={optionC}
                      onChange={(e) => setOptionC(e.target.value)}
                      placeholder="Terza risposta"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Opzione D</label>
                    <Input
                      value={optionD}
                      onChange={(e) => setOptionD(e.target.value)}
                      placeholder="Quarta risposta"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Opzione E</label>
                    <Input
                      value={optionE}
                      onChange={(e) => setOptionE(e.target.value)}
                      placeholder="Quinta risposta"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Risposta Corretta</label>
                    <select
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-white"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleSaveQuiz}
                  disabled={savingQuiz}
                  className="bg-[#226f54] text-white hover:bg-[#1a5640]"
                >
                  {savingQuiz ? 'Salvataggio...' : activeQuestion ? 'Aggiorna Quiz' : 'Crea Quiz'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </DashboardLayout>
  );
};
