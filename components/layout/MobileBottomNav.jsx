'use client';

/**
 * components/layout/MobileBottomNav.jsx
 * Persistent bottom navigation bar for mobile users (≤ 1023px).
 * Completely hidden on desktop (lg: breakpoint and above).
 *
 * Shows 5 primary nav items for quick access. Respects Android safe-area-inset-bottom.
 */

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  Target,
  BarChart3,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: Briefcase },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/my-focus', label: 'Focus', icon: Target },
  { href: '/kpi', label: 'KPIs', icon: BarChart3 },
];

export function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href) => pathname.startsWith(href);

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800 flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <button
            key={item.href}
            type="button"
            onClick={() => router.push(item.href)}
            aria-label={`Navigate to ${item.label}`}
            aria-current={active ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-semibold transition-colors min-w-0 ${
              active
                ? 'text-brand'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {/* Active indicator dot above icon */}
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : 'scale-100'}`} />
              {active && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-brand" />
              )}
            </div>
            <span className="truncate leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
