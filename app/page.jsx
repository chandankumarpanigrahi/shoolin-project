'use client';

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/components/providers/AppProvider';
import { DashboardView } from '@/components/views/DashboardView';
import { LoginView } from '@/components/views/LoginView';
import { AppLoader } from '@/components/common/AppLoader';

export default function RootPage() {
  const {
    isAuthenticated,
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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loader while checking initial authentication session
  if (!mounted) {
    return <AppLoader fullScreen={true} message="Loading Shoolin Innovations Limited..." />;
  }

  // The default start page is the Login Page
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // When authenticated, display the workspace Dashboard
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
