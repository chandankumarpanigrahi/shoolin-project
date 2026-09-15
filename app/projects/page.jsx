'use client';

import React from 'react';
import { ProjectsView } from '@/components/views/ProjectsView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function ProjectsPage() {
  const {
    projects,
    users,
    handleSelectProject,
    handleDeleteProject,
    handleOpenCreateFromTemplate,
    handleOpenCreateTask,
    setIsCreateProjectOpen,
  } = useAppContext();

  return (
    <ProjectsView
      projects={projects}
      users={users}
      onSelectProject={handleSelectProject}
      onOpenCreateProject={() => setIsCreateProjectOpen(true)}
      onOpenCreateFromTemplate={() => handleOpenCreateFromTemplate(null)}
      onOpenCreateTaskForProject={(projectId) => handleOpenCreateTask(null, projectId)}
      onDeleteProject={handleDeleteProject}
    />
  );
}
