import React, { useEffect } from 'react';
import { Sun, Moon, Headphones, BarChart3, Home, BookOpen } from 'lucide-react';
import useStore from '../store/useStore';

export default function Layout({ children }) {
  const { darkMode, toggleDarkMode, activeView, setActiveView, currentBook } = useStore();

  // Apply theme to body
  useEffect(() => {
    document.body.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary-500/30">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b border-white/5 bg-surface-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-surface-900/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setActiveView('home')}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all duration-300">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-slate-100 leading-none">
                Audiolize
              </h1>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveView('home')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300
                ${activeView === 'home' 
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>

            {currentBook && (
              <button
                onClick={() => setActiveView('reader')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300
                  ${activeView === 'reader' 
                    ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Reader</span>
              </button>
            )}

            <button
              onClick={() => setActiveView('stats')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300
                ${activeView === 'stats' 
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-all ml-2"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-white/5 bg-surface-950/50">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} Audiolize. Transform your reading experience.
        </p>
      </footer>
    </div>
  );
}
