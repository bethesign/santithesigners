import React from 'react';
import { motion } from 'motion/react';

const Snow = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-1 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full opacity-20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: -10,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: window.innerHeight + 10,
            x: Math.random() * window.innerWidth,
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

export default Snow;
