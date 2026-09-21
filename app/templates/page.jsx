'use client';

import React from 'react';
import { TemplatesView } from '@/components/views/TemplatesView';
import { AccessDeniedView } from '@/components/common/AccessDeniedView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function TemplatesPage() {
  const { handleOpenCreateFromTemplate, can, authLoaded } = useAppContext();

  if (authLoaded && !can('templates.view')) {
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
