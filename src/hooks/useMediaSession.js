import { useEffect } from 'react';
import useStore from '../store/useStore';

export function useMediaSession(tts) {
  const { currentBook, isPlaying } = useStore();

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    // Set metadata
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentBook?.title || 'Audiolize',
      artist: currentBook?.author || 'PDF Audiobook',
      album: 'Audiolize',
      artwork: [
        {
          src: '/favicon.svg',
          sizes: '96x96',
          type: 'image/svg+xml'
        }
      ]
    });

    // Set playback state
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    // Set action handlers
    navigator.mediaSession.setActionHandler('play', () => {
      tts?.resume();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      tts?.pause();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      tts?.skipBackward();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      tts?.skipForward();
    });

    navigator.mediaSession.setActionHandler('seekforward', () => {
      tts?.skipForward();
    });

    navigator.mediaSession.setActionHandler('seekbackward', () => {
      tts?.skipBackward();
    });

    navigator.mediaSession.setActionHandler('stop', () => {
      tts?.stop();
    });
  }, [currentBook, isPlaying, tts]);
}

export default useMediaSession;
