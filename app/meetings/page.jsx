'use client';

import React from 'react';
import { MeetingsView } from '@/components/views/MeetingsView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function MeetingsPage() {
  const {
    meetings,
    setMeetings: _set,
    projects,
    tasks,
    users,
    setIsScheduleMeetingOpen,
  } = useAppContext();

  const handleUpdateMeetingStatus = (id, status) => {
    _set((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  return (
    <MeetingsView
      meetings={meetings}
      projects={projects}
      tasks={tasks}
      users={users}
      onOpenScheduleMeeting={() => setIsScheduleMeetingOpen(true)}
      onUpdateMeetingStatus={handleUpdateMeetingStatus}
    />
  );
}
