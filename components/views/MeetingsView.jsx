'use client';

import React, { useState } from 'react';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Search,
  Users2,
  CheckCircle2,
  XCircle,
  Clock3,
  Archive,
  RefreshCw,
  Edit3,
  AlertCircle,
  Check,
  X,
  ExternalLink,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/common/Badges';
import { UserAvatar, AvatarGroup, resolveUserObject } from '@/components/common/UserAvatar';
import { useUrlParam } from '@/hooks/useUrlState';
import { useAppContext } from '@/components/providers/AppProvider';
import { showConfirm, showSuccess, showError } from '@/lib/swal';
import Swal from 'sweetalert2';

export function MeetingsView({
  meetings = [],
  projects = [],
  tasks = [],
  users = [],
  onOpenScheduleMeeting,
}) {
  const [activeTab, setActiveTab] = useUrlParam('tab', 'upcoming'); // 'upcoming' | 'pending' | 'archive'
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    currentUser,
    handleApproveMeeting,
    handleDeclineMeeting,
    handleRescheduleMeeting,
    handleRestoreMeeting,
    handleOpenEditMeeting,
    handleAddMeetingComment,
    handleDeleteMeeting,
  } = useAppContext();

  const [activeCommentMeeting, setActiveCommentMeeting] = useState(null);
  const [commentText, setCommentText] = useState('');

  // Reschedule Dialog State
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00');
  const [rescheduleDuration, setRescheduleDuration] = useState('45 mins');
  const [rescheduleNote, setRescheduleNote] = useState('');

  const activeProjects = (projects || []).filter(
    (p) => p && !p.isDeleted && p.status !== 'Deleted'
  );

  // Helper: check if a meeting's end time has elapsed
  const isMeetingPast = (m) => {
    if (m.isArchived === true || m.status === 'Archived') return true;
    if (!m.date) return false;
    try {
      let timeStr = m.time || '10:00';
      let [h, min] = [10, 0];
      if (timeStr.toLowerCase().includes('pm') || timeStr.toLowerCase().includes('am')) {
        const isPM = timeStr.toLowerCase().includes('pm');
        const parts = timeStr.replace(/am|pm/gi, '').trim().split(':');
        h = parseInt(parts[0], 10) || 10;
        min = parseInt(parts[1], 10) || 0;
        if (isPM && h < 12) h += 12;
        if (!isPM && h === 12) h = 0;
      } else {
        const parts = timeStr.split(':');
        h = parseInt(parts[0], 10) || 10;
        min = parseInt(parts[1], 10) || 0;
      }
      const start = new Date(
        `${m.date}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`
      );
      if (isNaN(start.getTime())) return false;
      const durationMinutes = parseInt(m.duration, 10) || 45;
      const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
      return end.getTime() < Date.now();
    } catch (e) {
      return false;
    }
  };

  const isApprovedMeeting = (status) => {
    return status === 'Approved' || status === 'Accepted' || status === 'Completed';
  };

  const matchesCurrentUser = (value) => {
    const currentId = String(currentUser?.id || currentUser?._id || '');
    const currentEmail = String(currentUser?.email || '').toLowerCase();
    const target = String(value || '');
    return Boolean(target) && (target === currentId || target.toLowerCase() === currentEmail);
  };

  // Helper: check user visibility governance
  const isMeetingVisibleToUser = (m) => {
    if (!currentUser) return true;
    const currentId = currentUser.id || currentUser._id;
    const currentEmail = currentUser.email;

    const isCreator = matchesCurrentUser(m.requestedBy);
    const isApprover = matchesCurrentUser(m.approverId);
    const isAdmin = currentUser.role === 'Super Admin' || currentUser.role === 'Admin';

    // Approved syncs are visible to assigned participants + creator + approver + admins
    if (isApprovedMeeting(m.status)) {
      const attendeeIds = [...(m.participants || []), ...(m.participantIds || [])];
      const isAttendee = attendeeIds.some((id) => id === currentId || id === currentEmail);
      return isCreator || isApprover || isAdmin || isAttendee;
    }

    // Pending Approval, Declined, or Rescheduled syncs are visible ONLY to creator, approver, and admins
    return isCreator || isApprover || isAdmin;
  };

  // Helper: ONLY approved meetings whose time has passed (or explicitly archived) are archived!
  // Non-approved meetings NEVER go to Archive!
  const isMeetingArchived = (m) => {
    if (m.isArchived === true || m.status === 'Archived') return true;
    if (!isApprovedMeeting(m.status)) return false;
    return isMeetingPast(m);
  };

  // Segregate visible meetings by lifecycle
  const visibleMeetings = (meetings || []).filter(isMeetingVisibleToUser);

  // Tab 1: ONLY approved & upcoming meetings
  const activeUpcomingMeetings = visibleMeetings.filter(
    (m) => isApprovedMeeting(m.status) && !isMeetingArchived(m)
  );

  // Tab 2: All unapproved meetings awaiting action (Pending, Requested, Rescheduled, Declined)
  const pendingApprovalMeetings = visibleMeetings.filter(
    (m) => !isApprovedMeeting(m.status) && !isMeetingArchived(m)
  );

  // Tab 3: ONLY approved past or archived meetings
  const archivedMeetings = visibleMeetings.filter((m) => isMeetingArchived(m));

  // Determine current tab list
  let currentTabMeetings = activeUpcomingMeetings;
  if (activeTab === 'pending') currentTabMeetings = pendingApprovalMeetings;
  if (activeTab === 'archive') currentTabMeetings = archivedMeetings;

  // Filter current tab list by search & dropdowns
  const filteredMeetings = currentTabMeetings.filter((m) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (m.title || '').toLowerCase().includes(q);
      const matchDesc = (m.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    if (selectedProject !== 'ALL' && m.projectId !== selectedProject) return false;
    if (selectedPriority !== 'ALL' && (m.priority || 'Medium') !== selectedPriority) return false;
    return true;
  });

  // Approver Action: Approve
  const onApprove = async (m) => {
    const targetId = m.id || m._id;
    try {
      await handleApproveMeeting(targetId);
      showSuccess(
        'Meeting Approved',
        `"${m.title}" is now approved and visible to all assigned members.`
      );
    } catch (error) {
      showError('Meeting not approved', error.message || 'Unable to approve this meeting.');
    }
  };

  // Approver Action: Decline with prompt
  const onDecline = async (m) => {
    const targetId = m.id || m._id;
    const isDark =
      typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

    const { value: reason } = await Swal.fire({
      title: 'Decline Meeting Sync',
      text: `Provide an optional reason to ${m.title}:`,
      input: 'text',
      inputPlaceholder: 'e.g. Conflict with sprint demo, please propose next week...',
      showCancelButton: true,
      confirmButtonText: 'Decline Sync',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#e11d48',
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#f8fafc' : '#0f172a',
    });

    if (reason !== undefined) {
      try {
        await handleDeclineMeeting(targetId, reason || 'Declined by approver');
        showSuccess('Meeting Declined', `"${m.title}" status updated to Declined.`);
      } catch (error) {
        showError('Meeting not declined', error.message || 'Unable to decline this meeting.');
      }
    }
  };

  // Open Reschedule Dialog
  const openRescheduleModal = (m) => {
    setRescheduleTarget(m);
    setRescheduleDate(m.date || new Date().toISOString().split('T')[0]);
    setRescheduleTime(m.time || '11:00');
    setRescheduleDuration(m.duration || '45 mins');
    setRescheduleNote('');
  };

  // Submit Reschedule
  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleTarget) return;

    const targetId = rescheduleTarget.id || rescheduleTarget._id;
    try {
      await handleRescheduleMeeting(
        targetId,
        rescheduleDate,
        rescheduleTime,
        rescheduleNote,
        rescheduleDuration
      );
      showSuccess(
        'Meeting Rescheduled',
        `"${rescheduleTarget.title}" moved to ${rescheduleDate} at ${rescheduleTime}. Status is reset to Pending Approval for re-confirmation.`
      );
      setRescheduleTarget(null);
    } catch (error) {
      showError('Meeting not rescheduled', error.message || 'Choose a future time and try again.');
    }
  };

  // Restore Action (from Archive)
  const onRestore = async (m) => {
    const targetId = m.id || m._id;
    const isPast = isMeetingPast(m);

    if (isPast) {
      // If date was in past, open reschedule so they pick a valid upcoming slot
      openRescheduleModal(m);
    } else {
      const confirmed = await showConfirm({
        title: 'Restore Meeting to Active?',
        text: `Restore "${m.title}" to active upcoming syncs?`,
        confirmButtonText: 'Yes, Restore Meeting',
      });
      if (confirmed) {
        try {
          await handleRestoreMeeting(targetId);
          showSuccess('Meeting Restored', `"${m.title}" is back in the approval queue.`);
        } catch (error) {
          showError('Meeting not restored', error.message || 'Unable to restore this meeting.');
        }
      }
    }
  };

  const onDelete = async (m) => {
    const confirmed = await showConfirm({
      title: 'Delete meeting?',
      text: `Delete “${m.title}”? This cannot be undone.`,
      confirmButtonText: 'Delete meeting',
    });
    if (!confirmed) return;
    try {
      await handleDeleteMeeting(m.id || m._id);
      showSuccess('Meeting deleted', `“${m.title}” was deleted.`);
    } catch (error) {
      showError('Meeting not deleted', error.message || 'Unable to delete this meeting.');
    }
  };

  return (
    <div className="space-y-4 pb-12 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Meetings &amp; Video Syncs
            </h1>
            <span className="text-xs px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold rounded-full border border-emerald-300 dark:border-emerald-700/80">
              {filteredMeetings.length} syncs
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Approver governance, attendee visibility restriction, and auto-archive
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenScheduleMeeting}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </button>
      </div>

      {/* Tabs Navigation: Upcoming & Active | Pending Approval | Archive */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-sm shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Upcoming &amp; Active</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'upcoming'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {activeUpcomingMeetings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 rounded-t-sm shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <Clock3 className="w-3.5 h-3.5 text-amber-500" />
          <span>Pending Approval</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              pendingApprovalMeetings.length > 0
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {pendingApprovalMeetings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('archive')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'archive'
              ? 'border-slate-700 dark:border-slate-300 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 rounded-t-sm shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <Archive className="w-3.5 h-3.5 text-slate-500" />
          <span>Archive</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'archive'
                ? 'bg-slate-700 dark:bg-slate-300 text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {archivedMeetings.length}
          </span>
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

          {/* Project filter (active only) */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-600 font-medium shadow-2xs"
          >
            <option value="ALL">All Projects</option>
            {activeProjects.map((p) => (
              <option key={p.id || p._id} value={p.id || p._id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Meetings Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Meeting &amp; Agenda</th>
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-3">Schedule</th>
                <th className="py-2.5 px-3">Host &amp; Approver</th>
                <th className="py-2.5 px-3">Attendees</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions &amp; Video Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMeetings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    {activeTab === 'archive'
                      ? 'No meetings in the Archive tab.'
                      : activeTab === 'pending'
                      ? 'No syncs currently awaiting approval.'
                      : 'No upcoming meetings found matching the selected filters.'}
                  </td>
                </tr>
              ) : (
                filteredMeetings.map((m) => {
                  const targetId = m.id || m._id;
                  const requester =
                    resolveUserObject(m.requestedBy, users) || {
                      name: m.requestedByName || 'Unassigned legacy host',
                    };
                  const approver =
                    resolveUserObject(m.approverId, users) || {
                      name: m.approverName || 'Approver not assigned',
                    };
                  const project = projects.find(
                    (p) => p.id === m.projectId || p._id === m.projectId
                  ) || { code: 'PRJ', name: 'Project' };

                  const isCreator = matchesCurrentUser(m.requestedBy);
                  const isApprover = matchesCurrentUser(m.approverId);
                  const isAdmin =
                    currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin';
                  const commentsCount = (m.comments || []).length;
                  const isPast = isMeetingPast(m);

                  return (
                    <React.Fragment key={targetId}>
                      <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        {/* Meeting Title & Agenda */}
                        <td className="py-3 px-3 max-w-[280px]">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                              {m.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {m.description}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setActiveCommentMeeting(
                                  activeCommentMeeting === targetId ? null : targetId
                                )
                              }
                              className="mt-1 text-[10px] text-brand font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Comments ({commentsCount})
                            </button>
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
                              {m.time} ({m.duration || '45 mins'})
                            </span>
                          </div>
                        </td>

                        {/* Host & Approver */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="space-y-1 text-[10px]">
                            <div>
                              <span className="text-slate-400">Host:</span>{' '}
                              <strong className="text-slate-900 dark:text-slate-100">{requester.name}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400">Approver:</span>{' '}
                              <strong className="text-brand font-bold">{approver.name}</strong>
                            </div>
                          </div>
                        </td>

                        {/* Attendees */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <AvatarGroup
                              userIds={m.participants || m.participantIds || []}
                              max={3}
                              size="xs"
                            />
                            {m.status === 'Pending Approval' && (
                              <span
                                className="text-[9px] text-amber-600 dark:text-amber-400 font-medium ml-1"
                                title="Will be visible to attendees once approved"
                              >
                                (Pending approval)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {isMeetingArchived(m) ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                              <Archive className="w-2.5 h-2.5 text-slate-400" />
                              Concluded
                            </span>
                          ) : isMeetingPast(m) && !isApprovedMeeting(m.status) ? (
                            <div className="flex flex-col gap-1 items-start">
                              <StatusBadge status={m.status || 'Pending Approval'} size="xs" />
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                <Clock className="w-2.5 h-2.5" /> Slot Elapsed
                              </span>
                            </div>
                          ) : (
                            <StatusBadge status={m.status || 'Pending Approval'} size="xs" />
                          )}
                        </td>

                        {/* Actions & Video Room */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Concluded meetings can only be restored or rescheduled by their creator. */}
                            {activeTab === 'archive' && isCreator && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openRescheduleModal(m)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded font-bold text-[10px] cursor-pointer transition-colors"
                                  title="Reschedule to a new future date and time"
                                >
                                  <RefreshCw className="w-2.5 h-2.5" />
                                  Reschedule
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onRestore(m)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded font-bold text-[10px] cursor-pointer transition-colors"
                                  title="Restore meeting"
                                >
                                  <RotateCcw className="w-2.5 h-2.5" />
                                  Restore
                                </button>
                              </>
                            )}

                            {/* In Active/Pending Tabs: Approver Controls */}
                            {activeTab !== 'archive' &&
                              isApprover &&
                              (m.status === 'Pending Approval' ||
                                m.status === 'Rescheduled' ||
                                m.status === 'Requested') && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onApprove(m)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] shadow-xs cursor-pointer transition-colors"
                                  >
                                    <Check className="w-2.5 h-2.5" />
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDecline(m)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[10px] shadow-xs cursor-pointer transition-colors"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                    Decline
                                  </button>
                                </>
                              )}

                            {/* The creator and designated approver can edit; only the creator may reschedule. */}
                            {activeTab !== 'archive' && (isCreator || isApprover) && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenEditMeeting && handleOpenEditMeeting(m)
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-semibold text-[10px] cursor-pointer transition-colors"
                                  title="Modify meeting details"
                                >
                                  <Edit3 className="w-2.5 h-2.5 text-slate-500" />
                                  Edit
                                </button>
                                {isCreator && (
                                  <button
                                    type="button"
                                    onClick={() => openRescheduleModal(m)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-semibold text-[10px] cursor-pointer transition-colors"
                                    title="Reschedule to new date/time"
                                  >
                                    <Clock className="w-2.5 h-2.5 text-slate-500" />
                                    Reschedule
                                  </button>
                                )}
                              </>
                            )}

                            {isCreator && (
                              <button
                                type="button"
                                onClick={() => onDelete(m)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded font-semibold text-[10px] cursor-pointer transition-colors"
                                title="Delete meeting"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                                Delete
                              </button>
                            )}

                            {/* Join Video Room (Only if Approved or user is creator/approver) */}
                            {m.meetUrl && (m.status === 'Approved' || isCreator || isApprover || isAdmin) && (
                              <a
                                href={m.meetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded font-bold text-[10px] transition-colors"
                              >
                                <Video className="w-3 h-3" />
                                Join
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Comments Drawer */}
                      {activeCommentMeeting === targetId && (
                        <tr className="bg-slate-50 dark:bg-slate-800/40">
                          <td colSpan={7} className="p-4">
                            <div className="space-y-2.5 max-w-2xl">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                                  <span>Sync Discussion &amp; Decision Log</span>
                                  <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 rounded-full text-[10px]">
                                    {(m.comments || []).length}
                                  </span>
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => setActiveCommentMeeting(null)}
                                  className="text-slate-400 hover:text-slate-600 text-[11px]"
                                >
                                  Close
                                </button>
                              </div>

                              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                {(m.comments || []).map((c, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-[11px]"
                                  >
                                    <div className="flex justify-between text-slate-400 text-[10px]">
                                      <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                                        {c.authorName || 'User'}
                                      </strong>
                                      <span>
                                        {c.createdAt
                                          ? new Date(c.createdAt).toLocaleTimeString([], {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                            })
                                          : ''}
                                      </span>
                                    </div>
                                    <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                                      {c.text}
                                    </p>
                                  </div>
                                ))}
                                {(m.comments || []).length === 0 && (
                                  <p className="text-slate-400 italic text-[11px] py-2">
                                    No notes or comments yet.
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="text"
                                  placeholder="Add an agenda note or feedback..."
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && commentText.trim()) {
                                      handleAddMeetingComment(targetId, commentText.trim())
                                        .then(() => setCommentText(''))
                                        .catch((error) => showError('Comment not posted', error.message || 'Unable to post your comment.'));
                                    }
                                  }}
                                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-emerald-600"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (commentText.trim() && handleAddMeetingComment) {
                                      handleAddMeetingComment(targetId, commentText.trim())
                                        .then(() => setCommentText(''))
                                        .catch((error) => showError('Comment not posted', error.message || 'Unable to post your comment.'));
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs cursor-pointer transition-colors"
                                >
                                  Post
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setRescheduleTarget(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-100">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Reschedule Sync
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="p-5 space-y-3.5 text-xs">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded text-amber-900 dark:text-amber-200 text-[11px]">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>Rescheduling moves sync back to Pending Approval</span>
                </p>
                <p className="mt-0.5 text-amber-800/80 dark:text-amber-300/80">
                  The designated approver will be asked to confirm this new time slot before attendees can view it.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sync
                </label>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {rescheduleTarget.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Duration
                </label>
                <select
                  value={rescheduleDuration}
                  onChange={(e) => setRescheduleDuration(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="15 mins">15 mins</option>
                  <option value="30 mins">30 mins</option>
                  <option value="45 mins">45 mins</option>
                  <option value="60 mins">60 mins (1 hr)</option>
                  <option value="90 mins">90 mins</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Notes for Rescheduling (Optional)
                </label>
                <textarea
                  rows={2}
                  value={rescheduleNote}
                  onChange={(e) => setRescheduleNote(e.target.value)}
                  placeholder="e.g. Host travel conflict; requested shift to afternoon..."
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold rounded transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
