import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, Target, Sparkles, Check } from 'lucide-react';
import { playChime } from '../utils/audio';
import { fireCelebration } from '../utils/confetti';
import { api } from '../api';

const PRESETS = [
  { label: 'Pomodoro', minutes: 25 },
  { label: 'Deep Work', minutes: 50 },
  { label: 'Short Break', minutes: 5 },
  { label: 'Long Break', minutes: 15 },
  { label: 'Test 1m', minutes: 1 },
];

export default function FocusTimer({ tasks, onSessionCompleted }) {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [linkedTaskId, setLinkedTaskId] = useState('');
  const [justFinished, setJustFinished] = useState(false);

  const timerRef = useRef(null);
  const totalSeconds = selectedMinutes * 60;

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(remainingSeconds)} · Focus Flow`;
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      document.title = 'Productivity Pulse';
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, remainingSeconds]);

  const handleComplete = async () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    playChime();
    fireCelebration();
    setJustFinished(true);

    try {
      await api.logFocusSession({
        minutes: selectedMinutes,
        task_id: linkedTaskId || null,
      });
      if (onSessionCompleted) onSessionCompleted();
    } catch (err) {
      console.error('Failed to log focus session:', err);
    }

    setTimeout(() => {
      setJustFinished(false);
      setRemainingSeconds(selectedMinutes * 60);
    }, 4000);
  };

  const handlePresetSelect = (mins) => {
    setIsRunning(false);
    setSelectedMinutes(mins);
    setRemainingSeconds(mins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(selectedMinutes * 60);
  };

  // Progress calculations
  const progressRatio = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const strokeDashoffset = 565 - 565 * progressRatio;

  const pendingTasks = (tasks || []).filter((t) => t.status === 'todo');

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--accent-violet)" />
          Focus Engine
        </h2>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {isRunning ? 'Flow State Active' : 'Ready to Focus'}
        </span>
      </div>

      {/* Preset Pills */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        {PRESETS.map((p) => {
          const active = selectedMinutes === p.minutes;
          return (
            <motion.button
              key={p.minutes}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePresetSelect(p.minutes)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: active ? 'var(--accent-violet)' : 'oklch(0.18 0.02 250 / 0.6)',
                color: active ? '#ffffff' : 'var(--text-muted)',
                border: `1px solid ${active ? 'var(--accent-violet)' : 'var(--border-subtle)'}`,
                boxShadow: active ? '0 0 16px var(--accent-violet-glow)' : 'none',
              }}
            >
              {p.label}
            </motion.button>
          );
        })}
      </div>

      {/* Circular Animated Timer */}
      <div style={{ position: 'relative', width: '220px', height: '220px', margin: '6px 0 20px' }}>
        <svg width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx="110"
            cy="110"
            r="90"
            fill="transparent"
            stroke="oklch(0.2 0.02 250 / 0.5)"
            strokeWidth="10"
          />
          {/* Animated active progress circle */}
          <circle
            cx="110"
            cy="110"
            r="90"
            fill="transparent"
            stroke="url(#timerGradient)"
            strokeWidth="10"
            strokeDasharray="565"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-violet)" />
              <stop offset="100%" stopColor="var(--accent-cyan)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Time Display */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {justFinished ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ textAlign: 'center' }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  boxShadow: '0 0 20px oklch(0.72 0.18 155 / 0.4)',
                }}
              >
                <Check size={22} color="#ffffff" />
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                Session Logged!
              </div>
            </motion.div>
          ) : (
            <>
              <span
                style={{
                  fontSize: '2.8rem',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                  background: 'linear-gradient(135deg, var(--text-main), var(--accent-cyan))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {formatTime(remainingSeconds)}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {isRunning ? 'Keep going' : 'Paused'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Timer Controls */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '18px' }}>
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsRunning(!isRunning)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            borderRadius: 'var(--radius-full)',
            background: isRunning
              ? 'oklch(0.78 0.18 75)'
              : 'linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9rem',
            boxShadow: '0 0 24px var(--accent-violet-glow)',
          }}
        >
          {isRunning ? <Pause size={18} fill="#ffffff" /> : <Play size={18} fill="#ffffff" />}
          <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleReset}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'oklch(0.18 0.02 250 / 0.6)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Reset timer"
        >
          <RotateCcw size={16} />
        </motion.button>
      </div>

      {/* Target Task Linkage (Advanced Feature) */}
      <div style={{ width: '100%', marginTop: '6px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginBottom: '6px',
          }}
        >
          <Target size={14} color="var(--accent-cyan)" />
          <span>Dedicate session to a task:</span>
        </label>
        <select
          value={linkedTaskId}
          onChange={(e) => setLinkedTaskId(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'oklch(0.16 0.02 250 / 0.7)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            color: 'var(--text-main)',
            outline: 'none',
          }}
        >
          <option value="">-- General Unassigned Focus --</option>
          {pendingTasks.map((t) => (
            <option key={t.id} value={t.id}>
              [{t.priority.toUpperCase()}] {t.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
