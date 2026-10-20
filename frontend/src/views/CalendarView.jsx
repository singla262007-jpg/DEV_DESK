import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  FolderGit2,
  Plus,
} from 'lucide-react';

export default function CalendarView({
  tasks = [],
  projects = [],
  onOpenTaskModal,
  onEditTask,
}) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month (0 = Sun, 1 = Mon...)
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Map tasks to dates (YYYY-MM-DD)
  const pad = (n) => String(n).padStart(2, '0');
  const tasksByDate = {};
  tasks.forEach((t) => {
    if (t.due_date) {
      if (!tasksByDate[t.due_date]) tasksByDate[t.due_date] = [];
      tasksByDate[t.due_date].push(t);
    }
  });

  const calendarDays = [];
  // Fill blanks before start
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Calendar Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Schedule & Deadlines</h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Monthly calendar view of your upcoming task deadlines and project milestones.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={today} className="btn-ghost" style={{ padding: '6px 12px' }}>
            Today
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button onClick={prevMonth} className="btn-ghost" style={{ padding: '6px' }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.96rem', fontWeight: 700, minWidth: '150px', textAlign: 'center' }}>
              {monthNames[month]} {year}
            </span>
            <button onClick={nextMonth} className="btn-ghost" style={{ padding: '6px' }}>
              <ChevronRight size={16} />
            </button>
          </div>
          <button onClick={() => onOpenTaskModal()} className="btn-primary">
            <Plus size={16} />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
        {/* Day of Week Headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))',
            gap: '8px',
            marginBottom: '10px',
            textAlign: 'center',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
          }}
        >
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>

        {/* Days Cells */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))',
            gap: '8px',
          }}
        >
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={`blank-${idx}`}
                  style={{
                    minHeight: '110px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  }}
                />
              );
            }

            const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
            const isToday = dateStr === todayStr;
            const dayTasks = tasksByDate[dateStr] || [];

            return (
              <div
                key={`day-${day}`}
                style={{
                  minHeight: '110px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isToday ? 'oklch(0.18 0.03 250)' : 'var(--bg-surface)',
                  border: isToday ? '1px solid var(--primary-accent)' : '1px solid var(--border-subtle)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: isToday ? 800 : 600,
                      color: isToday ? 'var(--primary-accent)' : 'var(--text-main)',
                      width: isToday ? '24px' : 'auto',
                      height: isToday ? '24px' : 'auto',
                      borderRadius: isToday ? '50%' : 'none',
                      backgroundColor: isToday ? 'oklch(0.65 0.26 285 / 0.2)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  )}
                </div>

                {/* Day Tasks Badges */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: '90px' }}>
                  {dayTasks.map((t) => {
                    const isDone = t.status === 'done';
                    return (
                      <div
                        key={t.id}
                        onClick={() => onEditTask(t)}
                        style={{
                          fontSize: '0.72rem',
                          padding: '3px 6px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: isDone ? 'oklch(0.72 0.18 155 / 0.15)' : 'var(--bg-base)',
                          border: isDone ? '1px solid oklch(0.72 0.18 155 / 0.3)' : '1px solid var(--border-subtle)',
                          color: isDone ? 'var(--accent-emerald)' : 'var(--text-main)',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
