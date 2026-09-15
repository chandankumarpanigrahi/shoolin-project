export const BEHAVIOR_PRESETS = [
  {
    id: 'completed',
    label: 'Marks as Completed (Strikethrough & Resolved)',
    shortLabel: 'Completed / Strikethrough',
    desc: 'Applies strikethrough styling to tasks & subtasks, marks items as 100% resolved',
    marksAsCompleted: true,
    defaultColor: 'emerald',
    defaultIcon: 'CheckCircle2',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'inprogress',
    label: 'Active Sprint Execution (In Progress)',
    shortLabel: 'Active Execution',
    desc: 'Actively assigned and currently underway in active sprint cycles',
    marksAsCompleted: false,
    defaultColor: 'blue',
    defaultIcon: 'PlayCircle',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'review',
    label: 'Verification & QA Sign-off (Review)',
    shortLabel: 'In Review / QA',
    desc: 'Work submitted for code review, quality assurance, or client approval',
    marksAsCompleted: false,
    defaultColor: 'violet',
    defaultIcon: 'Sparkles',
    badgeClass: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  {
    id: 'blocked',
    label: 'Blocked / Escalation Required',
    shortLabel: 'Blocked & Escalation',
    desc: 'Work is halted due to an external impediment, bug, or missing dependency',
    marksAsCompleted: false,
    defaultColor: 'rose',
    defaultIcon: 'AlertOctagon',
    badgeClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
  {
    id: 'paused',
    label: 'On Hold / Paused Priorities',
    shortLabel: 'On Hold / Paused',
    desc: 'Temporarily deprioritized or waiting on long-term roadmaps',
    marksAsCompleted: false,
    defaultColor: 'amber',
    defaultIcon: 'PauseCircle',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'backlog',
    label: 'Initial Backlog / Queued Deliverable',
    shortLabel: 'Backlog / Queued',
    desc: 'Freshly scoped item waiting for sprint planning assignment',
    marksAsCompleted: false,
    defaultColor: 'slate',
    defaultIcon: 'CircleDot',
    badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  },
  {
    id: 'normal',
    label: 'Standard Workflow Step',
    shortLabel: 'Standard Step',
    desc: 'General stage without special automation triggers',
    marksAsCompleted: false,
    defaultColor: 'slate',
    defaultIcon: 'CircleDot',
    badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  },
];

export const STATUS_COLOR_OPTIONS = [
  { id: 'emerald', name: 'Emerald Green', hex: '#059669', bgClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'blue', name: 'Royal Blue', hex: '#2563EB', bgClass: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'violet', name: 'Purple / Violet', hex: '#9333EA', bgClass: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'amber', name: 'Amber / Orange', hex: '#D97706', bgClass: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'rose', name: 'Rose Red', hex: '#E11D48', bgClass: 'bg-rose-100 text-rose-800 border-rose-300' },
  { id: 'teal', name: 'Teal Cyan', hex: '#0D9488', bgClass: 'bg-teal-100 text-teal-800 border-teal-300' },
  { id: 'slate', name: 'Cool Slate', hex: '#64748B', bgClass: 'bg-slate-100 text-slate-800 border-slate-300' },
];

export const STATUS_ICON_OPTIONS = [
  { id: 'CheckCircle2', label: 'Check Circle (Completed)' },
  { id: 'PlayCircle', label: 'Play Circle (Active)' },
  { id: 'Sparkles', label: 'Sparkles (QA / Review)' },
  { id: 'AlertOctagon', label: 'Alert Octagon (Blocked)' },
  { id: 'PauseCircle', label: 'Pause Circle (On Hold)' },
  { id: 'CircleDot', label: 'Dot Circle (Backlog / Queued)' },
  { id: 'Clock', label: 'Clock (In Progress)' },
  { id: 'Layers', label: 'Layers (Planning)' },
  { id: 'FolderGit2', label: 'Folder Git (Active Project)' },
  { id: 'Archive', label: 'Archive (Archived)' },
  { id: 'ShieldCheck', label: 'Shield (Compliance)' },
  { id: 'Flame', label: 'Flame (Urgent)' },
];

export const DEFAULT_MASTER_STATUSES = [
  {
    id: 'st-1',
    name: 'Not Started',
    scope: 'Task',
    color: 'slate',
    behavior: 'backlog',
    marksAsCompleted: false,
    icon: 'CircleDot',
    status: 'Active',
    desc: 'Default state for queued items in backlog'
  },
  {
    id: 'st-2',
    name: 'In Progress',
    scope: 'Task',
    color: 'blue',
    behavior: 'inprogress',
    marksAsCompleted: false,
    icon: 'PlayCircle',
    status: 'Active',
    desc: 'Actively assigned and currently underway in sprint'
  },
  {
    id: 'st-3',
    name: 'Review',
    scope: 'Task',
    color: 'violet',
    behavior: 'review',
    marksAsCompleted: false,
    icon: 'Sparkles',
    status: 'Active',
    desc: 'Deliverables pending QA signoff and technical review'
  },
  {
    id: 'st-4',
    name: 'Completed',
    scope: 'Task',
    color: 'emerald',
    behavior: 'completed',
    marksAsCompleted: true,
    icon: 'CheckCircle2',
    status: 'Active',
    desc: 'Resolved and tested — triggers task & subtask strikethrough'
  },
  {
    id: 'st-5',
    name: 'Blocked',
    scope: 'Task',
    color: 'rose',
    behavior: 'blocked',
    marksAsCompleted: false,
    icon: 'AlertOctagon',
    status: 'Active',
    desc: 'Dependent on external resolution or blocker escalation'
  },
  {
    id: 'st-6',
    name: 'On Hold',
    scope: 'Task',
    color: 'amber',
    behavior: 'paused',
    marksAsCompleted: false,
    icon: 'PauseCircle',
    status: 'Active',
    desc: 'Paused sprint priorities awaiting dependencies'
  },
  {
    id: 'st-7',
    name: 'Active Project',
    scope: 'Project',
    color: 'emerald',
    behavior: 'inprogress',
    marksAsCompleted: false,
    icon: 'FolderGit2',
    status: 'Active',
    desc: 'Currently funded mandate and live execution'
  },
  {
    id: 'st-8',
    name: 'In Planning',
    scope: 'Project',
    color: 'blue',
    behavior: 'backlog',
    marksAsCompleted: false,
    icon: 'Layers',
    status: 'Active',
    desc: 'Scoping deliverables, budgeting, and architecture'
  },
  {
    id: 'st-9',
    name: 'At Risk',
    scope: 'Project',
    color: 'rose',
    behavior: 'blocked',
    marksAsCompleted: false,
    icon: 'AlertOctagon',
    status: 'Active',
    desc: 'Schedule or resource escalation required'
  },
  {
    id: 'st-10',
    name: 'Archived',
    scope: 'Project',
    color: 'slate',
    behavior: 'completed',
    marksAsCompleted: true,
    icon: 'Archive',
    status: 'Archived',
    desc: 'Historical project archive'
  }
];

/**
 * Checks whether a given status is configured to mark tasks/subtasks as completed (triggering strikethrough).
 * Checks the dynamic statuses list (or localStorage cache), falling back to standard naming conventions.
 */
export function isCompletedStatus(statusName, customStatuses = null) {
  if (!statusName) return false;
  const normalized = String(statusName).trim().toLowerCase();

  // If a list of statuses was provided or can be read from localStorage
  let list = customStatuses;
  if (!list && typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('pulsepm_master_statuses_v2');
      if (saved) list = JSON.parse(saved);
    } catch (e) {
      list = null;
    }
  }

  if (Array.isArray(list) && list.length > 0) {
    const matched = list.find(
      (s) => s.name && s.name.trim().toLowerCase() === normalized
    );
    if (matched) {
      if (matched.marksAsCompleted === true) return true;
      if (matched.behavior === 'completed') return true;
      if (matched.marksAsCompleted === false) return false;
    }
  }

  // Fallback to recognized completed keywords
  const completedKeywords = ['completed', 'done', 'resolved', 'closed', 'finished', 'accepted'];
  return completedKeywords.includes(normalized);
}

/**
 * Helper to get behavioral metadata for a status
 */
export function getStatusMeta(statusName, customStatuses = null) {
  if (!statusName) return null;
  const normalized = String(statusName).trim().toLowerCase();

  let list = customStatuses;
  if (!list && typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('pulsepm_master_statuses_v2');
      if (saved) list = JSON.parse(saved);
    } catch (e) {
      list = null;
    }
  }

  if (!list) list = DEFAULT_MASTER_STATUSES;

  const matched = list.find(
    (s) => s.name && s.name.trim().toLowerCase() === normalized
  );

  return matched || null;
}
