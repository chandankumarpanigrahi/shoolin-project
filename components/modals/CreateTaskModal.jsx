'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, CheckSquare, Calendar, User, Flag, AlertCircle } from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProvider';

export function CreateTaskModal({
  isOpen,
  onClose,
  projects,
  users,
  parentTask,
  defaultProjectId,
  onCreateTask
}) {
  const { getTaskStatuses } = useAppContext();
  const availableStatuses = (getTaskStatuses ? getTaskStatuses() : []).filter(s => s.status !== 'Inactive');
  const fallbackStatuses = ['Not Started', 'In Progress', 'Review', 'Blocked', 'Completed'];
  const statusOptions = availableStatuses.length > 0 ? availableStatuses.map(s => s.name) : fallbackStatuses;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.id || '');
  const [assignedTo, setAssignedTo] = useState(users[0]?.id || '');
  const [priority, setPriority] = useState('High');
  const [status, setStatus] = useState(statusOptions[0] || 'Not Started');
  const [targetDate, setTargetDate] = useState('2026-10-15');

  useEffect(() => {
    if (parentTask) {
      setProjectId(parentTask.projectId);
      setTitle('');
      setDescription('');
    } else if (defaultProjectId) {
      setProjectId(defaultProjectId);
    }
  }, [parentTask, defaultProjectId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

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
      createdBy: "usr-1",
      dependencies: []
    };

    onCreateTask(newTask);
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
              {parentTask ? `Create Subtask under ${parentTask.code}` : "Create New Task"}
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
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assignee</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs focus:outline-none focus:border-brand bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
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
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs focus:outline-none focus:border-brand bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
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
              <Plus className="w-3.5 h-3.5" />
              {parentTask ? "Create Subtask" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
