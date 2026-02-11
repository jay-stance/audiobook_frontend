import React, { useMemo } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Gauge, BookmarkPlus,
  Moon, Timer, Mic2, ChevronDown, ChevronUp,
  BookOpen
} from 'lucide-react';
import useStore from '../store/useStore';

export default function AudioPlayer({ tts, currentText, onToggleText, onToggleBookmarks, onToggleSleepTimer, onToggleVoice }) {
  const {
    isPlaying, currentBook, playbackSpeed, setPlaybackSpeed,
    currentSentenceIndex, totalSentences, volume, setVolume,
    currentPage, totalPages, bookmarks, addBookmark
  } = useStore();

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  const cycleSpeed = () => {
    const currentIdx = speeds.indexOf(playbackSpeed);
    const nextIdx = (currentIdx + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const progressPercent = useMemo(() => {
    if (totalSentences === 0) return 0;
    return Math.round((currentSentenceIndex / totalSentences) * 100);
  }, [currentSentenceIndex, totalSentences]);

  const handleBookmark = () => {
    addBookmark({
      page: currentPage,
      position: currentSentenceIndex,
      snippet: `Sentence ${currentSentenceIndex + 1}`,
      note: ''
    });
  };

  const handleSeek = (e) => {
    const val = parseInt(e.target.value);
    tts?.jumpToSentence(val);
  };

  if (!currentBook) return null;

  return (
    <div className="glass rounded-2xl p-5 slide-up">
      {/* Book Info */}
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(135deg, ${currentBook.coverColor}, ${currentBook.coverColor}88)`
          }}
        >
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-base truncate">{currentBook.title}</h3>
          <p className="text-sm text-gray-400 truncate">{currentBook.author}</p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 font-medium whitespace-nowrap">
          {progressPercent}%
        </span>
      </div>

      {/* Seek Bar */}
      <div className="mb-4">
        <input
          type="range"
          min={0}
          max={Math.max(totalSentences - 1, 0)}
          value={currentSentenceIndex}
          onChange={handleSeek}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #8b5cf6 ${progressPercent}%, rgba(139,92,246,0.15) ${progressPercent}%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Sentence {currentSentenceIndex + 1}</span>
          <span>{totalSentences} total</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4 mb-5">
        <button
          onClick={() => tts?.skipBackward()}
          className="w-11 h-11 rounded-full flex items-center justify-center
            hover:bg-white/10 transition-all duration-200 active:scale-95"
          title="Skip back"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={() => tts?.togglePlayPause(currentText)}
          className={`w-16 h-16 rounded-full flex items-center justify-center
            transition-all duration-200 active:scale-95
            ${isPlaying ? 'gradient-bg glow-purple' : 'bg-primary-600 hover:bg-primary-500 glow-purple'}`}
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 text-white" fill="white" />
          ) : (
            <Play className="w-7 h-7 text-white ml-1" fill="white" />
          )}
        </button>

        <button
          onClick={() => tts?.skipForward()}
          className="w-11 h-11 rounded-full flex items-center justify-center
            hover:bg-white/10 transition-all duration-200 active:scale-95"
          title="Skip forward"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={cycleSpeed}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl
            hover:bg-white/10 transition-all text-sm font-semibold"
          title="Playback speed"
        >
          <Gauge className="w-4 h-4 text-primary-400" />
          <span>{playbackSpeed}x</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={handleBookmark}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all"
            title="Add bookmark"
          >
            <BookmarkPlus className="w-4 h-4 text-primary-400" />
          </button>

          <button
            onClick={onToggleBookmarks}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all relative"
            title="View bookmarks"
          >
            <BookOpen className="w-4 h-4 text-primary-400" />
            {bookmarks.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent-500 text-[10px] font-bold flex items-center justify-center text-white">
                {bookmarks.length}
              </span>
            )}
          </button>

          <button
            onClick={onToggleSleepTimer}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all"
            title="Sleep timer"
          >
            <Timer className="w-4 h-4 text-primary-400" />
          </button>

          <button
            onClick={onToggleVoice}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all"
            title="Select voice"
          >
            <Mic2 className="w-4 h-4 text-primary-400" />
          </button>

          <button
            onClick={onToggleText}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all"
            title="Toggle text view"
          >
            <BookOpen className="w-4 h-4 text-accent-400" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVolume(volume === 0 ? 1 : 0)}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all"
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4 text-gray-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-primary-400" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 hidden sm:block"
            style={{
              background: `linear-gradient(to right, #8b5cf6 ${volume * 100}%, rgba(139,92,246,0.15) ${volume * 100}%)`
            }}
          />
        </div>
      </div>
    </div>
  );
}
