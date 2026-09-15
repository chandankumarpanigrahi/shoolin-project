'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users2,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  AlertOctagon,
  Zap
} from 'lucide-react';
import { KPI_METRICS } from '@/data/kpis';
import { UserAvatar } from '@/components/common/UserAvatar';

export function KpiDashboardView({ projects, tasks, users }) {
  const [timeframe, setTimeframe] = useState('Quarter 3 (2026)');

  // Calculate status counts
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const reviewTasks = tasks.filter(t => t.status === 'Review').length;
  const blockedTasks = tasks.filter(t => t.status === 'Blocked').length;
  const notStartedTasks = tasks.filter(t => t.status === 'Not Started').length;

  const completionRate = Math.round((completedTasks / (totalTasks || 1)) * 100);

  return (
    <div className="space-y-4 pb-12 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand" />
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Executive KPI &amp; Velocity Analytics</h1>
            <span className="text-xs px-2 py-0.5 bg-brand-subtle text-brand-text font-mono font-medium rounded-xs border border-brand-border">
              Q3 Performance
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational telemetry, milestone completion rates, sprint throughput, and dependency clearance latency
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand"
          >
            <option value="Current Sprint (Sprint 18)">Current Sprint (Sprint 18)</option>
            <option value="Quarter 3 (2026)">Quarter 3 (2026)</option>
            <option value="Year-to-Date (2026)">Year-to-Date (2026)</option>
          </select>
        </div>
      </div>

      {/* 4 Primary Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">On-Time Delivery Rate</span>
            <Award className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{KPI_METRICS.onTimeDeliveryRate}%</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              +4.2% QoQ
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Target benchmark is 85.0%</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Task Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-brand" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{completionRate}%</span>
            <span className="text-[11px] font-semibold text-brand flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              {completedTasks} / {totalTasks}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Target benchmark is 80.0%</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Blockers</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{blockedTasks}</span>
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center">
              <ArrowDownRight className="w-3 h-3" />
              -2 this week
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Requires management clearance</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Sprint Velocity</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{KPI_METRICS.sprintVelocity} pts</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              +6 pts vs S17
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Story points completed in 14-day sprint</p>
        </div>
      </div>

      {/* 2 Interactive Charts / Telemetry Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Columns: Monthly Deliverable Throughput Bar Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Monthly Deliverable Throughput (2026)
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Tasks Completed</span>
          </div>

          <div className="pt-4 pb-2">
            <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              {KPI_METRICS.monthlyCompletionTrend.map((m) => {
                const heightPercent = Math.round((m.completed / 60) * 100);
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 group-hover:text-brand font-bold transition-colors">
                      {m.completed}
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-xs h-36 flex items-end overflow-hidden">
                      <div
                        className="w-full bg-brand group-hover:bg-brand-hover rounded-t-xs transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-1">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Status Breakdown Visualizer */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Deliverable Status Breakdown
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{totalTasks} Total Tasks</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {[
              { label: 'Completed', count: completedTasks, color: 'bg-emerald-500' },
              { label: 'In Progress', count: inProgressTasks, color: 'bg-blue-600' },
              { label: 'Review Stage', count: reviewTasks, color: 'bg-brand' },
              { label: 'Blocked / Blocker', count: blockedTasks, color: 'bg-rose-500' },
              { label: 'Not Started', count: notStartedTasks, color: 'bg-slate-300 dark:bg-slate-600' }
            ].map((stat) => {
              const pct = Math.round((stat.count / (totalTasks || 1)) * 100);
              return (
                <div key={stat.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-xs ${stat.color}`} />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{stat.label}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{stat.count}</span>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">({pct}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-xs overflow-hidden">
                    <div className={`h-full ${stat.color} rounded-xs`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Velocity Leaderboard */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-sm p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Users2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Team Throughput &amp; Performance Telemetry
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Sprint 18 Analytics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-2 px-3">Team Member</th>
                <th className="py-2 px-3">Department</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Assigned Tasks</th>
                <th className="py-2 px-3">Closed Tasks</th>
                <th className="py-2 px-3">Efficiency Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u, i) => {
                const assigned = tasks.filter(t => t.assignedTo === u.id).length;
                const closed = tasks.filter(t => t.assignedTo === u.id && t.status === 'Completed').length;
                const score = 90 + ((i * 2) % 9);

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <UserAvatar user={u} size="xs" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{u.department}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">{u.role}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">{assigned}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{closed}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[11px] rounded-xs border border-emerald-200 dark:border-emerald-800">
                        {score}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
