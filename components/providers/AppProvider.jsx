'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PROJECTS as INITIAL_PROJECTS } from '@/data/projects';
import { INITIAL_TASKS } from '@/data/tasks';
import { USERS as INITIAL_USERS } from '@/data/users';
import { INITIAL_MEETINGS } from '@/data/meetings';
import { INITIAL_DEPENDENCIES } from '@/data/dependencies';
import { INITIAL_LINKS } from '@/data/links';
import { TEMPLATES as INITIAL_TEMPLATES, flattenTreeToTasks, DEFAULT_BLUEPRINT_CATEGORIES } from '@/data/templates';
import { DEFAULT_MASTER_STATUSES, isCompletedStatus as isCompletedStatusHelper } from '@/data/statuses';
import {
  INITIAL_ROLES,
  GRANULAR_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_MODULES
} from '@/data/permissions';
import { getUrlParam, setUrlParam, removeUrlParam } from '@/hooks/useUrlState';
import { api } from '@/lib/api';
import { subscribeToRealtimeEvent, broadcastLocalEvent } from '@/lib/socket';
import { showConfirm, showSuccess, showError } from '@/lib/swal';
import { isTaskAssignee, resolveUserObject } from '@/components/common/UserAvatar';

const AppContext = createContext(null);

export const BRAND_COLOR_PRESETS = [
  { id: 'indigo', name: 'Indigo', primary: '#4f46e5', hover: '#4338ca', active: '#3730a3', light: '#e0e7ff', lightHover: '#c7d2fe', subtle: '#f5f3ff', text: '#4338ca', border: '#c7d2fe' },
  { id: 'blue', name: 'Royal Blue', primary: '#2563eb', hover: '#1d4ed8', active: '#1e40af', light: '#dbeafe', lightHover: '#bfdbfe', subtle: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  { id: 'emerald', name: 'Emerald', primary: '#059669', hover: '#047857', active: '#065f46', light: '#d1fae5', lightHover: '#a7f3d0', subtle: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  { id: 'purple', name: 'Purple', primary: '#9333ea', hover: '#7e22ce', active: '#6b21a8', light: '#f3e8ff', lightHover: '#e9d5ff', subtle: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
  { id: 'rose', name: 'Rose', primary: '#e11d48', hover: '#be123c', active: '#9f1239', light: '#ffe4e6', lightHover: '#fecdd3', subtle: '#fff1f2', text: '#be123c', border: '#fecdd3' },
  { id: 'amber', name: 'Amber', primary: '#d97706', hover: '#b45309', active: '#92400e', light: '#fef3c7', lightHover: '#fde68a', subtle: '#fffbeb', text: '#b45309', border: '#fde68a' },
  { id: 'teal', name: 'Teal', primary: '#0d9488', hover: '#0f766e', active: '#115e59', light: '#ccfbf1', lightHover: '#99f6e4', subtle: '#f0fdfa', text: '#0f766e', border: '#99f6e4' },
];

export const DEFAULT_MASTER_BRANDS = [
  { id: 'br-1', code: 'TCC', name: 'Captains Cafe', color: '#572700', status: 'Active', desc: 'Captains Cafe Master Brand' },
  { id: 'br-2', code: 'INT', name: 'Internal', color: '#516506', status: 'Active', desc: 'Internal engineering & operations' },
  { id: 'br-3', code: 'PMV', name: 'PMV Maritime Solutions', color: '#ad1d41', status: 'Active', desc: 'PMV Maritime Solutions' },
];

export const DEFAULT_MASTER_DEPARTMENTS = [
  { id: 'dep-1', code: 'EXEC', name: 'Executive Operations', status: 'Active' },
  { id: 'dep-2', code: 'OPS', name: 'Project Operations', status: 'Active' },
  { id: 'dep-3', code: 'ENG-BE', name: 'Backend Engineering', status: 'Active' },
  { id: 'dep-4', code: 'ENG-FE', name: 'Frontend Engineering', status: 'Active' },
  { id: 'dep-5', code: 'DESIGN', name: 'UI/UX & Product Design', status: 'Active' },
  { id: 'dep-6', code: 'QA-DEVOPS', name: 'QA & DevOps', status: 'Active' },
];

export const applyBrandColorToDOM = (presetOrHex) => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  let target = BRAND_COLOR_PRESETS.find(
    (p) => p.id === presetOrHex || p.primary.toLowerCase() === presetOrHex?.toLowerCase()
  );

  if (!target && presetOrHex?.startsWith('#')) {
    const primary = presetOrHex;
    target = {
      id: 'custom',
      name: 'Custom Hex',
      primary,
      hover: primary,
      active: primary,
      light: primary + '25',
      lightHover: primary + '40',
      subtle: primary + '15',
      text: primary,
      border: primary + '50',
    };
  }

  if (!target) target = BRAND_COLOR_PRESETS[0];

  root.style.setProperty('--brand-primary', target.primary);
  root.style.setProperty('--brand-hover', target.hover);
  root.style.setProperty('--brand-active', target.active);
  root.style.setProperty('--brand-light', target.light);
  root.style.setProperty('--brand-light-hover', target.lightHover);
  root.style.setProperty('--brand-subtle', target.subtle);
  root.style.setProperty('--brand-text', target.text);
  root.style.setProperty('--brand-border', target.border);
};

const getInitialState = (cacheKey, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(`pulsepm_live_${cacheKey}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        if (cacheKey === 'users') {
          const hasFakeUser = parsed.some(
            (u) =>
              u.name === 'Alex Morgan' ||
              u.name === 'Sarah Connor' ||
              u.name === 'Priya Patel' ||
              u.id === 'usr-1' ||
              u.id === 'usr-chandan'
          );
          if (hasFakeUser) {
            localStorage.removeItem('pulsepm_live_users');
            return fallback;
          }
        }
        return parsed;
      }
    }
  } catch (e) {}
  return fallback;
};

export function AppProvider({ children }) {
  const router = useRouter();

  // Global Data State (Hydrated from live MongoDB local cache to eliminate 1-2s flash on refresh)
  const [projects, setProjectsState] = useState(() => getInitialState('projects', INITIAL_PROJECTS));
  const [tasks, setTasksState] = useState(() => getInitialState('tasks', INITIAL_TASKS));
  const [users, setUsersState] = useState(() => getInitialState('users', INITIAL_USERS));
  const [meetings, setMeetingsState] = useState(() => getInitialState('meetings', INITIAL_MEETINGS));
  const [dependencies, setDependenciesState] = useState(() => getInitialState('dependencies', INITIAL_DEPENDENCIES));
  const [links, setLinksState] = useState(() => getInitialState('links', INITIAL_LINKS));
  const [templates, setTemplatesState] = useState(() => getInitialState('templates', INITIAL_TEMPLATES));

  const setProjects = (val) => {
    setProjectsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('pulsepm_live_projects', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const setTasks = (val) => {
    setTasksState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('pulsepm_live_tasks', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const setUsers = (val) => {
    setUsersState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('pulsepm_live_users', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const setMeetings = (val) => {
    setMeetingsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('pulsepm_live_meetings', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const setDependencies = (val) => {
    setDependenciesState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('pulsepm_live_dependencies', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const setLinks = (val) => {
    setLinksState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('pulsepm_live_links', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const setTemplates = (val) => {
    setTemplatesState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('pulsepm_live_templates', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const [editingTemplate, setEditingTemplate] = useState(null);
  const [blueprintCategories, setBlueprintCategories] = useState(DEFAULT_BLUEPRINT_CATEGORIES);
  const [masterStatuses, setMasterStatuses] = useState(DEFAULT_MASTER_STATUSES);
  const [masterLinkCategories, setMasterLinkCategories] = useState([]);
  const [masterBrands, setMasterBrands] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulsepm_master_brands_v3');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return DEFAULT_MASTER_BRANDS;
  });
  const [masterDepartments, setMasterDepartments] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulsepm_master_deps_v4');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return DEFAULT_MASTER_DEPARTMENTS;
  });

  // Master Datasets CRUD Handlers (Dynamically DB Synced)
  const handleAddMasterBrand = async (brandData) => {
    try {
      const created = await api.masters.createBrand(brandData);
      setMasterBrands((prev) => [...prev, created]);
      broadcastLocalEvent('MASTER_BRANDS_UPDATED', created);
      showSuccess(`Brand "${created.name}" created and synced to DB.`);
      return created;
    } catch (err) {
      showError('Failed to save brand to database: ' + err.message);
    }
  };

  const handleUpdateMasterBrand = async (id, updates) => {
    try {
      const updated = await api.masters.updateBrand(id, updates);
      setMasterBrands((prev) =>
        prev.map((b) => (b.id === id || b._id === id || b.code === id ? { ...b, ...updated } : b))
      );
      broadcastLocalEvent('MASTER_BRANDS_UPDATED', updated);
      showSuccess(`Brand "${updated.name || id}" updated in DB.`);
      return updated;
    } catch (err) {
      showError('Failed to update brand in database: ' + err.message);
    }
  };

  const handleDeleteMasterBrand = async (id) => {
    try {
      await api.masters.deleteBrand(id);
      setMasterBrands((prev) => prev.filter((b) => b.id !== id && b._id !== id && b.code !== id));
      broadcastLocalEvent('MASTER_BRANDS_UPDATED', { id });
      showSuccess('Brand removed from DB.');
    } catch (err) {
      showError('Failed to delete brand from database: ' + err.message);
    }
  };

  const saveMasterBrands = (items) => {
    setMasterBrands(items);
    if (typeof window !== 'undefined') localStorage.setItem('pulsepm_master_brands_v3', JSON.stringify(items));
  };

  const handleAddMasterDepartment = async (depData) => {
    try {
      const created = await api.masters.createDepartment(depData);
      setMasterDepartments((prev) => [...prev, created]);
      broadcastLocalEvent('MASTER_DEPARTMENTS_UPDATED', created);
      showSuccess(`Department "${created.name}" created and synced to DB.`);
      return created;
    } catch (err) {
      showError('Failed to save department to database: ' + err.message);
    }
  };

  const handleUpdateMasterDepartment = async (id, updates) => {
    try {
      const updated = await api.masters.updateDepartment(id, updates);
      setMasterDepartments((prev) =>
        prev.map((d) => (d.id === id || d._id === id || d.code === id ? { ...d, ...updated } : d))
      );
      broadcastLocalEvent('MASTER_DEPARTMENTS_UPDATED', updated);
      showSuccess(`Department "${updated.name || id}" updated in DB.`);
      return updated;
    } catch (err) {
      showError('Failed to update department in database: ' + err.message);
    }
  };

  const handleDeleteMasterDepartment = async (id) => {
    try {
      await api.masters.deleteDepartment(id);
      setMasterDepartments((prev) => prev.filter((d) => d.id !== id && d._id !== id && d.code !== id));
      broadcastLocalEvent('MASTER_DEPARTMENTS_UPDATED', { id });
      showSuccess('Department removed from DB.');
    } catch (err) {
      showError('Failed to delete department from database: ' + err.message);
    }
  };

  const saveMasterDepartments = (items) => {
    setMasterDepartments(items);
    if (typeof window !== 'undefined') localStorage.setItem('pulsepm_master_deps_v4', JSON.stringify(items));
  };

  const handleAddMasterStatus = async (statusData) => {
    try {
      const created = await api.masters.createStatus(statusData);
      setMasterStatuses((prev) => [...prev, created]);
      broadcastLocalEvent('MASTER_STATUSES_UPDATED', created);
      showSuccess(`Status "${created.name}" created and synced to DB.`);
      return created;
    } catch (err) {
      showError('Failed to save status to database: ' + err.message);
    }
  };

  const handleUpdateMasterStatus = async (id, updates) => {
    try {
      const updated = await api.masters.updateStatus(id, updates);
      setMasterStatuses((prev) =>
        prev.map((s) => (s.id === id || s._id === id || s.name === id ? { ...s, ...updated } : s))
      );
      broadcastLocalEvent('MASTER_STATUSES_UPDATED', updated);
      showSuccess(`Status "${updated.name || id}" updated in DB.`);
      return updated;
    } catch (err) {
      showError('Failed to update status in database: ' + err.message);
    }
  };

  const handleDeleteMasterStatus = async (id) => {
    try {
      await api.masters.deleteStatus(id);
      setMasterStatuses((prev) => prev.filter((s) => s.id !== id && s._id !== id && s.name !== id));
      broadcastLocalEvent('MASTER_STATUSES_UPDATED', { id });
      showSuccess('Status removed from DB.');
    } catch (err) {
      showError('Failed to delete status from database: ' + err.message);
    }
  };

  const saveMasterStatuses = (items) => {
    setMasterStatuses(items);
    if (typeof window !== 'undefined') localStorage.setItem('pulsepm_master_statuses_v2', JSON.stringify(items));
  };

  const handleAddBlueprintCategory = async (catData) => {
    try {
      const created = await api.masters.createCategory(catData);
      setBlueprintCategories((prev) => [...prev, created]);
      broadcastLocalEvent('TEMPLATE_CATEGORIES_UPDATED', created);
      showSuccess(`Category "${created.name}" created and synced to DB.`);
      return created;
    } catch (err) {
      showError('Failed to save template category: ' + err.message);
    }
  };

  const handleUpdateBlueprintCategory = async (idOrObj, updates) => {
    try {
      const id = typeof idOrObj === 'object' ? idOrObj.id || idOrObj._id || idOrObj.name : idOrObj;
      const payload = typeof idOrObj === 'object' ? idOrObj : updates;
      const updated = await api.masters.updateCategory(id, payload);
      setBlueprintCategories((prev) =>
        prev.map((c) => (c.id === id || c._id === id || c.name === id ? { ...c, ...updated } : c))
      );
      broadcastLocalEvent('TEMPLATE_CATEGORIES_UPDATED', updated);
      showSuccess(`Category "${updated.name || id}" updated in DB.`);
      return updated;
    } catch (err) {
      showError('Failed to update category in database: ' + err.message);
    }
  };

  const handleDeleteBlueprintCategory = async (id) => {
    try {
      await api.masters.deleteCategory(id);
      setBlueprintCategories((prev) => prev.filter((c) => c.id !== id && c._id !== id && c.name !== id));
      broadcastLocalEvent('TEMPLATE_CATEGORIES_UPDATED', { id });
      showSuccess('Template category removed from DB.');
    } catch (err) {
      showError('Failed to delete category from database: ' + err.message);
    }
  };

  const saveBlueprintCategories = (items) => {
    setBlueprintCategories(items);
  };

  const handleAddLinkCategory = async (catData) => {
    try {
      const created = await api.masters.createLinkCategory(catData);
      setMasterLinkCategories((prev) => [...prev, created]);
      broadcastLocalEvent('LINK_CATEGORIES_UPDATED', created);
      showSuccess(`Link Category "${created.name}" created and synced to DB.`);
      return created;
    } catch (err) {
      showError('Failed to save link category to database: ' + err.message);
    }
  };

  const handleUpdateLinkCategory = async (id, updates) => {
    try {
      const updated = await api.masters.updateLinkCategory(id, updates);
      setMasterLinkCategories((prev) =>
        prev.map((c) => (c.id === id || c._id === id || c.name === id ? { ...c, ...updated } : c))
      );
      broadcastLocalEvent('LINK_CATEGORIES_UPDATED', updated);
      showSuccess(`Link Category "${updated.name || id}" updated in DB.`);
      return updated;
    } catch (err) {
      showError('Failed to update link category in database: ' + err.message);
    }
  };

  const handleDeleteLinkCategory = async (id) => {
    try {
      await api.masters.deleteLinkCategory(id);
      setMasterLinkCategories((prev) => prev.filter((c) => c.id !== id && c._id !== id && c.name !== id));
      broadcastLocalEvent('LINK_CATEGORIES_UPDATED', { id });
      showSuccess('Link category removed from DB.');
    } catch (err) {
      showError('Failed to delete link category from database: ' + err.message);
    }
  };

  const saveMasterLinkCategories = (items) => {
    setMasterLinkCategories(items);
  };

  // Links CRUD Handlers (Dynamically DB Synced)
  const handleAddLink = async (linkData) => {
    try {
      const created = await api.links.create(linkData);
      const linkItem = created || linkData;
      setLinks((prev) => [linkItem, ...prev]);
      broadcastLocalEvent('link_created', linkItem);
      showSuccess(`Resource link "${linkItem.name}" pinned successfully.`);
      return linkItem;
    } catch (err) {
      console.error('Failed to create link in DB:', err);
      setLinks((prev) => [linkData, ...prev]);
      broadcastLocalEvent('link_created', linkData);
      return linkData;
    }
  };

  const handleUpdateLink = async (linkData) => {
    const targetId = linkData.id || linkData._id;
    try {
      const updated = await api.links.update(targetId, linkData);
      const linkItem = updated || linkData;
      setLinks((prev) =>
        prev.map((l) => (l.id === targetId || l._id === targetId ? { ...l, ...linkItem } : l))
      );
      broadcastLocalEvent('link_updated', linkItem);
      showSuccess(`Link "${linkItem.name}" updated.`);
      return linkItem;
    } catch (err) {
      console.error('Failed to update link in DB:', err);
      setLinks((prev) =>
        prev.map((l) => (l.id === targetId || l._id === targetId ? { ...l, ...linkData } : l))
      );
      return linkData;
    }
  };

  const handleDeleteLink = async (linkId) => {
    const confirmed = await showConfirm({
      title: 'Delete Resource Link?',
      text: 'This link will be permanently removed.',
      confirmButtonText: 'Yes, Delete Link',
    });
    if (!confirmed) return;

    try {
      await api.links.delete(linkId);
      setLinks((prev) => prev.filter((l) => l.id !== linkId && l._id !== linkId));
      broadcastLocalEvent('link_deleted', { id: linkId });
      showSuccess('Resource link deleted.');
    } catch (err) {
      console.error('Failed to delete link from DB:', err);
      setLinks((prev) => prev.filter((l) => l.id !== linkId && l._id !== linkId));
    }
  };

  const handleAddRole = async (roleData) => {
    try {
      const created = await api.masters.createRole(roleData);
      setRolesList((prev) => [...prev, created]);
      broadcastLocalEvent('ROLES_UPDATED', created);
      showSuccess(`Role "${created.name}" created and synced to DB.`);
      return created;
    } catch (err) {
      showError('Failed to save role to database: ' + err.message);
    }
  };

  const handleUpdateRole = async (id, updates) => {
    try {
      const updated = await api.masters.updateRole(id, updates);
      setRolesList((prev) =>
        prev.map((r) => (r.id === id || r._id === id || r.name === id ? { ...r, ...updated } : r))
      );
      broadcastLocalEvent('ROLES_UPDATED', updated);
      showSuccess(`Role "${updated.name || id}" updated in DB.`);
      return updated;
    } catch (err) {
      showError('Failed to update role in database: ' + err.message);
    }
  };

  const handleDeleteRole = async (id) => {
    try {
      await api.masters.deleteRole(id);
      setRolesList((prev) => prev.filter((r) => r.id !== id && r._id !== id && r.name !== id));
      broadcastLocalEvent('ROLES_UPDATED', { id });
      showSuccess('Role removed from DB.');
    } catch (err) {
      showError('Failed to delete role from database: ' + err.message);
    }
  };

  const saveRoles = (items) => {
    setRolesList(items);
    if (typeof window !== 'undefined') localStorage.setItem('pulsepm_master_roles_v2', JSON.stringify(items));
  };

  // Tit-to-Bit Access Control & Roles State
  const [rolesList, setRolesList] = useState(INITIAL_ROLES);
  const [rolePermissions, setRolePermissionsState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pulsepm_role_permissions_v3');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_ROLE_PERMISSIONS;
  });
  const [userOverrides, setUserOverridesState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pulsepm_user_overrides_v3');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  const setRolePermissions = (val) => {
    setRolePermissionsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('pulsepm_role_permissions_v3', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const setUserOverrides = (val) => {
    setUserOverridesState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('pulsepm_user_overrides_v3', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const [accessAuditLog, setAccessAuditLog] = useState([]);

  const [notifications, setNotificationsState] = useState([]);

  const setNotifications = (val) => {
    setNotificationsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      return next;
    });
  };

  // Active User & Session (Zero-flash synchronous hydration)
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('pulsepm_current_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed && (parsed.id || parsed._id)) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_USERS[0] || { id: 'admin-1', name: 'Primary Admin', email: 'admin@shoolin.co.uk', role: 'Super Admin' };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pulsepm_is_authenticated') === 'true';
    }
    return false;
  });

  const [authLoaded, setAuthLoaded] = useState(false);

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState('light');

  // Brand Color State (Class & CSS Custom Properties Based)
  const [brandColor, setBrandColorState] = useState('indigo');

  useEffect(() => {
    setAuthLoaded(true);
    try {
      const savedTheme = localStorage.getItem('pulsepm_theme');
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }

      // Load saved brand color from localStorage
      const savedBrandColor = localStorage.getItem('pulsepm_brand_color');
      if (savedBrandColor) {
        setBrandColorState(savedBrandColor);
        applyBrandColorToDOM(savedBrandColor);
      } else {
        applyBrandColorToDOM('indigo');
      }

      // Sync live collections directly from MongoDB backend
      const loadLiveMongoDBData = async () => {
        try {
          const [
            dbProjects,
            dbTasks,
            dbMeetings,
            dbDeps,
            dbLinks,
            dbUsers,
            dbTemplates,
            dbStatuses,
            dbBrands,
            dbDepartments,
            dbRoles,
            dbRbacMatrix,
            dbUserOverrides,
            dbAuditLogs,
            dbNotifications,
            dbTemplateCategories,
            dbLinkCategories,
          ] = await Promise.all([
            api.projects.getAll({ includeDeleted: true }).catch(() => null),
            api.tasks.getAll(null, { includeDeletedProjects: true }).catch(() => null),
            api.meetings.getAll().catch(() => null),
            api.dependencies.getAll().catch(() => null),
            api.links.getAll().catch(() => null),
            api.users.getAll().catch(() => null),
            api.templates.getAll().catch(() => null),
            api.statuses.getAll().catch(() => null),
            api.masters.getBrands().catch(() => null),
            api.masters.getDepartments().catch(() => null),
            api.roles.getAll().catch(() => null),
            api.rbac.getMatrix().catch(() => null),
            api.rbac.getUserOverrides().catch(() => null),
            api.rbac.getAuditLog().catch(() => null),
            api.notifications.getAll().catch(() => null),
            api.masters.getCategories().catch(() => null),
            api.masters.getLinkCategories().catch(() => null),
          ]);

          if (Array.isArray(dbProjects) && dbProjects.length > 0) {
            const normalizedProjects = dbProjects.map((p) => ({
              ...p,
              ownerId: p.ownerId || p.owner,
              owner: p.ownerId || p.owner,
              managerId: p.managerId || p.manager,
              manager: p.managerId || p.manager,
              teamIds: p.teamIds || p.team || [],
              team: p.teamIds || p.team || [],
            }));
            setProjects(normalizedProjects);
          }
          if (Array.isArray(dbTasks) && dbTasks.length > 0) {
            setTasks(dbTasks);
          }
          if (Array.isArray(dbMeetings)) {
            setMeetings(dbMeetings);
          }
          if (Array.isArray(dbDeps) && dbDeps.length > 0) {
            setDependencies(dbDeps);
          }
          if (Array.isArray(dbLinks)) {
            setLinks(dbLinks);
          }
          if (Array.isArray(dbUsers) && dbUsers.length > 0) {
            setUsers(dbUsers);
            setCurrentUser((prev) => {
              if (!prev) return dbUsers[0];
              const match = dbUsers.find(
                (u) =>
                  u.id === prev.id ||
                  u._id === prev.id ||
                  u._id === prev._id ||
                  (u.email && prev.email && u.email.toLowerCase() === prev.email.toLowerCase()) ||
                  (u.name && prev.name && u.name.toLowerCase() === prev.name.toLowerCase())
              );
              const merged = match ? { ...prev, ...match } : prev;
              try { localStorage.setItem('pulsepm_current_user', JSON.stringify(merged)); } catch (e) {}
              return merged;
            });
          }
          if (Array.isArray(dbTemplates) && dbTemplates.length > 0) {
            setTemplates(dbTemplates);
          }
          if (Array.isArray(dbStatuses) && dbStatuses.length > 0) setMasterStatuses(dbStatuses);
          if (Array.isArray(dbBrands) && dbBrands.length > 0) {
            setMasterBrands(dbBrands);
            try { localStorage.setItem('pulsepm_master_brands_v3', JSON.stringify(dbBrands)); } catch (e) {}
          }
          if (Array.isArray(dbDepartments) && dbDepartments.length > 0) setMasterDepartments(dbDepartments);
          if (Array.isArray(dbRoles) && dbRoles.length > 0) setRolesList(dbRoles);
          if (Array.isArray(dbTemplateCategories) && dbTemplateCategories.length > 0) setBlueprintCategories(dbTemplateCategories);
          if (Array.isArray(dbLinkCategories) && dbLinkCategories.length > 0) setMasterLinkCategories(dbLinkCategories);
          if (dbRbacMatrix && typeof dbRbacMatrix === 'object' && Object.keys(dbRbacMatrix).length > 0) {
            setRolePermissions(dbRbacMatrix);
          }
          if (dbUserOverrides && typeof dbUserOverrides === 'object') {
            setUserOverrides(dbUserOverrides);
          }
          if (Array.isArray(dbAuditLogs) && dbAuditLogs.length > 0) {
            setAccessAuditLog(dbAuditLogs);
          }
          if (Array.isArray(dbNotifications)) {
            setNotifications(dbNotifications);
          }
        } catch (e) {
          console.warn('MongoDB connection fallback to local cache:', e);
        }
      };

      loadLiveMongoDBData();

      // Multi-device Instant Real-Time WebSocket Synchronization Engine
      const unsubProjectCreated = subscribeToRealtimeEvent('project_created', (newProj) => {
        setProjects((prev) => [newProj, ...prev.filter((p) => p.id !== newProj.id && p._id !== newProj._id)]);
      });

      const unsubProjectUpdated = subscribeToRealtimeEvent('project_updated', (updatedProj) => {
        setProjects((prev) =>
          prev.map((p) => (p.id === updatedProj.id || p._id === updatedProj._id ? { ...p, ...updatedProj } : p))
        );
      });

      const unsubProjectDeleted = subscribeToRealtimeEvent('project_deleted', ({ id }) => {
        setProjects((prev) => prev.filter((p) => p.id !== id && p._id !== id));
      });

      const unsubTaskCreated = subscribeToRealtimeEvent('task_created', (newTask) => {
        setTasks((prev) => [newTask, ...prev.filter((t) => t.id !== newTask.id && t._id !== newTask._id)]);
      });

      const unsubTaskUpdated = subscribeToRealtimeEvent('task_updated', (updatedTask) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === updatedTask.id || t._id === updatedTask._id ? { ...t, ...updatedTask } : t))
        );
      });

      const unsubTaskStatus = subscribeToRealtimeEvent('task_status_changed', (updatedTask) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === updatedTask.id || t._id === updatedTask._id ? { ...t, ...updatedTask } : t))
        );
      });

      const unsubTaskDeleted = subscribeToRealtimeEvent('task_deleted', ({ id }) => {
        setTasks((prev) => prev.filter((t) => t.id !== id && t._id !== id));
      });

      const unsubMeetingCreated = subscribeToRealtimeEvent('meeting_created', (newMeeting) => {
        setMeetings((prev) => [newMeeting, ...prev.filter((m) => m.id !== newMeeting.id && m._id !== newMeeting._id)]);
      });

      const unsubMeetingUpdated = subscribeToRealtimeEvent('meeting_updated', (updatedMeeting) => {
        setMeetings((prev) =>
          prev.map((m) => (m.id === updatedMeeting.id || m._id === updatedMeeting._id ? { ...m, ...updatedMeeting } : m))
        );
      });

      const unsubMeetingDeleted = subscribeToRealtimeEvent('meeting_deleted', ({ id }) => {
        setMeetings((prev) => prev.filter((m) => m.id !== id && m._id !== id));
      });

      const unsubNotificationReceived = subscribeToRealtimeEvent('notification_received', (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id && n._id !== newNotif._id)]);
      });

      const unsubDepCreated = subscribeToRealtimeEvent('dependency_created', (newDep) => {
        setDependencies((prev) => [newDep, ...prev.filter((d) => d.id !== newDep.id && d._id !== newDep._id)]);
      });

      const unsubDepUpdated = subscribeToRealtimeEvent('dependency_updated', (updatedDep) => {
        setDependencies((prev) =>
          prev.map((d) => (d.id === updatedDep.id || d._id === updatedDep._id ? { ...d, ...updatedDep } : d))
        );
      });

      const unsubLinkCreated = subscribeToRealtimeEvent('link_created', (newLink) => {
        setLinks((prev) => [newLink, ...prev.filter((l) => l.id !== newLink.id && l._id !== newLink._id)]);
      });

      const unsubLinkUpdated = subscribeToRealtimeEvent('link_updated', (updatedLink) => {
        setLinks((prev) =>
          prev.map((l) => (l.id === updatedLink.id || l._id === updatedLink._id ? { ...l, ...updatedLink } : l))
        );
      });

      const unsubLinkDeleted = subscribeToRealtimeEvent('link_deleted', ({ id }) => {
        setLinks((prev) => prev.filter((l) => l.id !== id && l._id !== id));
      });

      const unsubTemplateCreated = subscribeToRealtimeEvent('template_created', (newTmpl) => {
        setTemplates((prev) => [newTmpl, ...prev.filter((t) => t.id !== newTmpl.id && t._id !== newTmpl._id)]);
      });

      const unsubTemplateUpdated = subscribeToRealtimeEvent('template_updated', (updatedTmpl) => {
        setTemplates((prev) =>
          prev.map((t) => (t.id === updatedTmpl.id || t._id === updatedTmpl._id ? { ...t, ...updatedTmpl } : t))
        );
      });

      const unsubTemplateDeleted = subscribeToRealtimeEvent('template_deleted', ({ id }) => {
        setTemplates((prev) => prev.filter((t) => t.id !== id && t._id !== id));
      });

      const unsubRbacMatrix = subscribeToRealtimeEvent('rbac_matrix_updated', ({ roleName, permissions }) => {
        setRolePermissions((prev) => ({ ...prev, [roleName]: permissions }));
      });

      const unsubRbacUser = subscribeToRealtimeEvent('rbac_user_overrides_updated', ({ userId, permissions }) => {
        setUserOverrides((prev) => ({ ...prev, [userId]: permissions }));
      });

      const unsubRbacUserDelete = subscribeToRealtimeEvent('rbac_user_overrides_deleted', ({ userId }) => {
        setUserOverrides((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      });

      const unsubUserCreated = subscribeToRealtimeEvent('user_created', (newUser) => {
        if (!newUser) return;
        setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id && u._id !== newUser._id)]);
      });

      const unsubUserUpdated = subscribeToRealtimeEvent('user_updated', (updatedUser) => {
        if (!updatedUser) return;
        const targetId = updatedUser.id || updatedUser._id || updatedUser.clientTempId;
        const targetEmail = updatedUser.email ? updatedUser.email.toLowerCase() : '';

        setUsers((prev) =>
          prev.map((u) => {
            const isMatch =
              (targetId && (u.id === targetId || u._id === targetId || (updatedUser.clientTempId && u.id === updatedUser.clientTempId))) ||
              (targetEmail && u.email && u.email.toLowerCase() === targetEmail);
            return isMatch ? { ...u, ...updatedUser } : u;
          })
        );
        setCurrentUser((prev) => {
          if (!prev) return prev;
          const isMatch =
            (targetId && (prev.id === targetId || prev._id === targetId || (updatedUser.clientTempId && prev.id === updatedUser.clientTempId))) ||
            (targetEmail && prev.email && prev.email.toLowerCase() === targetEmail);
          if (isMatch) {
            // If the current user's account has been restricted, log them out
            const restrictedStatuses = ['Deactivated', 'Archived', 'Inactive', 'Disabled'];
            if (updatedUser.status && restrictedStatuses.includes(updatedUser.status)) {
              logout(`Your account has been ${updatedUser.status.toLowerCase()} by an administrator.`);
              return prev;
            }
            const merged = { ...prev, ...updatedUser };
            try { localStorage.setItem('pulsepm_current_user', JSON.stringify(merged)); } catch (e) {}
            return merged;
          }
          return prev;
        });
      });

      const unsubUserDeleted = subscribeToRealtimeEvent('user_deleted', (payload) => {
        const deletedId = payload?.id || payload?._id;
        const deletedEmail = payload?.userEmail;
        setUsers((prev) => prev.filter((u) => u.id !== deletedId && u._id !== deletedId));
        // If the currently logged-in user was deleted, log them out immediately
        setCurrentUser((prev) => {
          if (!prev) return prev;
          const isMe = (deletedId && (prev.id === deletedId || prev._id === deletedId)) ||
            (deletedEmail && prev.email && prev.email.toLowerCase() === deletedEmail.toLowerCase());
          if (isMe) {
            logout('Your account has been removed by an administrator.');
          }
          return prev;
        });
      });

      const unsubUserSessionTerminated = subscribeToRealtimeEvent('user_session_terminated', (payload) => {
        if (!payload) return;
        setCurrentUser((prev) => {
          if (!prev) return prev;
          const targetId = payload.userId;
          const targetEmail = payload.userEmail;
          const isMe = (targetId && (prev.id === targetId || prev._id === targetId)) ||
            (targetEmail && prev.email && prev.email.toLowerCase() === targetEmail.toLowerCase());
          if (isMe) {
            logout(payload.reason || 'Your account has been restricted by an administrator.');
          }
          return prev;
        });
      });

      const unsubMasterBrands = subscribeToRealtimeEvent('MASTER_BRANDS_UPDATED', async () => {
        const fresh = await api.masters.getBrands().catch(() => null);
        if (Array.isArray(fresh)) setMasterBrands(fresh);
      });

      const unsubMasterDepartments = subscribeToRealtimeEvent('MASTER_DEPARTMENTS_UPDATED', async () => {
        const fresh = await api.masters.getDepartments().catch(() => null);
        if (Array.isArray(fresh)) setMasterDepartments(fresh);
      });

      const unsubMasterStatuses = subscribeToRealtimeEvent('MASTER_STATUSES_UPDATED', async () => {
        const fresh = await api.masters.getStatuses().catch(() => null);
        if (Array.isArray(fresh)) setMasterStatuses(fresh);
      });

      const unsubTemplateCategories = subscribeToRealtimeEvent('TEMPLATE_CATEGORIES_UPDATED', async () => {
        const fresh = await api.masters.getCategories().catch(() => null);
        if (Array.isArray(fresh)) setBlueprintCategories(fresh);
      });

      const unsubLinkCategories = subscribeToRealtimeEvent('LINK_CATEGORIES_UPDATED', async () => {
        const fresh = await api.masters.getLinkCategories().catch(() => null);
        if (Array.isArray(fresh)) setMasterLinkCategories(fresh);
      });

      const unsubRoles = subscribeToRealtimeEvent('ROLES_UPDATED', async () => {
        const fresh = await api.masters.getRoles().catch(() => null);
        if (Array.isArray(fresh)) setRolesList(fresh);
      });

      // Load active user session from localStorage
      const savedUser = localStorage.getItem('pulsepm_current_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.id) {
          setCurrentUser(parsedUser);
        }
      }
      // Check authentication session
      const savedAuth = localStorage.getItem('pulsepm_is_authenticated');
      if (savedAuth === 'true') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setAuthLoaded(true);

      const handleStorageChange = (e) => {
        if (!e.key || !e.newValue) return;
        try {
          if (e.key === 'pulsepm_live_projects') setProjectsState(JSON.parse(e.newValue));
          else if (e.key === 'pulsepm_live_tasks') setTasksState(JSON.parse(e.newValue));
          else if (e.key === 'pulsepm_live_users') setUsersState(JSON.parse(e.newValue));
          else if (e.key === 'pulsepm_live_meetings') setMeetingsState(JSON.parse(e.newValue));
          else if (e.key === 'pulsepm_live_dependencies') setDependenciesState(JSON.parse(e.newValue));
          else if (e.key === 'pulsepm_live_links') setLinksState(JSON.parse(e.newValue));
          else if (e.key === 'pulsepm_live_templates') setTemplatesState(JSON.parse(e.newValue));
          else if (e.key === 'pulsepm_is_authenticated') setIsAuthenticated(e.newValue === 'true');
          else if (e.key === 'pulsepm_session_terminated_broadcast') {
            const data = JSON.parse(e.newValue);
            const mySessId = localStorage.getItem('pulsepm_session_id');
            if (data.allOthers && mySessId !== data.exceptSessionId) {
              logout('Your session was remotely terminated by an administrator.');
            } else if (data.sessionId && data.sessionId === mySessId) {
              logout('Your session was remotely terminated by an administrator.');
            }
          }
        } catch (err) {}
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        unsubProjectCreated();
        unsubProjectUpdated();
        unsubProjectDeleted();
        unsubTaskCreated();
        unsubTaskUpdated();
        unsubTaskStatus();
        unsubTaskDeleted();
        unsubMeetingCreated();
        unsubMeetingDeleted();
        unsubDepCreated();
        unsubDepUpdated();
        unsubLinkCreated();
        unsubLinkUpdated();
        unsubLinkDeleted();
        unsubTemplateCreated();
        unsubTemplateUpdated();
        unsubTemplateDeleted();
        unsubUserCreated();
        unsubUserUpdated();
        unsubUserDeleted();
        unsubUserSessionTerminated();
        unsubMasterBrands();
        unsubMasterDepartments();
        unsubMasterStatuses();
        unsubTemplateCategories();
        unsubLinkCategories();
        unsubRoles();
        unsubRbacMatrix();
        unsubRbacUser();
        unsubRbacUserDelete();
      };
    } catch (e) {
      console.error('Theme, users, templates, statuses or permissions init error:', e);
    }
  }, []);

  // Multi-Device & Multi-User Rapid Delta Synchronization Engine
  useEffect(() => {
    let isPolling = false;
    let lastSyncTimestamp = Date.now() - 60000;

    const pollSyncEvents = async () => {
      if (isPolling) return;
      isPolling = true;

      try {
        const res = await api.realtime.getEvents(lastSyncTimestamp);
        if (res && res.events && Array.isArray(res.events) && res.events.length > 0) {
          for (const ev of res.events) {
            if (ev.timestamp && ev.timestamp > lastSyncTimestamp) {
              lastSyncTimestamp = ev.timestamp;
            }
            // Trigger local bus which invokes all subscribeToRealtimeEvent callbacks in memory
            broadcastLocalEvent(ev.event, ev.payload);
          }
        }
        if (res && res.serverTime) {
          lastSyncTimestamp = Math.max(lastSyncTimestamp, res.serverTime - 4000);
        }
      } catch (e) {
        // Silently continue polling
      } finally {
        isPolling = false;
      }
    };

    const pollInterval = setInterval(pollSyncEvents, 1500);

    const onFocus = () => pollSyncEvents();
    window.addEventListener('focus', onFocus);
    const onVisChange = () => {
      if (document.visibilityState === 'visible') pollSyncEvents();
    };
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, []);

  const logout = (reason = null) => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('pulsepm_is_authenticated');
      localStorage.removeItem('pulsepm_jwt_token');
      localStorage.removeItem('pulsepm_current_user');
      localStorage.removeItem('pulsepm_session_id');
      if (reason && typeof window !== 'undefined') {
        sessionStorage.setItem('pulsepm_termination_notice', reason);
      }
    } catch (e) {}
    if (reason && typeof window !== 'undefined') {
      showError('Session Ended', reason);
    }
    router.push('/login?reason=terminated');
  };

  // Active session liveness verification (auto-detect remote termination or 30-day expiry)
  useEffect(() => {
    if (!isAuthenticated) return;

    let lastCheckTime = 0;
    let isChecking = false;

    const checkCurrentSession = async (force = false) => {
      const now = Date.now();
      if (!force && now - lastCheckTime < 1500) return; // throttle to 1.5s
      if (isChecking) return;

      const sessId = typeof window !== 'undefined' ? localStorage.getItem('pulsepm_session_id') : null;

      isChecking = true;
      lastCheckTime = now;

      try {
        const res = await api.sessions.check(sessId);
        if (res && res.active === false) {
          logout(res.message || 'Your session was remotely terminated by an administrator or has expired.');
        }
      } catch (err) {
        if (
          err?.message?.includes('401') ||
          err?.message?.includes('403') ||
          err?.message?.toLowerCase().includes('terminated') ||
          err?.message?.toLowerCase().includes('expired') ||
          err?.message?.toLowerCase().includes('restricted') ||
          err?.message?.toLowerCase().includes('deactivated')
        ) {
          logout(err.message || 'Your session was remotely terminated by an administrator or has expired.');
        }
      } finally {
        isChecking = false;
      }
    };

    // Instant verification on mount and rapid check every 2 seconds for immediate termination
    checkCurrentSession(true);
    const interval = setInterval(() => checkCurrentSession(true), 2000);

    // Also check on window focus, tab visibility change, and user interaction
    const onActivity = () => checkCurrentSession(false);
    window.addEventListener('focus', () => checkCurrentSession(true));
    const onVisChange = () => {
      if (document.visibilityState === 'visible') checkCurrentSession(true);
    };
    document.addEventListener('visibilitychange', onVisChange);
    window.addEventListener('click', onActivity);
    window.addEventListener('keydown', onActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', () => checkCurrentSession(true));
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('click', onActivity);
      window.removeEventListener('keydown', onActivity);
    };
  }, [isAuthenticated]);


  const changeBrandColor = (colorPresetOrHex) => {
    setBrandColorState(colorPresetOrHex);
    applyBrandColorToDOM(colorPresetOrHex);
    try {
      localStorage.setItem('pulsepm_brand_color', colorPresetOrHex);
    } catch (e) {
      console.error('Failed to save brand color preference:', e);
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const nextTheme = prevTheme === 'dark' ? 'light' : 'dark';
      try {
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('pulsepm_theme', nextTheme);
      } catch (e) {
        console.error('Theme toggle error:', e);
      }
      return nextTheme;
    });
  };

  // DP (Display Picture) state and handlers
  const [dpTargetUser, setDpTargetUser] = useState(null);

  const openChangeDpModal = (user = null) => {
    setDpTargetUser(user || currentUser);
    setUrlParam('modal', 'change-dp');
    setIsChangeDpOpen(true);
  };

  const updateCurrentUserAvatar = (newAvatarUrl) => {
    const target = dpTargetUser || currentUser;
    if (target.id === currentUser.id) {
      setCurrentUser((prev) => ({ ...prev, avatar: newAvatarUrl }));
    }
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === target.id ? { ...u, avatar: newAvatarUrl } : u))
    );
  };

  // UI State & Sidebar Toggle
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const isMobileOpen = isSidebarOpen;
  const setIsMobileOpen = setIsSidebarOpen;

  // Personal To-Do State (per currentUser, synced with DB)
  const [personalTodos, setPersonalTodos] = useState([]);
  const [isPersonalTodoOpen, setIsPersonalTodoOpenState] = useState(false);

  const currentUserId = currentUser?.id || currentUser?._id;
  const currentUserEmail = currentUser?.email;

  // Load user's personal todos from database on mount or user switch
  useEffect(() => {
    let isMounted = true;
    if (!currentUserId && !currentUserEmail) return;

    // Load from cache first for zero flicker
    if (typeof window !== 'undefined' && currentUserId) {
      try {
        const stored = localStorage.getItem(`pulsepm_todos_${currentUserId}`);
        if (stored) setPersonalTodos(JSON.parse(stored));
      } catch (e) {}
    }

    // Load from MongoDB database
    api.personalTodos
      .getAll(currentUserId, currentUserEmail)
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data)) {
          setPersonalTodos(data);
          if (typeof window !== 'undefined' && currentUserId) {
            localStorage.setItem(`pulsepm_todos_${currentUserId}`, JSON.stringify(data));
          }
        }
      })
      .catch((err) => {
        console.warn('Could not fetch personal todos from DB:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUserId, currentUserEmail]);

  // Subscribe to realtime personal todo events across tabs and devices
  useEffect(() => {
    if (!currentUserId && !currentUserEmail) return;

    const unsubCreated = subscribeToRealtimeEvent('PERSONAL_TODO_CREATED', (newTodo) => {
      if (!newTodo) return;
      if (newTodo.userId === currentUserId || newTodo.userEmail === currentUserEmail) {
        setPersonalTodos((prev) => {
          if (prev.some((t) => (t.id === newTodo.id || t._id === newTodo.id || t._id === newTodo._id))) return prev;
          const next = [newTodo, ...prev];
          if (typeof window !== 'undefined' && currentUserId) {
            localStorage.setItem(`pulsepm_todos_${currentUserId}`, JSON.stringify(next));
          }
          return next;
        });
      }
    });

    const unsubUpdated = subscribeToRealtimeEvent('PERSONAL_TODO_UPDATED', (updated) => {
      if (!updated) return;
      setPersonalTodos((prev) => {
        const next = prev.map((t) =>
          (t.id === updated.id || t._id === updated.id || t._id === updated._id) ? { ...t, ...updated } : t
        );
        if (typeof window !== 'undefined' && currentUserId) {
          localStorage.setItem(`pulsepm_todos_${currentUserId}`, JSON.stringify(next));
        }
        return next;
      });
    });

    const unsubDeleted = subscribeToRealtimeEvent('PERSONAL_TODO_DELETED', ({ id }) => {
      if (!id) return;
      setPersonalTodos((prev) => {
        const next = prev.filter((t) => t.id !== id && t._id !== id);
        if (typeof window !== 'undefined' && currentUserId) {
          localStorage.setItem(`pulsepm_todos_${currentUserId}`, JSON.stringify(next));
        }
        return next;
      });
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [currentUserId, currentUserEmail]);

  const addPersonalTodo = async (text, category = 'Focus') => {
    if (!text?.trim()) return;
    const tempId = 'temp-' + Date.now();
    const optimistic = {
      id: tempId,
      _id: tempId,
      userId: String(currentUserId || 'anonymous'),
      userEmail: currentUserEmail || '',
      text: text.trim(),
      completed: false,
      category,
      createdAt: new Date().toISOString()
    };
    const nextList = [optimistic, ...personalTodos];
    setPersonalTodos(nextList);
    if (typeof window !== 'undefined' && currentUserId) {
      localStorage.setItem(`pulsepm_todos_${currentUserId}`, JSON.stringify(nextList));
    }

    try {
      const created = await api.personalTodos.create({
        userId: String(currentUserId || 'anonymous'),
        userEmail: currentUserEmail || '',
        text: text.trim(),
        completed: false,
        category,
      });
      setPersonalTodos((prev) =>
        prev.map((t) => (t.id === tempId ? { ...created, id: created.id || created._id } : t))
      );
    } catch (err) {
      console.error('Failed to create personal todo in DB:', err);
    }
  };

  const togglePersonalTodo = async (todoId) => {
    const target = personalTodos.find((t) => (t.id === todoId || t._id === todoId));
    if (!target) return;
    const newCompleted = !target.completed;
    const nextList = personalTodos.map((t) =>
      (t.id === todoId || t._id === todoId) ? { ...t, completed: newCompleted } : t
    );
    setPersonalTodos(nextList);
    if (typeof window !== 'undefined' && currentUserId) {
      localStorage.setItem(`pulsepm_todos_${currentUserId}`, JSON.stringify(nextList));
    }

    const realId = target._id || target.id;
    if (realId && !String(realId).startsWith('temp-')) {
      try {
        await api.personalTodos.update(realId, { completed: newCompleted });
      } catch (err) {
        console.error('Failed to update personal todo in DB:', err);
      }
    }
  };

  const deletePersonalTodo = async (todoId) => {
    const target = personalTodos.find((t) => (t.id === todoId || t._id === todoId));
    const nextList = personalTodos.filter((t) => t.id !== todoId && t._id !== todoId);
    setPersonalTodos(nextList);
    if (typeof window !== 'undefined' && currentUserId) {
      localStorage.setItem(`pulsepm_todos_${currentUserId}`, JSON.stringify(nextList));
    }

    const realId = target?._id || target?.id;
    if (realId && !String(realId).startsWith('temp-')) {
      try {
        await api.personalTodos.delete(realId);
      } catch (err) {
        console.error('Failed to delete personal todo in DB:', err);
      }
    }
  };

  // Modals Visibility with URL State Synchronization
  const [isSearchOpen, setIsSearchOpenState] = useState(false);
  const [isAuthOpen, setIsAuthOpenState] = useState(false);
  const [isChangeDpOpen, setIsChangeDpOpenState] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpenState] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpenState] = useState(false);
  const [isTaskDrawerOpen, setIsTaskDrawerOpenState] = useState(false);
  const [isScheduleMeetingOpen, setIsScheduleMeetingOpenState] = useState(false);
  const [isAddDependencyOpen, setIsAddDependencyOpenState] = useState(false);
  const [isAddLinkOpen, setIsAddLinkOpenState] = useState(false);
  const [isTemplateWorkflowOpen, setIsTemplateWorkflowOpenState] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpenState] = useState(false);

  const setIsSearchOpen = (open) => {
    setIsSearchOpenState(open);
    if (open) {
      if (getUrlParam('modal') !== 'search') setUrlParam('modal', 'search');
    } else {
      if (getUrlParam('modal') === 'search') removeUrlParam('modal');
    }
  };

  const setIsAuthOpen = (open) => {
    setIsAuthOpenState(open);
    if (open) {
      if (getUrlParam('modal') !== 'auth') setUrlParam('modal', 'auth');
    } else {
      if (getUrlParam('modal') === 'auth' || getUrlParam('modal') === 'switch-user') removeUrlParam('modal');
    }
  };

  const setIsChangeDpOpen = (open) => {
    setIsChangeDpOpenState(open);
    if (open) {
      if (getUrlParam('modal') !== 'change-dp') setUrlParam('modal', 'change-dp');
    } else {
      if (getUrlParam('modal') === 'change-dp') removeUrlParam('modal');
    }
  };

  const [projectToEdit, setProjectToEdit] = useState(null);

  const setIsCreateProjectOpen = (open) => {
    setIsCreateProjectOpenState(open);
    if (!open) setProjectToEdit(null);
    if (open) {
      if (getUrlParam('modal') !== 'create-project') setUrlParam('modal', 'create-project');
    } else {
      if (getUrlParam('modal') === 'create-project') removeUrlParam('modal');
    }
  };

  const setIsCreateTaskOpen = (open) => {
    setIsCreateTaskOpenState(open);
    if (open) {
      if (getUrlParam('modal') !== 'create-task') setUrlParam('modal', 'create-task');
    } else {
      if (getUrlParam('modal') === 'create-task') removeUrlParam('modal');
    }
  };

  const setIsTaskDrawerOpen = (open) => {
    setIsTaskDrawerOpenState(open);
    if (!open && getUrlParam('task')) {
      removeUrlParam('task');
    }
  };

  const setIsScheduleMeetingOpen = (open) => {
    setIsScheduleMeetingOpenState(open);
    if (open) {
      if (getUrlParam('modal') !== 'schedule-meeting') setUrlParam('modal', 'schedule-meeting');
    } else {
      if (getUrlParam('modal') === 'schedule-meeting') removeUrlParam('modal');
    }
  };

  const setIsAddDependencyOpen = (open) => {
    setIsAddDependencyOpenState(open);
    if (open) {
      if (getUrlParam('modal') !== 'add-dependency') setUrlParam('modal', 'add-dependency');
    } else {
      if (getUrlParam('modal') === 'add-dependency') removeUrlParam('modal');
    }
  };

  const setIsAddLinkOpen = (open) => {
    setIsAddLinkOpenState(open);
    if (open) {
      if (getUrlParam('modal') !== 'add-link') setUrlParam('modal', 'add-link');
    } else {
      if (getUrlParam('modal') === 'add-link') removeUrlParam('modal');
    }
  };

  const setIsTemplateWorkflowOpen = (open) => {
    setIsTemplateWorkflowOpenState(open);
    if (open) {
      if (getUrlParam('modal') !== 'template-workflow') setUrlParam('modal', 'template-workflow');
    } else {
      if (getUrlParam('modal') === 'template-workflow') removeUrlParam('modal');
    }
  };

  const setIsCreateTemplateOpen = (open) => {
    setIsCreateTemplateOpenState(open);
    if (open) {
      if (getUrlParam('modal') !== 'create-template') setUrlParam('modal', 'create-template');
    } else {
      if (getUrlParam('modal') === 'create-template') removeUrlParam('modal');
    }
  };

  const setIsPersonalTodoOpen = (open) => {
    setIsPersonalTodoOpenState(open);
    if (open) {
      if (getUrlParam('modal') !== 'todo') setUrlParam('modal', 'todo');
    } else {
      if (getUrlParam('modal') === 'todo') removeUrlParam('modal');
    }
  };

  // Modal Context State
  const [parentTaskForCreation, setParentTaskForCreation] = useState(null);
  const [defaultProjectIdForTask, setDefaultProjectIdForTask] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [selectedTemplateForWorkflow, setSelectedTemplateForWorkflow] = useState(null);
  const [meetingToEdit, setMeetingToEdit] = useState(null);

  const handleOpenEditMeeting = (meeting) => {
    setMeetingToEdit(meeting);
    setIsScheduleMeetingOpen(true);
  };

  // Project Handlers
  const handleSelectProject = (project) => {
    setSelectedProject(project);
    router.push(`/project/${project.id || project._id}`);
  };

  const handleOpenEditProject = (project) => {
    setProjectToEdit(project);
    setIsCreateProjectOpen(true);
  };

  const isProjectAccessibleToUser = (project, user = currentUser) => {
    if (!project) return false;
    if (!user) return true;
    const role = (user.role || '').toLowerCase();
    if (role === 'super admin' || role === 'superadmin') return true;

    const uId = String(user.id || user._id || '').toLowerCase();
    const uEmail = String(user.email || '').toLowerCase();
    const uName = String(user.name || '').toLowerCase();

    // Check creator
    const creator = String(project.createdBy || '').toLowerCase();
    if (creator && (creator === uId || creator === uEmail)) return true;

    // Check owner
    const owner = String(project.ownerId || project.owner || '').toLowerCase();
    if (owner && (owner === uId || owner === uEmail || (uName.includes('chandan') && (owner === 'usr-1' || owner === 'usr-chandan')) || (uName.includes('sasmita') && (owner === 'usr-2' || owner === 'usr-sasmita')))) return true;

    // Check manager
    const manager = String(project.managerId || project.manager || '').toLowerCase();
    if (manager && (manager === uId || manager === uEmail || (uName.includes('chandan') && (manager === 'usr-1' || manager === 'usr-chandan')) || (uName.includes('sasmita') && (manager === 'usr-2' || manager === 'usr-sasmita')))) return true;

    // Check teamIds / squad
    const team = (project.teamIds || project.team || []).map(t => String(t).toLowerCase());
    if (team.includes(uId) || team.includes(uEmail)) return true;
    if (uName.includes('chandan') && (team.includes('usr-1') || team.includes('usr-chandan'))) return true;
    if (uName.includes('sasmita') && (team.includes('usr-2') || team.includes('usr-sasmita'))) return true;

    return false;
  };

  const handleCreateProject = async (newProj) => {
    const creatorVal = currentUser?.id || currentUser?._id || 'admin-1';
    const ownerVal = newProj.ownerId || newProj.owner || creatorVal;
    const managerVal = newProj.managerId || newProj.manager || ownerVal;
    const rawTeam = newProj.teamIds || newProj.team || [];
    const teamVal = Array.from(new Set([creatorVal, ownerVal, managerVal, ...rawTeam])).filter(Boolean);

    const payload = {
      ...newProj,
      createdBy: creatorVal,
      ownerId: ownerVal,
      owner: ownerVal,
      managerId: managerVal,
      manager: managerVal,
      teamIds: teamVal,
      team: teamVal,
    };

    try {
      const created = await api.projects.create(payload);
      const projItem = created
        ? {
            ...created,
            ownerId: created.ownerId || created.owner,
            owner: created.ownerId || created.owner,
            managerId: created.managerId || created.manager,
            manager: created.managerId || created.manager,
            teamIds: created.teamIds || created.team || [],
            team: created.teamIds || created.team || [],
          }
        : payload;
      setProjects((prev) => [projItem, ...prev]);
      broadcastLocalEvent('project_created', projItem);
      return projItem;
    } catch (err) {
      console.error('Failed to create project in MongoDB:', err);
      setProjects((prev) => [payload, ...prev]);
      broadcastLocalEvent('project_created', payload);
      return payload;
    }
  };

  const handleUpdateProject = async (projectId, updates) => {
    const normalizedUpdates = { ...updates };
    if (updates.ownerId || updates.owner) {
      normalizedUpdates.ownerId = updates.ownerId || updates.owner;
      normalizedUpdates.owner = updates.ownerId || updates.owner;
    }
    if (updates.managerId || updates.manager) {
      normalizedUpdates.managerId = updates.managerId || updates.manager;
      normalizedUpdates.manager = updates.managerId || updates.manager;
    }
    if (updates.teamIds || updates.team) {
      const t = updates.teamIds || updates.team;
      normalizedUpdates.teamIds = t;
      normalizedUpdates.team = t;
    }

    try {
      await api.projects.update(projectId, normalizedUpdates);
    } catch (err) {
      console.error('Failed to update project in MongoDB:', err);
    }
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId || p._id === projectId ? { ...p, ...normalizedUpdates } : p
      )
    );
    broadcastLocalEvent('project_updated', { id: projectId, ...normalizedUpdates });
    if (selectedProject?.id === projectId || selectedProject?._id === projectId) {
      setSelectedProject((prev) => (prev ? { ...prev, ...normalizedUpdates } : null));
    }
  };

  const handleDeleteProject = async (projectId, options = {}) => {
    const isPermanent = options.permanent === true;
    try {
      await api.projects.delete(projectId, { permanent: isPermanent });
    } catch (err) {
      console.error('Failed to delete project in MongoDB:', err);
    }
    if (isPermanent) {
      setProjects((prev) =>
        prev.filter((p) => p.id !== projectId && p._id !== projectId && p.code !== projectId)
      );
      setTasks((prev) => prev.filter((t) => t.projectId !== projectId));
      broadcastLocalEvent('project_deleted', { id: projectId });
    } else {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId || p._id === projectId || p.code === projectId
            ? { ...p, isDeleted: true, status: 'Deleted', deletedAt: new Date().toISOString() }
            : p
        )
      );
      broadcastLocalEvent('project_updated', { id: projectId, isDeleted: true, status: 'Deleted' });
    }
    if (selectedProject?.id === projectId || selectedProject?._id === projectId || selectedProject?.code === projectId) {
      setSelectedProject(null);
      router.push('/projects');
    }
  };

  const handleRestoreProject = async (projectId) => {
    try {
      await api.projects.restore(projectId);
    } catch (err) {
      console.error('Failed to restore project in MongoDB:', err);
    }
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId || p._id === projectId || p.code === projectId
          ? { ...p, isDeleted: false, status: 'In Progress', deletedAt: null }
          : p
      )
    );
    broadcastLocalEvent('project_updated', { id: projectId, isDeleted: false, status: 'In Progress', deletedAt: null });
  };

  // Task Handlers
  const handleSelectTask = (task) => {
    setSelectedTask(task);
    if (task) {
      setUrlParam('task', task.id || task.code);
    }
    setIsTaskDrawerOpen(true);
  };

  const handleOpenCreateTask = (parent = null, projectId = null) => {
    setTaskToEdit(null);
    setParentTaskForCreation(parent);
    setDefaultProjectIdForTask(projectId || selectedProject?.id || null);
    setUrlParam('modal', 'create-task');
    setIsCreateTaskOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setTaskToEdit(task);
    setParentTaskForCreation(null);
    setDefaultProjectIdForTask(task?.projectId || selectedProject?.id || null);
    setUrlParam('modal', 'create-task');
    setIsCreateTaskOpen(true);
  };

  const handleCreateTask = async (newTask) => {
    try {
      const created = await api.tasks.create(newTask);
      const taskItem = created || newTask;
      setTasks((prev) => [taskItem, ...prev]);
      broadcastLocalEvent('task_created', taskItem);
    } catch (err) {
      console.error('Failed to create task in MongoDB:', err);
      setTasks((prev) => [newTask, ...prev]);
      broadcastLocalEvent('task_created', newTask);
    }
    if (newTask.projectId) {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === newTask.projectId) {
            const projTasks = [newTask, ...tasks.filter((t) => t.projectId === p.id)];
            const completedCount = projTasks.filter((t) => isCompletedStatus(t.status)).length;
            const progress = projTasks.length > 0 ? Math.round((completedCount / projTasks.length) * 100) : 0;
            return { ...p, tasksCount: projTasks.length, progress };
          }
          return p;
        })
      );
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.tasks.delete(taskId);
    } catch (err) {
      console.error('Failed to delete task in MongoDB:', err);
    }
    const taskToDelete = tasks.find((t) => t.id === taskId);
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(updatedTasks);
    broadcastLocalEvent('task_deleted', { id: taskId });

    if (taskToDelete?.projectId) {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === taskToDelete.projectId) {
            const projTasks = updatedTasks.filter((t) => t.projectId === p.id);
            const completedCount = projTasks.filter((t) => isCompletedStatus(t.status)).length;
            const progress = projTasks.length > 0 ? Math.round((completedCount / projTasks.length) * 100) : 0;
            return { ...p, tasksCount: projTasks.length, progress };
          }
          return p;
        })
      );
    }

    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
      setIsTaskDrawerOpen(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const targetTask = tasks.find((t) => t.id === taskId || t._id === taskId || t.code === taskId);
    if (targetTask && currentUser) {
      if (!isTaskAssignee(targetTask, currentUser, users)) {
        const assigneeObj = resolveUserObject(targetTask.assignedTo, users);
        const assigneeName = assigneeObj?.name || 'the assigned member';
        showError(
          'Access Denied',
          `Only the assigned member (${assigneeName}) can change the status of this task.`
        );
        return;
      }
    }

    try {
      await api.tasks.updateStatus(taskId, newStatus);
    } catch (err) {
      console.error('Failed to update task status in MongoDB:', err);
    }
    let targetProjectId = null;
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId || t._id === taskId || t.code === taskId) {
        targetProjectId = t.projectId;
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTasks(updatedTasks);
    broadcastLocalEvent('task_status_changed', { id: taskId, status: newStatus });
    if (selectedTask && (selectedTask.id === taskId || selectedTask._id === taskId || selectedTask.code === taskId)) {
      setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    // Auto-recalculate project progress dynamically
    if (targetProjectId) {
      const projectTasks = updatedTasks.filter((t) => t.projectId === targetProjectId || t.projectId === targetProjectId);
      if (projectTasks.length > 0) {
        const completedCount = projectTasks.filter((t) => isCompletedStatus(t.status)).length;
        const calculatedProgress = Math.round((completedCount / projectTasks.length) * 100);
        setProjects((prev) => {
          return prev.map((p) =>
            p.id === targetProjectId || p._id === targetProjectId || p.code === targetProjectId
              ? { ...p, progress: calculatedProgress, tasksCount: projectTasks.length }
              : p
          );
        });
        if (selectedProject && (selectedProject.id === targetProjectId || selectedProject._id === targetProjectId)) {
          setSelectedProject((prev) =>
            prev ? { ...prev, progress: calculatedProgress, tasksCount: projectTasks.length } : null
          );
        }
      }
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    const targetTask = tasks.find((t) => t.id === taskId || t._id === taskId || t.code === taskId);
    if (targetTask && currentUser && updates.status !== undefined && updates.status !== targetTask.status) {
      if (!isTaskAssignee(targetTask, currentUser, users)) {
        const assigneeObj = resolveUserObject(targetTask.assignedTo, users);
        const assigneeName = assigneeObj?.name || 'the assigned member';
        showError(
          'Access Denied',
          `Only the assigned member (${assigneeName}) can change the status of this task.`
        );
        return;
      }
    }

    try {
      if (api.tasks && api.tasks.update) {
        await api.tasks.update(taskId, updates);
      }
    } catch (err) {
      console.error('Failed to update task in MongoDB:', err);
    }
    let targetProjectId = null;
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId || t._id === taskId || t.code === taskId) {
        targetProjectId = updates.projectId || t.projectId;
        return { ...t, ...updates };
      }
      return t;
    });
    setTasks(updatedTasks);
    broadcastLocalEvent('task_updated', { id: taskId, ...updates });
    if (selectedTask && (selectedTask.id === taskId || selectedTask._id === taskId || selectedTask.code === taskId)) {
      setSelectedTask((prev) => (prev ? { ...prev, ...updates } : null));
    }

    if (targetProjectId) {
      const projectTasks = updatedTasks.filter((t) => t.projectId === targetProjectId);
      if (projectTasks.length > 0) {
        const completedCount = projectTasks.filter((t) => isCompletedStatus(t.status)).length;
        const calculatedProgress = Math.round((completedCount / projectTasks.length) * 100);
        setProjects((prev) => {
          return prev.map((p) =>
            p.id === targetProjectId || p._id === targetProjectId || p.code === targetProjectId
              ? { ...p, progress: calculatedProgress, tasksCount: projectTasks.length }
              : p
          );
        });
        if (selectedProject && (selectedProject.id === targetProjectId || selectedProject._id === targetProjectId)) {
          setSelectedProject((prev) =>
            prev ? { ...prev, progress: calculatedProgress, tasksCount: projectTasks.length } : null
          );
        }
      }
    }
  };


  const isCompletedStatus = (statusName) => {
    return isCompletedStatusHelper(statusName, masterStatuses);
  };

  const getTaskStatuses = () => {
    return masterStatuses.filter(
      (s) => s.status !== 'Archived' && (s.scope === 'Task' || s.scope === 'Global')
    );
  };

  const toggleTaskComplete = (taskId) => {
    const task = tasks.find((t) => t.id === taskId || t._id === taskId || t.code === taskId);
    if (!task) return;
    if (currentUser && !isTaskAssignee(task, currentUser, users)) {
      const assigneeObj = resolveUserObject(task.assignedTo, users);
      const assigneeName = assigneeObj?.name || 'the assigned member';
      showError(
        'Access Denied',
        `Only the assigned member (${assigneeName}) can change the status of this task.`
      );
      return;
    }
    const targetId = task.id || task._id || taskId;

    if (isCompletedStatus(task.status)) {
      // Return to an active uncompleted status (In Progress or Not Started)
      const activeStatus = masterStatuses.find(
        (s) => (s.scope === 'Task' || s.scope === 'Global') && !s.marksAsCompleted && s.status === 'Active' && (s.behavior === 'inprogress' || s.behavior === 'backlog')
      )?.name || 'In Progress';
      handleUpdateTaskStatus(targetId, activeStatus);
    } else {
      // Mark completed: find first active status with marksAsCompleted: true
      const completedStatus = masterStatuses.find(
        (s) => (s.scope === 'Task' || s.scope === 'Global') && s.marksAsCompleted && s.status === 'Active'
      )?.name || 'Completed';
      handleUpdateTaskStatus(targetId, completedStatus);
    }
  };

  // Meeting Handlers
  const handleScheduleMeeting = async (newMeeting) => {
    const created = await api.meetings.create(newMeeting);
    setMeetings((prev) => [
      created,
      ...prev.filter((m) => m.id !== created.id && m._id !== created._id),
    ]);
    return created;
  };

  const handleUpdateMeeting = async (meetingId, updates) => {
    const updated = await api.meetings.update(meetingId, updates);
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId || m._id === meetingId ? updated : m))
    );
    return updated;
  };

  const handleApproveMeeting = async (meetingId, comments = '') => {
    const updated = await api.meetings.approve(meetingId, comments, currentUser?.name);
    if (updated) {
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === meetingId || m._id === meetingId || m.id === updated.id || m._id === updated.id
            ? { ...m, ...updated, status: 'Approved' }
            : m
        )
      );
    }
    return updated;
  };

  const handleDeclineMeeting = async (meetingId, comments = '') => {
    const updated = await api.meetings.decline(meetingId, comments, currentUser?.name);
    if (updated) {
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === meetingId || m._id === meetingId || m.id === updated.id || m._id === updated.id
            ? { ...m, ...updated, status: 'Declined' }
            : m
        )
      );
    }
    return updated;
  };

  const handleCancelMeeting = async (meetingId, cancelReason = '') => {
    const updated = await api.meetings.cancel(meetingId, cancelReason, currentUser?.name);
    if (updated) {
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === meetingId || m._id === meetingId || m.id === updated.id || m._id === updated.id
            ? { ...m, ...updated, status: 'Cancelled', isArchived: true }
            : m
        )
      );
    }
    return updated;
  };

  const handleRescheduleMeeting = async (meetingId, date, time, comments = '', duration = null, approverId = null, allowConflict = false) => {
    const updated = await api.meetings.reschedule(meetingId, date, time, comments, currentUser?.name, duration, approverId, allowConflict);
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId || m._id === meetingId ? updated : m
      )
    );
    return updated;
  };

  const handleRestoreMeeting = async (meetingId, date = null, time = null) => {
    const updated = await api.meetings.restore(meetingId, { date, time });
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId || m._id === meetingId ? updated : m
      )
    );
    return updated;
  };

  const handleDeleteMeeting = async (meetingId, permanent = false) => {
    const res = await api.meetings.delete(meetingId, permanent);
    if (res?.archived && res?.meeting) {
      setMeetings((prev) =>
        prev.map((m) => (m.id === meetingId || m._id === meetingId ? res.meeting : m))
      );
    } else {
      setMeetings((prev) => prev.filter((m) => m.id !== meetingId && m._id !== meetingId));
    }
    return res;
  };

  const handleAddMeetingComment = async (meetingId, text) => {
    const updated = await api.meetings.addComment(meetingId, text, currentUser?.name, currentUser?.id);
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId || m._id === meetingId ? updated : m
      )
    );
    return updated;
  };

  // Notification Handlers
  const markNotificationRead = async (notifId) => {
    try {
      await api.notifications.markRead(notifId);
    } catch (e) {
      console.error('Failed to mark notification read:', e);
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId || n._id === notifId ? { ...n, unread: false } : n))
    );
  };

  const clearAllNotifications = async () => {
    try {
      await api.notifications.clearAll(currentUser.id);
    } catch (e) {
      console.error('Failed to clear notifications:', e);
    }
    setNotifications((prev) => prev.filter((n) => n.userId !== currentUser.id && n.userId !== 'all'));
  };

  // Dependency Handlers
  const handleAddDependency = (newDep) => {
    setDependencies((prev) => {
      const updated = [newDep, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('pulsepm_dependencies_v1', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleUpdateDependencyStatus = (depId, newStatus) => {
    setDependencies((prev) => {
      const updated = prev.map((d) => (d.id === depId ? { ...d, status: newStatus } : d));
      if (typeof window !== 'undefined') {
        localStorage.setItem('pulsepm_dependencies_v1', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Template Handlers
  const handleOpenCreateFromTemplate = (tmpl = null) => {
    setSelectedTemplateForWorkflow(tmpl);
    setIsTemplateWorkflowOpen(true);
  };

  const handleCreateProjectFromTemplate = (newProj, template = null) => {
    setProjects([newProj, ...projects]);
    const sourceTemplate = template || selectedTemplateForWorkflow;
    if (sourceTemplate?.tasksTree && sourceTemplate.tasksTree.length > 0) {
      const generatedTasks = flattenTreeToTasks(
        sourceTemplate.tasksTree,
        newProj.id,
        newProj.code,
        newProj.defaultStartDate || '2026-09-15',
        newProj.defaultDueDate || '2026-10-30'
      );
      setTasks((prev) => [...generatedTasks, ...prev]);
    }
    handleSelectProject(newProj);
  };

  const handleAddTemplate = async (newTmpl) => {
    try {
      const created = await api.templates.create(newTmpl);
      const item = created || newTmpl;
      setTemplates((prev) => [item, ...prev.filter((t) => t.id !== item.id && t._id !== item._id)]);
      broadcastLocalEvent('template_created', item);
      showSuccess('Template Created!', `Template "${item.name}" created and synced to DB.`);
      return item;
    } catch (err) {
      console.error('Failed to create template in DB:', err);
      showError('Failed to save template to database: ' + err.message);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await api.templates.delete(templateId);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId && t._id !== templateId));
      broadcastLocalEvent('template_deleted', { id: templateId });
      showSuccess('Template Deleted', 'Template removed from DB.');
    } catch (err) {
      console.error('Failed to delete template from DB:', err);
      showError('Failed to delete template from database: ' + err.message);
    }
  };

  const handleUpdateTemplate = async (updatedTmpl) => {
    const targetId = updatedTmpl.id || updatedTmpl._id;
    try {
      const updated = await api.templates.update(targetId, updatedTmpl);
      const item = updated || updatedTmpl;
      setTemplates((prev) =>
        prev.map((t) => (t.id === targetId || t._id === targetId ? { ...t, ...item } : t))
      );
      broadcastLocalEvent('template_updated', item);
      showSuccess('Template Updated!', `Template "${item.name}" updated in DB.`);
      return item;
    } catch (err) {
      console.error('Failed to update template in DB:', err);
      showError('Failed to update template in database: ' + err.message);
    }
  };

  const handleOpenEditTemplate = (tmpl) => {
    setEditingTemplate(tmpl);
    setIsCreateTemplateOpen(true);
  };

  // User CRUD Handlers
  const handleAddUser = async (newUser) => {
    setUsers((prev) => [newUser, ...prev]);
    broadcastLocalEvent('user_created', newUser);
    showSuccess('User Added!', `${newUser.name} added to directory.`);
    try {
      const created = await api.users.create(newUser);
      if (created) {
        setUsers((prev) => prev.map((u) => (u.id === newUser.id ? { ...newUser, ...created } : u)));
        broadcastLocalEvent('user_created', { ...newUser, ...created });
      }
    } catch (e) {
      console.error('Failed to create user in MongoDB', e);
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    const targetId = updatedUser.id || updatedUser._id;
    const targetEmail = updatedUser.email ? updatedUser.email.toLowerCase() : '';

    // Quick local reflect: 0ms UI update
    setUsers((prev) =>
      prev.map((u) => {
        const isMatch =
          (targetId && (u.id === targetId || u._id === targetId)) ||
          (targetEmail && u.email && u.email.toLowerCase() === targetEmail);
        return isMatch ? { ...u, ...updatedUser } : u;
      })
    );

    // Reflect to user session immediately if self is updated
    const isSelf =
      (targetId && (currentUser?.id === targetId || currentUser?._id === targetId)) ||
      (targetEmail && currentUser?.email && currentUser.email.toLowerCase() === targetEmail);

    const restrictedStatuses = ['Deactivated', 'Archived', 'Inactive', 'Disabled'];
    if (isSelf && updatedUser.status && restrictedStatuses.includes(updatedUser.status)) {
      logout(`Your account has been ${updatedUser.status.toLowerCase()} by an administrator.`);
      return;
    }

    if (isSelf) {
      setCurrentUser((prev) => {
        const merged = { ...prev, ...updatedUser };
        try { localStorage.setItem('pulsepm_current_user', JSON.stringify(merged)); } catch (e) {}
        return merged;
      });
    }

    // Broadcast immediately across all open tabs/windows
    broadcastLocalEvent('user_updated', { id: targetId, _id: targetId, userEmail: targetEmail, email: targetEmail, ...updatedUser });

    showSuccess('User Updated', `${updatedUser.name} details saved.`);
    try {
      const serverUpdated = await api.users.update(targetId, updatedUser);
      if (serverUpdated) {
        setUsers((prev) =>
          prev.map((u) => {
            const isMatch =
              (targetId && (u.id === targetId || u._id === targetId)) ||
              (serverUpdated.id && (u.id === serverUpdated.id || u._id === serverUpdated.id)) ||
              (serverUpdated.email && u.email && u.email.toLowerCase() === serverUpdated.email.toLowerCase());
            return isMatch ? { ...u, ...serverUpdated } : u;
          })
        );
      }
    } catch (e) {
      console.error('Failed to update user in MongoDB', e);
    }
  };

  const handleDeleteUser = async (userId) => {
    const targetUser = users.find((u) => u.id === userId || u._id === userId);
    const confirmed = await showConfirm({
      title: `Delete User ${targetUser?.name || ''}?`,
      text: 'This user will be permanently removed from the directory and access privileges revoked.',
      confirmButtonText: 'Yes, Delete User',
    });
    if (!confirmed) return;

    // OPTIMISTIC UPDATE: Instantly remove from UI table (0ms lag)
    setUsers((prev) => prev.filter((u) => u.id !== userId && u._id !== userId));
    broadcastLocalEvent('user_deleted', { id: userId, _id: userId, userEmail: targetUser?.email, email: targetUser?.email });
    showSuccess('User Removed', `${targetUser?.name || 'User'} has been removed.`);

    const isSelf = currentUser && (
      currentUser.id === userId ||
      currentUser._id === userId ||
      (targetUser && currentUser.email && targetUser.email && currentUser.email.toLowerCase() === targetUser.email.toLowerCase())
    );

    if (isSelf) {
      logout('Your account has been removed by an administrator.');
      return;
    }

    try {
      await api.users.delete(userId);
    } catch (e) {
      console.error('Failed to delete user in MongoDB', e);
      if (targetUser) {
        setUsers((prev) => [...prev, targetUser]);
      }
      showError('Delete Failed', 'Could not remove user from database.');
    }
  };

  const handleToggleUserStatus = async (userId, newStatus) => {
    const targetUser = users.find((u) => u.id === userId || u._id === userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId || u._id === userId ? { ...u, status: newStatus } : u))
    );

    const isSelf = currentUser && (
      currentUser.id === userId ||
      currentUser._id === userId ||
      (targetUser && currentUser.email && targetUser.email && currentUser.email.toLowerCase() === targetUser.email.toLowerCase())
    );

    const restrictedStatuses = ['Deactivated', 'Archived', 'Inactive', 'Disabled'];
    if (isSelf && restrictedStatuses.includes(newStatus)) {
      logout(`Your account has been ${newStatus.toLowerCase()} by an administrator.`);
      return;
    } else if (isSelf) {
      setCurrentUser((prev) => ({ ...prev, status: newStatus }));
    }

    broadcastLocalEvent('user_updated', {
      id: userId,
      _id: userId,
      email: targetUser?.email,
      userEmail: targetUser?.email,
      status: newStatus
    });

    showSuccess('User Status Changed', `${targetUser?.name || 'User'} is now ${newStatus}.`);

    try {
      await api.users.update(userId, { status: newStatus });
    } catch (e) {
      console.error('Failed to update user status in MongoDB', e);
    }
  };

  const myProjects = projects.filter(
    (p) => p.owner === currentUser.id || (p.team && p.team.includes(currentUser.id))
  );

  // =========================================================================
  // ACCESS CONTROL & RBAC ENGINE ("TIT TO BIT" GRANULAR PERMISSIONS)
  // =========================================================================

  const addAuditEntry = async (action, details, targetUser = null) => {
    const entry = {
      action,
      details,
      performedBy: currentUser ? currentUser.name || currentUser.id : 'System',
      target: targetUser ? targetUser.name || targetUser.id : '',
      timestamp: new Date().toISOString(),
    };
    try {
      await api.rbac.addAuditLog(entry);
    } catch (e) {
      console.error('Failed to log audit entry to MongoDB', e);
    }
    setAccessAuditLog((prev) => [entry, ...prev].slice(0, 100));
  };

  const checkPermissionValue = (container, key) => {
    if (!container) return undefined;
    if (container[key] !== undefined) return container[key];
    if (key === 'meetings.create' && container['meetings.schedule'] !== undefined) return container['meetings.schedule'];
    if (key === 'meetings.schedule' && container['meetings.create'] !== undefined) return container['meetings.create'];
    if (key === 'meetings.delete' && container['meetings.cancel'] !== undefined) return container['meetings.cancel'];
    if (key === 'meetings.cancel' && container['meetings.delete'] !== undefined) return container['meetings.delete'];
    return undefined;
  };

  const hasPermission = (user, permissionKey) => {
    if (!user) return false;
    const uid = user.id || (user._id ? String(user._id) : '');

    // 1. Check user-specific custom override
    const overrideVal = checkPermissionValue(userOverrides[uid], permissionKey);
    if (overrideVal !== undefined) {
      return !!overrideVal;
    }

    // 2. Check role permissions matrix
    const roleName = user.role;
    const roleVal = checkPermissionValue(rolePermissions[roleName], permissionKey);
    if (roleVal !== undefined) {
      return !!roleVal;
    }

    // 3. Fallback for Super Admin: full access unless explicitly revoked
    if (roleName === 'Super Admin') return true;

    // 4. Default: false
    return false;
  };

  const can = (permissionKey) => {
    return hasPermission(currentUser, permissionKey);
  };

  const getUserPermissionStatus = (user, permissionKey) => {
    if (!user) return { allowed: false, isOverridden: false, type: 'inherited' };
    const uid = user.id || (user._id ? String(user._id) : '');
    const overrideVal = checkPermissionValue(userOverrides[uid], permissionKey);

    if (overrideVal !== undefined) {
      const val = !!overrideVal;
      return {
        allowed: val,
        isOverridden: true,
        type: val ? 'custom_granted' : 'custom_revoked'
      };
    }

    const roleName = user.role;
    const roleVal = checkPermissionValue(rolePermissions[roleName], permissionKey);
    const roleAllowed = roleVal !== undefined
      ? !!roleVal
      : (roleName === 'Super Admin');

    return {
      allowed: roleAllowed,
      isOverridden: false,
      type: roleAllowed ? 'inherited_allowed' : 'inherited_denied'
    };
  };

  const setUserPermissionOverride = async (userId, permissionKey, valueOrNull) => {
    let newOverrides = {};
    setUserOverrides((prev) => {
      const updated = { ...prev };
      if (!updated[userId]) updated[userId] = {};
      else updated[userId] = { ...updated[userId] };

      if (valueOrNull === null || valueOrNull === undefined) {
        delete updated[userId][permissionKey];
        if (Object.keys(updated[userId]).length === 0) {
          delete updated[userId];
        }
      } else {
        updated[userId][permissionKey] = !!valueOrNull;
      }
      newOverrides = updated[userId] || {};
      return updated;
    });

    try {
      if (Object.keys(newOverrides).length === 0) {
        await api.rbac.deleteUserOverride(userId);
      } else {
        await api.rbac.setUserOverride(userId, newOverrides);
      }
    } catch (e) {
      console.error('Failed to sync user override to MongoDB', e);
    }

    const targetUser = users.find((u) => u.id === userId);
    addAuditEntry(
      valueOrNull === null ? 'Revert Override' : (valueOrNull ? 'Grant Override' : 'Revoke Override'),
      `Permission ${permissionKey} set to ${valueOrNull === null ? 'Inherited' : (valueOrNull ? 'Allowed' : 'Denied')}`,
      targetUser
    );
  };

  const bulkSetUserPermissions = async (userId, overrideMap) => {
    let nextMap = {};
    setUserOverrides((prev) => {
      nextMap = { ...(prev[userId] || {}), ...overrideMap };
      return { ...prev, [userId]: nextMap };
    });
    try {
      await api.rbac.setUserOverride(userId, nextMap);
    } catch (e) {
      console.error('Failed to sync bulk user override to MongoDB', e);
    }
    const targetUser = users.find((u) => u.id === userId);
    addAuditEntry('Bulk User Overrides', `Applied bulk permissions to ${targetUser?.name || userId}`, targetUser);
  };

  const resetUserPermissions = async (userId) => {
    setUserOverrides((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
    try {
      await api.rbac.deleteUserOverride(userId);
    } catch (e) {
      console.error('Failed to delete user override in MongoDB', e);
    }
    const targetUser = users.find((u) => u.id === userId);
    addAuditEntry('Reset User Permissions', `Cleared all overrides; restored role defaults for ${targetUser?.name || userId}`, targetUser);
  };

  const setRolePermission = async (roleName, permissionKey, booleanValue) => {
    let updatedRolePerms = {};
    setRolePermissions((prev) => {
      updatedRolePerms = {
        ...(prev[roleName] || {}),
        [permissionKey]: !!booleanValue
      };
      return {
        ...prev,
        [roleName]: updatedRolePerms
      };
    });
    try {
      await api.rbac.updateRolePermissions(roleName, updatedRolePerms);
    } catch (e) {
      console.error('Failed to update role permissions in MongoDB', e);
    }
    addAuditEntry('Modify Role Matrix', `Set ${permissionKey} = ${booleanValue} for role "${roleName}"`);
  };

  const bulkSetRolePermissions = async (roleName, permMap) => {
    let updatedRolePerms = {};
    setRolePermissions((prev) => {
      updatedRolePerms = {
        ...(prev[roleName] || {}),
        ...permMap
      };
      return {
        ...prev,
        [roleName]: updatedRolePerms
      };
    });
    try {
      await api.rbac.updateRolePermissions(roleName, updatedRolePerms);
    } catch (e) {
      console.error('Failed to bulk update role permissions in MongoDB', e);
    }
    addAuditEntry('Bulk Role Update', `Applied bulk matrix changes for role "${roleName}"`);
  };

  const resetAllPermissionsToDefault = () => {
    setRolesList(INITIAL_ROLES);
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    setUserOverrides({});
    try {
      localStorage.setItem('pulsepm_master_roles_v2', JSON.stringify(INITIAL_ROLES));
      localStorage.setItem('pulsepm_role_permissions_v3', JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
      localStorage.setItem('pulsepm_user_overrides_v3', JSON.stringify({}));
    } catch (e) {
      console.error('Failed to reset permissions to default', e);
    }
    addAuditEntry('System Reset', 'All roles and permissions reset to factory defaults');
  };


  const addCustomRole = (newRole) => {
    const updated = [...rolesList, newRole];
    saveRoles(updated);
    // Initialize permissions for new role
    setRolePermissions((prev) => {
      const nextRolePerms = { ...(prev[newRole.name] || {}) };
      GRANULAR_PERMISSIONS.forEach((p) => {
        if (nextRolePerms[p.id] === undefined) {
          nextRolePerms[p.id] = false;
        }
      });
      const updatedPerms = { ...prev, [newRole.name]: nextRolePerms };
      try {
        localStorage.setItem('pulsepm_role_permissions_v3', JSON.stringify(updatedPerms));
      } catch (e) {
        console.error('Failed to save permissions for new role', e);
      }
      return updatedPerms;
    });
    addAuditEntry('Add Custom Role', `Created new operational role "${newRole.name}"`);
  };

  const updateCustomRole = (roleId, updatedRole) => {
    const oldRole = rolesList.find((r) => r.id === roleId);
    const updated = rolesList.map((r) => (r.id === roleId ? { ...r, ...updatedRole } : r));
    saveRoles(updated);

    if (oldRole && oldRole.name !== updatedRole.name) {
      // Migrate role permissions
      setRolePermissions((prev) => {
        const next = { ...prev };
        next[updatedRole.name] = next[oldRole.name] || {};
        delete next[oldRole.name];
        try {
          localStorage.setItem('pulsepm_role_permissions_v3', JSON.stringify(next));
        } catch (e) {
          console.error('Failed to migrate permissions on role rename', e);
        }
        return next;
      });
      // Migrate users
      setUsers((prev) => {
        const nextUsers = prev.map((u) => (u.role === oldRole.name ? { ...u, role: updatedRole.name } : u));
        try {
          localStorage.setItem('pulsepm_users', JSON.stringify(nextUsers));
        } catch (e) {
          console.error('Failed to update users on role rename', e);
        }
        return nextUsers;
      });
    }
    addAuditEntry('Update Role', `Modified role configuration for "${updatedRole.name}"`);
  };

  const deleteCustomRole = (roleId) => {
    const target = rolesList.find((r) => r.id === roleId);
    if (!target) return;
    if (target.isSystem) {
      alert('System primary roles cannot be deleted.');
      return;
    }
    const updated = rolesList.filter((r) => r.id !== roleId);
    saveRoles(updated);

    setRolePermissions((prev) => {
      const next = { ...prev };
      delete next[target.name];
      try {
        localStorage.setItem('pulsepm_role_permissions_v3', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to delete role permissions', e);
      }
      return next;
    });
    addAuditEntry('Delete Role', `Deleted custom role "${target.name}"`);
  };

  // Memoized Active Projects & Task Isolation for deleted projects
  const activeProjects = useMemo(() => {
    return (projects || []).filter((p) => p && !p.isDeleted && p.status !== 'Deleted');
  }, [projects]);

  const activeProjectIdsSet = useMemo(() => {
    const set = new Set();
    activeProjects.forEach((p) => {
      if (p.id) set.add(String(p.id));
      if (p._id) set.add(String(p._id));
      if (p.code) set.add(String(p.code));
    });
    return set;
  }, [activeProjects]);

  const visibleUsers = useMemo(() => {
    return (users || []).filter(
      (u) => u && String(u.role || '').toLowerCase() !== 'super admin' && String(u.role || '').toLowerCase() !== 'superadmin'
    );
  }, [users]);

  const value = {
    // Data
    projects,
    activeProjects,
    tasks,
    allTasks: tasks,
    users: visibleUsers,
    allUsers: users,
    setUsers,
    handleAddUser,
    handleUpdateUser,
    handleDeleteUser,
    handleToggleUserStatus,
    meetings,
    setMeetings,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    handleApproveMeeting,
    handleDeclineMeeting,
    handleRescheduleMeeting,
    handleAddMeetingComment,
    dependencies,
    links,
    setLinks,
    handleAddLink,
    handleUpdateLink,
    handleDeleteLink,
    masterBrands,
    masterLinkCategories,
    templates,
    setTemplates,
    myProjects,
    isProjectAccessibleToUser,

    // Theme (Dark / Light & Brand Color)
    theme,
    toggleTheme,
    brandColor,
    changeBrandColor,
    BRAND_COLOR_PRESETS,

    // User & DP (Display Picture)
    currentUser,
    setCurrentUser,
    isAuthenticated,
    setIsAuthenticated,
    authLoaded,
    logout,
    dpTargetUser,
    openChangeDpModal,
    updateCurrentUserAvatar,

    // Personal To-Do
    personalTodos,
    addPersonalTodo,
    togglePersonalTodo,
    deletePersonalTodo,
    isPersonalTodoOpen,
    setIsPersonalTodoOpen,

    // UI State
    selectedProject,
    setSelectedProject,
    selectedTask,
    setSelectedTask,
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar,
    isMobileOpen,
    setIsMobileOpen,

    // Modals
    isSearchOpen, setIsSearchOpen,
    isAuthOpen, setIsAuthOpen,
    isChangeDpOpen, setIsChangeDpOpen,
    isCreateProjectOpen, setIsCreateProjectOpen,
    isCreateTaskOpen, setIsCreateTaskOpen,
    isTaskDrawerOpen, setIsTaskDrawerOpen,
    isScheduleMeetingOpen, setIsScheduleMeetingOpen,
    isAddDependencyOpen, setIsAddDependencyOpen,
    isAddLinkOpen, setIsAddLinkOpen,
    isTemplateWorkflowOpen, setIsTemplateWorkflowOpen,
    isCreateTemplateOpen, setIsCreateTemplateOpen,

    // Modal context
    parentTaskForCreation,
    defaultProjectIdForTask,
    taskToEdit,
    setTaskToEdit,
    handleOpenEditTask,
    selectedTemplateForWorkflow,
    setSelectedTemplateForWorkflow,
    projectToEdit,
    setProjectToEdit,
    handleOpenEditProject,
    meetingToEdit,
    setMeetingToEdit,
    handleOpenEditMeeting,

    // Handlers
    handleSelectProject,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleRestoreProject,
    handleSelectTask,
    handleOpenCreateTask,
    handleCreateTask,
    handleUpdateTask,
    handleUpdateTaskStatus,
    handleDeleteTask,
    handleScheduleMeeting,
    handleUpdateMeeting,
    handleApproveMeeting,
    handleDeclineMeeting,
    handleCancelMeeting,
    handleRescheduleMeeting,
    handleRestoreMeeting,
    handleDeleteMeeting,
    handleAddMeetingComment,
    handleAddDependency,
    handleUpdateDependencyStatus,
    handleAddLink,
    handleUpdateLink,
    handleDeleteLink,
    handleOpenCreateFromTemplate,
    handleCreateProjectFromTemplate,
    handleAddTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    editingTemplate,
    setEditingTemplate,
    handleOpenEditTemplate,

    // Blueprint / Template Category Master
    blueprintCategories,
    templateCategories: blueprintCategories,
    setBlueprintCategories,
    setTemplateCategories: setBlueprintCategories,
    saveBlueprintCategories,
    saveTemplateCategories: saveBlueprintCategories,
    handleAddBlueprintCategory,
    handleAddTemplateCategory: handleAddBlueprintCategory,
    handleUpdateBlueprintCategory,
    handleUpdateTemplateCategory: handleUpdateBlueprintCategory,
    handleDeleteBlueprintCategory,
    handleDeleteTemplateCategory: handleDeleteBlueprintCategory,

    // Master Brands / Projects
    masterBrands,
    setMasterBrands,
    saveMasterBrands,
    handleAddMasterBrand,
    handleUpdateMasterBrand,
    handleDeleteMasterBrand,

    // Master Departments
    masterDepartments,
    setMasterDepartments,
    saveMasterDepartments,
    handleAddMasterDepartment,
    handleUpdateMasterDepartment,
    handleDeleteMasterDepartment,

    // Master Statuses & Completion Automation
    masterStatuses,
    setMasterStatuses,
    saveMasterStatuses,
    handleAddMasterStatus,
    handleUpdateMasterStatus,
    handleDeleteMasterStatus,
    isCompletedStatus,
    getTaskStatuses,
    toggleTaskComplete,

    // Master Link Categories
    masterLinkCategories,
    setMasterLinkCategories,
    saveMasterLinkCategories,
    handleAddLinkCategory,
    handleUpdateLinkCategory,
    handleDeleteLinkCategory,

    // Master Roles
    rolesList,
    setRolesList,
    saveRoles,
    handleAddRole,
    handleUpdateRole,
    handleDeleteRole,
    addCustomRole,
    updateCustomRole,
    deleteCustomRole,
    rolePermissions,
    setRolePermissions,
    userOverrides,
    setUserOverrides,
    accessAuditLog,
    hasPermission,
    can,
    getUserPermissionStatus,
    setUserPermissionOverride,
    bulkSetUserPermissions,
    resetUserPermissions,
    setRolePermission,
    bulkSetRolePermissions,
    // Theme & Brand Color Architecture
    theme,
    setTheme,
    toggleTheme,
    brandColor,
    setBrandColorState,
    changeBrandColor,
    BRAND_COLOR_PRESETS,

    PERMISSION_MODULES,
    GRANULAR_PERMISSIONS,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
