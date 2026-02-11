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

export default function TextViewer({ text }) {
  const { currentSentenceIndex, showTextViewer } = useStore();
  const containerRef = useRef(null);
  const activeRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);

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
          {sentences.map((sentence, idx) => (
            <span
              key={idx}
              ref={idx === currentSentenceIndex ? activeRef : null}
              className={`
                inline transition-all duration-300 cursor-pointer
                ${idx === currentSentenceIndex
                  ? 'sentence-active font-medium'
                  : idx < currentSentenceIndex
                    ? 'text-gray-500'
                    : ''
                }
              `}
            >
              {sentence}{' '}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
