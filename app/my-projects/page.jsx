'use client';

import React from 'react';
import { ProjectsView } from '@/components/views/ProjectsView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function MyProjectsPage() {
  const {
    myProjects,
    users,
    handleSelectProject,
    handleDeleteProject,
    handleOpenCreateFromTemplate,
    handleOpenCreateTask,
    setIsCreateProjectOpen,
  } = useAppContext();

  return (
    <ProjectsView
      projects={myProjects}
      users={users}
      onSelectProject={handleSelectProject}
      onOpenCreateProject={() => setIsCreateProjectOpen(true)}
      onOpenCreateFromTemplate={() => handleOpenCreateFromTemplate(null)}
      onOpenCreateTaskForProject={(projectId) => handleOpenCreateTask(null, projectId)}
      onDeleteProject={handleDeleteProject}
    />
  );
}
