'use client';

import React from 'react';
import { useAppContext } from '@/components/providers/AppProvider';

const FALLBACK_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
];

const getFallbackAvatar = (str) => {
  if (!str) return FALLBACK_AVATARS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_AVATARS.length;
  return FALLBACK_AVATARS[index];
};

export const resolveUserObject = (targetKey, contextUsers = []) => {
  if (!targetKey) return null;
  if (typeof targetKey === 'object' && targetKey.name && (targetKey.id || targetKey._id)) return targetKey;

  const keyStr = String(typeof targetKey === 'object' ? targetKey.id || targetKey._id || targetKey.name || '' : targetKey).trim();
  if (!keyStr) return null;

  // 1. Direct ID, _id, or Email Match
  let match = (contextUsers || []).find(
    (u) => u.id === keyStr || u._id === keyStr || u.email === keyStr
  );
  if (match) return match;

  // 2. Name exact or partial match
  const lowerKey = keyStr.toLowerCase();
  match = (contextUsers || []).find((u) => {
    if (!u.name) return false;
    const lowerName = u.name.toLowerCase();
    return lowerName === lowerKey || lowerName.includes(lowerKey) || (lowerKey.length >= 3 && lowerName.split(' ')[0] === lowerKey.split(' ')[0]);
  });
  if (match) return match;

  // 3. Known legacy seed aliases mapped directly to live DB users
  if (keyStr === 'admin-1' || keyStr === 'admin@shoolin.co.uk' || lowerKey.includes('admin')) {
    const adminMatch = (contextUsers || []).find((u) => u.role === 'Super Admin' || (u.name && u.name.toLowerCase().includes('admin')));
    if (adminMatch) return adminMatch;
  }

  if (keyStr === 'usr-1' || keyStr === 'usr-chandan' || lowerKey.includes('chandan')) {
    const chandanMatch = (contextUsers || []).find((u) => (u.name && u.name.toLowerCase().includes('chandan')) || (u.email && u.email.toLowerCase().includes('uxdesigner')));
    if (chandanMatch) return chandanMatch;
  }

  if (keyStr === 'usr-2' || keyStr === 'usr-sasmita' || lowerKey.includes('sasmita')) {
    const sasmitaMatch = (contextUsers || []).find((u) => u.name && u.name.toLowerCase().includes('sasmita'));
    if (sasmitaMatch) return sasmitaMatch;
  }

  return null;
};

export function UserAvatar({ userId, user, size = 'md', showName = false, showRole = false }) {
  let contextUsers = [];
  try {
    const ctx = useAppContext();
    if (ctx && ctx.users) contextUsers = ctx.users;
  } catch (e) {}

  const target = user || userId;
  const foundUser = resolveUserObject(target, contextUsers);

  const displayName = foundUser?.name || 'User';
  const avatarUrl = foundUser?.avatar || getFallbackAvatar(displayName);

  const sizeStyles = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-7 h-7 text-xs',
    lg: 'w-9 h-9 text-sm',
    xl: 'w-11 h-11 text-base',
  };

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  const tooltipTitle = `${displayName} (${foundUser?.role || 'Member'})`;

  return (
    <div className="inline-flex items-center gap-2 max-w-full">
      <div
        title={tooltipTitle}
        style={{ borderRadius: '50%' }}
        className={`relative inline-flex items-center justify-center shrink-0 rounded-full font-semibold overflow-hidden border border-slate-200/80 dark:border-slate-700/80 bg-brand-light/40 dark:bg-slate-800 text-brand dark:text-slate-200 cursor-pointer ${
          sizeStyles[size] || sizeStyles.md
        }`}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={displayName}
            title={tooltipTitle}
            style={{ borderRadius: '50%' }}
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = getFallbackAvatar(displayName);
            }}
          />
        ) : (
          <span title={tooltipTitle}>{initials}</span>
        )}
      </div>

      {showName && (
        <div className="min-w-0 flex flex-col text-left leading-tight">
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate" title={tooltipTitle}>
            {displayName}
          </span>
          {showRole && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {foundUser?.role || 'Member'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function AvatarGroup({ userIds = [], max = 3, size = 'sm' }) {
  let contextUsers = [];
  try {
    const ctx = useAppContext();
    if (ctx && ctx.users) contextUsers = ctx.users;
  } catch (e) {}

  const rawMembers = (userIds || [])
    .map((uid) => resolveUserObject(uid, contextUsers))
    .filter(Boolean);

  // Deduplicate by canonical user ID / name
  const seenKeys = new Set();
  const validMembers = [];
  for (const m of rawMembers) {
    const key = String(m.id || m._id || m.email || m.name || '').toLowerCase();
    if (key && !seenKeys.has(key)) {
      seenKeys.add(key);
      validMembers.push(m);
    }
  }

  if (validMembers.length === 0) return null;

  const visibleMembers = validMembers.slice(0, max);
  const remainder = validMembers.length - max;

  return (
    <div className="flex items-center -space-x-1.5">
      {visibleMembers.map((userObj, idx) => {
        const titleText = `${userObj.name} (${userObj.role || 'Member'})`;
        return (
          <div
            key={userObj.id || userObj._id || idx}
            title={titleText}
            style={{ borderRadius: '50%' }}
            className="ring-1 ring-white dark:ring-slate-900 rounded-full overflow-hidden shrink-0 cursor-pointer"
          >
            <UserAvatar user={userObj} size={size} />
          </div>
        );
      })}
      {remainder > 0 && (
        <div
          style={{ borderRadius: '50%' }}
          className={`flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 text-[10px] ring-1 ring-white dark:ring-slate-900 shrink-0 ${
            size === 'xs' ? 'w-5 h-5' : 'w-6 h-6'
          }`}
          title={`${remainder} more members: ${validMembers.slice(max).map(m => m.name).join(', ')}`}
        >
          +{remainder}
        </div>
      )}
    </div>
  );
}

