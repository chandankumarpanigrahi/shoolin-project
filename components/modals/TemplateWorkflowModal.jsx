'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Users,
  Briefcase,
  RefreshCw,
  Sparkles,
  Rocket,
  Check,
  FolderGit2
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProvider';
import { ProjectTypeBadge } from '@/components/common/Badges';
import { UserAvatar } from '@/components/common/UserAvatar';
import { countTreeNodes, getMaxTreeDepth } from '@/data/templates';

export function TemplateWorkflowModal({
  isOpen,
  onClose,
  users = [],
  preselectedTemplate,
  onCreateProjectFromTemplate
}) {
  const { templates = [], masterBrands = [], blueprintCategories = [], currentUser } = useAppContext();
  const activeTemplates = templates && templates.length > 0 ? templates : [];

  // 4 Focused Steps as requested by the user:
  // 1. Select Template (auto-selected when opened from card)
  // 2. Project (Single field: Project Name dropdown from Master > Project)
  // 3. Assign Team (Only assigned members - No Creator, No TL/Manager)
  // 4. Review & Launch (No start or end date - shows Month/Year & next cycle date for recurring + Review & Launch button)
  const [step, setStep] = useState(1);
  const [selectedTmpl, setSelectedTmpl] = useState(null);

  // Available Master Projects from Master > Project (masterBrands in DB)
  const availableProjects = useMemo(() => {
    const list = (masterBrands && masterBrands.length > 0)
      ? masterBrands.filter(b => !b.status || b.status === 'Active')
      : [];
    return list.length > 0 ? list : [
      { id: 'br-1', code: 'PMV', name: 'PMV Maritime Solutions', color: '#ad1d41' },
      { id: 'br-2', code: 'TCC', name: 'Captains Cafe', color: '#572700' },
      { id: 'br-3', code: 'INT', name: 'Internal', color: '#516506' }
    ];
  }, [masterBrands]);

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [assignedMemberIds, setAssignedMemberIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter and resolve ONLY valid, existing directory users (drops any undefined/blank IDs)
  const assignedUsers = useMemo(() => {
    if (!Array.isArray(assignedMemberIds) || !Array.isArray(users)) return [];
    return assignedMemberIds
      .map((uid) => users.find((usr) => (usr.id && usr.id === uid) || (usr._id && usr._id === uid)))
      .filter(Boolean);
  }, [assignedMemberIds, users]);

  // Sync state whenever modal opens or preselectedTemplate changes
  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setIsSubmitting(false);

    const tmplToSelect = preselectedTemplate || activeTemplates[0] || null;
    setSelectedTmpl(tmplToSelect);

    if (availableProjects.length > 0) {
      setSelectedProjectId(availableProjects[0].id || availableProjects[0]._id || availableProjects[0].code);
    }

    // Default assigned team to currentUser ONLY if they exist in directory users, else first directory user
    const matchedCurrentUser = (users || []).find(
      (u) =>
        (currentUser?.id && (u.id === currentUser.id || u._id === currentUser.id)) ||
        (currentUser?._id && (u.id === currentUser._id || u._id === currentUser._id)) ||
        (currentUser?.email && u.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
    );

    if (matchedCurrentUser) {
      const validId = matchedCurrentUser.id || matchedCurrentUser._id;
      setAssignedMemberIds([validId]);
    } else if (users && users.length > 0) {
      const validId = users[0].id || users[0]._id;
      setAssignedMemberIds(validId ? [validId] : []);
    } else {
      setAssignedMemberIds([]);
    }
  }, [isOpen, preselectedTemplate, activeTemplates, availableProjects, currentUser, users]);

  if (!isOpen) return null;

  const currentTemplate = selectedTmpl || preselectedTemplate || activeTemplates[0] || {};
  const isRecurring = currentTemplate.type === 'recurring';

  const selectedProjectObj =
    availableProjects.find((p) => (p.id && p.id === selectedProjectId) || (p._id && p._id === selectedProjectId) || p.code === selectedProjectId || p.name === selectedProjectId) ||
    availableProjects[0] ||
    { name: 'PMV Maritime Solutions', code: 'PMV', color: '#2563EB' };

  // Date and Cycle Calculations for Recurring
  const now = new Date();
  const currentMonthYear = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const dayMatch = currentTemplate?.recurringDay ? String(currentTemplate.recurringDay).match(/\d+/) : null;
  const recurringDayNum = dayMatch ? parseInt(dayMatch[0], 10) : 1;

  // Next cycle date: e.g. 1st of next month
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, recurringDayNum);
  const nextCycleDateIso = nextMonthDate.toISOString().split('T')[0];
  const nextCycleDisplay = nextMonthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Project title formatted per user's choice: "[Project Name] - [Template Name]" (+ Month/Year for recurring)
  const generatedProjectName = `${selectedProjectObj.name} - ${currentTemplate.name || 'Sprint'}${isRecurring ? ` (${currentMonthYear})` : ''}`;

  const deliverablesCount =
    currentTemplate.tasksTree && currentTemplate.tasksTree.length > 0
      ? countTreeNodes(currentTemplate.tasksTree)
      : (currentTemplate.tasksCount || currentTemplate.tasksPreview?.length || 8);

  const toggleMember = (uid) => {
    if (!uid) return;
    setAssignedMemberIds((prev) => {
      const validPrev = prev.filter((id) => users.some((u) => (u.id && u.id === id) || (u._id && u._id === id)));
      if (validPrev.includes(uid)) {
        return validPrev.filter((id) => id !== uid);
      } else {
        return [...validPrev, uid];
      }
    });
  };

  const selectAllMembers = () => {
    const allIds = (users || []).map((u) => u.id || u._id).filter(Boolean);
    setAssignedMemberIds(allIds);
  };

  const clearAllMembers = () => {
    setAssignedMemberIds([]);
  };

  const handleLaunch = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const codePrefix = (selectedProjectObj.code || 'PRJ').toUpperCase().slice(0, 4);
      const finalTeamIds = assignedUsers.map((u) => u.id || u._id);
      const primaryLeadId = finalTeamIds[0] || (users[0]?.id || users[0]?._id) || 'admin-1';

      const projPayload = {
        id: 'proj-' + Date.now(),
        code: `${codePrefix}-${Math.floor(100 + Math.random() * 900)}`,
        name: generatedProjectName,
        client: selectedProjectObj.name,
        brand: selectedProjectObj.code || 'PRJ',
        color: selectedProjectObj.color || '#2563EB',
        type: currentTemplate.type || 'one-time',
        category: currentTemplate.category || 'Web Development',
        owner: primaryLeadId,
        ownerId: primaryLeadId,
        manager: primaryLeadId,
        managerId: primaryLeadId,
        team: finalTeamIds,
        teamIds: finalTeamIds,
        progress: 0,
        status: 'In Progress',
        priority: 'High',
        description: currentTemplate.description || `Sprint instantiated from template: ${currentTemplate.name}`,
        templateId: currentTemplate.id || currentTemplate._id,
        templateName: currentTemplate.name,
        tasksCount: deliverablesCount,
        completedTasksCount: 0,
        ...(isRecurring && {
          recurringConfig: {
            frequency: 'Monthly',
            monthlyDay: recurringDayNum,
            currentCycle: currentMonthYear,
            nextCycleDate: nextCycleDateIso,
            autoRenew: true,
            templateId: currentTemplate.id || currentTemplate._id,
            templateName: currentTemplate.name,
            masterProjectName: selectedProjectObj.name,
            brand: selectedProjectObj.code || 'PRJ',
            client: selectedProjectObj.name,
            assignedMemberIds: finalTeamIds,
          }
        })
      };

      if (onCreateProjectFromTemplate) {
        await onCreateProjectFromTemplate(projPayload, currentTemplate);
      }
      onClose();
    } catch (e) {
      console.error('Launch failed:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    'Select Template',
    'Project',
    'Assign Team',
    'Review & Launch'
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl overflow-hidden text-xs flex flex-col max-h-[92vh] my-auto">
        {/* Header with 4-Step Tracker */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-brand text-white flex items-center justify-center shadow-xs font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Instantiate Project from Template
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Step {step} of 4 · {stepsList[step - 1]}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {stepsList.map((label, idx) => {
              const stepNum = idx + 1;
              const isCurrent = step === stepNum;
              const isDone = step > stepNum;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-full h-1.5 rounded-full transition-all ${
                      isDone
                        ? 'bg-brand'
                        : isCurrent
                        ? 'bg-brand-hover ring-2 ring-brand/20'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                  <span
                    className={`text-[10px] mt-1.5 text-center truncate max-w-full ${
                      isCurrent
                        ? 'font-bold text-brand dark:text-white'
                        : isDone
                        ? 'text-slate-700 dark:text-slate-300 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    {stepNum}. {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* ========================================================================= */}
          {/* STEP 1: SELECT TEMPLATE (Auto-selected if opened from card) */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Step 1: Architecture Template
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select a sprint template to instantiate into your project workflow
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-brand px-2 py-0.5 bg-brand-subtle rounded-md border border-brand-border">
                  {activeTemplates.length} templates available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {activeTemplates.map((t) => {
                  const isSelected = (currentTemplate.id && currentTemplate.id === t.id) ||
                    (currentTemplate._id && currentTemplate._id === t._id) ||
                    currentTemplate.name === t.name;

                  const catObj = (blueprintCategories || []).find((c) => c.name === t.category);
                  const catHex = catObj?.color || '#2563EB';
                  const taskCount = t.tasksTree && t.tasksTree.length > 0
                    ? countTreeNodes(t.tasksTree)
                    : (t.tasksCount || t.tasksPreview?.length || 8);

                  return (
                    <div
                      key={t.id || t._id}
                      onClick={() => setSelectedTmpl(t)}
                      className={`p-3.5 border rounded-lg cursor-pointer transition-all flex flex-col justify-between text-left relative ${
                        isSelected
                          ? 'border-brand bg-brand-subtle/40 dark:bg-brand/10 ring-2 ring-brand/30 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <ProjectTypeBadge type={t.type} size="xs" />
                            {t.category && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                                style={{
                                  backgroundColor: `${catHex}15`,
                                  color: catHex,
                                  borderColor: `${catHex}40`
                                }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catHex }} />
                                <span>{t.category}</span>
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        <div>
                          <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            {t.name}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {t.description || 'Standard multi-level hierarchical architecture sprint template.'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span className="font-mono">{taskCount} Deliverables</span>
                        {t.type === 'recurring' ? (
                          <span className="text-cyan-700 dark:text-cyan-400 font-semibold">
                            Auto Re-Add: {t.recurringDay || '1st of every month'}
                          </span>
                        ) : (
                          <span>One-Time Sprint</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: PROJECT (Single Dropdown from Master > Project) */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Step 2: Project Selection
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select the target project mandate managed in Master &gt; Project
                </p>
              </div>

              {/* Selected Template Badge Banner */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-brand text-white flex items-center justify-center font-bold shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Selected Template</span>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">{currentTemplate.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-slate-700 dark:text-slate-300">
                    {deliverablesCount} Deliverables
                  </span>
                  <ProjectTypeBadge type={currentTemplate.type} size="xs" />
                </div>
              </div>

              {/* Project Name Dropdown - The single field requested */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                  >
                    {availableProjects.map((p) => (
                      <option key={p.id || p._id || p.code} value={p.id || p._id || p.code}>
                        [{p.code}] {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Projects are populated dynamically from Master &gt; Project.
                </p>
              </div>

              {/* Selected Master Project Preview Card */}
              <div className="p-3.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 font-mono font-bold text-white rounded text-[11px] shadow-2xs"
                      style={{ backgroundColor: selectedProjectObj.color || '#2563EB' }}
                    >
                      [{selectedProjectObj.code}]
                    </span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {selectedProjectObj.name}
                    </strong>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Master Project Active
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>Resulting Sprint Title:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs text-right">
                    {generatedProjectName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: ASSIGN TEAM (Only Assigned Members - No Creator, No TL/Manager) */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Step 3: Assign Team Members
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Assign members who will collaborate on this project and its deliverables
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={selectAllMembers}
                    className="px-2 py-1 text-[11px] font-semibold text-brand hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={clearAllMembers}
                    className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Members Selection List */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Directory Users ({users.length})
                  </span>
                  <span className="text-[11px] font-bold text-brand bg-brand-subtle px-2 py-0.5 rounded-sm border border-brand-border">
                    {assignedUsers.length} assigned
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                  {users.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      No users found in directory
                    </div>
                  ) : (
                    users.map((u) => {
                      const uid = u.id || u._id;
                      const isChecked = assignedMemberIds.includes(uid);
                      return (
                        <label
                          key={uid}
                          className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-brand-subtle/30 dark:bg-brand/10'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleMember(uid)}
                              className="rounded text-brand focus:ring-brand w-3.5 h-3.5 border-slate-300 dark:border-slate-700 cursor-pointer"
                            />
                            <UserAvatar user={u} size="xs" />
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-slate-100 block text-xs">
                                {u.name}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                                {u.email || u.department || 'Team Member'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                              {u.role || 'Member'}
                            </span>
                            {isChecked && (
                              <span className="text-[10px] font-bold text-brand dark:text-white">
                                Assigned
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {assignedUsers.length === 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  ⚠️ Please select at least one assigned team member to proceed.
                </p>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: REVIEW & LAUNCH (No start/end date - Month/Year & next cycle date) */}
          {/* ========================================================================= */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Step 4: Review Configuration &amp; Launch
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Confirm the architecture sprint configuration before syncing deliverables to MongoDB
                </p>
              </div>

              {/* Main Review Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 shadow-sm space-y-3.5">
                {/* Title and Badge */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {generatedProjectName}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="px-2 py-0.2 font-mono font-bold text-white rounded text-[10px]"
                        style={{ backgroundColor: selectedProjectObj.color || '#2563EB' }}
                      >
                        [{selectedProjectObj.code}]
                      </span>
                      <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                        {selectedProjectObj.name}
                      </span>
                    </div>
                  </div>
                  <ProjectTypeBadge type={currentTemplate.type} size="sm" />
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Template</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-semibold">{currentTemplate.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Category</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-semibold">{currentTemplate.category || 'General'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Deliverables</span>
                    <strong className="text-brand font-bold font-mono">{deliverablesCount} Deliverables</strong>
                  </div>
                </div>

                {/* Recurring Cadence Banner (Month/Year & Next Cycle Date) */}
                {isRecurring ? (
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-cyan-950 dark:text-cyan-200 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        Monthly Recurring Retainer
                      </span>
                      <span className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-700">
                        {currentMonthYear}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-cyan-700 dark:text-cyan-400 block">Current Cycle Period:</span>
                        <strong className="text-cyan-900 dark:text-cyan-100 font-semibold">{currentMonthYear}</strong>
                      </div>
                      <div>
                        <span className="text-cyan-700 dark:text-cyan-400 block">Next Automated Cycle Date:</span>
                        <strong className="text-cyan-900 dark:text-cyan-100 font-semibold">{nextCycleDisplay}</strong>
                      </div>
                    </div>

                    <p className="text-[10px] text-cyan-800/90 dark:text-cyan-300/80 pt-1 border-t border-cyan-200/60 dark:border-cyan-800/60 leading-relaxed">
                      💡 On <strong>{nextCycleDisplay}</strong>, a fresh template cycle with the same project and assigned members will automatically be created directly from the latest template definition. Auto-renewal can be paused or stopped anytime by Creator or Admin.
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Sprint Delivery Mandate:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">One-Time Fixed Delivery Architecture</strong>
                  </div>
                )}

                {/* Assigned Members Summary (Only verified, existing directory users) */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Assigned Team Members ({assignedUsers.length}):
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {assignedUsers.map((u) => {
                      const uid = u.id || u._id;
                      return (
                        <div
                          key={uid}
                          className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-sm text-xs font-semibold text-slate-800 dark:text-slate-200"
                        >
                          <UserAvatar user={u} size="xs" />
                          <span>{u.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setStep(step - 1)}
              className="px-3.5 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              disabled={(step === 3 && assignedUsers.length === 0) || isSubmitting}
              onClick={() => setStep(step + 1)}
              className="px-4 py-1.5 bg-brand hover:bg-brand-hover text-white font-semibold rounded-md shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || assignedUsers.length === 0}
              onClick={handleLaunch}
              className="px-4 py-1.5 bg-brand hover:bg-brand-hover active:bg-brand-hover text-white font-semibold rounded-md shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Syncing to Database...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>Review &amp; Launch Sprint</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
