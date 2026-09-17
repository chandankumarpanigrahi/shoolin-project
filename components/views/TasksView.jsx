import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  CornerDownRight,
  Filter,
  ExternalLink,
  Layers,
  LayoutGrid,
  Download,
  ListTree,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/common/Badges';
import { UserAvatar } from '@/components/common/UserAvatar';
import { KanbanBoardView } from '@/components/views/KanbanBoardView';
import { useAppContext } from '@/components/providers/AppProvider';
import { useUrlParam } from '@/hooks/useUrlState';

export function TasksView({
  tasks,
  projects,
  users,
  onSelectTask,
  onOpenCreateTask,
  onUpdateTaskStatus,
  onCreateQuickTask
}) {
  const { isCompletedStatus, getTaskStatuses, toggleTaskComplete } = useAppContext();
  const [activeView, setActiveView] = useUrlParam('view', 'tree'); // 'tree' | 'kanban'
  const [quickTitle, setQuickTitle] = useState('');
  const [quickProjectId, setQuickProjectId] = useState(projects[0]?.id || '');
  const [quickPriority, setQuickPriority] = useState('Medium');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedAssignee, setSelectedAssignee] = useState('ALL');

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

  const taskStatusesList = useMemo(() => {
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

  const toggleTaskExpand = (taskId) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchCode = t.code.toLowerCase().includes(q);
      if (!matchTitle && !matchCode) return false;
    }
    if (selectedProject !== 'ALL' && t.projectId !== selectedProject) return false;
    if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false;
    if (selectedPriority !== 'ALL' && t.priority !== selectedPriority) return false;
    if (selectedAssignee !== 'ALL' && t.assignedTo !== selectedAssignee) return false;
    return true;
  });

  // If filtered by search or dropdown, render flat list; otherwise render hierarchical tree
  const isFiltering = searchQuery.trim() !== '' || selectedProject !== 'ALL' || selectedStatus !== 'ALL' || selectedPriority !== 'ALL' || selectedAssignee !== 'ALL';

  const rootTasks = filteredTasks.filter(t => !t.parentId || !tasks.some(p => p.id === t.parentId));

  const exportToCSV = () => {
    const headers = ['Task Code', 'Title', 'Project', 'Assignee', 'Priority', 'Status', 'Target Date'];
    const rows = filteredTasks.map(t => {
      const project = projects.find(p => p.id === t.projectId)?.name || '';
      const assignee = users.find(u => u.id === t.assignedTo)?.name || '';
      return [
        `"${t.code || ''}"`,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${project.replace(/"/g, '""')}"`,
        `"${assignee}"`,
        `"${t.priority || 'Medium'}"`,
        `"${t.status || 'Not Started'}"`,
        `"${t.targetDate || ''}"`
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pulsepm_tasks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    const targetProject = projects.find(p => p.id === quickProjectId) || projects[0];
    const projectTaskCount = tasks.filter(t => t.projectId === targetProject.id).length + 1;
    const newTask = {
      id: 'task-' + Date.now(),
      code: `${targetProject.code}.${projectTaskCount}`,
      title: quickTitle.trim(),
      projectId: targetProject.id,
      assignedTo: users[0]?.id || 'usr-1',
      status: 'Not Started',
      priority: quickPriority,
      createdDate: new Date().toISOString().slice(0, 10),
      targetDate: '2026-10-15',
      level: 0,
      description: 'Quick added deliverable.',
      parentId: null
    };

    if (onCreateQuickTask) {
      onCreateQuickTask(newTask);
    }
    setQuickTitle('');
  };

  const renderRow = (task, level = 0) => {
    const children = tasks.filter(t => t.parentId === task.id);
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedTasks[task.id];
    const project = projects.find(p => p.id === task.projectId) || { code: "PRJ", name: "Project" };
    const assignee = users.find(u => u.id === task.assignedTo) || users[0];

    const isCompleted = isCompletedStatus ? isCompletedStatus(task.status) : (task.status === 'Completed');

    return (
      <React.Fragment key={task.id}>
        <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-pointer group transition-colors border-b border-slate-100 dark:border-slate-800">
          <td className="py-2.5 px-3">
            <div className="flex items-center gap-1.5" style={{ paddingLeft: isFiltering ? 0 : `${level * 22}px` }}>
              {!isFiltering && hasChildren ? (
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
                !isFiltering && (
                  <div className="w-4 flex items-center justify-center text-slate-300 dark:text-slate-600">
                    {level > 0 && <CornerDownRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />}
                  </div>
                )
              )}

              {/* Quick Completion Checkbox Button */}
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

          {/* Project */}
          <td className="py-2.5 px-3 whitespace-nowrap">
            <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded-xs mr-1">
              {project.code}
            </span>
            <span className="text-slate-700 dark:text-slate-300 text-xs truncate max-w-[120px] inline-block align-middle">
              {project.name}
            </span>
          </td>

          {/* Assignee */}
          <td className="py-2.5 px-3 whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <UserAvatar user={assignee} size="xs" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">{assignee.name.split(' ')[0]}</span>
            </div>
          </td>

          {/* Priority */}
          <td className="py-2.5 px-3 whitespace-nowrap">
            <PriorityBadge priority={task.priority} size="xs" />
          </td>

          {/* Status Dropdown */}
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

          {/* Target Date */}
          <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-500 dark:text-slate-400 text-[11px]">
            {task.targetDate}
          </td>

          {/* Actions */}
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
                title="View Task Details"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
        </tr>

        {!isFiltering && hasChildren && isExpanded && children.map(child => renderRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-4 pb-12 text-xs">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-light/30 text-brand flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Task Master Matrix</h1>
            <span className="text-xs px-2 py-0.5 bg-brand-light/30 text-brand font-mono font-bold rounded-full border border-brand/30">
              {filteredTasks.length} tasks
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Infinite nesting hierarchy with deliverable code prefixes across all projects
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Tree vs Kanban Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveView('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeView === 'tree'
                  ? 'bg-white dark:bg-slate-900 text-brand shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ListTree className="w-3.5 h-3.5" />
              <span>Tree Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeView === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-brand shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
          </div>

          {/* Export to CSV */}
          <button
            type="button"
            onClick={exportToCSV}
            title="Download CSV report of tasks"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Create Task Button */}
          <button
            type="button"
            onClick={() => onOpenCreateTask(null)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by code (PMV-001.1) or task title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-brand text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand font-medium"
          >
            <option value="ALL">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand font-medium shadow-2xs"
          >
            <option value="ALL">All Statuses</option>
            {taskStatusesList.map((st) => (
              <option key={st.id || st.name} value={st.name}>
                {st.name} {st.marksAsCompleted ? '(Completed)' : ''}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand font-medium shadow-2xs"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand font-medium shadow-2xs"
          >
            <option value="ALL">All Assignees</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {isFiltering && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedProject('ALL');
                setSelectedStatus('ALL');
                setSelectedPriority('ALL');
                setSelectedAssignee('ALL');
              }}
              className="text-xs text-brand hover:underline px-1.5 font-bold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Tasks View: Tree Matrix or Kanban Board */}
      {activeView === 'kanban' ? (
        <KanbanBoardView
          tasks={filteredTasks}
          projects={projects}
          users={users}
          onSelectTask={onSelectTask}
          onUpdateTaskStatus={onUpdateTaskStatus}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
                  <th className="py-3 px-3.5">Deliverable &amp; Task Hierarchy</th>
                  <th className="py-3 px-3.5">Project</th>
                  <th className="py-3 px-3.5">Assignee</th>
                  <th className="py-3 px-3.5">Priority</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">Target Date</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {isFiltering
                  ? filteredTasks.map(t => renderRow(t, 0))
                  : rootTasks.map(t => renderRow(t, 0))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                      No tasks match the selected search or filter criteria.
                    </td>
                  </tr>
                )}

                {/* Inline Quick Add Row */}
                <tr className="bg-brand-light/10 border-t border-dashed border-brand/20">
                  <td colSpan={7} className="py-3 px-3.5">
                    <form onSubmit={handleQuickAdd} className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                      <div className="w-6 h-6 rounded-md bg-brand-light/30 text-brand flex items-center justify-center shrink-0">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        placeholder="Quick add deliverable in 2 seconds... (press Enter)"
                        className="flex-1 min-w-[220px] px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand shadow-2xs"
                      />
                      <select
                        value={quickProjectId}
                        onChange={(e) => setQuickProjectId(e.target.value)}
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 font-medium shrink-0 shadow-2xs"
                      >
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.code} ({p.name})</option>
                        ))}
                      </select>
                      <select
                        value={quickPriority}
                        onChange={(e) => setQuickPriority(e.target.value)}
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 font-medium shrink-0 shadow-2xs"
                      >
                        <option value="Urgent">Urgent</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                      <button
                        type="submit"
                        disabled={!quickTitle.trim()}
                        className="px-3.5 py-1.5 bg-brand hover:bg-brand-hover active:bg-brand-active disabled:opacity-40 text-white font-bold rounded-lg text-xs transition-all shadow-xs shrink-0"
                      >
                        Quick Add
                      </button>
                    </form>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
