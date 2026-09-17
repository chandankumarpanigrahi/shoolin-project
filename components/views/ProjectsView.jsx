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
  RefreshCw
} from 'lucide-react';
import { StatusBadge, PriorityBadge, ProjectTypeBadge } from '@/components/common/Badges';
import { UserAvatar, AvatarGroup } from '@/components/common/UserAvatar';
import { useAppContext } from '@/components/providers/AppProvider';
import { useUrlParam } from '@/hooks/useUrlState';

export function ProjectsView({
  projects,
  users,
  onSelectProject,
  onOpenCreateProject,
  onOpenCreateFromTemplate,
  onOpenCreateTaskForProject,
  onDeleteProject
}) {
  const { can } = useAppContext();
  const [viewMode, setViewMode] = useUrlParam('view', 'table'); // 'table' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  // Filter projects
  const filteredProjects = projects.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchClient = p.client.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchClient) return false;
    }
    if (selectedBrand !== 'ALL' && p.brand !== selectedBrand) return false;
    if (selectedType !== 'ALL' && p.type !== selectedType) return false;
    if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;
    if (selectedPriority !== 'ALL' && p.priority !== selectedPriority) return false;
    return true;
  });

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

      {/* TABLE VIEW (Linear / Enterprise Default) */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
                  <th className="py-2.5 px-3">Project Code</th>
                  <th className="py-2.5 px-3">Project Name</th>
                  <th className="py-2.5 px-3">Client / Brand</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Owner</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3">Target Date</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 w-32">Progress</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProjects.map((p) => {
                  const ownerUser = users.find(u => u.id === p.owner) || users[0];
                  const teamUsers = (p.team || []).map(id => users.find(u => u.id === id)).filter(Boolean);

                  return (
                    <tr
                      key={p.id}
                      onClick={() => onSelectProject(p)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                    >
                      {/* Code */}
                      <td className="py-3 px-3 font-mono font-bold text-brand whitespace-nowrap">
                        {p.code}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand transition-colors">
                        <div className="max-w-xs truncate">{p.name}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">{p.category}</div>
                      </td>

                      {/* Client / Brand */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{p.client}</span>
                        <span className="ml-1.5 text-[10px] px-1 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono rounded-xs">
                          {p.brand}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <ProjectTypeBadge type={p.type} size="xs" />
                        {p.type === 'recurring' && p.recurringConfig && (
                          <div className="text-[10px] text-cyan-700 dark:text-cyan-400 mt-0.5 font-mono">
                            Monthly ({p.recurringConfig.monthlyDay}th)
                          </div>
                        )}
                      </td>

                      {/* Owner */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <UserAvatar user={ownerUser} size="xs" />
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{ownerUser.name.split(' ')[0]}</span>
                        </div>
                      </td>

                      {/* Team Members */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <AvatarGroup userIds={p.team || []} max={3} size="xs" />
                      </td>

                      {/* Target Date */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400">
                        {p.targetDate}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <PriorityBadge priority={p.priority} size="xs" />
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={p.status} size="xs" />
                      </td>

                      {/* Progress Bar */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-xs overflow-hidden">
                            <div
                              className="h-full bg-brand rounded-xs"
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400 w-7 text-right">
                            {p.progress}%
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenCreateTaskForProject(p.id)}
                            className="p-1 text-slate-400 hover:text-brand hover:bg-brand-light/30 rounded-xs"
                            title="Add Task to Project"
                          >
                            <Plus className="w-3.5 h-3.5" />
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
                              onClick={() => onDeleteProject(p.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xs"
                              title="Delete Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* GRID VIEW (Optional Card View) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredProjects.map((p) => {
            const ownerUser = users.find(u => u.id === p.owner) || users[0];

            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p)}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-4 shadow-2xs hover:border-brand cursor-pointer transition-all flex flex-col justify-between group space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-brand">{p.code}</span>
                    <div className="flex items-center gap-1.5">
                      <ProjectTypeBadge type={p.type} size="xs" />
                      <StatusBadge status={p.status} size="xs" />
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                    <span>Target: {p.targetDate}</span>
                    <PriorityBadge priority={p.priority} size="xs" />
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-500 dark:text-slate-400">Progress</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{p.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-xs overflow-hidden">
                      <div className="h-full bg-brand rounded-xs" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>

                  {/* Team & Owner Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <UserAvatar user={ownerUser} size="xs" />
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{ownerUser.name}</span>
                    </div>
                    <AvatarGroup userIds={p.team || []} max={3} size="xs" />
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
