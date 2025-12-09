import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { AWKWARD_QUESTIONS, RECURRING_PHRASE } from "../lib/constants";

// --- COMPONENTI INTERNI ---

// 1. Il Ticker Scorrevole (Sfondo) - MIGLIORATO
const TickerRow = ({
  phrases,
  direction = "left",
  speed = 20,
  rowIndex
}: {
  phrases: string[],
  direction?: "left" | "right",
  speed?: number,
  rowIndex: number
}) => {
  // Mescoliamo le frasi per variare ogni riga
  const content = phrases.map((p, i) => (
    <span key={i} className="mx-6 flex items-center gap-4">
      <span className="whitespace-nowrap font-bold uppercase text-christmas-offWhite/60 text-2xl md:text-4xl">
        {p}
      </span>
      <span className="text-christmas-gold/50 text-2xl md:text-3xl">❄️</span>
      <span className="whitespace-nowrap font-black uppercase text-christmas-red/50 text-2xl md:text-4xl tracking-widest">
        {RECURRING_PHRASE}
      </span>
      <span className="text-christmas-green/50 text-2xl md:text-3xl">🎄</span>
    </span>
  ));

  return (
    <div className="flex w-full overflow-hidden py-1 select-none relative z-0">
      <motion.div
        className="flex"
        initial={{ x: direction === "left" ? 0 : "-50%" }}
        animate={{ x: direction === "left" ? "-50%" : 0 }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ width: "fit-content" }}
      >
        {/* Ripetiamo il contenuto abbastanza volte da coprire schermi larghi e permettere il loop */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex">{content}</div>
        ))}
      </motion.div>
    </div>
  );
};

// 2. La Neve che cade
const Snowflakes = () => {
  const [snowflakes, setSnowflakes] = useState<any[]>([]);

  useEffect(() => {
    // Generiamo fiocchi solo client-side per evitare hydration mismatch
    const flakes = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 5 + 5}s`,
      animationDelay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.5 + 0.3,
      size: Math.random() * 10 + 5,
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-white animate-snow"
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            animationDuration: flake.animationDuration,
            animationDelay: flake.animationDelay,
            top: -20,
          }}
        />
      ))}
    </div>
  );
};

// 3. L'Arbre Magique (SVG Custom)
const ArbreMagique: React.FC = () => {
  const navigate = useNavigate();
  const [lights, setLights] = useState<any[]>([]);

  useEffect(() => {
    // Luci lampeggianti con delay random
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

    const lightsData = lightPositions.map((pos, i) => ({
      ...pos,
      delay: Math.random() * 2,
      color: i % 2 === 0 ? '#D42426' : '#F8B229',
    }));

    setLights(lightsData);
  }, []);

  return (
    <div className="relative z-30 flex justify-center h-full items-start pt-0">
        {/* Container che dondola - Pivot point in alto al centro - MIGLIORATO */}
        <motion.div
          className="origin-top flex flex-col items-center relative"
          animate={{
            rotate: [-3, 3, -3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >

            {/* Il Filo - PARTE DALLA CIMA DELLO SCHERMO */}
            <div className="w-1 h-[50vh] md:h-[45vh] bg-christmas-offWhite/90 shadow-sm"></div>

            {/* L'Albero (Arbre Magique) */}
            <div className="relative -mt-2 filter drop-shadow-2xl">
                <svg
                    width="300"
                    height="380"
                    viewBox="0 0 300 380"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[280px] h-[350px] md:w-[350px] md:h-[450px]"
                >
                    {/* Sagoma Albero */}
                    <path
                        d="M150 20 L280 300 H190 L190 360 H110 L110 300 H20 L150 20Z"
                        fill="#165B33"
                        stroke="#F0F4F8"
                        strokeWidth="8"
                        strokeLinejoin="round"
                    />
                    {/* Dettagli interni (bordi interni per effetto 'flat graphic') */}
                    <path d="M150 40 L240 280 H60 L150 40Z" fill="#1A6D3F" />

                    {/* Luci lampeggianti con animazione */}
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

                {/* Aggiungiamo lo stile CSS per il twinkle */}
                <style>{`
                  @keyframes twinkle {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                  }
                `}</style>

                {/* Il Button "Smell of Santa" posizionato sulla base */}
                <div className="absolute bottom-[25px] md:bottom-[30px] left-0 right-0 flex justify-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="
                            bg-christmas-red text-white font-black uppercase tracking-wider
                            px-6 py-3 rounded-full border-4 border-white
                            shadow-[0_4px_0_rgb(0,0,0,0.2)]
                            hover:scale-105 hover:bg-red-600 hover:shadow-[0_6px_0_rgb(0,0,0,0.2)]
                            active:scale-95 active:shadow-none active:translate-y-1
                            transition-all duration-150 ease-out
                            text-sm md:text-base
                        ">
                        Smell of Santa 🎅
                    </button>
                </div>
            </div>
        </motion.div>
    </div>
  );
};

// --- PAGINA PRINCIPALE ---

export const Homepage: React.FC = () => {
  // Dividiamo le frasi in chunk per creare righe diverse
  const chunkSize = 5;
  const shuffledRows = [];

  // Creiamo circa 10-12 righe per coprire lo schermo
  for (let i = 0; i < 15; i++) {
    // Prendiamo frasi random dall'array principale
    const randomSlice = [...AWKWARD_QUESTIONS]
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
    shuffledRows.push(randomSlice);
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-christmas-darkGreen">
      {/* 1. Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-christmas-green to-christmas-darkGreen z-0" />

      {/* 2. Scrolling Background Text - PIÙ VELOCE E VISIBILE */}
      <div className="absolute inset-0 flex flex-col justify-center opacity-70 z-10 pointer-events-none">
        {shuffledRows.map((row, index) => (
          <TickerRow
            key={index}
            phrases={row}
            rowIndex={index}
            direction={index % 2 === 0 ? "left" : "right"}
            speed={Math.random() * 30 + 50} // Velocità lenta: tra 50s e 80s
          />
        ))}
      </div>

      {/* 3. Effetto Neve */}
      <Snowflakes />

      {/* 4. Elemento Centrale (Albero + Button) */}
      <ArbreMagique />

    </main>
  );
};
