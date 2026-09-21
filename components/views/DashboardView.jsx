'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/components/providers/AppProvider';
import {
  Briefcase,
  CheckSquare,
  Clock,
  CheckCircle2,
  Users2,
  Video,
  ArrowUpRight,
  TrendingUp,
  Plus,
  ArrowRight,
  AlertTriangle,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Edit3,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { StatusBadge, PriorityBadge, ProjectTypeBadge } from '@/components/common/Badges';
import { UserAvatar, AvatarGroup } from '@/components/common/UserAvatar';
import { showConfirm, showSuccess, showError } from '@/lib/swal';
import Swal from 'sweetalert2';

export function DashboardView({
  projects,
  tasks,
  users,
  meetings,
  dependencies,
  currentUser,
  onNavigate,
  onSelectProject,
  onSelectTask,
  onOpenCreateTask,
  onOpenCreateProject,
  onOpenScheduleMeeting
}) {
  const router = useRouter();
  const {
    can,
    handleApproveMeeting,
    handleDeclineMeeting,
    handleOpenEditMeeting,
    handleDeleteMeeting,
    setIsScheduleMeetingOpen,
  } = useAppContext();
  const currentUserId = String(currentUser?.id || currentUser?._id || '');
  const currentUserEmail = String(currentUser?.email || '').toLowerCase();

  const myTasks = tasks.filter(t => t.assignedTo === currentUserId || t.assignedTo === currentUserEmail);
  const activeProjects = projects.filter(p => p.status !== "Completed");
  const overdueTasks = tasks.filter(t => t.status !== "Completed" && t.priority === "Urgent");
  const completedTasks = tasks.filter(t => t.status === "Completed");

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

  const isApprovedMeeting = (status) =>
    status === 'Approved' || status === 'Accepted' || status === 'Completed';

  const myMeetings = (meetings || []).filter((m) => {
    if (m.isArchived === true || m.status === 'Archived') return false;
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
      ...(m.optionalMemberIds || [])
    ];
    const isAttendee = attendeeIds.some((id) => matchesCurrentUser(id));

    if (isApprovedMeeting(m.status)) {
      return isCreator || isApprover || isAttendee;
    }
    // Pending Approval syncs: visible ONLY to Creator & Approver
    return isCreator || isApprover;
  });

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

  const recentActivities = [
    {
      id: 1,
      user: users[2], // Rahul
      action: "completed subtask",
      target: "PMV-001.1.1.1 Mobile Viewport Touch Tuning",
      time: "15 mins ago"
    },
    {
      id: 2,
      user: users[3], // Priya
      action: "created child subtask under",
      target: "PMV-001.1 UI/UX Design & Prototyping",
      time: "42 mins ago"
    },
    {
      id: 3,
      user: users[1], // Sarah
      action: "assigned project mandate",
      target: "FreshPod Mobile App 2.0 to Mobile Squad",
      time: "2 hours ago"
    },
    {
      id: 4,
      user: users[5], // Elena
      action: "scheduled Google Meet sync",
      target: "Weekly SEO & Traffic Velocity Sync",
      time: "3 hours ago"
    },
    {
      id: 5,
      user: users[6], // David
      action: "updated blocker status on",
      target: "AWS ElastiCache Redis VPC Peering",
      time: "Yesterday"
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Greeting & Quick Action Triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Good morning, {(currentUser?.name || 'Admin').split(' ')[0]}
            </h1>
          </div>
          <p className="text-xs flex flex-col md:flex-row text-slate-500 dark:text-slate-400 mt-1 items-start gap-2">Thursday, September 10, 2026</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {can('tasks.create') && (
            <button
              type="button"
              onClick={onOpenCreateTask}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-md shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          )}
          {can('projects.create') && (
            <button
              type="button"
              onClick={onOpenCreateProject}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
            >
              <Briefcase className="w-4 h-4 text-brand" />
              New Project
            </button>
          )}
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Active Projects */}
        <div
          onClick={() => onNavigate('projects')}
          className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl hover:border-brand hover:shadow-md cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Projects</span>
            <div className="w-7 h-7 rounded-lg bg-brand-subtle text-brand flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">{activeProjects.length}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full">+2 new</span>
          </div>
        </div>

        {/* Tasks Due Today */}
        <div
          onClick={() => onNavigate('tasks')}
          className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Due Today</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">4</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-full">On track</span>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div
          onClick={() => onNavigate('tasks')}
          className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl hover:border-rose-400 dark:hover:border-rose-500 hover:shadow-md cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Overdue</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">{overdueTasks.length}</span>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded-full">Triage</span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div
          onClick={() => onNavigate('tasks')}
          className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Completed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">{completedTasks.length}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full">84% velocity</span>
          </div>
        </div>

        {/* System Users & Access Control */}
        <div
          onClick={() => router.push('/masters')}
          className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl hover:border-brand dark:hover:border-brand hover:shadow-md cursor-pointer transition-all shadow-xs group"
          title="Open Masters Setup & Roles Access"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Access &amp; Users</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">{users.length}</span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded-full">RBAC Active</span>
          </div>
        </div>

        {/* Meetings KPI */}
        <div
          onClick={() => router.push('/meetings')}
          className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">My Meetings</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">{myMeetings.length}</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-full">
              {myMeetings.filter(m => !isApprovedMeeting(m.status)).length} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Project Progress & My Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Columns: Active Project Progress Overview */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Project Progress</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('projects')}
              className="text-[11px] font-semibold text-brand hover:text-brand-dark flex items-center gap-0.5"
            >
              <span>View all projects</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {projects.slice(0, 5).map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProject(p)}
                className="py-2.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 px-2 rounded-sm cursor-pointer group transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-brand">{p.code}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand transition-colors truncate">
                      {p.name}
                    </span>
                    <ProjectTypeBadge type={p.type} size="xs" />
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{p.client}</span>
                    <span>·</span>
                    <span>Category: {p.category || 'General'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Progress Bar */}
                  <div className="w-28 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500 dark:text-slate-400">Progress</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{p.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-xs overflow-hidden">
                      <div
                        className={`h-full rounded-xs transition-all ${p.progress === 100
                          ? 'bg-emerald-500'
                          : p.progress > 60
                            ? 'bg-brand'
                            : 'bg-amber-500'
                          }`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>

                  <StatusBadge status={p.status} size="xs" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Columns: My Tasks List */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-brand" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">My Tasks</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('tasks')}
              className="text-[11px] font-semibold text-brand hover:text-brand-dark flex items-center gap-0.5"
            >
              <span>Full table</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {myTasks.slice(0, 5).map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTask(t)}
                className="py-2 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-sm cursor-pointer group transition-colors flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex items-center gap-2 truncate">
                  <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded-xs shrink-0">
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
              <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                No active tasks assigned to you right now.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Row: My Meetings & Video Syncs (Role Governance: Creator, Approver, Attendee) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              My Meetings &amp; Video Syncs
            </h2>
            <span className="text-[10px] px-2 py-0.2 rounded-full font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {myMeetings.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenScheduleMeeting}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Schedule</span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/meetings')}
              className="text-[11px] font-semibold text-brand hover:text-brand-dark flex items-center gap-0.5 cursor-pointer"
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
                className="py-2.5 px-2 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 rounded transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-sm">
                      {m.title}
                    </span>
                    <StatusBadge status={m.status || 'Pending Approval'} size="xs" />
                    {isCreator && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Host
                      </span>
                    )}
                    {isApprover && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Approver
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
                  {/* Approver actions when pending */}
                  {(isApprover || isAdmin) &&
                    (m.status === 'Pending Approval' || m.status === 'Rescheduled' || m.status === 'Requested') && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDashboardApprove(m)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] shadow-xs cursor-pointer transition-colors"
                          title="Accept & approve"
                        >
                          <Check className="w-2.5 h-2.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDashboardDecline(m)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[10px] shadow-xs cursor-pointer transition-colors"
                          title="Deny with reason"
                        >
                          <X className="w-2.5 h-2.5" />
                          Decline
                        </button>
                      </>
                    )}

                  {/* Join Video Room button for Attendees/Creator when approved */}
                  {m.meetUrl && (isApprovedMeeting(m.status) || isCreator || isApprover || isAdmin) && (
                    <a
                      href={m.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] shadow-xs transition-colors"
                      title="Join meeting video room"
                    >
                      <Video className="w-3 h-3" />
                      Join
                    </a>
                  )}

                  {/* Edit button */}
                  {(isCreator || isApprover || isAttendee || isAdmin) && (
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

                  {/* Delete button: ONLY Creator can delete */}
                  {isCreator && (
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
            <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
              No upcoming or pending meetings right now.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Upcoming Deadlines & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 6 Columns: Upcoming Deadlines Timeline */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Upcoming Deadlines</h2>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Next 14 Days</span>
          </div>

          <div className="space-y-2 text-xs">
            {tasks
              .filter(t => t.status !== 'Completed')
              .slice(0, 4)
              .map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t)}
                  className="p-2.5 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-sm bg-slate-50/40 dark:bg-slate-800/40 cursor-pointer flex items-center justify-between gap-2 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-1.5 h-7 rounded-xs bg-amber-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{t.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Due: {t.targetDate} · {t.code}</p>
                    </div>
                  </div>
                  <PriorityBadge priority={t.priority} size="xs" />
                </div>
              ))}
          </div>
        </div>

        {/* Right 6 Columns: Real-Time Audit Stream */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Team Activity</h2>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Audit Log</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {tasks.length === 0 && projects.length === 0 && (
              <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                No recent activity yet. Create a project or task to begin!
              </div>
            )}
            {tasks.slice(0, 5).map((t, idx) => {
              const assignedUser = users.find(u => u.id === t.assignedTo || u._id === t.assignedTo) || currentUser;
              return (
                <div key={t.id || idx} className="flex items-start gap-2.5">
                  <UserAvatar user={assignedUser} size="xs" />
                  <div className="min-w-0 flex-1 leading-snug">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{assignedUser?.name || 'User'}</span>{' '}
                    <span className="text-slate-500 dark:text-slate-400">updated task</span>{' '}
                    <span className="font-medium text-slate-900 dark:text-slate-100 font-mono text-[11px]">{t.code} - {t.title}</span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Live updates active</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
