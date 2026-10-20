import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Plus,
  Play,
  FolderGit2,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Target,
  Zap,
} from 'lucide-react';
import StatsGrid from '../components/StatsGrid';
import ProductivityChart from '../components/ProductivityChart';
import QuickNotes from '../components/QuickNotes';

export default function DashboardView({
  stats,
  tasks = [],
  projects = [],
  goalsData = {},
  onNavigate,
  onOpenQuickTask,
  onStartFocus,
  onToggleTaskComplete,
}) {
  // Personalized time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter tasks for dashboard
  const todayTasks = tasks.filter(
    (t) => t.status !== 'done' && (t.due_date === todayStr || t.priority === 'high')
  );
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'done' && t.due_date && t.due_date < todayStr
  );
  const recentCompleted = tasks.filter((t) => t.status === 'done').slice(0, 4);

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: '1360px', margin: '0 auto', width: '100%' }}>
      {/* Hero Welcome & Quick Action Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '26px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--primary-accent)', fontWeight: 600 }}>
              DEVELOPER COCKPIT
            </span>
            <span style={{ color: 'var(--border-subtle)' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h1>
            {getGreeting()}, <span style={{ color: 'var(--text-main)' }}>Developer</span> 👋
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {overdueTasks.length > 0
              ? `You have ${overdueTasks.length} overdue task(s) and ${todayTasks.length} active priority item(s) for today.`
              : `All systems green. Ready for peak velocity and deep work.`}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={onOpenQuickTask} className="btn-primary">
            <Plus size={16} strokeWidth={2.4} />
            <span>New Task</span>
          </button>
          <button onClick={() => onStartFocus(25)} className="btn-ghost">
            <Play size={14} color="var(--accent-cyan)" />
            <span>Start 25m Focus</span>
          </button>
          <button onClick={() => onNavigate('projects')} className="btn-ghost">
            <FolderGit2 size={14} />
            <span>Projects</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <StatsGrid stats={stats} />

      {/* Main Two-Column Productivity Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: '20px',
          marginBottom: '24px',
        }}
        className="dashboard-main-grid"
      >
        {/* Left Column: Today's Priorities & Active Tasks */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="var(--primary-accent)" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Today's Focus & Priorities</h2>
              <span className="badge badge-violet" style={{ fontSize: '0.7rem' }}>
                {todayTasks.length} tasks
              </span>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              style={{
                fontSize: '0.8rem',
                color: 'var(--primary-accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600,
              }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Overdue Alert banner if any */}
          {overdueTasks.length > 0 && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'oklch(0.68 0.22 25 / 0.12)',
                border: '1px solid oklch(0.68 0.22 25 / 0.3)',
                color: 'var(--accent-rose)',
                fontSize: '0.82rem',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={15} />
                <span>{overdueTasks.length} task(s) past scheduled deadline</span>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                style={{ fontSize: '0.78rem', textDecoration: 'underline', color: 'inherit' }}
              >
                Resolve
              </button>
            </div>
          )}

          {/* Today's Tasks List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todayTasks.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={32} color="var(--accent-emerald)" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>No pending tasks for today</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '4px' }}>
                  Great job staying on top of your priorities! Create a new task or enjoy your flow.
                </div>
              </div>
            ) : (
              todayTasks.slice(0, 6).map((task) => {
                const priorityBadgeClass =
                  task.priority === 'high'
                    ? 'badge-rose'
                    : task.priority === 'medium'
                    ? 'badge-amber'
                    : 'badge-emerald';

                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <button
                        onClick={() => onToggleTaskComplete(task)}
                        title="Mark as done"
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          border: '2px solid var(--border-medium)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'transparent',
                          flexShrink: 0,
                        }}
                      >
                        {task.status === 'done' && <CheckCircle2 size={16} color="var(--accent-emerald)" />}
                      </button>

                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {task.title}
                        </div>
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                            {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks done
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span className={`badge ${priorityBadgeClass}`} style={{ textTransform: 'capitalize' }}>
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {task.due_date}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Focus Launcher & Goals Snapshot */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Focus Starter Card */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Focus Session</h3>
              </div>
              <button
                onClick={() => onNavigate('focus')}
                style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Studio</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
              Enter distraction-free flow. Sync focus blocks directly to your active project or task.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => onStartFocus(25)}
                className="btn-ghost"
                style={{
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  border: '1px solid var(--border-medium)',
                }}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-violet)' }}>25m</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Pomodoro Sprint</span>
              </button>

              <button
                onClick={() => onStartFocus(50)}
                className="btn-ghost"
                style={{
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  border: '1px solid var(--border-medium)',
                }}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>50m</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Deep Architecture</span>
              </button>
            </div>
          </div>

          {/* Goal & Streak Card */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} color="var(--accent-amber)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Consistency & Streaks</h3>
              </div>
              <span className="badge badge-amber">
                <Sparkles size={11} /> {goalsData.streak || 0} Day Streak
              </span>
            </div>

            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Daily Deep Work Target</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {stats.focusToday || 0} / 120 mins
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-surface-active)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round(((stats.focusToday || 0) / 120) * 100))}%`,
                    background: 'linear-gradient(90deg, var(--accent-violet), var(--accent-cyan))',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Velocity Chart */}
      <div style={{ marginBottom: '24px' }}>
        <ProductivityChart days={stats.last7 || []} />
      </div>

      {/* Quick Scratchpad */}
      <div>
        <QuickNotes />
      </div>

      <style>{`
        @media (max-width: 960px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
