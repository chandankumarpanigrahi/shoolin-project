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
  if (typeof targetKey === 'object' && targetKey.name) return targetKey;

  const keyStr = String(
    typeof targetKey === 'object'
      ? targetKey.id || targetKey._id || targetKey.name || targetKey.email || ''
      : targetKey
  ).trim();
  if (!keyStr) return null;

  const lowerKey = keyStr.toLowerCase();

  // 1. Direct ID, _id, or Email Match
  let match = (contextUsers || []).find((u) => {
    if (!u) return false;
    const uId = String(u.id || '').toLowerCase();
    const u_Id = String(u._id || '').toLowerCase();
    const uEmail = String(u.email || '').toLowerCase();
    return uId === lowerKey || u_Id === lowerKey || uEmail === lowerKey;
  });
  if (match) return match;

  // 2. Name exact or partial match
  match = (contextUsers || []).find((u) => {
    if (!u?.name) return false;
    const lowerName = u.name.toLowerCase();
    return (
      lowerName === lowerKey ||
      lowerName.includes(lowerKey) ||
      (lowerKey.length >= 3 && lowerName.split(' ')[0] === lowerKey.split(' ')[0])
    );
  });
  if (match) return match;

  // 3. Known legacy seed aliases mapped directly to live DB users
  if (keyStr === 'admin-1' || keyStr === 'admin@shoolin.co.uk' || lowerKey.includes('admin')) {
    const adminMatch = (contextUsers || []).find(
      (u) => u.role === 'Super Admin' || (u.name && u.name.toLowerCase().includes('admin'))
    );
    if (adminMatch) return adminMatch;
  }

  if (keyStr === 'usr-1' || keyStr === 'usr-chandan' || lowerKey.includes('chandan')) {
    const chandanMatch = (contextUsers || []).find(
      (u) =>
        (u.name && u.name.toLowerCase().includes('chandan')) ||
        (u.email && u.email.toLowerCase().includes('uxdesigner'))
    );
    if (chandanMatch) return chandanMatch;
  }

  if (keyStr === 'usr-2' || keyStr === 'usr-sasmita' || lowerKey.includes('sasmita')) {
    const sasmitaMatch = (contextUsers || []).find(
      (u) => u.name && u.name.toLowerCase().includes('sasmita')
    );
    if (sasmitaMatch) return sasmitaMatch;
  }

  return null;
};

