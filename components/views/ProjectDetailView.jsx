'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  Plus,
  Calendar,
  Clock,
  CheckSquare,
  Video,
  GitBranch,
  Link2,
  Activity,
  User,
  Users,
  Building,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  CornerDownRight,
  Sparkles,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { StatusBadge, PriorityBadge, ProjectTypeBadge } from '@/components/common/Badges';
import { UserAvatar, AvatarGroup } from '@/components/common/UserAvatar';
import { useAppContext } from '@/components/providers/AppProvider';

export function ProjectDetailView({
  project,
  allTasks,
  users,
  meetings,
  dependencies,
  links,
  onBack,
  onSelectTask,
  onOpenCreateTask,
  onOpenScheduleMeeting,
  onOpenAddDependency,
  onOpenAddLink,
  onUpdateTaskStatus
}) {
  const { isCompletedStatus, getTaskStatuses, toggleTaskComplete } = useAppContext();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tasks' | 'meetings' | 'dependencies' | 'links' | 'activity'
  
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

  const [expandedTasks, setExpandedTasks] = useState({
    'task-100': true,
    'task-101': true,
    'task-102': true,
    'task-107': true,
    'task-110': true,
    'task-200': true,
    'task-203': true,
    'task-206': true,
    'task-300': true,
    'task-303': true,
    'task-400': true,
    'task-402': true,
    'task-500': true,
    'task-503': true,
    'task-600': true,
    'task-700': true,
    'task-my-1': true
  });

  if (!project) return null;

  const projectTasks = allTasks.filter(t => t.projectId === project.id);
  const projectMeetings = meetings.filter(m => m.projectId === project.id);
  const projectDeps = dependencies.filter(d => d.projectId === project.id);
  const projectLinks = links.filter(l => l.brand === project.brand || l.brand === 'PMV');

  const ownerUser = users.find(u => u.id === project.owner) || users[0];
  const managerUser = users.find(u => u.id === project.manager) || users[1];
  const teamUsers = (project.team || []).map(id => users.find(u => u.id === id)).filter(Boolean);

  const completedCount = projectTasks.filter(t => t.status === 'Completed').length;
  const inProgressCount = projectTasks.filter(t => t.status === 'In Progress').length;
  const blockedCount = projectTasks.filter(t => t.status === 'Blocked').length;
  const reviewCount = projectTasks.filter(t => t.status === 'Review').length;

  const toggleTaskExpand = (taskId) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Build root tasks (parentId === null or not in this project)
  const rootTasks = projectTasks.filter(t => !t.parentId || !projectTasks.some(p => p.id === t.parentId));

  // Recursive task tree row renderer
  const renderTaskNode = (task, level = 0) => {
    const children = projectTasks.filter(t => t.parentId === task.id);
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedTasks[task.id];
    const assignee = users.find(u => u.id === task.assignedTo) || users[0];

    const isCompleted = isCompletedStatus ? isCompletedStatus(task.status) : (task.status === 'Completed');

    return (
      <React.Fragment key={task.id}>
        <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-pointer group transition-colors border-b border-slate-100 dark:border-slate-800">
          <td className="py-2.5 px-3">
            <div className="flex items-center gap-1.5" style={{ paddingLeft: `${level * 22}px` }}>
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaskExpand(task.id);
                  }}
                  className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xs"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <div className="w-4 flex items-center justify-center text-slate-300 dark:text-slate-600">
                  {level > 0 && <CornerDownRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />}
                </div>
              )}

              {/* Quick Completion Check Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (toggleTaskComplete) {
                    toggleTaskComplete(task.id);
                  } else {
                    onUpdateTaskStatus(task.id, isCompleted ? 'In Progress' : 'Completed');
                  }
                }}
                className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                title={isCompleted ? 'Mark as Incomplete' : 'Mark as Completed (Triggers Strikethrough)'}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 hover:text-emerald-600 transition-transform active:scale-90" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 hover:text-emerald-500 transition-colors active:scale-90" />
                )}
              </button>

              <span className="font-mono text-xs font-semibold text-brand bg-brand-light/30 border border-brand/30 px-1.5 py-0.2 rounded-xs shrink-0">
                {task.code}
              </span>

              <span
                onClick={() => onSelectTask(task)}
                className={`font-medium transition-colors truncate max-w-sm ml-1 ${
                  isCompleted
                    ? 'line-through text-slate-400 dark:text-slate-500 opacity-75'
                    : 'text-slate-900 dark:text-slate-100 group-hover:text-brand'
                }`}
              >
                {task.title}
              </span>
            </div>
          </td>

          <td className="py-2.5 px-3 whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <UserAvatar user={assignee} size="xs" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">{assignee.name.split(' ')[0]}</span>
            </div>
          </td>

          <td className="py-2.5 px-3 whitespace-nowrap">
            <PriorityBadge priority={task.priority} size="xs" />
          </td>

          <td className="py-2.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
            <select
              value={task.status}
              onChange={(e) => onUpdateTaskStatus(task.id, e.target.value)}
              className={`border rounded-xs px-1.5 py-0.5 text-xs font-medium focus:outline-none focus:border-brand bg-white dark:bg-slate-800 transition-colors ${
                isCompleted
                  ? 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40'
                  : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
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
          </td>

          <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-500 dark:text-slate-400 text-[11px]">
            {task.targetDate}
          </td>

          <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => onOpenCreateTask(task)}
                className="p-1 text-brand hover:bg-brand-light/30 rounded-xs font-semibold flex items-center gap-0.5 text-[11px]"
                title="Add Child Subtask"
              >
                <Plus className="w-3 h-3" />
                <span>Child</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTask(task)}
                className="p-1 text-slate-400 hover:text-brand rounded-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
        </tr>

        {hasChildren && isExpanded && children.map(child => renderTaskNode(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-4 pb-12 text-xs">
      {/* Top Banner Navigation & Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
              title="Back to all projects"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold text-brand bg-brand-light/30 border border-brand/30 px-2 py-0.5 rounded-sm">
                  {project.code}
                </span>
                <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">{project.name}</h1>
                <ProjectTypeBadge type={project.type} size="xs" />
                <StatusBadge status={project.status} size="xs" />
                <PriorityBadge priority={project.priority} size="xs" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                <span>{project.client}</span>
                <span>·</span>
                <span>Category: {project.category}</span>
                <span>·</span>
                <span>Budget: {project.budget}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenCreateTask(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover active:bg-brand-active rounded-sm shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </button>
            <button
              type="button"
              onClick={onOpenScheduleMeeting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-sm border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Video className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Sync Meet
            </button>
          </div>
        </div>

        {/* 6 Tabs Navigation Bar */}
        <div className="flex items-center gap-1 border-t border-slate-100 dark:border-slate-800 pt-3 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview', icon: Briefcase },
            { id: 'tasks', label: `Tasks (${projectTasks.length})`, icon: CheckSquare },
            { id: 'meetings', label: `Meetings (${projectMeetings.length})`, icon: Video },
            { id: 'dependencies', label: `Dependencies (${projectDeps.length})`, icon: GitBranch },
            { id: 'links', label: `Links (${projectLinks.length})`, icon: Link2 },
            { id: 'activity', label: 'Audit Trail', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-light/40 text-brand border border-brand/40 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Metrics summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Total Tasks</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">{projectTasks.length}</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">Completed</span>
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{completedCount}</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs">
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">In Progress</span>
              <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{inProgressCount}</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs">
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">Blocked / Review</span>
              <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">{blockedCount + reviewCount}</span>
            </div>
          </div>

          {/* Progress Banner */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Project Completion Velocity</span>
              <span className="font-mono font-bold text-brand">{project.progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-xs overflow-hidden">
              <div className="h-full bg-brand rounded-xs transition-all" style={{ width: `${project.progress}%` }} />
            </div>
          </div>

          {/* Details & Team Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-4 shadow-2xs space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Scope Description &amp; Objectives
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {project.description}
              </p>

              {project.type === 'recurring' && project.recurringConfig && (
                <div className="mt-3 p-3 bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-800/80 rounded-sm">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-900 dark:text-cyan-300 mb-1">
                    <RefreshCw className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    Recurring Cadence: {project.recurringConfig.frequency}
                  </div>
                  <p className="text-[11px] text-cyan-800 dark:text-cyan-400">
                    Cycle cut-off day: {project.recurringConfig.monthlyDay}th of every month. Next automated cycle triggers on <strong>{project.recurringConfig.nextCycleDate}</strong>.
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-4 shadow-2xs space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Key Stakeholders &amp; Assigned Squad
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/60 rounded-sm">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Accountable Owner</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{ownerUser.name}</p>
                  </div>
                  <UserAvatar user={ownerUser} size="xs" />
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/60 rounded-sm">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Technical Lead</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{managerUser.name}</p>
                  </div>
                  <UserAvatar user={managerUser} size="xs" />
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Assigned Engineers &amp; Designers</span>
                  <div className="space-y-1">
                    {teamUsers.map(u => (
                      <div key={u.id} className="flex items-center gap-2 py-1 px-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-sm">
                        <UserAvatar user={u} size="xs" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">{u.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TASKS HIERARCHICAL TREE */}
      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden space-y-0">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-brand" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Deliverables &amp; Hierarchical Subtasks</h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">({projectTasks.length} total)</span>
            </div>
            <button
              type="button"
              onClick={() => onOpenCreateTask(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-brand hover:bg-brand-hover active:bg-brand-active rounded-sm shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Task ID &amp; Deliverable Hierarchy</th>
                  <th className="py-2.5 px-3">Assignee</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rootTasks.map(t => renderTaskNode(t, 0))}
                {rootTasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500">
                      No tasks found in this project. Click &ldquo;Add Task&rdquo; to begin breaking down work.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MEETINGS */}
      {activeTab === 'meetings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Project Calendar &amp; Google Meet Syncs</h3>
            </div>
            <button
              type="button"
              onClick={onOpenScheduleMeeting}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Sync
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projectMeetings.map((m) => (
              <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{m.title}</span>
                  <StatusBadge status={m.status} size="xs" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  <span>{m.date} · {m.time}</span>
                  <a
                    href={m.meetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                  >
                    Join Meet
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
            {projectMeetings.length === 0 && (
              <div className="col-span-2 py-8 text-center text-slate-400 dark:text-slate-500">
                No meetings scheduled specifically for this project.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DEPENDENCIES */}
      {activeTab === 'dependencies' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Blockers &amp; Deliverable Dependencies</h3>
            </div>
            <button
              type="button"
              onClick={onOpenAddDependency}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 rounded-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Dependency
            </button>
          </div>

          <div className="space-y-2">
            {projectDeps.map(d => {
              const from = users.find(u => u.id === d.fromUser) || users[0];
              const to = users.find(u => u.id === d.toUser) || users[1];

              return (
                <div key={d.id} className="p-3 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/70 rounded-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-950 dark:text-amber-200">{d.dependencyDescription}</span>
                    <StatusBadge status={d.status} size="xs" />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">{d.details}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
                    <span>From: <strong>{from.name}</strong> → To: <strong>{to.name}</strong></span>
                    <span>Expected Unblock: {d.expectedDate}</span>
                  </div>
                </div>
              );
            })}
            {projectDeps.length === 0 && (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                No active blockers or dependencies logged for this project.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: LINKS */}
      {activeTab === 'links' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Brand &amp; Project External Resources</h3>
            </div>
            <button
              type="button"
              onClick={onOpenAddLink}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 border border-cyan-200 dark:border-cyan-800 rounded-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Pin Link
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projectLinks.map(l => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-sm hover:border-cyan-400 dark:hover:border-cyan-500 transition-colors block group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors flex items-center gap-1">
                    {l.name}
                    <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-cyan-600" />
                  </span>
                  <span className="text-[10px] font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950/60 px-1.5 py-0.2 rounded-xs">
                    {l.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">{l.description}</p>
                <span className="font-mono text-[10px] text-brand truncate block">{l.url}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs p-4 space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Immutable Audit Trail for {project.code}
          </h3>

          <div className="space-y-3">
            {[
              { text: "Sprint goals approved by PMV leadership", time: "Today at 9:00 AM", user: users[0] },
              { text: "Status changed to In Progress", time: "Yesterday at 2:30 PM", user: users[1] },
              { text: "Template instantiated with structured tasks", time: "Sep 08, 2026", user: users[2] },
              { text: "Budget allocation signed off ($35,000)", time: "Sep 05, 2026", user: users[0] }
            ].map((ev, i) => (
              <div key={i} className="flex items-start gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800 last:border-none">
                <UserAvatar user={ev.user} size="xs" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{ev.text}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{ev.time} · by {ev.user.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
