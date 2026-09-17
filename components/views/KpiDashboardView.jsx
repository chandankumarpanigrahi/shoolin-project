'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/components/providers/AppProvider';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useToast } from '@/components/common/Toast';
import { StatusBadge, PriorityBadge } from '@/components/common/Badges';
import { useUrlTab, useUrlParam } from '@/hooks/useUrlState';
import { KPI_METRICS } from '@/data/kpis';
import {
  BarChart3,
  Award,
  CheckCircle2,
  AlertOctagon,
  Briefcase,
  Users2,
  Download,
  Filter,
  ChevronRight,
  TrendingUp,
  Search,
} from 'lucide-react';

export function KpiDashboardView({ projects = [], tasks = [], users = [] }) {
  const router = useRouter();
  const { dependencies = [], handleSelectTask } = useAppContext();
  const { toast } = useToast();

  // ─── URL Synchronized State ───────────────────────────────────────────────
  const [activeTab, setActiveTab] = useUrlTab('tab', 'overview', ['overview', 'projects', 'team', 'dependencies']);
  const [timeframe, setTimeframe] = useUrlParam('timeframe', 'Quarter 3 (2026)');
  const [selectedProjectId, setSelectedProjectId] = useUrlParam('project', 'all');
  const [teamSearch, setTeamSearch] = useState('');

  // ─── Filtered Datasets ───────────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    if (selectedProjectId === 'all') return projects;
    return projects.filter((p) => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  const filteredTasks = useMemo(() => {
    if (selectedProjectId === 'all') return tasks;
    return tasks.filter((t) => t.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  // ─── Dynamic Metric Calculations ──────────────────────────────────────────
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'In Progress').length;
  const reviewTasks = filteredTasks.filter((t) => t.status === 'Review').length;
  const blockedTasks = filteredTasks.filter((t) => t.status === 'Blocked').length;
  const notStartedTasks = filteredTasks.filter((t) => t.status === 'Not Started').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const onTimeDeliveryRate = KPI_METRICS.onTimeDeliveryRate || 94.2;
  const activeBlockersCount = blockedTasks + dependencies.filter((d) => d.status === 'Blocked').length;

  // ─── Export CSV ───────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    try {
      const rows = [
        ['KPI Dashboard Summary'],
        ['Timeframe', timeframe],
        ['Metric', 'Value'],
        ['On-Time Delivery Rate', `${onTimeDeliveryRate}%`],
        ['Completion Rate', `${completionRate}% (${completedTasks}/${totalTasks})`],
        ['Active Blockers', activeBlockersCount],
        ['Total Projects', filteredProjects.length],
        [],
        ['Projects Overview'],
        ['Code', 'Name', 'Status', 'Progress'],
        ...filteredProjects.map((p) => [p.code, `"${p.name}"`, p.status, `${p.progress}%`]),
      ];
      const csv = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
      const uri = encodeURI(csv);
      const link = document.createElement('a');
      link.href = uri;
      link.download = `kpi-summary-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('KPI summary exported as CSV');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  // ─── Filtered Team ────────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    if (!teamSearch.trim()) return users;
    const q = teamSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [users, teamSearch]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: Briefcase, count: filteredProjects.length },
    { id: 'team', label: 'Team', icon: Users2, count: users.length },
    { id: 'dependencies', label: 'Blockers', icon: AlertOctagon, count: activeBlockersCount },
  ];

  return (
    <div className="space-y-5 pb-16 text-xs w-full">
      {/* ─── Top Header Banner ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-light/30 dark:bg-brand/15 flex items-center justify-center text-brand">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              KPI Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Key performance indicators, delivery velocity, and project health.
          </p>
        </div>

        {/* Action / Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand"
          >
            <option value="Current Sprint (Sprint 18)">Current Sprint</option>
            <option value="Quarter 3 (2026)">Q3 2026</option>
            <option value="Quarter 2 (2026)">Q2 2026</option>
            <option value="Year-to-Date (2026)">Year to Date</option>
          </select>

          {/* Project Filter */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand"
          >
            <option value="all">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} · {p.name}
              </option>
            ))}
          </select>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ─── 4 Primary Metric Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Delivery Rate */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">On-Time Delivery</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
              {onTimeDeliveryRate}%
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Target: 85%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${onTimeDeliveryRate}%` }} />
          </div>
        </div>

        {/* Metric 2: Completion Rate */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tasks Completed</span>
            <CheckCircle2 className="w-4 h-4 text-brand" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
              {completedTasks}/{totalTasks}
            </span>
            <span className="text-[11px] font-bold text-brand font-mono">{completionRate}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* Metric 3: Active Blockers */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Blockers</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-black font-mono ${activeBlockersCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {activeBlockersCount}
            </span>
            <span className={`text-[11px] font-bold ${activeBlockersCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {activeBlockersCount === 0 ? 'All Clear' : 'Needs Attention'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${activeBlockersCount > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(activeBlockersCount * 25, 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Active Projects */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Projects</span>
            <Briefcase className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
              {filteredProjects.length}
            </span>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 font-mono">
              {filteredProjects.filter((p) => p.status !== 'Completed').length} In Progress
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '80%' }} />
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold text-xs transition-all shrink-0 ${
                active
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Tab 1: Overview ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Monthly Completion Trend (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Monthly Completion Trend
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">Tasks closed per month</span>
            </div>

            <div className="pt-3">
              <div className="h-48 flex items-end justify-between gap-3 px-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                {KPI_METRICS.monthlyCompletionTrend.map((m) => {
                  const maxVal = 50;
                  const heightPercent = Math.min(Math.round((m.completed / maxVal) * 100), 100);

                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <span className="text-[11px] font-mono text-slate-500 font-bold group-hover:text-brand transition-colors">
                        {m.completed}
                      </span>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-36 flex items-end overflow-hidden p-0.5">
                        <div
                          className="w-full bg-brand group-hover:bg-brand-hover rounded-t-md transition-all duration-300 shadow-xs"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-1">
                        {m.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Deliverable Status Breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Task Status Breakdown
              </h2>
              <span className="text-[11px] font-mono font-bold text-slate-500">{totalTasks} Total Tasks</span>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { label: 'Completed', count: completedTasks, color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'In Progress', count: inProgressTasks, color: 'bg-blue-600', text: 'text-blue-600 dark:text-blue-400' },
                { label: 'Review', count: reviewTasks, color: 'bg-brand', text: 'text-brand' },
                { label: 'Blocked', count: blockedTasks, color: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
                { label: 'Not Started', count: notStartedTasks, color: 'bg-slate-300 dark:bg-slate-600', text: 'text-slate-500' },
              ].map((s) => {
                const pct = totalTasks > 0 ? Math.round((s.count / totalTasks) * 100) : 0;
                return (
                  <div key={s.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{s.label}</span>
                      </div>
                      <div className="font-mono text-[11px]">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{s.count}</span>{' '}
                        <span className={`font-semibold ${s.text}`}>({pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab 2: Projects ─────────────────────────────────────────────────── */}
      {activeTab === 'projects' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProjects.map((p) => {
                  const pTasks = tasks.filter((t) => t.projectId === p.id);
                  const pCompleted = pTasks.filter((t) => t.status === 'Completed').length;
                  const calculatedPct = pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : p.progress;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => router.push(`/projects/${p.id}`)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-brand">{p.code}</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        {p.client}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={p.status} size="xs" />
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={p.priority} size="xs" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{calculatedPct}%</span>
                            <span className="text-slate-400">{pCompleted}/{pTasks.length}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-brand rounded-full" style={{ width: `${calculatedPct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Tab 3: Team ─────────────────────────────────────────────────────── */}
      {activeTab === 'team' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs space-y-3 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Team Member Workload &amp; Performance
            </h2>
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search member or department..."
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Assigned</th>
                  <th className="py-2.5 px-3">Completed</th>
                  <th className="py-2.5 px-3">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => {
                  const assigned = tasks.filter((t) => t.assignedTo === u.id).length;
                  const closed = tasks.filter((t) => t.assignedTo === u.id && t.status === 'Completed').length;
                  const pct = assigned > 0 ? Math.round((closed / assigned) * 100) : 100;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar user={u} size="xs" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">{u.name}</span>
                            <span className="text-[10px] text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-medium">
                        {u.department}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {u.role}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {assigned}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {closed}
                      </td>
                      <td className="py-3 px-3">
                        <div className="w-24 space-y-1">
                          <span className="text-[10px] font-mono font-bold">{pct}%</span>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Tab 4: Blockers ─────────────────────────────────────────────────── */}
      {activeTab === 'dependencies' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Active Blockers &amp; Dependencies
            </h2>
            <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-bold">
              {dependencies.length} Tracked
            </span>
          </div>

          <div className="space-y-2.5">
            {dependencies.map((dep) => {
              const fromU = users.find((u) => u.id === dep.fromUser);
              const toU = users.find((u) => u.id === dep.toUser);
              const isBlocked = dep.status === 'Blocked' || dep.status === 'Waiting';
              const relatedTask = tasks.find((t) => t.id === dep.relatedTaskId || t.code === dep.relatedTaskCode);

              return (
                <div
                  key={dep.id}
                  onClick={() => {
                    if (relatedTask && handleSelectTask) {
                      handleSelectTask(relatedTask);
                    }
                  }}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isBlocked
                      ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 hover:border-rose-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand">{dep.relatedTaskCode}</span>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">{dep.taskTitle}</h3>
                      <StatusBadge status={dep.status} size="xs" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">Expected: {dep.expectedDate}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
                    {dep.dependencyDescription}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span>From: <strong className="text-slate-700 dark:text-slate-300">{fromU?.name}</strong></span>
                      <span>→</span>
                      <span>To: <strong className="text-slate-700 dark:text-slate-300">{toU?.name}</strong></span>
                    </div>
                    <span className="font-mono font-semibold text-slate-400">{dep.projectName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
