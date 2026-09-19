'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProjectDetailView } from '@/components/views/ProjectDetailView';
import { useAppContext } from '@/components/providers/AppProvider';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    projects,
    tasks,
    users,
    meetings,
    dependencies,
    links,
    selectedProject,
    setSelectedProject,
    handleOpenEditProject,
    handleSelectTask,
    handleOpenCreateTask,
    handleUpdateTaskStatus,
    setIsScheduleMeetingOpen,
    setIsAddDependencyOpen,
    setIsAddLinkOpen,
  } = useAppContext();

  // Sync selectedProject from URL param
  useEffect(() => {
    const found = projects.find((p) => p.id === params.id || p._id === params.id);
    if (found) {
      setSelectedProject(found);
    }
  }, [params.id, projects, setSelectedProject]);

  const project = projects.find((p) => p.id === params.id || p._id === params.id) || selectedProject;

  if (!project) {
    return (
      <div className="py-16 text-center text-slate-500 text-sm">
        Project not found.{' '}
        <button onClick={() => router.push('/projects')} className="text-indigo-600 underline">
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <ProjectDetailView
      project={project}
      allTasks={tasks}
      users={users}
      meetings={meetings}
      dependencies={dependencies}
      links={links}
      onBack={() => {
        setSelectedProject(null);
        router.push('/projects');
      }}
      onSelectTask={handleSelectTask}
      onEditProject={handleOpenEditProject}
      onOpenCreateTask={(parent) => handleOpenCreateTask(parent, project.id || project._id)}
      onOpenScheduleMeeting={() => setIsScheduleMeetingOpen(true)}
      onOpenAddDependency={() => setIsAddDependencyOpen(true)}
      onOpenAddLink={() => setIsAddLinkOpen(true)}
      onUpdateTaskStatus={handleUpdateTaskStatus}
    />
  );
}
