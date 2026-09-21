'use client';

import React from 'react';
import { MastersView } from '@/components/views/MastersView';
import { AccessDeniedView } from '@/components/common/AccessDeniedView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function MastersPage() {
  const { can, authLoaded } = useAppContext();

  if (authLoaded && !can('masters.access')) {
    return (
      <AccessDeniedView
        moduleName="Masters Governance & Setup"
        requiredRole="Super Admin or Admin"
        permissionKey="masters.access"
      />
    );
  }

  return <MastersView />;
}
