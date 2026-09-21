'use client';

import React from 'react';
import { KpiDashboardView } from '@/components/views/KpiDashboardView';
import { AccessDeniedView } from '@/components/common/AccessDeniedView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function KpiPage() {
  const { projects, tasks, users, can, authLoaded } = useAppContext();

  if (authLoaded && !can('kpi.view')) {
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
