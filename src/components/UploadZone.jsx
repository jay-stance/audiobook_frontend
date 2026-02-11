import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import useStore from '../store/useStore';

export default function UploadZone({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);
  const { isUploading, uploadProgress } = useStore();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setFileName(files[0].name);
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="w-full max-w-2xl mx-auto relative group">
      {/* Glow effect behind */}
      <div 
        className={`absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-3xl opacity-20 blur transition duration-1000 group-hover:opacity-40 group-hover:duration-200
        ${isDragging ? 'opacity-60 blur-md' : ''}`}
      />
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative overflow-hidden rounded-3xl cursor-pointer
          glass transition-all duration-500 ease-out
          ${isDragging ? 'scale-[1.02] bg-surface-800/80' : 'bg-surface-900/40 hover:bg-surface-800/40'}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        style={{ minHeight: '240px' }}
      >
        <div className="relative flex flex-col items-center justify-center p-8 text-center h-full min-h-[240px]">
          {isUploading ? (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full" />
                <Loader2 className="w-12 h-12 text-primary-400 animate-spin relative z-10" />
              </div>
              <p className="text-lg font-medium text-slate-200 mb-2">Processing your audiobook...</p>
              <p className="text-sm text-slate-400 mb-6">Analyzing structure and preparing voice engine</p>
              
              <div className="w-64 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : fileName && uploadProgress === 100 ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 ring-1 ring-green-500/20">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-xl font-semibold text-slate-200">{fileName}</p>
              <p className="text-sm text-slate-400 mt-2">Ready to read</p>
            </div>
          ) : (
            <>
              <div className={`
                mb-6 w-20 h-20 rounded-2xl bg-surface-800/50 flex items-center justify-center
                ring-1 ring-white/10 shadow-xl transition-all duration-500
                ${isDragging ? 'scale-110 shadow-primary-500/20 ring-primary-500/30' : 'group-hover:scale-110 group-hover:shadow-primary-500/10'}
              `}>
                <Upload className={`w-8 h-8 transition-colors duration-300 ${isDragging ? 'text-primary-400' : 'text-slate-400 group-hover:text-primary-400'}`} />
              </div>
              
              <h3 className="text-2xl font-bold mb-3 text-slate-100">
                Drop your PDF here
              </h3>
              <p className="text-slate-400 mb-6 max-w-sm text-base leading-relaxed">
                Seamlessly convert your documents into immersive audiobooks. 
                <span className="block mt-1 text-slate-500 text-sm">Supports files up to 50MB</span>
              </p>
              
              <div className="flex items-center gap-3">
                 <button className="px-5 py-2.5 rounded-full bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-all shadow-lg shadow-primary-900/20">
                    Browse Files
                 </button>
              </div>
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
