'use client';

import React from 'react';
import { MastersView } from '@/components/views/MastersView';
import { AccessDeniedView } from '@/components/common/AccessDeniedView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function MastersPage() {
  const { can, authLoaded } = useAppContext();

  if (!authLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!can('masters.access')) {
    return (
      <AccessDeniedView
        moduleName="Masters Governance & Setup"
        requiredRole="Super Admin or Admin with permission"
        permissionKey="masters.access"
      />
    );
  }

  return <MastersView />;
}
