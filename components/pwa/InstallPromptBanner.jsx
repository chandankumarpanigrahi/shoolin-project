'use client';

/**
 * components/pwa/InstallPromptBanner.jsx
 * Android/iOS PWA install prompt component.
 *
 * - Android Chrome: captures `beforeinstallprompt` event, shows styled banner
 *   with "Install App" button that triggers the native install dialog.
 * - iOS Safari: shows instructions to use Share → Add to Home Screen.
 * - Hides automatically when already running in standalone mode.
 * - Dismissal is persisted to sessionStorage (shows again next session).
 */

import React, { useEffect, useState, useCallback } from 'react';
import { X, Download, Share, Smartphone } from 'lucide-react';

const DISMISS_KEY = 'shoolin_pwa_install_dismissed';

export function InstallPromptBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed / running in standalone mode — hide
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    // Previously dismissed this session
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
      // Only show if in Safari (not Chrome on iOS which doesn't support PWA install)
      const isSafari =
        /Safari/.test(navigator.userAgent) &&
        !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent);
      if (isSafari) {
        setTimeout(() => {
          setShowIOS(true);
          setVisible(true);
        }, 3000);
      }
      return;
    }

    // Android / Desktop Chrome — listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => {
        setShowAndroid(true);
        setVisible(true);
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setShowAndroid(false);
      setShowIOS(false);
    }, 300);
    sessionStorage.setItem(DISMISS_KEY, '1');
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      dismiss();
    }
  }, [deferredPrompt, dismiss]);

  if (!showAndroid && !showIOS) return null;

  return (
    <div
      role="banner"
      aria-label="Install Shoolin OS as a mobile app"
      className={`block md:hidden fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:max-w-sm z-[9998] transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl shadow-slate-300/50 dark:shadow-black/60 overflow-hidden">

        {/* Gradient top accent */}
        <div className="h-1 bg-gradient-to-r from-brand via-purple-500 to-indigo-400" />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-11 h-11 rounded-xl bg-brand/10 dark:bg-brand/20 border border-brand/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-brand" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Install Shoolin OS
              </p>
              {showAndroid && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Add to your home screen for a faster, native app experience.
                </p>
              )}
              {showIOS && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Tap <Share className="inline w-3 h-3 mx-0.5" /> then{' '}
                  <strong className="text-slate-700 dark:text-slate-300">Add to Home Screen</strong>{' '}
                  to install.
                </p>
              )}
            </div>

            {/* Dismiss */}
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss install prompt"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3">
            {showAndroid && (
              <button
                type="button"
                onClick={handleInstall}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-lg transition-colors shadow-md shadow-brand/30"
              >
                <Download className="w-3.5 h-3.5" />
                Install App
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
