import React, { useState, useEffect, useMemo } from 'react';
import { Timer, X, Check } from 'lucide-react';
import useStore from '../store/useStore';

export default function SleepTimer({ onClose }) {
  const { sleepTimerEnd, sleepTimerActive, setSleepTimer, clearSleepTimer } = useStore();
  const [timeRemaining, setTimeRemaining] = useState(null);

  const options = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
    { label: '90 min', value: 90 }
  ];

  // Countdown
  useEffect(() => {
    if (!sleepTimerActive || !sleepTimerEnd) {
      setTimeRemaining(null);
      return;
    }
    const interval = setInterval(() => {
      const remaining = Math.max(0, sleepTimerEnd - Date.now());
      setTimeRemaining(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerActive, sleepTimerEnd]);

  const formatTime = (ms) => {
    if (!ms) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass rounded-2xl p-5 slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-primary-400" />
          <h3 className="font-semibold">Sleep Timer</h3>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10">
          <X className="w-4 h-4" />
        </button>
      </div>

      {sleepTimerActive && timeRemaining !== null ? (
        <div className="text-center py-4">
          {/* Countdown Ring */}
          <div className="relative w-28 h-28 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(139,92,246,0.1)" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="url(#timerGradient)" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - timeRemaining / (useStore.getState().sleepTimerMinutes * 60000))}`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold gradient-text">{formatTime(timeRemaining)}</span>
            </div>
          </div>

          <button
            onClick={() => { clearSleepTimer(); }}
            className="px-6 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-sm font-medium"
          >
            Cancel Timer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {options.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setSleepTimer(value)}
              className="px-4 py-3 rounded-xl hover:bg-primary-500/20 transition-all text-sm font-medium
                border border-white/5 hover:border-primary-500/30"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setSleepTimer(120)}
            className="px-4 py-3 rounded-xl hover:bg-primary-500/20 transition-all text-sm font-medium
              border border-white/5 hover:border-primary-500/30"
          >
            2 hrs
          </button>
        </div>
      )}
    </div>
  );
}
