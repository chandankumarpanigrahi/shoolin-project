'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderGit2,
  Briefcase,
  CheckSquare,
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
  X,
  Smartphone,
  Download,
  Share
} from 'lucide-react';
import { UserAvatar } from '@/components/common/UserAvatar';
import { RoleBadge } from '@/components/common/Badges';
import { ROLES } from '@/data/permissions';
import { useAppContext } from '@/components/providers/AppProvider';
import { showError } from '@/lib/swal';

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
  const { can, logout, projects = [], tasks = [], meetings = [], dependencies = [], isProjectAccessibleToUser } = useAppContext();
  const [workspace, setWorkspace] = useState('Shoolin Innovations Limited');
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const activeProjects = (projects || []).filter(
    (p) => p && !p.isDeleted && p.status !== 'Deleted' && (isProjectAccessibleToUser ? isProjectAccessibleToUser(p, currentUser) : true)
  );

  const activeTasks = (tasks || []).filter(
    (t) => t && !t.isDeleted && t.status !== 'Deleted'
  );

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(standalone);

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setShowInstallGuide(false);
        }
      } catch (e) {
        setShowInstallGuide((prev) => !prev);
      }
    } else {
      setShowInstallGuide((prev) => !prev);
    }
  };

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
    { id: 'projects', href: '/projects', label: 'Projects', icon: Briefcase, count: activeProjects.length },
    { id: 'tasks', href: '/tasks', label: 'Tasks', icon: CheckSquare, count: activeTasks.length },
    { id: 'roadmap', href: '/roadmap', label: 'Roadmap', icon: CalendarRange, badge: 'Q3-Q4' },
    { id: 'meetings', href: '/meetings', label: 'Meetings', icon: Video, badge: meetings.length ? `${meetings.length}` : undefined },
    { id: 'kpi', href: '/kpi', label: 'KPI Dashboard', icon: BarChart3, perm: 'kpi.view' },
    { id: 'templates', href: '/templates', label: 'Project Templates', icon: Layers, perm: 'templates.view' },
    { id: 'masters', href: '/masters', label: 'Masters Setup', icon: Database, badge: 'Masters', perm: 'masters.access' },
    { id: 'activity-log', href: '/activity-log', label: 'Activity Log', icon: ShieldCheck, badge: 'SuperAdmin', perm: 'masters.access' },
    { id: 'settings', href: '/settings', label: 'Settings', icon: Settings, perm: 'settings.view' },
  ];

  const handleNavClick = (item) => {
    const hasAccess = item.perm ? can(item.perm) : true;
    if (!hasAccess) {
      showError(
        'Access Denied',
        `Your current role (${currentUser?.role || 'User'}) does not have permission to access ${item.label}. Contact your Super Administrator for access.`
      );
      return;
    }
    router.push(item.href);
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
                <span className="font-bold text-slate-100 text-sm sm:text-xs tracking-tight truncate max-w-[130px]">
                  Shoolin Innovations
                </span>
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

          {navItems
            .filter((item) => (item.perm ? can(item.perm) : true))
            .map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-[14px] sm:text-xs font-medium transition-colors cursor-pointer ${active
                    ? 'bg-brand text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
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

        {/* Mobile-Only Install App Button (Above User Details) */}
        {!isStandalone && (
          <div className="block lg:hidden px-3 py-2 border-t border-slate-800/80 bg-slate-900/90 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-brand via-blue-600 to-indigo-600 hover:from-brand-hover hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-white shrink-0" />
                <span>Install App</span>
              </div>
              <Download className="w-3.5 h-3.5 opacity-90 shrink-0" />
            </button>

            {/* Android / iOS Step-by-Step Install Guide */}
            {showInstallGuide && (
              <div className="mt-2 p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-300 space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between font-bold text-white text-xs">
                  <span>Install on {isIOS ? 'iOS (Safari)' : 'Android / Chrome'}</span>
                  <button
                    type="button"
                    onClick={() => setShowInstallGuide(false)}
                    className="text-slate-400 hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {isIOS ? (
                  <p className="leading-snug text-slate-300">
                    1. Tap <Share className="inline w-3.5 h-3.5 mx-0.5 text-brand" /> <strong>Share</strong> in Safari.<br />
                    2. Scroll &amp; tap <strong className="text-white font-semibold">Add to Home Screen</strong>.
                  </p>
                ) : (
                  <p className="leading-snug text-slate-300">
                    1. Tap the browser menu (<strong className="text-white">⋮</strong>) at top right.<br />
                    2. Select <strong className="text-white font-semibold">Add to Home screen</strong> or <strong className="text-white font-semibold">Install App</strong>.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bottom Section: Profile & Auth */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserAvatar user={currentUser} size="sm" />
              <div className="min-w-0 flex flex-col">
                <span className="text-[12px] sm:text-xs font-semibold text-slate-200 truncate">{currentUser.name}</span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 truncate">{currentUser.role}</span>
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