export function UserAvatar({ userId, user, size = 'md', showName = false, showRole = false, className = '' }) {
  let contextUsers = [];
  try {
    const ctx = useAppContext();
    if (ctx && ctx.users) contextUsers = ctx.users;
  } catch (e) { }

  const target = user || userId;
  const isUnassigned = !target || (typeof target === 'string' && !target.trim());
  const foundUser = isUnassigned ? null : resolveUserObject(target, contextUsers);

  const displayName = isUnassigned ? 'Unassigned' : (foundUser?.name || 'User');
  const avatarUrl = isUnassigned ? null : (foundUser?.avatar || getFallbackAvatar(displayName));

  const sizeStyles = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-7 h-7 text-xs',
    lg: 'w-9 h-9 text-sm',
    xl: 'w-16 h-16 text-base',
  };

  const initials = isUnassigned ? '—' : (displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U');

  const tooltipTitle = isUnassigned ? 'Unassigned (None)' : `${displayName} (${foundUser?.role || 'Member'})`;

  const avatarCircle = (
    <div
      title={tooltipTitle}
      style={{ borderRadius: '50%' }}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full font-semibold overflow-hidden border border-slate-200/80 dark:border-slate-700/80 ${isUnassigned
        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-dashed border-slate-300 dark:border-slate-600'
        : 'bg-brand-light/40 dark:bg-slate-800 text-brand dark:text-slate-200 cursor-pointer'
        } ${sizeStyles[size] || sizeStyles.md} ${className}`}
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
  );

  if (!showName && !showRole) {
    return avatarCircle;
  }

  return (
    <div className={`inline-flex items-center gap-2 max-w-full ${className}`}>
      {avatarCircle}
      {showName && (
        <div className="min-w-0 flex flex-col text-left leading-tight">
          <span className={`text-xs font-medium truncate ${isUnassigned ? 'text-slate-400 dark:text-slate-500 italic' : 'text-slate-800 dark:text-slate-200'}`} title={tooltipTitle}>
            {displayName}
          </span>
          {showRole && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {isUnassigned ? 'None' : (foundUser?.role || 'Member')}
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
  } catch (e) { }

  const rawMembers = (userIds || [])
    .map((uid) => {
      if (!uid) return null;
      const resolved = resolveUserObject(uid, contextUsers);
      if (resolved) return resolved;
      if (typeof uid === 'object' && uid.name) {
        return {
          id: uid.id || uid._id || 'member',
          name: uid.name || uid.email || 'Member',
          role: uid.role || 'Member',
          avatar: uid.avatar,
        };
      }
      return null;
    })
    .filter(Boolean);

  // Deduplicate by canonical user ID / name & exclude Super Admin footprint
  const seenKeys = new Set();
  const validMembers = [];
  for (const m of rawMembers) {
    if (m.role === 'Super Admin') continue;
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
          className={`flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 text-[10px] ring-1 ring-white dark:ring-slate-900 shrink-0 ${size === 'xs' ? 'w-5 h-5' : 'w-6 h-6'
            }`}
          title={`${remainder} more members: ${validMembers.slice(max).map(m => m.name).join(', ')}`}
        >
          +{remainder}
        </div>
      )}
    </div>
  );
}

/**
 * Checks whether a given user is the designated assignee of a task.
 * Supports ID, _id, email, full name, and resolved directory lookups.
 */
export const isTaskAssignee = (task, currentUser, contextUsers = []) => {
  if (!task || !currentUser) return false;

  // Admin / Super Admin override check
  const role = String(currentUser.role || '').toLowerCase();
  if (role.includes('admin') || role === 'super admin') return true;

  // If task is unassigned (no-one assigned as default), anyone can claim/assign/edit status/move
  if (!task.assignedTo || (typeof task.assignedTo === 'string' && !task.assignedTo.trim())) {
    return true;
  }

  const currentId = String(currentUser.id || currentUser._id || '').toLowerCase();
  const currentEmail = String(currentUser.email || '').toLowerCase();
  const currentName = String(currentUser.name || '').trim().toLowerCase();

  // 1. Direct object inspection if task.assignedTo is populated
  if (typeof task.assignedTo === 'object' && task.assignedTo !== null) {
    const aId = String(task.assignedTo.id || task.assignedTo._id || '').toLowerCase();
    const aEmail = String(task.assignedTo.email || '').toLowerCase();
    const aName = String(task.assignedTo.name || '').trim().toLowerCase();
    if (
      (currentId && aId === currentId) ||
      (currentEmail && aEmail === currentEmail) ||
      (currentName && aName === currentName)
    ) {
      return true;
    }
  }

  // 2. Direct string matching (ID, email, name)
  const assigned = String(task.assignedTo || '').trim().toLowerCase();
  if (
    assigned &&
    ((currentId && assigned === currentId) ||
      (currentEmail && assigned === currentEmail) ||
      (currentName && assigned === currentName))
  ) {
    return true;
  }

  // 3. Resolve through active user directory
  if (task.assignedTo && Array.isArray(contextUsers) && contextUsers.length > 0) {
    const resolved = resolveUserObject(task.assignedTo, contextUsers);
    if (resolved) {
      const rId = String(resolved.id || resolved._id || '').toLowerCase();
      const rEmail = String(resolved.email || '').toLowerCase();
      const rName = String(resolved.name || '').trim().toLowerCase();
      if (
        (currentId && rId === currentId) ||
        (currentEmail && rEmail === currentEmail) ||
        (currentName && rName === currentName)
      ) {
        return true;
      }
    }
  }

  return false;
};

