'use client';

import React from 'react';
import { USERS } from '@/data/users';

export function UserAvatar({ userId, user, size = 'md', showName = false, showRole = false }) {
  const foundUser = user || USERS.find((u) => u.id === userId) || {
    name: 'Unknown User',
    role: 'Member',
    avatar: null,
  };

  const sizeStyles = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-7 h-7 text-xs',
    lg: 'w-9 h-9 text-sm',
    xl: 'w-11 h-11 text-base',
  };

  const initials = (foundUser.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="inline-flex items-center gap-2 max-w-full">
      <div
        title={`${foundUser.name} (${foundUser.role || ''})`}
        style={{ borderRadius: '50%' }}
        className={`relative inline-flex items-center justify-center shrink-0 rounded-full font-semibold overflow-hidden border border-slate-200/80 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 ${
          sizeStyles[size] || sizeStyles.md
        }`}
      >
        {foundUser.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foundUser.avatar}
            alt={foundUser.name}
            style={{ borderRadius: '50%' }}
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {showName && (
        <div className="min-w-0 flex flex-col text-left leading-tight">
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
            {foundUser.name}
          </span>
          {showRole && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {foundUser.role}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function AvatarGroup({ userIds = [], max = 3, size = 'sm' }) {
  const visibleIds = userIds.slice(0, max);
  const remainder = userIds.length - max;

  return (
    <div className="flex items-center -space-x-1.5">
      {visibleIds.map((uid, idx) => (
        <div
          key={idx}
          style={{ borderRadius: '50%' }}
          className="ring-1 ring-white dark:ring-slate-900 rounded-full overflow-hidden shrink-0"
        >
          <UserAvatar userId={uid} size={size} />
        </div>
      ))}
      {remainder > 0 && (
        <div
          style={{ borderRadius: '50%' }}
          className={`flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 text-[10px] ring-1 ring-white dark:ring-slate-900 shrink-0 ${
            size === 'xs' ? 'w-5 h-5' : 'w-6 h-6'
          }`}
          title={`${remainder} more members`}
        >
          +{remainder}
        </div>
      )}
    </div>
  );
}
