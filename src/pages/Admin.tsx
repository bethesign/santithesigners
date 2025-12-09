import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { ArrowLeft, Users, Play, Settings, Gift, RefreshCw, Trash2, Zap, AlertTriangle } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import { generateExtraction, deleteExtraction, getExtractionStats } from '../services/extractionAlgorithm';

export const Admin = () => {
  const navigate = useNavigate();
  const { participants, settings, loading, error, reload } = useAdminData();
  const [generatingExtraction, setGeneratingExtraction] = useState(false);
  const [extractionMessage, setExtractionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [extractionStats, setExtractionStats] = useState<{ generated: boolean; totalParticipants: number; revealedCount: number } | null>(null);

  // Load extraction stats on mount
  React.useEffect(() => {
    async function loadStats() {
      const stats = await getExtractionStats();
      setExtractionStats(stats);
    }
    loadStats();
  }, []);

  const handleGenerateExtraction = async () => {
    setGeneratingExtraction(true);
    setExtractionMessage(null);

    const result = await generateExtraction();

    if (result.success) {
      setExtractionMessage({ type: 'success', text: result.message });
      const stats = await getExtractionStats();
      setExtractionStats(stats);
      reload();
    } else {
      setExtractionMessage({ type: 'error', text: result.message });
    }

    setGeneratingExtraction(false);
  };

  const handleDeleteExtraction = async () => {
    if (!confirm('Sei sicuro di voler cancellare l\'estrazione? Questa azione è irreversibile!')) {
      return;
    }

    setGeneratingExtraction(true);
    setExtractionMessage(null);

    const result = await deleteExtraction();

    if (result.success) {
      setExtractionMessage({ type: 'success', text: result.message });
      const stats = await getExtractionStats();
      setExtractionStats(stats);
      reload();
    } else {
      setExtractionMessage({ type: 'error', text: result.message });
    }

    setGeneratingExtraction(false);
  };

  if (loading) {
    return (
      <DashboardLayout userName="Admin">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento...</p>
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
    ready: participants.filter(p => p.has_uploaded_gift && p.quiz_completed).length,
    gifts: participants.filter(p => p.has_uploaded_gift).length,
  };

  return (
    <DashboardLayout userName="Admin">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Pannello Amministratore</h1>
              <p className="text-gray-500">Gestisci l'evento Secret Santa</p>
            </div>
          </div>
          <div className="flex gap-2">
            {settings?.draw_enabled && (
              <Button
                variant="default"
                className="gap-2"
                onClick={() => navigate('/extraction')}
              >
                <Play className="h-4 w-4" /> Vai all'Estrazione Live
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Partecipanti Totali</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats.total}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Pronti per l'estrazione</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-green-600">{stats.ready}</div>
                    <p className="text-xs text-gray-400 mt-1">{Math.round((stats.ready / stats.total) * 100)}% completato</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Regali Caricati</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{stats.gifts}</div>
                </CardContent>
            </Card>
        </div>

        <Tabs defaultValue="extraction" className="w-full">
            <TabsList>
                <TabsTrigger value="extraction">Estrazione</TabsTrigger>
                <TabsTrigger value="participants">Partecipanti</TabsTrigger>
                <TabsTrigger value="settings">Impostazioni</TabsTrigger>
            </TabsList>

            <TabsContent value="extraction" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Generazione Estrazione</CardTitle>
                        <CardDescription>Crea gli abbinamenti sealed per il Secret Santa</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {extractionMessage && (
                          <div className={`p-4 rounded-lg ${extractionMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {extractionMessage.text}
                          </div>
                        )}

                        {extractionStats?.generated ? (
                          <div className="space-y-4">
                            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Zap className="h-5 w-5" />
                                <span className="font-semibold">Estrazione già generata</span>
                              </div>
                              <div className="text-sm space-y-1">
                                <p>Partecipanti: {extractionStats.totalParticipants}</p>
                                <p>Estrazione rivelate: {extractionStats.revealedCount} / {extractionStats.totalParticipants}</p>
                                <p className="text-xs text-blue-600 mt-2">Generata il: {settings?.extraction_generated_at ? new Date(settings.extraction_generated_at).toLocaleString('it-IT') : 'N/A'}</p>
                              </div>
                            </div>

                            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                              <div>
                                <p className="font-medium">Attenzione!</p>
                                <p className="text-xs">Eliminare l'estrazione cancellerà tutti gli abbinamenti. Usare solo in caso di emergenza.</p>
                              </div>
                            </div>

                            <Button
                              variant="destructive"
                              className="w-full gap-2"
                              onClick={handleDeleteExtraction}
                              disabled={generatingExtraction}
                            >
                              <Trash2 className="h-4 w-4" />
                              {generatingExtraction ? 'Eliminazione...' : 'Elimina Estrazione'}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                              <p className="font-medium">Stato partecipanti:</p>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Totale</p>
                                  <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Regali caricati</p>
                                  <p className="text-2xl font-bold text-green-600">{stats.gifts}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Quiz completato</p>
                                  <p className="text-2xl font-bold text-blue-600">{participants.filter(p => p.quiz_completed).length}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Pronti</p>
                                  <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm">
                              <p className="font-medium mb-1">Come funziona:</p>
                              <ul className="text-xs space-y-1 list-disc list-inside">
                                <li>L'algoritmo crea una permutazione ciclica sealed</li>
                                <li>Ogni partecipante riceverà un regalo ma NON il proprio</li>
                                <li>L'ordine di estrazione è basato sulla velocità nel quiz</li>
                                <li>Gli abbinamenti sono nascosti finché non rivelati durante l'estrazione live</li>
                              </ul>
                            </div>

                            <Button
                              variant="secondary"
                              className="w-full gap-2"
                              onClick={handleGenerateExtraction}
                              disabled={generatingExtraction || stats.gifts < 2}
                            >
                              <Zap className="h-4 w-4" />
                              {generatingExtraction ? 'Generazione...' : 'Genera Estrazione'}
                            </Button>

                            {stats.gifts < 2 && (
                              <p className="text-sm text-red-600 text-center">
                                Servono almeno 2 partecipanti con regali caricati
                              </p>
                            )}
                          </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="participants" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Lista Partecipanti</CardTitle>
                        <CardDescription>Gestisci chi partecipa all'evento.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Stato</TableHead>
                                    <TableHead>Regalo</TableHead>
                                    <TableHead>Quiz</TableHead>
                                    <TableHead className="text-right">Azioni</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {participants.map((participant) => {
                                    const isReady = participant.has_uploaded_gift && participant.quiz_completed;
                                    const status = isReady ? 'ready' : participant.has_uploaded_gift || participant.quiz_completed ? 'pending' : 'idle';

                                    return (
                                    <TableRow key={participant.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                              <span>{participant.full_name}</span>
                                              {participant.is_admin && (
                                                <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 text-xs">
                                                  Admin
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="text-xs text-gray-500">{participant.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={status === 'ready' ? 'default' : 'secondary'}>
                                                {status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {participant.has_uploaded_gift ? (
                                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Caricato</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-400 border-gray-200">Mancante</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {participant.quiz_completed ? (
                                                <div className="flex items-center gap-2">
                                                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                    Completato
                                                  </Badge>
                                                  {participant.quiz_position && (
                                                    <span className="text-xs text-gray-500">#{participant.quiz_position}</span>
                                                  )}
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-400 border-gray-200">Da fare</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-xs text-gray-400">-</span>
                                        </TableCell>
                                    </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Configurazione Evento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Blocca caricamento regali</label>
                                <p className="text-xs text-gray-500">Impedisci ai partecipanti di caricare o modificare regali.</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Modalità Manutenzione</label>
                                <p className="text-xs text-gray-500">Disabilita l'accesso all'app per tutti tranne gli admin.</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

      </div>
    </DashboardLayout>
  );
};
