'use client';

import React, { useState, useMemo } from 'react';
import {
  Target,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Plus,
  Filter,
  CheckSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/common/Badges';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useAppContext } from '@/components/providers/AppProvider';

export function MyFocusView({
  currentUser,
  tasks = [],
  projects = [],
  users = [],
  onSelectTask,
  onUpdateTaskStatus,
  onOpenCreateTask,
  onOpenPersonalTodo
}) {
  const { isCompletedStatus, toggleTaskComplete } = useAppContext();
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Filter tasks belonging to currentUser
  const myTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchAssignee = t.assigneeId === currentUser?.id ||
        t.assignedTo === currentUser?.name ||
        t.assignedTo === currentUser?.id;
      return matchAssignee;
    });
  }, [tasks, currentUser]);

  const todayStr = new Date().toISOString().split('T')[0];

  const categorizedTasks = useMemo(() => {
    let filtered = myTasks;
    if (filterPriority !== 'ALL') {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }

    const overdue = [];
    const today = [];
    const upcoming = [];
    const completed = [];

    filtered.forEach(task => {
      const isComp = isCompletedStatus ? isCompletedStatus(task.status) : task.status === 'Completed';
      if (isComp) {
        completed.push(task);
      } else if (task.dueDate && task.dueDate < todayStr) {
        overdue.push(task);
      } else if (task.dueDate && task.dueDate === todayStr) {
        today.push(task);
      } else {
        upcoming.push(task);
      }
    });

    return { overdue, today, upcoming, completed };
  }, [myTasks, filterPriority, todayStr, isCompletedStatus]);

  const totalAssigned = myTasks.length;
  const totalCompleted = myTasks.filter(t => isCompletedStatus ? isCompletedStatus(t.status) : t.status === 'Completed').length;
  const inProgress = myTasks.filter(t => t.status === 'In Progress').length;
  const blockedCount = myTasks.filter(t => t.status === 'Blocked' || (t.dueDate && t.dueDate < todayStr && !(isCompletedStatus ? isCompletedStatus(t.status) : t.status === 'Completed'))).length;
  const completionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  const getProjectName = (projectId) => {
    const p = projects.find(proj => proj.id === projectId);
    return p ? p.name : 'General Project';
  };

  const cycleStatus = (e, task) => {
    e.stopPropagation();
    if (toggleTaskComplete) {
      toggleTaskComplete(task.id);
    } else if (onUpdateTaskStatus) {
      const isComp = isCompletedStatus ? isCompletedStatus(task.status) : task.status === 'Completed';
      onUpdateTaskStatus(task.id, isComp ? 'In Progress' : 'Completed');
    }
  };

  const renderTaskRow = (task, isOverdue = false) => {
    const isCompleted = isCompletedStatus ? isCompletedStatus(task.status) : task.status === 'Completed';
    return (
      <div
        key={task.id}
        onClick={() => onSelectTask && onSelectTask(task)}
        className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm hover:border-brand hover:shadow-2xs transition-all cursor-pointer gap-2.5"
      >
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={(e) => cycleStatus(e, task)}
            title={isCompleted ? "Mark incomplete" : "Mark completed (configured in Statuses Master)"}
            className={`mt-0.5 sm:mt-0 w-5 h-5 rounded-xs border flex items-center justify-center shrink-0 transition-all ${
              isCompleted
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                : task.status === 'In Progress'
                ? 'border-brand bg-brand-subtle text-brand'
                : 'border-slate-300 dark:border-slate-600 hover:border-brand'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : task.status === 'In Progress' ? (
              <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            ) : null}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold ${
                isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500 opacity-75'
                  : 'text-slate-900 dark:text-slate-100 group-hover:text-brand'
              }`}>
                {task.title}
              </span>
              {task.parentTaskId && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-xs bg-brand-subtle text-brand border border-brand-border">
                  Subtask
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                {getProjectName(task.projectId)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.estimatedHours || 4}h
              </span>
              {task.subtasks && task.subtasks.length > 0 && (
                <>
                  <span>•</span>
                  <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          {task.dueDate && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-xs flex items-center gap-1 ${
              isOverdue
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}>
              <Calendar className="w-3 h-3" />
              {task.dueDate}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-brand" />
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              My Focus &amp; Deliverables
            </h1>
            <span className="text-[11px] px-2 py-0.5 bg-brand-light/30 text-brand font-mono font-semibold rounded-xs border border-brand/30">
              Assigned to {currentUser?.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Prioritized daily view of all active deliverables, overdue actions, and sprint milestones assigned directly to you across all projects.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenPersonalTodo}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>Scratchpad</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenCreateTask && onOpenCreateTask()}
            className="px-3.5 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-xs shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deliverable</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Assigned</span>
            <div className="w-7 h-7 rounded-xs bg-brand-light/30 text-brand flex items-center justify-center">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {totalAssigned}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
            Across {new Set(myTasks.map(t => t.projectId)).size} projects
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">In Progress</span>
            <div className="w-7 h-7 rounded-xs bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">
            {inProgress}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
            Currently active items
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Attention Needed</span>
            <div className="w-7 h-7 rounded-xs bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 font-mono">
            {blockedCount}
          </div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5 block font-medium">
            Overdue or Blocked
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completion Rate</span>
            <div className="w-7 h-7 rounded-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {completionRate}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Filter Priority:
          </span>
          <div className="flex items-center gap-1 ml-1.5">
            {['ALL', 'Urgent', 'High', 'Medium', 'Low'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-xs transition-all ${
                  filterPriority === p
                    ? 'bg-brand text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Showing {categorizedTasks.overdue.length + categorizedTasks.today.length + categorizedTasks.upcoming.length + categorizedTasks.completed.length} tasks
        </div>
      </div>

      {/* Categorized Sections */}
      <div className="space-y-4">
        {/* 1. Overdue Section */}
        {categorizedTasks.overdue.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-2">
                Overdue Actions ({categorizedTasks.overdue.length})
              </h2>
            </div>
            <div className="space-y-1.5">
              {categorizedTasks.overdue.map(task => renderTaskRow(task, true))}
            </div>
          </div>
        )}

        {/* 2. Today's Due Deliverables */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Due Today ({categorizedTasks.today.length})
            </h2>
          </div>
          {categorizedTasks.today.length === 0 ? (
            <div className="p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-sm text-center text-xs text-slate-400">
              No deliverables scheduled specifically for today. Focus on upcoming sprint milestones!
            </div>
          ) : (
            <div className="space-y-1.5">
              {categorizedTasks.today.map(task => renderTaskRow(task, false))}
            </div>
          )}
        </div>

        {/* 3. Upcoming Sprint Deliverables */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Upcoming Milestones &amp; Tasks ({categorizedTasks.upcoming.length})
            </h2>
          </div>
          {categorizedTasks.upcoming.length === 0 ? (
            <div className="p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-sm text-center text-xs text-slate-400">
              No upcoming tasks pending.
            </div>
          ) : (
            <div className="space-y-1.5">
              {categorizedTasks.upcoming.map(task => renderTaskRow(task, false))}
            </div>
          )}
        </div>

        {/* 4. Completed Deliverables */}
        {categorizedTasks.completed.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                Completed Deliverables ({categorizedTasks.completed.length})
              </h2>
            </div>
            <div className="space-y-1.5 opacity-80 hover:opacity-100 transition-opacity">
              {categorizedTasks.completed.map(task => renderTaskRow(task, false))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
