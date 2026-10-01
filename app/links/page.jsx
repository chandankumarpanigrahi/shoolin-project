'use client';

import React from 'react';
import { LinksView } from '@/components/views/LinksView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function LinksPage() {
  const {
    links,
    users,
    currentUser,
    masterBrands,
    projects,
    masterLinkCategories,
    handleAddLink,
    handleUpdateLink,
    handleDeleteLink,
    setIsAddLinkOpen,
  } = useAppContext();

  return (
    <LinksView
      links={links}
      users={users}
      currentUser={currentUser}
      masterBrands={masterBrands}
      projects={projects}
      masterLinkCategories={masterLinkCategories}
      onOpenAddLink={() => setIsAddLinkOpen(true)}
      onAddLink={handleAddLink}
      onUpdateLink={handleUpdateLink}
      onDeleteLink={handleDeleteLink}
    />
  );
}
