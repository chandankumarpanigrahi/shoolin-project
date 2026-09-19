'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  Activity,
  Laptop,
  Smartphone,
  Globe,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  Download,
  ShieldAlert,
  UserCheck,
  UserX,
  KeyRound,
  FileText,
  Trash2
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProvider';
import { UserAvatar } from '@/components/common/UserAvatar';
import { RoleBadge } from '@/components/common/Badges';
import { api } from '@/lib/api';
import { showConfirm, showSuccess, showError } from '@/lib/swal';

export function ActivityLogView() {
  const { currentUser } = useAppContext();

  // Active Tab: 'sessions' | 'audit'
  const [activeTab, setActiveTab] = useState('sessions');

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionSearch, setSessionSearch] = useState('');
  const [sessionFilter, setSessionFilter] = useState('ALL'); // 'ALL' | 'Active' | 'Terminated' | 'Expired'

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditModuleFilter, setAuditModuleFilter] = useState('ALL');

  // Load sessions from MongoDB
  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const data = await api.sessions.getAll();
      if (Array.isArray(data)) {
        setSessions(data);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  // Load audit logs from MongoDB
  const loadAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const data = await api.auditLogs.getAll(auditModuleFilter !== 'ALL' ? auditModuleFilter : null);
      if (Array.isArray(data)) {
        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  }, [auditModuleFilter]);

  useEffect(() => {
    loadSessions();
    loadAuditLogs();
  }, [loadSessions, loadAuditLogs]);

  // Current session ID stored locally
  const currentSessionId = typeof window !== 'undefined' ? localStorage.getItem('pulsepm_session_id') : null;

  // Terminate a single session
  const handleTerminateSession = async (session) => {
    const targetId = session.id || session._id || session.sessionId;
    const isSelf = session.sessionId === currentSessionId;

    const confirmed = await showConfirm({
      title: isSelf ? 'Terminate Your Current Session?' : `Terminate Session for ${session.userName}?`,
      text: isSelf
        ? 'You will be logged out of this browser immediately.'
        : `This will immediately revoke ${session.userName}'s access on ${session.device}.`,
      confirmButtonText: 'Yes, Terminate Session',
      confirmButtonColor: '#e11d48',
    });

    if (!confirmed) return;

    try {
      await api.sessions.terminate(targetId);

      // Instant multi-tab broadcast for zero-latency termination
      try {
        localStorage.setItem(
          'pulsepm_session_terminated_broadcast',
          JSON.stringify({ sessionId: session.sessionId || targetId, isSelf, timestamp: Date.now() })
        );
      } catch (e) {}

      // If user terminated their own active session, exit immediately
      if (isSelf) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pulsepm_is_authenticated');
          localStorage.removeItem('pulsepm_jwt_token');
          localStorage.removeItem('pulsepm_current_user');
          localStorage.removeItem('pulsepm_session_id');
          window.location.href = '/login?reason=terminated';
        }
        return;
      }

      showSuccess('Session Terminated', `Session for ${session.userName} has been revoked.`);
      // Optimistic update
      setSessions((prev) =>
        prev.map((s) =>
          (s.id === targetId || s._id === targetId || s.sessionId === targetId)
            ? { ...s, status: 'Terminated', terminatedAt: new Date().toISOString(), terminatedBy: currentUser?.name || 'Super Admin' }
            : s
        )
      );
      loadAuditLogs();
    } catch (err) {
      showError('Termination Failed', err.message || 'Could not terminate session.');
    }
  };

  // Terminate all other sessions
  const handleTerminateAllOthers = async () => {
    const confirmed = await showConfirm({
      title: 'Terminate All Other Sessions?',
      text: 'Every member session (except your current active window) will be terminated immediately.',
      confirmButtonText: 'Yes, Revoke All Others',
      confirmButtonColor: '#e11d48',
    });

    if (!confirmed) return;

    try {
      await api.sessions.terminateAllOthers(currentSessionId);

      // Instant multi-device / multi-tab broadcast
      try {
        localStorage.setItem(
          'pulsepm_session_terminated_broadcast',
          JSON.stringify({ allOthers: true, exceptSessionId: currentSessionId, timestamp: Date.now() })
        );
      } catch (e) {}

      showSuccess('All Other Sessions Terminated', 'All other active member sessions have been invalidated.');
      loadSessions();
      loadAuditLogs();
    } catch (err) {
      showError('Action Failed', err.message || 'Could not revoke sessions.');
    }
  };

  // Clear all non-active (Terminated / Expired) sessions from DB
  const handleClearInactiveSessions = async () => {
    const nonActiveCount = sessions.filter((s) => s.status !== 'Active').length;
    if (nonActiveCount === 0) {
      showSuccess('All Clean', 'No non-active (terminated or expired) sessions found to clear.');
      return;
    }

    const confirmed = await showConfirm({
      title: 'Clear Non-Active Sessions?',
      text: `This will permanently delete ${nonActiveCount} terminated and expired session record${nonActiveCount > 1 ? 's' : ''} from the database. Active sessions will remain completely intact.`,
      confirmButtonText: 'Yes, Clear Non-Active',
      confirmButtonColor: '#e11d48',
    });

    if (!confirmed) return;

    try {
      const res = await api.sessions.clearInactive();
      showSuccess('Cleared Non-Active Sessions', res.message || `Deleted ${res.deletedCount || nonActiveCount} inactive sessions.`);
      loadSessions();
      loadAuditLogs();
    } catch (err) {
      showError('Clear Failed', err.message || 'Could not clear inactive sessions.');
    }
  };

  // Clear all audit logs from DB
  const handleClearAuditLogs = async () => {
    if (auditLogs.length === 0) {
      showSuccess('Already Empty', 'Audit trail is already empty.');
      return;
    }

    const confirmed = await showConfirm({
      title: 'Clear Entire Audit Trail?',
      text: `This will permanently delete all ${auditLogs.length} audit log entries from the database. This action cannot be undone.`,
      confirmButtonText: 'Yes, Clear All Logs',
      confirmButtonColor: '#e11d48',
    });

    if (!confirmed) return;

    try {
      await api.auditLogs.clearAll();
      showSuccess('Audit Trail Cleared', 'All audit log records have been permanently cleared.');
      setAuditLogs([]);
    } catch (err) {
      showError('Clear Failed', err.message || 'Could not clear audit trail.');
    }
  };

  // Export audit logs to CSV
  const handleExportAuditLogs = () => {
    if (!auditLogs.length) return;
    const headers = ['Action', 'Module', 'Performed By', 'Actor Email', 'Role', 'Device', 'Target', 'Details', 'Timestamp'];
    const rows = auditLogs.map((log) => [
      `"${log.action || ''}"`,
      `"${log.module || ''}"`,
      `"${log.performedBy || ''}"`,
      `"${log.performedByEmail || ''}"`,
      `"${log.performedByRole || ''}"`,
      `"${log.device || ''}"`,
      `"${log.target || ''}"`,
      `"${(log.details || '').replace(/"/g, '""')}"`,
      `"${new Date(log.timestamp || log.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shoolin_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = sessions.length;
    const active = sessions.filter((s) => s.status === 'Active').length;
    const terminated = sessions.filter((s) => s.status === 'Terminated').length;
    const uniqueUsers = new Set(sessions.map((s) => s.userEmail)).size;
    return { total, active, terminated, uniqueUsers };
  }, [sessions]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchStatus = sessionFilter === 'ALL' || s.status === sessionFilter;
      const q = sessionSearch.toLowerCase().trim();
      const matchQuery =
        !q ||
        s.userName?.toLowerCase().includes(q) ||
        s.userEmail?.toLowerCase().includes(q) ||
        s.device?.toLowerCase().includes(q) ||
        s.userRole?.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [sessions, sessionFilter, sessionSearch]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchModule = auditModuleFilter === 'ALL' || log.module === auditModuleFilter;
      const q = auditSearch.toLowerCase().trim();
      const matchQuery =
        !q ||
        log.action?.toLowerCase().includes(q) ||
        log.performedBy?.toLowerCase().includes(q) ||
        log.performedByEmail?.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q) ||
        log.device?.toLowerCase().includes(q);
      return matchModule && matchQuery;
    });
  }, [auditLogs, auditModuleFilter, auditSearch]);

  const calculateDaysRemaining = (expiresAt) => {
    if (!expiresAt) return '30d remaining';
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days > 1 ? 's' : ''} left`;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand/10 text-brand">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Activity Log &amp; Session Monitor
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              loadSessions();
              loadAuditLogs();
            }}
            className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 hover:border-brand flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${sessionsLoading || auditLoading ? 'animate-spin text-brand' : ''}`} />
            <span>Refresh</span>
          </button>

          {activeTab === 'sessions' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearInactiveSessions}
                className="hidden px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Clear all non-active (terminated/expired) sessions"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
              <button
                type="button"
                onClick={handleTerminateAllOthers}
                className="px-3.5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Revoke All</span>
              </button>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearAuditLogs}
                className="hidden px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl shadow-xs transition-all items-center gap-1.5 cursor-pointer"
                title="Clear all audit log history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Logs</span>
              </button>
              <button
                type="button"
                onClick={handleExportAuditLogs}
                className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Active Member Sessions</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.active}</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Live Authorized Clients</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Unique Members Active</span>
            <UserCheck className="w-4 h-4 text-brand" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.uniqueUsers}</div>
          <span className="text-[11px] text-slate-500 font-medium">Distinct Account Logins</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Revoked Sessions</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{stats.terminated}</div>
          <span className="text-[11px] text-rose-500 font-medium">Explicitly Terminated</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Default Session Expiry</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">30 Days</div>
          <span className="text-[11px] text-slate-500 font-medium">Zero-Trust Auto-Expire</span>
        </div>
      </div>

      {/* 2-TAB SWITCHER */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'sessions'
            ? 'bg-white dark:bg-slate-800 text-brand shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Active Member Sessions ({sessions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'audit'
            ? 'bg-white dark:bg-slate-800 text-brand shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          <Activity className="w-4 h-4" />
          <span>Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SESSIONS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
                placeholder="Search member, email, or device..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {['ALL', 'Active', 'Terminated', 'Expired'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSessionFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${sessionFilter === filter
                    ? 'bg-brand text-white shadow-xs font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                >
                  {filter}
                </button>
              ))}

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

              <button
                type="button"
                onClick={handleClearInactiveSessions}
                className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1.5 shadow-xs shrink-0"
                title="Clear all terminated and expired sessions from database"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Sessions Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            {sessionsLoading ? (
              <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-brand" />
                <span>Loading active member sessions from MongoDB Atlas...</span>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No sessions match your active criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Device &amp; Browser</th>
                      <th className="py-3 px-4">Sign-In Time</th>
                      <th className="py-3 px-4">Last Active</th>
                      <th className="py-3 px-4">Session Expiry</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {filteredSessions.map((session) => {
                      const isCurrent = session.sessionId === currentSessionId;
                      return (
                        <tr key={session.id || session._id || session.sessionId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <UserAvatar user={{ name: session.userName, avatar: session.avatar }} size="sm" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 dark:text-white truncate">
                                    {session.userName}
                                  </span>
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-brand/10 text-brand border border-brand/20 uppercase">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {session.userEmail}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {session.device?.includes('Mobile') ? (
                                <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
                              ) : (
                                <Laptop className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {session.device || 'Desktop Browser'}
                                </span>
                                <div className="text-[10px] text-slate-400">
                                  {session.os} • {session.browser}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            <div>{new Date(session.loginAt).toLocaleDateString()}</div>
                            <div className="text-[10px] text-slate-400">{new Date(session.loginAt).toLocaleTimeString()}</div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            <div>{session.lastActiveAt ? new Date(session.lastActiveAt).toLocaleTimeString() : 'Just now'}</div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                              {calculateDaysRemaining(session.expiresAt)}
                            </span>
                            <div className="text-[10px] text-slate-400">30-day window</div>
                          </td>

                          <td className="py-3.5 px-4">
                            {session.status === 'Active' && (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </span>
                            )}
                            {session.status === 'Terminated' && (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                                Terminated
                              </span>
                            )}
                            {session.status === 'Expired' && (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                                Expired
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {session.status === 'Active' ? (
                              <button
                                type="button"
                                onClick={() => handleTerminateSession(session)}
                                className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 dark:border-rose-800 rounded-lg transition-all cursor-pointer shadow-xs"
                                title="Revoke session"
                              >
                                Terminate
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                {session.terminatedBy ? `By ${session.terminatedBy}` : 'Revoked'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AUDIT TRAIL */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Search & Module Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search actions, user, details..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {['ALL', 'AUTH', 'SESSION', 'USER_MGMT', 'SECURITY', 'PROJECTS'].map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setAuditModuleFilter(mod)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${auditModuleFilter === mod
                    ? 'bg-brand text-white shadow-xs font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                >
                  {mod}
                </button>
              ))}

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

              <button
                type="button"
                onClick={handleClearAuditLogs}
                className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1.5 shadow-xs shrink-0"
                title="Clear all audit logs from database"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Logs</span>
              </button>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            {auditLoading ? (
              <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-brand" />
                <span>Loading security audit trail from MongoDB Atlas...</span>
              </div>
            ) : filteredAuditLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No audit log entries found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Event Action</th>
                      <th className="py-3 px-4">Module</th>
                      <th className="py-3 px-4">Performed By</th>
                      <th className="py-3 px-4">Description &amp; Context</th>
                      <th className="py-3 px-4">Device</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {filteredAuditLogs.map((log) => {
                      const isAuth = log.module === 'AUTH';
                      const isSession = log.module === 'SESSION';
                      const isSecurity = log.module === 'SECURITY';

                      return (
                        <tr key={log.id || log._id || Math.random()} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              {isAuth ? (
                                <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                              ) : isSession ? (
                                <Laptop className="w-3.5 h-3.5 text-rose-500" />
                              ) : (
                                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                              )}
                              <span>{log.action}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                              {log.module || 'GENERAL'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              {log.performedBy || 'System'}
                            </div>
                            {log.performedByEmail && (
                              <div className="text-[10px] text-slate-400">{log.performedByEmail}</div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 min-w-[220px]">
                            {log.details}
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {log.device || 'Desktop Browser'}
                          </td>

                          <td className="py-3.5 px-4 text-right text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            <div>{new Date(log.timestamp || log.createdAt).toLocaleDateString()}</div>
                            <div className="text-[10px] text-slate-400">{new Date(log.timestamp || log.createdAt).toLocaleTimeString()}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
