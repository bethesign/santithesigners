export const ReindeerCowboy = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto drop-shadow-xl">
    {/* Head */}
    <path d="M60 80 Q50 150 100 180 Q150 150 140 80 Q100 70 60 80" fill="#8D6E63" />

    {/* Ears */}
    <ellipse cx="40" cy="90" rx="15" ry="25" fill="#8D6E63" transform="rotate(-30 40 90)" />
    <ellipse cx="160" cy="90" rx="15" ry="25" fill="#8D6E63" transform="rotate(30 160 90)" />

    {/* Antlers */}
    <path d="M50 70 L30 30 M30 30 L10 40 M30 30 L40 10" stroke="#5D4037" strokeWidth="8" strokeLinecap="round" />
    <path d="M150 70 L170 30 M170 30 L190 40 M170 30 L160 10" stroke="#5D4037" strokeWidth="8" strokeLinecap="round" />

    {/* Eyes */}
    <circle cx="80" cy="110" r="8" fill="white" />
    <circle cx="80" cy="110" r="3" fill="black" />
    <circle cx="120" cy="110" r="8" fill="white" />
    <circle cx="120" cy="110" r="3" fill="black" />

    {/* Blinking Nose */}
    <circle cx="100" cy="140" r="15" fill="#ef4444" className="animate-pulse">
      <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
    </circle>

    {/* Cowboy Hat */}
    <path d="M40 70 L160 70 L140 30 L60 30 Z" fill="#D2691E" />
    <rect x="30" y="65" width="140" height="10" rx="5" fill="#D2691E" />
    <rect x="60" y="60" width="80" height="8" fill="#8B4513" />
  </svg>
);
