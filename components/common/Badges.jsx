'use client';

import React from 'react';

export function StatusBadge({ status, size = 'sm' }) {
  const map = {
    Completed: 'bg-emerald-100/90 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/70',
    Resolved: 'bg-emerald-100/90 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/70',
    'On Track': 'bg-teal-100/90 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-700/70',
    'In Progress': 'bg-blue-100/90 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700/70',
    Review: 'bg-purple-100/90 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700/70',
    Requested: 'bg-brand-light/40 text-brand border-brand/40',
    Accepted: 'bg-emerald-100/90 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/70',
    Waiting: 'bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/70',
    Blocked: 'bg-rose-100/90 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/70',
    Delayed: 'bg-rose-100/90 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/70',
    Declined: 'bg-slate-200/80 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    Rescheduled: 'bg-violet-100/90 text-violet-800 border-violet-300 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-700/70',
    'Not Started': 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  };

  const dotColor = {
    Completed: 'bg-emerald-500',
    Resolved: 'bg-emerald-500',
    'On Track': 'bg-teal-500',
    'In Progress': 'bg-blue-500',
    Review: 'bg-purple-500',
    Requested: 'bg-brand',
    Accepted: 'bg-emerald-500',
    Waiting: 'bg-amber-500',
    Blocked: 'bg-rose-500 animate-pulse',
    Delayed: 'bg-rose-500',
    Declined: 'bg-slate-400',
    Rescheduled: 'bg-violet-500',
    'Not Started': 'bg-slate-400',
  };

  const lower = (status || '').toLowerCase();
  let defaultStyle = 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
  let defaultDot = 'bg-slate-400';

  if (lower.includes('complete') || lower.includes('done') || lower.includes('resolved') || lower.includes('finish') || lower.includes('ship')) {
    defaultStyle = 'bg-emerald-100/90 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/70';
    defaultDot = 'bg-emerald-500';
  } else if (lower.includes('progress') || lower.includes('dev') || lower.includes('wip') || lower.includes('active')) {
    defaultStyle = 'bg-blue-100/90 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700/70';
    defaultDot = 'bg-blue-500';
  } else if (lower.includes('review') || lower.includes('test') || lower.includes('qa') || lower.includes('audit')) {
    defaultStyle = 'bg-purple-100/90 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700/70';
    defaultDot = 'bg-purple-500';
  } else if (lower.includes('block') || lower.includes('delay') || lower.includes('cancel') || lower.includes('defect') || lower.includes('bug')) {
    defaultStyle = 'bg-rose-100/90 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/70';
    defaultDot = 'bg-rose-500 animate-pulse';
  } else if (lower.includes('wait') || lower.includes('hold') || lower.includes('pause') || lower.includes('pend')) {
    defaultStyle = 'bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/70';
    defaultDot = 'bg-amber-500';
  }

  const style = map[status] || defaultStyle;
  const dot = dotColor[status] || defaultDot;
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border whitespace-nowrap shadow-2xs ${sizeClass} ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, size = 'sm' }) {
  const map = {
    Urgent: 'bg-rose-100/90 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/80',
    High: 'bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/80',
    Medium: 'bg-sky-100/90 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-700/80',
    Low: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  };

  const dotColor = {
    Urgent: 'bg-rose-500 animate-pulse',
    High: 'bg-amber-500',
    Medium: 'bg-sky-500',
    Low: 'bg-slate-400',
  };

  const style = map[priority] || 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border whitespace-nowrap shadow-2xs ${sizeClass} ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor[priority] || 'bg-slate-400'}`}></span>
      {priority}
    </span>
  );
}

export function ProjectTypeBadge({ type, size = 'sm' }) {
  const isRecurring = type === 'recurring';
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  if (isRecurring) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border bg-cyan-100/90 text-cyan-800 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-700/80 whitespace-nowrap shadow-2xs ${sizeClass}`}>
        <svg className="w-3 h-3 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Recurring
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border bg-brand-light text-brand-text border-brand-border whitespace-nowrap shadow-2xs ${sizeClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
      One Time
    </span>
  );
}

export function RoleBadge({ role, size = 'sm' }) {
  const map = {
    'Super Admin': 'bg-purple-100/90 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700/80',
    Admin: 'bg-indigo-100/90 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-700/80',
    'Manager / TL': 'bg-emerald-100/90 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80',
    User: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  const style = map[role] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border whitespace-nowrap shadow-2xs ${sizeClass} ${style}`}>
      {role}
    </span>
  );
}
