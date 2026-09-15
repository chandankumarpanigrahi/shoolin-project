'use client';

import React, { useState } from 'react';
import {
  X,
  CheckSquare,
  Plus,
  Clock,
  Calendar,
  User,
  ArrowRight,
  GitBranch,
  CornerDownRight,
  ChevronRight,
  MessageSquare,
  History,
  AlertCircle,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/common/Badges';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useAppContext } from '@/components/providers/AppProvider';

export function TaskDetailDrawer({
  isOpen,
  onClose,
  task,
  allTasks,
  projects,
  users,
  dependencies,
  onUpdateTaskStatus,
  onAddChildTask,
  onSelectTask
}) {
  const { isCompletedStatus, getTaskStatuses, toggleTaskComplete } = useAppContext();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: "c-1",
      user: users[3] || users[0], // Priya Patel
      text: "Wireframes reviewed with PMV stakeholders. Moving into high-fidelity component implementation.",
      time: "Yesterday at 4:15 PM"
    }
  ]);

  const taskStatusesList = React.useMemo(() => {
    const list = getTaskStatuses ? getTaskStatuses() : [];
    if (list.length > 0) return list;
    return [
      { id: '1', name: 'Not Started', marksAsCompleted: false },
      { id: '2', name: 'In Progress', marksAsCompleted: false },
      { id: '3', name: 'Review', marksAsCompleted: false },
      { id: '4', name: 'Blocked', marksAsCompleted: false },
      { id: '5', name: 'Completed', marksAsCompleted: true },
    ];
  }, [getTaskStatuses]);

  if (!isOpen || !task) return null;

  const isTaskCompleted = isCompletedStatus ? isCompletedStatus(task.status) : (task.status === 'Completed');

  const project = projects.find(p => p.id === task.projectId) || { code: "PRJ", name: "Project" };
  const assignee = users.find(u => u.id === task.assignedTo) || { name: "Unassigned", role: "Member" };
  const creator = users.find(u => u.id === task.createdBy) || { name: "System Admin" };

  // Find parent task
  const parent = task.parentId ? allTasks.find(t => t.id === task.parentId) : null;

  // Find direct child tasks
  const childTasks = allTasks.filter(t => t.parentId === task.id);

  // Find linked dependencies
  const relatedDeps = dependencies.filter(d => d.relatedTaskId === task.id);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments([
      ...comments,
      {
        id: "c-" + Date.now(),
        user: users[0],
        text: commentText.trim(),
        time: "Just now"
      }
    ]);
    setCommentText('');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="h-14 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-xs font-bold text-brand bg-brand-light/30 border border-brand/30 px-2 py-0.5 rounded-sm">
              {task.code}
            </span>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <span className="font-medium text-slate-600 dark:text-slate-300 truncate">{project.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAddChildTask(task)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-brand bg-brand-light/30 hover:bg-brand-light/50 rounded-sm border border-brand/30 transition-colors"
              title="Add child task"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Child</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Parent Task Trail */}
          {parent && (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-sm flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <CornerDownRight className="w-4 h-4 text-brand shrink-0" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Parent Task:</span>
              <button
                type="button"
                onClick={() => onSelectTask(parent)}
                className="font-mono font-semibold text-brand hover:underline flex items-center gap-1"
              >
                {parent.code} · {parent.title}
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          )}

          {/* Title and Metadata Status Bar */}
          <div>
            <div className="flex items-start gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (toggleTaskComplete) toggleTaskComplete(task.id);
                  else onUpdateTaskStatus(task.id, isTaskCompleted ? 'In Progress' : 'Completed');
                }}
                className="mt-0.5 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                title={isTaskCompleted ? "Mark as Incomplete" : "Mark as Completed"}
              >
                {isTaskCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 hover:text-emerald-600 transition-transform active:scale-95" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-emerald-500 transition-colors active:scale-95" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <h2 className={`text-base font-bold leading-snug transition-colors ${
                  isTaskCompleted
                    ? 'line-through text-slate-400 dark:text-slate-500 opacity-80'
                    : 'text-slate-900 dark:text-slate-100'
                }`}>
                  {task.title}
                </h2>
                {isTaskCompleted && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Completed &amp; Resolved
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              {/* Status Select */}
              <div>
                <span className="block text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 mb-1">Status</span>
                <select
                  value={task.status}
                  onChange={(e) => onUpdateTaskStatus(task.id, e.target.value)}
                  className={`w-full px-2 py-1 border rounded-sm text-xs font-medium focus:outline-none focus:border-brand transition-colors ${
                    isTaskCompleted
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {!taskStatusesList.some((s) => s.name === task.status) && (
                    <option value={task.status}>{task.status}</option>
                  )}
                  {taskStatusesList.map((st) => (
                    <option key={st.id || st.name} value={st.name}>
                      {st.name} {st.marksAsCompleted ? '✓' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <span className="block text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 mb-1">Priority</span>
                <div className="py-1">
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>

              {/* Assignee */}
              <div>
                <span className="block text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 mb-1">Assignee</span>
                <div className="flex items-center gap-1.5 py-0.5">
                  <UserAvatar user={assignee} size="xs" />
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{assignee.name}</span>
                </div>
              </div>

              {/* Target Date */}
              <div>
                <span className="block text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 mb-1">Target Date</span>
                <div className="flex items-center gap-1 py-1 text-slate-700 dark:text-slate-300 font-mono">
                  <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  <span>{task.targetDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-1.5">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
              Description &amp; Specifications
            </h3>
            <div className="p-3 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-sm text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
              {task.description}
            </div>
          </div>

          {/* Child Subtasks Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-brand" />
                Child Tasks ({childTasks.length})
              </h3>
              <button
                type="button"
                onClick={() => onAddChildTask(task)}
                className="text-[11px] text-brand hover:underline font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Subtask
              </button>
            </div>

            {childTasks.length === 0 ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-sm text-center text-slate-400 dark:text-slate-500 text-xs">
                No child subtasks defined yet. Click &quot;Add Subtask&quot; to break this deliverable down.
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-700 rounded-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                {childTasks.map((ct) => {
                  const isCtCompleted = isCompletedStatus ? isCompletedStatus(ct.status) : (ct.status === 'Completed');
                  return (
                    <div
                      key={ct.id}
                      onClick={() => onSelectTask(ct)}
                      className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isCtCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                        <span className="font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-xs shrink-0">
                          {ct.code}
                        </span>
                        <span className={`font-medium truncate ${
                          isCtCompleted
                            ? 'line-through text-slate-400 dark:text-slate-500 opacity-80'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {ct.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={ct.status} size="xs" />
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-brand" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Linked Dependencies */}
          {relatedDeps.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-amber-500" />
                Dependencies &amp; Hand-offs ({relatedDeps.length})
              </h3>
              <div className="space-y-1.5">
                {relatedDeps.map(dep => (
                  <div key={dep.id} className="p-2.5 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/70 rounded-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-amber-900 dark:text-amber-300">{dep.dependencyDescription}</span>
                      <StatusBadge status={dep.status} size="xs" />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{dep.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity & Comments */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Activity Stream &amp; Notes
            </h3>

            {/* Comment List */}
            <div className="space-y-2.5">
              {comments.map((c) => (
                <div key={c.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 rounded-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <UserAvatar user={c.user} size="xs" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{c.user.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{c.time}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Leave an engineering update or review note..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs focus:outline-none focus:border-brand text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-semibold rounded-sm transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="h-11 px-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
          <span>Created on {task.createdDate} by {creator.name}</span>
          <span>Hierarchy Depth: Level {task.level || 0}</span>
        </div>
      </div>
    </div>
  );
}
