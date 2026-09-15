'use client';

import React from 'react';
import { MyFocusView } from '@/components/views/MyFocusView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function MyFocusPage() {
  const {
    currentUser,
    tasks,
    projects,
    users,
    handleSelectTask,
    handleUpdateTaskStatus,
    handleOpenCreateTask,
    setIsPersonalTodoOpen,
  } = useAppContext();

  return (
    <MyFocusView
      currentUser={currentUser}
      tasks={tasks}
      projects={projects}
      users={users}
      onSelectTask={handleSelectTask}
      onUpdateTaskStatus={handleUpdateTaskStatus}
      onOpenCreateTask={() => handleOpenCreateTask()}
      onOpenPersonalTodo={() => setIsPersonalTodoOpen(true)}
    />
  );
}
