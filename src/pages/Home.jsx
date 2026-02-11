import React, { useCallback, useState } from 'react';
import { Sparkles, BookOpen, Headphones, Zap, Shield, Clock } from 'lucide-react';
import UploadZone from '../components/UploadZone';
import Library from '../components/Library';
import useStore from '../store/useStore';
import usePDFParser from '../hooks/usePDFParser';
import axios from 'axios';

export default function Home() {
  const {
    setCurrentBook, setActiveView, addBook,
    setIsUploading, setUploadProgress, setCurrentPage, resetPlayer
  } = useStore();
  const { parsePDF } = usePDFParser();
  const [error, setError] = useState('');

  const handleFileSelect = useCallback(async (file) => {
    setError('');
    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Upload to backend
      const formData = new FormData();
      formData.append('pdf', file);

      setUploadProgress(30);
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded / e.total) * 50) + 20;
          setUploadProgress(pct);
        }
      });

      setUploadProgress(80);

      if (data.success) {
        const book = data.book;
        addBook(book);
        setCurrentBook(book);
        resetPlayer();
        setCurrentPage(0);
        setUploadProgress(100);

        // Navigate to reader
        setTimeout(() => {
          setActiveView('reader');
          setIsUploading(false);
        }, 500);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.error || 'Failed to upload PDF. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [setCurrentBook, setActiveView, addBook, setIsUploading, setUploadProgress, setCurrentPage, resetPlayer, parsePDF]);

  const handleSelectBook = useCallback(async (book) => {
    try {
      // Fetch full book data
      const { data } = await axios.get(`/api/library/${book._id}`);
      if (data.success) {
        setCurrentBook(data.book);
        resetPlayer();
        setCurrentPage(0);

        // Load saved progress
        try {
          const { data: progData } = await axios.get(`/api/progress/${book._id}`);
          if (progData.success && progData.progress) {
            setCurrentPage(progData.progress.currentPage || 0);
          }
        } catch (e) {
          // No progress saved yet
        }

        setActiveView('reader');
      }
    } catch (err) {
      console.error('Failed to load book:', err);
    }
  }, [setCurrentBook, setActiveView, resetPlayer, setCurrentPage]);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <div className="text-center pt-8 pb-4 relative z-10">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 tracking-tight text-slate-100 leading-[1.1]">
          Turn any PDF into an <br className="hidden sm:block" />
          <span className="gradient-text">audiobook instantly</span>
        </h1>

        <p className="text-slate-400 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed mb-10">
          Experience your documents like never before. Advanced text-to-speech, 
          smart parsing, and a premium listening experience—all in your browser.
        </p>

        {/* Upload Zone */}
        <UploadZone onFileSelect={handleFileSelect} />

        {/* Error message */}
        {error && (
          <div className="max-w-xl mx-auto mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}
      </div>

      {/* Feature Grid - Bento Style */}
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center mb-10">
           <div className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-300 text-xs font-semibold mb-3 tracking-wide uppercase border border-primary-500/20">
              Features
           </div>
           <h2 className="text-3xl font-bold text-slate-100">Everything you need to listen</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Large Card 1 */}
          <div className="md:col-span-2 glass glass-hover rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300">
               <Headphones className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Background Playback</h3>
              <p className="text-slate-400 leading-relaxed">Listen with your screen off or while using other apps. Audio keeps playing with full Media Session controls on your lock screen.</p>
            </div>
          </div>

          {/* Standard Card */}
          <div className="glass glass-hover rounded-3xl p-8 flex flex-col gap-4 group">
             <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-300">
               <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">Smart Cleaning</h3>
              <p className="text-slate-400 text-sm">Automatically removes page numbers, headers, and footers.</p>
            </div>
          </div>

           {/* Standard Card */}
          <div className="glass glass-hover rounded-3xl p-8 flex flex-col gap-4 group">
             <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform duration-300">
               <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">Bookmarks</h3>
              <p className="text-slate-400 text-sm">Save your exact position and return to it anytime.</p>
            </div>
          </div>

          {/* Large Card 2 */}
          <div className="md:col-span-2 glass glass-hover rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 group">
             <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
               <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Natural Voices & Speed</h3>
              <p className="text-slate-400 leading-relaxed">Choose from premium system voices and adjust playback speed from 0.5x to 2.5x to match your listening preference.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-4xl mx-auto py-8">
        <h2 className="text-2xl font-bold text-slate-100 text-center mb-12">Three simple steps</h2>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary-500/30 via-indigo-500/30 to-purple-500/30 -z-10" />

          {[
            { step: '1', title: 'Upload PDF', desc: 'Drag & drop any document', color: 'bg-primary-500' },
            { step: '2', title: 'Processing', desc: 'We extract and clean text', color: 'bg-indigo-500' },
            { step: '3', title: 'Listen', desc: 'Enjoy your audiobook', color: 'bg-purple-500' }
          ].map(({ step, title, desc, color }, i) => (
            <div key={step} className="flex flex-col items-center text-center group">
              <div className={`w-12 h-12 rounded-full ${color} shadow-lg shadow-${color}/30 flex items-center justify-center text-white font-bold text-lg mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                {step}
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">{title}</h3>
              <p className="text-slate-400 text-sm max-w-[150px]">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Library Section */}
      <div className="max-w-6xl mx-auto">
         <div className="flex items-center justify-between mb-6 px-4">
            <h2 className="text-2xl font-bold text-slate-100">Your Library</h2>
         </div>
         <Library onSelectBook={handleSelectBook} />
      </div>
    </div>
  );
}
