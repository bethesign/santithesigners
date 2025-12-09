import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserDashboard } from '../hooks/useUserDashboard';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DashboardCard } from '../components/dashboard/DashboardCard';
import { Countdown } from '../components/dashboard/Countdown';
import { Button } from '../components/ui/button';
import { Gift, ScrollText, Timer, PartyPopper, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, gift, quizAnswer, receivedGift, settings, myTurn, loading, error } = useUserDashboard();

  if (loading) {
    return (
      <DashboardLayout userName="..." isLive={false}>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userName={user?.full_name || 'Utente'} isLive={false}>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Errore: {error}
        </div>
      </DashboardLayout>
    );
  }

  const extractionDate = settings?.gifts_deadline ? new Date(settings.gifts_deadline) : null;
  const isLive = settings?.draw_started || false;
  const isDrawEnabled = settings?.draw_enabled || false;

  return (
    <DashboardLayout userName={user?.full_name || 'Utente'} isLive={isLive}>
      <div className="flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">Ciao, {user?.full_name?.split(' ')[0]}! 👋</h1>
            <p className="text-gray-500 mt-2">Benvenuto nel tuo pannello di controllo.</p>
          </div>
          {extractionDate && !isDrawEnabled && (
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <p className="text-center text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Deadline regali</p>
              <Countdown targetDate={extractionDate} />
            </div>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            <DashboardCard
              title="Il Tuo Regalo"
              icon={Gift}
              status={gift ? 'completed' : 'pending'}
              actionLabel={gift ? "Modifica Regalo" : "Carica Regalo"}
              onClick={() => navigate('/dashboard/gift')}
            >
              {!gift ? (
                <p>Non hai ancora caricato il regalo che farai. Caricalo per partecipare all'estrazione!</p>
              ) : (
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-dashed">
                  <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center shrink-0">
                    <Gift className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{gift.title}</p>
                    <p className="text-xs text-gray-500">
                      {gift.type === 'digital' ? '🌐 Digitale' : '📦 Fisico'} • {new Date(gift.created_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
              )}
            </DashboardCard>

            <DashboardCard
              title="Quiz di Posizionamento"
              icon={ScrollText}
              status={quizAnswer ? 'completed' : 'pending'}
              actionLabel={quizAnswer ? "Già completato" : "Inizia Quiz"}
              disabled={!!quizAnswer}
              onClick={() => !quizAnswer && navigate('/quiz')}
            >
              {!quizAnswer ? (
                <p>Rispondi al quiz per determinare l'ordine di estrazione. Sii veloce!</p>
              ) : (
                <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg text-blue-800">
                  <span className="text-sm font-medium">Quiz completato!</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Posizione: #{quizAnswer.position}</span>
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
              status={receivedGift ? 'completed' : 'locked'}
              actionLabel={receivedGift ? "Vedi Regalo" : "In attesa..."}
              disabled={!receivedGift}
              onClick={() => receivedGift && navigate('/dashboard/gift-received')}
            >
               {!receivedGift ? (
                <p className="text-gray-400 italic">Il tuo regalo apparirà qui dopo l'estrazione.</p>
              ) : (
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <Gift className="h-5 w-5" />
                   </div>
                   <div>
                     <p className="font-medium text-green-700">Hai ricevuto un regalo!</p>
                     <p className="text-xs text-gray-500">Da: {receivedGift.giver_name}</p>
                   </div>
                </div>
              )}
            </DashboardCard>

            <DashboardCard
              title="Estrazione Live"
              icon={Timer}
              status={isLive ? 'active' : (isDrawEnabled ? 'pending' : 'locked')}
              actionLabel={isLive ? "Vai all'Estrazione" : "Non ancora iniziata"}
              disabled={!isDrawEnabled}
              onClick={() => isDrawEnabled && navigate('/extraction')}
            >
              {!isDrawEnabled ? (
                <p className="text-gray-500">L'evento non è ancora iniziato.</p>
              ) : isLive ? (
                <div className="text-center py-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-bold animate-pulse">
                    <span className="h-2 w-2 bg-red-600 rounded-full" />
                    IN CORSO
                  </div>
                  {myTurn && (
                    <p className="mt-2 text-sm">
                      {myTurn.revealed_at
                        ? '✅ Hai già estratto!'
                        : `Sei il turno #${myTurn.order_position}`}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">In attesa di inizio...</p>
              )}
            </DashboardCard>
          </div>
        </div>


      </div>
    </DashboardLayout>
  );
};
