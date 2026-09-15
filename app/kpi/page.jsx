'use client';

import React from 'react';
import { KpiDashboardView } from '@/components/views/KpiDashboardView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function KpiPage() {
  const { projects, tasks, users } = useAppContext();

  return (
    <KpiDashboardView
      projects={projects}
      tasks={tasks}
      users={users}
    />
  );
}
