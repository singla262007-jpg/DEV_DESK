import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function ProductivityChart({ days = [] }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  const maxTasks = Math.max(1, ...days.map((d) => d.completed || 0));
  const maxFocus = Math.max(1, ...days.map((d) => d.focusMinutes || 0));

  const totalWeeklyCompleted = days.reduce((acc, d) => acc + (d.completed || 0), 0);
  const totalWeeklyFocusMinutes = days.reduce((acc, d) => acc + (d.focusMinutes || 0), 0);

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <BarChart3 size={18} color="var(--accent-cyan)" />
            7-Day Productivity Velocity
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Comparing completed actions vs dedicated focus duration
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                background: 'var(--accent-violet)',
              }}
            />
            <span>Tasks Done ({totalWeeklyCompleted})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                background: 'var(--accent-cyan)',
              }}
            />
            <span>Focus Mins ({totalWeeklyFocusMinutes}m)</span>
          </div>
        </div>
      </div>

      {/* Bars Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${days.length || 7}, 1fr)`,
          gap: '12px',
          alignItems: 'flex-end',
          height: '200px',
          padding: '16px 8px 0',
          position: 'relative',
        }}
      >
        {days.map((d, index) => {
          const taskHeight = ((d.completed || 0) / maxTasks) * 85;
          const focusHeight = ((d.focusMinutes || 0) / maxFocus) * 85;
          const dayDate = new Date(d.date + 'T00:00:00');
          const dayName = isNaN(dayDate.getTime())
            ? d.date
            : dayDate.toLocaleDateString(undefined, { weekday: 'short' });
          const isToday = index === days.length - 1;
          const isHovered = hoveredDay === index;

          return (
            <div
              key={d.date || index}
              onMouseEnter={() => setHoveredDay(index)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              {/* Tooltip on hover */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: '-65px',
                    background: 'oklch(0.18 0.03 250 / 0.95)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--border-glow)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 10px',
                    fontSize: '0.74rem',
                    zIndex: 20,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 8px 24px oklch(0 0 0 / 0.5)',
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                    {dayName} ({d.date})
                  </div>
                  <div style={{ color: 'var(--accent-violet)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={10} /> {d.completed || 0} tasks completed
                  </div>
                  <div style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={10} /> {d.focusMinutes || 0} focus minutes
                  </div>
                </motion.div>
              )}

              {/* Bar Pair */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '4px',
                  width: '100%',
                  justifyContent: 'center',
                  height: '160px',
                }}
              >
                {/* Task Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(4, taskHeight)}%` }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  style={{
                    width: '38%',
                    maxWidth: '24px',
                    background: 'linear-gradient(180deg, var(--accent-violet), oklch(0.55 0.22 285))',
                    borderRadius: '4px 4px 0 0',
                    boxShadow: isHovered ? '0 0 12px var(--accent-violet-glow)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                />

                {/* Focus Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(4, focusHeight)}%` }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
                  style={{
                    width: '38%',
                    maxWidth: '24px',
                    background: 'linear-gradient(180deg, var(--accent-cyan), oklch(0.6 0.16 195))',
                    borderRadius: '4px 4px 0 0',
                    boxShadow: isHovered ? '0 0 12px var(--accent-cyan-glow)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>

              {/* Day Label */}
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '0.74rem',
                  fontWeight: isToday ? 700 : 500,
                  color: isToday ? 'var(--accent-cyan)' : 'var(--text-muted)',
                }}
              >
                {dayName}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
