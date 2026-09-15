'use client';

import React from 'react';
import { RoadmapTimelineView } from '@/components/views/RoadmapTimelineView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function RoadmapPage() {
  const {
    projects,
    tasks,
    users,
    handleSelectProject,
    handleSelectTask,
  } = useAppContext();

  return (
    <RoadmapTimelineView
      projects={projects}
      tasks={tasks}
      users={users}
      onSelectProject={handleSelectProject}
      onSelectTask={handleSelectTask}
    />
  );
}
