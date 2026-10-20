import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, AlertTriangle, Calendar, Award, Hourglass } from 'lucide-react';

export default function StatsGrid({ stats }) {
  const cards = [
    {
      label: 'Focus Today',
      value: `${stats.focusToday || 0}m`,
      subtext: 'Deep work logged',
      icon: Hourglass,
      color: 'var(--accent-cyan)',
      glow: 'var(--accent-cyan-glow)',
    },
    {
      label: 'Pending Tasks',
      value: stats.pending || 0,
      subtext: 'Active actionable items',
      icon: Clock,
      color: 'var(--accent-violet)',
      glow: 'var(--accent-violet-glow)',
    },
    {
      label: 'Completed',
      value: stats.done || 0,
      subtext: 'Tasks accomplished',
      icon: CheckCircle2,
      color: 'var(--accent-emerald)',
      glow: 'oklch(0.72 0.18 155 / 0.25)',
    },
    {
      label: 'Completion Rate',
      value: `${stats.completionRate || 0}%`,
      subtext: 'Of total workload',
      icon: Award,
      color: 'var(--accent-amber)',
      glow: 'oklch(0.78 0.18 75 / 0.25)',
    },
    {
      label: 'Due Today',
      value: stats.dueToday || 0,
      subtext: 'Targeted for today',
      icon: Calendar,
      color: 'oklch(0.8 0.15 220)',
      glow: 'oklch(0.8 0.15 220 / 0.25)',
    },
    {
      label: 'Overdue',
      value: stats.overdue || 0,
      subtext: stats.overdue > 0 ? 'Needs attention' : 'All on track',
      icon: AlertTriangle,
      color: stats.overdue > 0 ? 'var(--accent-rose)' : 'var(--text-muted)',
      glow: stats.overdue > 0 ? 'oklch(0.68 0.22 25 / 0.25)' : 'transparent',
      isWarn: stats.overdue > 0,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '24px',
      }}
    >
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -3, scale: 1.02 }}
            className="glass-panel"
            style={{
              padding: '16px 18px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'default',
            }}
          >
            {/* Subtle corner glow */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: card.glow,
                filter: 'blur(20px)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {card.label}
              </span>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: 'oklch(0.2 0.02 250 / 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                }}
              >
                <IconComponent size={16} />
              </div>
            </div>

            <div
              style={{
                fontSize: '1.85rem',
                fontWeight: 750,
                color: card.isWarn ? 'var(--accent-rose)' : 'var(--text-main)',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: '4px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {card.value}
            </div>

            <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-faint)' }}>
              {card.subtext}
            </p>
          </motion.div>
        );
      })}
    </motion.section>
  );
}
