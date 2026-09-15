'use client';

import React, { useState } from 'react';
import {
  GitBranch,
  Plus,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Bell,
  Search
} from 'lucide-react';
import { StatusBadge } from '@/components/common/Badges';
import { UserAvatar } from '@/components/common/UserAvatar';

export function DependenciesView({
  dependencies,
  projects,
  tasks,
  users,
  currentUser,
  onOpenAddDependency,
  onUpdateDependencyStatus,
  onSelectTask
}) {
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'BLOCKED' | 'MINE'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDeps = dependencies.filter(d => {
    if (filterMode === 'BLOCKED' && d.status !== 'Blocked') return false;
    if (filterMode === 'MINE' && d.fromUser !== currentUser.id && d.toUser !== currentUser.id) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !d.dependencyDescription.toLowerCase().includes(q) &&
        !d.taskTitle.toLowerCase().includes(q) &&
        !d.projectName.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const blockedCount = dependencies.filter(d => d.status === 'Blocked').length;
  const waitingCount = dependencies.filter(d => d.status === 'Waiting').length;
  const inProgressCount = dependencies.filter(d => d.status === 'In Progress').length;
  const resolvedCount = dependencies.filter(d => d.status === 'Resolved').length;

  return (
    <div className="space-y-4 pb-12 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Blockers &amp; Team Dependencies</h1>
            <span className="text-xs px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-mono font-medium rounded-xs border border-amber-200 dark:border-amber-800">
              {dependencies.length} active mappings
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-functional deliverable hand-offs, API schema wait-times, and client sign-off blockers
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddDependency}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-sm shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Log Dependency Blocker
        </button>
      </div>

      {/* 4 Summary Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setFilterMode('BLOCKED')}
          className={`p-3 bg-white dark:bg-slate-900 border rounded-sm cursor-pointer transition-all shadow-2xs ${
            filterMode === 'BLOCKED'
              ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Critical Blocked</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">{blockedCount}</span>
        </div>

        <div
          onClick={() => setFilterMode('ALL')}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm cursor-pointer hover:border-amber-300 dark:hover:border-amber-700 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Waiting on Inputs</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <span className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400">{waitingCount}</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xs">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">In Progress</span>
            <GitBranch className="w-3.5 h-3.5" />
          </div>
          <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{inProgressCount}</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{resolvedCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search dependencies, task titles, or projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-sm border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setFilterMode('ALL')}
            className={`px-2.5 py-1 rounded-xs font-semibold transition-colors ${
              filterMode === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All ({dependencies.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('BLOCKED')}
            className={`px-2.5 py-1 rounded-xs font-semibold transition-colors ${
              filterMode === 'BLOCKED'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Blocked Only ({blockedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('MINE')}
            className={`px-2.5 py-1 rounded-xs font-semibold transition-colors ${
              filterMode === 'MINE'
                ? 'bg-white dark:bg-slate-900 text-brand shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            My Dependencies
          </button>
        </div>
      </div>

      {/* Table Representation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
                <th className="py-2.5 px-3">Handoff Chain (From → To)</th>
                <th className="py-2.5 px-3">Deliverable &amp; Task</th>
                <th className="py-2.5 px-3">Dependency Requirement</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Expected Date</th>
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDeps.map((d) => {
                const fromUser = users.find(u => u.id === d.fromUser) || users[0];
                const toUser = users.find(u => u.id === d.toUser) || users[1];
                const task = tasks.find(t => t.id === d.relatedTaskId);

                return (
                  <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                    {/* Handoff Path */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <UserAvatar user={fromUser} size="xs" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{fromUser.name.split(' ')[0]}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <UserAvatar user={toUser} size="xs" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{toUser.name.split(' ')[0]}</span>
                      </div>
                    </td>

                    {/* Task Title */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[11px] font-semibold text-brand bg-brand-subtle px-1 py-0.2 rounded-xs">
                          {d.relatedTaskCode}
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">{d.taskTitle}</span>
                      </div>
                    </td>

                    {/* Dependency Description */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{d.dependencyDescription}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">{d.details}</div>
                    </td>

                    {/* Status dropdown */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <select
                        value={d.status}
                        onChange={(e) => onUpdateDependencyStatus(d.id, e.target.value)}
                        className="border border-slate-200 dark:border-slate-700 rounded-xs px-2 py-0.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 font-medium focus:outline-none focus:border-amber-600"
                      >
                        <option value="Waiting">Waiting</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Blocked">Blocked</option>
                      </select>
                    </td>

                    {/* Expected Date */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400">
                      {d.expectedDate}
                    </td>

                    {/* Project */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {d.projectName}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => alert(`Ping dispatched to ${fromUser.name} to unblock: ${d.dependencyDescription}`)}
                          className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-xs"
                          title="Ping Assignee via Slack/Email"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                        {task && (
                          <button
                            type="button"
                            onClick={() => onSelectTask(task)}
                            className="p-1 text-slate-400 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xs"
                            title="Inspect Task"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredDeps.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 dark:text-slate-500">
                    No dependencies matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
