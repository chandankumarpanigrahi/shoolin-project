'use client';

import React, { useState } from 'react';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Users2,
  CheckCircle2,
  XCircle,
  Clock3,
  Flag
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/common/Badges';
import { UserAvatar, AvatarGroup } from '@/components/common/UserAvatar';
import { useUrlParam } from '@/hooks/useUrlState';

export function MeetingsView({
  meetings,
  projects,
  tasks,
  users,
  onOpenScheduleMeeting,
  onUpdateMeetingStatus
}) {
  const [selectedStatus, setSelectedStatus] = useUrlParam('status', 'ALL', false);
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMeetings = meetings.filter(m => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!m.title.toLowerCase().includes(q) && !m.description?.toLowerCase().includes(q)) return false;
    }
    if (selectedStatus !== 'ALL' && m.status !== selectedStatus) return false;
    if (selectedProject !== 'ALL' && m.projectId !== selectedProject) return false;
    if (selectedPriority !== 'ALL' && (m.priority || 'Medium') !== selectedPriority) return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-12 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Meetings &amp; Video Syncs</h1>
            <span className="text-xs px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold rounded-full border border-emerald-300 dark:border-emerald-700/80">
              {filteredMeetings.length} syncs
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Structured team reviews, sprint alignments, and client calibrations with calendar tracking
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenScheduleMeeting}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search meetings by title or agenda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-600 font-medium shadow-2xs"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-600 font-medium shadow-2xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="Accepted">Accepted</option>
            <option value="Requested">Requested</option>
            <option value="Rescheduled">Rescheduled</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Project filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-600 font-medium shadow-2xs"
          >
            <option value="ALL">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Meetings High-Density Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Meeting &amp; Agenda</th>
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-3">Schedule</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Host</th>
                <th className="py-2.5 px-3">Attendees</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Video Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMeetings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No meetings found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredMeetings.map((m) => {
                  const requester = users.find(u => u.id === m.requestedBy) || users[0];
                  const project = projects.find(p => p.id === m.projectId) || { code: "PRJ", name: "Project", brand: "PMV" };
                  const relatedTask = tasks.find(t => t.id === m.relatedTaskId);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Meeting Title & Agenda */}
                      <td className="py-3 px-3 max-w-[280px]">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                            {m.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {m.description}
                          </p>
                          {relatedTask && (
                            <div className="mt-1 flex items-center gap-1 font-mono text-[10px] text-brand">
                              <span className="font-semibold">{relatedTask.code}:</span>
                              <span className="truncate">{relatedTask.title}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Project */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-xs">
                            {project.code}
                          </span>
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                            {project.name}
                          </span>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex flex-col text-[11px]">
                          <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {m.date}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {m.time} ({m.duration})
                          </span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <PriorityBadge priority={m.priority || 'Medium'} size="xs" />
                      </td>

                      {/* Host */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <UserAvatar user={requester} size="xs" showName />
                      </td>

                      {/* Attendees */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <AvatarGroup userIds={m.participants || []} max={3} size="xs" />
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={m.status} size="xs" />
                      </td>

                      {/* Video Room Action */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {m.meetUrl ? (
                          <a
                            href={m.meetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 rounded-lg font-bold transition-all shadow-2xs"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                            No link
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
