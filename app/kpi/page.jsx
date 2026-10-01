'use client';

import React from 'react';
import { KpiDashboardView } from '@/components/views/KpiDashboardView';
import { AccessDeniedView } from '@/components/common/AccessDeniedView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function KpiPage() {
  const { projects, tasks, users, can, authLoaded } = useAppContext();

  if (!authLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!can('kpi.view')) {
    return (
      <AccessDeniedView
        moduleName="KPI Analytics & Telemetry"
        requiredRole="Super Admin, Admin, or Manager / TL"
        permissionKey="kpi.view"
      />
    );
  }

  return (
    <KpiDashboardView
      projects={projects}
      tasks={tasks}
      users={users}
    />
  );
}
