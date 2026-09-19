'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, CheckSquare, Calendar, User, Flag, AlertCircle } from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProvider';
import { StatusSelect } from '@/components/common/Badges';
import { resolveUserObject } from '@/components/common/UserAvatar';

export function CreateTaskModal({
  isOpen,
  onClose,
  projects = [],
  users = [],
  parentTask,
  defaultProjectId,
  taskToEdit,
  onCreateTask,
  onUpdateTask
}) {
  const { getTaskStatuses, handleUpdateTask: globalUpdateTask, currentUser } = useAppContext();
  const availableStatuses = (getTaskStatuses ? getTaskStatuses() : []).filter(s => s.status !== 'Inactive');
  const fallbackStatuses = ['Not Started', 'In Progress', 'Review', 'Blocked', 'Completed'];
  const statusOptions = availableStatuses.length > 0 ? availableStatuses.map(s => s.name) : fallbackStatuses;

  const activeProjects = (projects || []).filter(
    (p) => p && !p.isDeleted && p.status !== 'Deleted'
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || activeProjects[0]?.id || '');
  const [assignedTo, setAssignedTo] = useState(users[0]?.id || '');
  const [priority, setPriority] = useState('High');
  const [status, setStatus] = useState(statusOptions[0] || 'Not Started');
  const [targetDate, setTargetDate] = useState('2026-10-15');

  const selectedProj = useMemo(
    () => (projects || []).find((p) => p.id === projectId || p._id === projectId || p.code === projectId),
    [projects, projectId]
  );

  const projectSquadUsers = useMemo(() => {
    if (!selectedProj) return users || [];
    const rawTeam = (selectedProj.teamIds && selectedProj.teamIds.length > 0)
      ? selectedProj.teamIds
      : (selectedProj.team && selectedProj.team.length > 0)
      ? selectedProj.team
      : [selectedProj.ownerId || selectedProj.owner, selectedProj.managerId || selectedProj.manager].filter(Boolean);

    const resolved = [];
    const seen = new Set();
    for (const memberKey of rawTeam) {
      const u = resolveUserObject(memberKey, users);
      if (u) {
        const id = u.id || u._id;
        if (!seen.has(id)) {
          seen.add(id);
          resolved.push(u);
        }
      }
    }
    return resolved.length > 0 ? resolved : (users || []);
  }, [selectedProj, users]);

  useEffect(() => {
    if (!isOpen) return;
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setProjectId(taskToEdit.projectId || defaultProjectId || projects[0]?.id || '');
      setAssignedTo(taskToEdit.assignedTo || users[0]?.id || '');
      setPriority(taskToEdit.priority || 'High');
      setStatus(taskToEdit.status || 'Not Started');
      setTargetDate(taskToEdit.targetDate || '2026-10-15');
    } else if (parentTask) {
      setProjectId(parentTask.projectId);
      setTitle('');
      setDescription('');
      setAssignedTo(users[0]?.id || '');
      setPriority('High');
      setStatus(statusOptions[0] || 'Not Started');
      setTargetDate('2026-10-15');
    } else {
      if (defaultProjectId) setProjectId(defaultProjectId);
      setTitle('');
      setDescription('');
      setAssignedTo(users[0]?.id || '');
      setPriority('High');
      setStatus(statusOptions[0] || 'Not Started');
      setTargetDate('2026-10-15');
    }
  }, [taskToEdit, parentTask, defaultProjectId, isOpen, projects, users]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (taskToEdit) {
      const targetId = taskToEdit.id || taskToEdit._id;
      const updates = {
        title: title.trim(),
        description: description.trim() || 'No extended description provided.',
        projectId,
        assignedTo,
        priority,
        status,
        targetDate,
      };
      if (onUpdateTask) {
        onUpdateTask(targetId, updates);
      } else if (globalUpdateTask) {
        globalUpdateTask(targetId, updates);
      }
      onClose();
      return;
    }

    // Generate hierarchical code
    let newCode = "TSK-" + Math.floor(100 + Math.random() * 900);
    let level = 0;

    if (parentTask) {
      newCode = `${parentTask.code}.${Math.floor(1 + Math.random() * 9)}`;
      level = (parentTask.level || 0) + 1;
    }

    const newTask = {
      id: "task-" + Date.now(),
      code: newCode,
      title: title.trim(),
      description: description.trim() || "No extended description provided.",
      projectId,
      parentId: parentTask ? parentTask.id : null,
      level,
      assignedTo,
      priority,
      status,
      targetDate,
      createdDate: new Date().toISOString().split('T')[0],
      createdBy: currentUser?.id || currentUser?._id || users[0]?.id || users[0]?._id,
      dependencies: []
    };

    if (onCreateTask) onCreateTask(newTask);
    onClose();
    setTitle('');
    setDescription('');
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {taskToEdit ? `Edit Task: ${taskToEdit.code}` : parentTask ? `Create Subtask under ${parentTask.code}` : "Create New Task"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Parent Task Context Callout */}
        {parentTask && (
          <div className="px-5 py-2 bg-brand-subtle border-b border-brand-border flex items-center gap-2 text-xs text-brand-text">
            <AlertCircle className="w-3.5 h-3.5 text-brand shrink-0" />
            <span className="truncate">
              <strong>Parent:</strong> <span className="font-mono font-semibold">{parentTask.code}</span> — {parentTask.title}
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Implement WebGL Interactive Globe Hero"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-sm text-xs focus:outline-none focus:border-brand text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Project</label>
              <select
                disabled={!!parentTask}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs focus:outline-none focus:border-brand bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900"
              >
                {activeProjects.map((p) => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assignee <span className="text-[10px] text-brand font-normal">(Squad First)</span>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs focus:outline-none focus:border-brand bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <optgroup label="Project Squad Members">
                  {projectSquadUsers.map((u) => (
                    <option key={u.id || u._id} value={u.id || u._id}>
                      {u.name} ({u.role || 'Member'})
                    </option>
                  ))}
                </optgroup>
                {users.some(u => !projectSquadUsers.some(su => (su.id || su._id) === (u.id || u._id))) && (
                  <optgroup label="Other Workspace Members">
                    {users
                      .filter(u => !projectSquadUsers.some(su => (su.id || su._id) === (u.id || u._id)))
                      .map((u) => (
                        <option key={u.id || u._id} value={u.id || u._id}>
                          {u.name} ({u.role || 'Member'})
                        </option>
                      ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs focus:outline-none focus:border-brand bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <StatusSelect
                value={status}
                onChange={setStatus}
                options={statusOptions}
                size="sm"
                className="w-full"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs focus:outline-none focus:border-brand text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description &amp; Acceptance Criteria</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail technical requirements, API payloads, or Figma links..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-sm text-xs focus:outline-none focus:border-brand text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-brand hover:bg-brand-hover active:bg-brand-hover text-white font-semibold rounded-sm shadow-xs transition-colors flex items-center gap-1.5"
            >
              {taskToEdit ? <CheckSquare className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {taskToEdit ? "Save Task Changes" : parentTask ? "Create Subtask" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
