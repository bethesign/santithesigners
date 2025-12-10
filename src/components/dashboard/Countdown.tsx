import React, { useEffect, useState } from 'react';
import { cn } from '../ui/utils';

export const Countdown = ({ targetDate, className }: { targetDate: Date, className?: string }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +targetDate - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const Item = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center mx-2">
      <span className="text-2xl font-bold font-mono bg-white rounded-lg px-3 py-2 min-w-[3rem] text-center shadow-md text-[#da2c38]">
        {value < 10 ? `0${value}` : value}
      </span>
      <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-700 mt-1">{label}</span>
    </div>
  );

  return (
    <div className={cn("flex justify-center items-end bg-white rounded-xl p-4 shadow-xl border border-border/50", className)}>
      <Item value={timeLeft.days} label="Giorni" />
      <span className="text-2xl font-bold mb-6 text-gray-400">:</span>
      <Item value={timeLeft.hours} label="Ore" />
      <span className="text-2xl font-bold mb-6 text-gray-400">:</span>
      <Item value={timeLeft.minutes} label="Min" />
      <span className="text-2xl font-bold mb-6 text-gray-400">:</span>
      <Item value={timeLeft.seconds} label="Sec" />
    </div>
  );
};
