'use client';

/**
 * app/error.jsx
 * Root-level error boundary. Catches rendering errors and displays
 * a graceful fallback UI instead of a blank crash screen.
 */

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    if (error) {
      console.error('[Shoolin OS] Uncaught render error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-8 max-w-md w-full text-center space-y-5">
        {/* Error Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>

        {/* Branding */}
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Something went wrong
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The Shoolin OS encountered an unexpected error. Our team has been notified.
            You can try refreshing the page or return to the dashboard.
          </p>
        </div>

        {/* Error Detail (dev only) */}
        {process.env.NODE_ENV === 'development' && error?.message && (
          <div className="text-left p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
            <p className="text-[11px] font-mono text-rose-700 dark:text-rose-400 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => (typeof reset === 'function' ? reset() : window.location.reload())}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Try Again
          </button>
          <a
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Go Home
          </a>
        </div>

        <p className="text-[10px] text-slate-400 dark:text-slate-600">
          © 2026 Shoolin Innovations Limited
        </p>
      </div>
    </div>
  );
}
