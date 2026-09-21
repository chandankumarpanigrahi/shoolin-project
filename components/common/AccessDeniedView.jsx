'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Target, Lock } from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProvider';
import { RoleBadge } from '@/components/common/Badges';

export function AccessDeniedView({
  moduleName = 'This Module',
  requiredRole = 'Administrator',
  permissionKey = null,
}) {
  const router = useRouter();
  const { currentUser } = useAppContext();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-rose-500/10 dark:bg-rose-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Shield Alert Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-5 shadow-sm">
          <ShieldAlert className="w-9 h-9" />
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center">
            <Lock className="w-3 h-3" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          Access Denied
        </h2>
        <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-4">
          Restricted to Authorized Personnel Only
        </p>

        {/* Description */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 mb-6 border border-slate-200/80 dark:border-slate-800 text-left text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Attempted Area:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{moduleName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Your Profile:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>{currentUser?.name || 'Member'}</span>
              <RoleBadge role={currentUser?.role || 'User'} />
            </span>
          </div>
          {requiredRole && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Required Clearance:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{requiredRole}</span>
            </div>
          )}
          {permissionKey && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Governance Bit:</span>
              <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                {permissionKey}
              </code>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          Your current role does not have authorization to view or manage {moduleName}.
          If you require access for your daily responsibilities, please request an access override from your Super Administrator.
        </p>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white font-semibold text-xs shadow-md hover:bg-brand/90 transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/my-focus')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Target className="w-4 h-4" />
            <span>Go to My Focus</span>
          </button>
        </div>
      </div>
    </div>
  );
}
