'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
import { subscribeToRealtimeEvent } from '@/lib/socket';
import { showConfirm, showSuccess, showError } from '@/lib/swal';

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
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [blueprintCategories, setBlueprintCategories] = useState(DEFAULT_BLUEPRINT_CATEGORIES);
  const [masterStatuses, setMasterStatuses] = useState(DEFAULT_MASTER_STATUSES);

  // Tit-to-Bit Access Control & Roles State
  const [rolesList, setRolesList] = useState(INITIAL_ROLES);
  const [rolePermissions, setRolePermissions] = useState(DEFAULT_ROLE_PERMISSIONS);
  const [userOverrides, setUserOverrides] = useState({});
  const [accessAuditLog, setAccessAuditLog] = useState([]);

  // Active User & Session
  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

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
            dbRoles,
            dbRbacMatrix,
            dbUserOverrides,
            dbAuditLogs,
          ] = await Promise.all([
            api.projects.getAll().catch(() => null),
            api.tasks.getAll().catch(() => null),
            api.meetings.getAll().catch(() => null),
            api.dependencies.getAll().catch(() => null),
            api.links.getAll().catch(() => null),
            api.users.getAll().catch(() => null),
            api.templates.getAll().catch(() => null),
            api.statuses.getAll().catch(() => null),
            api.roles.getAll().catch(() => null),
            api.rbac.getMatrix().catch(() => null),
            api.rbac.getUserOverrides().catch(() => null),
            api.rbac.getAuditLog().catch(() => null),
          ]);

          if (Array.isArray(dbProjects) && dbProjects.length > 0) setProjects(dbProjects);
          if (Array.isArray(dbTasks) && dbTasks.length > 0) setTasks(dbTasks);
          if (Array.isArray(dbMeetings) && dbMeetings.length > 0) setMeetings(dbMeetings);
          if (Array.isArray(dbDeps) && dbDeps.length > 0) setDependencies(dbDeps);
          if (Array.isArray(dbLinks) && dbLinks.length > 0) setLinks(dbLinks);
          if (Array.isArray(dbUsers) && dbUsers.length > 0) setUsers(dbUsers);
          if (Array.isArray(dbTemplates) && dbTemplates.length > 0) setTemplates(dbTemplates);
          if (Array.isArray(dbStatuses) && dbStatuses.length > 0) setMasterStatuses(dbStatuses);
          if (Array.isArray(dbRoles) && dbRoles.length > 0) setRolesList(dbRoles);
          if (dbRbacMatrix && typeof dbRbacMatrix === 'object' && Object.keys(dbRbacMatrix).length > 0) {
            setRolePermissions(dbRbacMatrix);
          }
          if (dbUserOverrides && typeof dbUserOverrides === 'object') {
            setUserOverrides(dbUserOverrides);
          }
          if (Array.isArray(dbAuditLogs) && dbAuditLogs.length > 0) {
            setAccessAuditLog(dbAuditLogs);
          }
        } catch (e) {
          console.warn('MongoDB connection fallback to local cache:', e);
        }
      };

      loadLiveMongoDBData();
      const syncInterval = setInterval(loadLiveMongoDBData, 5000);

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
        setMeetings((prev) => [newMeeting, ...prev.filter((m) => m.id !== newMeeting.id)]);
      });

      const unsubMeetingDeleted = subscribeToRealtimeEvent('meeting_deleted', ({ id }) => {
        setMeetings((prev) => prev.filter((m) => m.id !== id));
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
        setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id && u._id !== newUser._id)]);
      });

      const unsubUserUpdated = subscribeToRealtimeEvent('user_updated', (updatedUser) => {
        setUsers((prev) =>
          prev.map((u) => (u.id === updatedUser.id || u._id === updatedUser._id ? { ...u, ...updatedUser } : u))
        );
      });

      const unsubUserDeleted = subscribeToRealtimeEvent('user_deleted', ({ id }) => {
        setUsers((prev) => prev.filter((u) => u.id !== id && u._id !== id));
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

      return () => {
        clearInterval(syncInterval);
        unsubProjectCreated();
        unsubProjectUpdated();
        unsubProjectDeleted();
        unsubTaskCreated();
        unsubTaskUpdated();
        unsubTaskStatus();
        unsubTaskDeleted();
        unsubMeetingCreated();
        unsubMeetingDeleted();
        unsubUserCreated();
        unsubUserUpdated();
        unsubUserDeleted();
        unsubRbacMatrix();
        unsubRbacUser();
        unsubRbacUserDelete();
      };
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

  // Personal To-Do State (per currentUser)
  const DEFAULT_TODOS = [
    { id: 'todo-1', text: 'Review client sprint deliverables for FreshPod Mobile App', completed: false, category: 'Focus' },
    { id: 'todo-2', text: 'Verify Redis AWS peering security groups & latency', completed: false, category: 'Review' },
    { id: 'todo-3', text: 'Prepare Q3 roadmap slides for executive sync', completed: true, category: 'Prep' },
  ];

  const [personalTodos, setPersonalTodos] = useState(DEFAULT_TODOS);
  const [isPersonalTodoOpen, setIsPersonalTodoOpenState] = useState(false);

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

  const setIsCreateProjectOpen = (open) => {
    setIsCreateProjectOpenState(open);
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
  const [selectedTemplateForWorkflow, setSelectedTemplateForWorkflow] = useState(null);

  // Project Handlers
  const handleSelectProject = (project) => {
    setSelectedProject(project);
    router.push(`/project/${project.id}`);
  };

  const handleCreateProject = async (newProj) => {
    try {
      const created = await api.projects.create(newProj);
      const projItem = created || newProj;
      setProjects((prev) => [projItem, ...prev]);
    } catch (err) {
      console.error('Failed to create project in MongoDB:', err);
      setProjects((prev) => [newProj, ...prev]);
    }
  };

  const handleUpdateProject = async (projectId, updates) => {
    try {
      await api.projects.update(projectId, updates);
    } catch (err) {
      console.error('Failed to update project in MongoDB:', err);
    }
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p)));
    if (selectedProject?.id === projectId) {
      setSelectedProject((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await api.projects.delete(projectId);
    } catch (err) {
      console.error('Failed to delete project in MongoDB:', err);
    }
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setTasks((prev) => prev.filter((t) => t.projectId !== projectId));
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
      router.push('/projects');
    }
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
    setParentTaskForCreation(parent);
    setDefaultProjectIdForTask(projectId || selectedProject?.id || null);
    setUrlParam('modal', 'create-task');
    setIsCreateTaskOpen(true);
  };

  const handleCreateTask = async (newTask) => {
    try {
      const created = await api.tasks.create(newTask);
      const taskItem = created || newTask;
      setTasks((prev) => [taskItem, ...prev]);
    } catch (err) {
      console.error('Failed to create task in MongoDB:', err);
      setTasks((prev) => [newTask, ...prev]);
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
    try {
      await api.tasks.updateStatus(taskId, newStatus);
    } catch (err) {
      console.error('Failed to update task status in MongoDB:', err);
    }
    let targetProjectId = null;
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        targetProjectId = t.projectId;
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTasks(updatedTasks);
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    // Auto-recalculate project progress dynamically
    if (targetProjectId) {
      const projectTasks = updatedTasks.filter((t) => t.projectId === targetProjectId);
      if (projectTasks.length > 0) {
        const completedCount = projectTasks.filter((t) => isCompletedStatus(t.status)).length;
        const calculatedProgress = Math.round((completedCount / projectTasks.length) * 100);
        setProjects((prev) => {
          const updatedProjects = prev.map((p) =>
            p.id === targetProjectId ? { ...p, progress: calculatedProgress, tasksCount: projectTasks.length } : p
          );
          if (typeof window !== 'undefined') {
            localStorage.setItem('pulsepm_projects_v1', JSON.stringify(updatedProjects));
          }
          return updatedProjects;
        });
        if (selectedProject?.id === targetProjectId) {
          setSelectedProject((prev) =>
            prev ? { ...prev, progress: calculatedProgress, tasksCount: projectTasks.length } : null
          );
        }
      }
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
    setMeetings((prev) => {
      const updated = [newMeeting, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('pulsepm_meetings_v1', JSON.stringify(updated));
      }
      return updated;
    });
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

  // Link Handlers
  const handleAddLink = (newLink) => {
    setLinks((prev) => {
      const updated = [newLink, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('pulsepm_links_v1', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleUpdateLink = (updatedLink) => {
    setLinks((prev) => {
      const updated = prev.map((l) => (l.id === updatedLink.id ? updatedLink : l));
      if (typeof window !== 'undefined') {
        localStorage.setItem('pulsepm_links_v1', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleDeleteLink = (linkId) => {
    setLinks((prev) => {
      const updated = prev.filter((l) => l.id !== linkId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pulsepm_links_v1', JSON.stringify(updated));
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

  const handleUpdateTemplate = (updatedTmpl) => {
    setTemplates((prev) => {
      const updated = prev.map((t) => (t.id === updatedTmpl.id ? updatedTmpl : t));
      try {
        localStorage.setItem('pulsepm_custom_templates', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update template', e);
      }
      return updated;
    });
  };

  const handleOpenEditTemplate = (tmpl) => {
    setEditingTemplate(tmpl);
    setIsCreateTemplateOpen(true);
  };

  // Blueprint Category Master Handlers
  const saveBlueprintCategories = (updated) => {
    setBlueprintCategories(updated);
    try {
      localStorage.setItem('pulsepm_master_blueprint_cats_v1', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save blueprint categories', e);
    }
  };

  const handleAddBlueprintCategory = (newCat) => {
    const updated = [...blueprintCategories, newCat];
    saveBlueprintCategories(updated);
  };

  const handleUpdateBlueprintCategory = (updatedCat) => {
    const updated = blueprintCategories.map((c) => (c.id === updatedCat.id ? updatedCat : c));
    saveBlueprintCategories(updated);
  };

  const handleDeleteBlueprintCategory = (catId) => {
    const updated = blueprintCategories.filter((c) => c.id !== catId);
    saveBlueprintCategories(updated);
  };

  // User CRUD Handlers
  const handleAddUser = async (newUser) => {
    try {
      const created = await api.users.create(newUser);
      const userDoc = created || newUser;
      setUsers((prev) => [userDoc, ...prev.filter((u) => u.id !== userDoc.id && u._id !== userDoc._id)]);
      showSuccess('User Added!', `${newUser.name} added to directory.`);
    } catch (e) {
      console.error('Failed to create user in MongoDB', e);
      setUsers((prev) => [newUser, ...prev]);
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      await api.users.update(updatedUser.id || updatedUser._id, updatedUser);
    } catch (e) {
      console.error('Failed to update user in MongoDB', e);
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id || u._id === updatedUser._id ? { ...u, ...updatedUser } : u))
    );
    if (currentUser.id === updatedUser.id || currentUser._id === updatedUser._id) {
      setCurrentUser((prev) => ({ ...prev, ...updatedUser }));
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

    try {
      await api.users.delete(userId);
      showSuccess('User Removed', 'User has been removed from directory.');
    } catch (e) {
      console.error('Failed to delete user in MongoDB', e);
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId && u._id !== userId));
  };

  const handleToggleUserStatus = async (userId, newStatus) => {
    try {
      await api.users.update(userId, { status: newStatus });
    } catch (e) {
      console.error('Failed to update user status in MongoDB', e);
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId || u._id === userId ? { ...u, status: newStatus } : u))
    );
    if (currentUser.id === userId || currentUser._id === userId) {
      setCurrentUser((prev) => ({ ...prev, status: newStatus }));
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
    selectedTemplateForWorkflow,
    setSelectedTemplateForWorkflow,

    // Handlers
    handleSelectProject,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleSelectTask,
    handleOpenCreateTask,
    handleCreateTask,
    handleUpdateTaskStatus,
    handleDeleteTask,
    handleScheduleMeeting,
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
