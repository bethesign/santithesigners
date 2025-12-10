import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';

interface EntryWidgetProps {
  targetDate: Date;
  onInsertGift: () => void;
}

export const EntryWidget = ({ targetDate, onInsertGift }: EntryWidgetProps) => {
  return (
    <motion.div
      key="stage-entry"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-extrabold font-display text-white mb-2" style={{ fontWeight: 800 }}>
          Santa aspetta te! 🎅
        </h3>
        <p className="text-slate-300">Inserisci il tuo regalo prima che scada il tempo.</p>
      </div>

      <CountdownTimer label="Chiusura Consegne" targetDate={targetDate} />

      <div className="mt-8">
        <button
          onClick={onInsertGift}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-900/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <Gift size={20} />
          Inserisci Regalo
        </button>
      </div>
    </motion.div>
  );
};
