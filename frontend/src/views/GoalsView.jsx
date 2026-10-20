import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target,
  Plus,
  Sparkles,
  Flame,
  CheckCircle2,
  Trash2,
  X,
  Calendar,
  Zap,
} from 'lucide-react';

export default function GoalsView({
  goalsData = {},
  onCreateGoal,
  onDeleteGoal,
}) {
  const goals = goalsData.goals || [];
  const streak = goalsData.streak || 0;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('daily_focus');
  const [targetValue, setTargetValue] = useState(120);
  const [period, setPeriod] = useState('daily');

  const handleOpenModal = () => {
    setTitle('');
    setType('daily_focus');
    setTargetValue(120);
    setPeriod('daily');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onCreateGoal({
      title: title.trim(),
      type,
      target_value: Number(targetValue) || 50,
      unit: type.includes('focus') ? 'minutes' : 'tasks',
      period,
    });
    setIsModalOpen(false);
  };

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: '1360px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
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
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Goals & Consistency</h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Set quantifiable daily and weekly targets, maintain deep work streaks, and track habit consistency.
          </p>
        </div>

        <button onClick={handleOpenModal} className="btn-primary">
          <Plus size={16} strokeWidth={2.4} />
          <span>Set Target Goal</span>
        </button>
      </div>

      {/* Streak Hero Card */}
      <div
        className="glass-panel"
        style={{
          padding: '28px',
          marginBottom: '26px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          background: 'radial-gradient(circle at 10% 50%, oklch(0.78 0.18 75 / 0.12) 0%, var(--bg-surface) 60%)',
          border: '1px solid oklch(0.78 0.18 75 / 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'oklch(0.78 0.18 75 / 0.2)',
              color: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px oklch(0.78 0.18 75 / 0.3)',
            }}
          >
            <Flame size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-amber)', fontWeight: 700, textTransform: 'uppercase' }}>
              HABIT CONSISTENCY ENGINE
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {streak} Consecutive Days Active
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Calculated dynamically from recorded daily focus sessions and completed tasks.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-faint)' }}>TODAY'S DEEP WORK</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {goalsData.todayFocusMinutes || 0}m
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-faint)' }}>WEEKLY DEEP WORK</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-violet)' }}>
              {goalsData.weekFocusMinutes || 0}m
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-faint)' }}>TASKS DONE TODAY</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              {goalsData.todayTasksDone || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {goals.length === 0 ? (
          <div
            className="glass-panel"
            style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}
          >
            <Target size={36} color="var(--primary-accent)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>No goals configured</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-faint)', marginTop: '4px', marginBottom: '16px' }}>
              Add a daily focus goal (e.g., 120 minutes of deep work) or a weekly task target.
            </p>
            <button onClick={handleOpenModal} className="btn-primary" style={{ margin: '0 auto' }}>
              <Plus size={16} />
              <span>Create Target Goal</span>
            </button>
          </div>
        ) : (
          goals.map((g) => {
            const isCompleted = g.isCompleted || g.progress >= 100;
            return (
              <motion.div
                key={g.id}
                whileHover={{ y: -2 }}
                className="glass-panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isCompleted ? '1px solid oklch(0.72 0.18 155 / 0.4)' : '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className="badge badge-violet" style={{ textTransform: 'capitalize' }}>
                      {g.period} Target
                    </span>
                    <button onClick={() => onDeleteGoal(g.id)} style={{ color: 'var(--text-faint)', padding: '2px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                    {g.title}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Target: {g.target_value} {g.unit}
                  </div>
                </div>

                <div style={{ marginTop: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Current: <strong>{g.current}</strong> / {g.target_value} {g.unit}
                    </span>
                    <span style={{ fontWeight: 700, color: isCompleted ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                      {g.progress}%
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-base)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, g.progress)}%`,
                        background: isCompleted
                          ? 'var(--accent-emerald)'
                          : 'linear-gradient(90deg, var(--accent-violet), var(--accent-cyan))',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>

                  {isCompleted && (
                    <div
                      style={{
                        fontSize: '0.74rem',
                        color: 'var(--accent-emerald)',
                        fontWeight: 600,
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Target Achieved!</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Goal Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 110,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '480px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Set Productivity Goal</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    GOAL TITLE *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Daily Deep Work Target, Complete 5 Sprint Tasks..."
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      METRIC TYPE
                    </label>
                    <select
                      value={type}
                      onChange={(e) => {
                        setType(e.target.value);
                        if (e.target.value.includes('focus')) setTargetValue(120);
                        else setTargetValue(5);
                      }}
                      style={{ width: '100%' }}
                    >
                      <option value="daily_focus">Daily Focus (Minutes)</option>
                      <option value="weekly_focus">Weekly Focus (Minutes)</option>
                      <option value="daily_tasks">Daily Tasks Done</option>
                      <option value="weekly_tasks">Weekly Tasks Done</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      TARGET QUANTITY
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
