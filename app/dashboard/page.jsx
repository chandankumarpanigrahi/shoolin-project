'use client';

import React from 'react';
import { DashboardView } from '@/components/views/DashboardView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function DashboardPage() {
  const {
    projects,
    tasks,
    users,
    meetings,
    dependencies,
    currentUser,
    handleSelectProject,
    handleSelectTask,
    handleOpenCreateTask,
    setIsCreateProjectOpen,
    setIsScheduleMeetingOpen,
  } = useAppContext();

  return (
    <DashboardView
      projects={projects}
      tasks={tasks}
      users={users}
      meetings={meetings}
      dependencies={dependencies}
      currentUser={currentUser}
      onNavigate={() => {}}
      onSelectProject={handleSelectProject}
      onSelectTask={handleSelectTask}
      onOpenCreateTask={() => handleOpenCreateTask(null)}
      onOpenCreateProject={() => setIsCreateProjectOpen(true)}
      onOpenScheduleMeeting={() => setIsScheduleMeetingOpen(true)}
    />
  );
}
