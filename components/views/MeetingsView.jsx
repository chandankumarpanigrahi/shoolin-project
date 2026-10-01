'use client';

import React, { useState, useMemo } from 'react';
import {
  Video,
  MapPin,
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
  Table as TableIcon,
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/common/Badges';
import { UserAvatar, AvatarGroup, resolveUserObject } from '@/components/common/UserAvatar';
import { useUrlParam } from '@/hooks/useUrlState';
import { useAppContext } from '@/components/providers/AppProvider';
import { showConfirm, showSuccess, showError } from '@/lib/swal';
import Swal from 'sweetalert2';
import { formatDate } from '@/lib/dateUtils';

export function MeetingsView({
  meetings = [],
  projects = [],
  tasks = [],
  users = [],
  onOpenScheduleMeeting,
}) {
  const [activeTab, setActiveTab] = useUrlParam('tab', 'upcoming'); // 'upcoming' | 'pending' | 'archive'
  const [viewMode, setViewMode] = useUrlParam('view', 'table'); // 'table' | 'calendar'
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    currentUser,
    handleCancelMeeting,
    handleRescheduleMeeting,
    handleRestoreMeeting,
    handleOpenEditMeeting,
    handleDeleteMeeting,
    can,
  } = useAppContext();

  // Calendar State (Current month view)
  const [currentCalendarDate, setCurrentCalendarDate] = useState(() => new Date());

  // Reschedule Dialog State
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00');
  const [rescheduleDuration, setRescheduleDuration] = useState('45 mins');
  const [rescheduleNote, setRescheduleNote] = useState('');
  const [rescheduleAllowConflict, setRescheduleAllowConflict] = useState(false);

  // Parse time interval for reschedule conflict detection
  const parseRescheduleInterval = (dStr, tStr, durStr = '45 mins') => {
    if (!dStr || !tStr) return null;
    let [h, min] = [10, 0];
    if (tStr.toLowerCase().includes('pm') || tStr.toLowerCase().includes('am')) {
      const isPM = tStr.toLowerCase().includes('pm');
      const parts = tStr.replace(/am|pm/gi, '').trim().split(':');
      h = parseInt(parts[0], 10) || 10;
      min = parseInt(parts[1], 10) || 0;
      if (isPM && h < 12) h += 12;
      if (!isPM && h === 12) h = 0;
    } else {
      const parts = tStr.split(':');
      h = parseInt(parts[0], 10) || 10;
      min = parseInt(parts[1], 10) || 0;
    }
    const start = new Date(`${dStr}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`);
    if (isNaN(start.getTime())) return null;
    const durMinutes = parseInt(durStr, 10) || 45;
    return { start: start.getTime(), end: start.getTime() + durMinutes * 60 * 1000 };
  };

  const rescheduleConflicts = useMemo(() => {
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) return [];
    const newInt = parseRescheduleInterval(rescheduleDate, rescheduleTime, rescheduleDuration);
    if (!newInt) return [];

    const targetId = String(rescheduleTarget.id || rescheduleTarget._id);
    const targetAttendees = [
      rescheduleTarget.requestedBy,
      rescheduleTarget.requestedByEmail,
      rescheduleTarget.approverId,
      rescheduleTarget.approverEmail,
      ...(rescheduleTarget.participants || []),
      ...(rescheduleTarget.participantIds || []),
      ...(rescheduleTarget.optionalMembers || []),
      ...(rescheduleTarget.optionalMemberIds || []),
    ].filter(Boolean).map((v) => String(v).toLowerCase());

    const conflicts = [];
    (meetings || []).forEach((m) => {
      const mId = String(m.id || m._id);
      if (mId === targetId) return;
      if (m.date !== rescheduleDate) return;
      if (m.isArchived === true || m.status === 'Archived' || m.status === 'Cancelled' || m.status === 'Declined') return;

      const mInt = parseRescheduleInterval(m.date, m.time, m.duration);
      if (!mInt) return;
      const overlaps = newInt.start < mInt.end && newInt.end > mInt.start;
      if (!overlaps) return;

      const mAttendees = [
        m.requestedBy,
        m.requestedByEmail,
        m.approverId,
        m.approverEmail,
        ...(m.participants || []),
        ...(m.participantIds || []),
        ...(m.optionalMembers || []),
        ...(m.optionalMemberIds || []),
      ].filter(Boolean).map((v) => String(v).toLowerCase());

      (users || []).forEach((u) => {
        const uTokens = [u.id, u._id, u.email].filter(Boolean).map((v) => String(v).toLowerCase());
        const inTarget = uTokens.some((tok) => targetAttendees.includes(tok));
        const inM = uTokens.some((tok) => mAttendees.includes(tok));
        if (inTarget && inM && !conflicts.some((c) => c.userId === (u.id || u._id))) {
          conflicts.push({
            userId: u.id || u._id,
            userName: u.name,
            meetingTitle: m.title,
            meetingTime: m.time,
            meetingDuration: m.duration || '45 mins',
          });
        }
      });
    });

    return conflicts;
  }, [rescheduleTarget, rescheduleDate, rescheduleTime, rescheduleDuration, meetings, users]);

  // Custom Cancel Modal State
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const activeProjects = (projects || []).filter(
    (p) => p && !p.isDeleted && p.status !== 'Deleted'
  );

  // Helper: check if a meeting's end time has elapsed
  const isMeetingPast = (m) => {
    if (m.isArchived === true || m.status === 'Archived' || m.status === 'Cancelled') return true;
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
    if (!value || !currentUser) return false;
    const currentId = String(currentUser.id || currentUser._id || '').toLowerCase();
    const currentEmail = String(currentUser.email || '').toLowerCase();
    const currentName = String(currentUser.name || '').trim().toLowerCase();
    if (typeof value === 'object') {
      const valId = String(value.id || value._id || '').toLowerCase();
      const valEmail = String(value.email || '').toLowerCase();
      const valName = String(value.name || '').trim().toLowerCase();
      return (
        Boolean(valId && valId === currentId) ||
        Boolean(valEmail && valEmail === currentEmail) ||
        Boolean(valName && currentName && valName === currentName)
      );
    }
    const target = String(value).trim().toLowerCase();
    return (
      Boolean(target) &&
      (target === currentId ||
        target === currentEmail ||
        (currentName && target === currentName))
    );
  };

  const isSuperAdmin = (user = currentUser) => {
    if (!user) return false;
    const role = String(user.role || '').toLowerCase();
    return role === 'super admin' || role === 'superadmin';
  };

  const isMeetingCreator = (m) => {
    if (!m || !currentUser) return false;
    const curId = String(currentUser.id || currentUser._id || '').toLowerCase();
    const curEmail = String(currentUser.email || '').toLowerCase();
    const curName = String(currentUser.name || '').trim().toLowerCase();

    return (
      matchesCurrentUser(m.requestedBy) ||
      matchesCurrentUser(m.requestedByEmail) ||
      matchesCurrentUser(m.requestedByName) ||
      (m.requestedBy && (String(m.requestedBy).toLowerCase() === curId || (currentUser._id && String(m.requestedBy).toLowerCase() === String(currentUser._id).toLowerCase()))) ||
      (m.requestedByEmail && curEmail && String(m.requestedByEmail).toLowerCase() === curEmail) ||
      (m.requestedByName && curName && String(m.requestedByName).trim().toLowerCase() === curName)
    );
  };

  // Helper: check user visibility governance (Creator or Attendee; Admins can see all)
  const isMeetingVisibleToUser = (m) => {
    if (!currentUser) return false;
    if (isSuperAdminOrAdmin(currentUser)) return true;

    const isCreator = isMeetingCreator(m);

    const attendeeIds = [
      m.requestedBy,
      m.requestedByEmail,
      m.requestedByName,
      m.approverId,
      m.approverEmail,
      ...(m.participants || []),
      ...(m.participantIds || []),
      ...(m.optionalMembers || []),
      ...(m.optionalMemberIds || []),
    ].filter(Boolean);
    const isAttendee = attendeeIds.some((id) => matchesCurrentUser(id));
    return isCreator || isAttendee;
  };

  // Helper: Concluded, past, or cancelled meetings are in archive
  const isMeetingArchived = (m) => {
    if (m.isArchived === true || m.status === 'Archived' || m.status === 'Cancelled' || m.status === 'Declined') return true;
    return isMeetingPast(m);
  };

  // Segregate visible meetings
  const visibleMeetings = (meetings || []).filter(isMeetingVisibleToUser);

  // Tab 1: Active & Upcoming meetings
  const activeUpcomingMeetings = visibleMeetings.filter((m) => !isMeetingArchived(m));

  // Tab 2: Concluded or Cancelled meetings
  const archivedMeetings = visibleMeetings.filter((m) => isMeetingArchived(m));

  // Determine current tab list
  let currentTabMeetings = activeUpcomingMeetings;
  if (activeTab === 'archive') currentTabMeetings = archivedMeetings;

  // Filter meetings by search query, priority, and project
  const filteredMeetings = useMemo(() => {
    return (currentTabMeetings || []).filter((m) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (m.title || '').toLowerCase().includes(q);
        const descMatch = (m.description || '').toLowerCase().includes(q);
        const hostMatch = (m.requestedByName || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !hostMatch) return false;
      }
      if (selectedPriority !== 'ALL' && m.priority !== selectedPriority) {
        return false;
      }
      if (selectedProject !== 'ALL' && m.projectId !== selectedProject) {
        return false;
      }
      return true;
    });
  }, [currentTabMeetings, searchQuery, selectedPriority, selectedProject]);

  // Creator Action: Open Custom Cancel Meeting Modal
  const onCancel = (m) => {
    const isCreator = isMeetingCreator(m);
    const isAdmin = isSuperAdminOrAdmin(currentUser);

    if (!isCreator && !isAdmin) {
      showError('Permission Denied', 'Only the meeting creator or an administrator can cancel this meeting.');
      return;
    }

    setCancelTarget(m);
    setCancelReasonInput('');
    setCancelError('');
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancelTarget) return;
    if (!cancelReasonInput.trim()) {
      setCancelError('Please enter a cancellation reason.');
      return;
    }
    setIsCancelling(true);
    try {
      await handleCancelMeeting(cancelTarget.id || cancelTarget._id, cancelReasonInput.trim());
      showSuccess(
        'Meeting Cancelled',
        `"${cancelTarget.title}" was cancelled and moved to Archive.`
      );
      setCancelTarget(null);
    } catch (error) {
      setCancelError(error.message || 'Unable to cancel this meeting.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Open Reschedule Dialog
  const openRescheduleModal = (m) => {
    setRescheduleTarget(m);
    setRescheduleDate(m.date || new Date().toISOString().split('T')[0]);
    setRescheduleTime(m.time || '11:00');
    setRescheduleDuration(m.duration || '45 mins');
    setRescheduleNote('');
    setRescheduleAllowConflict(false);
  };

  // Submit Reschedule
  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleTarget) return;

    if (rescheduleConflicts.length > 0 && !rescheduleAllowConflict) {
      showError(
        'Schedule Conflict Detected',
        `The new time slot conflicts with existing meetings for: ${rescheduleConflicts.map((c) => c.userName).join(', ')}. Please choose another time or check "Acknowledge conflict and proceed anyway".`
      );
      return;
    }

    const targetId = rescheduleTarget.id || rescheduleTarget._id;
    try {
      await handleRescheduleMeeting(
        targetId,
        rescheduleDate,
        rescheduleTime,
        rescheduleNote,
        rescheduleDuration,
        '',
        rescheduleAllowConflict
      );
      showSuccess(
        'Meeting Rescheduled',
        `"${rescheduleTarget.title}" moved to ${rescheduleDate} at ${rescheduleTime}.`
      );
      setRescheduleTarget(null);
    } catch (error) {
      showError('Meeting not rescheduled', error.message || 'Choose a future time and try again.');
    }
  };

  // Restore Action (from Archive)
  const onRestore = async (m) => {
    const isCreator = isMeetingCreator(m);
    const isAdmin = isSuperAdminOrAdmin(currentUser);
    if (!isCreator && !isAdmin) {
      showError('Permission Denied', 'Only the meeting creator or an administrator can restore this meeting.');
      return;
    }

    const targetId = m.id || m._id;
    const isPast = isMeetingPast(m);

    if (isPast) {
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
          showSuccess('Meeting Restored', `"${m.title}" is restored to active syncs.`);
        } catch (error) {
          showError('Meeting not restored', error.message || 'Unable to restore this meeting.');
        }
      }
    }
  };

  const onDelete = async (m) => {
    const isCreator = isMeetingCreator(m);
    const isAdmin = isSuperAdminOrAdmin(currentUser);
    if (!isCreator && !isAdmin) {
      showError('Permission Denied', 'Only the meeting creator or an administrator can delete this meeting.');
      return;
    }

    const isArchived = isMeetingArchived(m);
    if (!isArchived) {
      const confirmed = await showConfirm({
        title: 'Move to Archive?',
        text: `Move “${m.title}” to Archive?`,
        confirmButtonText: 'Archive Meeting',
      });
      if (!confirmed) return;
      try {
        await handleDeleteMeeting(m.id || m._id, false);
        showSuccess('Meeting Archived', `“${m.title}” moved to Archive.`);
      } catch (error) {
        showError('Action Failed', error.message || 'Unable to archive this meeting.');
      }
    } else {
      const confirmed = await showConfirm({
        title: 'Permanently Delete?',
        text: `Permanently delete “${m.title}” from Archive? This cannot be undone.`,
        confirmButtonText: 'Delete Permanently',
      });
      if (!confirmed) return;
      try {
        await handleDeleteMeeting(m.id || m._id, true);
        showSuccess('Meeting Deleted', `“${m.title}” was permanently deleted.`);
      } catch (error) {
        showError('Delete Failed', error.message || 'Unable to delete this meeting.');
      }
    }
  };

  // Calendar Helpers (Month view calculations)
  const getCalendarDays = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];
    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        dateStr: '',
      });
    }
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        isCurrentMonth: true,
        dateStr: dStr,
      });
    }
    // Next month padding days
    const remainingSlots = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        dateStr: '',
      });
    }
    return days;
  };

  const nextMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));
  };
  const prevMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1));
  };

  const monthYearLabel = currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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
              Video Syncs
            </h1>
            <span className="text-xs px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold rounded-full border border-emerald-300 dark:border-emerald-700/80">
              {filteredMeetings.length} syncs
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Online video meetings, Google Meet / Teams room links, and sprint syncs
          </p>
        </div>

        {can('meetings.create') && (
          <button
            type="button"
            onClick={onOpenScheduleMeeting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        )}
      </div>

      {/* Tabs Navigation & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeTab !== 'archive'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-lg shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Active</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${activeTab !== 'archive'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
            >
              {activeUpcomingMeetings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'archive'
              ? 'border-slate-700 dark:border-slate-300 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 rounded-t-lg shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
          >
            <Archive className="w-3.5 h-3.5 text-slate-500" />
            <span>Past</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${activeTab === 'archive'
                ? 'bg-slate-700 dark:bg-slate-300 text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
            >
              {archivedMeetings.length}
            </span>
          </button>
        </div>

        {/* View Mode Toggle: Table vs Calendar */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 mb-1">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${viewMode === 'table'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${viewMode === 'calendar'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
        </div>
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

          {/* Project filter */}
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

      {/* VIEW MODE 1: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Meetings</th>
                  <th className="py-2.5 px-3">Project</th>
                  <th className="py-2.5 px-3">Schedule</th>
                  <th className="py-2.5 px-3">Host</th>
                  <th className="py-2.5 px-3">Attendees</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMeetings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                      {activeTab === 'archive'
                        ? 'No archived syncs.'
                        : 'No meetings scheduled matching the selected filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredMeetings.map((m) => {
                    const targetId = m.id || m._id;
                    const requester =
                      resolveUserObject(m.requestedBy, users) || {
                        name: m.requestedByName || 'Host',
                      };
                    const project = projects.find(
                      (p) => p.id === m.projectId || p._id === m.projectId
                    );

                    const isCreator = isMeetingCreator(m);
                    const isAdmin = isSuperAdminOrAdmin(currentUser);
                    const canEditMeeting = isCreator || isAdmin || can('meetings.edit');
                    const canDeleteMeeting = isCreator || isAdmin || can('meetings.delete');

                    return (
                      <React.Fragment key={targetId}>
                        <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                          {/* Meeting Title & Agenda */}
                          <td className="py-3 px-3 max-w-[260px]">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                                {m.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {m.description || 'No agenda provided.'}
                              </p>
                            </div>
                          </td>


                          {/* Project */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {project ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                                  {project.code}
                                </span>
                                <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[110px]">
                                  {project.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">General / Unlinked</span>
                            )}
                          </td>

                          {/* Schedule */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex flex-col text-[11px]">
                              <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {formatDate(m.date)}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {m.time} ({m.duration || '45 mins'})
                              </span>
                            </div>
                          </td>

                          {/* Host */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <UserAvatar user={requester} size="xs" />
                              <strong className="text-slate-900 dark:text-slate-100 text-[11px]">{requester.name}</strong>
                            </div>
                          </td>

                          {/* Attendees */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                <AvatarGroup
                                  userIds={m.participants || m.participantIds || []}
                                  max={3}
                                  size="xs"
                                />
                                <span className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-400">
                                  {(m.participants || m.participantIds || []).length} attendees
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {m.status === 'Cancelled' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800" title={m.cancelReason}>
                                <XCircle className="w-2.5 h-2.5 text-rose-600" /> Cancelled
                              </span>
                            ) : isMeetingArchived(m) ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                                <Archive className="w-2.5 h-2.5 text-slate-400" /> Concluded
                              </span>
                            ) : (
                              <StatusBadge status={m.status || 'Scheduled'} size="xs" />
                            )}
                          </td>

                          {/* Actions: Creator only for edit, reschedule, cancel, delete. All see join link if available */}
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Join Video Room button: available to all attendees if meetUrl exists */}
                              {activeTab !== 'archive' && m.meetUrl && (
                                <a
                                  href={m.meetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] shadow-xs transition-colors"
                                  title="Join online video room"
                                >
                                  <Video className="w-3.5 h-3.5" /> Join Meeting
                                </a>
                              )}

                              {/* Edit: Only Creator or Admin */}
                              {activeTab !== 'archive' && canEditMeeting && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditMeeting && handleOpenEditMeeting(m)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-semibold text-[10px] cursor-pointer transition-colors"
                                  title="Modify meeting details"
                                >
                                  <Edit3 className="w-2.5 h-2.5 text-slate-500" /> Edit
                                </button>
                              )}

                              {/* Reschedule: Only Creator or Admin */}
                              {activeTab !== 'archive' && canEditMeeting && (
                                <button
                                  type="button"
                                  onClick={() => openRescheduleModal(m)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-semibold text-[10px] cursor-pointer transition-colors"
                                  title="Reschedule date/time"
                                >
                                  <Clock className="w-2.5 h-2.5 text-slate-500" /> Reschedule
                                </button>
                              )}

                              {/* Cancel: Only Creator or Admin */}
                              {activeTab !== 'archive' && canDeleteMeeting && m.status !== 'Cancelled' && (
                                <button
                                  type="button"
                                  onClick={() => onCancel(m)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded font-semibold text-[10px] cursor-pointer transition-colors"
                                  title="Cancel meeting"
                                >
                                  <XCircle className="w-2.5 h-2.5" /> Cancel
                                </button>
                              )}

                              {/* Delete: Only Creator or Admin */}
                              {(activeTab === 'archive' || m.status === 'Cancelled') && canDeleteMeeting && (
                                <button
                                  type="button"
                                  onClick={() => onDelete(m)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded font-semibold text-[10px] cursor-pointer transition-colors"
                                  title="Permanently delete meeting from database"
                                >
                                  <Trash2 className="w-2.5 h-2.5" /> Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: VISUAL CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {monthYearLabel}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-medium">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Scheduled</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Cancelled</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center border-b border-slate-200 dark:border-slate-800 pb-2 text-[11px] font-bold text-slate-500 uppercase">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {getCalendarDays().map((day, idx) => {
              const dayMeetings = day.dateStr
                ? filteredMeetings.filter((m) => m.date === day.dateStr)
                : [];

              return (
                <div
                  key={idx}
                  className={`min-h-[90px] p-1.5 border rounded-lg transition-colors flex flex-col justify-between ${!day.isCurrentMonth
                    ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800/40 text-slate-300 dark:text-slate-700'
                    : day.dateStr === new Date().toISOString().split('T')[0]
                      ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-700 font-bold'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                    }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className={day.isCurrentMonth ? 'text-slate-700 dark:text-slate-300 font-semibold' : ''}>
                      {day.dayNumber}
                    </span>
                    {dayMeetings.length > 0 && (
                      <span className="text-[9px] px-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-mono">
                        {dayMeetings.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[60px]">
                    {dayMeetings.map((m) => {
                      const isCancelled = m.status === 'Cancelled' || m.status === 'Declined';
                      const isCreator = isMeetingCreator(m);
                      const isAdmin = isSuperAdminOrAdmin(currentUser);
                      const canEditThisMeeting = isCreator || isAdmin || can('meetings.edit');

                      return (
                        <div
                          key={m.id || m._id}
                          onClick={() => {
                            if (canEditThisMeeting && handleOpenEditMeeting) {
                              handleOpenEditMeeting(m);
                            } else if (m.meetUrl) {
                              window.open(m.meetUrl, '_blank');
                            }
                          }}
                          className={`p-1 rounded text-[10px] font-medium truncate cursor-pointer transition-transform hover:scale-102 ${isCancelled
                            ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                            : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                            }`}
                          title={`${m.title} (${m.time})`}
                        >
                          <span className="font-mono text-[9px] mr-1">{m.time}</span>
                          <span className="truncate">{m.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Custom Cancel Meeting Modal */}
      {cancelTarget && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setCancelTarget(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
        >
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-100 my-auto">
            <div className="px-5 py-3.5 border-b border-rose-100 dark:border-rose-950/60 bg-rose-50/70 dark:bg-rose-950/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <h3 className="text-sm font-bold text-rose-950 dark:text-rose-100">
                  Cancel Meeting Sync
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="p-5 space-y-3.5 text-xs flex-1 overflow-y-auto">
              {cancelError && (
                <div className="p-2.5 rounded border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300 text-[11px]">
                  {cancelError}
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {cancelTarget.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>📅 {formatDate(cancelTarget.date)}</span>
                  <span>⏰ {cancelTarget.time} ({cancelTarget.duration || '45 mins'})</span>
                </p>
              </div>

              <div className="p-2.5 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded text-rose-800 dark:text-rose-300 text-[11px]">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Cancelling will move this sync to the archive.</span>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mandatory Cancellation Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={cancelReasonInput}
                  onChange={(e) => {
                    setCancelReasonInput(e.target.value);
                    setCancelError('');
                  }}
                  placeholder="e.g. Host travel conflict; emergency schedule shift..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancelTarget(null)}
                  className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-md transition-colors cursor-pointer"
                >
                  Keep Meeting
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-md transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setRescheduleTarget(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
        >
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-100 my-auto">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between shrink-0">
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

            <form onSubmit={handleConfirmReschedule} className="p-5 space-y-3.5 text-xs flex-1 overflow-y-auto">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded text-amber-900 dark:text-amber-200 text-[11px]">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Reschedule Meeting Slot</span>
                </p>
                <p className="mt-0.5 text-amber-800/80 dark:text-amber-300/80">
                  Update the date and time. Attendees will see the updated schedule immediately.
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
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
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
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
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
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="15 mins">15 mins</option>
                  <option value="30 mins">30 mins</option>
                  <option value="45 mins">45 mins</option>
                  <option value="60 mins">60 mins (1 hr)</option>
                  <option value="90 mins">90 mins</option>
                </select>
              </div>

              {/* Reschedule Conflict Warning */}
              {rescheduleConflicts.length > 0 && (
                <div className="p-2.5 rounded-md border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/60 text-[11px] text-amber-900 dark:text-amber-200 space-y-1.5 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Attendee Schedule Conflict ({rescheduleConflicts.length} attendee{rescheduleConflicts.length > 1 ? 's' : ''}):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px] pl-1">
                    {rescheduleConflicts.map((c, idx) => (
                      <li key={idx}>
                        <strong>{c.userName}</strong> has &ldquo;{c.meetingTitle}&rdquo; at {c.meetingTime} ({c.meetingDuration})
                      </li>
                    ))}
                  </ul>
                  <label className="flex items-center gap-2 pt-1 text-[10px] font-semibold text-amber-900 dark:text-amber-200 cursor-pointer border-t border-amber-200 dark:border-amber-800/80">
                    <input
                      type="checkbox"
                      checked={rescheduleAllowConflict}
                      onChange={(e) => setRescheduleAllowConflict(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                    />
                    <span>Acknowledge conflict and proceed anyway</span>
                  </label>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Notes for Rescheduling (Optional)
                </label>
                <textarea
                  rows={2}
                  value={rescheduleNote}
                  onChange={(e) => setRescheduleNote(e.target.value)}
                  placeholder="e.g. Host travel conflict; requested shift to afternoon..."
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
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
