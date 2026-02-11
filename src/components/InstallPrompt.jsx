import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) return;

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // iOS Safari hint — show a manual instruction banner
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isIOS && isSafari) {
      setShowBanner(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showBanner) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  return (
    <div className="install-banner">
      <div className="install-banner-text">
        <span className="install-banner-icon">📱</span>
        {isIOS ? (
          <span>
            Tap <strong>Share</strong> then <strong>"Add to Home Screen"</strong> to install
          </span>
        ) : (
          <span>Install Audiolize on your device for quick access</span>
        )}
      </div>
      {!isIOS && deferredPrompt && (
        <button onClick={handleInstall} className="install-banner-install">
          Install
        </button>
      )}
      <button onClick={handleDismiss} className="install-banner-dismiss">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
