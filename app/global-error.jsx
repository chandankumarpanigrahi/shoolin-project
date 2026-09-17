'use client';

/**
 * app/global-error.jsx
 * Root error handler for Next.js App Router.
 */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center min-h-screen p-6 font-sans">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-500 font-bold text-xl">
            !
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Application Error</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The application encountered an unexpected issue. You can try refreshing or resetting the state.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => (typeof reset === 'function' ? reset() : window.location.reload())}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              Try Again
            </button>
            <a
              href="/"
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all"
            >
              Go to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
