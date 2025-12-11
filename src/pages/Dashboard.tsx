import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserDashboard } from '../hooks/useUserDashboard';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AnimatePresence } from 'framer-motion';
import { EntryWidget } from '../components/dashboard/widgets/EntryWidget';
import { QuizWidget } from '../components/dashboard/widgets/QuizWidget';
import { PreEventWidget } from '../components/dashboard/widgets/PreEventWidget';
import { LiveWidget } from '../components/dashboard/widgets/LiveWidget';
import { motion } from 'framer-motion';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, gift, quizAnswer, settings, loading, error } = useUserDashboard();

  // Determine current stage based on user progress and settings
  const currentStage = useMemo(() => {
    // Stage 1: ENTRY - User hasn't uploaded gift yet
    if (!gift) return 'ENTRY';

    // Stage 2: QUIZ - Gift uploaded but quiz not completed
    if (!quizAnswer) return 'QUIZ';

    // Stage 3: PRE_EVENT - Waiting for extraction to start
    if (!settings?.draw_enabled) return 'PRE_EVENT';

    // Stage 4: LIVE - Extraction is live
    return 'LIVE';
  }, [gift, quizAnswer, settings]);

  if (loading) {
    return (
      <DashboardLayout userName="..." isLive={false} isAdmin={false}>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Caricamento dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userName={user?.full_name || 'Utente'} isLive={false} isAdmin={user?.role === 'admin'}>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Errore: {error}
        </div>
      </DashboardLayout>
    );
  }

  const isLive = settings?.draw_enabled || false;
  const isAdmin = user?.role === 'admin';
  const giftsDeadline = settings?.gifts_deadline ? new Date(settings.gifts_deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const extractionDate = settings?.extraction_available_date ? new Date(settings.extraction_available_date) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  return (
    <DashboardLayout userName={user?.full_name || 'Utente'} isLive={isLive} isAdmin={isAdmin}>
      <div className="flex flex-col gap-8">

        {/* Welcome Message - Matching Figma */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h2 className="text-3xl font-bold text-slate-100">
            Ciao thesigner! <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 font-[Spectral] italic">
              È il momento di dirci cosa porti in dono
            </span>
          </h2>
        </motion.div>

        {/* Widgets Area */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">

            {/* Stage 1: ENTRY */}
            {currentStage === 'ENTRY' && (
              <EntryWidget
                targetDate={giftsDeadline}
                onInsertGift={() => navigate('/dashboard/gift')}
              />
            )}

            {/* Stage 2: QUIZ */}
            {currentStage === 'QUIZ' && (
              <QuizWidget
                onStartQuiz={() => navigate('/quiz')}
              />
            )}

            {/* Stage 3: PRE_EVENT */}
            {currentStage === 'PRE_EVENT' && (
              <PreEventWidget
                targetDate={extractionDate}
              />
            )}

            {/* Stage 4: LIVE */}
            {currentStage === 'LIVE' && (
              <LiveWidget
                onEnterLive={() => navigate('/extraction')}
              />
            )}

          </AnimatePresence>
        </div>

        {/* DEV CONTROLS - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-50 flex gap-2 bg-black/80 p-2 rounded-lg backdrop-blur text-xs">
            <div className="text-white px-2 py-1">Stage: {currentStage}</div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
