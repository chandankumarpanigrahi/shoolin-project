'use client';

import React, { useState } from 'react';
import { X, Plus, FolderGit2, Calendar, RefreshCw, Layers, Sparkles } from 'lucide-react';
import { TEMPLATES } from '@/data/templates';

export function CreateProjectModal({
  isOpen,
  onClose,
  users,
  onCreateProject,
  initialTemplate = null
}) {
  const [name, setName] = useState(initialTemplate ? `${initialTemplate.name} - Batch 1` : '');
  const [type, setType] = useState(initialTemplate ? initialTemplate.type : 'one-time');
  const [client, setClient] = useState('PMV Global Group');
  const [brand, setBrand] = useState('PMV');
  const [category, setCategory] = useState(initialTemplate ? initialTemplate.category : 'Website Development');
  const [owner, setOwner] = useState(users[1]?.id || users[0]?.id || '');
  const [manager, setManager] = useState(users[2]?.id || users[0]?.id || '');
  const [priority, setPriority] = useState('High');
  const [status, setStatus] = useState('In Progress');
  const [startDate, setStartDate] = useState('2026-09-15');
  const [targetDate, setTargetDate] = useState('2026-12-15');
  const [budget, setBudget] = useState('$35,000');
  const [description, setDescription] = useState(initialTemplate ? initialTemplate.description : '');
  const [color, setColor] = useState('#2563EB');

  // Recurring fields
  const [recurrenceFrequency, setRecurrenceFrequency] = useState('Monthly');
  const [monthlyDay, setMonthlyDay] = useState(5);
  const [startMonth, setStartMonth] = useState('October 2026');
  const [endCondition, setEndCondition] = useState('Annual Contract (12 cycles)');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const code = (brand.slice(0, 3).toUpperCase() || 'PRJ') + '-' + Math.floor(100 + Math.random() * 900);

    const newProj = {
      id: "proj-" + Date.now(),
      code,
      name: name.trim(),
      color,
      client,
      brand,
      type,
      category,
      owner,
      manager,
      team: [owner, manager, users[4]?.id || users[0]?.id],
      progress: 0,
      status,
      priority,
      startDate,
      targetDate,
      description: description.trim() || "No extended description.",
      budget: type === 'recurring' ? `${budget}/mo` : budget,
      tasksCount: initialTemplate ? initialTemplate.tasksCount : 12,
      completedTasksCount: 0,
      ...(type === 'recurring' && {
        recurringConfig: {
          frequency: recurrenceFrequency,
          monthlyDay,
          startMonth,
          endCondition,
          deliverablesPerCycle: 12,
          nextCycleDate: `2026-10-${monthlyDay < 10 ? '0' + monthlyDay : monthlyDay}`
        }
      })
    };

    onCreateProject(newProj);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-md shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center text-white shadow-sm font-bold">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                {initialTemplate ? `Create Project from Template: ${initialTemplate.name}` : "Create New Project Mandate"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set budget, accountable leadership, delivery cadence, and target dates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Project Type Toggle (One Time vs Recurring) */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Project Delivery Model</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('one-time')}
                className={`p-3.5 border rounded-xl text-left transition-all ${
                  type === 'one-time'
                    ? 'border-brand bg-brand-subtle text-brand-text ring-2 ring-brand/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">One Time Project</span>
                  <span className="text-[10px] px-2 py-0.5 bg-brand-light text-brand-text rounded-full font-bold">Fixed Scope</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Websites, native apps, branding systems, and sprint releases with fixed target dates.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setType('recurring')}
                className={`p-3.5 border rounded-xl text-left transition-all ${
                  type === 'recurring'
                    ? 'border-cyan-500 bg-cyan-50/60 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200 ring-2 ring-cyan-400/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                    Recurring Project
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 rounded-full font-bold">Continuous Retainer</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Social media management, monthly SEO audits, marketing campaigns, and monthly reports.
                </p>
              </button>
            </div>
          </div>

          {/* Project Name, Accent Color & Category */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lagos Port Telemetry Integration"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Mobile App"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-brand text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Project Accent Color Picker */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Project Color:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-[11px] font-mono font-semibold text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Quick Swatches */}
              <div className="flex items-center gap-1.5">
                {['#2563EB', '#059669', '#D97706', '#9333EA', '#E11D48', '#0891B2', '#4F46E5', '#475569'].map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setColor(hex)}
                    style={{ backgroundColor: hex }}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      color.toLowerCase() === hex.toLowerCase() ? 'scale-125 ring-2 ring-brand ring-offset-1' : 'hover:scale-110'
                    }`}
                    title={hex}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Client & Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Client / Organization</label>
              <select
                value={client}
                onChange={(e) => {
                  setClient(e.target.value);
                  if (e.target.value.includes('FreshPod')) setBrand('FreshPod');
                  else if (e.target.value.includes('Lagos')) setBrand('Lagos');
                  else setBrand('PMV');
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand"
              >
                <option value="PMV Global Group">PMV Global Group</option>
                <option value="FreshPod Brands">FreshPod Brands</option>
                <option value="Lagos Logistics">Lagos Logistics</option>
                <option value="Aura FinTech">Aura FinTech</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Brand Tag / Code Prefix</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          {/* Owner & Manager */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Project Owner (Accountable)</label>
              <select
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Tech Lead / Manager</label>
              <select
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates & Budget */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target / End Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {type === 'recurring' ? 'Monthly Retainer' : 'Total Budget'}
              </label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="$45,000"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Additional Recurring Project Configuration Fields */}
          {type === 'recurring' && (
            <div className="p-4 bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-900 dark:text-cyan-200 text-xs flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
                  Recurring Automation Schedule
                </span>
                <span className="text-[10px] font-semibold text-cyan-700 dark:text-cyan-300 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                  Auto-generation preview active
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-cyan-900 dark:text-cyan-200 mb-1">Frequency</label>
                  <select
                    value={recurrenceFrequency}
                    onChange={(e) => setRecurrenceFrequency(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-cyan-300 dark:border-cyan-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="Weekly">Weekly Cycle</option>
                    <option value="Bi-Weekly">Bi-Weekly Cycle</option>
                    <option value="Monthly">Monthly Retainer</option>
                    <option value="Quarterly">Quarterly Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-cyan-900 dark:text-cyan-200 mb-1">Monthly Cutoff Day</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={monthlyDay}
                    onChange={(e) => setMonthlyDay(parseInt(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-cyan-300 dark:border-cyan-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-cyan-900 dark:text-cyan-200 mb-1">Contract End Condition</label>
                  <select
                    value={endCondition}
                    onChange={(e) => setEndCondition(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-cyan-300 dark:border-cyan-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="Annual Contract (12 cycles)">Annual Contract (12 cycles)</option>
                    <option value="6-Month Retainer">6-Month Retainer</option>
                    <option value="Ongoing Rolling Monthly">Ongoing Rolling Monthly</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-white/90 dark:bg-slate-900/90 border border-cyan-200 dark:border-cyan-800 rounded-xl text-[11px] text-cyan-800 dark:text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>
                  Every month on the <strong>{monthlyDay}th</strong>, PulsePM will automatically duplicate the active deliverable checklist and dispatch sprint notifications.
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Project Mandate Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline project KPIs, key deliverables, and target objectives..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand hover:bg-brand-hover active:bg-brand-hover text-white font-semibold rounded-md shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project Mandate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
