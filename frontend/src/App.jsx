import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import CommandPalette from './components/CommandPalette';
import NotificationDrawer from './components/NotificationDrawer';
import TaskModal from './components/TaskModal';

// Views
import DashboardView from './views/DashboardView';
import TasksView from './views/TasksView';
import ProjectsView from './views/ProjectsView';
import FocusStudioView from './views/FocusStudioView';
import CalendarView from './views/CalendarView';
import AnalyticsView from './views/AnalyticsView';
import GoalsView from './views/GoalsView';
import NotesView from './views/NotesView';
import ActivityView from './views/ActivityView';
import SettingsView from './views/SettingsView';

import { api, isBackendConnected } from './api';

const VIEW_TITLES = {
  overview: 'Cockpit Overview',
  tasks: 'My Tasks Workspace',
  projects: 'Projects & Initiatives',
  focus: 'Focus Studio 2.0',
  calendar: 'Schedule & Deadlines',
  analytics: 'Productivity Analytics',
  goals: 'Goals & Consistency',
  notes: 'Notes & Knowledge',
  activity: 'Activity Timeline',
  settings: 'Preferences & Settings',
};

export default function App() {
  const [currentView, setCurrentView] = useState('overview');
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [goalsData, setGoalsData] = useState({ goals: [], streak: 0 });
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    done: 0,
    pending: 0,
    overdue: 0,
    dueToday: 0,
    completionRate: 0,
    focusToday: 0,
    last7: [],
  });

  const [connected, setConnected] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Theme settings
  const [theme, setTheme] = useState(() => localStorage.getItem('devdesk_theme') || 'dark');
  const [activeAccent, setActiveAccent] = useState(() => localStorage.getItem('devdesk_accent') || 'violet');

  // Apply theme attributes to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('devdesk_theme', theme);
  }, [theme]);

  const handleAccentChange = (accentId, color, glow) => {
    setActiveAccent(accentId);
    localStorage.setItem('devdesk_accent', accentId);
    document.documentElement.style.setProperty('--primary-accent', color);
    document.documentElement.style.setProperty('--primary-accent-glow', glow);
  };

  // Synchronize master application data from backend
  const loadAllData = useCallback(async () => {
    try {
      const [fetchedTasks, fetchedProjects, fetchedNotes, fetchedGoals, fetchedStats, fetchedNotifications] =
        await Promise.allSettled([
          api.getTasks(),
          api.getProjects(),
          api.getNotes(),
          api.getGoals(),
          api.getStats(),
          api.getNotifications(),
        ]);

      if (fetchedTasks.status === 'fulfilled' && fetchedTasks.value) setTasks(fetchedTasks.value);
      if (fetchedProjects.status === 'fulfilled' && fetchedProjects.value) setProjects(fetchedProjects.value);
      if (fetchedNotes.status === 'fulfilled' && fetchedNotes.value) setNotes(fetchedNotes.value);
      if (fetchedGoals.status === 'fulfilled' && fetchedGoals.value) setGoalsData(fetchedGoals.value);
      if (fetchedStats.status === 'fulfilled' && fetchedStats.value) setStats(fetchedStats.value);
      if (fetchedNotifications.status === 'fulfilled' && fetchedNotifications.value) {
        setNotifications(fetchedNotifications.value.notifications || []);
        setUnreadNotifications(fetchedNotifications.value.unreadCount || 0);
      }

      setConnected(isBackendConnected);
    } catch (err) {
      console.warn('Backend temporarily unreachable, operating with resilient local storage:', err);
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Global Command Palette Shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Task Operations
  const handleOpenTaskModal = (task = null) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskPayload, taskId) => {
    if (taskId) {
      await api.updateTask(taskId, taskPayload);
    } else {
      await api.createTask(taskPayload);
    }
    await loadAllData();
  };

  const handleToggleTaskStatus = async (task, forcedStatus) => {
    const nextStatus = forcedStatus || (task.status === 'done' ? 'todo' : 'done');
    await api.updateTask(task.id, { status: nextStatus });
    await loadAllData();
  };

  const handleDeleteTask = async (taskId) => {
    await api.deleteTask(taskId);
    await loadAllData();
  };

  // Project Operations
  const handleCreateProject = async (data) => {
    await api.createProject(data);
    await loadAllData();
  };

  const handleUpdateProject = async (id, data) => {
    await api.updateProject(id, data);
    await loadAllData();
  };

  const handleDeleteProject = async (id) => {
    await api.deleteProject(id);
    await loadAllData();
  };

  // Note Operations
  const handleCreateNote = async (data) => {
    const created = await api.createNote(data);
    await loadAllData();
    return created;
  };

  const handleUpdateNote = async (id, data) => {
    await api.updateNote(id, data);
    await loadAllData();
  };

  const handleDeleteNote = async (id) => {
    await api.deleteNote(id);
    await loadAllData();
  };

  // Goal Operations
  const handleCreateGoal = async (data) => {
    await api.createGoal(data);
    await loadAllData();
  };

  const handleDeleteGoal = async (id) => {
    await api.deleteGoal(id);
    await loadAllData();
  };

  // Focus Log
  const handleLogFocusSession = async (sessionData) => {
    await api.logFocusSession(sessionData);
    await loadAllData();
  };

  // Notification Operations
  const handleMarkNotificationRead = async (id) => {
    await api.markNotificationRead(id);
    await loadAllData();
  };

  const handleMarkAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    await loadAllData();
  };

  const handleClearNotifications = async () => {
    await api.clearNotifications();
    await loadAllData();
  };

  const handleStartFocusShortcut = (mins = 25) => {
    setCurrentView('focus');
  };

  return (
    <div className="app-shell">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(viewId) => {
          setCurrentView(viewId);
          setIsMobileMenuOpen(false);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        taskCount={tasks.filter((t) => t.status !== 'done').length}
        focusMinutesToday={stats.focusToday || 0}
        streak={goalsData.streak || 0}
      />

      {/* Main Workstation View Area */}
      <div className="app-main-content">
        {/* Top Header */}
        <TopHeader
          currentViewTitle={VIEW_TITLES[currentView] || 'Overview'}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadNotifications={unreadNotifications}
          isConnected={connected}
          onQuickAddTask={() => handleOpenTaskModal(null)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Dynamic View Router */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {currentView === 'overview' && (
            <DashboardView
              stats={stats}
              tasks={tasks}
              projects={projects}
              goalsData={goalsData}
              onNavigate={(v) => setCurrentView(v)}
              onOpenQuickTask={() => handleOpenTaskModal(null)}
              onStartFocus={handleStartFocusShortcut}
              onToggleTaskComplete={handleToggleTaskStatus}
            />
          )}

          {currentView === 'tasks' && (
            <TasksView
              tasks={tasks}
              projects={projects}
              onOpenTaskModal={handleOpenTaskModal}
              onEditTask={handleOpenTaskModal}
              onToggleStatus={handleToggleTaskStatus}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {currentView === 'projects' && (
            <ProjectsView
              projects={projects}
              tasks={tasks}
              onCreateProject={handleCreateProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onSelectProject={() => setCurrentView('tasks')}
            />
          )}

          {currentView === 'focus' && (
            <FocusStudioView
              tasks={tasks}
              projects={projects}
              onLogSession={handleLogFocusSession}
              todayFocusMinutes={stats.focusToday || 0}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              tasks={tasks}
              projects={projects}
              onOpenTaskModal={handleOpenTaskModal}
              onEditTask={handleOpenTaskModal}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              stats={stats}
              tasks={tasks}
              projects={projects}
            />
          )}

          {currentView === 'goals' && (
            <GoalsView
              goalsData={goalsData}
              onCreateGoal={handleCreateGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {currentView === 'notes' && (
            <NotesView
              notes={notes}
              onCreateNote={handleCreateNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {currentView === 'activity' && (
            <ActivityView />
          )}

          {currentView === 'settings' && (
            <SettingsView
              theme={theme}
              onThemeChange={setTheme}
              activeAccent={activeAccent}
              onAccentChange={handleAccentChange}
              tasks={tasks}
              projects={projects}
            />
          )}
        </main>
      </div>

      {/* Global Universal Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(v) => setCurrentView(v)}
        onOpenQuickTask={() => handleOpenTaskModal(null)}
        onStartFocus={handleStartFocusShortcut}
        tasks={tasks}
        projects={projects}
        notes={notes}
      />

      {/* In-App Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearNotifications}
      />

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        projects={projects}
      />
    </div>
  );
}
