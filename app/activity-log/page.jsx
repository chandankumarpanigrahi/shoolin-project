'use client';

import React from 'react';
import { ActivityLogView } from '@/components/views/ActivityLogView';
import { AccessDeniedView } from '@/components/common/AccessDeniedView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function ActivityLogPage() {
  const { can, currentUser, authLoaded } = useAppContext();

  if (!authLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAllowed =
    currentUser?.role === 'Super Admin' ||
    can('activity_log.view');

  if (!isAllowed) {
    return (
      <AccessDeniedView
        moduleName="Security Activity Log & Active Sessions"
        requiredRole="Super Admin or Admin with activity_log.view"
        permissionKey="activity_log.view"
      />
    );
  }

  return <ActivityLogView />;
}
