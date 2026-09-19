'use client';

import React from 'react';
import { ProjectsView } from '@/components/views/ProjectsView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function ProjectsPage() {
  const {
    projects,
    tasks,
    users,
    handleSelectProject,
    handleOpenEditProject,
    handleUpdateProject,
    handleDeleteProject,
    handleRestoreProject,
    handleOpenCreateFromTemplate,
    handleOpenCreateTask,
    setIsCreateProjectOpen,
  } = useAppContext();

  return (
    <ProjectsView
      projects={projects}
      tasks={tasks}
      users={users}
      onSelectProject={handleSelectProject}
      onEditProject={handleOpenEditProject}
      onUpdateProject={handleUpdateProject}
      onRestoreProject={handleRestoreProject}
      onOpenCreateProject={() => setIsCreateProjectOpen(true)}
      onOpenCreateFromTemplate={() => handleOpenCreateFromTemplate(null)}
      onOpenCreateTaskForProject={(projectId) => handleOpenCreateTask(null, projectId)}
      onDeleteProject={handleDeleteProject}
    />
  );
}
