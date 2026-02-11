import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import useStore from '../store/useStore';

export default function ChapterNav({ pages, onClose }) {
  const { currentPage, setCurrentPage } = useStore();
  const activeBtnRef = React.useRef(null);

  React.useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  }, [currentPage, onClose]);


  if (!pages || pages.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-5 slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Pages</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {currentPage + 1} / {pages.length}
          </span>
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl
            hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed
            border border-white/5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Previous</span>
        </button>
        <button
          onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
          disabled={currentPage === pages.length - 1}
          className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl
            hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed
            border border-white/5"
        >
          <span className="text-sm">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Page grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5 max-h-[30vh] overflow-y-auto">
        {pages.map((_, idx) => (
          <button
            key={idx}
            ref={idx === currentPage ? activeBtnRef : null}
            onClick={() => setCurrentPage(idx)}
            className={`py-2 rounded-lg text-xs font-medium transition-all
              ${idx === currentPage
                ? 'gradient-bg text-white glow-purple scale-110 shadow-lg'
                : 'hover:bg-white/10 border border-white/5 text-gray-400'
              }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
