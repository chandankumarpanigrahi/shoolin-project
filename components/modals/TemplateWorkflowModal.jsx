'use client';

import React, { useState } from 'react';
import {
  X,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  User,
  Users,
  Building,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProvider';
import { ProjectTypeBadge } from '@/components/common/Badges';

export function TemplateWorkflowModal({
  isOpen,
  onClose,
  users,
  preselectedTemplate,
  onCreateProjectFromTemplate
}) {
  const { templates } = useAppContext();
  const activeTemplates = templates && templates.length > 0 ? templates : [];

  const [step, setStep] = useState(preselectedTemplate ? 2 : 1);
  const [selectedTmpl, setSelectedTmpl] = useState(preselectedTemplate || activeTemplates[0]);

  // Project Fields
  const [projectName, setProjectName] = useState(
    preselectedTemplate ? `${preselectedTemplate.name} Sprint` : "Enterprise Web Rebuild"
  );
  const [client, setClient] = useState("PMV Global Group");
  const [brand, setBrand] = useState("PMV");
  const [owner, setOwner] = useState(users[0]?.id || users[0]?._id || '');
  const [manager, setManager] = useState(users[1]?.id || users[0]?.id || '');
  const [team, setTeam] = useState(users.slice(0, 2).map((u) => u.id || u._id));
  const [startDate, setStartDate] = useState("2026-09-15");
  const [targetDate, setTargetDate] = useState("2026-11-30");
  const [recurringDay, setRecurringDay] = useState(5);

  if (!isOpen) return null;

  const currentTemplate = selectedTmpl || activeTemplates[0] || {};

  const handleTemplateSelect = (tmpl) => {
    setSelectedTmpl(tmpl);
    setProjectName(`${tmpl.name} Sprint`);
    setStep(2);
  };

  const toggleTeamMember = (uid) => {
    if (team.includes(uid)) setTeam(team.filter(id => id !== uid));
    else setTeam([...team, uid]);
  };

  const handleFinish = () => {
    const newProj = {
      id: "proj-" + Date.now(),
      code: `${brand.slice(0, 3).toUpperCase()}-${Math.floor(200 + Math.random() * 800)}`,
      name: projectName,
      client,
      brand,
      type: currentTemplate.type || 'one-time',
      category: currentTemplate.category || 'Website Development',
      owner,
      manager,
      team: [owner, manager, ...team],
      progress: 0,
      status: "In Progress",
      priority: "High",
      startDate,
      targetDate,
      description: currentTemplate.description || 'Sprint instantiated from template.',
      budget: currentTemplate.type === 'recurring' ? "$6,500/mo" : "$45,000",
      tasksCount: currentTemplate.tasksCount || 15,
      completedTasksCount: 0,
      ...(currentTemplate.type === 'recurring' && {
        recurringConfig: {
          frequency: "Monthly",
          monthlyDay: recurringDay,
          startMonth: "October 2026",
          endCondition: "Annual Contract",
          deliverablesPerCycle: currentTemplate.tasksCount || 12,
          nextCycleDate: `2026-10-0${recurringDay}`
        }
      })
    };

    onCreateProjectFromTemplate(newProj, currentTemplate);
    onClose();
  };

  const stepsList = [
    "Select Template",
    "Project Info",
    "Assign Team",
    "Dates & Cadence",
    "Review Structure",
    "Launch Sprint"
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl overflow-hidden text-xs flex flex-col max-h-[90vh]">
        {/* Header with Step Tracker */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/70 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-sm font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Instantiate Project from Template
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Step {step} of 6 · {stepsList[step - 1]}
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

          {/* Stepper Progress Indicator */}
          <div className="flex items-center justify-between gap-1.5 pt-1">
            {stepsList.map((label, idx) => {
              const stepNum = idx + 1;
              const isCurrent = step === stepNum;
              const isDone = step > stepNum;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full h-1.5 rounded-full transition-all ${
                      isDone ? 'bg-indigo-600 dark:bg-indigo-500' : isCurrent ? 'bg-indigo-400' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                  <span className={`text-[10px] mt-1.5 text-center truncate max-w-[85px] ${
                    isCurrent ? 'font-bold text-indigo-600 dark:text-indigo-400' : isDone ? 'text-slate-700 dark:text-slate-300 font-semibold' : 'text-slate-400'
                  }`}>
                    {stepNum}. {label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Step Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* STEP 1: SELECT TEMPLATE */}
          {step === 1 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Step 1: Choose an Architecture Template
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeTemplates.map(t => (
                  <div
                    key={t.id}
                    onClick={() => handleTemplateSelect(t)}
                    className={`p-4 border rounded-xl cursor-pointer hover:border-indigo-400 transition-all ${
                      currentTemplate.id === t.id
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <ProjectTypeBadge type={t.type} size="xs" />
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                        {t.tasksCount} Deliverables
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-1">{t.name}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: PROJECT INFO */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Step 2: Enter Project Information
              </h4>
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-bold">Selected Template</span>
                  <p className="font-bold text-indigo-950 dark:text-indigo-200 text-xs">{currentTemplate.name}</p>
                </div>
                <ProjectTypeBadge type={currentTemplate.type} size="xs" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Target Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Client Organization</label>
                  <select
                    value={client}
                    onChange={(e) => {
                      setClient(e.target.value);
                      if (e.target.value.includes('FreshPod')) setBrand('FreshPod');
                      else if (e.target.value.includes('Lagos')) setBrand('Lagos');
                      else setBrand('PMV');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  >
                    <option value="PMV Global Group">PMV Global Group</option>
                    <option value="FreshPod Brands">FreshPod Brands</option>
                    <option value="Lagos Logistics">Lagos Logistics</option>
                    <option value="Aura FinTech">Aura FinTech</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Brand Tag</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ASSIGN TEAM */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Step 3: Assign Project Leadership &amp; Team
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Project Owner</label>
                  <select
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tech Lead / Manager</label>
                  <select
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Assigned Team Members</label>
                <div className="grid grid-cols-2 gap-2 border border-slate-200 dark:border-slate-800 rounded-xl p-3 max-h-48 overflow-y-auto bg-slate-50/50 dark:bg-slate-800/40">
                  {users.map(u => (
                    <label key={u.id} className="flex items-center gap-2.5 p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={team.includes(u.id)}
                        onChange={() => toggleTeamMember(u.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{u.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: DATES & RECURRING */}
          {step === 4 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Step 4: Target Dates &amp; Cadence
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Target Completion Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {currentTemplate.type === 'recurring' && (
                <div className="p-4 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 rounded-xl space-y-2">
                  <span className="font-bold text-cyan-900 dark:text-cyan-200 block">Recurring Retainer Cadence</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-cyan-800 dark:text-cyan-300 font-semibold mb-1">Monthly Billing Cutoff</label>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={recurringDay}
                        onChange={(e) => setRecurringDay(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-cyan-300 dark:border-cyan-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-cyan-800 dark:text-cyan-300 font-semibold mb-1">Cycle Duration</label>
                      <span className="block px-3 py-1.5 bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-800 rounded-xl text-cyan-900 dark:text-cyan-200 font-semibold">
                        30-Day Auto Renewal
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {step === 5 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Step 5: Review Template Configuration
              </h4>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{projectName}</span>
                  <ProjectTypeBadge type={currentTemplate.type} size="xs" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-slate-500 dark:text-slate-400">Client:</span> <strong className="text-slate-800 dark:text-slate-200">{client}</strong></div>
                  <div><span className="text-slate-500 dark:text-slate-400">Brand Tag:</span> <strong className="text-slate-800 dark:text-slate-200">{brand}</strong></div>
                  <div><span className="text-slate-500 dark:text-slate-400">Target Date:</span> <strong className="text-slate-800 dark:text-slate-200">{targetDate}</strong></div>
                  <div><span className="text-slate-500 dark:text-slate-400">Initial Tasks:</span> <strong className="text-slate-800 dark:text-slate-200">{currentTemplate.tasksCount} Tasks from template</strong></div>
                </div>

                <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Milestones auto-instantiated:
                  </span>
                  <div className="space-y-1.5">
                    {currentTemplate.tasksPreview?.slice(0, 5).map((tp, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{tp}</span>
                      </div>
                    ))}
                    {(currentTemplate.tasksPreview?.length || 0) > 5 && (
                      <div className="text-indigo-600 dark:text-indigo-400 font-semibold pl-5 pt-0.5">
                        +{currentTemplate.tasksPreview.length - 5} more standard sprint tracks...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: CREATE SUCCESS CONFIRMATION */}
          {step === 6 && (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Ready to Instantiate Project</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                PulsePM will generate the project structure and populate all hierarchical milestone deliverables, team roles, and cadence.
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/70 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-md shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Instantiate &amp; Launch Sprint</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
