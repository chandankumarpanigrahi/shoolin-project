'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderGit2,
  Briefcase,
  CheckSquare,
  Target,
  CalendarRange,
  Video,
  GitBranch,
  Link2,
  BarChart3,
  Layers,
  Database,
  Users2,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  ShieldCheck,
  Lock,
  X
} from 'lucide-react';
import { UserAvatar } from '@/components/common/UserAvatar';
import { RoleBadge } from '@/components/common/Badges';
import { ROLES } from '@/data/permissions';
import { useAppContext } from '@/components/providers/AppProvider';

export function Sidebar({
  currentUser,
  setCurrentUser,
  allUsers,
  isSidebarOpen,
  setIsSidebarOpen,
  isMobileOpen,
  setIsMobileOpen,
  onOpenCreateProject,
  onOpenCreateTask,
  onOpenAuthModal,
  selectedProject
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { can, logout, projects = [], tasks = [], meetings = [], dependencies = [] } = useAppContext();
  const [workspace, setWorkspace] = useState('Shoolin Innovations Limited');
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const activeIsOpen = isSidebarOpen !== undefined ? isSidebarOpen : isMobileOpen;
  const setOpen = setIsSidebarOpen || setIsMobileOpen;

  const workspaces = [
    'Shoolin Innovations Limited',
    'PMV Maritime Logistics',
    'FreshPod Brands',
    'Lagos Logistics',
  ];

  const navItems = [
    { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-focus', href: '/my-focus', label: 'My Focus', icon: Target, badge: 'Focus' },
    { id: 'my-projects', href: '/my-projects', label: 'My Projects', icon: FolderGit2, badge: 'Personal' },
    { id: 'projects', href: '/projects', label: 'Projects', icon: Briefcase, count: projects.length },
    { id: 'roadmap', href: '/roadmap', label: 'Roadmap', icon: CalendarRange, badge: 'Q3-Q4' },
    { id: 'tasks', href: '/tasks', label: 'Tasks', icon: CheckSquare, count: tasks.length },
    { id: 'meetings', href: '/meetings', label: 'Meetings', icon: Video, badge: meetings.length ? `${meetings.length}` : undefined },
    { id: 'dependencies', href: '/dependencies', label: 'Dependencies', icon: GitBranch, badge: dependencies.length ? `${dependencies.length}` : undefined },
    { id: 'links', href: '/links', label: 'Links', icon: Link2 },
    { id: 'kpi', href: '/kpi', label: 'KPI Dashboard', icon: BarChart3, perm: 'kpi.view' },
    { id: 'templates', href: '/templates', label: 'Project Templates', icon: Layers, perm: 'templates.view' },
    { id: 'masters', href: '/masters', label: 'Masters Setup', icon: Database, badge: 'Masters', perm: 'masters.access' },
    { id: 'settings', href: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (href) => {
    router.push(href);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (setOpen) setOpen(false);
    }
  };

  const handleRoleChange = (role) => {
    const matched = allUsers.find((u) => u.role === role) || { ...currentUser, role };
    setCurrentUser(matched);
    setIsRoleMenuOpen(false);
  };

  const isActive = (href) => {
    const cleanHref = href.split('?')[0];
    if (cleanHref === '/') return pathname === '/';
    return pathname.startsWith(cleanHref);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {activeIsOpen && (
        <div
          onClick={() => setOpen && setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        aria-label="Application sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out ${activeIsOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Top Header: Logo & Close */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Shoolin Innovations Limited"
              className="w-7 h-7 rounded-md object-contain"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-100 text-xs tracking-tight truncate max-w-[130px]">
                  Shoolin Innovations
                </span>
                <span className="text-[9px] px-1 bg-brand-light/20 text-brand-text rounded-sm font-mono font-medium">OS</span>
              </div>
              <span className="text-[10px] text-slate-400 -mt-0.5">Enterprise Operations</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen && setOpen(false)}
            aria-label="Close sidebar"
            className="p-1 text-slate-400 hover:text-white rounded-sm hover:bg-slate-800 transition-colors"
            title="Close / Collapse Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <div
          role="navigation"
          aria-label="Main navigation"
          className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5"
        >
          <div className="px-2.5 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const hasAccess = item.perm ? can(item.perm) : true;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.href)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs font-medium transition-colors ${active
                  ? 'bg-brand text-white shadow-sm font-semibold'
                  : hasAccess
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 opacity-75'
                  }`}
                title={!hasAccess ? `Access restricted by role/overrides: click to view governance` : undefined}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : hasAccess ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!hasAccess && (
                    <Lock className="w-3 h-3 text-amber-500/80" />
                  )}

                  {item.count && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-mono ${active ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                      {item.count}
                    </span>
                  )}

                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-semibold ${active
                      ? 'bg-white/20 text-white'
                      : item.badge === 'SuperAdmin'
                        ? 'bg-brand-light/30 text-brand-text border border-brand-border/40'
                        : item.badge === 'Personal'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Profile & Auth */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserAvatar user={currentUser} size="sm" />
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</span>
                <span className="text-[11px] text-slate-400 truncate">{currentUser.role}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign Out to Login Page"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-sm transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
