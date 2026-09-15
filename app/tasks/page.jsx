'use client';

import React from 'react';
import { TasksView } from '@/components/views/TasksView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function TasksPage() {
  const {
    tasks,
    projects,
    users,
    handleSelectTask,
    handleOpenCreateTask,
    handleCreateTask,
    handleUpdateTaskStatus,
  } = useAppContext();

  return (
    <TasksView
      tasks={tasks}
      projects={projects}
      users={users}
      onSelectTask={handleSelectTask}
      onOpenCreateTask={(parent) => handleOpenCreateTask(parent)}
      onUpdateTaskStatus={handleUpdateTaskStatus}
      onCreateQuickTask={handleCreateTask}
    />
  );
}
