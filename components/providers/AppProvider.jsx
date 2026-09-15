'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PROJECTS as INITIAL_PROJECTS } from '@/data/projects';
import { INITIAL_TASKS } from '@/data/tasks';
import { USERS as INITIAL_USERS } from '@/data/users';
import { INITIAL_MEETINGS } from '@/data/meetings';
import { INITIAL_DEPENDENCIES } from '@/data/dependencies';
import { INITIAL_LINKS } from '@/data/links';
import { TEMPLATES as INITIAL_TEMPLATES, flattenTreeToTasks } from '@/data/templates';
import { DEFAULT_MASTER_STATUSES, isCompletedStatus as isCompletedStatusHelper } from '@/data/statuses';
import {
  INITIAL_ROLES,
  GRANULAR_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_MODULES
} from '@/data/permissions';

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

export function AppProvider({ children }) {
  const router = useRouter();

  // Global Data State
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [meetings, setMeetings] = useState(INITIAL_MEETINGS);
  const [dependencies, setDependencies] = useState(INITIAL_DEPENDENCIES);
  const [links, setLinks] = useState(INITIAL_LINKS);
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [masterStatuses, setMasterStatuses] = useState(DEFAULT_MASTER_STATUSES);

  // Tit-to-Bit Access Control & Roles State
  const [rolesList, setRolesList] = useState(INITIAL_ROLES);
  const [rolePermissions, setRolePermissions] = useState(DEFAULT_ROLE_PERMISSIONS);
  const [userOverrides, setUserOverrides] = useState({});
  const [accessAuditLog, setAccessAuditLog] = useState([]);

  // Active User & Session
  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState('light');

  // Brand Color State (Class & CSS Custom Properties Based)
  const [brandColor, setBrandColorState] = useState('indigo');

  useEffect(() => {
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

      // Load custom templates from localStorage
      const savedTemplates = localStorage.getItem('pulsepm_custom_templates');
      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTemplates(parsed);
        }
      }

      // Load custom users from localStorage
      const savedUsers = localStorage.getItem('pulsepm_users');
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          setUsers(parsedUsers);
        }
      }

      // Load master statuses from localStorage
      const savedStatuses = localStorage.getItem('pulsepm_master_statuses_v2');
      if (savedStatuses) {
        const parsedStatuses = JSON.parse(savedStatuses);
        if (Array.isArray(parsedStatuses) && parsedStatuses.length > 0) {
          setMasterStatuses(parsedStatuses);
        }
      }

      // Load master roles from localStorage
      const savedRoles = localStorage.getItem('pulsepm_master_roles_v2');
      if (savedRoles) {
        const parsedRoles = JSON.parse(savedRoles);
        if (Array.isArray(parsedRoles) && parsedRoles.length > 0) {
          setRolesList(parsedRoles);
        }
      }

      // Load role permissions matrix from localStorage
      const savedRolePerms = localStorage.getItem('pulsepm_role_permissions_v3');
      if (savedRolePerms) {
        const parsedRolePerms = JSON.parse(savedRolePerms);
        if (parsedRolePerms && typeof parsedRolePerms === 'object') {
          setRolePermissions(parsedRolePerms);
        }
      }

      // Load user-specific overrides from localStorage
      const savedUserOverrides = localStorage.getItem('pulsepm_user_overrides_v3');
      if (savedUserOverrides) {
        const parsedUserOverrides = JSON.parse(savedUserOverrides);
        if (parsedUserOverrides && typeof parsedUserOverrides === 'object') {
          setUserOverrides(parsedUserOverrides);
        }
      }

      // Load access audit log from localStorage
      const savedAudit = localStorage.getItem('pulsepm_access_audit_v1');
      if (savedAudit) {
        const parsedAudit = JSON.parse(savedAudit);
        if (Array.isArray(parsedAudit)) {
          setAccessAuditLog(parsedAudit);
        }
      }

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
    } catch (e) {
      console.error('Theme, users, templates, statuses or permissions init error:', e);
    }
  }, []);

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('pulsepm_is_authenticated');
    } catch (e) {}
    router.push('/login');
  };

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

  // Personal To-Do State (per currentUser)
  const DEFAULT_TODOS = [
    { id: 'todo-1', text: 'Review client sprint deliverables for FreshPod Mobile App', completed: false, category: 'Focus' },
    { id: 'todo-2', text: 'Verify Redis AWS peering security groups & latency', completed: false, category: 'Review' },
    { id: 'todo-3', text: 'Prepare Q3 roadmap slides for executive sync', completed: true, category: 'Prep' },
  ];

  const [personalTodos, setPersonalTodos] = useState(DEFAULT_TODOS);
  const [isPersonalTodoOpen, setIsPersonalTodoOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && currentUser?.id) {
      try {
        const stored = localStorage.getItem(`pulsepm_todos_${currentUser.id}`);
        if (stored) {
          setPersonalTodos(JSON.parse(stored));
        } else {
          setPersonalTodos(DEFAULT_TODOS);
        }
      } catch (e) {
        console.error('Failed to parse personal todos', e);
      }
    }
  }, [currentUser?.id]);

  const saveTodos = (updated) => {
    setPersonalTodos(updated);
    if (typeof window !== 'undefined' && currentUser?.id) {
      localStorage.setItem(`pulsepm_todos_${currentUser.id}`, JSON.stringify(updated));
    }
  };

  const addPersonalTodo = (text, category = 'Focus') => {
    const newItem = {
      id: 'todo-' + Date.now(),
      text,
      completed: false,
      category,
      createdAt: new Date().toISOString()
    };
    saveTodos([newItem, ...personalTodos]);
  };

  const togglePersonalTodo = (todoId) => {
    const updated = personalTodos.map((t) =>
      t.id === todoId ? { ...t, completed: !t.completed } : t
    );
    saveTodos(updated);
  };

  const deletePersonalTodo = (todoId) => {
    const updated = personalTodos.filter((t) => t.id !== todoId);
    saveTodos(updated);
  };

  // Modals Visibility
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isChangeDpOpen, setIsChangeDpOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [isScheduleMeetingOpen, setIsScheduleMeetingOpen] = useState(false);
  const [isAddDependencyOpen, setIsAddDependencyOpen] = useState(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [isTemplateWorkflowOpen, setIsTemplateWorkflowOpen] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);

  // Modal Context State
  const [parentTaskForCreation, setParentTaskForCreation] = useState(null);
  const [defaultProjectIdForTask, setDefaultProjectIdForTask] = useState(null);
  const [selectedTemplateForWorkflow, setSelectedTemplateForWorkflow] = useState(null);

  // Project Handlers
  const handleSelectProject = (project) => {
    setSelectedProject(project);
    router.push(`/project/${project.id}`);
  };

  const handleCreateProject = (newProj) => {
    setProjects([newProj, ...projects]);
  };

  const handleDeleteProject = (projectId) => {
    if (confirm('Are you sure you want to remove this project mandate?')) {
      setProjects(projects.filter((p) => p.id !== projectId));
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        router.push('/projects');
      }
    }
  };

  // Task Handlers
  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setIsTaskDrawerOpen(true);
  };

  const handleOpenCreateTask = (parent = null, projectId = null) => {
    setParentTaskForCreation(parent);
    setDefaultProjectIdForTask(projectId || selectedProject?.id || null);
    setIsCreateTaskOpen(true);
  };

  const handleCreateTask = (newTask) => {
    setTasks([newTask, ...tasks]);
    setProjects(
      projects.map((p) => {
        if (p.id === newTask.projectId) {
          return { ...p, tasksCount: (p.tasksCount || 0) + 1 };
        }
        return p;
      })
    );
  };

  const handleUpdateTaskStatus = (taskId, newStatus) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) return { ...t, status: newStatus };
        return t;
      })
    );
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const saveMasterStatuses = (updated) => {
    setMasterStatuses(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pulsepm_master_statuses_v2', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save master statuses', e);
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
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (isCompletedStatus(task.status)) {
      // Return to an active uncompleted status (In Progress or Not Started)
      const activeStatus = masterStatuses.find(
        (s) => (s.scope === 'Task' || s.scope === 'Global') && !s.marksAsCompleted && s.status === 'Active' && (s.behavior === 'inprogress' || s.behavior === 'backlog')
      )?.name || 'In Progress';
      handleUpdateTaskStatus(taskId, activeStatus);
    } else {
      // Mark completed: find first active status with marksAsCompleted: true
      const completedStatus = masterStatuses.find(
        (s) => (s.scope === 'Task' || s.scope === 'Global') && s.marksAsCompleted && s.status === 'Active'
      )?.name || 'Completed';
      handleUpdateTaskStatus(taskId, completedStatus);
    }
  };

  // Meeting Handlers
  const handleScheduleMeeting = (newMeeting) => {
    setMeetings([newMeeting, ...meetings]);
  };

  // Dependency Handlers
  const handleAddDependency = (newDep) => {
    setDependencies([newDep, ...dependencies]);
  };

  const handleUpdateDependencyStatus = (depId, newStatus) => {
    setDependencies(
      dependencies.map((d) => {
        if (d.id === depId) return { ...d, status: newStatus };
        return d;
      })
    );
  };

  // Link Handlers
  const handleAddLink = (newLink) => {
    setLinks([newLink, ...links]);
  };

  const handleUpdateLink = (updatedLink) => {
    setLinks((prev) => prev.map((l) => (l.id === updatedLink.id ? updatedLink : l)));
  };

  const handleDeleteLink = (linkId) => {
    setLinks(links.filter((l) => l.id !== linkId));
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
      const generatedTasks = flattenTreeToTasks(sourceTemplate.tasksTree, newProj.id, newProj.code);
      setTasks((prev) => [...generatedTasks, ...prev]);
    }
    handleSelectProject(newProj);
  };

  const handleAddTemplate = (newTmpl) => {
    setTemplates((prev) => {
      const updated = [newTmpl, ...prev];
      try {
        localStorage.setItem('pulsepm_custom_templates', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save custom templates', e);
      }
      return updated;
    });
  };

  const handleDeleteTemplate = (templateId) => {
    setTemplates((prev) => {
      const updated = prev.filter((t) => t.id !== templateId);
      try {
        localStorage.setItem('pulsepm_custom_templates', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update templates after delete', e);
      }
      return updated;
    });
  };

  // User CRUD Handlers
  const handleAddUser = (newUser) => {
    setUsers((prev) => {
      const updated = [newUser, ...prev];
      try {
        localStorage.setItem('pulsepm_users', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save users', e);
      }
      return updated;
    });
  };

  const handleUpdateUser = (updatedUser) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      try {
        localStorage.setItem('pulsepm_users', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update user', e);
      }
      return updated;
    });
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId) => {
    setUsers((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      try {
        localStorage.setItem('pulsepm_users', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to delete user', e);
      }
      return updated;
    });
  };

  const handleToggleUserStatus = (userId, newStatus) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));
      try {
        localStorage.setItem('pulsepm_users', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update user status', e);
      }
      return updated;
    });
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const myProjects = projects.filter(
    (p) => p.owner === currentUser.id || (p.team && p.team.includes(currentUser.id))
  );

  // =========================================================================
  // ACCESS CONTROL & RBAC ENGINE ("TIT TO BIT" GRANULAR PERMISSIONS)
  // =========================================================================

  const addAuditEntry = (action, details, targetUser = null) => {
    const entry = {
      id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      performedBy: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentUser.role } : { name: 'System' },
      target: targetUser ? { id: targetUser.id, name: targetUser.name, role: targetUser.role } : null,
      action,
      details
    };
    setAccessAuditLog((prev) => {
      const updated = [entry, ...prev].slice(0, 100);
      try {
        localStorage.setItem('pulsepm_access_audit_v1', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist audit log', e);
      }
      return updated;
    });
  };

  const hasPermission = (user, permissionKey) => {
    if (!user) return false;
    const uid = user.id;

    // 1. Check user-specific custom override
    if (userOverrides[uid] && userOverrides[uid][permissionKey] !== undefined) {
      return !!userOverrides[uid][permissionKey];
    }

    // 2. Check role permissions matrix
    const roleName = user.role;
    if (rolePermissions[roleName] && rolePermissions[roleName][permissionKey] !== undefined) {
      return !!rolePermissions[roleName][permissionKey];
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
    const uid = user.id;
    const hasOverride = userOverrides[uid] && userOverrides[uid][permissionKey] !== undefined;

    if (hasOverride) {
      const val = !!userOverrides[uid][permissionKey];
      return {
        allowed: val,
        isOverridden: true,
        type: val ? 'custom_granted' : 'custom_revoked'
      };
    }

    const roleName = user.role;
    const roleAllowed = rolePermissions[roleName] && rolePermissions[roleName][permissionKey] !== undefined
      ? !!rolePermissions[roleName][permissionKey]
      : (roleName === 'Super Admin');

    return {
      allowed: roleAllowed,
      isOverridden: false,
      type: roleAllowed ? 'inherited_allowed' : 'inherited_denied'
    };
  };

  const setUserPermissionOverride = (userId, permissionKey, valueOrNull) => {
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

      try {
        localStorage.setItem('pulsepm_user_overrides_v3', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save user overrides', e);
      }
      return updated;
    });

    const targetUser = users.find((u) => u.id === userId);
    addAuditEntry(
      valueOrNull === null ? 'Revert Override' : (valueOrNull ? 'Grant Override' : 'Revoke Override'),
      `Permission ${permissionKey} set to ${valueOrNull === null ? 'Inherited' : (valueOrNull ? 'Allowed' : 'Denied')}`,
      targetUser
    );
  };

  const bulkSetUserPermissions = (userId, overrideMap) => {
    setUserOverrides((prev) => {
      const updated = { ...prev, [userId]: { ...(prev[userId] || {}), ...overrideMap } };
      try {
        localStorage.setItem('pulsepm_user_overrides_v3', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save user overrides', e);
      }
      return updated;
    });
    const targetUser = users.find((u) => u.id === userId);
    addAuditEntry('Bulk User Overrides', `Applied bulk permissions to ${targetUser?.name || userId}`, targetUser);
  };

  const resetUserPermissions = (userId) => {
    setUserOverrides((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      try {
        localStorage.setItem('pulsepm_user_overrides_v3', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to reset user overrides', e);
      }
      return updated;
    });
    const targetUser = users.find((u) => u.id === userId);
    addAuditEntry('Reset User Permissions', `Cleared all overrides; restored role defaults for ${targetUser?.name || userId}`, targetUser);
  };

  const setRolePermission = (roleName, permissionKey, booleanValue) => {
    setRolePermissions((prev) => {
      const updated = {
        ...prev,
        [roleName]: {
          ...(prev[roleName] || {}),
          [permissionKey]: !!booleanValue
        }
      };
      try {
        localStorage.setItem('pulsepm_role_permissions_v3', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save role permissions', e);
      }
      return updated;
    });
    addAuditEntry('Modify Role Matrix', `Set ${permissionKey} = ${booleanValue} for role "${roleName}"`);
  };

  const bulkSetRolePermissions = (roleName, permMap) => {
    setRolePermissions((prev) => {
      const updated = {
        ...prev,
        [roleName]: {
          ...(prev[roleName] || {}),
          ...permMap
        }
      };
      try {
        localStorage.setItem('pulsepm_role_permissions_v3', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save role permissions', e);
      }
      return updated;
    });
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

  const saveRoles = (newRoles) => {
    setRolesList(newRoles);
    try {
      localStorage.setItem('pulsepm_master_roles_v2', JSON.stringify(newRoles));
    } catch (e) {
      console.error('Failed to save master roles', e);
    }
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

  const value = {
    // Data
    projects,
    tasks,
    users,
    setUsers,
    handleAddUser,
    handleUpdateUser,
    handleDeleteUser,
    handleToggleUserStatus,
    meetings,
    setMeetings,
    dependencies,
    links,
    templates,
    setTemplates,
    myProjects,

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
    selectedTemplateForWorkflow,
    setSelectedTemplateForWorkflow,

    // Handlers
    handleSelectProject,
    handleCreateProject,
    handleDeleteProject,
    handleSelectTask,
    handleOpenCreateTask,
    handleCreateTask,
    handleUpdateTaskStatus,
    handleScheduleMeeting,
    handleAddDependency,
    handleUpdateDependencyStatus,
    handleAddLink,
    handleUpdateLink,
    handleDeleteLink,
    handleOpenCreateFromTemplate,
    handleCreateProjectFromTemplate,
    handleAddTemplate,
    handleDeleteTemplate,

    // Master Statuses & Completion Automation
    masterStatuses,
    setMasterStatuses,
    saveMasterStatuses,
    isCompletedStatus,
    getTaskStatuses,
    toggleTaskComplete,

    // Tit-to-Bit Access Control & RBAC
    rolesList,
    setRolesList,
    saveRoles,
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
    resetAllPermissionsToDefault,
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
