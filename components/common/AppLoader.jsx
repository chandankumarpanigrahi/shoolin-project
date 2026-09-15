'use client';

import React from 'react';

export function AppLoader({
  message = 'Loading Shoolin Innovations Limited Workspace...',
  subtext = 'Initializing secure enterprise environment',
  fullScreen = false,
  className = ''
}) {
  const content = (
    <div className={`flex flex-col items-center justify-center p-6 text-center select-none ${className}`}>
      <div className="relative mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/loader.gif"
          alt="Loading..."
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
        />
      </div>

      <div className="flex items-center gap-2 mb-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Shoolin Innovations Limited"
          className="w-5 h-5 object-contain"
        />
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Shoolin Innovations Limited
        </h3>
      </div>

      <p className="text-xs font-semibold text-brand">
        {message}
      </p>

      {subtext && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {subtext}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full mx-4">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
