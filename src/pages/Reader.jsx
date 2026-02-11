import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ArrowLeft, BookOpen, Download, FileText } from 'lucide-react';
import AudioPlayer from '../components/AudioPlayer';
import TextViewer from '../components/TextViewer';
import ChapterNav from '../components/ChapterNav';
import SleepTimer from '../components/SleepTimer';
import BookmarkPanel from '../components/BookmarkPanel';
import VoiceSelector from '../components/VoiceSelector';
import useTTS from '../hooks/useTTS';
import useMediaSession from '../hooks/useMediaSession';
import useStore from '../store/useStore';
import api from '../lib/api';

export default function Reader() {
  const {
    currentBook, currentPage, setCurrentPage, setActiveView, setShowMiniPlayer,
    showTextViewer, setShowTextViewer,
    showBookmarks, setShowBookmarks,
    currentSentenceIndex, totalSentences,
    setCurrentBook
  } = useStore();
  const tts = useTTS();
  useMediaSession(tts);

  const [showSleepTimer, setShowSleepTimerLocal] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [selectionRange, setSelectionRange] = useState(null);
  const autoPlayNextRef = useRef(false);

  // Current page text
  const currentText = useMemo(() => {
    if (!currentBook) return '';
    if (currentBook.pages && currentBook.pages.length > 0) {
      const page = currentBook.pages[currentPage];
      return page?.text || '';
    }
    return currentBook.cleanedText || '';
  }, [currentBook, currentPage]);

  // Re-fetch full book data if we only have persisted metadata
  useEffect(() => {
    if (currentBook?._id && !currentBook.pages && !currentBook.cleanedText) {
      api.get(`/api/library/${currentBook._id}`)
        .then(({ data }) => {
          if (data.success && data.book) {
            setCurrentBook(data.book);
          }
        })
        .catch((err) => console.error('Failed to reload book data:', err));
    }
  }, [currentBook?._id]);

  // Toggle bookmark for current sentence or selected range
  const handleBookmark = () => {
    if (!currentText) return;
    
    // If we have a multi-sentence selection, bookmark that range
    if (selectionRange) {
      const sentences = currentText.match(/[^.!?]*[.!?]+[\s]*/g) || [currentText];
      // Filter logic matches TextViewer
      const splitSentences = [];
      let buffer = '';
      for (const s of sentences) {
        buffer += s;
        if (buffer.trim().length > 20) {
          splitSentences.push(buffer.trim());
          buffer = '';
        }
      }
      if (buffer.trim()) splitSentences.push(buffer.trim());

      // Ensure range is valid
      const start = Math.min(selectionRange.start, selectionRange.end);
      const end = Math.max(selectionRange.start, selectionRange.end);

      const selectedText = splitSentences
        .slice(start, end + 1)
        .join(' ');

      const bookmark = {
        bookId: currentBook._id,
        text: selectedText,
        pageIndex: currentPage,
        sentenceIndex: start, 
        timestamp: Date.now()
      };
      
      useStore.getState().addBookmark(bookmark);
      setSelectionRange(null); // Clear selection after bookmarking
      return;
    }

    // Default: Bookmark current playing sentence
    const sentences = currentText.match(/[^.!?]*[.!?]+[\s]*/g) || [currentText];
    const splitSentences = [];
    let buffer = '';
    for (const s of sentences) {
      buffer += s;
      if (buffer.trim().length > 20) {
        splitSentences.push(buffer.trim());
        buffer = '';
      }
    }
    if (buffer.trim()) splitSentences.push(buffer.trim());

    const text = splitSentences[currentSentenceIndex] || currentText;
    
    const bookmark = {
      bookId: currentBook._id,
      text,
      pageIndex: currentPage,
      sentenceIndex: currentSentenceIndex,
      timestamp: Date.now()
    };
    useStore.getState().addBookmark(bookmark);
  };

  // Load text into TTS when page or book changes — always reset to sentence 0
  useEffect(() => {
    if (currentText) {
      tts.loadText(currentText);
      useStore.getState().setCurrentSentenceIndex(0);
      setSelectionRange(null); // Clear selection on new page

      // If we're auto-advancing from a finished page, start playing
      if (autoPlayNextRef.current) {
        autoPlayNextRef.current = false;
        // Small delay to let loadText settle before playing
        setTimeout(() => {
          tts.play(currentText, 0);
        }, 200);
      }
    }
  }, [currentText]);

  // Auto-skip blank pages
  useEffect(() => {
    if (!currentBook || !currentBook.pages) return;
    const isBlank = !currentText || currentText.trim().length === 0;
    if (isBlank && currentPage < currentBook.totalPages - 1) {
      const timer = setTimeout(() => {
        setCurrentPage(currentPage + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentText, currentPage, currentBook, setCurrentPage]);

  // Auto-advance to next page when TTS finishes
  useEffect(() => {
    tts.setOnPageComplete(() => {
      if (!currentBook || !currentBook.pages) return;
      if (currentPage < currentBook.totalPages - 1) {
        autoPlayNextRef.current = true;
        setCurrentPage(currentPage + 1);
      }
    });
  }, [currentBook, currentPage, setCurrentPage, tts]);

  // Auto-save progress
  useEffect(() => {
    if (!currentBook?._id) return;
    const timer = setTimeout(() => {
      const progress = {
        bookId: currentBook._id,
        currentPage,
        currentPosition: currentSentenceIndex,
        playbackSpeed: useStore.getState().playbackSpeed,
        completionPercentage: totalSentences > 0
          ? Math.round((currentSentenceIndex / totalSentences) * 100)
          : 0,
        totalListeningTime: useStore.getState().totalListeningTime,
        bookmarks: useStore.getState().bookmarks
      };
      api.post('/api/progress', progress).catch(() => {});
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentBook, currentPage, currentSentenceIndex, totalSentences]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          tts.togglePlayPause(currentText);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            tts.skipOneSentenceForward();
          } else {
            tts.skipForward();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            tts.skipOneSentenceBackward();
          } else {
            tts.skipBackward();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          const currentSpeed = useStore.getState().playbackSpeed;
          useStore.getState().setPlaybackSpeed(Math.min(2.0, currentSpeed + 0.25));
          break;
        case 'ArrowDown':
          e.preventDefault();
          const speed = useStore.getState().playbackSpeed;
          useStore.getState().setPlaybackSpeed(Math.max(0.5, speed - 0.25));
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [tts, currentText]);

  const handleBack = () => {
    tts.stop();
    setShowMiniPlayer(true);
    setActiveView('home');
  };

  const handleDownload = async () => {
    try {
      const text = currentBook.cleanedText || currentText;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentBook.title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  if (!currentBook) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">No book selected</p>
        <button
          onClick={() => setActiveView('home')}
          className="mt-4 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-medium"
        >
          Upload a PDF
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm hover:text-primary-400 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChapters(!showChapters)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all
              ${showChapters ? 'bg-primary-500/20 text-primary-300' : 'hover:bg-white/10'}`}
          >
            <FileText className="w-3.5 h-3.5" />
            Pages
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Chapter Navigation */}
      {showChapters && (
        <ChapterNav
          pages={currentBook.pages}
          onClose={() => setShowChapters(false)}
        />
      )}

      {/* Audio Player */}
      <AudioPlayer
        tts={tts}
        currentText={currentText}
        onBookmark={handleBookmark}
        onToggleSleepTimer={() => setShowSleepTimerLocal(!showSleepTimer)}
        onToggleVoice={() => setShowVoice(!showVoice)}
      />

      {/* Panels */}
      {showSleepTimer && <SleepTimer onClose={() => setShowSleepTimerLocal(false)} />}
      {showVoice && <VoiceSelector onClose={() => setShowVoice(false)} />}

      {/* Text Viewer */}
      <TextViewer 
        text={currentText} 
        selectionRange={selectionRange}
        setSelectionRange={setSelectionRange}
      />

      {/* Bookmarks — below text */}
      {showBookmarks && <BookmarkPanel tts={tts} onClose={() => setShowBookmarks(false)} />}

      {/* Keyboard shortcuts hint */}
      <div className="text-center text-xs text-gray-500 hidden sm:block">
        <span className="px-2 py-0.5 rounded bg-white/5 mr-2">Space</span> Play/Pause
        <span className="px-2 py-0.5 rounded bg-white/5 mx-2">←→</span> Skip 3
        <span className="px-2 py-0.5 rounded bg-white/5 mx-2">Shift+←→</span> Skip 1
        <span className="px-2 py-0.5 rounded bg-white/5 mx-2">↑↓</span> Speed
      </div>
    </div>
  );
}
