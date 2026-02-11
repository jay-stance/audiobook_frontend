import React from 'react';
import { Bookmark, Trash2, X, MapPin } from 'lucide-react';
import useStore from '../store/useStore';

export default function BookmarkPanel({ tts, onClose }) {
  const { bookmarks, removeBookmark } = useStore();

  const handleJump = (bookmark) => {
    tts?.jumpToSentence(bookmark.position);
  };

  return (
    <div className="glass rounded-2xl p-5 slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-primary-400" />
          <h3 className="font-semibold">Bookmarks</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300">
            {bookmarks.length}
          </span>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10">
          <X className="w-4 h-4" />
        </button>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No bookmarks yet</p>
          <p className="text-xs mt-1">Tap the bookmark icon while listening to save your position</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[40vh] overflow-y-auto">
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
              onClick={() => handleJump(bm)}
            >
              <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  Page {bm.page + 1} · {bm.snippet}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(bm.createdAt).toLocaleDateString()} at{' '}
                  {new Date(bm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeBookmark(bm.id); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100
                  hover:bg-red-500/20 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
