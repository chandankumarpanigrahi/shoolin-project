'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowLeft,
  Briefcase,
  Plus,
  Edit,
  Calendar,
  Clock,
  CheckSquare,
  Video,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  CornerDownRight,
  Sparkles,
  CheckCircle2,
  Circle,
  Search,
  X,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import { StatusBadge, PriorityBadge, ProjectTypeBadge, StatusSelect } from '@/components/common/Badges';
import { UserAvatar, AvatarGroup, resolveUserObject, isTaskAssignee } from '@/components/common/UserAvatar';
import { useAppContext } from '@/components/providers/AppProvider';
import { useUrlTab } from '@/hooks/useUrlState';
import { showError, showConfirm, showSuccess } from '@/lib/swal';
import { formatDate } from '@/lib/dateUtils';
import { isChildTask } from '@/lib/taskUtils';

export function ProjectDetailView({
  project,
  allTasks,
  users,
  meetings,
  dependencies,
  links,
  onBack,
  onSelectTask,
  onEditProject,
  onOpenCreateTask,
  onOpenScheduleMeeting,
  onOpenAddDependency,
  onOpenAddLink,
  onUpdateTaskStatus
}) {
  const { isCompletedStatus, getTaskStatuses, toggleTaskComplete, handleOpenEditProject, handleOpenEditTask, can, currentUser, handleUpdateTask, handleToggleProjectAutoRenew, handleUpdateProject } = useAppContext();
  const [activeTab, setActiveTab] = useUrlTab('tab', 'tasks', [
    'overview',
    'tasks',
    'meetings',
  ]);

  const taskStatusesList = React.useMemo(() => {
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

  const [taskSearch, setTaskSearch] = useState('');
  const [taskFilterStatus, setTaskFilterStatus] = useState('ALL');
  const [taskFilterPriority, setTaskFilterPriority] = useState('ALL');
  const [taskFilterAssignee, setTaskFilterAssignee] = useState('ALL');
  const isFiltering = taskSearch.trim() || taskFilterStatus !== 'ALL' || taskFilterPriority !== 'ALL' || taskFilterAssignee !== 'ALL';

  if (!project) return null;

  const projectTasks = (allTasks || []).filter((t) => {
    if (!t) return false;
    if (t.projectId === project.id || t.projectId === project._id || t.projectId === project.code) return true;
    if (t.parentId) {
      const parent = (allTasks || []).find((pt) => pt && (pt.id === t.parentId || pt._id === t.parentId || pt.code === t.parentId));
      if (parent && (parent.projectId === project.id || parent.projectId === project._id || parent.projectId === project.code)) return true;
    }
    return false;
  });
  const projectMeetings = (meetings || []).filter((m) => {
    if (!m || !m.projectId) return false;
    const mProj = String(m.projectId).trim();
    const pId = String(project.id || '').trim();
    const pUnderscoreId = String(project._id || '').trim();
    const pCode = String(project.code || '').trim();
    const pName = String(project.name || '').trim();
    return (
      mProj === pId ||
      mProj === pUnderscoreId ||
      mProj === pCode ||
      mProj === pName
    );
  });
  const ownerTarget = project.ownerId || project.owner;
  const ownerUser = resolveUserObject(ownerTarget, users) || (ownerTarget ? { name: 'Assigned Owner', role: 'User' } : { name: 'Unassigned', role: 'None' });

  const managerTarget = project.managerId || project.manager;
  const managerUser = resolveUserObject(managerTarget, users) || ownerUser;

  const isSuperAdmin = currentUser?.role === 'Super Admin';
  const assignableUsers = (users || []).filter((u) => u.role !== 'Super Admin');

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignNewOwnerId, setReassignNewOwnerId] = useState('');
  const [memberToRemoveAfterReassign, setMemberToRemoveAfterReassign] = useState(null);

  const handleOpenReassignOnly = () => {
    setMemberToRemoveAfterReassign(null);
    setReassignNewOwnerId('');
    setShowReassignModal(true);
  };

  const handleRemoveMemberClick = async (u) => {
    if (!u) return;
    const uId = u.id || u._id;
    const targetOwnerCanonical = resolveUserObject(ownerTarget, users);
    const isOwner =
      String(uId).toLowerCase() === String(ownerTarget).toLowerCase() ||
      (targetOwnerCanonical && (targetOwnerCanonical.id === uId || targetOwnerCanonical._id === uId));

    if (isOwner) {
      setMemberToRemoveAfterReassign(u);
      setReassignNewOwnerId('');
      setShowReassignModal(true);
      return;
    }

    const confirmed = await showConfirm({
      title: 'Remove Squad Member?',
      text: `Do you want to remove ${u.name} from this project's assigned team?`,
      confirmButtonText: 'Yes, Remove Member',
      cancelButtonText: 'Cancel'
    });

    if (confirmed) {
      const currentTeam = (project.teamIds && project.teamIds.length > 0)
        ? project.teamIds
        : (project.team && project.team.length > 0)
          ? project.team
          : [];
      const updatedTeam = currentTeam.filter((id) => {
        const canonical = resolveUserObject(id, users);
        const cid = canonical ? (canonical.id || canonical._id) : id;
        return String(cid).toLowerCase() !== String(uId).toLowerCase();
      });

      if (handleUpdateProject) {
        await handleUpdateProject(project.id || project._id, {
          teamIds: updatedTeam,
          team: updatedTeam
        });
      }
      showSuccess('Member Removed', `${u.name} has been removed from the project team.`);
    }
  };

  const handleConfirmReassignModal = async () => {
    if (!reassignNewOwnerId) return;
    const newOwnerObj = resolveUserObject(reassignNewOwnerId, users);
    if (!newOwnerObj) return;

    const newOwnerKey = newOwnerObj.id || newOwnerObj._id;
    const currentTeam = (project.teamIds && project.teamIds.length > 0)
      ? project.teamIds
      : (project.team && project.team.length > 0)
        ? project.team
        : [];

    let updatedTeam = [...currentTeam];

    if (memberToRemoveAfterReassign) {
      const oldId = memberToRemoveAfterReassign.id || memberToRemoveAfterReassign._id;
      updatedTeam = updatedTeam.filter((id) => {
        const canonical = resolveUserObject(id, users);
        const cid = canonical ? (canonical.id || canonical._id) : id;
        return String(cid).toLowerCase() !== String(oldId).toLowerCase();
      });
    }

    if (!updatedTeam.some((id) => {
      const canonical = resolveUserObject(id, users);
      const cid = canonical ? (canonical.id || canonical._id) : id;
      return String(cid).toLowerCase() === String(newOwnerKey).toLowerCase();
    })) {
      updatedTeam.push(newOwnerKey);
    }

    updatedTeam = updatedTeam.filter((id) => {
      const canonical = resolveUserObject(id, users);
      return !canonical || canonical.role !== 'Super Admin';
    });

    const updates = {
      ownerId: newOwnerKey,
      owner: newOwnerKey,
      managerId: newOwnerKey,
      manager: newOwnerKey,
      teamIds: updatedTeam,
      team: updatedTeam
    };

    if (handleUpdateProject) {
      await handleUpdateProject(project.id || project._id, updates);
    }

    setShowReassignModal(false);
    const msg = memberToRemoveAfterReassign
      ? `Project owner reassigned to ${newOwnerObj.name} and ${memberToRemoveAfterReassign.name} was removed from the squad.`
      : `Project owner reassigned to ${newOwnerObj.name}.`;
    setMemberToRemoveAfterReassign(null);
    setReassignNewOwnerId('');
    showSuccess('Owner Reassigned', msg);
  };

  const rawTeamList = (project.teamIds && project.teamIds.length > 0)
    ? project.teamIds
    : (project.team && project.team.length > 0)
      ? project.team
      : [ownerTarget, managerTarget].filter(Boolean);

  const seenTeamKeys = new Set();
  const teamUsers = [];
  for (const item of rawTeamList) {
    const userObj = resolveUserObject(item, users);
    if (!userObj) continue;
    if (userObj.role === 'Super Admin') continue;
    const key = String(userObj.id || userObj._id || userObj.email || userObj.name).toLowerCase();
    if (!seenTeamKeys.has(key)) {
      seenTeamKeys.add(key);
      teamUsers.push(userObj);
    }
  }

  const completedCount = projectTasks.filter(t => isCompletedStatus ? isCompletedStatus(t.status) : (t.status === 'Completed')).length;
  const inProgressCount = projectTasks.filter(t => t.status === 'In Progress' || t.status === 'Active').length;
  const blockedCount = projectTasks.filter(t => t.status === 'Blocked').length;
  const reviewCount = projectTasks.filter(t => t.status === 'Review' || t.status === 'Not Started').length;

  const liveProgress = projectTasks.length > 0
    ? Math.round((completedCount / projectTasks.length) * 100)
    : (project.progress || 0);

  const hasBlockedOrRisk = projectTasks.some((t) => {
    const norm = (t.status || '').toLowerCase();
    return norm.includes('block') || norm.includes('risk') || norm.includes('delay');
  });

  const activeTasks = projectTasks.filter((t) => !(isCompletedStatus ? isCompletedStatus(t.status) : t.status === 'Completed'));
  const allReview = activeTasks.length > 0 && activeTasks.every((t) => (t.status || '').toLowerCase().includes('review'));

  const liveStatus = projectTasks.length > 0 && completedCount === projectTasks.length
    ? 'Completed'
    : hasBlockedOrRisk
      ? 'At Risk'
      : allReview
        ? 'Review'
        : (project.status || 'In Progress');

  const livePriority = activeTasks.some(t => t.priority === 'Urgent')
    ? 'Urgent'
    : activeTasks.some(t => t.priority === 'High')
      ? 'High'
      : activeTasks.some(t => t.priority === 'Medium')
        ? 'Medium'
        : (project.priority || 'Medium');

  const toggleTaskExpand = (taskId) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const collapseAll = () => {
    const allIds = {};
    projectTasks.forEach(t => { allIds[t.id] = false; });
    setExpandedTasks(allIds);
  };

  const expandAll = () => {
    const allIds = {};
    projectTasks.forEach(t => { allIds[t.id] = true; });
    setExpandedTasks(allIds);
  };

  const [dragOverId, setDragOverId] = React.useState(null);
  const [dragOverPos, setDragOverPos] = React.useState('below'); // 'above' | 'below' | 'child'
  const dragSrcIdRef = React.useRef(null);

  const handleDragStart = (e, taskId) => {
    dragSrcIdRef.current = taskId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e, taskId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const third = rect.height / 3;
    let pos = 'below';
    if (relY < third) pos = 'above';
    else if (relY < third * 2) pos = 'child';
    setDragOverId(taskId);
    setDragOverPos(pos);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
    setDragOverPos('below');
  };

  const handleDrop = async (e, targetTaskId) => {
    e.preventDefault();
    const srcId = dragSrcIdRef.current;
    setDragOverId(null);
    setDragOverPos('below');
    if (!srcId || srcId === targetTaskId) return;

    // Prevent dropping a parent onto one of its own descendants
    const isDescendant = (parentId, checkId) => {
      const parentDummy = { id: parentId, _id: parentId };
      const children = projectTasks.filter(t => isChildTask(t, parentDummy, projectTasks));
      return children.some(c => c.id === checkId || isDescendant(c.id, checkId));
    };
    if (isDescendant(srcId, targetTaskId)) return;

    const targetTask = projectTasks.find(t => t.id === targetTaskId);
    if (!targetTask) return;

    let updates = {};
    if (dragOverPos === 'child') {
      // Nest src under target
      updates = { parentId: targetTaskId };
      // Auto-expand the target
      setExpandedTasks(prev => ({ ...prev, [targetTaskId]: true }));
    } else {
      // Sibling of target — same parent
      updates = { parentId: targetTask.parentId || null };
    }

    if (handleUpdateTask) {
      await handleUpdateTask(srcId, updates);
    }
    dragSrcIdRef.current = null;
  };

  const handleDragEnd = () => {
    dragSrcIdRef.current = null;
    setDragOverId(null);
  };

  // Build project squad user list for assignee dropdown (only members assigned to this project)
  const projectSquadUsers = React.useMemo(() => {
    const rawTeam = [
      ...(Array.isArray(project.teamIds) ? project.teamIds : []),
      ...(Array.isArray(project.team) ? project.team : []),
      project.ownerId,
      project.owner,
      project.managerId,
      project.manager,
    ].filter(Boolean);

    if (rawTeam.length === 0) {
      return users || [];
    }

    const resolved = [];
    const seen = new Set();
    for (const memberKey of rawTeam) {
      const u = resolveUserObject(memberKey, users);
      if (u) {
        const id = String(u.id || u._id || '').toLowerCase();
        if (id && !seen.has(id)) {
          seen.add(id);
          resolved.push(u);
        }
      }
    }
    return resolved;
  }, [project, users]);


  // Build root tasks (not a child of any task in this project)
  const rootTasks = projectTasks.filter(t => !projectTasks.some(p => isChildTask(t, p, projectTasks)));

  // Recursive task tree row renderer
  const renderTaskNode = (task, level = 0) => {
    const isDragOver = dragOverId === task.id;
    const children = projectTasks.filter(t => isChildTask(t, task, projectTasks));
    const hasChildren = children.length > 0;
    const isExpanded = expandedTasks[task.id] !== undefined ? !!expandedTasks[task.id] : true;
    const assignee = task.assignedTo ? resolveUserObject(task.assignedTo, users) : null;
    const assigneeDisplayName = assignee ? assignee.name : 'Unassigned';

    const isCompleted = isCompletedStatus ? isCompletedStatus(task.status) : (task.status === 'Completed');
    const isAssignee = isTaskAssignee(task, currentUser, users);

    const dragOverBorder =
      isDragOver && dragOverPos === 'child'
        ? 'outline outline-2 outline-brand/60 bg-brand-light/10'
        : isDragOver && dragOverPos === 'above'
          ? 'border-t-2 border-t-brand'
          : isDragOver && dragOverPos === 'below'
            ? 'border-b-2 border-b-brand'
            : '';

    return (
      <React.Fragment key={task.id}>
        <tr
          draggable={isAssignee}
          onDragStart={(e) => handleDragStart(e, task.id)}
          onDragOver={(e) => handleDragOver(e, task.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, task.id)}
          onDragEnd={handleDragEnd}
          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-pointer group transition-colors border-b border-slate-100 dark:border-slate-800 ${dragOverBorder}`}
        >
          {/* Drag handle — only for assignee */}
          <td className={`py-2.5 pl-2 pr-0 w-5 select-none ${isAssignee ? 'text-slate-300 dark:text-slate-700 cursor-grab active:cursor-grabbing' : 'text-slate-200 dark:text-slate-800 cursor-not-allowed opacity-40'}`} title={isAssignee ? 'Drag to reorder or reparent' : `Only ${assigneeDisplayName} can reorder this task`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" /></svg>
          </td>
          <td className="py-2.5 px-3">
            <div className="flex items-center gap-1.5" style={{ paddingLeft: `${level * 22}px` }}>
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaskExpand(task.id);
                  }}
                  className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <span className="w-4" />
              )}
              <UserAvatar user={task.assignedTo} size="xs" />
              <span className="font-mono text-[11px] font-semibold text-brand shrink-0">{task.code}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAssignee) {
                    showError(
                      'Access Denied',
                      `Only the assigned member (${assigneeDisplayName}) can change the status of this task.`
                    );
                    return;
                  }
                  if (toggleTaskComplete) toggleTaskComplete(task.id);
                  else onUpdateTaskStatus(task.id, isCompleted ? 'In Progress' : 'Completed');
                }}
                className={`p-0.5 rounded-full transition-colors ${isAssignee
                  ? 'hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
                  }`}
                title={
                  !isAssignee
                    ? `Only assigned member (${assigneeDisplayName}) can change status`
                    : isCompleted
                      ? 'Mark as Incomplete'
                      : 'Mark as Completed'
                }
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 hover:text-emerald-600 transition-transform active:scale-95" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 hover:text-emerald-500 transition-colors active:scale-95" />
                )}
              </button>
              <span
                onClick={() => onSelectTask(task)}
                className={`truncate font-medium hover:text-brand hover:underline cursor-pointer ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                  }`}
              >
                {task.title}
              </span>
            </div>
          </td>

          <td className="py-2.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
            <div className="relative group/assignee">
              <div className="flex items-center gap-1.5">
                <UserAvatar user={task.assignedTo} size="xs" />
                <select
                  value={task.assignedTo || ''}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    if (!isAssignee) {
                      showError(
                        'Access Denied',
                        `Only the assigned member (${assigneeDisplayName}) can reassign this task.`
                      );
                      return;
                    }
                    if (handleUpdateTask) handleUpdateTask(task.id || task._id, { assignedTo: newVal });
                  }}
                  disabled={!isAssignee}
                  title={
                    !isAssignee
                      ? `Only the assigned member (${assigneeDisplayName}) can reassign this task`
                      : 'Click to reassign'
                  }
                  className={`text-xs font-medium bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-brand rounded-sm px-0.5 py-0 max-w-[120px] truncate ${!assignee
                    ? 'text-slate-400 italic'
                    : 'text-slate-700 dark:text-slate-300'
                    } ${isAssignee
                      ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800'
                      : 'cursor-not-allowed opacity-70'
                    }`}
                >
                  <option value="">Unassigned (None)</option>
                  {projectSquadUsers.map((u) => (
                    <option key={u.id || u._id} value={u.id || u._id}>
                      {u.name} ({u.role || 'Member'})
                    </option>
                  ))}
                  {assignee && !projectSquadUsers.some(su => String(su.id || su._id).toLowerCase() === String(assignee.id || assignee._id).toLowerCase()) && (
                    <option key={assignee.id || assignee._id} value={assignee.id || assignee._id}>
                      {assignee.name} (Current Assignee)
                    </option>
                  )}
                </select>
              </div>
            </div>
          </td>

          <td className="py-2.5 px-3 whitespace-nowrap">
            <PriorityBadge priority={task.priority} size="xs" />
          </td>

          <td className="py-2.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
            <StatusSelect
              value={task.status}
              onChange={(newStatus) => {
                if (!isAssignee) {
                  showError(
                    'Access Denied',
                    `Only the assigned member (${assigneeDisplayName}) can change the status of this task.`
                  );
                  return;
                }
                onUpdateTaskStatus(task.id, newStatus);
              }}
              options={taskStatusesList}
              size="xs"
              disabled={!isAssignee}
              title={!isAssignee ? `Only assigned member (${assigneeDisplayName}) can change task status` : undefined}
            />
          </td>

          <td className="py-2.5 px-3 whitespace-nowrap">
            <div className="flex flex-col text-[11px] font-mono leading-tight">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1 font-semibold">
                <span className="text-slate-400 font-normal w-8 text-right">From:</span>
                {formatDate(task.startDate || task.fromDate)}
              </span>
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1 font-semibold">
                <span className="text-rose-500 font-normal w-8 text-right">To:</span>
                {formatDate(task.dueDate || task.toDate || task.targetDate || task.endDate)}
              </span>
            </div>
          </td>

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
                onClick={() => handleOpenEditTask ? handleOpenEditTask(task) : onSelectTask(task)}
                className="p-1 text-slate-400 hover:text-brand hover:bg-brand-light/30 rounded-xs"
                title="Edit Task"
              >
                <Edit className="w-3.5 h-3.5" />
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

        {hasChildren && isExpanded && children.map(child => renderTaskNode(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-4 pb-12 text-xs">
      {/* Top Banner Navigation & Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="hidden sm:inline-block p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
              title="Back to all projects"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] sm:text-sm font-bold text-brand bg-brand-light/30 border border-brand/30 px-2 py-0.5 rounded-sm">
                  {project.code}
                </span>
                <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">{project.name}</h1>
                <ProjectTypeBadge type={project.type} size="xs" />
                <StatusBadge status={liveStatus} size="xs" />
                <PriorityBadge priority={livePriority} size="xs" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                <span>Category: {project.category}</span>
              </p>
            </div>
          </div>

          <div className="flex justify-end items-center gap-2">
            <button
              type="button"
              onClick={() => (onEditProject || handleOpenEditProject)(project)}
              className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-sm border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Edit className="w-4 sm:w-3.5 h-4 sm:h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Edit Project</span>
            </button>
            <button
              type="button"
              onClick={onOpenScheduleMeeting}
              className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-sm border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Video className="w-4 sm:w-3.5 h-4 sm:h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Sync Meet</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenCreateTask(null)}
              className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover active:bg-brand-active rounded-sm shadow-xs transition-colors"
            >
              <Plus className="w-4 sm:w-3.5 h-4 sm:h-3.5" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>

        {/* 3 Tabs Navigation Bar */}
        <div className="flex items-center gap-1 border-t border-slate-100 dark:border-slate-800 pt-3 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview', icon: Briefcase },
            { id: 'tasks', label: `Tasks (${projectTasks.length})`, icon: CheckSquare },
            { id: 'meetings', label: `Meetings (${projectMeetings.length})`, icon: Video },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors whitespace-nowrap ${isActive
                  ? 'bg-brand-light/40 text-brand border border-brand/40 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Metrics summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Total Tasks</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">{projectTasks.length}</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">Completed</span>
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{completedCount}</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs">
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">In Progress</span>
              <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{inProgressCount}</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs">
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">Blocked / Review</span>
              <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">{blockedCount + reviewCount}</span>
            </div>
          </div>

          {/* Progress Banner */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Project Completion Velocity</span>
              <span className="font-mono font-bold text-brand">{liveProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-xs overflow-hidden">
              <div className="h-full bg-brand rounded-xs transition-all" style={{ width: `${liveProgress}%` }} />
            </div>
          </div>

          {/* Details & Team Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-4 shadow-2xs space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Scope Description
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {project.description}
              </p>

              {project.type === 'recurring' && project.recurringConfig && (
                <div className="mt-3 p-3.5 bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 rounded-md space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-cyan-950 dark:text-cyan-200 text-xs">
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span>Recurring Cadence: {project.recurringConfig.frequency || 'Monthly'}</span>
                    </div>
                    {project.recurringConfig.currentCycle && (
                      <span className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-700">
                        Cycle: {project.recurringConfig.currentCycle}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-cyan-900 dark:text-cyan-200">
                    <div>
                      <span className="text-cyan-700 dark:text-cyan-400 block text-[10px] uppercase font-bold">Cut-off Day</span>
                      <span className="font-semibold">{project.recurringConfig.monthlyDay || 1}st of every month</span>
                    </div>
                    <div>
                      <span className="text-cyan-700 dark:text-cyan-400 block text-[10px] uppercase font-bold">Next Automated Cycle Date</span>
                      <strong className="font-semibold text-cyan-950 dark:text-cyan-100">{formatDate(project.recurringConfig.nextCycleDate)}</strong>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-cyan-200/60 dark:border-cyan-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="text-[11px] text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                      <span>Auto-Renewal:</span>
                      <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${project.recurringConfig.autoRenew !== false
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}>
                        {project.recurringConfig.autoRenew !== false ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    {handleToggleProjectAutoRenew && (
                      <button
                        type="button"
                        onClick={() => handleToggleProjectAutoRenew(project.id || project._id)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md border shadow-2xs transition-colors flex items-center gap-1.5 ${project.recurringConfig.autoRenew !== false
                          ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                          }`}
                      >
                        {project.recurringConfig.autoRenew !== false ? (
                          <>
                            <PauseCircle className="w-3.5 h-3.5" />
                            <span>Pause Auto-Renewal</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Resume Auto-Renewal</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Project Stakeholders
                </h3>
                {isSuperAdmin && (
                  <span className="text-[10px] font-bold text-brand bg-brand-light/40 border border-brand/30 px-1.5 py-0.2 rounded-xs">
                    Super Admin Mode
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/60 rounded-sm">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Accountable Owner</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{ownerUser.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserAvatar user={ownerUser} size="xs" />
                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={handleOpenReassignOnly}
                        className="text-[10px] font-bold text-brand hover:underline bg-brand-light/30 border border-brand/30 px-2 py-0.5 rounded transition-colors"
                        title="Reassign Project Owner (Super Admin Only)"
                      >
                        Change
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                    Assigned Engineers &amp; Designers ({teamUsers.length})
                  </span>
                  <div className="space-y-1">
                    {teamUsers.map(u => (
                      <div key={u.id || u._id} className="flex items-center justify-between py-1 px-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-sm group">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <UserAvatar user={u} size="xs" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{u.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{u.role}</p>
                          </div>
                        </div>
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMemberClick(u)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition-opacity"
                            title={`Remove ${u.name} from project`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TASKS HIERARCHICAL TREE */}
      {activeTab === 'tasks' && (
        <div className="space-y-0">
          {/* Filter / Search bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs mb-3 p-3 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search by code or task title..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-brand text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <select
              value={taskFilterStatus}
              onChange={(e) => setTaskFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand font-medium"
            >
              <option value="ALL">All Statuses</option>
              {taskStatusesList.map((st) => (
                <option key={st.id || st.name} value={st.name}>{st.name}</option>
              ))}
            </select>
            <select
              value={taskFilterPriority}
              onChange={(e) => setTaskFilterPriority(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              value={taskFilterAssignee}
              onChange={(e) => setTaskFilterAssignee(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand font-medium"
            >
              <option value="ALL">All Assignees</option>
              {projectSquadUsers.map(u => (
                <option key={u.id || u._id} value={u.id || u._id}>{u.name}</option>
              ))}
            </select>
            {isFiltering && (
              <button
                type="button"
                onClick={() => { setTaskSearch(''); setTaskFilterStatus('ALL'); setTaskFilterPriority('ALL'); setTaskFilterAssignee('ALL'); }}
                className="flex items-center gap-1 text-xs text-brand hover:underline font-bold px-1"
              >
                <X className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-brand" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">All Tasks</h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">({projectTasks.length} total)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={expandAll}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-sm transition-colors"
                  title="Expand all tasks and subtasks"
                >
                  <ChevronDown className="w-3 h-3" />
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-sm transition-colors"
                  title="Collapse all tasks and subtasks"
                >
                  <ChevronRight className="w-3 h-3" />
                  Collapse All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 pl-2 pr-0 w-5"></th>
                    <th className="py-2.5 px-3">Task ID &amp; Tasks</th>
                    <th className="py-2.5 px-3">Assignee</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Timeline</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(() => {
                    // Apply filters: when filtering, show all matching tasks flat; otherwise tree
                    const q = taskSearch.trim().toLowerCase();
                    const filtered = projectTasks.filter(t => {
                      if (q && !(t.title || '').toLowerCase().includes(q) && !(t.code || '').toLowerCase().includes(q)) return false;
                      if (taskFilterStatus !== 'ALL' && t.status !== taskFilterStatus) return false;
                      if (taskFilterPriority !== 'ALL' && t.priority !== taskFilterPriority) return false;
                      if (taskFilterAssignee !== 'ALL' && String(t.assignedTo || '') !== taskFilterAssignee) return false;
                      return true;
                    });
                    if (isFiltering) {
                      return filtered.length > 0
                        ? filtered.map(t => renderTaskNode(t, 0))
                        : (<tr><td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500">No tasks match the current filters.</td></tr>);
                    }
                    return rootTasks.length > 0
                      ? rootTasks.map(t => renderTaskNode(t, 0))
                      : (<tr><td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500">No tasks found in this project. Click &ldquo;Add Task&rdquo; to begin breaking down work.</td></tr>);
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* TAB 3: MEETINGS */}
      {activeTab === 'meetings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Meetings</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {projectMeetings.map((m) => (
              <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{m.title}</span>
                  <StatusBadge status={m.status} size="xs" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>{formatDate(m.date)} &middot; {m.time}</span>
                    {m.meetUrl && (
                      <span className="text-[9px] font-sans font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Online
                      </span>
                    )}
                  </div>
                  {m.meetUrl && (
                    <a
                      href={m.meetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                    >
                      Join Meet
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
            {projectMeetings.length === 0 && (
              <div className="col-span-2 py-8 text-center text-slate-400 dark:text-slate-500">
                No meetings scheduled specifically for this project.
              </div>
            )}
          </div>
        </div>
      )}
      {/* Super Admin Reassign Owner Modal */}
      {isSuperAdmin && showReassignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {memberToRemoveAfterReassign ? 'Reassign Owner to Remove Member' : 'Reassign Project Owner'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setShowReassignModal(false); setMemberToRemoveAfterReassign(null); }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              {memberToRemoveAfterReassign ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded text-amber-800 dark:text-amber-200 space-y-1">
                  <p className="font-bold">
                    {memberToRemoveAfterReassign.name} is the current Accountable Owner.
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    A project must always have an Accountable Owner. Please select another squad member to take over project ownership before removing {memberToRemoveAfterReassign.name}.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select a new Accountable Owner for project <strong>{project.name}</strong> ({project.code}):
                </p>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Accountable Owner <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reassignNewOwnerId}
                  onChange={(e) => setReassignNewOwnerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand"
                >
                  <option value="">— Select New Project Owner —</option>
                  {assignableUsers.filter((u) => {
                    const uid = u.id || u._id;
                    const curId = memberToRemoveAfterReassign ? (memberToRemoveAfterReassign.id || memberToRemoveAfterReassign._id) : (ownerUser?.id || ownerUser?._id);
                    return String(uid).toLowerCase() !== String(curId).toLowerCase();
                  }).map((u) => {
                    const uid = u.id || u._id;
                    return (
                      <option key={uid} value={uid}>
                        {u.name} ({u.role})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setShowReassignModal(false); setMemberToRemoveAfterReassign(null); }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reassignNewOwnerId}
                onClick={handleConfirmReassignModal}
                className="px-4 py-1.5 bg-brand hover:bg-brand-hover disabled:opacity-40 text-white rounded text-xs font-semibold shadow-xs"
              >
                {memberToRemoveAfterReassign ? 'Reassign & Remove' : 'Save New Owner'}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
