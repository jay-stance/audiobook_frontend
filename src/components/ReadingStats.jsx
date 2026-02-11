import React, { useMemo } from 'react';
import { BarChart3, Clock, BookOpen, Flame, Headphones } from 'lucide-react';
import useStore from '../store/useStore';

export default function ReadingStats() {
  const { totalListeningTime, books, bookmarks, stats } = useStore();

  const formattedTime = useMemo(() => {
    const hours = Math.floor(totalListeningTime / 3600);
    const minutes = Math.floor((totalListeningTime % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, [totalListeningTime]);

  const statCards = [
    {
      icon: Clock,
      label: 'Listening Time',
      value: formattedTime,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.15)'
    },
    {
      icon: BookOpen,
      label: 'Books Uploaded',
      value: books.length.toString(),
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.15)'
    },
    {
      icon: Headphones,
      label: 'Bookmarks',
      value: bookmarks.length.toString(),
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.15)'
    },
    {
      icon: Flame,
      label: 'Daily Streak',
      value: `${stats.dailyStreak || 0} days`,
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.15)'
    }
  ];

  return (
    <div className="slide-up">
      <h2 className="text-2xl font-bold mb-6">
        <span className="gradient-text">Your Stats</span>
      </h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map(({ icon: Icon, label, value, color, bgColor }) => (
          <div key={label} className="glass rounded-2xl p-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: bgColor }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Activity visualization */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary-400" />
          Recent Activity
        </h3>

        <div className="flex items-end gap-1 h-24">
          {Array.from({ length: 7 }, (_, i) => {
            const height = Math.random() * 80 + 20;
            const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(to top, rgba(139,92,246,0.3), rgba(139,92,246,${0.4 + (height / 200)}))`
                  }}
                />
                <span className="text-[10px] text-gray-500">{dayLabels[i]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
