import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';

interface GiftBoxProps {
  gift: {
    id: string;
    keyword: string;
    color: string;
  };
  onClick?: () => void;
  isOpen?: boolean;
  isMyTurn: boolean;
  className?: string;
}

export const GiftBox = ({ gift, onClick, isOpen, isMyTurn, className = "" }: GiftBoxProps) => {
  return (
    <motion.div
      layoutId={`gift-container-${gift.id}`}
      className={`relative group perspective-1000 ${className}`}
      onClick={onClick}
      whileHover={isMyTurn && !isOpen ? { scale: 1.05, rotate: 2 } : {}}
      whileTap={isMyTurn && !isOpen ? { scale: 0.95 } : {}}
      style={{
        cursor: isMyTurn ? 'pointer' : 'not-allowed',
        opacity: isMyTurn ? 1 : 0.6
      }}
    >
      {/* Box Body */}
      <motion.div
        layoutId={`gift-body-${gift.id}`}
        className={`relative w-full aspect-square rounded-xl shadow-2xl flex items-center justify-center overflow-hidden ${gift.color} border-b-8 border-black/20`}
      >
        {/* Ribbon Vertical */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1/5 bg-yellow-400/90 shadow-sm" />

        {/* Ribbon Horizontal */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1/5 bg-yellow-400/90 shadow-sm" />

        {/* Label (Keyword) */}
        <motion.span
          layoutId={`gift-label-${gift.id}`}
          className="relative z-10 text-white font-extrabold font-display text-lg md:text-xl drop-shadow-md uppercase tracking-wider bg-black/30 px-3 py-1 rounded backdrop-blur-sm"
          style={{ fontWeight: 800 }}
        >
          {gift.keyword}
        </motion.span>
      </motion.div>

      {/* Box Lid */}
      <motion.div
        layoutId={`gift-lid-${gift.id}`}
        className={`absolute -top-2 left-0 right-0 h-1/4 rounded-lg shadow-xl z-20 ${gift.color} brightness-110 flex items-center justify-center`}
        animate={isOpen ? { y: -200, opacity: 0, rotate: -20 } : { y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: "backIn" }}
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1/5 bg-yellow-400" />

        {/* Bow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 -mt-6 text-yellow-300 drop-shadow-lg">
          <Gift size={64} strokeWidth={1} fill="#fde047" />
        </div>
      </motion.div>
    </motion.div>
  );
};
