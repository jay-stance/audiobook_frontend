import { useState, useCallback, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Text cleaning utilities
 */
function cleanText(rawText) {
  if (!rawText) return '';
  let text = rawText;
  // Remove form feeds
  text = text.replace(/\f/g, '\n');
  // Remove page number patterns
  text = text.replace(/page\s+\d+\s+of\s+\d+/gi, '');
  text = text.replace(/\n\s*-\s*\d+\s*-\s*\n/g, '\n');
  text = text.replace(/\n\s*\d{1,4}\s*\n/g, '\n');
  // Reconnect hyphenated words across lines
  text = text.replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2');
  // Normalize whitespace
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.split('\n').map(l => l.trim()).join('\n').trim();
  return text;
}

function removeRepeatedLines(text) {
  const lines = text.split('\n');
  const counts = {};
  lines.forEach(line => {
    const t = line.trim();
    if (t.length > 3 && t.length < 100) {
      counts[t] = (counts[t] || 0) + 1;
    }
  });
  return lines.filter(l => {
    const t = l.trim();
    return !(counts[t] && counts[t] > 3);
  }).join('\n');
}

export function usePDFParser() {
  const [pages, setPages] = useState([]);
  const [fullText, setFullText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef(false);

  const parsePDF = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    abortRef.current = false;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const extractedPages = [];
      let allText = '';

      for (let i = 1; i <= numPages; i++) {
        if (abortRef.current) break;

        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        let pageText = '';
        let lastY = null;
        for (const item of textContent.items) {
          if (lastY !== null && Math.abs(lastY - item.transform[5]) > 5) {
            pageText += '\n';
          }
          pageText += item.str;
          lastY = item.transform[5];
        }

        const cleaned = cleanText(pageText);
        extractedPages.push({
          pageNumber: i,
          text: cleaned
        });
        allText += cleaned + '\n\n';

        setProgress(Math.round((i / numPages) * 100));
      }

      const finalText = removeRepeatedLines(cleanText(allText));
      setPages(extractedPages);
      setFullText(finalText);
      setIsLoading(false);

      return { pages: extractedPages, fullText: finalText, numPages };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { parsePDF, pages, fullText, isLoading, error, progress, abort };
}

export default usePDFParser;
