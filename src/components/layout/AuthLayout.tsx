import React from 'react';
import { motion } from 'motion/react';
import { TreePine } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Decorative Left Side */}
      <div className="relative flex h-64 w-full flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--brand-primary-light),_var(--brand-primary-dark))] lg:h-auto lg:w-1/2">
        {/* Snow Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-white opacity-70"
              initial={{
                x: Math.random() * 100 + "%",
                y: -10,
                opacity: 0,
              }}
              animate={{
                y: "110vh",
                x: Math.random() * 100 + "%", // Drift slightly?
                opacity: [0, 1, 0.3],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear",
              }}
              style={{
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Modern Minimal Christmas Tree */}
        <div className="relative z-10 flex flex-col items-center text-white">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <TreePine className="h-32 w-32 text-white/90 drop-shadow-lg lg:h-64 lg:w-64" strokeWidth={1} />
          </motion.div>
          <motion.h1 
            className="mt-4 text-2xl font-bold text-white lg:text-4xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Secret Santa
          </motion.h1>
        </div>
      </div>

      {/* Right Side - Form Area */}
      <div className="flex w-full flex-col items-center justify-center bg-gray-50 p-6 lg:w-1/2 lg:p-12">
        {children}
      </div>
    </div>
  );
};
