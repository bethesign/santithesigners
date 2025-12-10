import { motion } from 'framer-motion';
import { Gift, ChevronRight } from 'lucide-react';

interface LiveWidgetProps {
  onEnterLive: () => void;
}

export const LiveWidget = ({ onEnterLive }: LiveWidgetProps) => {
  return (
    <motion.div
      key="stage-live"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-red-600 to-rose-700 rounded-3xl p-10 border border-red-400/30 shadow-[0_0_50px_rgba(225,29,72,0.4)] text-center"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mb-6 inline-block"
      >
        <Gift size={64} className="text-white drop-shadow-md" />
      </motion.div>

      <h3 className="text-3xl font-black font-display text-white mb-4 uppercase tracking-wide" style={{ fontWeight: 800 }}>
        Ci siamo!
      </h3>
      <p className="text-red-100 text-lg mb-8 font-medium">
        In bocca alla renna! Che la fortuna sia con te.
      </p>

      <button
        onClick={onEnterLive}
        className="w-full py-5 bg-white text-red-600 rounded-xl font-black text-xl hover:bg-red-50 transition-colors shadow-xl flex items-center justify-center gap-3"
      >
        Entra nella Live
        <ChevronRight strokeWidth={3} />
      </button>
    </motion.div>
  );
};
