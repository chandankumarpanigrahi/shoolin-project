'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/components/providers/AppProvider';
import {
  Briefcase,
  CheckSquare,
  Clock,
  CheckCircle2,
  Video,
  Plus,
  ArrowRight,
  Calendar,
  Edit3,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { StatusBadge, PriorityBadge, ProjectTypeBadge } from '@/components/common/Badges';
import { UserAvatar, AvatarGroup, resolveUserObject } from '@/components/common/UserAvatar';
import { showConfirm, showSuccess, showError } from '@/lib/swal';
import Swal from 'sweetalert2';
import { formatDate } from '@/lib/dateUtils';

export function DashboardView({
  projects = [],
  tasks = [],
  users = [],
  meetings = [],
  dependencies = [],
  currentUser,
  onNavigate,
  onSelectProject,
  onSelectTask,
  onOpenCreateTask,
  onOpenCreateProject,
  onOpenScheduleMeeting,
}) {
  const router = useRouter();
  const {
    can,
    handleApproveMeeting,
    handleDeclineMeeting,
    handleOpenEditMeeting,
    handleDeleteMeeting,
    isCompletedStatus,
  } = useAppContext();

  const handleNavigate = (path) => {
    if (onNavigate && typeof onNavigate === 'function') {
      onNavigate(path);
    }
    router.push(`/${path.replace(/^\//, '')}`);
  };

  const checkIsCompleted = (status) => {
    if (isCompletedStatus) return isCompletedStatus(status);
    const norm = String(status || '').toLowerCase();
    return norm === 'completed' || norm === 'done' || norm === 'approved';
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

  // Synchronized Dynamic Filtering: Active non-deleted projects ONLY
  const activeProjects = (projects || []).filter(
    (p) => p && !p.isDeleted && p.status !== 'Deleted'
  );

  const activeTasks = (tasks || []).filter(
    (t) => t && !t.isDeleted && t.status !== 'Deleted'
  );

  const completedTasks = activeTasks.filter((t) => checkIsCompleted(t?.status));

  const formattedToday = formatDate(new Date());
  const todayYMD = new Date().toISOString().split('T')[0];
  const dueTodayTasks = activeTasks.filter((t) => {
    if (checkIsCompleted(t.status)) return false;
    const d = t.dueDate || t.toDate || t.targetDate || t.endDate;
    if (!d) return false;
    return formatDate(d) === formattedToday || String(d).includes(todayYMD);
  });

  const myTasks = activeTasks.filter((t) => {
    if (matchesCurrentUser(t.assignedTo) || matchesCurrentUser(t.createdBy)) return true;
    const resolved = resolveUserObject(t.assignedTo, users);
    return resolved ? matchesCurrentUser(resolved) : false;
  });

  const isApprovedMeeting = (status) =>
    status === 'Approved' || status === 'Accepted' || status === 'Completed';

  const myMeetings = (meetings || []).filter((m) => {
    if (!m || m.isArchived === true || m.status === 'Archived') return false;
    const isCreator =
      matchesCurrentUser(m.requestedBy) ||
      matchesCurrentUser(m.requestedByEmail) ||
      matchesCurrentUser(m.requestedByName);
    const isApprover =
      matchesCurrentUser(m.approverId) ||
      matchesCurrentUser(m.approverEmail) ||
      matchesCurrentUser(m.approverName);
    const attendeeIds = [
      ...(m.participants || []),
      ...(m.participantIds || []),
      ...(m.optionalMembers || []),
      ...(m.optionalMemberIds || []),
    ];
    const isAttendee = attendeeIds.some((id) => matchesCurrentUser(id));

    if (isApprovedMeeting(m.status)) {
      return isCreator || isApprover || isAttendee;
    }
    return isCreator || isApprover;
  });

  // Dynamic Project Progress Calculation helper
  const getProjectProgress = (p) => {
    const pId = p.id || p._id || p.code;
    const projTasks = activeTasks.filter((t) => {
      if (t.projectId === pId || t.project === pId || t.projectId === p.code) return true;
      if (t.parentId) {
        const parent = activeTasks.find(
          (pt) => pt && (pt.id === t.parentId || pt._id === t.parentId || pt.code === t.parentId)
        );
        if (parent && (parent.projectId === pId || parent.project === pId || parent.projectId === p.code)) {
          return true;
        }
      }
      return false;
    });

    const projCompletedCount = projTasks.filter((t) => checkIsCompleted(t.status)).length;
    const liveProgress =
      projTasks.length > 0
        ? Math.round((projCompletedCount / projTasks.length) * 100)
        : typeof p.progress === 'number'
          ? p.progress
          : 0;

    return {
      totalTasks: projTasks.length,
      completedTasks: projCompletedCount,
      progress: liveProgress,
    };
  };

  const handleDashboardApprove = async (m) => {
    try {
      await handleApproveMeeting(m.id || m._id);
      showSuccess('Meeting Approved', `"${m.title}" is now approved and visible to attendees.`);
    } catch (err) {
      showError('Approval Failed', err.message || 'Unable to approve meeting.');
    }
  };

  const handleDashboardDecline = async (m) => {
    const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
    const { value: reason } = await Swal.fire({
      title: 'Decline Meeting Sync',
      text: `Provide a reason for declining "${m.title}":`,
      input: 'text',
      inputPlaceholder: 'e.g. Schedule conflict...',
      showCancelButton: true,
      confirmButtonText: 'Decline Sync',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#e11d48',
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#f8fafc' : '#0f172a',
    });

    if (reason !== undefined) {
      try {
        await handleDeclineMeeting(m.id || m._id, reason || 'Declined by approver');
        showSuccess('Meeting Declined', `"${m.title}" status updated to Declined.`);
      } catch (err) {
        showError('Decline Failed', err.message || 'Unable to decline meeting.');
      }
    }
  };

  const handleDashboardDelete = async (m) => {
    const isCreator = matchesCurrentUser(m.requestedBy);
    if (!isCreator) {
      showError('Permission Denied', 'Only the meeting creator can delete this meeting.');
      return;
    }

    const confirmed = await showConfirm({
      title: 'Move to Archive?',
      text: `Delete "${m.title}" from upcoming? It will move to Archive and be visible only to Creator and Approver.`,
      confirmButtonText: 'Archive Meeting',
    });
    if (!confirmed) return;
    try {
      await handleDeleteMeeting(m.id || m._id, false);
      showSuccess('Meeting Archived', `"${m.title}" moved to Archive. Visible to Creator & Approver only.`);
    } catch (err) {
      showError('Delete Failed', err.message || 'Unable to archive meeting.');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Greeting & Quick Action Triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {getGreeting()}, {(currentUser?.name || 'Admin').split(' ')[0]}
            </h1>
          </div>
          <p className="text-xs flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-brand" />
            {currentDateStr}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {can('tasks.create') && (
            <button
              type="button"
              onClick={onOpenCreateTask}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          )}
          {can('projects.create') && (
            <button
              type="button"
              onClick={onOpenCreateProject}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-all shadow-2xs cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-brand" />
              New Project
            </button>
          )}
        </div>
      </div>

      {/* 4 Synchronized Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Projects */}
        <div
          onClick={() => handleNavigate('projects')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl hover:border-brand hover:shadow-md cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Active Projects
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-subtle text-brand flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {activeProjects.length}
            </span>
            <span className="text-[10px] text-brand font-semibold bg-brand-subtle px-2 py-0.5 rounded-full border border-brand-border">
              {activeProjects.length === 1 ? '1 Active' : `${activeProjects.length} Active`}
            </span>
          </div>
        </div>

        {/* Tasks Due Today */}
        <div
          onClick={() => handleNavigate('tasks')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Due Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {dueTodayTasks.length}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${dueTodayTasks.length > 0
                ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800'
                : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800'
                }`}
            >
              {dueTodayTasks.length > 0 ? 'Requires Action' : 'All Clear'}
            </span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div
          onClick={() => handleNavigate('tasks')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Completed Tasks
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {completedTasks.length}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {activeTasks.length > 0 ? `${Math.round((completedTasks.length / activeTasks.length) * 100)}% velocity` : '0%'}
            </span>
          </div>
        </div>

        {/* My Meetings KPI */}
        <div
          onClick={() => handleNavigate('meetings')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              My Meetings
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {myMeetings.length}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Active Syncs
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Project Progress & My Tasks (Synchronized Dynamic View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Columns: Active Project Progress Overview */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-subtle text-brand flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Project Progress
              </h2>
            </div>
            <button
              type="button"
              onClick={() => handleNavigate('projects')}
              className="text-[11px] font-semibold text-brand hover:text-brand-dark flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View all projects</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {activeProjects.slice(0, 6).map((p) => {
              const { totalTasks, completedTasks: pCompleted, progress } = getProjectProgress(p);

              return (
                <div
                  key={p.id || p._id || p.code}
                  onClick={() => onSelectProject && onSelectProject(p)}
                  className="py-3 hover:bg-slate-50/80 border border-gray-200 dark:border-slate-800 hover:!border-brand dark:hover:bg-slate-800/50 px-2.5 rounded-lg cursor-pointer group transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-brand bg-brand-subtle px-1.5 py-0.5 rounded border border-brand-border">
                        {p.code}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand dark:group-hover:text-white transition-colors truncate">
                        {p.name}
                      </span>
                      <ProjectTypeBadge type={p.type} size="xs" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* Dynamic Progress Bar */}
                    <div className="w-32 flex flex-col gap-1">
                      <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
                        {pCompleted}/{totalTasks} tasks
                      </span>
                    </div>
                    <StatusBadge status={p.status} size="xs" />
                  </div>
                </div>
              );
            })}

            {activeProjects.length === 0 && (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                No active projects found. Create a project to start tracking progress!
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Columns: My Tasks List */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                My Tasks
              </h2>
            </div>
            <button
              type="button"
              onClick={() => handleNavigate('tasks')}
              className="text-[11px] font-semibold text-brand hover:text-brand-dark flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Full table</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {myTasks.slice(0, 6).map((t) => (
              <div
                key={t.id || t._id || t.code}
                onClick={() => onSelectTask && onSelectTask(t)}
                className="py-2.5 px-2 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer group transition-all flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex items-center gap-2 truncate">
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                    {t.code}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-brand truncate">
                    {t.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={t.priority} size="xs" />
                  <StatusBadge status={t.status} size="xs" />
                </div>
              </div>
            ))}
            {myTasks.length === 0 && (
              <div className="py-8 text-center space-y-2">
                <p className="text-slate-400 dark:text-slate-500 text-xs">
                  No active tasks assigned to you right now.
                </p>
                {can('tasks.create') && (
                  <button
                    type="button"
                    onClick={onOpenCreateTask}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-brand bg-brand-subtle hover:bg-brand-light/40 rounded transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create a Task</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Row: My Meetings & Video Syncs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              My Meetings &amp; Video Syncs
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {myMeetings.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenScheduleMeeting}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('meetings')}
              className="text-[11px] font-semibold text-brand hover:text-brand-dark flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View all syncs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {myMeetings.slice(0, 4).map((m) => {
            const isCreator = matchesCurrentUser(m.requestedBy);
            const isApprover = matchesCurrentUser(m.approverId);
            const attendeeIds = [...(m.participants || []), ...(m.participantIds || [])];
            const isAttendee = attendeeIds.some((id) => matchesCurrentUser(id));
            const isAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin';
            const mId = m.id || m._id;

            return (
              <div
                key={mId}
                className="py-3 px-2.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 rounded-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-sm">
                      {m.title}
                    </span>
                    <StatusBadge status={m.status || 'Scheduled'} size="xs" />
                    {m.meetUrl && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <Video className="w-2.5 h-2.5" /> Video Link
                      </span>
                    )}
                    {isCreator && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Host
                      </span>
                    )}
                    {isAttendee && !isCreator && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Attendee
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {m.date} at {m.time} ({m.duration || '45 mins'})
                    </span>
                    <span>·</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Attendees:</span>
                      <AvatarGroup userIds={m.participants || m.participantIds || []} max={3} size="xs" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  {/* Join Video Room button: available if meetUrl exists */}
                  {m.meetUrl && (
                    <a
                      href={m.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] shadow-xs transition-colors"
                      title="Join online meeting"
                    >
                      <Video className="w-3 h-3" />
                      Join
                    </a>
                  )}

                  {/* Edit button: Creator or Admin only */}
                  {(isCreator || isAdmin) && (
                    <button
                      type="button"
                      onClick={() => handleOpenEditMeeting && handleOpenEditMeeting(m)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-semibold text-[10px] cursor-pointer transition-colors"
                      title="Edit meeting"
                    >
                      <Edit3 className="w-2.5 h-2.5 text-slate-500" />
                      Edit
                    </button>
                  )}

                  {/* Delete button: Creator or Admin only */}
                  {(isCreator || isAdmin) && (
                    <button
                      type="button"
                      onClick={() => handleDashboardDelete(m)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded font-semibold text-[10px] cursor-pointer transition-colors"
                      title="Delete and move to Archive"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {myMeetings.length === 0 && (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              No upcoming or pending meetings right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
