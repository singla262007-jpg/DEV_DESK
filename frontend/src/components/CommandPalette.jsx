import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  CheckSquare,
  FolderGit2,
  Timer,
  BarChart3,
  Target,
  FileText,
  Settings,
  Plus,
  Play,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onOpenQuickTask,
  onStartFocus,
  tasks = [],
  projects = [],
  notes = [],
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle global shortcut Cmd+K or Ctrl+K and Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open in parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Build items list
  const defaultActions = [
    { id: 'act-new-task', title: 'Create New Task', category: 'Actions', icon: Plus, action: () => { onClose(); onOpenQuickTask(); } },
    { id: 'act-start-focus', title: 'Start 25m Focus Session', category: 'Actions', icon: Play, action: () => { onClose(); onStartFocus(25); } },
    { id: 'act-deep-work', title: 'Start 50m Deep Work Block', category: 'Actions', icon: Timer, action: () => { onClose(); onStartFocus(50); } },
    { id: 'nav-overview', title: 'Go to Overview Dashboard', category: 'Navigation', icon: ArrowRight, action: () => { onClose(); onNavigate('overview'); } },
    { id: 'nav-tasks', title: 'Go to My Tasks (Kanban / List)', category: 'Navigation', icon: CheckSquare, action: () => { onClose(); onNavigate('tasks'); } },
    { id: 'nav-projects', title: 'Go to Projects Hub', category: 'Navigation', icon: FolderGit2, action: () => { onClose(); onNavigate('projects'); } },
    { id: 'nav-focus', title: 'Go to Focus Studio 2.0', category: 'Navigation', icon: Timer, action: () => { onClose(); onNavigate('focus'); } },
    { id: 'nav-analytics', title: 'Go to Productivity Analytics', category: 'Navigation', icon: BarChart3, action: () => { onClose(); onNavigate('analytics'); } },
    { id: 'nav-goals', title: 'Go to Goals & Habit Streaks', category: 'Navigation', icon: Target, action: () => { onClose(); onNavigate('goals'); } },
    { id: 'nav-notes', title: 'Go to Notes & Knowledge', category: 'Navigation', icon: FileText, action: () => { onClose(); onNavigate('notes'); } },
    { id: 'nav-settings', title: 'Go to Settings', category: 'Navigation', icon: Settings, action: () => { onClose(); onNavigate('settings'); } },
  ];

  const q = query.trim().toLowerCase();

  // Matched actions
  const matchedActions = defaultActions.filter((a) => a.title.toLowerCase().includes(q));

  // Matched tasks
  const matchedTasks = tasks
    .filter((t) => t.title.toLowerCase().includes(q))
    .slice(0, 5)
    .map((t) => ({
      id: `task-${t.id}`,
      title: t.title,
      subtitle: `Task · Priority: ${t.priority} · Status: ${t.status}`,
      category: 'Tasks',
      icon: CheckSquare,
      action: () => {
        onClose();
        onNavigate('tasks');
      },
    }));

  // Matched projects
  const matchedProjects = projects
    .filter((p) => p.name.toLowerCase().includes(q))
    .slice(0, 4)
    .map((p) => ({
      id: `proj-${p.id}`,
      title: p.name,
      subtitle: `Project · ${p.completedTasks || 0}/${p.totalTasks || 0} tasks done`,
      category: 'Projects',
      icon: FolderGit2,
      action: () => {
        onClose();
        onNavigate('projects');
      },
    }));

  // Matched notes
  const matchedNotes = notes
    .filter((n) => n.title.toLowerCase().includes(q))
    .slice(0, 4)
    .map((n) => ({
      id: `note-${n.id}`,
      title: n.title,
      subtitle: `Note in folder: ${n.folder || 'General'}`,
      category: 'Notes',
      icon: FileText,
      action: () => {
        onClose();
        onNavigate('notes');
      },
    }));

  const combinedResults = q
    ? [...matchedActions, ...matchedTasks, ...matchedProjects, ...matchedNotes]
    : defaultActions;

  // Keyboard navigation within list
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, combinedResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + combinedResults.length) % Math.max(1, combinedResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = combinedResults[selectedIndex];
      if (item && item.action) item.action();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '12vh',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: -10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -10, opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '620px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 24px 64px oklch(0 0 0 / 0.5), inset 0 1px 0 oklch(1 0 0 / 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '75vh',
            }}
          >
            {/* Search Input Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <Search size={20} color="var(--primary-accent)" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command, task, project, or search notes..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  color: 'var(--text-main)',
                  padding: 0,
                }}
              />
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 7px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                ESC
              </span>
            </div>

            {/* Results List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {combinedResults.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Sparkles size={28} color="var(--text-faint)" style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>No matching commands or items found</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '4px' }}>
                    Try searching for "task", "project", "focus", or "analytics"
                  </div>
                </div>
              ) : (
                combinedResults.map((item, idx) => {
                  const Icon = item.icon || ArrowRight;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSelected ? 'var(--bg-surface-active)' : 'transparent',
                        cursor: 'pointer',
                        border: isSelected ? '1px solid var(--border-medium)' : '1px solid transparent',
                        transition: 'background 0.1s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: isSelected ? 'var(--primary-accent)' : 'var(--bg-surface)',
                            color: isSelected ? '#ffffff' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={15} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-faint)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {item.category}
                        </span>
                        {isSelected && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 5px',
                              borderRadius: 'var(--radius-xs)',
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--text-muted)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            ↵ Enter
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '10px 16px',
                borderTop: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.74rem',
                color: 'var(--text-faint)',
              }}
            >
              <div style={{ display: 'flex', gap: '14px' }}>
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
                <span>ESC to dismiss</span>
              </div>
              <span>DevDesk Universal Palette</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
