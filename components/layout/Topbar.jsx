'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Plus,
  Bell,
  ChevronRight,
  FolderGit2,
  CheckSquare,
  Video,
  Link2,
  ChevronDown,
  Sun,
  Moon,
  Camera,
  Shield,
  Settings,
  Sparkles,
  UserCheck,
  Layers
} from 'lucide-react';
import { UserAvatar } from '@/components/common/UserAvatar';
import { RoleBadge } from '@/components/common/Badges';
import { useAppContext } from '@/components/providers/AppProvider';

export function Topbar({
  selectedProject,
  selectedTask,
  onToggleSidebar,
  onOpenMobileMenu,
  onOpenSearch,
  onOpenCreateProject,
  onOpenCreateTask,
  onOpenCreateMeeting,
  onOpenCreateLink,
  currentUser,
  onOpenAuthModal
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isSidebarOpen,
    toggleSidebar,
    theme,
    toggleTheme,
    setIsChangeDpOpen,
    personalTodos,
    setIsPersonalTodoOpen,
    setIsCreateTemplateOpen,
    can,
    logout
  } = useAppContext();
  const pendingTodosCount = personalTodos?.filter(t => !t.completed)?.length || 0;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const createMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (createMenuRef.current && !createMenuRef.current.contains(e.target)) {
        setIsCreateOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 'n-1',
      title: 'Rahul completed task',
      detail: 'PMV-001.1.1.1 Mobile Viewport Touch Tuning marked complete.',
      time: '12m ago',
      unread: true,
    },
    {
      id: 'n-2',
      title: 'Dependency updated',
      detail: 'David Kim unblocked Redis AWS ElastiCache peering.',
      time: '45m ago',
      unread: true,
    },
    {
      id: 'n-3',
      title: 'Meeting invitation requested',
      detail: 'Client Design Sign-Off requested by Priya Patel.',
      time: '2h ago',
      unread: false,
    },
  ];

  const getBreadcrumbs = () => {
    const list = [{ label: 'Shoolin Innovations', href: '/dashboard' }];

    if (pathname === '/' || pathname === '/dashboard') {
      list.push({ label: 'Dashboard', href: '/dashboard' });
    } else if (pathname === '/my-focus') {
      list.push({ label: 'My Focus', href: '/my-focus' });
    } else if (pathname === '/my-projects') {
      list.push({ label: 'My Projects', href: '/my-projects' });
    } else if (pathname === '/projects') {
      list.push({ label: 'Projects', href: '/projects' });
    } else if (pathname.startsWith('/project/')) {
      list.push({ label: 'Projects', href: '/projects' });
      if (selectedProject) {
        list.push({ label: selectedProject.name, href: `/project/${selectedProject.id}` });
      }
    } else if (pathname === '/tasks') {
      list.push({ label: 'Tasks', href: '/tasks' });
    } else if (pathname === '/roadmap') {
      list.push({ label: 'Roadmap', href: '/roadmap' });
    } else if (pathname === '/meetings') {
      list.push({ label: 'Meetings', href: '/meetings' });
    } else if (pathname === '/dependencies') {
      list.push({ label: 'Dependencies', href: '/dependencies' });
    } else if (pathname === '/links') {
      list.push({ label: 'Shared Links', href: '/links' });
    } else if (pathname === '/kpi') {
      list.push({ label: 'KPI Analytics', href: '/kpi' });
    } else if (pathname === '/templates') {
      list.push({ label: 'Project Templates', href: '/templates' });
    } else if (pathname === '/masters') {
      list.push({ label: 'Masters Setup', href: '/masters' });
    } else if (pathname === '/settings') {
      list.push({ label: 'Settings', href: '/settings' });
    }

    return list;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-800 px-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-none transition-colors duration-150">
      {/* Left: Hamburger menu toggle & breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar || onToggleSidebar || onOpenMobileMenu}
          aria-label={isSidebarOpen ? 'Collapse navigation sidebar' : 'Expand navigation sidebar'}
          aria-expanded={isSidebarOpen}
          className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-brand dark:hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title={isSidebarOpen ? "Collapse Navigation Sidebar" : "Expand Navigation Sidebar"}
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="hidden md:flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 space-x-1 min-w-0">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />}
              <span
                className={`truncate ${idx === breadcrumbs.length - 1
                  ? 'text-slate-900 dark:text-slate-100 font-semibold max-w-[180px] sm:max-w-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hidden sm:inline'
                  }`}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Search, Quick create, 1-Click Dark Mode Toggle, Notifications, Role, Profile DP */}
      <div className="ms-auto flex items-center gap-2 sm:gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Quick search...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-mono px-1 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-xs">
            ⌘K
          </kbd>
        </button>

        {/* Personal To-Do Button */}
        <button
          type="button"
          onClick={() => setIsPersonalTodoOpen(true)}
          title="Personal To-Do Scratchpad & Focus List"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-800 hover:bg-brand-subtle hover:text-brand border border-slate-200 dark:border-slate-700 rounded-lg transition-all shadow-2xs"
        >
          <CheckSquare className="w-3.5 h-3.5 text-brand" />
          <span className="hidden sm:inline">To-Do</span>
          {pendingTodosCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-brand text-white rounded-full">
              {pendingTodosCount}
            </span>
          )}
        </button>

        {/* 1-Click Dark & Light Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode (1-Click)`}
          className="hidden md:flex p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-2xs"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-200" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform duration-200" />
          )}
        </button>

        {/* Quick Create Dropdown */}
        <div className="relative" ref={createMenuRef}>
          <button
            type="button"
            onClick={() => setIsCreateOpen(!isCreateOpen)}
            aria-label="Quick create menu"
            aria-expanded={isCreateOpen}
            aria-haspopup="menu"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown className="w-3 h-3 text-white/80" />
          </button>

          {isCreateOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm shadow-xl py-1 z-40 text-xs">
              {can('tasks.create') && (
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); onOpenCreateTask(); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-brand" />
                  <span>New Task / Subtask</span>
                </button>
              )}
              {can('projects.create') && (
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); onOpenCreateProject(); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                >
                  <FolderGit2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  <span>New Project</span>
                </button>
              )}
              {can('meetings.schedule') && (
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); onOpenCreateMeeting(); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                >
                  <Video className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>Schedule Meeting</span>
                </button>
              )}
              {can('links.create') && (
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); onOpenCreateLink(); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                >
                  <Link2 className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                  <span>Add Shared Link</span>
                </button>
              )}
              {can('templates.create') && (
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); setIsCreateTemplateOpen(true); }}
                  className="w-full text-left px-3 py-2 hover:bg-brand-subtle text-brand flex items-center gap-2 border-t border-slate-100 dark:border-slate-700/60 font-medium"
                >
                  <Layers className="w-3.5 h-3.5 text-brand" />
                  <span>New Template</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-1.5 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm shadow-xl z-40 text-xs">
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Notifications</span>
                <span className="text-[11px] text-brand font-medium cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${n.unread ? 'bg-brand-light/20' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <span className={`font-medium ${n.unread ? 'text-brand font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">{n.detail}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-800/80">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Real-time team audit feed</span>
              </div>
            </div>
          )}
        </div>


        {/* User DP (Display Picture) & Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1.5 p-1 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group focus:outline-none"
            title={`${currentUser.name} (${currentUser.role}) - Click for DP / Profile Menu`}
          >
            <UserAvatar user={currentUser} size="sm" />
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm shadow-2xl z-40 text-xs py-1.5 animate-in fade-in duration-100">
              {/* User Header with DP */}
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <div
                  className="relative group/dp cursor-pointer rounded-full"
                  style={{ borderRadius: '50%' }}
                  onClick={() => { setIsUserMenuOpen(false); setIsChangeDpOpen(true); }}
                >
                  <UserAvatar user={currentUser} size="lg" />
                  <div
                    style={{ borderRadius: '50%' }}
                    className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/dp:opacity-100 flex items-center justify-center transition-opacity text-white"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.email}
                  </p>
                  <span className="inline-block mt-0.5 text-[10px] font-semibold text-brand">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="py-1">
                {/* Change DP button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsChangeDpOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-colors"
                >
                  <Camera className="w-4 h-4 text-brand" />
                  <div>
                    <div className="font-semibold">Update Display Picture (DP)</div>
                    <div className="text-[10px] text-slate-400">Choose preset or upload custom photo</div>
                  </div>
                </button>

                {/* 1-Click Dark/Light Mode toggle */}
                <button
                  type="button"
                  onClick={() => {
                    toggleTheme();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-colors"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-semibold">Switch to Light Mode</div>
                        <div className="text-[10px] text-slate-400">Clean bright theme</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <div>
                        <div className="font-semibold">Switch to Dark Mode</div>
                        <div className="text-[10px] text-slate-400">High contrast dark theme</div>
                      </div>
                    </>
                  )}
                </button>

                {/* Switch Identity / Auth */}
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-colors border-t border-slate-100 dark:border-slate-700/60"
                >
                  <UserCheck className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  <div>
                    <div className="font-semibold">Sign Out / Login Portal</div>
                    <div className="text-[10px] text-slate-400">Return to Shoolin Innovations login screen</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
