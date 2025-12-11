import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';

interface PreEventWidgetProps {
  targetDate: Date;
}

export const PreEventWidget = ({ targetDate }: PreEventWidgetProps) => {
  return (
    <motion.div
      key="stage-pre-event"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl text-center"
    >
      <div className="mb-6 flex justify-center">
        <div className="bg-indigo-500/20 p-4 rounded-full">
          <Clock size={48} className="text-indigo-300" />
        </div>
      </div>

      <h3 className="text-2xl font-extrabold font-display text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 font-[Spectral] italic mb-2" style={{ fontWeight: 800 }}>
        Maglioni brutti e a te e famiglia is coming
      </h3>
      <p className="text-slate-400 mb-8">
        Il Secret Santa che non volevi sta arrivando... Preparati psicologicamente.
      </p>

      <CountdownTimer label="Inizio Evento" targetDate={targetDate} />
    </motion.div>
  );
};
