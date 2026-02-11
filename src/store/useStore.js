import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // ─── Book State ───
      currentBook: null,
      books: [],
      setCurrentBook: (book) => set({ currentBook: book }),
      setBooks: (books) => set({ books }),
      addBook: (book) => set((state) => ({ books: [book, ...state.books] })),
      removeBook: (id) => set((state) => ({
        books: state.books.filter(b => b._id !== id),
        currentBook: state.currentBook?._id === id ? null : state.currentBook
      })),

      // ─── Playback State ───
      isPlaying: false,
      playbackSpeed: 1.0,
      currentPage: 0,
      currentPosition: 0, // character position in text
      currentSentenceIndex: 0,
      totalSentences: 0,
      selectedVoice: null,
      volume: 1.0,
      setIsPlaying: (val) => set({ isPlaying: val }),
      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setCurrentPosition: (pos) => set({ currentPosition: pos }),
      setCurrentSentenceIndex: (idx) => set({ currentSentenceIndex: idx }),
      setTotalSentences: (total) => set({ totalSentences: total }),
      setSelectedVoice: (voice) => set({ selectedVoice: voice }),
      setVolume: (vol) => set({ volume: vol }),

      // ─── Progress ───
      completionPercentage: 0,
      totalListeningTime: 0, // in seconds
      setCompletionPercentage: (pct) => set({ completionPercentage: pct }),
      incrementListeningTime: (seconds) => set((state) => ({
        totalListeningTime: state.totalListeningTime + seconds
      })),

      // ─── Bookmarks ───
      bookmarks: [],
      setBookmarks: (bookmarks) => set({ bookmarks }),
      addBookmark: (bookmark) => set((state) => ({
        bookmarks: [...state.bookmarks, { ...bookmark, id: Date.now(), createdAt: new Date().toISOString() }]
      })),
      removeBookmark: (id) => set((state) => ({
        bookmarks: state.bookmarks.filter(b => b.id !== id)
      })),

      // ─── Sleep Timer ───
      sleepTimerMinutes: 0,
      sleepTimerEnd: null,
      sleepTimerActive: false,
      setSleepTimer: (minutes) => set({
        sleepTimerMinutes: minutes,
        sleepTimerEnd: minutes > 0 ? Date.now() + minutes * 60 * 1000 : null,
        sleepTimerActive: minutes > 0
      }),
      clearSleepTimer: () => set({
        sleepTimerMinutes: 0,
        sleepTimerEnd: null,
        sleepTimerActive: false
      }),

      // ─── Reading Stats ───
      stats: {
        totalBooks: 0,
        completedBooks: 0,
        totalMinutesListened: 0,
        dailyStreak: 0,
        lastListenedDate: null,
        sessionsThisWeek: []
      },
      updateStats: (updates) => set((state) => ({
        stats: { ...state.stats, ...updates }
      })),

      // ─── UI State ───
      darkMode: true,
      showMiniPlayer: false,
      showTextViewer: true,
      showBookmarks: false,
      showStats: false,
      activeView: 'home', // 'home' | 'reader' | 'stats'
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setShowMiniPlayer: (val) => set({ showMiniPlayer: val }),
      setShowTextViewer: (val) => set({ showTextViewer: val }),
      setShowBookmarks: (val) => set({ showBookmarks: val }),
      setShowStats: (val) => set({ showStats: val }),
      setActiveView: (view) => set({ activeView: view }),

      // ─── Upload State ───
      isUploading: false,
      uploadProgress: 0,
      setIsUploading: (val) => set({ isUploading: val }),
      setUploadProgress: (pct) => set({ uploadProgress: pct }),

      // ─── Reset ───
      resetPlayer: () => set({
        isPlaying: false,
        currentPage: 0,
        currentPosition: 0,
        currentSentenceIndex: 0,
        totalSentences: 0,
        completionPercentage: 0
      })
    }),
    {
      name: 'audiolize-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        playbackSpeed: state.playbackSpeed,
        selectedVoice: state.selectedVoice,
        volume: state.volume,
        bookmarks: state.bookmarks,
        stats: state.stats,
        totalListeningTime: state.totalListeningTime,
        currentBook: state.currentBook ? {
          _id: state.currentBook._id,
          title: state.currentBook.title,
          author: state.currentBook.author,
          coverColor: state.currentBook.coverColor,
          totalPages: state.currentBook.totalPages,
          wordCount: state.currentBook.wordCount,
          estimatedDuration: state.currentBook.estimatedDuration
        } : null,
        currentPage: state.currentPage,
        currentPosition: state.currentPosition,
        currentSentenceIndex: state.currentSentenceIndex,
        completionPercentage: state.completionPercentage
      })
    }
  )
);

export default useStore;
