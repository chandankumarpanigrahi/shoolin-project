'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Briefcase,
  CheckSquare,
  Users2,
  Video,
  Link2,
  ArrowRight
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/common/Badges';

function dedupe(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list.filter((item, index) => {
    if (!item) return false;
    const key = String(item.id || item._id || item.code || item.email || item.url || `idx-${index}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  projects = [],
  tasks = [],
  users = [],
  meetings = [],
  dependencies = [],
  links = [],
  onSelectProject,
  onSelectTask,
  onNavigate
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const q = query.trim().toLowerCase();

  const filteredProjects = useMemo(() => {
    if (!q) return dedupe(projects).slice(0, 3);
    return dedupe(
      projects.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.code || '').toLowerCase().includes(q) ||
        (p.client || '').toLowerCase().includes(q)
      )
    );
  }, [projects, q]);

  const filteredTasks = useMemo(() => {
    if (!q) return dedupe(tasks).slice(0, 4);
    return dedupe(
      tasks.filter(t =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.code || '').toLowerCase().includes(q)
      )
    );
  }, [tasks, q]);

  const filteredUsers = useMemo(() => {
    if (!q) return dedupe(users).slice(0, 3);
    return dedupe(
      users.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.department || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      )
    );
  }, [users, q]);

  const filteredMeetings = useMemo(() => {
    if (!q) return [];
    return dedupe(
      meetings.filter(m =>
        (m.title || '').toLowerCase().includes(q) ||
        (m.location || '').toLowerCase().includes(q)
      )
    );
  }, [meetings, q]);

  const filteredLinks = useMemo(() => {
    if (!q) return [];
    return dedupe(
      links.filter(l =>
        (l.name || '').toLowerCase().includes(q) ||
        (l.brand || '').toLowerCase().includes(q) ||
        (l.url || '').toLowerCase().includes(q)
      )
    );
  }, [links, q]);

  // Flattened actionable list for keyboard navigation
  const flatResults = useMemo(() => {
    return [
      ...filteredProjects.map(p => ({ type: 'project', data: p })),
      ...filteredTasks.map(t => ({ type: 'task', data: t })),
      ...filteredUsers.map(u => ({ type: 'user', data: u })),
      ...filteredMeetings.map(m => ({ type: 'meeting', data: m })),
      ...filteredLinks.map(l => ({ type: 'link', data: l })),
    ];
  }, [filteredProjects, filteredTasks, filteredUsers, filteredMeetings, filteredLinks]);

  const handleSelectItem = (item) => {
    if (!item || !item.data) return;

    if (item.type === 'project') {
      if (onSelectProject) {
        onSelectProject(item.data);
      } else {
        router.push(`/project/${item.data.id || item.data._id}`);
        onClose();
      }
    } else if (item.type === 'task') {
      if (onSelectTask) {
        onSelectTask(item.data);
      } else {
        onClose();
      }
    } else if (item.type === 'user') {
      onClose();
      router.push('/masters');
    } else if (item.type === 'meeting') {
      onClose();
      router.push('/meetings');
    } else if (item.type === 'link') {
      onClose();
      if (item.data.url) {
        window.open(item.data.url, '_blank', 'noreferrer');
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onNavigate?.(null);
        return;
      }

      if (e.key === 'Escape' && isOpen) {
        onClose();
        return;
      }

      if (!isOpen || flatResults.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % flatResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + flatResults.length) % flatResults.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatResults[selectedIndex]) {
          handleSelectItem(flatResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate, flatResults, selectedIndex]);

  // Keep selected index within bounds when results change
  useEffect(() => {
    if (selectedIndex >= flatResults.length) {
      setSelectedIndex(0);
    }
  }, [flatResults.length, selectedIndex]);

  if (!isOpen) return null;

  const totalResults = flatResults.length;

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[85vh] mb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search projects, tasks (PMV-001), team members, meetings, links..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full py-3 text-sm bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              aria-label="Clear search query"
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 text-xs">
          {totalResults === 0 && (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <p className="font-medium text-sm text-slate-700 dark:text-slate-300">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for &ldquo;PMV-001&rdquo;, &ldquo;Website&rdquo;, &ldquo;Rahul&rdquo;, or &ldquo;Figma&rdquo;</p>
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div className="py-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3 h-3 text-brand" />
                Projects
              </div>
              {filteredProjects.map((p, idx) => {
                const itemGlobalIndex = flatResults.findIndex(r => r.type === 'project' && (r.data.id === p.id || r.data._id === p._id || r.data.code === p.code));
                const isSelected = itemGlobalIndex === selectedIndex;
                const safeKey = p.id || p._id || p.code || `proj-${idx}`;
                return (
                  <div
                    key={safeKey}
                    onClick={() => handleSelectItem({ type: 'project', data: p })}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-sm cursor-pointer group transition-colors ${
                      isSelected
                        ? 'bg-brand/10 dark:bg-brand/20 text-brand'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="font-mono text-xs font-bold text-brand">{p.code}</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{p.name}</span>
                      {p.client && <span className="text-[11px] text-slate-400">({p.client})</span>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={p.status} size="xs" />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-brand transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div className="py-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-3 h-3 text-blue-500" />
                Tasks &amp; Subtasks
              </div>
              {filteredTasks.map((t, idx) => {
                const itemGlobalIndex = flatResults.findIndex(r => r.type === 'task' && (r.data.id === t.id || r.data._id === t._id || r.data.code === t.code));
                const isSelected = itemGlobalIndex === selectedIndex;
                const safeKey = t.id || t._id || t.code || `task-${idx}`;
                return (
                  <div
                    key={safeKey}
                    onClick={() => handleSelectItem({ type: 'task', data: t })}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-sm cursor-pointer group transition-colors ${
                      isSelected
                        ? 'bg-brand/10 dark:bg-brand/20 text-brand'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded-xs">{t.code}</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <PriorityBadge priority={t.priority} size="xs" />
                      <StatusBadge status={t.status} size="xs" />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-brand transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Users */}
          {filteredUsers.length > 0 && (
            <div className="py-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users2 className="w-3 h-3 text-emerald-500" />
                Users &amp; Access
              </div>
              {filteredUsers.map((u, idx) => {
                const itemGlobalIndex = flatResults.findIndex(r => r.type === 'user' && (r.data.id === u.id || r.data._id === u._id || r.data.email === u.email));
                const isSelected = itemGlobalIndex === selectedIndex;
                const safeKey = u.id || u._id || u.email || `user-${idx}`;
                return (
                  <div
                    key={safeKey}
                    onClick={() => handleSelectItem({ type: 'user', data: u })}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-sm cursor-pointer group transition-colors ${
                      isSelected
                        ? 'bg-brand/10 dark:bg-brand/20 text-brand'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}`} alt={u.name || ''} className="w-5 h-5 rounded-sm object-cover" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{u.name}</span>
                      {u.department && <span className="text-[11px] text-slate-400">· {u.department}</span>}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{u.role}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Meetings */}
          {filteredMeetings.length > 0 && (
            <div className="py-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-3 h-3 text-purple-500" />
                Meetings &amp; Calls
              </div>
              {filteredMeetings.map((m, idx) => {
                const itemGlobalIndex = flatResults.findIndex(r => r.type === 'meeting' && (r.data.id === m.id || r.data._id === m._id));
                const isSelected = itemGlobalIndex === selectedIndex;
                const safeKey = m.id || m._id || `meeting-${idx}`;
                return (
                  <div
                    key={safeKey}
                    onClick={() => handleSelectItem({ type: 'meeting', data: m })}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-sm cursor-pointer group transition-colors ${
                      isSelected
                        ? 'bg-brand/10 dark:bg-brand/20 text-brand'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{m.title}</span>
                      <span className="text-[11px] text-slate-400">({m.date || m.time || 'Scheduled'})</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={m.status || 'Scheduled'} size="xs" />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-brand transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Links */}
          {filteredLinks.length > 0 && (
            <div className="py-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Link2 className="w-3 h-3 text-cyan-500" />
                Links
              </div>
              {filteredLinks.map((l, idx) => {
                const itemGlobalIndex = flatResults.findIndex(r => r.type === 'link' && (r.data.id === l.id || r.data._id === l._id || r.data.url === l.url));
                const isSelected = itemGlobalIndex === selectedIndex;
                const safeKey = l.id || l._id || l.url || `link-${idx}`;
                return (
                  <div
                    key={safeKey}
                    onClick={() => handleSelectItem({ type: 'link', data: l })}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-sm cursor-pointer group transition-colors ${
                      isSelected
                        ? 'bg-brand/10 dark:bg-brand/20 text-brand'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {l.brand && <span className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/50 px-1 py-0.2 rounded-xs">{l.brand}</span>}
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{l.name}</span>
                    </div>
                    <span className="text-[11px] text-brand font-mono underline truncate max-w-xs">{l.url}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with <kbd className="font-mono bg-white dark:bg-slate-700 px-1 border border-slate-200 dark:border-slate-600 rounded">↑</kbd> <kbd className="font-mono bg-white dark:bg-slate-700 px-1 border border-slate-200 dark:border-slate-600 rounded">↓</kbd></span>
          <span>Select with <kbd className="font-mono bg-white dark:bg-slate-700 px-1 border border-slate-200 dark:border-slate-600 rounded">ENTER</kbd></span>
        </div>
      </div>
    </div>
  );
}
