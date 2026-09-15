'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/components/providers/AppProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

// Modals
import { GlobalSearchModal } from '@/components/modals/GlobalSearchModal';
import { AuthModal } from '@/components/modals/AuthModal';
import { ChangeDpModal } from '@/components/modals/ChangeDpModal';
import { PersonalTodoModal } from '@/components/modals/PersonalTodoModal';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';
import { TaskDetailDrawer } from '@/components/modals/TaskDetailDrawer';
import { ScheduleMeetingModal } from '@/components/modals/ScheduleMeetingModal';
import { AddDependencyModal } from '@/components/modals/AddDependencyModal';
import { AddLinkModal } from '@/components/modals/AddLinkModal';
import { TemplateWorkflowModal } from '@/components/modals/TemplateWorkflowModal';
import { CreateTemplateModal } from '@/components/modals/CreateTemplateModal';

export function AppShell({ children }) {
  const {
    projects,
    tasks,
    users,
    meetings,
    dependencies,
    links,
    currentUser,
    setCurrentUser,
    dpTargetUser,
    updateCurrentUserAvatar,
    isPersonalTodoOpen,
    setIsPersonalTodoOpen,
    selectedProject,
    selectedTask,
    setSelectedTask,
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar,
    isMobileOpen,
    setIsMobileOpen,
    isSearchOpen, setIsSearchOpen,
    isAuthOpen, setIsAuthOpen,
    isChangeDpOpen, setIsChangeDpOpen,
    isCreateProjectOpen, setIsCreateProjectOpen,
    isCreateTaskOpen, setIsCreateTaskOpen,
    isTaskDrawerOpen, setIsTaskDrawerOpen,
    isScheduleMeetingOpen, setIsScheduleMeetingOpen,
    isAddDependencyOpen, setIsAddDependencyOpen,
    isAddLinkOpen, setIsAddLinkOpen,
    isTemplateWorkflowOpen, setIsTemplateWorkflowOpen,
    isCreateTemplateOpen, setIsCreateTemplateOpen,
    parentTaskForCreation,
    defaultProjectIdForTask,
    selectedTemplateForWorkflow,
    setSelectedTemplateForWorkflow,
    handleSelectProject,
    handleSelectTask,
    handleOpenCreateTask,
    handleCreateProject,
    handleCreateTask,
    handleUpdateTaskStatus,
    handleScheduleMeeting,
    handleAddDependency,
    handleAddLink,
    handleDeleteLink,
    handleCreateProjectFromTemplate,
    handleAddTemplate,
    isAuthenticated,
  } = useAppContext();

  const pathname = usePathname();

  if (pathname === '/login' || (pathname === '/' && !isAuthenticated)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-150">
      <Sidebar
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        allUsers={users}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
        onOpenCreateTask={() => handleOpenCreateTask(null)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        selectedProject={selectedProject}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
        <Topbar
          selectedProject={selectedProject}
          selectedTask={selectedTask}
          onToggleSidebar={toggleSidebar}
          onOpenMobileMenu={toggleSidebar}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenCreateProject={() => setIsCreateProjectOpen(true)}
          onOpenCreateTask={() => handleOpenCreateTask(null)}
          onOpenCreateMeeting={() => setIsScheduleMeetingOpen(true)}
          onOpenCreateLink={() => setIsAddLinkOpen(true)}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-full overflow-x-hidden bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-150">
          {children}
        </main>
      </div>

      {/* GLOBAL MODALS */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        projects={projects}
        tasks={tasks}
        users={users}
        meetings={meetings}
        dependencies={dependencies}
        links={links}
        onSelectProject={(p) => handleSelectProject(p)}
        onSelectTask={(t) => handleSelectTask(t)}
        onNavigate={(view) => {
          setIsSearchOpen(false);
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginAsUser={(u) => setCurrentUser(u)}
      />

      <ChangeDpModal
        isOpen={isChangeDpOpen}
        onClose={() => setIsChangeDpOpen(false)}
        currentUser={dpTargetUser || currentUser}
        onUpdateAvatar={updateCurrentUserAvatar}
      />

      <PersonalTodoModal
        isOpen={isPersonalTodoOpen}
        onClose={() => setIsPersonalTodoOpen(false)}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        users={users}
        onCreateProject={handleCreateProject}
      />

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        projects={projects}
        users={users}
        parentTask={parentTaskForCreation}
        defaultProjectId={defaultProjectIdForTask}
        onCreateTask={handleCreateTask}
      />

      <TaskDetailDrawer
        isOpen={isTaskDrawerOpen}
        onClose={() => setIsTaskDrawerOpen(false)}
        task={selectedTask}
        allTasks={tasks}
        projects={projects}
        users={users}
        dependencies={dependencies}
        onUpdateTaskStatus={handleUpdateTaskStatus}
        onAddChildTask={(pTask) => {
          setIsTaskDrawerOpen(false);
          handleOpenCreateTask(pTask, pTask.projectId);
        }}
        onSelectTask={(t) => setSelectedTask(t)}
      />

      <ScheduleMeetingModal
        isOpen={isScheduleMeetingOpen}
        onClose={() => setIsScheduleMeetingOpen(false)}
        projects={projects}
        tasks={tasks}
        users={users}
        currentUser={currentUser}
        onScheduleMeeting={handleScheduleMeeting}
      />

      <AddDependencyModal
        isOpen={isAddDependencyOpen}
        onClose={() => setIsAddDependencyOpen(false)}
        projects={projects}
        tasks={tasks}
        users={users}
        onAddDependency={handleAddDependency}
      />

      <AddLinkModal
        isOpen={isAddLinkOpen}
        onClose={() => setIsAddLinkOpen(false)}
        currentUser={currentUser}
        onAddLink={handleAddLink}
      />

      <TemplateWorkflowModal
        isOpen={isTemplateWorkflowOpen}
        onClose={() => {
          setIsTemplateWorkflowOpen(false);
          setSelectedTemplateForWorkflow(null);
        }}
        users={users}
        preselectedTemplate={selectedTemplateForWorkflow}
        onCreateProjectFromTemplate={handleCreateProjectFromTemplate}
      />

      <CreateTemplateModal
        isOpen={isCreateTemplateOpen}
        onClose={() => setIsCreateTemplateOpen(false)}
        onAddTemplate={handleAddTemplate}
      />
    </div>
  );
}
