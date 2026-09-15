'use client';

import React, { useState } from 'react';
import { X, GitBranch, Plus, ArrowRight } from 'lucide-react';

export function AddDependencyModal({
  isOpen,
  onClose,
  projects,
  tasks,
  users,
  onAddDependency
}) {
  const [fromUser, setFromUser] = useState(users[2]?.id || 'usr-3'); // Rahul
  const [toUser, setToUser] = useState(users[4]?.id || 'usr-5'); // Marcus
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [relatedTaskId, setRelatedTaskId] = useState(tasks[0]?.id || '');
  const [dependencyDescription, setDependencyDescription] = useState('');
  const [details, setDetails] = useState('');
  const [expectedDate, setExpectedDate] = useState('2026-09-25');
  const [status, setStatus] = useState('Waiting');

  if (!isOpen) return null;

  const projectTasks = tasks.filter(t => t.projectId === projectId);
  const selectedTask = tasks.find(t => t.id === relatedTaskId) || tasks[0];
  const selectedProject = projects.find(p => p.id === projectId) || projects[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dependencyDescription.trim()) return;

    const newDep = {
      id: "dep-" + Date.now(),
      fromUser,
      toUser,
      taskTitle: selectedTask ? selectedTask.title : "Custom Deliverable",
      relatedTaskId: selectedTask ? selectedTask.id : null,
      relatedTaskCode: selectedTask ? selectedTask.code : "GEN-01",
      dependencyDescription: dependencyDescription.trim(),
      status,
      expectedDate,
      projectId,
      projectName: selectedProject ? selectedProject.name : "Active Mandate",
      details: details.trim() || "No further blocker details logged."
    };

    onAddDependency(newDep);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-sm shadow-2xl overflow-hidden text-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Log Blocker / Hand-off Dependency</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {/* Who to Who */}
          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-sm">
            <span className="block font-semibold text-amber-900 mb-2">Deliverable Hand-off Path</span>
            <div className="grid grid-cols-5 items-center gap-2">
              <div className="col-span-2">
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">From (Provider)</label>
                <select
                  value={fromUser}
                  onChange={(e) => setFromUser(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded-sm text-xs font-medium text-slate-800"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 flex justify-center text-amber-600">
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">To (Receiver / Blocked)</label>
                <select
                  value={toUser}
                  onChange={(e) => setToUser(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded-sm text-xs font-medium text-slate-800"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Project & Related Task */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-sm bg-white text-slate-800"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Related Task</label>
              <select
                value={relatedTaskId}
                onChange={(e) => setRelatedTaskId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-sm bg-white text-slate-800 font-mono"
              >
                {projectTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.code} · {t.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dependency Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              What is required? (e.g. Waiting for API schema / Figma sign-off) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={dependencyDescription}
              onChange={(e) => setDependencyDescription(e.target.value)}
              placeholder="e.g. Waiting for AWS ElastiCache IAM permissions"
              className="w-full px-3 py-2 border border-slate-200 rounded-sm text-xs font-medium text-slate-900 focus:outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expected Unblock Date</label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-sm text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dependency Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-sm bg-white text-slate-800"
              >
                <option value="Waiting">Waiting</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Blocker Specifics & Action Items</label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add technical context so both parties have clear alignment..."
              className="w-full px-3 py-1.5 border border-slate-200 rounded-sm text-xs text-slate-900"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-slate-600 hover:text-slate-800 rounded-sm">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Dependency
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
