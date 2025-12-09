import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { ArrowLeft, Users, Play, Settings, Gift, RefreshCw, Trash2 } from 'lucide-react';

export const Admin = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [isEventStarted, setIsEventStarted] = useState(false);

  // Mock Data
  const participants = [
    { id: 1, name: "Mario Rossi", email: "mario@example.com", giftUploaded: true, quizDone: true, status: "ready" },
    { id: 2, name: "Luigi Verdi", email: "luigi@example.com", giftUploaded: true, quizDone: false, status: "pending" },
    { id: 3, name: "Peach Toadstool", email: "peach@example.com", giftUploaded: false, quizDone: true, status: "pending" },
    { id: 4, name: "Bowser Koopa", email: "bowser@example.com", giftUploaded: false, quizDone: false, status: "idle" },
    { id: 5, name: "Toad", email: "toad@example.com", giftUploaded: true, quizDone: true, status: "ready" },
  ];

  const stats = {
    total: participants.length,
    ready: participants.filter(p => p.status === 'ready').length,
    gifts: participants.filter(p => p.giftUploaded).length,
  };

  return (
    <DashboardLayout onNavigate={onNavigate} userName="Admin">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onNavigate('dashboard')}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Pannello Amministratore</h1>
              <p className="text-gray-500">Gestisci l'evento Secret Santa</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
                variant={isEventStarted ? "destructive" : "default"} 
                className="gap-2"
                onClick={() => setIsEventStarted(!isEventStarted)}
            >
                {isEventStarted ? <><RefreshCw className="h-4 w-4" /> Reset Evento</> : <><Play className="h-4 w-4" /> Avvia Estrazione</>}
            </Button>
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

        <Tabs defaultValue="participants" className="w-full">
            <TabsList>
                <TabsTrigger value="participants">Partecipanti</TabsTrigger>
                <TabsTrigger value="settings">Impostazioni</TabsTrigger>
            </TabsList>
            
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
                                {participants.map((participant) => (
                                    <TableRow key={participant.id}>
                                        <TableCell className="font-medium">
                                            <div>{participant.name}</div>
                                            <div className="text-xs text-gray-500">{participant.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={participant.status === 'ready' ? 'default' : 'secondary'}>
                                                {participant.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {participant.giftUploaded ? (
                                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Caricato</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-400 border-gray-200">Mancante</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {participant.quizDone ? (
                                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Completato</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-400 border-gray-200">Da fare</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
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
