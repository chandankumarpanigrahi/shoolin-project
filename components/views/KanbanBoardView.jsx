'use client';

import React from 'react';
import {
  CheckSquare,
  Clock,
  Calendar,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  FolderGit2,
  Layers,
  CircleDot
} from 'lucide-react';
import { PriorityBadge } from '@/components/common/Badges';
import { UserAvatar, resolveUserObject, isTaskAssignee } from '@/components/common/UserAvatar';
import { useAppContext } from '@/components/providers/AppProvider';
import { showError } from '@/lib/swal';
import { formatDate } from '@/lib/dateUtils';

const COLUMNS = [
  {
    id: 'Not Started',
    title: 'Not Started / Backlog',
    accentColor: 'from-slate-400 to-slate-500',
    headerBg: 'bg-slate-50 dark:bg-slate-900',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
  },
  {
    id: 'In Progress',
    title: 'In Progress',
    accentColor: 'from-blue-500 to-indigo-600',
    headerBg: 'bg-blue-50/50 dark:bg-blue-950/30',
    dot: 'bg-blue-500 animate-pulse',
    badge: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
  },
  {
    id: 'Review',
    title: 'In Review',
    accentColor: 'from-amber-400 to-amber-500',
    headerBg: 'bg-amber-50/50 dark:bg-amber-950/30',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
  },
  {
    id: 'Blocked',
    title: 'Blocked',
    accentColor: 'from-rose-500 to-red-600',
    headerBg: 'bg-rose-50/50 dark:bg-rose-950/30',
    dot: 'bg-rose-500 animate-pulse',
    badge: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
  },
  {
    id: 'Completed',
    title: 'Done / Completed',
    accentColor: 'from-emerald-400 to-emerald-600',
    headerBg: 'bg-emerald-50/50 dark:bg-emerald-950/30',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
  }
];

