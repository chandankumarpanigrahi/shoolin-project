'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  Check,
  X,
  RotateCcw,
  Sliders,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
  Layers,
  Briefcase,
  CheckSquare,
  CalendarRange,
  Video,
  GitBranch,
  Link2,
  BarChart3,
  Database,
  Plus,
  Trash2,
  Edit3,
  Download,
  ChevronDown,
  ChevronRight,
  Info,
  ExternalLink,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProvider';
import { UserAvatar } from '@/components/common/UserAvatar';
import { RoleBadge } from '@/components/common/Badges';

const MODULE_ICONS = {
  dashboard: BarChart3,
  projects: Briefcase,
  tasks: CheckSquare,
  roadmap: CalendarRange,
  meetings: Video,
  dependencies: GitBranch,
  links: Link2,
  kpi: BarChart3,
  templates: Layers,
  masters: Database,
  access_control: ShieldCheck
};

export function AccessControlView({ initialUserId = null, isEmbedded = false }) {
  const {
    users,
    currentUser,
    setCurrentUser,
    rolesList,
    addCustomRole,
    updateCustomRole,
    deleteCustomRole,
    rolePermissions,
    userOverrides,
    accessAuditLog,
    hasPermission,
    can,
    getUserPermissionStatus,
    setUserPermissionOverride,
    bulkSetUserPermissions,
    resetUserPermissions,
    setRolePermission,
    bulkSetRolePermissions,
    resetAllPermissionsToDefault,
    PERMISSION_MODULES,
    GRANULAR_PERMISSIONS
  } = useAppContext();

  // Active Main SubTab: 'users' (To Whom What Access) | 'matrix' (Role Matrix) | 'audit' (Audit Log)
  const [activeTab, setActiveTab] = useState('users');

  // User Selection state
  const [selectedUserId, setSelectedUserId] = useState(() => {
    if (initialUserId && users.find((u) => u.id === initialUserId)) {
      return initialUserId;
    }
    // Default to first non-super-admin or first user
    const firstNonAdmin = users.find((u) => u.role !== 'Super Admin');
    return firstNonAdmin ? firstNonAdmin.id : users[0]?.id || 'usr-1';
  });

  // User list filters
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [onlyOverridden, setOnlyOverridden] = useState(false);

  // Permission list filters
  const [permSearch, setPermSearch] = useState('');
  const [activeModuleFilter, setActiveModuleFilter] = useState('ALL');
  const [permStatusFilter, setPermStatusFilter] = useState('ALL'); // 'ALL' | 'OVERRIDDEN' | 'ALLOWED' | 'DENIED'

  // Custom Role Modal state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ name: '', desc: '', status: 'Active' });

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm }

  // Check if current active user is Super Admin
  const isSuperAdmin = currentUser?.role === 'Super Admin' || can('access_control.manage_roles');

  const selectedUser = useMemo(() => {
    return users.find((u) => u.id === selectedUserId) || users[0];
  }, [users, selectedUserId]);

  const departments = useMemo(() => {
    const list = Array.from(new Set(users.map((u) => u.department).filter(Boolean)));
    return ['ALL', ...list];
  }, [users]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (departmentFilter !== 'ALL' && u.department !== departmentFilter) return false;
      if (onlyOverridden) {
        const overrides = userOverrides[u.id];
        if (!overrides || Object.keys(overrides).length === 0) return false;
      }
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchDept = (u.department || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchDept) return false;
      }
      return true;
    });
  }, [users, roleFilter, departmentFilter, onlyOverridden, userSearch, userOverrides]);

  // Selected User's Override Statistics
  const userStats = useMemo(() => {
    if (!selectedUser) return { totalAllowed: 0, overrideCount: 0, grantedCount: 0, revokedCount: 0 };
    let totalAllowed = 0;
    let overrideCount = 0;
    let grantedCount = 0;
    let revokedCount = 0;

    GRANULAR_PERMISSIONS.forEach((p) => {
      const status = getUserPermissionStatus(selectedUser, p.id);
      if (status.allowed) totalAllowed++;
      if (status.isOverridden) {
        overrideCount++;
        if (status.type === 'custom_granted') grantedCount++;
        else revokedCount++;
      }
    });

    return { totalAllowed, overrideCount, grantedCount, revokedCount };
  }, [selectedUser, getUserPermissionStatus, GRANULAR_PERMISSIONS]);

  // Filtered Permissions for selected user
  const filteredPermissionsByModule = useMemo(() => {
    const query = permSearch.toLowerCase().trim();
    const result = {};

    PERMISSION_MODULES.forEach((mod) => {
      if (activeModuleFilter !== 'ALL' && activeModuleFilter !== mod.id) return;

      const permsInMod = GRANULAR_PERMISSIONS.filter((p) => p.moduleId === mod.id).filter((p) => {
        // Keyword search
        if (query) {
          const matchTitle = p.name.toLowerCase().includes(query);
          const matchDesc = p.description.toLowerCase().includes(query);
          const matchId = p.id.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchId) return false;
        }

        // Status filter for selected user
        if (selectedUser && permStatusFilter !== 'ALL') {
          const status = getUserPermissionStatus(selectedUser, p.id);
          if (permStatusFilter === 'OVERRIDDEN' && !status.isOverridden) return false;
          if (permStatusFilter === 'ALLOWED' && !status.allowed) return false;
          if (permStatusFilter === 'DENIED' && status.allowed) return false;
        }

        return true;
      });

      if (permsInMod.length > 0) {
        result[mod.id] = permsInMod;
      }
    });

    return result;
  }, [permSearch, activeModuleFilter, permStatusFilter, selectedUser, getUserPermissionStatus, PERMISSION_MODULES, GRANULAR_PERMISSIONS]);

  // Handle Quick Presets for Selected User
  const handleGrantAllForUser = () => {
    if (!selectedUser) return;
    const map = {};
    GRANULAR_PERMISSIONS.forEach((p) => {
      map[p.id] = true;
    });
    bulkSetUserPermissions(selectedUser.id, map);
  };

  const handleRevokeAllForUser = () => {
    if (!selectedUser) return;
    const map = {};
    GRANULAR_PERMISSIONS.forEach((p) => {
      // Keep only view permissions or set strictly false
      map[p.id] = p.risk === 'Low' && p.id.endsWith('.view');
    });
    bulkSetUserPermissions(selectedUser.id, map);
  };

  const handleResetUser = () => {
    if (!selectedUser) return;
    resetUserPermissions(selectedUser.id);
  };

  // Handle Module-level Bulk Actions for Selected User
  const handleModuleBulkAction = (moduleId, action) => {
    if (!selectedUser) return;
    const permsInMod = GRANULAR_PERMISSIONS.filter((p) => p.moduleId === moduleId);
    permsInMod.forEach((p) => {
      if (action === 'grant') setUserPermissionOverride(selectedUser.id, p.id, true);
      else if (action === 'revoke') setUserPermissionOverride(selectedUser.id, p.id, false);
      else if (action === 'inherit') setUserPermissionOverride(selectedUser.id, p.id, null);
    });
  };

  // Custom Role Form Submit
  const handleRoleSubmit = (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) return;

    if (editingRole) {
      updateCustomRole(editingRole.id, {
        name: roleForm.name.trim(),
        desc: roleForm.desc.trim(),
        status: roleForm.status
      });
    } else {
      addCustomRole({
        id: 'role-' + Date.now(),
        name: roleForm.name.trim(),
        desc: roleForm.desc.trim() || 'Custom operational role',
        status: roleForm.status,
        isSystem: false
      });
    }

    setIsRoleModalOpen(false);
    setEditingRole(null);
    setRoleForm({ name: '', desc: '', status: 'Active' });
  };

  const handleExportJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      roles: rolesList,
      rolePermissions,
      userOverrides,
      auditLog: accessAuditLog
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulsepm_access_control_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const superAdminUser = users.find((u) => u.role === 'Super Admin') || users[0];

  return (
    <div className={`space-y-4 pb-12 text-xs ${isEmbedded ? 'pt-0' : ''}`}>
      {/* 1. TOP HEADER & GOVERNANCE STATUS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    Full Access Control
                  </h1>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    SuperAdmin Master Authority
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Granular action-level security: configure exactly to whom what capability is granted or restricted
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Governance Non-Admin Simulation Banner */}
        {!isSuperAdmin && (
          <div className="mt-4 p-3 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 rounded-lg flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200">
                Access Restricted: Read-Only Governance View
              </span>
              <p className="text-amber-700 dark:text-amber-300 text-[11px] mt-0.5">
                You are currently signed in as <strong className="font-semibold">{currentUser.name} ({currentUser.role})</strong>. User activity monitoring, permission matrix governance, and audit log tracking require Super Admin role authority.
              </p>
            </div>
          </div>
        )}

        {/* Main Tabs Navigation */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 mt-5 pt-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`pb-2 px-3.5 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'users'
              ? 'border-brand text-brand'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User-Specific Access</span>
            {Object.keys(userOverrides).length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded-full font-mono">
                {Object.keys(userOverrides).length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`pb-2 px-3.5 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'matrix'
              ? 'border-brand text-brand'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Role Based Access</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-mono">
              {rolesList.length} Roles
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`pb-2 px-3.5 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'audit'
              ? 'border-brand text-brand'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Audit Log</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-mono">
              {accessAuditLog.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TO WHOM WHAT ACCESS (USER-SPECIFIC CUSTOMIZATION) */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT COLUMN: USER DIRECTORY SELECTOR (4 Cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand" />
                <span>Select Team Member</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {filteredUsers.length} of {users.length}
              </span>
            </div>

            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name, email, department..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-brand text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-700 dark:text-slate-200"
                >
                  <option value="ALL">All Roles</option>
                  {rolesList.map((r) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>

                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-700 dark:text-slate-200 truncate"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>{d === 'ALL' ? 'All Depts' : d}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 px-1 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyOverridden}
                  onChange={(e) => setOnlyOverridden(e.target.checked)}
                  className="rounded text-brand focus:ring-brand"
                />
                <span>Show only members with custom overrides</span>
              </label>
            </div>

            {/* User List */}
            <div className="space-y-1 max-h-[580px] overflow-y-auto pr-1">
              {filteredUsers.map((u) => {
                const isSelected = u.id === selectedUserId;
                const overrides = userOverrides[u.id];
                const overrideCount = overrides ? Object.keys(overrides).length : 0;

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUserId(u.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${isSelected
                      ? 'bg-brand/5 dark:bg-brand/10 border-brand shadow-xs'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar user={u} size="sm" />
                      <div className="min-w-0 flex flex-col">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`font-semibold truncate ${isSelected ? 'text-brand font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                            {u.name}
                          </span>
                          {u.id === currentUser.id && (
                            <span className="text-[9px] px-1 bg-brand-light/30 text-brand-text font-bold rounded">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 truncate">{u.department}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                      <RoleBadge role={u.role} size="xs" />
                      {overrideCount > 0 ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {overrideCount} {overrideCount === 1 ? 'override' : 'overrides'}
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400 font-mono">Role default</span>
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <UserX className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  <p>No team members match this filter</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: TIT-TO-BIT PERMISSION CONTROLLER (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {selectedUser ? (
              <>
                {/* Selected User Hero Banner */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={selectedUser} size="lg" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            {selectedUser.name}
                          </h2>
                          <RoleBadge role={selectedUser.role} size="sm" />
                          <span className="text-[11px] font-mono text-slate-400">ID: {selectedUser.id}</span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                          {selectedUser.email} · {selectedUser.department}
                        </div>
                      </div>
                    </div>

                    {/* Effective score pill */}
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Effective Access</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {userStats.totalAllowed} / {GRANULAR_PERMISSIONS.length} Enabled
                        </span>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        {Math.round((userStats.totalAllowed / GRANULAR_PERMISSIONS.length) * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* Preset Action Buttons & Custom Overrides Summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Quick Tit-to-Bit Presets:
                      </span>
                      <button
                        type="button"
                        onClick={handleGrantAllForUser}
                        className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-md transition-colors"
                      >
                        Grant All Access
                      </button>
                      <button
                        type="button"
                        onClick={handleRevokeAllForUser}
                        className="px-2.5 py-1 text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 rounded-md transition-colors"
                      >
                        Strict Read-Only
                      </button>
                      {userStats.overrideCount > 0 && (
                        <button
                          type="button"
                          onClick={handleResetUser}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset to {selectedUser.role} Defaults</span>
                        </button>
                      )}
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                      {userStats.overrideCount > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          ● {userStats.overrideCount} custom overrides active ({userStats.grantedCount} granted, {userStats.revokedCount} revoked)
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          ✓ Purely inheriting {selectedUser.role} base permissions
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Filter and Search Bar for Permissions */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3 shadow-xs space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search capability or action (e.g. create, delete, budget, kpi)..."
                        value={permSearch}
                        onChange={(e) => setPermSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-brand text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={permStatusFilter}
                        onChange={(e) => setPermStatusFilter(e.target.value)}
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 font-medium"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="OVERRIDDEN">Overridden Only</option>
                        <option value="ALLOWED">Allowed Only</option>
                        <option value="DENIED">Denied Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Module pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setActiveModuleFilter('ALL')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors shrink-0 ${activeModuleFilter === 'ALL'
                        ? 'bg-brand text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                    >
                      All Modules ({GRANULAR_PERMISSIONS.length})
                    </button>
                    {PERMISSION_MODULES.map((m) => {
                      const countInMod = GRANULAR_PERMISSIONS.filter((p) => p.moduleId === m.id).length;
                      const isSelected = activeModuleFilter === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setActiveModuleFilter(m.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${isSelected
                            ? 'bg-brand text-white shadow-2xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                        >
                          <span>{m.name.split(' ')[0]}</span>
                          <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
                            {countInMod}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Categorized Permissions Accordion / Modules */}
                <div className="space-y-3">
                  {Object.entries(filteredPermissionsByModule).map(([modId, perms]) => {
                    const moduleInfo = PERMISSION_MODULES.find((m) => m.id === modId) || { name: modId, desc: '' };
                    const ModIcon = MODULE_ICONS[modId] || ShieldCheck;
                    const enabledCount = perms.filter((p) => getUserPermissionStatus(selectedUser, p.id).allowed).length;

                    return (
                      <div
                        key={modId}
                        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs"
                      >
                        {/* Module Header Bar */}
                        <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-brand/10 text-brand flex items-center justify-center">
                              <ModIcon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                                  {moduleInfo.name}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                                  {enabledCount} / {perms.length} Enabled
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">{moduleInfo.desc}</span>
                            </div>
                          </div>

                          {/* Quick bulk actions for this module */}
                          <div className="flex items-center gap-1 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleModuleBulkAction(modId, 'grant')}
                              className="px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded border border-emerald-200 dark:border-emerald-800"
                              title="Enable all permissions in this module for user"
                            >
                              Grant All
                            </button>
                            <button
                              type="button"
                              onClick={() => handleModuleBulkAction(modId, 'revoke')}
                              className="px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded border border-rose-200 dark:border-rose-800"
                              title="Revoke all permissions in this module for user"
                            >
                              Revoke All
                            </button>
                            <button
                              type="button"
                              onClick={() => handleModuleBulkAction(modId, 'inherit')}
                              className="px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded"
                              title="Clear overrides in this module; inherit from role"
                            >
                              Inherit Role
                            </button>
                          </div>
                        </div>

                        {/* Module Permission Rows */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                          {perms.map((p) => {
                            const status = getUserPermissionStatus(selectedUser, p.id);
                            const roleDefault = rolePermissions[selectedUser.role]?.[p.id] ?? (selectedUser.role === 'Super Admin');

                            return (
                              <div
                                key={p.id}
                                className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${status.isOverridden
                                  ? status.allowed
                                    ? 'bg-emerald-50/25 dark:bg-emerald-950/15'
                                    : 'bg-rose-50/25 dark:bg-rose-950/15'
                                  : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30'
                                  }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                                      {p.name}
                                    </span>

                                    {/* Risk Badge */}
                                    <span
                                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold uppercase tracking-wider ${p.risk === 'High'
                                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                        : p.risk === 'Standard'
                                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                      {p.risk}
                                    </span>

                                    <span className="text-[10px] font-mono text-slate-400">{p.id}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    {p.description}
                                  </p>
                                </div>

                                {/* Status Chip & Interactive Toggle Switch */}
                                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                                  {/* Status indicator badge */}
                                  {status.isOverridden ? (
                                    <span
                                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.allowed
                                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700'
                                        }`}
                                    >
                                      <Sparkles className="w-2.5 h-2.5" />
                                      {status.allowed ? 'Custom: Granted' : 'Custom: Revoked'}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                      <span>Inherited:</span>
                                      <strong className={status.allowed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                                        {status.allowed ? 'Allowed' : 'Denied'}
                                      </strong>
                                    </span>
                                  )}

                                  {/* Revert override button (if custom override exists) */}
                                  {status.isOverridden && (
                                    <button
                                      type="button"
                                      onClick={() => setUserPermissionOverride(selectedUser.id, p.id, null)}
                                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                      title="Clear override & revert to role inheritance"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Granular Switch Toggle */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Toggle between Allowed (true) and Revoked (false)
                                      const nextVal = !status.allowed;
                                      setUserPermissionOverride(selectedUser.id, p.id, nextVal);
                                    }}
                                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${status.allowed ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-700'
                                      }`}
                                    title={`Click to ${status.allowed ? 'Revoke' : 'Grant'} ${p.name}`}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${status.allowed ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {Object.keys(filteredPermissionsByModule).length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl text-slate-400">
                      <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold">No capabilities match your search query</p>
                      <button
                        type="button"
                        onClick={() => {
                          setPermSearch('');
                          setActiveModuleFilter('ALL');
                          setPermStatusFilter('ALL');
                        }}
                        className="mt-2 text-xs font-bold text-brand hover:underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-bold">Select a team member from the directory on the left</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ROLE BASELINE MATRIX (RBAC MASTER DEFINITION) */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Top Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand" />
                <span>Role Baseline Access Matrix</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Configure organizational baseline rights. Changes immediately apply to all members unless individually overridden.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingRole(null);
                setRoleForm({ name: '', desc: '', status: 'Active' });
                setIsRoleModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Role</span>
            </button>
          </div>

          {/* Granular Matrix Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 min-w-[280px]">Granular Capability &amp; Scope</th>
                    <th className="py-3 px-3 text-center w-20">Risk</th>
                    {rolesList.map((r) => (
                      <th key={r.id} className="py-3 px-4 text-center whitespace-nowrap min-w-[130px]">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                            {r.name}
                          </span>
                          {!r.isSystem && (
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingRole(r);
                                  setRoleForm({ name: r.name, desc: r.desc || '', status: r.status });
                                  setIsRoleModalOpen(true);
                                }}
                                className="text-slate-400 hover:text-brand p-0.5 rounded transition-colors"
                                title="Edit Role"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteCustomRole(r.id)}
                                className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                                title="Delete Custom Role"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {PERMISSION_MODULES.map((mod) => {
                    const permsInMod = GRANULAR_PERMISSIONS.filter((p) => p.moduleId === mod.id);
                    const ModIcon = MODULE_ICONS[mod.id] || ShieldCheck;

                    return (
                      <React.Fragment key={mod.id}>
                        {/* Module Section Header in Matrix */}
                        <tr className="bg-slate-100/70 dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-200">
                          <td colSpan={2 + rolesList.length} className="py-2.5 px-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ModIcon className="w-3.5 h-3.5 text-brand" />
                                <span className="uppercase text-[11px] tracking-wider">{mod.name}</span>
                                <span className="text-[10px] text-slate-400 font-normal">({permsInMod.length} actions)</span>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Permissions in this module */}
                        {permsInMod.map((perm) => (
                          <tr
                            key={perm.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-2.5 px-4">
                              <div className="font-bold text-slate-900 dark:text-slate-100">{perm.name}</div>
                              <div className="text-[11px] text-slate-400">{perm.description}</div>
                            </td>

                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold uppercase ${perm.risk === 'High'
                                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                  : perm.risk === 'Standard'
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                  }`}
                              >
                                {perm.risk}
                              </span>
                            </td>

                            {rolesList.map((role) => {
                              const isSA = role.name === 'Super Admin';
                              const isAllowed = isSA
                                ? true
                                : rolePermissions[role.name]?.[perm.id] ?? false;

                              return (
                                <td key={role.id} className="py-2.5 px-4 text-center whitespace-nowrap">
                                  {isSA ? (
                                    <div
                                      className="inline-flex items-center justify-center w-6 h-6 rounded bg-emerald-500/10 text-emerald-600 cursor-not-allowed"
                                      title="Super Admin has immutable master rights"
                                    >
                                      <Lock className="w-3 h-3" />
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setRolePermission(role.name, perm.id, !isAllowed)}
                                      className={`inline-flex items-center justify-center w-6 h-6 rounded transition-all cursor-pointer ${isAllowed
                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-brand text-slate-400'
                                        }`}
                                      title={`Click to ${isAllowed ? 'Disable' : 'Enable'} for ${role.name}`}
                                    >
                                      {isAllowed ? (
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      ) : (
                                        <X className="w-3 h-3 opacity-40" />
                                      )}
                                    </button>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GOVERNANCE AUDIT LOG */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-brand" />
                <span>Security &amp; Governance Audit Log</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Real-time record of all permission assignments, user overrides, and role changes
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Showing last {accessAuditLog.length} events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/60">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {accessAuditLog.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {log.target ? `${log.target.name} (${log.target.role})` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {log.details}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {log.performedBy?.name || 'System'}
                    </td>
                  </tr>
                ))}

                {accessAuditLog.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No security audit events recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOM ROLE MODAL */}
      {/* ========================================================================= */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {editingRole ? 'Edit Operational Role' : 'Create Custom Operational Role'}
              </h3>
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRoleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Architect, QA Auditor, Client Partner"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-brand text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Scope &amp; Mandate Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe operational responsibilities and governance tier..."
                  value={roleForm.desc}
                  onChange={(e) => setRoleForm({ ...roleForm, desc: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-brand text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Operational Status
                </label>
                <select
                  value={roleForm.status}
                  onChange={(e) => setRoleForm({ ...roleForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Deactivated">Deactivated</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs transition-colors"
                >
                  {editingRole ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {confirmModal.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
