import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DashboardCard } from '../components/dashboard/DashboardCard';
import { Countdown } from '../components/dashboard/Countdown';
import { Button } from '../components/ui/button';
import { Gift, ScrollText, Timer, PartyPopper, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard = () => {
  const navigate = useNavigate();
  // Demo State
  const [state, setState] = useState<'initial' | 'ready'>('initial');

  // Hardcoded date for demo (Dec 25 2024 or similar)
  const extractionDate = new Date('2024-12-24T20:00:00');

  return (
    <DashboardLayout userName="Mario" isLive={state === 'ready'}>
      <div className="flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">Ciao, Mario! 👋</h1>
            <p className="text-gray-500 mt-2">Benvenuto nel tuo pannello di controllo.</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-center text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Estrazione tra</p>
            <Countdown targetDate={extractionDate} />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            <DashboardCard
              title="Il Tuo Regalo"
              icon={Gift}
              status={state === 'initial' ? 'pending' : 'completed'}
              actionLabel={state === 'initial' ? "Carica Regalo" : "Visualizza Regalo"}
              onClick={() => navigate('/dashboard/gift')}
            >
              {state === 'initial' ? (
                <p>Non hai ancora caricato il regalo che farai. Caricalo per partecipare all'estrazione!</p>
              ) : (
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-dashed">
                  <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center shrink-0">
                    <Gift className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Titolo del Regalo</p>
                    <p className="text-xs text-gray-500">Caricato il 12 Dic 2024</p>
                  </div>
                </div>
              )}
            </DashboardCard>

            <DashboardCard
              title="Quiz di Posizionamento"
              icon={ScrollText}
              status={state === 'initial' ? 'pending' : 'completed'}
              actionLabel={state === 'initial' ? "Inizia Quiz" : "Vedi Classifica"}
              onClick={() => navigate('/quiz')}
            >
              {state === 'initial' ? (
                <p>Rispondi al quiz per determinare l'ordine di estrazione. Sii veloce!</p>
              ) : (
                <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg text-blue-800">
                  <span className="text-sm font-medium">Quiz completato!</span>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    <span className="font-bold">12.4s</span>
                  </div>
                </div>
              )}
            </DashboardCard>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <DashboardCard
              title="Regalo Ricevuto"
              icon={PartyPopper}
              status={state === 'ready' ? 'completed' : 'locked'}
              actionLabel="Apri Regalo"
              disabled={state !== 'ready'}
              onClick={() => navigate('/dashboard/gift-received')}
            >
               {state === 'initial' ? (
                <p className="text-gray-400 italic">Il tuo regalo apparirà qui dopo l'estrazione.</p>
              ) : (
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <Gift className="h-5 w-5" />
                   </div>
                   <p className="font-medium text-green-700">Hai ricevuto un regalo!</p>
                </div>
              )}
            </DashboardCard>

            <DashboardCard
              title="Estrazione Live"
              icon={Timer}
              status={state === 'ready' ? 'active' : 'pending'}
              actionLabel="Partecipa all'Estrazione"
              disabled={state !== 'ready'}
              onClick={() => navigate('/extraction')}
            >
              {state === 'initial' ? (
                <p className="text-gray-500">L'evento non è ancora iniziato.</p>
              ) : (
                <div className="text-center py-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-bold animate-pulse">
                    <span className="h-2 w-2 bg-red-600 rounded-full" />
                    IN CORSO
                  </div>
                  <p className="mt-2 text-sm">È il tuo turno tra poco!</p>
                </div>
              )}
            </DashboardCard>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur border p-2 rounded-lg shadow-xl text-xs z-50">
          <p className="font-bold mb-1 text-gray-500 uppercase">Demo Controls</p>
          <div className="flex gap-2">
            <Button size="sm" variant={state === 'initial' ? 'default' : 'outline'} onClick={() => setState('initial')}>Before Event</Button>
            <Button size="sm" variant={state === 'ready' ? 'default' : 'outline'} onClick={() => setState('ready')}>Event Active</Button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
