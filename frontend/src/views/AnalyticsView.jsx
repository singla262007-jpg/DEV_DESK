import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  FolderGit2,
  Sparkles,
} from 'lucide-react';

export default function AnalyticsView({
  stats = {},
  tasks = [],
  projects = [],
}) {
  const [timeRange, setTimeRange] = useState('7d'); // '7d' or '30d'

  const velocityDays = timeRange === '7d' ? stats.last7 || [] : stats.last30 || [];
  const heatmapData = stats.heatmap || [];
  const projectDist = stats.projectFocusDistribution || [];

  // Export JSON handler
  const handleExportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      statsSummary: stats,
      tasks,
      projects,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devdesk-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV handler for tasks
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Priority', 'Status', 'DueDate', 'CompletedAt', 'CreatedAt'];
    const rows = tasks.map((t) => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.priority,
      t.status,
      t.due_date || '',
      t.completed_at || '',
      t.created_at || '',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devdesk-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Find max value in velocity chart for dynamic heights
  const maxVelocity = Math.max(
    1,
    ...velocityDays.map((d) => Math.max(d.completed || 0, Math.round((d.focusMinutes || 0) / 25)))
  );

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Analytics Header */}
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
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Productivity Analytics</h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Genuine historical velocity metrics, deep work duration, and GitHub-style consistency.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handleExportCSV} className="btn-ghost">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button onClick={handleExportJSON} className="btn-ghost">
            <Download size={14} />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Focus This Week</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
            {stats.focusThisWeek || 0}m
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>
            Logged deep work sessions
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Focus This Month</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-violet)', marginTop: '4px' }}>
            {stats.focusThisMonth || 0}m
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>
            Rolling 30-day accumulation
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Completed Velocity</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
            {stats.done || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>
            Tasks completed all-time
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Completion Efficiency</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '4px' }}>
            {stats.completionRate || 0}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>
            Done / total workload ratio
          </div>
        </div>
      </div>

      {/* Velocity Trend Chart */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--primary-accent)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Velocity Trends (Tasks Done vs Focus)</h3>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setTimeRange('7d')}
              className={timeRange === '7d' ? 'btn-primary' : 'btn-ghost'}
              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={timeRange === '30d' ? 'btn-primary' : 'btn-ghost'}
              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
            >
              30 Days
            </button>
          </div>
        </div>

        {/* Bar chart container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: timeRange === '7d' ? '20px' : '6px',
            height: '200px',
            paddingTop: '20px',
            borderBottom: '1px solid var(--border-subtle)',
            overflowX: 'auto',
          }}
        >
          {velocityDays.map((d, idx) => {
            const taskHeight = Math.max(4, Math.round(((d.completed || 0) / maxVelocity) * 160));
            const focusHeight = Math.max(
              4,
              Math.round((((d.focusMinutes || 0) / 25) / maxVelocity) * 160)
            );

            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  minWidth: timeRange === '7d' ? '40px' : '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '160px' }}>
                  {/* Tasks completed bar */}
                  <div
                    title={`${d.date}: ${d.completed} tasks done`}
                    style={{
                      width: timeRange === '7d' ? '14px' : '6px',
                      height: `${taskHeight}px`,
                      backgroundColor: 'var(--accent-emerald)',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.4s ease',
                    }}
                  />
                  {/* Focus minutes bar */}
                  <div
                    title={`${d.date}: ${d.focusMinutes}m focus logged`}
                    style={{
                      width: timeRange === '7d' ? '14px' : '6px',
                      height: `${focusHeight}px`,
                      backgroundColor: 'var(--accent-violet)',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.4s ease',
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: 'var(--text-faint)',
                    marginTop: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {d.date.slice(5)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '14px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--accent-emerald)', borderRadius: '2px' }} />
            <span>Tasks Completed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--accent-violet)', borderRadius: '2px' }} />
            <span>Focus Time (25m units)</span>
          </div>
        </div>
      </div>

      {/* GitHub-Style 90-Day Productivity Heatmap */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Sparkles size={18} color="var(--accent-amber)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>90-Day Developer Consistency Heatmap</h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Visualizing daily task execution and deep work intensity over the past 3 months.
        </p>

        {/* Heatmap Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {heatmapData.map((day, idx) => {
            const levelColors = [
              'oklch(0.18 0.02 250)', // 0: no activity
              'oklch(0.35 0.12 155)', // 1: light
              'oklch(0.50 0.16 155)', // 2: medium
              'oklch(0.65 0.20 155)', // 3: high
              'oklch(0.80 0.24 155)', // 4: extreme
            ];

            return (
              <div
                key={idx}
                title={`${day.date}: ${day.count} tasks done, ${day.focusMinutes}m focus (Activity Level ${day.level})`}
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '3px',
                  backgroundColor: levelColors[day.level] || levelColors[0],
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
            );
          })}
        </div>
      </div>

      {/* Project Focus Distribution */}
      {projectDist.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FolderGit2 size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Focus Time by Project</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projectDist.map((p) => (
              <div key={p.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{p.minutes} minutes</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-base)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, (p.minutes / (stats.focusThisMonth || 1)) * 100)}%`,
                      backgroundColor: p.color || 'var(--primary-accent)',
                      borderRadius: 'var(--radius-full)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
