'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Briefcase,
  CheckSquare,
  Users2,
  Video,
  GitBranch,
  Link2,
  ArrowRight
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/common/Badges';

export function GlobalSearchModal({
  isOpen,
  onClose,
  projects,
  tasks,
  users,
  meetings,
  dependencies,
  links,
  onSelectProject,
  onSelectTask,
  onNavigate
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onNavigate?.(null); // trigger open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredProjects = q
    ? projects.filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
    : projects.slice(0, 3);

  const filteredTasks = q
    ? tasks.filter(t => t.title.toLowerCase().includes(q) || t.code.toLowerCase().includes(q))
    : tasks.slice(0, 4);

  const filteredUsers = q
    ? users.filter(u => u.name.toLowerCase().includes(q) || u.department.toLowerCase().includes(q))
    : users.slice(0, 3);

  const filteredMeetings = q
    ? meetings.filter(m => m.title.toLowerCase().includes(q))
    : [];

  const filteredLinks = q
    ? links.filter(l => l.name.toLowerCase().includes(q) || l.brand.toLowerCase().includes(q))
    : [];

  const totalResults =
    filteredProjects.length +
    filteredTasks.length +
    filteredUsers.length +
    filteredMeetings.length +
    filteredLinks.length;

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search projects, tasks (PMV-001), team members, meetings, links..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-3 text-sm bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
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
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p);
                    onClose();
                  }}
                  className="flex items-center justify-between px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-sm cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-mono text-xs font-bold text-brand">{p.code}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{p.name}</span>
                    <span className="text-[11px] text-slate-400">({p.client})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={p.status} size="xs" />
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-brand transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div className="py-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-3 h-3 text-blue-500" />
                Tasks &amp; Subtasks
              </div>
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectTask(t);
                    onClose();
                  }}
                  className="flex items-center justify-between px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-sm cursor-pointer group transition-colors"
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
              ))}
            </div>
          )}

          {/* Users */}
          {filteredUsers.length > 0 && (
            <div className="py-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users2 className="w-3 h-3 text-emerald-500" />
                Users &amp; Access
              </div>
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    router.push('/masters');
                    onClose();
                  }}
                  className="flex items-center justify-between px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-sm cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-sm object-cover" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{u.name}</span>
                    <span className="text-[11px] text-slate-400">· {u.department}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{u.role}</span>
                </div>
              ))}
            </div>
          )}

          {/* Links */}
          {filteredLinks.length > 0 && (
            <div className="py-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Link2 className="w-3 h-3 text-cyan-500" />
                Links
              </div>
              {filteredLinks.map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-sm cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/50 px-1 py-0.2 rounded-xs">{l.brand}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{l.name}</span>
                  </div>
                  <span className="text-[11px] text-brand font-mono underline truncate max-w-xs">{l.url}</span>
                </a>
              ))}
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
