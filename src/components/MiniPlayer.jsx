import React from 'react';
import { Play, Pause, SkipForward, X } from 'lucide-react';
import useStore from '../store/useStore';

export default function MiniPlayer({ tts }) {
  const { isPlaying, currentBook, currentSentenceIndex, totalSentences, showMiniPlayer, setShowMiniPlayer, setActiveView } = useStore();

  if (!showMiniPlayer || !currentBook) return null;

  const progress = totalSentences > 0 ? (currentSentenceIndex / totalSentences) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom slide-up">
      {/* Progress line */}
      <div className="h-0.5 bg-surface-700">
        <div
          className="h-full gradient-bg transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="glass px-4 py-3 flex items-center gap-3"
        style={{ borderTop: '1px solid rgba(139,92,246,0.15)' }}
      >
        {/* Cover */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${currentBook.coverColor}, ${currentBook.coverColor}88)` }}
          onClick={() => { setActiveView('reader'); setShowMiniPlayer(false); }}
        >
          <span className="text-white text-xs font-bold">
            {currentBook.title.charAt(0)}
          </span>
        </div>

        {/* Info */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => { setActiveView('reader'); setShowMiniPlayer(false); }}
        >
          <p className="text-sm font-semibold truncate">{currentBook.title}</p>
          <p className="text-xs text-gray-400">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => tts?.togglePlayPause()}
            className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" fill="white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
            )}
          </button>

          <button
            onClick={() => tts?.skipForward()}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowMiniPlayer(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
