'use client';

import React from 'react';
import { ActivityLogView } from '@/components/views/ActivityLogView';
import { AccessDeniedView } from '@/components/common/AccessDeniedView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function ActivityLogPage() {
  const { can, currentUser, authLoaded } = useAppContext();

  const isAllowed =
    currentUser?.role === 'Super Admin' ||
    currentUser?.role === 'Admin' ||
    can('masters.access') ||
    can('access_control.view');

  if (authLoaded && !isAllowed) {
    return (
      <AccessDeniedView
        moduleName="Security Activity Log & Active Sessions"
        requiredRole="Super Admin or Admin"
        permissionKey="masters.access"
      />
    );
  }

  return <ActivityLogView />;
}
