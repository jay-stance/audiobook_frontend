import React, { useMemo, useRef, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import useStore from '../store/useStore';

/**
 * Splits text into sentences for highlighting.
 */
function splitSentences(text) {
  if (!text) return [];
  const raw = text.match(/[^.!?]*[.!?]+[\s]*/g) || [text];
  const sentences = [];
  let buffer = '';
  for (const s of raw) {
    buffer += s;
    if (buffer.trim().length > 20) {
      sentences.push(buffer.trim());
      buffer = '';
    }
  }
  if (buffer.trim()) sentences.push(buffer.trim());
  return sentences;
}

export default function TextViewer({ text, selectionRange, setSelectionRange }) {
  const { currentSentenceIndex, showTextViewer } = useStore();
  const containerRef = useRef(null);
  const activeRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const lastClickedRef = useRef(null);

  const sentences = useMemo(() => splitSentences(text), [text]);

  // Auto-scroll to active sentence
  useEffect(() => {
    if (activeRef.current && containerRef.current && !collapsed) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentSentenceIndex, collapsed]);

  const handleSentenceClick = (index, e) => {
    e.stopPropagation(); // Prevent potentially closing things if nested
    
    // Shift + Click for range selection
    if (e.shiftKey && lastClickedRef.current !== null) {
      const start = Math.min(lastClickedRef.current, index);
      const end = Math.max(lastClickedRef.current, index);
      setSelectionRange({ start, end });
    } else {
      // Single click - select just this one
      setSelectionRange({ start: index, end: index });
      lastClickedRef.current = index;
    }
  };

  if (!showTextViewer || !text) return null;

  return (
    <div className="glass rounded-2xl overflow-hidden slide-up">
      <div
        className="text-viewer-header"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-primary-400">Reading Along</h3>
          <span className="text-xs text-gray-500">
            {currentSentenceIndex + 1} / {sentences.length}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-300 transition-colors">
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div
          ref={containerRef}
          className="p-5 max-h-[50vh] overflow-y-auto text-base leading-relaxed"
          style={{ fontFamily: '"Inter", Georgia, serif' }}
        >
          {sentences.map((sentence, idx) => {
            const isSelected = selectionRange && idx >= Math.min(selectionRange.start, selectionRange.end) && idx <= Math.max(selectionRange.start, selectionRange.end);
            const isActive = idx === currentSentenceIndex;
            
            return (
              <span
                key={idx}
                ref={isActive ? activeRef : null}
                onClick={(e) => handleSentenceClick(idx, e)}
                className={`
                  inline transition-all duration-200 cursor-pointer rounded px-0.5
                  ${isActive ? 'sentence-active font-medium' : 'text-gray-500 hover:text-gray-300'}
                  ${isSelected ? 'bg-primary-500/20 text-primary-200' : ''}
                `}
              >
                {sentence}{' '}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