export function KanbanBoardView({
  tasks,
  projects,
  users,
  onSelectTask,
  onUpdateTaskStatus
}) {
  const { isCompletedStatus, currentUser } = useAppContext();
  const columnOrder = ['Not Started', 'In Progress', 'Review', 'Blocked', 'Completed'];

  const moveTask = (task, direction, currentStatus) => {
    const isAssignee = isTaskAssignee(task, currentUser, users);
    if (!isAssignee) {
      const assignee = resolveUserObject(task.assigneeId || task.assignedTo, users);
      showError(
        'Access Denied',
        `Only the assigned member (${assignee?.name || 'assignee'}) can change the status of this task.`
      );
      return;
    }
    const currentIndex = columnOrder.indexOf(currentStatus);
    if (currentIndex === -1) return;
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < columnOrder.length) {
      onUpdateTaskStatus(task.id, columnOrder[nextIndex]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="border border-slate-200/90 dark:border-slate-800 rounded-md overflow-hidden flex flex-col max-h-[82vh] shadow-sm bg-slate-50/60 dark:bg-slate-900/60"
          >
            {/* Column Header */}
            <div className={`p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between ${col.headerBg}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  {col.title}
                </span>
              </div>
              <span className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded-full border border-slate-200/60 dark:border-slate-700/60 ${col.badge}`}>
                {colTasks.length}
              </span>
            </div>

            {/* Column Tasks Body */}
            <div className="p-3 overflow-y-auto space-y-3 flex-1">
              {colTasks.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No tasks in {col.id}
                </div>
              ) : (
                colTasks.map((t) => {
                  const project = (projects || []).find((p) => p.id === t.projectId || p._id === t.projectId || p.code === t.projectId);
                  const assignee = t.assignedTo ? resolveUserObject(t.assigneeId || t.assignedTo, users) : null;
                  const subtasks = tasks.filter((st) => st.parentId === t.id);
                  const isCompleted = isCompletedStatus ? isCompletedStatus(t.status) : t.status === 'Completed';
                  const completedSubtasks = subtasks.filter(s => isCompletedStatus ? isCompletedStatus(s.status) : s.status === 'Completed').length;
                  const progressPct = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;
                  const isAssignee = isTaskAssignee(t, currentUser, users);

                  return (
                    <div
                      key={t.id}
                      className={`p-3.5 bg-white dark:bg-slate-900 border rounded-xl shadow-xs hover:border-brand hover:shadow-md transition-all space-y-3 cursor-pointer group relative overflow-hidden ${
                        isCompleted ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/10' : 'border-slate-200/90 dark:border-slate-800'
                      }`}
                      onClick={() => onSelectTask(t)}
                    >
                      {/* Left color bar matching project */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                        style={{ backgroundColor: isCompleted ? '#10b981' : (project?.color || 'var(--brand-primary)') }}
                      />

                      {/* Top Bar: Code + Priority */}
                      <div className="flex items-center justify-between gap-1.5 pl-1">
                        <div className="flex items-center gap-1.5">
                          {isCompleted && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                          <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isCompleted 
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              : 'text-brand bg-brand-subtle border-brand-border'
                          }`}>
                            {t.code}
                          </span>
                        </div>
                        <PriorityBadge priority={t.priority} size="xs" />
                      </div>

                      {/* Title */}
                      <h4 className={`font-bold text-xs line-clamp-2 leading-snug pl-1 transition-colors ${
                        isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500 opacity-75'
                          : 'text-slate-900 dark:text-slate-100 group-hover:text-brand'
                      }`}>
                        {t.title}
                      </h4>

                      {/* Project Name Pill with Color Dot */}
                      {project && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 pl-1">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: project.color || '#6366f1' }}
                          />
                          <span className="truncate font-medium">{project.name}</span>
                        </div>
                      )}

                      {/* Subtask progress bar if subtasks exist */}
                      {subtasks.length > 0 && (
                        <div className="pl-1 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Subtasks</span>
                            <span className="font-semibold text-slate-600 dark:text-slate-300">
                              {completedSubtasks}/{subtasks.length} ({progressPct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer: Date (From → To) & Assignee */}
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 pl-1 font-mono">
                        <div className="flex items-center gap-1.5 truncate mr-2" title={`From: ${formatDate(t.startDate || t.fromDate)} | To: ${formatDate(t.dueDate || t.toDate || t.targetDate || t.endDate)}`}>
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate text-slate-600 dark:text-slate-300 font-medium">
                            {t.startDate || t.fromDate ? `${formatDate(t.startDate || t.fromDate)} → ` : ''}{formatDate(t.dueDate || t.toDate || t.targetDate || t.endDate, 'Sprint')}
                          </span>
                        </div>

                        {assignee && (
                          <UserAvatar user={assignee} size="xs" />
                        )}
                      </div>

                      {/* Quick Move Workflow Buttons */}
                      <div
                        className="pt-1 flex items-center justify-between gap-1.5 pl-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          disabled={!isAssignee || col.id === 'Not Started'}
                          onClick={() => moveTask(t, -1, t.status)}
                          className={`px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 transition-colors ${
                            !isAssignee ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                          title={
                            !isAssignee
                              ? `Only assigned member (${assignee?.name || 'assignee'}) can move task`
                              : 'Move to previous column'
                          }
                        >
                          <ChevronLeft className="w-3 h-3" />
                          <span>Prev</span>
                        </button>

                        <button
                          type="button"
                          disabled={!isAssignee || col.id === 'Completed'}
                          onClick={() => moveTask(t, 1, t.status)}
                          className={`px-2.5 py-1 bg-brand-light/30 hover:bg-brand-light/50 text-brand border border-brand/30 rounded-lg text-[10px] font-semibold disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 transition-colors ml-auto ${
                            !isAssignee ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                          title={
                            !isAssignee
                              ? `Only assigned member (${assignee?.name || 'assignee'}) can move task`
                              : 'Advance to next column'
                          }
                        >
                          <span>Next</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
