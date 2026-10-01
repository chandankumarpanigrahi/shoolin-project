'use client';

import React from 'react';
import { TemplatesView } from '@/components/views/TemplatesView';
import { AccessDeniedView } from '@/components/common/AccessDeniedView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function TemplatesPage() {
  const { handleOpenCreateFromTemplate, can, authLoaded } = useAppContext();

  if (!authLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!can('templates.view')) {
    return (
      <AccessDeniedView
        moduleName="Project Templates Library"
        requiredRole="Team Member with Template Access"
        permissionKey="templates.view"
      />
    );
  }

  return (
    <TemplatesView
      onSelectTemplateForCreation={(tmpl) => handleOpenCreateFromTemplate(tmpl)}
    />
  );
}
