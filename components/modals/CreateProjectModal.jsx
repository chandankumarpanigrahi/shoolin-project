import React, { useState, useEffect } from 'react';
import { X, Plus, FolderGit2, RefreshCw, Layers, Sparkles, UserPlus, Check } from 'lucide-react';
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
  let masterBrands = [];
  let masterCategories = [];
  try {
    const ctx = useAppContext();
    if (ctx) {
      if (ctx.currentUser) currentUser = ctx.currentUser;
      if (ctx.masterBrands && ctx.masterBrands.length > 0) masterBrands = ctx.masterBrands;
      if (ctx.blueprintCategories && ctx.blueprintCategories.length > 0) masterCategories = ctx.blueprintCategories;
    }
  } catch (e) { }

  const availableProjects = masterBrands.length > 0 ? masterBrands : [
    { id: 'br-1', code: 'TCC', name: 'Captains Cafe', color: '#572700' },
    { id: 'br-2', code: 'INT', name: 'Internal', color: '#516506' },
    { id: 'br-3', code: 'PMV', name: 'PMV Maritime Solutions', color: '#ad1d41' },
  ];

  const availableCategories = masterCategories.length > 0
    ? masterCategories.map((c) => c.name)
    : ['Website Development', 'Mobile App', 'Branding & UI System', 'SEO & Digital Marketing', 'Cloud Infrastructure', 'Custom Software'];

  const [name, setName] = useState('');
  const [type, setType] = useState('one-time');
  const [selectedMasterProject, setSelectedMasterProject] = useState(availableProjects[0]?.name || 'PMV Maritime');
  const [brand, setBrand] = useState(availableProjects[0]?.code || 'PMV');
  const [category, setCategory] = useState(availableCategories[0] || 'Website Development');
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [owner, setOwner] = useState('');
  const [manager, setManager] = useState('');
  const [priority, setPriority] = useState('High');

  const [status, setStatus] = useState('In Progress');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(availableProjects[0]?.color || '#2563EB');

  const handleProjectSelect = (projectName) => {
    setSelectedMasterProject(projectName);
    const match = availableProjects.find((p) => p.name === projectName || p.code === projectName);
    if (match) {
      setBrand(match.code || 'PMV');
      if (match.color) setColor(match.color);
    }
  };

  const defaultStartIso = new Date().toISOString().split('T')[0];
  const defaultEndIso = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStartIso);
  const [endDate, setEndDate] = useState(defaultEndIso);

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
        const userObj = resolveUserObject(canonicalId, users);
        if (userObj && userObj.role === 'Super Admin') continue;
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
      const projMatch = availableProjects.find((p) => p.name === projectToEdit.client || p.code === projectToEdit.brand || p.name === projectToEdit.name) || availableProjects[0];
      setSelectedMasterProject(projectToEdit.client || projMatch?.name || 'PMV Maritime');
      setBrand(projectToEdit.brand || projMatch?.code || 'PMV');
      setCategory(projectToEdit.category || availableCategories[0] || 'Website Development');

      const rawTeam = (projectToEdit.teamIds && projectToEdit.teamIds.length > 0)
        ? projectToEdit.teamIds
        : (projectToEdit.team || []);

      const resolvedExisting = deduplicateTeam(rawTeam);
      setSelectedTeam(resolvedExisting);

      const targetOwner = resolveUserKey(projectToEdit.ownerId || projectToEdit.owner, users) || creatorId;
      const targetManager = resolveUserKey(projectToEdit.managerId || projectToEdit.manager, users) || creatorId;
      setOwner(targetOwner);
      setManager(targetManager);

      setPriority(projectToEdit.priority || 'High');
      setStatus(projectToEdit.status || 'In Progress');
      setDescription(projectToEdit.description || '');
      setColor(projectToEdit.color || projMatch?.color || '#2563EB');
      setStartDate(projectToEdit.startDate || defaultStartIso);
      setEndDate(projectToEdit.endDate || projectToEdit.targetDate || defaultEndIso);
      if (projectToEdit.type === 'recurring' && projectToEdit.recurringConfig) {
        setRecurrenceFrequency(projectToEdit.recurringConfig.frequency || 'Monthly');
        setMonthlyDay(projectToEdit.recurringConfig.monthlyDay || 5);
        setStartMonth(projectToEdit.recurringConfig.startMonth || 'October 2026');
        setEndCondition(projectToEdit.recurringConfig.endCondition || 'Annual Contract (12 cycles)');
      }
    } else if (initialTemplate) {
      setName(`${initialTemplate.name} - Batch 1`);
      setType(initialTemplate.type || 'one-time');
      const defaultProj = availableProjects[0];
      setSelectedMasterProject(defaultProj?.name || 'PMV Maritime');
      setBrand(defaultProj?.code || 'PMV');
      setCategory(initialTemplate.category || availableCategories[0] || 'Website Development');
      setSelectedTeam([creatorId].filter(Boolean));
      setOwner(creatorId);
      setManager(creatorId);
      setPriority('High');
      setStatus('In Progress');
      setStartDate(defaultStartIso);
      setEndDate(defaultEndIso);
      setDescription(initialTemplate.description || '');
      setColor(defaultProj?.color || '#2563EB');
    } else {
      setName('');
      setType('one-time');
      const defaultProj = availableProjects[0];
      setSelectedMasterProject(defaultProj?.name || 'PMV Maritime');
      setBrand(defaultProj?.code || 'PMV');
      setCategory(availableCategories[0] || 'Website Development');
      setSelectedTeam([creatorId].filter(Boolean));
      setOwner(creatorId);
      setManager(creatorId);
      setPriority('High');
      setStatus('In Progress');
      setStartDate(defaultStartIso);
      setEndDate(defaultEndIso);
      setDescription('');
      setColor(defaultProj?.color || '#2563EB');
    }
  }, [isOpen, projectToEdit?.id || projectToEdit?._id, initialTemplate?.id, users]);

  const handleToggleTeamMember = (userKey) => {
    if (!userKey) return;
    const targetCanonical = resolveUserKey(userKey, users) || userKey;
    if (!targetCanonical) return;

    const isPresent = selectedTeam.some(item => {
      const canonical = resolveUserKey(item, users) || item;
      return String(canonical).toLowerCase() === String(targetCanonical).toLowerCase();
    });

    if (isPresent) {
      setSelectedTeam(prev => prev.filter(item => {
        const canonical = resolveUserKey(item, users) || item;
        return String(canonical).toLowerCase() !== String(targetCanonical).toLowerCase();
      }));
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

    const resolvedSelected = deduplicateTeam(selectedTeam);
    const finalTeam = Array.from(new Set([ownerId, ...resolvedSelected])).map((item) => {
      const uObj = resolveUserObject(item, users);
      return uObj ? (uObj.id || uObj._id) : null;
    }).filter(Boolean);

    const payload = {
      name: name.trim(),
      type,
      client: selectedMasterProject,
      brand,
      category,
      ownerId: ownerId,
      owner: ownerId,
      managerId: ownerId,
      manager: ownerId,
      teamIds: finalTeam,
      team: finalTeam,
      priority,
      status,
      startDate: startDate || defaultStartIso,
      endDate: endDate || defaultEndIso,
      targetDate: endDate || defaultEndIso,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-md shadow-xl overflow-hidden max-h-[90vh] flex flex-col my-auto">
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
                  placeholder="The complete project name"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand font-medium"
                >
                  {availableCategories.map((catName) => (
                    <option key={catName} value={catName}>
                      {catName}
                    </option>
                  ))}
                </select>
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
                {['#2563EB', '#452700', '#FF6500', '#9333EA', '#059669', '#D97706', '#E11D48', '#0891B2'].map((hex) => (
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

          {/* Project & Brand Code Prefix */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Project</label>
              <select
                value={selectedMasterProject}
                onChange={(e) => handleProjectSelect(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand font-medium"
              >
                {availableProjects.map((p) => (
                  <option key={p.id || p.code || p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Brand Code / Code Prefix</label>
              <input
                type="text"
                readOnly
                value={brand}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
              />
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
                  if (dedupedMembers.length === 0) {
                    return <span className="text-[11px] text-slate-400 italic">No squad members assigned (Default: None)</span>;
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto">
                  {(users || []).filter((u) => u.role !== 'Super Admin').map((u) => {
                    const uId = u.id || u._id;
                    const uName = u.name || 'Member';
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
                        <span className="truncate">{uName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
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
              {projectToEdit ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{projectToEdit ? "Save Project Changes" : "Create Project Mandate"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
