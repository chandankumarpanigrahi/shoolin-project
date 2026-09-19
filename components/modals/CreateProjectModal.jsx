import React, { useState, useEffect } from 'react';
import { X, Plus, FolderGit2, Calendar, RefreshCw, Layers, Sparkles, UserPlus, Check } from 'lucide-react';
import { UserAvatar, resolveUserObject } from '@/components/common/UserAvatar';
import { useAppContext } from '@/components/providers/AppProvider';

export function CreateProjectModal({
  isOpen,
  onClose,
  users = [],
  onCreateProject,
  onUpdateProject,
  projectToEdit = null,
  initialTemplate = null
}) {
  let currentUser = null;
  try {
    const ctx = useAppContext();
    if (ctx && ctx.currentUser) currentUser = ctx.currentUser;
  } catch (e) {}

  const [name, setName] = useState('');
  const [type, setType] = useState('one-time');
  const [client, setClient] = useState('PMV Global Group');
  const [brand, setBrand] = useState('PMV');
  const [category, setCategory] = useState('Website Development');
  const [owner, setOwner] = useState('');
  const [manager, setManager] = useState('');
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [priority, setPriority] = useState('High');
  const [status, setStatus] = useState('In Progress');
  const [startDate, setStartDate] = useState('2026-09-15');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#2563EB');

  // Recurring fields
  const [recurrenceFrequency, setRecurrenceFrequency] = useState('Monthly');
  const [monthlyDay, setMonthlyDay] = useState(5);
  const [startMonth, setStartMonth] = useState('October 2026');
  const [endCondition, setEndCondition] = useState('Annual Contract (12 cycles)');

  const lastInitializedKeyRef = React.useRef(null);

  const resolveUserKey = (val, userList) => {
    if (!val) return null;
    const userObj = resolveUserObject(val, userList || users);
    return userObj ? (userObj.id || userObj._id) : null;
  };

  // Resolve all raw IDs/strings to canonical user IDs, dropping any that don't map to a known user
  const deduplicateTeam = (rawList) => {
    const seen = new Set();
    const result = [];
    for (const entry of (rawList || [])) {
      const canonicalId = resolveUserKey(entry, users);
      if (canonicalId && !seen.has(canonicalId)) {
        seen.add(canonicalId);
        result.push(canonicalId);
      }
    }
    return result;
  };

  useEffect(() => {
    if (!isOpen) {
      lastInitializedKeyRef.current = null;
      return;
    }

    const currentKey = projectToEdit
      ? (projectToEdit.id || projectToEdit._id)
      : initialTemplate
      ? `template-${initialTemplate.id}`
      : 'new';

    // Prevent re-initialization from wiping in-progress user edits while modal is open
    if (lastInitializedKeyRef.current === currentKey) {
      return;
    }
    lastInitializedKeyRef.current = currentKey;

    const creatorId = resolveUserKey(currentUser, users) || users[0]?.id || users[0]?._id;

    if (projectToEdit) {
      setName(projectToEdit.name || '');
      setType(projectToEdit.type || 'one-time');
      setClient(projectToEdit.client || 'PMV Global Group');
      setBrand(projectToEdit.brand || 'PMV');
      setCategory(projectToEdit.category || 'General');

      const rawOwner = projectToEdit.owner || projectToEdit.ownerId || creatorId;
      const rawManager = projectToEdit.manager || projectToEdit.managerId || creatorId;
      const oId = resolveUserKey(rawOwner, users) || creatorId;
      const mId = resolveUserKey(rawManager, users) || creatorId;

      setOwner(oId);
      setManager(mId);

      const rawTeam = (projectToEdit.teamIds && projectToEdit.teamIds.length > 0)
        ? projectToEdit.teamIds
        : (projectToEdit.team || []);

      // Resolve existing members against dynamic users
      const resolvedExisting = deduplicateTeam(rawTeam.length > 0 ? rawTeam : [oId, mId]);
      setSelectedTeam(resolvedExisting);

      setPriority(projectToEdit.priority || 'High');
      setStatus(projectToEdit.status || 'In Progress');
      setStartDate(projectToEdit.startDate || '2026-09-15');
      setDescription(projectToEdit.description || '');
      setColor(projectToEdit.color || '#2563EB');
      if (projectToEdit.type === 'recurring' && projectToEdit.recurringConfig) {
        setRecurrenceFrequency(projectToEdit.recurringConfig.frequency || 'Monthly');
        setMonthlyDay(projectToEdit.recurringConfig.monthlyDay || 5);
        setStartMonth(projectToEdit.recurringConfig.startMonth || 'October 2026');
        setEndCondition(projectToEdit.recurringConfig.endCondition || 'Annual Contract (12 cycles)');
      }
    } else if (initialTemplate) {
      const oId = creatorId;
      const mId = users[1] ? (users[1].id || users[1]._id) : creatorId;
      setName(`${initialTemplate.name} - Batch 1`);
      setType(initialTemplate.type || 'one-time');
      setClient('PMV Global Group');
      setBrand('PMV');
      setCategory(initialTemplate.category || 'Website Development');
      setOwner(oId);
      setManager(mId);
      setSelectedTeam(deduplicateTeam([creatorId, oId, mId]));
      setPriority('High');
      setStatus('In Progress');
      setStartDate('2026-09-15');
      setDescription(initialTemplate.description || '');
      setColor('#2563EB');
    } else {
      const oId = creatorId;
      const mId = users[1] ? (users[1].id || users[1]._id) : creatorId;
      setName('');
      setType('one-time');
      setClient('PMV Global Group');
      setBrand('PMV');
      setCategory('Website Development');
      setOwner(oId);
      setManager(mId);
      setSelectedTeam(deduplicateTeam([creatorId]));
      setPriority('High');
      setStatus('In Progress');
      setStartDate('2026-09-15');
      setDescription('');
      setColor('#2563EB');
    }
  }, [isOpen, projectToEdit?.id || projectToEdit?._id, initialTemplate?.id, users]);

  const handleToggleTeamMember = (userKey) => {
    if (!userKey) return;
    const targetCanonical = resolveUserKey(userKey, users);
    if (!targetCanonical) return;

    const isPresent = selectedTeam.some(item => resolveUserKey(item, users) === targetCanonical);

    if (isPresent) {
      setSelectedTeam(prev => deduplicateTeam(prev.filter(item => resolveUserKey(item, users) !== targetCanonical)));
    } else {
      setSelectedTeam(prev => deduplicateTeam([...prev, targetCanonical]));
    }
  };

  const handleOwnerChange = (newOwner) => {
    const canonicalOwner = resolveUserKey(newOwner, users) || newOwner;
    setOwner(canonicalOwner);
    if (canonicalOwner) {
      setSelectedTeam((prev) => deduplicateTeam([...prev, canonicalOwner]));
    }
  };

  const handleManagerChange = (newManager) => {
    const canonicalManager = resolveUserKey(newManager, users) || newManager;
    setManager(canonicalManager);
    if (canonicalManager) {
      setSelectedTeam((prev) => deduplicateTeam([...prev, canonicalManager]));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const creatorId = resolveUserKey(currentUser, users) || users[0]?.id || users[0]?._id;
    const ownerId = resolveUserKey(owner, users) || creatorId;
    const managerId = resolveUserKey(manager, users) || creatorId;

    const resolvedSelected = deduplicateTeam(selectedTeam);
    const finalTeam = !projectToEdit
      ? Array.from(new Set([creatorId, ownerId, managerId, ...resolvedSelected])).filter(Boolean)
      : (resolvedSelected.length > 0 ? resolvedSelected : [ownerId, managerId]);

    const payload = {
      name: name.trim(),
      type,
      client,
      brand,
      category,
      ownerId,
      owner: ownerId,
      managerId,
      manager: managerId,
      teamIds: finalTeam,
      team: finalTeam,
      priority,
      status,
      startDate,
      description: description.trim() || 'No extended description provided.',
      color,
      ...(type === 'recurring' ? {
        recurringConfig: {
          frequency: recurrenceFrequency,
          monthlyDay: Number(monthlyDay) || 5,
          startMonth,
          endCondition
        }
      } : {})
    };

    if (projectToEdit) {
      const targetId = projectToEdit.id || projectToEdit._id;
      if (onUpdateProject) {
        onUpdateProject(targetId, payload);
      }
    } else {
      if (onCreateProject) {
        onCreateProject(payload);
      }
    }
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
                {projectToEdit
                  ? `Edit Project: ${projectToEdit.name}`
                  : initialTemplate
                  ? `Create Project from Template: ${initialTemplate.name}`
                  : "Create New Project Mandate"}
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
                className={`p-3.5 border rounded-xl text-left transition-all ${type === 'one-time'
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
                className={`p-3.5 border rounded-xl text-left transition-all ${type === 'recurring'
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
                    className={`w-4 h-4 rounded-full transition-transform ${color.toLowerCase() === hex.toLowerCase() ? 'scale-125 ring-2 ring-brand ring-offset-1' : 'hover:scale-110'
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
                onChange={(e) => handleOwnerChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand"
              >
                {users.map(u => (
                  <option key={u.id || u._id} value={u.id || u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Tech Lead / Manager</label>
              <select
                value={manager}
                onChange={(e) => handleManagerChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand"
              >
                {users.map(u => (
                  <option key={u.id || u._id} value={u.id || u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assigned Team Members & Squad */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Assigned Team Members &amp; Squad (Project Access List)
            </label>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl space-y-2">
              <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                {(() => {
                  // Resolve & deduplicate — same user under different ID formats shows only once
                  const seen = new Set();
                  const dedupedMembers = [];
                  for (const userId of selectedTeam) {
                    const u = resolveUserObject(userId, users);
                    if (!u) continue;
                    const canonicalId = String(u.id || u._id || u.email || u.name).toLowerCase();
                    if (!seen.has(canonicalId)) {
                      seen.add(canonicalId);
                      dedupedMembers.push({ raw: userId, user: u, canonicalId: u.id || u._id });
                    }
                  }
                  return dedupedMembers.map(({ user: u, canonicalId }) => (
                    <span
                      key={canonicalId}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs"
                    >
                      <UserAvatar user={u} size="xs" />
                      <span>{u.name}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleTeamMember(canonicalId)}
                        className="hover:text-rose-500 rounded-full p-0.5 transition-colors ml-0.5"
                        title="Remove member from project team"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ));
                })()}
              </div>

              {/* Add / Remove Checkbox Selector */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                  Select squad members to grant project visibility:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto">
                  {users.map((u) => {
                    const uId = u.id || u._id;
                    const uName = u.name;
                    const isSelected = selectedTeam.some((item) => {
                      const itemCanonical = resolveUserKey(item, users);
                      return itemCanonical === uId || item === uId || item === uName || String(item).toLowerCase() === String(uId).toLowerCase();
                    });

                    return (
                      <label
                        key={uId}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${isSelected
                            ? 'bg-brand-light/30 border-brand/40 text-brand font-semibold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleTeamMember(uId)}
                          className="rounded border-slate-300 text-brand focus:ring-brand"
                        />
                        <UserAvatar user={u} size="xs" />
                        <span className="truncate">{u.name.split(' ')[0]}</span>
                      </label>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
            />
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
              {projectToEdit ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{projectToEdit ? "Save Project Changes" : "Create Project Mandate"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
