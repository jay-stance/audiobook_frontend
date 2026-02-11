import React, { useMemo, useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Gauge, BookmarkPlus,
  Timer, Mic2, BookOpen, ChevronDown, ChevronUp,
  RotateCcw, RotateCw, Eye, EyeOff, Bookmark
} from 'lucide-react';
import useStore from '../store/useStore';

export default function AudioPlayer({ tts, currentText, onToggleSleepTimer, onToggleVoice, onBookmark }) {
  const {
    isPlaying, currentBook, playbackSpeed, setPlaybackSpeed,
    currentSentenceIndex, totalSentences, volume, setVolume,
    currentPage, totalPages, bookmarks, addBookmark,
    showTextViewer, setShowTextViewer,
    showBookmarks, setShowBookmarks
  } = useStore();

  const [showSecondary, setShowSecondary] = useState(false);

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
    if (onBookmark) {
      onBookmark();
      return;
    }
    // Fallback if no prop provided (though Reader always provides it)
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
    <div className="audio-player-container slide-up">
      {/* Book Cover + Info */}
      <div className="player-book-info">
        <div
          className="player-cover"
          style={{
            background: `linear-gradient(135deg, ${currentBook.coverColor}, ${currentBook.coverColor}88)`
          }}
        >
          <BookOpen className="w-8 h-8 text-white/90" />
        </div>
        <div className="player-meta">
          <h3 className="player-title">{currentBook.title}</h3>
          <p className="player-author">{currentBook.author}</p>
          <p className="player-page-info">
            Page {currentPage + 1} of {currentBook.totalPages}
          </p>
        </div>
      </div>

      {/* Seek Bar */}
      <div className="player-seek">
        <input
          type="range"
          min={0}
          max={Math.max(totalSentences - 1, 0)}
          value={currentSentenceIndex}
          onChange={handleSeek}
          className="player-seek-bar"
          style={{
            background: `linear-gradient(to right, var(--color-primary-500) ${progressPercent}%, rgba(139,92,246,0.15) ${progressPercent}%)`
          }}
        />
        <div className="player-seek-labels">
          <span>{currentSentenceIndex + 1} of {totalSentences}</span>
          <span>{progressPercent}%</span>
        </div>
      </div>

      {/* Primary Controls */}
      <div className="player-primary-controls">
        {/* Skip back 1 sentence */}
        <button
          onClick={() => tts?.skipOneSentenceBackward()}
          className="player-btn player-btn-sm"
          title="Back 1 sentence"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="player-btn-label">1</span>
        </button>

        {/* Skip back 3 sentences */}
        <button
          onClick={() => tts?.skipBackward()}
          className="player-btn player-btn-md"
          title="Back 3 sentences"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* Play / Pause */}
        <button
          onClick={() => tts?.togglePlayPause(currentText)}
          className={`player-btn-play ${isPlaying ? 'playing' : ''}`}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" fill="white" />
          ) : (
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          )}
        </button>

        {/* Skip forward 3 sentences */}
        <button
          onClick={() => tts?.skipForward()}
          className="player-btn player-btn-md"
          title="Forward 3 sentences"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        {/* Skip forward 1 sentence */}
        <button
          onClick={() => tts?.skipOneSentenceForward()}
          className="player-btn player-btn-sm"
          title="Forward 1 sentence"
        >
          <RotateCw className="w-4 h-4" />
          <span className="player-btn-label">1</span>
        </button>
      </div>

      {/* Action Row — Prominent quick actions */}
      <div className="player-action-row">
        <button
          onClick={handleBookmark}
          className="player-action-btn"
          title="Add bookmark"
        >
          <BookmarkPlus className="w-4.5 h-4.5" />
          <span>Bookmark</span>
        </button>

        <button
          onClick={() => setShowBookmarks(!showBookmarks)}
          className={`player-action-btn ${showBookmarks ? 'active' : ''}`}
          title="View bookmarks"
        >
          <Bookmark className="w-4.5 h-4.5" />
          <span>
            Saved
            {bookmarks.length > 0 && ` (${bookmarks.length})`}
          </span>
        </button>

        <button
          onClick={() => setShowTextViewer(!showTextViewer)}
          className={`player-action-btn ${showTextViewer ? 'active' : ''}`}
          title="Toggle text"
        >
          {showTextViewer ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
          <span>{showTextViewer ? 'Hide Text' : 'Show Text'}</span>
        </button>

        <button
          onClick={cycleSpeed}
          className="player-action-btn"
          title="Playback speed"
        >
          <Gauge className="w-4.5 h-4.5" />
          <span>{playbackSpeed}x</span>
        </button>
      </div>

      {/* Secondary Controls Toggle */}
      <button
        onClick={() => setShowSecondary(!showSecondary)}
        className="player-secondary-toggle"
      >
        {showSecondary ? (
          <>
            <ChevronUp className="w-4 h-4" />
            <span>Less options</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            <span>More options</span>
          </>
        )}
      </button>

      {/* Secondary Controls — Expandable */}
      {showSecondary && (
        <div className="player-secondary-controls">
          {/* Volume */}
          <div className="player-secondary-item">
            <button
              onClick={() => setVolume(volume === 0 ? 1 : 0)}
              className="player-secondary-btn"
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-gray-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              <span>Volume</span>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="player-volume-slider"
              style={{
                background: `linear-gradient(to right, var(--color-primary-500) ${volume * 100}%, rgba(139,92,246,0.15) ${volume * 100}%)`
              }}
            />
          </div>

          {/* Voice selection */}
          <button
            onClick={onToggleVoice}
            className="player-secondary-btn"
          >
            <Mic2 className="w-4 h-4" />
            <span>Voice</span>
          </button>

          {/* Sleep timer */}
          <button
            onClick={onToggleSleepTimer}
            className="player-secondary-btn"
          >
            <Timer className="w-4 h-4" />
            <span>Sleep Timer</span>
          </button>
        </div>
      )}
    </div>
  );
}
