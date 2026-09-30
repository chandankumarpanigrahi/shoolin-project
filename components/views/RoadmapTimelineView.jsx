'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Briefcase,
  Flag,
  ArrowRight,
  ExternalLink,
  GripVertical,
  MoveHorizontal,
  Maximize2,
  Sparkles,
  RotateCcw,
  Lock
} from 'lucide-react';
import { UserAvatar, resolveUserObject, isTaskAssignee } from '@/components/common/UserAvatar';
import { useAppContext } from '@/components/providers/AppProvider';
import { showError, showSuccess } from '@/lib/swal';
import { formatDate } from '@/lib/dateUtils';

const DAY_WIDTH = 26; // width in pixels per calendar day

export function RoadmapTimelineView({
  projects = [],
  tasks = [],
  users = [],
  onSelectProject,
  onSelectTask
}) {
  const { currentUser, handleUpdateProject, handleUpdateTask } = useAppContext();

  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [expandedProjects, setExpandedProjects] = useState({
    'proj-1': true,
    'proj-2': true,
    'proj-3': true
  });

  // Dynamic Today calculation
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  const todayLabel = useMemo(() => {
    return formatDate(today);
  }, [today]);

  // Scroll and Grid Container Refs
  const timelineScrollRef = useRef(null);
  const gridContainerRef = useRef(null);

  // Generate 365 calendar days for the active year (matching today's year)
  const currentYear = useMemo(() => today.getFullYear(), [today]);

  const { calendarDays, monthHeaders, totalYearDays } = useMemo(() => {
    const monthsData = [
      { name: `JAN ${currentYear}`, short: 'Jan', monthIndex: 0, count: 31 },
      { name: `FEB ${currentYear}`, short: 'Feb', monthIndex: 1, count: (currentYear % 4 === 0 ? 29 : 28) },
      { name: `MAR ${currentYear}`, short: 'Mar', monthIndex: 2, count: 31 },
      { name: `APR ${currentYear}`, short: 'Apr', monthIndex: 3, count: 30 },
      { name: `MAY ${currentYear}`, short: 'May', monthIndex: 4, count: 31 },
      { name: `JUN ${currentYear}`, short: 'Jun', monthIndex: 5, count: 30 },
      { name: `JUL ${currentYear}`, short: 'Jul', monthIndex: 6, count: 31 },
      { name: `AUG ${currentYear}`, short: 'Aug', monthIndex: 7, count: 31 },
      { name: `SEP ${currentYear}`, short: 'Sep', monthIndex: 8, count: 30 },
      { name: `OCT ${currentYear}`, short: 'Oct', monthIndex: 9, count: 31 },
      { name: `NOV ${currentYear}`, short: 'Nov', monthIndex: 10, count: 30 },
      { name: `DEC ${currentYear}`, short: 'Dec', monthIndex: 11, count: 31 }
    ];

    const days = [];
    const headers = [];
    let dayIndex = 0;

    monthsData.forEach(m => {
      const monthStartDayIndex = dayIndex;

      for (let dayNum = 1; dayNum <= m.count; dayNum++) {
        const dateObj = new Date(currentYear, m.monthIndex, dayNum);
        const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat
        const isWeekend = dayOfWeek === 0;
        // const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const dayLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][dayOfWeek];
        const monthNumStr = String(m.monthIndex + 1).padStart(2, '0');
        const dayNumStr = String(dayNum).padStart(2, '0');
        const isoDateStr = `${currentYear}-${monthNumStr}-${dayNumStr}`;

        days.push({
          index: dayIndex,
          monthIndex: m.monthIndex,
          monthName: m.short,
          dayNum,
          dayLetter,
          isWeekend,
          isoDateStr,
          timeMs: dateObj.getTime()
        });

        dayIndex++;
      }

      headers.push({
        ...m,
        startDayIndex: monthStartDayIndex,
        widthPx: m.count * DAY_WIDTH
      });
    });

    return { calendarDays: days, monthHeaders: headers, totalYearDays: dayIndex };
  }, [currentYear]);

  const totalGridWidthPx = totalYearDays * DAY_WIDTH;

  // Convert ISO Date string ("YYYY-MM-DD") to day index (0 to totalYearDays - 1)
  const getDayIndexFromIso = useCallback((isoStr, fallbackDayIndex = 0) => {
    if (!isoStr) return fallbackDayIndex;
    const idx = calendarDays.findIndex(d => d.isoDateStr === isoStr);
    if (idx !== -1) return idx;

    // Fallback date parser if string has different format or different year
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return fallbackDayIndex;
    const startYear = new Date(`${currentYear}-01-01T00:00:00Z`).getTime();
    const targetMs = d.getTime();
    const diffDays = Math.floor((targetMs - startYear) / 86400000);
    return Math.max(0, Math.min(totalYearDays - 1, diffDays));
  }, [calendarDays, totalYearDays, currentYear]);

  const getIsoFromDayIndex = useCallback((dayIdx) => {
    const validIdx = Math.max(0, Math.min(totalYearDays - 1, dayIdx));
    return calendarDays[validIdx]?.isoDateStr || `${currentYear}-01-01`;
  }, [calendarDays, totalYearDays, currentYear]);

  // Local state for dynamic schedule changes (Drag & Stretch)
  const [taskSchedules, setTaskSchedules] = useState({});

  // Active Drag State
  const [activeDrag, setActiveDrag] = useState(null);

  // Synchronize task schedules from live props (Date From & Date To)
  useEffect(() => {
    const taskMap = {};
    (tasks || []).forEach((t) => {
      const tId = t.id || t._id;
      if (!tId) return;
      const start = t.startDate || t.fromDate || (t.createdAt ? t.createdAt.split('T')[0] : todayIso);
      const due = t.dueDate || t.toDate || t.targetDate || t.endDate || start;
      taskMap[tId] = {
        startDate: start,
        dueDate: due
      };
    });
    setTaskSchedules((prev) => ({ ...prev, ...taskMap }));
  }, [tasks, todayIso]);

  // Derive project bounds dynamically from tasks (since projects don't have separate dates)
  const getProjectTaskBounds = useCallback((pId, pCode, project = null) => {
    const pTasks = (tasks || []).filter(t => t && (t.projectId === pId || t.projectId === pCode));
    if (pTasks.length === 0) {
      const fallbackStart = project?.startDate || project?.fromDate || (project?.createdAt ? project.createdAt.split('T')[0] : todayIso);
      const fallbackEnd = project?.endDate || project?.toDate || project?.targetDate || fallbackStart;
      return {
        startDate: fallbackStart,
        endDate: fallbackEnd,
        hasTasks: false,
        taskCount: 0
      };
    }

    let minStartIso = null;
    let maxDueIso = null;

    pTasks.forEach(t => {
      const tId = t.id || t._id;
      const sched = taskSchedules[tId] || {};
      const tStart = (activeDrag && activeDrag.itemType === 'task' && activeDrag.itemId === tId)
        ? getIsoFromDayIndex(activeDrag.currentStartIdx)
        : (sched.startDate || t.startDate || t.fromDate || todayIso);
      const tDue = (activeDrag && activeDrag.itemType === 'task' && activeDrag.itemId === tId)
        ? getIsoFromDayIndex(activeDrag.currentEndIdx)
        : (sched.dueDate || t.dueDate || t.toDate || t.targetDate || t.endDate || tStart);

      if (!minStartIso || tStart < minStartIso) minStartIso = tStart;
      if (!maxDueIso || tDue > maxDueIso) maxDueIso = tDue;
    });

    return {
      startDate: minStartIso || todayIso,
      endDate: maxDueIso || minStartIso || todayIso,
      hasTasks: true,
      taskCount: pTasks.length
    };
  }, [tasks, taskSchedules, activeDrag, todayIso, getIsoFromDayIndex]);

  const toggleProject = (pId) => {
    setExpandedProjects(prev => ({ ...prev, [pId]: !prev[pId] }));
  };

  const activeProjects = useMemo(() => {
    return (projects || []).filter(p => p && !p.isDeleted && p.status !== 'Deleted');
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return activeProjects.filter(p => {
      const pId = p.id || p._id;
      const matchProject = selectedProjectId === 'ALL' || pId === selectedProjectId;
      const matchStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
      return matchProject && matchStatus;
    });
  }, [activeProjects, selectedProjectId, selectedStatus]);

  // Helper to calculate pixel position & width for Gantt bars
  const getBarPixelPos = (startDateIso, endDateIso, overrideStartIdx, overrideEndIdx) => {
    const startIdx = overrideStartIdx !== undefined
      ? overrideStartIdx
      : getDayIndexFromIso(startDateIso, 30);
    const endIdx = overrideEndIdx !== undefined
      ? overrideEndIdx
      : getDayIndexFromIso(endDateIso, 60);

    const validStart = Math.max(0, Math.min(totalYearDays - 1, startIdx));
    const validEnd = Math.max(validStart, Math.min(totalYearDays - 1, endIdx));

    const leftPx = validStart * DAY_WIDTH;
    const durationDays = (validEnd - validStart) + 1;
    const widthPx = durationDays * DAY_WIDTH;

    return {
      leftPx,
      widthPx,
      startIdx: validStart,
      endIdx: validEnd,
      durationDays,
      startDateIso: getIsoFromDayIndex(validStart),
      endDateIso: getIsoFromDayIndex(validEnd)
    };
  };

  // Permission Checks: "Assigned person only drag or anything else do in Roadmaps"
  const canUserDragTask = useCallback((task, parentProject) => {
    if (!task || !currentUser) return false;
    return isTaskAssignee(task, currentUser, users);
  }, [currentUser, users]);

  // Drag Handlers for Tasks: Shift (Move) and Stretch (Left/Right edge resize)
  // Note: Projects cannot be manually moved or resized; they derive bounds dynamically from child tasks.
  const handleMouseDown = (e, itemType, itemId, mode, targetItem, parentProject = null) => {
    e.preventDefault();
    e.stopPropagation();

    // Only tasks are draggable/resizable
    if (itemType !== 'task') return;

    // Verify permission: only assigned person can drag
    if (!canUserDragTask(targetItem, parentProject)) {
      const assigneeObj = targetItem?.assignedTo ? resolveUserObject(targetItem.assignedTo, users) : null;
      const assigneeName = assigneeObj?.name || 'the assigned member';
      showError(
        'Access Denied',
        `Only the assigned member (${assigneeName}) can reschedule or resize this task.`
      );
      return;
    }

    const sched = taskSchedules[itemId] || {};
    const origStartIso = sched.startDate || targetItem?.startDate || targetItem?.fromDate || todayIso;
    const origEndIso = sched.dueDate || targetItem?.dueDate || targetItem?.toDate || targetItem?.targetDate || origStartIso;

    const origStartIdx = getDayIndexFromIso(origStartIso, 30);
    const origEndIdx = getDayIndexFromIso(origEndIso, 60);

    setActiveDrag({
      itemType: 'task',
      itemId,
      targetProject: parentProject,
      projectCode: targetItem?.projectId || targetItem?.code || '',
      mode, // 'move' | 'left' | 'right'
      startX: e.clientX,
      origStartIdx,
      origEndIdx,
      currentStartIdx: origStartIdx,
      currentEndIdx: origEndIdx
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!activeDrag) return;

    const deltaPx = e.clientX - activeDrag.startX;
    const deltaDays = Math.round(deltaPx / DAY_WIDTH);

    let newStartIdx = activeDrag.origStartIdx;
    let newEndIdx = activeDrag.origEndIdx;

    if (activeDrag.mode === 'move') {
      const duration = activeDrag.origEndIdx - activeDrag.origStartIdx;
      newStartIdx = Math.max(0, Math.min(totalYearDays - 1 - duration, activeDrag.origStartIdx + deltaDays));
      newEndIdx = newStartIdx + duration;
    } else if (activeDrag.mode === 'left') {
      newStartIdx = Math.max(0, Math.min(activeDrag.origEndIdx - 1, activeDrag.origStartIdx + deltaDays));
      newEndIdx = activeDrag.origEndIdx;
    } else if (activeDrag.mode === 'right') {
      newStartIdx = activeDrag.origStartIdx;
      newEndIdx = Math.min(totalYearDays - 1, Math.max(activeDrag.origStartIdx + 1, activeDrag.origEndIdx + deltaDays));
    }

    setActiveDrag(prev => prev ? ({
      ...prev,
      currentStartIdx: newStartIdx,
      currentEndIdx: newEndIdx
    }) : null);
  }, [activeDrag, totalYearDays]);

  const handleMouseUp = useCallback(async () => {
    if (!activeDrag) return;

    const finalStartIso = getIsoFromDayIndex(activeDrag.currentStartIdx);
    const finalEndIso = getIsoFromDayIndex(activeDrag.currentEndIdx);

    if (activeDrag.itemType === 'task') {
      // 1. Immediately reflect locally
      setTaskSchedules(prev => ({
        ...prev,
        [activeDrag.itemId]: {
          startDate: finalStartIso,
          dueDate: finalEndIso
        }
      }));

      // 2. Persist to MongoDB and sync across all clients immediately
      if (handleUpdateTask) {
        try {
          await handleUpdateTask(activeDrag.itemId, {
            startDate: finalStartIso,
            fromDate: finalStartIso,
            dueDate: finalEndIso,
            targetDate: finalEndIso,
            endDate: finalEndIso,
            toDate: finalEndIso
          });
        } catch (err) {
          console.error('Failed to sync task dates to server:', err);
        }
      }

      // 3. Keep parent project bounds synchronized in database as well
      if (handleUpdateProject && activeDrag.targetProject) {
        const pId = activeDrag.targetProject.id || activeDrag.targetProject._id;
        const pCode = activeDrag.targetProject.code;
        const updatedProjectTasks = (tasks || []).filter(t => t && (t.projectId === pId || t.projectId === pCode));
        let minStart = finalStartIso;
        let maxDue = finalEndIso;
        updatedProjectTasks.forEach(t => {
          const tId = t.id || t._id;
          if (tId === activeDrag.itemId) return;
          const sched = taskSchedules[tId] || {};
          const s = sched.startDate || t.startDate || t.fromDate;
          const d = sched.dueDate || t.dueDate || t.toDate || t.targetDate || t.endDate || s;
          if (s && (!minStart || s < minStart)) minStart = s;
          if (d && (!maxDue || d > maxDue)) maxDue = d;
        });

        try {
          await handleUpdateProject(pId, {
            startDate: minStart,
            fromDate: minStart,
            endDate: maxDue,
            dueDate: maxDue,
            targetDate: maxDue
          });
        } catch (err) {
          console.error('Failed to sync project dates to server:', err);
        }
      }
    }

    setActiveDrag(null);
  }, [activeDrag, getIsoFromDayIndex, handleUpdateTask, handleUpdateProject, tasks, taskSchedules]);

  useEffect(() => {
    if (activeDrag) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeDrag, handleMouseMove, handleMouseUp]);

  // Today position calculation (Dynamically computed from todayIso)
  const todayDayIndex = useMemo(() => {
    return getDayIndexFromIso(todayIso, 254);
  }, [getDayIndexFromIso, todayIso]);

  const todayLeftPx = useMemo(() => {
    return todayDayIndex * DAY_WIDTH + (DAY_WIDTH / 2);
  }, [todayDayIndex]);

  // Quick navigation scrollTo helper — Workable Today Button
  const jumpToPeriod = useCallback((period) => {
    if (!timelineScrollRef.current) return;
    const scrollEl = timelineScrollRef.current;
    const containerWidth = scrollEl.clientWidth || 800;

    if (period === 'full') {
      scrollEl.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (period === 'today') {
      // Accurately center the current day in the viewport
      const targetPx = Math.max(0, (todayDayIndex * DAY_WIDTH) - (containerWidth / 2) + (DAY_WIDTH / 2));
      scrollEl.scrollTo({ left: targetPx, behavior: 'smooth' });
    } else if (period === 'q1') {
      scrollEl.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (period === 'q2') {
      scrollEl.scrollTo({ left: 90 * DAY_WIDTH, behavior: 'smooth' });
    } else if (period === 'q3') {
      scrollEl.scrollTo({ left: 181 * DAY_WIDTH, behavior: 'smooth' });
    } else if (period === 'q4') {
      scrollEl.scrollTo({ left: 273 * DAY_WIDTH, behavior: 'smooth' });
    }
  }, [todayDayIndex]);

  // Auto-scroll to Today on initial mount
  useEffect(() => {
    if (timelineScrollRef.current && todayDayIndex >= 0) {
      const scrollEl = timelineScrollRef.current;
      const containerWidth = scrollEl.clientWidth || 800;
      const targetPx = Math.max(0, (todayDayIndex * DAY_WIDTH) - (containerWidth / 2) + (DAY_WIDTH / 2));
      scrollEl.scrollTo({ left: targetPx, behavior: 'auto' });
    }
  }, [todayDayIndex]);

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-3 sm:mb-0">
            <Calendar className="w-5 h-5 text-brand" />
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {currentYear} Roadmap
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full scrollable calendar. Project spans auto-wrap deliverables. Assigned members can drag task bars to adjust Date From &amp; Date To.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-xs border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 shadow-2xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Completed</span>
            <span className="w-2 h-2 rounded-full bg-brand ml-1" />
            <span>Active</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 ml-1" />
            <span>Planning</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Quick Jump */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Project Filter:
          </div>

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand font-medium shadow-2xs"
          >
            <option value="ALL">All Projects ({activeProjects.length})</option>
            {activeProjects.map(p => (
              <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand font-medium shadow-2xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="In Progress">In Progress</option>
            <option value="Planning">Planning</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Quick View Jump Buttons — Dynamic Workable Today Button */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-[11px] font-semibold uppercase text-slate-400 mr-1 shrink-0">Jump To:</span>
          <button
            type="button"
            onClick={() => jumpToPeriod('today')}
            className="px-2.5 py-1 text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xs hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            title={`Center roadmap on today: ${todayLabel}, ${currentYear}`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Today</span>
          </button>
          <button
            type="button"
            onClick={() => jumpToPeriod('q1')}
            className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xs transition-colors shrink-0"
          >
            Q1
          </button>
          <button
            type="button"
            onClick={() => jumpToPeriod('q2')}
            className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xs transition-colors shrink-0"
          >
            Q2
          </button>
          <button
            type="button"
            onClick={() => jumpToPeriod('q3')}
            className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xs transition-colors shrink-0"
          >
            Q3
          </button>
          <button
            type="button"
            onClick={() => jumpToPeriod('q4')}
            className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xs transition-colors shrink-0"
          >
            Q4
          </button>
          <button
            type="button"
            onClick={() => jumpToPeriod('full')}
            className="px-2 py-0.5 text-xs font-semibold bg-brand-subtle text-brand border border-brand-border rounded-xs hover:bg-brand-light/30 transition-colors shrink-0"
          >
            Full Year
          </button>
        </div>
      </div>

      {/* Main Roadmap Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden flex flex-col">
        <div className="flex flex-row overflow-hidden">
          {/* Sticky Left Column: Project & Deliverable Titles */}
          <div className="w-[180px] sm:w-[320px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-20 flex flex-col shadow-sm">
            {/* Left Header matching 2-row calendar height */}
            <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/90 flex items-center justify-between font-bold text-xs text-slate-600 dark:text-slate-300">
              <span className="uppercase tracking-wider text-[11px]">Project</span>
              <span className="text-[11px] text-slate-400">Progress</span>
            </div>

            {/* Left Body Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredProjects.map((project) => {
                const pId = project.id || project._id;
                const projectTasks = tasks.filter(t => t.projectId === pId || t.projectId === project.code);
                const isExpanded = !!expandedProjects[pId];
                const projCode = project.code || pId.toUpperCase();

                return (
                  <div key={pId} className="flex flex-col">
                    {/* Project Row Header */}
                    <div className="h-14 px-3.5 flex items-center justify-between gap-2 bg-slate-100/80 dark:bg-slate-800/80 border-y border-slate-200/90 dark:border-slate-700/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleProject(pId)}
                          className="w-5 h-5 flex items-center justify-center rounded-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shrink-0"
                        >
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>

                        <div className="min-w-0 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectProject && onSelectProject(project)}
                            className="font-bold text-xs text-slate-900 dark:text-slate-100 hover:text-brand truncate text-left"
                            title={project.name}
                          >
                            {project.name}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                          {project.progress || 0}%
                        </span>
                      </div>
                    </div>

                    {/* Sub-tasks Rows on Left */}
                    {isExpanded && projectTasks.length > 0 && (
                      <div className="bg-slate-50/50 dark:bg-slate-900/50 divide-y divide-slate-100 dark:divide-slate-800/40 border-t border-slate-100 dark:border-slate-800/60">
                        {projectTasks.map((task) => {
                          const tId = task.id || task._id;
                          const taskCode = task.code || tId;
                          const canDragT = canUserDragTask(task, project);

                          return (
                            <div key={tId} className="h-9 px-3 pl-7 flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <UserAvatar user={task.assignedTo} size="xs" />
                                <span className="font-mono text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800 px-1 py-0.2 rounded-xs shrink-0">
                                  {taskCode}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onSelectTask && onSelectTask(task)}
                                  className="text-xs text-slate-700 dark:text-slate-300 hover:text-brand truncate text-left"
                                >
                                  {task.title}
                                </button>
                                {!canDragT && (
                                  <span title="Read-only view (Only assigned member can reschedule)" className="text-slate-400 shrink-0">
                                    <Lock className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </div>

                              <span className={`text-[9px] px-1.5 py-0.2 font-semibold rounded-xs border shrink-0 ${task.status === 'Completed'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : task.status === 'In Progress'
                                  ? 'bg-brand-subtle text-brand border-brand-border'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                }`}>
                                {task.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Scrollable Timeline Grid Axis (365 Days) */}
          <div
            ref={timelineScrollRef}
            className="flex-1 overflow-x-auto relative"
          >
            <div
              ref={gridContainerRef}
              style={{ width: `${totalGridWidthPx}px` }}
              className="relative min-w-full"
            >
              {/* 365 Days 2-Row Header */}
              <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/90 flex flex-col font-mono text-slate-700 dark:text-slate-200">
                {/* Row 1: Month Names Header Bar */}
                <div className="h-7 flex border-b border-slate-200/80 dark:border-slate-700/70">
                  {monthHeaders.map((m, idx) => {
                    const isQuarterEnd = idx === 2 || idx === 5 || idx === 8;
                    return (
                      <div
                        key={m.name}
                        style={{ width: `${m.widthPx}px` }}
                        className={`flex items-center justify-center font-bold text-[11px] uppercase tracking-wider text-slate-800 dark:text-slate-100 bg-slate-100/50 dark:bg-slate-800/50 truncate px-2 ${isQuarterEnd
                          ? 'border-r-2 border-r-slate-400 dark:border-r-slate-500 font-extrabold'
                          : 'border-r border-slate-200 dark:border-slate-700/80'
                          }`}
                      >
                        {m.name} ({m.count}d)
                      </div>
                    );
                  })}
                </div>

                {/* Row 2: Every Single Calendar Day (1..31) + Day Letter */}
                <div className="h-9 flex">
                  {calendarDays.map(d => {
                    const isToday = d.isoDateStr === todayIso;
                    const isQuarterEnd = d.isoDateStr === `${currentYear}-03-31` || d.isoDateStr === `${currentYear}-06-30` || d.isoDateStr === `${currentYear}-09-30`;
                    return (
                      <div
                        key={d.index}
                        style={{ width: `${DAY_WIDTH}px` }}
                        className={`flex flex-col items-center justify-center text-[9px] ${isQuarterEnd
                          ? 'border-r-2 border-r-slate-400 dark:border-r-slate-500'
                          : 'border-r border-slate-200/50 dark:border-slate-800/50'
                          } ${isToday
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 font-black'
                            : d.isWeekend
                              ? 'bg-slate-200/40 dark:bg-slate-800/80 text-slate-400 font-semibold'
                              : 'text-slate-600 dark:text-slate-300 font-bold'
                          }`}
                      >
                        <span>{d.dayNum}</span>
                        <span className="text-[8px] opacity-60 uppercase">{d.dayLetter}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vertical Day Background Columns & Quarter Borders Overlay */}
              <div className="absolute inset-0 pt-16 flex pointer-events-none z-0">
                {calendarDays.map(d => {
                  const isQuarterEnd = d.isoDateStr === `${currentYear}-03-31` || d.isoDateStr === `${currentYear}-06-30` || d.isoDateStr === `${currentYear}-09-30`;
                  const isTodayCol = d.isoDateStr === todayIso;
                  return (
                    <div
                      key={d.index}
                      style={{ width: `${DAY_WIDTH}px` }}
                      className={`h-full ${isQuarterEnd
                        ? 'border-r-2 border-r-slate-400/90 dark:border-r-slate-600/90 z-20'
                        : 'border-r border-slate-200 dark:border-slate-800'
                        } ${isTodayCol
                          ? 'bg-rose-50/30 dark:bg-rose-950/20'
                          : d.isWeekend
                            ? 'bg-red-200 dark:bg-red-900/60'
                            : ''
                        }`}
                    />
                  );
                })}
              </div>

              {/* Today Red Line Indicator & Floating Badge (Positioned at dynamic todayLeftPx) */}
              <div
                className="absolute top-16 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none shadow-sm"
                style={{ left: `${todayLeftPx}px` }}
              >
                <div className="sticky top-0 -ml-7 px-2 w-fit py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-full shadow-md flex items-center gap-1 border border-white dark:border-slate-900 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>Today</span>
                </div>
              </div>

              {/* Timeline Bar Tracks */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 relative z-10">
                {filteredProjects.map((project) => {
                  const pId = project.id || project._id;
                  const projectTasks = tasks.filter(t => t.projectId === pId || t.projectId === project.code);
                  const isExpanded = !!expandedProjects[pId];
                  const projCode = project.code || pId.toUpperCase();
                  const projectBounds = getProjectTaskBounds(pId, project.code, project);
                  const projPos = getBarPixelPos(projectBounds.startDate, projectBounds.endDate);

                  return (
                    <div key={pId} className="flex flex-col">
                      {/* Project Bar Track (Auto-spans child tasks, Non-draggable) */}
                      <div className="h-14 relative flex items-center bg-purple-800/10 dark:bg-slate-800/40 border-y border-slate-200/90 dark:border-slate-700/80">
                        <div
                          className="group relative h-8 rounded-lg shadow-sm transition-all flex items-center px-3 text-white font-semibold text-xs overflow-visible cursor-pointer hover:brightness-105 hover:shadow-md"
                          style={{
                            left: `${projPos.leftPx}px`,
                            width: `${projPos.widthPx}px`,
                            backgroundColor: project.color || 'var(--brand-primary)'
                          }}
                          onClick={() => toggleProject(pId)}
                          title="Click to toggle deliverables"
                        >
                          {/* Center Content with Code/ID & Deliverables Count */}
                          <div className="flex items-center justify-between w-full min-w-0 gap-1.5 pointer-events-none px-1">
                            <span className="truncate font-bold tracking-tight drop-shadow-sm flex items-center gap-1.5">
                              <span className="opacity-90 font-mono text-[10px] bg-black/25 px-1 py-0.2 rounded">
                                [{projCode}]
                              </span>
                              <span>{project.name}</span>
                            </span>
                            <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full font-bold font-mono shrink-0">
                              {projectBounds.hasTasks ? `${projPos.durationDays}d (${projectBounds.taskCount} tasks)` : 'No tasks'}
                            </span>
                          </div>

                          {/* Live Hover Date Range Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-mono rounded-md shadow-md whitespace-nowrap pointer-events-none z-30">
                            <Calendar className="w-3 h-3 text-brand" />
                            <span>
                              [{projCode}] {project.name} | Deliverables Span: {formatDate(projPos.startDateIso)} – {formatDate(projPos.endDateIso)} ({projectBounds.taskCount} tasks, {projPos.durationDays} days) (Auto-calculated from tasks)
                            </span>
                          </div>

                          {/* Progress fill */}
                          <div
                            className="absolute bottom-0 left-0 h-1 bg-white/40 rounded-full pointer-events-none"
                            style={{ width: `${project.progress || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Sub-tasks Tracks */}
                      {isExpanded && projectTasks.length > 0 && (
                        <div className="bg-slate-50/50 dark:bg-slate-900/50 divide-y divide-slate-100 dark:divide-slate-800/40 border-t border-slate-100 dark:border-slate-800/60">
                          {projectTasks.map((task) => {
                            const tId = task.id || task._id;
                            const isTaskDragging = activeDrag && activeDrag.itemType === 'task' && activeDrag.itemId === tId;
                            const taskSched = taskSchedules[tId] || {};
                            const taskStart = taskSched.startDate || task.startDate || task.fromDate || todayIso;
                            const taskDue = taskSched.dueDate || task.dueDate || task.toDate || task.targetDate || taskStart;

                            const taskPos = getBarPixelPos(
                              taskStart,
                              taskDue,
                              isTaskDragging ? activeDrag.currentStartIdx : undefined,
                              isTaskDragging ? activeDrag.currentEndIdx : undefined
                            );

                            const taskCode = task.code || tId;
                            const canDragT = canUserDragTask(task, project);

                            return (
                              <div key={tId} className="h-9 relative flex items-center">
                                <div
                                  className={`group relative h-6 rounded-md shadow-2xs transition-shadow flex items-center px-2 text-white font-medium text-[11px] overflow-visible ${canDragT
                                    ? 'cursor-grab active:cursor-grabbing'
                                    : 'cursor-default'
                                    } ${isTaskDragging
                                      ? 'ring-2 ring-brand ring-offset-1 z-30 shadow-md brightness-110 scale-[1.01]'
                                      : 'hover:brightness-105'
                                    } ${task.status === 'Completed'
                                      ? 'bg-emerald-600'
                                      : task.status === 'In Progress'
                                        ? 'bg-brand'
                                        : 'bg-slate-500'
                                    }`}
                                  style={{
                                    left: `${taskPos.leftPx}px`,
                                    width: `${taskPos.widthPx}px`
                                  }}
                                  onMouseDown={(e) => canDragT ? handleMouseDown(e, 'task', tId, 'move', task, project) : e.preventDefault()}
                                >
                                  {/* Left Stretch Handle: Drag to adjust Date From */}
                                  {canDragT && (
                                    <div
                                      title="Drag left edge to resize Date From"
                                      className="absolute left-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-white/40 rounded-l-md z-20"
                                      onMouseDown={(e) => handleMouseDown(e, 'task', tId, 'left', task, project)}
                                    />
                                  )}

                                  <div className="flex items-center justify-between w-full min-w-0 pointer-events-none px-1 gap-1">
                                    <span className="truncate text-[10px] font-semibold flex items-center gap-1">
                                      <span className="opacity-90 font-mono text-[9px] bg-black/25 px-1 py-0.2 rounded shrink-0">
                                        [{taskCode}]
                                      </span>
                                      <span>{task.title}</span>
                                    </span>
                                    <span className="text-[9px] opacity-75 font-mono shrink-0">
                                      {taskPos.durationDays}d
                                    </span>
                                  </div>

                                  {/* Right Stretch Handle: Drag to adjust Date To */}
                                  {canDragT && (
                                    <div
                                      title="Drag right edge to resize Date To"
                                      className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-white/40 rounded-r-md z-20"
                                      onMouseDown={(e) => handleMouseDown(e, 'task', tId, 'right', task, project)}
                                    />
                                  )}

                                  {/* Task Tooltip with Date From and Date To */}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 text-white text-[9px] font-mono rounded shadow-md whitespace-nowrap pointer-events-none z-30">
                                    <span>[{taskCode}] {task.title} | From: {formatDate(taskPos.startDateIso)} – To: {formatDate(taskPos.endDateIso)} ({taskPos.durationDays}d)</span>
                                    {!canDragT && <span className="text-amber-400 font-sans ml-1">(View Only)</span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
