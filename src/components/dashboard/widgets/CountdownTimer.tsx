import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  label: string;
  targetDate: Date;
}

export const CountdownTimer = ({ label, targetDate }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-2xl border border-white/10 w-full">
      <h3 className="text-yellow-400 font-bold tracking-widest uppercase text-sm mb-4">{label}</h3>
      <div className="flex gap-4 text-center">
        {[
          { value: timeLeft.hours, label: 'ore' },
          { value: timeLeft.minutes, label: 'min' },
          { value: timeLeft.seconds, label: 'sec' }
        ].map((item, i) => (
          <div key={i} className="flex flex-col">
            <span className="text-4xl font-mono font-bold bg-white/10 rounded-lg p-3 min-w-[3.5rem] backdrop-blur-sm border border-white/5">
              {formatNumber(item.value)}
            </span>
            <span className="text-xs text-slate-400 mt-2 uppercase">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
