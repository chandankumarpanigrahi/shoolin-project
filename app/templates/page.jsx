'use client';

import React from 'react';
import { TemplatesView } from '@/components/views/TemplatesView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function TemplatesPage() {
  const { handleOpenCreateFromTemplate } = useAppContext();

  return (
    <TemplatesView
      onSelectTemplateForCreation={(tmpl) => handleOpenCreateFromTemplate(tmpl)}
    />
  );
}
