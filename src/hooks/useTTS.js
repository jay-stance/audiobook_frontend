import { useCallback, useRef, useEffect } from 'react';
import useStore from '../store/useStore';

/**
 * Split text into sentences for TTS utterance chunking.
 */
function splitIntoSentences(text) {
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

export function useTTS() {
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const sentencesRef = useRef([]);
  const currentIndexRef = useRef(0);
  const isActiveRef = useRef(false);
  const listenerTimerRef = useRef(null);
  const onPageCompleteRef = useRef(null);

  const {
    isPlaying, setIsPlaying,
    playbackSpeed,
    currentSentenceIndex, setCurrentSentenceIndex,
    setTotalSentences,
    selectedVoice,
    volume,
    incrementListeningTime,
    sleepTimerEnd, sleepTimerActive, clearSleepTimer
  } = useStore();

  // Track listening time
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        incrementListeningTime(1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, incrementListeningTime]);

  // Sleep timer check
  useEffect(() => {
    if (!sleepTimerActive || !sleepTimerEnd) return;
    const check = setInterval(() => {
      if (Date.now() >= sleepTimerEnd) {
        stop();
        clearSleepTimer();
      }
    }, 1000);
    return () => clearInterval(check);
  }, [sleepTimerActive, sleepTimerEnd, clearSleepTimer]);

  const getVoice = useCallback(() => {
    const voices = synthRef.current.getVoices();
    if (selectedVoice) {
      const found = voices.find(v => v.name === selectedVoice);
      if (found) return found;
    }
    return voices.find(v => v.lang.startsWith('en') && v.localService) ||
           voices.find(v => v.lang.startsWith('en')) ||
           voices[0];
  }, [selectedVoice]);

  const speakSentence = useCallback((index) => {
    if (index >= sentencesRef.current.length) {
      setIsPlaying(false);
      isActiveRef.current = false;
      // Fire page-complete callback so Reader can auto-advance
      if (onPageCompleteRef.current) {
        onPageCompleteRef.current();
      }
      return;
    }

    const synth = synthRef.current;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(sentencesRef.current[index]);
    utterance.rate = playbackSpeed;
    utterance.volume = volume;
    utterance.pitch = 1;

    const voice = getVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      if (!isActiveRef.current) return;
      currentIndexRef.current = index + 1;
      setCurrentSentenceIndex(index + 1);
      speakSentence(index + 1);
    };

    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      console.error('TTS error:', e);
    };

    utteranceRef.current = utterance;
    currentIndexRef.current = index;
    setCurrentSentenceIndex(index);
    synth.speak(utterance);

    clearInterval(listenerTimerRef.current);
    listenerTimerRef.current = setInterval(() => {
      if (synth.speaking && !synth.paused) {
        synth.pause();
        synth.resume();
      }
    }, 10000);
  }, [playbackSpeed, volume, getVoice, setIsPlaying, setCurrentSentenceIndex]);

  const loadText = useCallback((text) => {
    const sentences = splitIntoSentences(text);
    sentencesRef.current = sentences;
    setTotalSentences(sentences.length);
    return sentences;
  }, [setTotalSentences]);

  const play = useCallback((text, startIndex = 0) => {
    if (text) {
      loadText(text);
    }
    isActiveRef.current = true;
    setIsPlaying(true);
    speakSentence(startIndex);
  }, [loadText, setIsPlaying, speakSentence]);

  const pause = useCallback(() => {
    synthRef.current.pause();
    isActiveRef.current = false;
    setIsPlaying(false);
    clearInterval(listenerTimerRef.current);
  }, [setIsPlaying]);

  const resume = useCallback(() => {
    if (synthRef.current.paused) {
      synthRef.current.resume();
      isActiveRef.current = true;
      setIsPlaying(true);
      clearInterval(listenerTimerRef.current);
      listenerTimerRef.current = setInterval(() => {
        if (synthRef.current.speaking && !synthRef.current.paused) {
          synthRef.current.pause();
          synthRef.current.resume();
        }
      }, 10000);
    } else {
      play(null, currentIndexRef.current);
    }
  }, [setIsPlaying, play]);

  const stop = useCallback(() => {
    synthRef.current.cancel();
    isActiveRef.current = false;
    setIsPlaying(false);
    clearInterval(listenerTimerRef.current);
  }, [setIsPlaying]);

  const togglePlayPause = useCallback((text) => {
    if (isPlaying) {
      pause();
    } else {
      if (synthRef.current.paused) {
        resume();
      } else {
        play(text, currentIndexRef.current);
      }
    }
  }, [isPlaying, pause, resume, play]);

  // Skip ±3 sentences (existing behavior)
  const skipForward = useCallback(() => {
    const nextIndex = Math.min(currentIndexRef.current + 3, sentencesRef.current.length - 1);
    if (isActiveRef.current || isPlaying) {
      stop();
      play(null, nextIndex);
    } else {
      currentIndexRef.current = nextIndex;
      setCurrentSentenceIndex(nextIndex);
    }
  }, [isPlaying, stop, play, setCurrentSentenceIndex]);

  const skipBackward = useCallback(() => {
    const prevIndex = Math.max(currentIndexRef.current - 3, 0);
    if (isActiveRef.current || isPlaying) {
      stop();
      play(null, prevIndex);
    } else {
      currentIndexRef.current = prevIndex;
      setCurrentSentenceIndex(prevIndex);
    }
  }, [isPlaying, stop, play, setCurrentSentenceIndex]);

  // Skip ±1 sentence (new fine-grained control)
  const skipOneSentenceForward = useCallback(() => {
    const nextIndex = Math.min(currentIndexRef.current + 1, sentencesRef.current.length - 1);
    if (isActiveRef.current || isPlaying) {
      stop();
      play(null, nextIndex);
    } else {
      currentIndexRef.current = nextIndex;
      setCurrentSentenceIndex(nextIndex);
    }
  }, [isPlaying, stop, play, setCurrentSentenceIndex]);

  const skipOneSentenceBackward = useCallback(() => {
    const prevIndex = Math.max(currentIndexRef.current - 1, 0);
    if (isActiveRef.current || isPlaying) {
      stop();
      play(null, prevIndex);
    } else {
      currentIndexRef.current = prevIndex;
      setCurrentSentenceIndex(prevIndex);
    }
  }, [isPlaying, stop, play, setCurrentSentenceIndex]);

  const jumpToSentence = useCallback((index) => {
    if (isActiveRef.current || isPlaying) {
      stop();
      play(null, index);
    } else {
      currentIndexRef.current = index;
      setCurrentSentenceIndex(index);
    }
  }, [isPlaying, stop, play, setCurrentSentenceIndex]);

  const setOnPageComplete = useCallback((callback) => {
    onPageCompleteRef.current = callback;
  }, []);

  const getAvailableVoices = useCallback(() => {
    return synthRef.current.getVoices();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      synthRef.current.cancel();
      clearInterval(listenerTimerRef.current);
    };
  }, []);

  return {
    play,
    pause,
    resume,
    stop,
    togglePlayPause,
    skipForward,
    skipBackward,
    skipOneSentenceForward,
    skipOneSentenceBackward,
    jumpToSentence,
    loadText,
    getAvailableVoices,
    setOnPageComplete,
    sentences: sentencesRef.current,
    currentIndex: currentIndexRef.current
  };
}

export default useTTS;
