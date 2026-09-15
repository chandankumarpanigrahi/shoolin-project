'use client';

import React from 'react';
import { DependenciesView } from '@/components/views/DependenciesView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function DependenciesPage() {
  const {
    dependencies,
    projects,
    tasks,
    users,
    currentUser,
    handleSelectTask,
    handleAddDependency,
    handleUpdateDependencyStatus,
    setIsAddDependencyOpen,
  } = useAppContext();

  return (
    <DependenciesView
      dependencies={dependencies}
      projects={projects}
      tasks={tasks}
      users={users}
      currentUser={currentUser}
      onOpenAddDependency={() => setIsAddDependencyOpen(true)}
      onUpdateDependencyStatus={handleUpdateDependencyStatus}
      onSelectTask={handleSelectTask}
    />
  );
}
