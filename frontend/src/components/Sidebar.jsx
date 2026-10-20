import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  CheckSquare,
  FolderGit2,
  Timer,
  CalendarDays,
  BarChart3,
  Target,
  FileText,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'focus', label: 'Focus Studio', icon: Timer },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'goals', label: 'Goals & Habits', icon: Target },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
  currentView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  taskCount = 0,
  focusMinutesToday = 0,
  streak = 0,
}) {
  return (
    <aside
      style={{
        width: isCollapsed ? '72px' : '240px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: isCollapsed ? '20px 14px' : '20px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-cyan) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px var(--primary-accent-glow)',
              flexShrink: 0,
            }}
          >
            <Zap size={20} color="#ffffff" strokeWidth={2.4} />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                DevDesk <span className="badge badge-violet" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>2.0</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Flow & Focus OS</div>
            </motion.div>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            title="Collapse Sidebar"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
            }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={isCollapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: isCollapsed ? '10px 0' : '9px 12px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isActive ? 'var(--bg-surface-active)' : 'transparent',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.86rem',
                border: isActive ? '1px solid var(--border-medium)' : '1px solid transparent',
                position: 'relative',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '6px',
                    bottom: '6px',
                    width: '3px',
                    borderRadius: '0 4px 4px 0',
                    backgroundColor: 'var(--primary-accent)',
                    boxShadow: '0 0 10px var(--primary-accent)',
                  }}
                />
              )}
              <Icon
                size={18}
                color={isActive ? 'var(--primary-accent)' : 'currentColor'}
                strokeWidth={isActive ? 2.3 : 1.9}
              />
              {!isCollapsed && (
                <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              )}
              {!isCollapsed && item.id === 'tasks' && taskCount > 0 && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {taskCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle for Collapsed state */}
      {isCollapsed && (
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onToggleCollapse}
            title="Expand Sidebar"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Footer Pill with Daily Focus Summary */}
      {!isCollapsed && (
        <div
          style={{
            padding: '14px 16px',
            margin: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>TODAY'S FLOW</span>
            {streak > 0 && (
              <span className="badge badge-amber" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                <Sparkles size={11} /> {streak}d streak
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {focusMinutesToday}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>min deep work</span>
          </div>
        </div>
      )}
    </aside>
  );
}
