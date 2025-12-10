import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const christmasEmojis = ['🎄', '🎅', '⛄', '❄️', '🎁', '⭐', '🔔', '🕯️'];

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  // Generate static positions to avoid re-renders
  const emojiParticles = React.useMemo(() =>
    [...Array(12)].map((_, i) => ({
      emoji: christmasEmojis[i % christmasEmojis.length],
      left: Math.random() * 100,
      duration: 10 + Math.random() * 8,
      delay: Math.random() * 5,
    }))
  , []);

  const snowParticles = React.useMemo(() =>
    [...Array(15)].map(() => ({
      left: Math.random() * 100,
      duration: 6 + Math.random() * 4,
      delay: Math.random() * 5,
    }))
  , []);

  // Christmas tree lights
  const [lights] = React.useState(() => {
    const lightPositions = [
      { cx: 150, cy: 100 },
      { cx: 110, cy: 180 },
      { cx: 190, cy: 180 },
      { cx: 80, cy: 260 },
      { cx: 220, cy: 260 },
      { cx: 150, cy: 220 },
      { cx: 130, cy: 150 },
      { cx: 170, cy: 150 },
    ];

    return lightPositions.map((pos, i) => ({
      ...pos,
      delay: Math.random() * 2,
      color: i % 2 === 0 ? '#D42426' : '#F8B229',
    }));
  });

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row overflow-x-hidden">
      {/* Decorative Left Side */}
      <div className="relative flex h-64 w-full flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--brand-primary-light),_var(--brand-primary-dark))] lg:h-auto lg:w-1/2">
        {/* Christmas Emoji Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {emojiParticles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute text-3xl will-change-transform"
              initial={{
                x: `${particle.left}%`,
                y: -50,
                opacity: 0,
                rotate: 0,
              }}
              animate={{
                y: "110vh",
                opacity: [0, 0.7, 0.5, 0.2],
                rotate: [0, 360],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "linear",
              }}
              style={{
                left: `${particle.left}%`,
              }}
            >
              {particle.emoji}
            </motion.div>
          ))}
        </div>

        {/* Snow Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {snowParticles.map((particle, i) => (
            <motion.div
              key={`snow-${i}`}
              className="absolute h-2 w-2 rounded-full bg-white opacity-70 will-change-transform"
              initial={{
                x: `${particle.left}%`,
                y: -10,
                opacity: 0,
              }}
              animate={{
                y: "110vh",
                opacity: [0, 1, 0.3],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "linear",
              }}
              style={{
                left: `${particle.left}%`,
              }}
            />
          ))}
        </div>

        {/* Magic Christmas Tree */}
        <div className="relative z-10 flex flex-col items-center text-white">
          <motion.div
            className="origin-top"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              rotate: [-2, 2, -2]
            }}
            transition={{
              scale: { duration: 0.8, ease: "easeOut" },
              opacity: { duration: 0.8, ease: "easeOut" },
              rotate: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <svg
              width="300"
              height="400"
              viewBox="0 0 300 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[200px] h-[250px] lg:w-[280px] lg:h-[350px] drop-shadow-2xl"
            >
              {/* Tree shape */}
              <path
                d="M150 20 L280 300 H190 L190 380 H110 L110 300 H20 L150 20Z"
                fill="#165B33"
                stroke="#F0F4F8"
                strokeWidth="8"
                strokeLinejoin="round"
              />
              {/* Inner details */}
              <path d="M150 40 L240 280 H60 L150 40Z" fill="#1A6D3F" />

              {/* Twinkling lights */}
              {lights.map((light, i) => (
                <circle
                  key={i}
                  cx={light.cx}
                  cy={light.cy}
                  r="15"
                  fill={light.color}
                  style={{
                    animation: `twinkle 1.5s ease-in-out infinite`,
                    animationDelay: `${light.delay}s`
                  }}
                />
              ))}
            </svg>

            <style>{`
              @keyframes twinkle {
                0%, 100% { opacity: 0.4; }
                50% { opacity: 1; }
              }
            `}</style>
          </motion.div>

          <motion.div
            className="mt-6 bg-[#D42426] border-4 border-white px-8 py-4 rounded-2xl shadow-2xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl lg:text-5xl font-display font-extrabold text-white">
              Santi Thesigners
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form Area */}
      <div className="relative flex w-full flex-col items-center justify-center bg-[#D42426] p-6 lg:w-1/2 lg:p-12">
        {/* Christmas Emoji Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {emojiParticles.map((particle, i) => (
            <motion.div
              key={`right-emoji-${i}`}
              className="absolute text-3xl will-change-transform opacity-40"
              initial={{
                x: `${particle.left}%`,
                y: -50,
                opacity: 0,
                rotate: 0,
              }}
              animate={{
                y: "110vh",
                opacity: [0, 0.4, 0.3, 0.1],
                rotate: [0, 360],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "linear",
              }}
              style={{
                left: `${particle.left}%`,
              }}
            >
              {particle.emoji}
            </motion.div>
          ))}
        </div>

        {/* Snow Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {snowParticles.map((particle, i) => (
            <motion.div
              key={`right-snow-${i}`}
              className="absolute h-2 w-2 rounded-full bg-white opacity-50 will-change-transform"
              initial={{
                x: `${particle.left}%`,
                y: -10,
                opacity: 0,
              }}
              animate={{
                y: "110vh",
                opacity: [0, 0.6, 0.2],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "linear",
              }}
              style={{
                left: `${particle.left}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 w-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};
