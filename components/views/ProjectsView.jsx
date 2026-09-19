'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  ChevronDown,
  ArrowUpDown,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Edit,
  Clock,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { StatusBadge, PriorityBadge, ProjectTypeBadge } from '@/components/common/Badges';
import { UserAvatar, AvatarGroup, resolveUserObject } from '@/components/common/UserAvatar';
import { useAppContext } from '@/components/providers/AppProvider';
import { useUrlParam } from '@/hooks/useUrlState';
import Swal, { showConfirm, showSuccess } from '@/lib/swal';

export function ProjectsView({
  projects,
  tasks = [],
  users,
  onSelectProject,
  onEditProject,
  onUpdateProject,
  onOpenCreateProject,
  onOpenCreateFromTemplate,
  onOpenCreateTaskForProject,
  onDeleteProject,
  onRestoreProject
}) {
  const { can, handleOpenEditProject, isCompletedStatus, isProjectAccessibleToUser, currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useUrlParam('tab', 'active'); // 'active' | 'deleted'
  const [viewMode, setViewMode] = useUrlParam('view', 'table'); // 'table' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  // Filter projects by active vs deleted status and user accessibility
  const activeProjectsList = (projects || []).filter(
    (p) => p && !p.isDeleted && p.status !== 'Deleted' && (isProjectAccessibleToUser ? isProjectAccessibleToUser(p, currentUser) : true)
  );
  const deletedProjectsList = (projects || []).filter(
    (p) => p && (p.isDeleted === true || p.status === 'Deleted') && (isProjectAccessibleToUser ? isProjectAccessibleToUser(p, currentUser) : true)
  );
  const currentTabProjects = activeTab === 'active' ? activeProjectsList : deletedProjectsList;

  // Filter current tab projects by search and filter selects
  const filteredProjects = currentTabProjects.filter((p) => {
    if (!p) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchCode = (p.code || '').toLowerCase().includes(q);
      const matchClient = (p.client || '').toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchClient) return false;
    }
    if (selectedBrand !== 'ALL' && (p.brand || 'PMV') !== selectedBrand) return false;
    if (selectedType !== 'ALL' && (p.type || 'one-time') !== selectedType) return false;
    if (selectedStatus !== 'ALL' && (p.status || 'In Progress') !== selectedStatus) return false;
    if (selectedPriority !== 'ALL' && (p.priority || 'Medium') !== selectedPriority) return false;
    return true;
  });

  // Soft Delete Handler (Move to Deleted tab with SweetAlert confirm)
  const handleSoftDelete = async (project) => {
    const targetId = project.id || project._id;
    const projName = project.name || project.code || 'this project';

    const confirmed = await showConfirm({
      title: 'Move Project to Deleted?',
      text: `Do you want to move project "${projName}" to the Deleted tab?`,
      icon: 'warning',
      confirmButtonText: 'Yes, Move to Deleted',
      cancelButtonText: 'Cancel',
    });

    if (confirmed) {
      if (onDeleteProject) {
        await onDeleteProject(targetId, { permanent: false });
      } else if (onUpdateProject) {
        await onUpdateProject(targetId, { isDeleted: true, status: 'Deleted' });
      }
      showSuccess('Moved to Deleted Tab', `"${projName}" has been moved to the Deleted tab.`);
    }
  };

  // Restore Project Handler
  const handleRestoreProject = async (project) => {
    const targetId = project.id || project._id;
    const projName = project.name || project.code || 'this project';

    if (onRestoreProject) {
      await onRestoreProject(targetId);
    } else if (onUpdateProject) {
      await onUpdateProject(targetId, { isDeleted: false, status: 'In Progress' });
    }
    showSuccess('Project Restored', `"${projName}" is back in active projects.`);
  };

  // Permanent Delete Handler (Step 1: Yes/No SweetAlert -> Step 2: Type "Delete" modal -> Permanent deletion)
  const handlePermanentDelete = async (project) => {
    const targetId = project.id || project._id;
    const projName = project.name || project.code || 'this project';

    // Step 1: Yes/No Confirmation Sheet/Alert
    const step1Confirmed = await showConfirm({
      title: 'Permanently Delete Project?',
      text: `Are you sure you want to permanently delete "${projName}"? This action CANNOT be undone.`,
      icon: 'warning',
      confirmButtonText: 'Yes, Proceed to Delete',
      cancelButtonText: 'No, Keep Project',
    });

    if (!step1Confirmed) return;

    // Step 2: Modal requiring user to type "Delete" exactly
    const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

    const { value: typedText } = await Swal.fire({
      title: 'Confirm Permanent Deletion',
      html: `To permanently delete <strong class="text-rose-600 font-bold">${projName}</strong>, type <span class="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono px-2 py-0.5 rounded font-bold">Delete</span> below:`,
      input: 'text',
      inputPlaceholder: 'Type Delete here...',
      showCancelButton: true,
      confirmButtonText: 'Permanently Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#e11d48',
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#f8fafc' : '#0f172a',
      customClass: {
        popup: isDark
          ? 'border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl'
          : 'border border-slate-200 rounded-2xl shadow-2xl',
        title: 'text-lg font-bold tracking-tight text-rose-600 dark:text-rose-400',
        htmlContainer: 'text-xs text-slate-500 dark:text-slate-400',
        input:
          'text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 mx-auto max-w-xs focus:ring-2 focus:ring-rose-500',
        confirmButton:
          'px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-500/25 transition-all mx-1.5 cursor-pointer',
        cancelButton:
          'px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all mx-1.5 cursor-pointer',
      },
      buttonsStyling: false,
      inputValidator: (value) => {
        if (!value || value.trim() !== 'Delete') {
          return 'You must type "Delete" exactly (case-sensitive) to confirm!';
        }
      },
    });

    if (typedText === 'Delete') {
      await onDeleteProject(targetId, { permanent: true });
      showSuccess('Project Permanently Deleted', `"${projName}" has been permanently removed.`);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* View Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand" />
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Project Portfolio</h1>
            <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium rounded-xs">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Enterprise roadmap, fixed-scope sprints, and recurring retainers
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 rounded-sm">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xs transition-colors ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-brand shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Table View (Default)"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xs transition-colors ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-brand shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {can('templates.launch') && (
            <button
              type="button"
              onClick={onOpenCreateFromTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-text bg-brand-subtle hover:bg-brand-light rounded-sm border border-brand-border transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-brand" />
              From Template
            </button>
          )}

          {can('projects.create') && (
            <button
              type="button"
              onClick={onOpenCreateProject}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover active:bg-brand-hover rounded-sm shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </button>
          )}
        </div>
      </div>

      {/* Active vs Deleted Projects Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'active'
              ? 'border-brand text-brand bg-white dark:bg-slate-900 rounded-t-sm shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Active Projects</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'active'
                ? 'bg-brand text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {activeProjectsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('deleted')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'deleted'
              ? 'border-rose-600 text-rose-600 bg-white dark:bg-slate-900 rounded-t-sm shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          <span>Deleted Projects</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'deleted'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {deletedProjectsList.length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by code (PMV-001), name, or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-brand text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand font-medium"
          >
            <option value="ALL">All Brands</option>
            <option value="PMV">PMV Global</option>
            <option value="FreshPod">FreshPod</option>
            <option value="Lagos">Lagos</option>
            <option value="Aura">Aura FinTech</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand font-medium"
          >
            <option value="ALL">All Types</option>
            <option value="one-time">One Time</option>
            <option value="recurring">Recurring</option>
          </select>

          {/* Status Filter */}
          {activeTab === 'active' && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Planning">Planning</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
              <option value="Delayed">Delayed</option>
            </select>
          )}

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand font-medium"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {(searchQuery || selectedBrand !== 'ALL' || selectedType !== 'ALL' || selectedStatus !== 'ALL' || selectedPriority !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedBrand('ALL');
                setSelectedType('ALL');
                setSelectedStatus('ALL');
                setSelectedPriority('ALL');
              }}
              className="text-xs text-brand hover:underline px-1 font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* EMPTY STATE */}
      {filteredProjects.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-12 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {activeTab === 'active' ? 'No Active Projects Found' : 'No Deleted Projects'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {searchQuery
                ? 'No project matches your search criteria.'
                : activeTab === 'active'
                ? 'No active projects in portfolio.'
                : 'Recycle bin is clean. No soft-deleted projects here.'}
            </p>
          </div>
          {activeTab === 'active' && can('projects.create') && (
            <button
              type="button"
              onClick={onOpenCreateProject}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-sm shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </button>
          )}
        </div>
      )}

      {/* TABLE VIEW */}
      {filteredProjects.length > 0 && viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
                  <th className="py-2.5 px-3 w-10 text-center font-bold">#</th>
                  <th className="py-2.5 px-3">Project Code</th>
                  <th className="py-2.5 px-3">Project Name</th>
                  <th className="py-2.5 px-3">Client / Brand</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Owner</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 w-32">Progress</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProjects.map((p, index) => {
                  const targetOwnerId = p.ownerId || p.owner;
                  const ownerUser = resolveUserObject(targetOwnerId, users) || (users && users[0]) || { name: 'Owner', role: 'Member' };
                  const ownerDisplayName = ownerUser?.name || 'Owner';
                  const rawTeam = (p.teamIds && p.teamIds.length > 0) ? p.teamIds : (p.team && p.team.length > 0) ? p.team : [targetOwnerId, p.managerId || p.manager].filter(Boolean);
                  const teamIds = Array.from(new Set(rawTeam));

                  const projTasks = (tasks || []).filter((t) => {
                    if (!t) return false;
                    if (t.projectId === p.id || t.projectId === p._id || t.projectId === p.code) return true;
                    if (t.parentId) {
                      const parent = (tasks || []).find((pt) => pt && (pt.id === t.parentId || pt._id === t.parentId || pt.code === t.parentId));
                      if (parent && (parent.projectId === p.id || parent.projectId === p._id || parent.projectId === p.code)) return true;
                    }
                    return false;
                  });

                  const projCompletedCount = projTasks.filter((t) => (isCompletedStatus ? isCompletedStatus(t.status) : t.status === 'Completed')).length;
                  const liveProgress = projTasks.length > 0 ? Math.round((projCompletedCount / projTasks.length) * 100) : (p.progress || 0);

                  const hasBlockedOrRisk = projTasks.some((t) => {
                    const norm = (t.status || '').toLowerCase();
                    return norm.includes('block') || norm.includes('risk') || norm.includes('delay');
                  });

                  const activeTasks = projTasks.filter((t) => !(isCompletedStatus ? isCompletedStatus(t.status) : t.status === 'Completed'));
                  const allReview = activeTasks.length > 0 && activeTasks.every((t) => (t.status || '').toLowerCase().includes('review'));

                  const liveStatus = activeTab === 'deleted'
                    ? 'Deleted'
                    : projTasks.length > 0 && projCompletedCount === projTasks.length
                    ? 'Completed'
                    : hasBlockedOrRisk
                    ? 'At Risk'
                    : allReview
                    ? 'Review'
                    : (p.status || 'In Progress');

                  return (
                    <tr
                      key={p.id || p._id || p.code}
                      onClick={() => onSelectProject(p)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                    >
                      {/* Serial Number */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-400 dark:text-slate-500 text-[11px] select-none">
                        {index + 1}
                      </td>

                      {/* Code */}
                      <td className="py-3 px-3 font-mono font-bold text-brand whitespace-nowrap">
                        {p.code || 'PRJ'}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand transition-colors">
                        <div className="max-w-xs truncate">{p.name || 'Untitled Project'}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">{p.category || 'General'}</div>
                      </td>

                      {/* Client / Brand */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{p.client || 'PMV'}</span>
                        <span className="ml-1.5 text-[10px] px-1 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono rounded-xs">
                          {p.brand || 'PMV'}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <ProjectTypeBadge type={p.type || 'one-time'} size="xs" />
                        {p.type === 'recurring' && p.recurringConfig && (
                          <div className="text-[10px] text-cyan-700 dark:text-cyan-400 mt-0.5 font-mono">
                            Monthly ({p.recurringConfig.monthlyDay || 1}th)
                          </div>
                        )}
                      </td>

                      {/* Owner */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <UserAvatar user={ownerUser} size="xs" />
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{ownerDisplayName}</span>
                        </div>
                      </td>

                      {/* Team Members */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <AvatarGroup userIds={teamIds} max={3} size="xs" />
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={liveStatus} size="xs" />
                      </td>

                      {/* Progress Bar */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-xs overflow-hidden">
                            <div
                              className="h-full bg-brand rounded-xs"
                              style={{ width: `${liveProgress}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400 w-7 text-right">
                            {liveProgress}%
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {activeTab === 'active' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => onOpenCreateTaskForProject(p.id || p._id)}
                                className="p-1 text-slate-400 hover:text-brand hover:bg-brand-light/30 rounded-xs"
                                title="Add Task to Project"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => (onEditProject || handleOpenEditProject)(p)}
                                className="p-1 text-slate-400 hover:text-brand hover:bg-brand-light/30 rounded-xs"
                                title="Edit Project Mandate"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onSelectProject(p)}
                                className="p-1 text-slate-400 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xs"
                                title="View Project Detail"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                              {can('projects.delete') && (
                                <button
                                  type="button"
                                  onClick={() => handleSoftDelete(p)}
                                  className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xs"
                                  title="Move to Deleted"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleRestoreProject(p)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-xs border border-emerald-200 dark:border-emerald-800/60 transition-colors"
                                title="Restore Project to Active List"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Restore</span>
                              </button>
                              {can('projects.delete') && (
                                <button
                                  type="button"
                                  onClick={() => handlePermanentDelete(p)}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-xs border border-rose-200 dark:border-rose-800/60 transition-colors ml-1"
                                  title="Delete Permanently"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete Permanently</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {filteredProjects.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredProjects.map((p) => {
            const targetOwnerId = p.ownerId || p.owner;
            const ownerUser = resolveUserObject(targetOwnerId, users) || (users && users[0]) || { name: 'Owner', role: 'Member' };
            const ownerDisplayName = ownerUser?.name || 'Owner';
            const rawTeam = (p.teamIds && p.teamIds.length > 0) ? p.teamIds : (p.team && p.team.length > 0) ? p.team : [targetOwnerId, p.managerId || p.manager].filter(Boolean);
            const teamIds = Array.from(new Set(rawTeam));

            return (
              <div
                key={p.id || p._id || p.code}
                onClick={() => onSelectProject(p)}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-4 shadow-2xs hover:border-brand cursor-pointer transition-all flex flex-col justify-between group space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-brand">{p.code || 'PRJ'}</span>
                    <div className="flex items-center gap-1.5">
                      {activeTab === 'active' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            (onEditProject || handleOpenEditProject)(p);
                          }}
                          className="p-1 text-slate-400 hover:text-brand hover:bg-brand-light/30 rounded-xs"
                          title="Edit Project Mandate"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <ProjectTypeBadge type={p.type || 'one-time'} size="xs" />
                      <StatusBadge status={p.status || (activeTab === 'deleted' ? 'Deleted' : 'In Progress')} size="xs" />
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand transition-colors">
                    {p.name || 'Untitled Project'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {p.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">{p.client || 'PMV'}</span>
                    <PriorityBadge priority={p.priority || 'Medium'} size="xs" />
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-500 dark:text-slate-400">Progress</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{p.progress || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-xs overflow-hidden">
                      <div className="h-full bg-brand rounded-xs" style={{ width: `${p.progress || 0}%` }} />
                    </div>
                  </div>

                  {/* Team & Actions Footer */}
                  <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <UserAvatar user={ownerUser} size="xs" />
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{ownerDisplayName}</span>
                    </div>

                    {activeTab === 'active' ? (
                      <div className="flex items-center gap-1">
                        <AvatarGroup userIds={teamIds} max={3} size="xs" />
                        {can('projects.delete') && (
                          <button
                            type="button"
                            onClick={() => handleSoftDelete(p)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xs ml-1"
                            title="Move to Deleted"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleRestoreProject(p)}
                          className="px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-xs border border-emerald-200 dark:border-emerald-800/60 transition-colors"
                        >
                          Restore
                        </button>
                        {can('projects.delete') && (
                          <button
                            type="button"
                            onClick={() => handlePermanentDelete(p)}
                            className="px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-xs border border-rose-200 dark:border-rose-800/60 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
