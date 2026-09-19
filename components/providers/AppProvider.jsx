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

  // Tit-to-Bit Access Control & Roles State
  const [rolesList, setRolesList] = useState(INITIAL_ROLES);
  const [rolePermissions, setRolePermissions] = useState(DEFAULT_ROLE_PERMISSIONS);
  const [userOverrides, setUserOverrides] = useState({});
  const [accessAuditLog, setAccessAuditLog] = useState([]);

  const [notifications, setNotificationsState] = useState([]);

  const setNotifications = (val) => {
    setNotificationsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      return next;
    });
  };

  // Active User & Session
  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[0] || { id: 'admin-1', name: 'Primary Admin', email: 'admin@shoolin.co.uk', role: 'Super Admin' });
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
            dbNotifications,
          ] = await Promise.all([
            api.projects.getAll({ includeDeleted: true }).catch(() => null),
            api.tasks.getAll(null, { includeDeletedProjects: true }).catch(() => null),
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
            api.notifications.getAll().catch(() => null),
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
          if (Array.isArray(dbMeetings) && dbMeetings.length > 0) {
            setMeetings(dbMeetings);
          }
          if (Array.isArray(dbDeps) && dbDeps.length > 0) {
            setDependencies(dbDeps);
          }
          if (Array.isArray(dbLinks) && dbLinks.length > 0) {
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
                  u.email === prev.email ||
                  (u.name && prev.name && u.name.toLowerCase() === prev.name.toLowerCase())
              );
              return match || dbUsers[0];
            });
          }
          if (Array.isArray(dbTemplates) && dbTemplates.length > 0) {
            setTemplates(dbTemplates);
          }
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
      if (!sessId) return;

      isChecking = true;
      lastCheckTime = now;

      try {
        const res = await api.sessions.check(sessId);
        if (res && res.active === false) {
          logout('Your session was remotely terminated by an administrator or has expired.');
        }
      } catch (err) {
        if (err?.message?.includes('401') || err?.message?.includes('terminated') || err?.message?.includes('expired')) {
          logout('Your session was remotely terminated by an administrator or has expired.');
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
    if (role.includes('admin') || role === 'super admin') return true;

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
      return projItem;
    } catch (err) {
      console.error('Failed to create project in MongoDB:', err);
      setProjects((prev) => [payload, ...prev]);
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
    } else {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId || p._id === projectId || p.code === projectId
            ? { ...p, isDeleted: true, status: 'Deleted', deletedAt: new Date().toISOString() }
            : p
        )
      );
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
      if (t.id === taskId || t._id === taskId || t.code === taskId) {
        targetProjectId = t.projectId;
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTasks(updatedTasks);
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
    const task = tasks.find((t) => t.id === taskId || t._id === taskId || t.code === taskId);
    if (!task) return;
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
    try {
      const created = await api.meetings.create(newMeeting);
      const meetingToAdd = created || newMeeting;
      setMeetings((prev) => [
        meetingToAdd,
        ...prev.filter((m) => m.id !== meetingToAdd.id && m._id !== meetingToAdd._id),
      ]);
      return meetingToAdd;
    } catch (e) {
      console.error('Failed to create meeting in MongoDB:', e);
      setMeetings((prev) => [newMeeting, ...prev]);
      return newMeeting;
    }
  };

  const handleUpdateMeeting = async (meetingId, updates) => {
    try {
      const updated = await api.meetings.update(meetingId, updates);
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === meetingId || m._id === meetingId ? { ...m, ...updates, ...(updated || {}) } : m
        )
      );
      return updated;
    } catch (e) {
      console.error('Failed to update meeting:', e);
      setMeetings((prev) =>
        prev.map((m) => (m.id === meetingId || m._id === meetingId ? { ...m, ...updates } : m))
      );
    }
  };

  const handleApproveMeeting = async (meetingId, comments = '') => {
    try {
      await api.meetings.approve(meetingId, comments, currentUser?.name);
    } catch (e) {
      console.error('Failed to approve meeting:', e);
    }
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId || m._id === meetingId
          ? {
              ...m,
              status: 'Approved',
              comments: comments
                ? [
                    ...(m.comments || []),
                    {
                      text: comments,
                      authorName: currentUser?.name || 'Approver',
                      createdAt: new Date().toISOString(),
                    },
                  ]
                : m.comments || [],
            }
          : m
      )
    );
  };

  const handleDeclineMeeting = async (meetingId, comments = '') => {
    try {
      await api.meetings.decline(meetingId, comments, currentUser?.name);
    } catch (e) {
      console.error('Failed to decline meeting:', e);
    }
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId || m._id === meetingId
          ? {
              ...m,
              status: 'Declined',
              comments: comments
                ? [
                    ...(m.comments || []),
                    {
                      text: comments,
                      authorName: currentUser?.name || 'Approver',
                      createdAt: new Date().toISOString(),
                    },
                  ]
                : m.comments || [],
            }
          : m
      )
    );
  };

  const handleRescheduleMeeting = async (meetingId, date, time, comments = '', duration = null) => {
    try {
      await api.meetings.reschedule(meetingId, date, time, comments, currentUser?.name, duration);
    } catch (e) {
      console.error('Failed to reschedule meeting:', e);
    }
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId || m._id === meetingId
          ? {
              ...m,
              date,
              time,
              duration: duration || m.duration || '45 mins',
              status: 'Pending Approval',
              isArchived: false,
              archivedAt: null,
              comments: comments
                ? [
                    ...(m.comments || []),
                    {
                      text: `Rescheduled: ${comments}`,
                      authorName: currentUser?.name || 'User',
                      createdAt: new Date().toISOString(),
                    },
                  ]
                : m.comments || [],
            }
          : m
      )
    );
  };

  const handleRestoreMeeting = async (meetingId, date = null, time = null) => {
    try {
      await api.meetings.restore(meetingId, { date, time });
    } catch (e) {
      console.error('Failed to restore meeting:', e);
    }
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId || m._id === meetingId
          ? {
              ...m,
              ...(date ? { date } : {}),
              ...(time ? { time } : {}),
              status: date ? 'Pending Approval' : 'Approved',
              isArchived: false,
              archivedAt: null,
            }
          : m
      )
    );
  };

  const handleDeleteMeeting = async (meetingId) => {
    try {
      await api.meetings.delete(meetingId);
    } catch (e) {
      console.error('Failed to delete meeting:', e);
    }
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId && m._id !== meetingId));
  };

  const handleAddMeetingComment = async (meetingId, text) => {
    try {
      await api.meetings.addComment(meetingId, text, currentUser?.name, currentUser?.id);
    } catch (e) {
      console.error('Failed to add comment to meeting:', e);
    }
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId || m._id === meetingId
          ? {
              ...m,
              comments: [
                ...(m.comments || []),
                {
                  text,
                  authorName: currentUser?.name || 'User',
                  authorId: currentUser?.id || '',
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : m
      )
    );
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
    setUsers((prev) => [newUser, ...prev]);
    showSuccess('User Added!', `${newUser.name} added to directory.`);
    try {
      const created = await api.users.create(newUser);
      if (created) {
        setUsers((prev) => prev.map((u) => (u.id === newUser.id ? { ...newUser, ...created } : u)));
      }
    } catch (e) {
      console.error('Failed to create user in MongoDB', e);
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    const targetId = updatedUser.id || updatedUser._id;
    setUsers((prev) =>
      prev.map((u) => (u.id === targetId || u._id === targetId ? { ...u, ...updatedUser } : u))
    );
    if (currentUser.id === targetId || currentUser._id === targetId) {
      setCurrentUser((prev) => ({ ...prev, ...updatedUser }));
    }
    showSuccess('User Updated', `${updatedUser.name} details saved.`);
    try {
      await api.users.update(targetId, updatedUser);
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
    showSuccess('User Removed', `${targetUser?.name || 'User'} has been removed.`);

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
    setUsers((prev) =>
      prev.map((u) => (u.id === userId || u._id === userId ? { ...u, status: newStatus } : u))
    );
    if (currentUser.id === userId || currentUser._id === userId) {
      setCurrentUser((prev) => ({ ...prev, status: newStatus }));
    }
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

  const visibleTasks = useMemo(() => {
    return (tasks || []).filter((t) => t && (!t.projectId || activeProjectIdsSet.has(String(t.projectId))));
  }, [tasks, activeProjectIdsSet]);

  const value = {
    // Data
    projects,
    activeProjects,
    tasks: visibleTasks,
    allTasks: tasks,
    users,
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
    handleRestoreMeeting,
    handleDeleteMeeting,
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
