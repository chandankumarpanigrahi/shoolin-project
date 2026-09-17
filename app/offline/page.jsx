'use client';

/**
 * app/offline/page.jsx
 * Offline fallback page shown by the Serwist service worker
 * when the user navigates to a page that is not cached.
 */

import React from 'react';
import { WifiOff, RefreshCcw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-8 max-w-sm w-full text-center space-y-5">

        {/* Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <WifiOff className="w-8 h-8 text-slate-400" />
        </div>

        {/* Logo + Name */}
        <div className="flex items-center justify-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Shoolin Innovations Limited" className="w-6 h-6 object-contain" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Shoolin OS
          </span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-base font-bold text-slate-900 dark:text-white">
            You&apos;re offline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            No internet connection detected. Please check your network and try again. Cached pages are still accessible.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-lg transition-colors shadow-md"
          style={{ backgroundColor: 'var(--brand-primary, #4f46e5)' }}
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Retry Connection
        </button>

        <p className="text-[10px] text-slate-400 dark:text-slate-600">
          © 2026 Shoolin Innovations Limited
        </p>
      </div>
    </div>
  );
}
