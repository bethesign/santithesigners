import { motion } from 'framer-motion';
import { ReindeerCowboy } from './ReindeerCowboy';

interface QuizWidgetProps {
  onStartQuiz: () => void;
}

export const QuizWidget = ({ onStartQuiz }: QuizWidgetProps) => {
  return (
    <motion.div
      key="stage-quiz"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-gradient-to-b from-amber-900/40 to-slate-900/60 backdrop-blur-md rounded-3xl p-8 border border-amber-500/20 shadow-2xl relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="text-center relative z-10">
        <motion.div
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="mb-6"
        >
          <ReindeerCowboy />
        </motion.div>

        <h3 className="text-2xl font-extrabold font-display text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 font-[Spectral] italic mb-4 leading-tight" style={{ fontWeight: 800 }}>
          Sarai la renna più veloce<br />del far west? 🤠
        </h3>

        <p className="text-amber-200/80 mb-8 max-w-md mx-auto">
          Fai il quiz e assicurati la possibilità di scegliere tra più regali. I più lenti riceveranno solo carbone!
        </p>

        <button
          onClick={onStartQuiz}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-bold text-xl shadow-lg shadow-amber-900/20 transition-all transform hover:scale-[1.02] active:scale-95"
        >
          Corri! 🦌
        </button>
      </div>
    </motion.div>
  );
};
