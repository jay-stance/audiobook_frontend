import React, { useState, useEffect, useCallback } from 'react';
import { Mic2, X, Play, Check } from 'lucide-react';
import useStore from '../store/useStore';

export default function VoiceSelector({ onClose }) {
  const { selectedVoice, setSelectedVoice } = useStore();
  const [voices, setVoices] = useState([]);
  const [previewVoice, setPreviewVoice] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const previewPlay = useCallback((voice) => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance('Hello! This is how I sound when reading your book.');
    utt.voice = voice;
    utt.rate = 1;
    window.speechSynthesis.speak(utt);
    setPreviewVoice(voice.name);
    utt.onend = () => setPreviewVoice(null);
  }, []);

  // Group voices by language
  const grouped = voices.reduce((acc, voice) => {
    const lang = voice.lang.split('-')[0].toUpperCase();
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(voice);
    return acc;
  }, {});

  const filteredGroups = Object.entries(grouped).filter(([lang, vcs]) => {
    if (!filter) return true;
    const lc = filter.toLowerCase();
    return lang.toLowerCase().includes(lc) ||
      vcs.some(v => v.name.toLowerCase().includes(lc));
  });

  return (
    <div className="glass rounded-2xl p-5 slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mic2 className="w-5 h-5 text-primary-400" />
          <h3 className="font-semibold">Voice Selection</h3>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search voices..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 mb-4 text-sm
          focus:outline-none focus:border-primary-500/50 transition-all placeholder-gray-500"
      />

      <div className="max-h-[40vh] overflow-y-auto space-y-4">
        {filteredGroups.map(([lang, vcs]) => (
          <div key={lang}>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {lang}
            </h4>
            <div className="space-y-1">
              {vcs.map((voice) => (
                <div
                  key={voice.name}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all
                    ${selectedVoice === voice.name ? 'bg-primary-500/20 border border-primary-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                  onClick={() => setSelectedVoice(voice.name)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{voice.name}</p>
                    <p className="text-xs text-gray-400">{voice.lang} {voice.localService ? '· Local' : '· Network'}</p>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); previewPlay(voice); }}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-all shrink-0"
                  >
                    {previewVoice === voice.name ? (
                      <div className="w-3 h-3 rounded-full gradient-bg animate-pulse" />
                    ) : (
                      <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
                    )}
                  </button>

                  {selectedVoice === voice.name && (
                    <Check className="w-4 h-4 text-primary-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
