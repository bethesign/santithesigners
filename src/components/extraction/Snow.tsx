import { motion } from 'framer-motion';

export const Snow = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full opacity-20"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
            y: -10,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: (typeof window !== 'undefined' ? window.innerHeight : 1080) + 10,
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 20,
          }}
          style={{
            width: Math.random() * 6 + 2 + "px",
            height: Math.random() * 6 + 2 + "px",
          }}
        />
      ))}
    </div>
  );
};
