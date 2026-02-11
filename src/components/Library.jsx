import React, { useEffect, useState } from 'react';
import { BookOpen, Trash2, Clock, FileText, Loader2 } from 'lucide-react';
import useStore from '../store/useStore';
import axios from 'axios';

export default function Library({ onSelectBook }) {
  const { books, setBooks, removeBook } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const { data } = await axios.get('/api/library');
      if (data.success) {
        setBooks(data.books);
      }
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/library/${id}`);
      removeBook(id);
    } catch (err) {
      console.error('Failed to delete book:', err);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (books.length === 0) return null;

  return (
    <div className="slide-up">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary-400" />
        Your Library
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div
            key={book._id}
            onClick={() => onSelectBook(book)}
            className="group relative overflow-hidden rounded-2xl p-5 cursor-pointer glass glass-hover transition-all duration-300"
          >
            {/* Subtle gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative flex gap-5">
              {/* Cover Art */}
              <div
                className="w-16 h-20 rounded-xl shadow-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-primary-500/20"
                style={{
                  background: `linear-gradient(135deg, ${book.coverColor || '#4f46e5'}, ${book.coverColor || '#4f46e5'}88)`
                }}
              >
                <BookOpen className="w-6 h-6 text-white/90" />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <h3 className="font-bold text-slate-100 truncate leading-tight mb-1">{book.title}</h3>
                  <p className="text-xs font-medium text-slate-400 truncate">{book.author || 'Unknown Author'}</p>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-surface-800/50 px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3" />
                    <span>~{book.estimatedDuration || 0}m</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-surface-800/50 px-2 py-1 rounded-md">
                    <FileText className="w-3 h-3" />
                    <span>{book.totalPages || 0}p</span>
                  </div>
                </div>
              </div>

              {/* Delete button (absolute top right) */}
              <button
                onClick={(e) => handleDelete(e, book._id)}
                className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-red-400 text-slate-600"
                title="Delete book"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
             {/* Progress Bar (Mock) */}
             <div className="mt-4 w-full h-1 bg-surface-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full opacity-50" 
                  style={{ width: `${Math.random() * 40 + 10}%` }}
                />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
