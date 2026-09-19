'use client';

import React, { useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/components/providers/AppProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { InstallPromptBanner } from '@/components/pwa/InstallPromptBanner';
import { ToastProvider } from '@/components/common/Toast';
import { getUrlParam, setUrlParam, removeUrlParam } from '@/hooks/useUrlState';

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
    taskToEdit,
    selectedTemplateForWorkflow,
    setSelectedTemplateForWorkflow,
    projectToEdit,
    handleSelectProject,
    handleSelectTask,
    handleOpenCreateTask,
    handleOpenEditTask,
    handleCreateProject,
    handleUpdateProject,
    handleCreateTask,
    handleUpdateTask,
    handleUpdateTaskStatus,
    handleScheduleMeeting,
    handleUpdateMeeting,
    meetingToEdit,
    setMeetingToEdit,
    activeProjects,
    handleAddDependency,
    handleAddLink,
    handleDeleteLink,
    handleCreateProjectFromTemplate,
    handleAddTemplate,
    handleUpdateTemplate,
    editingTemplate,
    setEditingTemplate,
    isAuthenticated,
    authLoaded,
  } = useAppContext();

  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = pathname === '/login' || pathname === '/offline';

  // ─── Strict Authentication Guard ─────────────────────────────────────────────
  useEffect(() => {
    if (authLoaded && !isAuthenticated && !isPublicRoute && pathname !== '/') {
      router.replace('/login');
    }
  }, [authLoaded, isAuthenticated, isPublicRoute, pathname, router]);

  // ─── Modal Open / Close URL Sync Helpers ─────────────────────────────────────
  const openModal = useCallback((modalName, openFn) => {
    setUrlParam('modal', modalName);
    if (openFn) openFn();
  }, []);

  const closeModal = useCallback((closeFn) => {
    removeUrlParam('modal');
    if (closeFn) closeFn();
  }, []);

  const openTaskWithUrl = useCallback((task) => {
    if (task) {
      setUrlParam('task', task.id || task.code);
      handleSelectTask(task);
    }
  }, [handleSelectTask]);

  const closeTaskDrawerWithUrl = useCallback(() => {
    removeUrlParam('task');
    setIsTaskDrawerOpen(false);
  }, [setIsTaskDrawerOpen]);

  // ─── URL Query Parameter Listener for Deep Linking & Browser Back/Forward ─────
  useEffect(() => {
    const syncFromUrl = () => {
      const modalParam = getUrlParam('modal');
      const taskParam = getUrlParam('task');

      // 1. Sync Modal from ?modal=...
      if (modalParam) {
        setIsSearchOpen(modalParam === 'search');
        setIsAuthOpen(modalParam === 'auth' || modalParam === 'switch-user');
        setIsChangeDpOpen(modalParam === 'change-dp');
        setIsPersonalTodoOpen(modalParam === 'todo');
        setIsCreateProjectOpen(modalParam === 'create-project');
        setIsCreateTaskOpen(modalParam === 'create-task');
        setIsScheduleMeetingOpen(modalParam === 'schedule-meeting');
        setIsAddDependencyOpen(modalParam === 'add-dependency');
        setIsAddLinkOpen(modalParam === 'add-link');
        setIsTemplateWorkflowOpen(modalParam === 'template-workflow');
        setIsCreateTemplateOpen(modalParam === 'create-template');
      } else {
        // If modal param is removed (e.g. browser back button), close modals
        setIsSearchOpen(false);
        setIsAuthOpen(false);
        setIsChangeDpOpen(false);
        setIsPersonalTodoOpen(false);
        setIsCreateProjectOpen(false);
        setIsCreateTaskOpen(false);
        setIsScheduleMeetingOpen(false);
        setIsAddDependencyOpen(false);
        setIsAddLinkOpen(false);
        setIsTemplateWorkflowOpen(false);
        setIsCreateTemplateOpen(false);
      }

      // 2. Sync Task Detail Drawer from ?task=...
      if (taskParam) {
        const found = tasks.find((t) => t.id === taskParam || t.code === taskParam);
        if (found) {
          setSelectedTask(found);
          setIsTaskDrawerOpen(true);
        }
      } else {
        setIsTaskDrawerOpen(false);
      }
    };

    // Run on mount (handles page refresh with URL params)
    syncFromUrl();

    // Listen to browser Back/Forward (popstate) and internal URL changes
    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('shoolin_url_change', syncFromUrl);

    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('shoolin_url_change', syncFromUrl);
    };
  }, [tasks, setSelectedTask, setIsTaskDrawerOpen, setIsSearchOpen, setIsAuthOpen, setIsChangeDpOpen, setIsPersonalTodoOpen, setIsCreateProjectOpen, setIsCreateTaskOpen, setIsScheduleMeetingOpen, setIsAddDependencyOpen, setIsAddLinkOpen, setIsTemplateWorkflowOpen, setIsCreateTemplateOpen]);

  // While checking authentication state from storage on cold load
  if (!authLoaded && !isPublicRoute && pathname !== '/') {
    return (
      <ToastProvider>
        <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-slate-950 flex flex-col items-center justify-center space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/loader.gif" alt="Verifying session..." className="w-12 h-12 object-contain drop-shadow-sm" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Verifying session security...</p>
        </div>
      </ToastProvider>
    );
  }

  // Block rendering protected pages if user is not authenticated (redirecting to /login)
  if (authLoaded && !isAuthenticated && !isPublicRoute && pathname !== '/') {
    return null;
  }

  // Public routes (/login, /offline, /) render without application shell chrome
  if (isPublicRoute || pathname === '/') {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ToastProvider>
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-150">
      <Sidebar
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        allUsers={users}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onOpenCreateProject={() => openModal('create-project', () => setIsCreateProjectOpen(true))}
        onOpenCreateTask={() => openModal('create-task', () => handleOpenCreateTask(null))}
        onOpenAuthModal={() => openModal('auth', () => setIsAuthOpen(true))}
        selectedProject={selectedProject}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
        <Topbar
          selectedProject={selectedProject}
          selectedTask={selectedTask}
          onToggleSidebar={toggleSidebar}
          onOpenMobileMenu={toggleSidebar}
          onOpenSearch={() => openModal('search', () => setIsSearchOpen(true))}
          onOpenCreateProject={() => openModal('create-project', () => setIsCreateProjectOpen(true))}
          onOpenCreateTask={() => openModal('create-task', () => handleOpenCreateTask(null))}
          onOpenCreateMeeting={() => openModal('schedule-meeting', () => setIsScheduleMeetingOpen(true))}
          onOpenCreateLink={() => openModal('add-link', () => setIsAddLinkOpen(true))}
          currentUser={currentUser}
          onOpenAuthModal={() => openModal('auth', () => setIsAuthOpen(true))}
        />

        <main className="flex-1 p-4 sm:p-6 pb-20 lg:pb-6 max-w-full overflow-x-hidden bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-150">
          {children}
        </main>
      </div>

      {/* GLOBAL MODALS WITH URL SYNCHRONIZATION */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => closeModal(() => setIsSearchOpen(false))}
        projects={projects}
        tasks={tasks}
        users={users}
        meetings={meetings}
        dependencies={dependencies}
        links={links}
        onSelectProject={(p) => {
          closeModal(() => setIsSearchOpen(false));
          handleSelectProject(p);
        }}
        onSelectTask={(t) => {
          closeModal(() => setIsSearchOpen(false));
          openTaskWithUrl(t);
        }}
        onNavigate={(view) => {
          closeModal(() => setIsSearchOpen(false));
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => closeModal(() => setIsAuthOpen(false))}
        onLoginAsUser={(u) => {
          setCurrentUser(u);
          closeModal(() => setIsAuthOpen(false));
        }}
      />

      <ChangeDpModal
        isOpen={isChangeDpOpen}
        onClose={() => closeModal(() => setIsChangeDpOpen(false))}
        currentUser={dpTargetUser || currentUser}
        onUpdateAvatar={updateCurrentUserAvatar}
      />

      <PersonalTodoModal
        isOpen={isPersonalTodoOpen}
        onClose={() => closeModal(() => setIsPersonalTodoOpen(false))}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => closeModal(() => setIsCreateProjectOpen(false))}
        users={users}
        projectToEdit={projectToEdit}
        onCreateProject={(p) => {
          handleCreateProject(p);
          closeModal(() => setIsCreateProjectOpen(false));
        }}
        onUpdateProject={(id, updates) => {
          handleUpdateProject(id, updates);
          closeModal(() => setIsCreateProjectOpen(false));
        }}
      />

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => closeModal(() => setIsCreateTaskOpen(false))}
        projects={projects}
        users={users}
        parentTask={parentTaskForCreation}
        defaultProjectId={defaultProjectIdForTask}
        taskToEdit={taskToEdit}
        onCreateTask={(t) => {
          handleCreateTask(t);
          closeModal(() => setIsCreateTaskOpen(false));
        }}
        onUpdateTask={(id, updates) => {
          handleUpdateTask(id, updates);
          closeModal(() => setIsCreateTaskOpen(false));
        }}
      />

      <TaskDetailDrawer
        isOpen={isTaskDrawerOpen}
        onClose={closeTaskDrawerWithUrl}
        task={selectedTask}
        allTasks={tasks}
        projects={projects}
        users={users}
        dependencies={dependencies}
        onUpdateTaskStatus={handleUpdateTaskStatus}
        onAddChildTask={(pTask) => {
          closeTaskDrawerWithUrl();
          openModal('create-task', () => handleOpenCreateTask(pTask, pTask.projectId));
        }}
        onEditTask={(t) => {
          closeTaskDrawerWithUrl();
          openModal('create-task', () => handleOpenEditTask(t));
        }}
        onSelectTask={(t) => openTaskWithUrl(t)}
      />

      <ScheduleMeetingModal
        isOpen={isScheduleMeetingOpen}
        meetingToEdit={meetingToEdit}
        onClose={() => {
          closeModal(() => {
            setIsScheduleMeetingOpen(false);
            if (setMeetingToEdit) setMeetingToEdit(null);
          });
        }}
        projects={activeProjects || projects}
        tasks={tasks}
        users={users}
        currentUser={currentUser}
        onScheduleMeeting={(m) => {
          handleScheduleMeeting(m);
          closeModal(() => setIsScheduleMeetingOpen(false));
        }}
        onUpdateMeeting={(id, updates) => {
          if (handleUpdateMeeting) handleUpdateMeeting(id, updates);
          closeModal(() => {
            setIsScheduleMeetingOpen(false);
            if (setMeetingToEdit) setMeetingToEdit(null);
          });
        }}
      />

      <AddDependencyModal
        isOpen={isAddDependencyOpen}
        onClose={() => closeModal(() => setIsAddDependencyOpen(false))}
        projects={projects}
        tasks={tasks}
        users={users}
        onAddDependency={(d) => {
          handleAddDependency(d);
          closeModal(() => setIsAddDependencyOpen(false));
        }}
      />

      <AddLinkModal
        isOpen={isAddLinkOpen}
        onClose={() => closeModal(() => setIsAddLinkOpen(false))}
        currentUser={currentUser}
        onAddLink={(l) => {
          handleAddLink(l);
          closeModal(() => setIsAddLinkOpen(false));
        }}
      />

      <TemplateWorkflowModal
        isOpen={isTemplateWorkflowOpen}
        onClose={() => {
          closeModal(() => {
            setIsTemplateWorkflowOpen(false);
            setSelectedTemplateForWorkflow(null);
          });
        }}
        users={users}
        preselectedTemplate={selectedTemplateForWorkflow}
        onCreateProjectFromTemplate={(p) => {
          handleCreateProjectFromTemplate(p);
          closeModal(() => {
            setIsTemplateWorkflowOpen(false);
            setSelectedTemplateForWorkflow(null);
          });
        }}
      />

      <CreateTemplateModal
        isOpen={isCreateTemplateOpen}
        templateToEdit={editingTemplate}
        onClose={() => {
          closeModal(() => {
            setIsCreateTemplateOpen(false);
            if (setEditingTemplate) setEditingTemplate(null);
          });
        }}
        onAddTemplate={(tpl) => {
          handleAddTemplate(tpl);
          closeModal(() => {
            setIsCreateTemplateOpen(false);
            if (setEditingTemplate) setEditingTemplate(null);
          });
        }}
        onUpdateTemplate={(tpl) => {
          if (handleUpdateTemplate) handleUpdateTemplate(tpl);
          closeModal(() => {
            setIsCreateTemplateOpen(false);
            if (setEditingTemplate) setEditingTemplate(null);
          });
        }}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* PWA Install Prompt */}
      <InstallPromptBanner />
    </div>
    </ToastProvider>
  );
}
