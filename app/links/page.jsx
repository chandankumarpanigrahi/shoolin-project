'use client';

import React from 'react';
import { LinksView } from '@/components/views/LinksView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function LinksPage() {
  const {
    links,
    users,
    handleAddLink,
    handleUpdateLink,
    handleDeleteLink,
    setIsAddLinkOpen,
  } = useAppContext();

  return (
    <LinksView
      links={links}
      users={users}
      onOpenAddLink={() => setIsAddLinkOpen(true)}
      onAddLink={handleAddLink}
      onUpdateLink={handleUpdateLink}
      onDeleteLink={handleDeleteLink}
    />
  );
}
