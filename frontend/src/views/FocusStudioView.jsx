import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Check,
  FolderGit2,
  Clock,
  Flame,
  FileText,
} from 'lucide-react';
import { playChime, toggleAmbientNoise } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

const STORAGE_KEY_TIMER = 'devdesk_focus_timer_state';

const PRESETS = [
  { label: 'Pomodoro', minutes: 25 },
  { label: 'Deep Work', minutes: 50 },
  { label: 'Short Break', minutes: 5 },
  { label: 'Long Break', minutes: 15 },
];

export default function FocusStudioView({
  tasks = [],
  projects = [],
  onLogSession,
  todayFocusMinutes = 0,
}) {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [linkedTaskId, setLinkedTaskId] = useState('');
  const [linkedProjectId, setLinkedProjectId] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ambientActive, setAmbientActive] = useState(false);
  const [recentLogged, setRecentLogged] = useState(false);

  // Restore saved state across page refresh, component unmount, or tab switch
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TIMER);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.isRunning && state.targetEndTime) {
          const now = Date.now();
          const diffSeconds = Math.max(0, Math.round((state.targetEndTime - now) / 1000));
          setSelectedMinutes(state.selectedMinutes || 25);
          setRemainingSeconds(diffSeconds);
          setIsRunning(diffSeconds > 0);
          setLinkedTaskId(state.linkedTaskId || '');
          setLinkedProjectId(state.linkedProjectId || '');
          setSessionNotes(state.sessionNotes || '');
        } else if (state.remainingSeconds) {
          setSelectedMinutes(state.selectedMinutes || 25);
          setRemainingSeconds(state.remainingSeconds);
          setIsRunning(false);
          setLinkedTaskId(state.linkedTaskId || '');
          setLinkedProjectId(state.linkedProjectId || '');
        }
      }
    } catch (_) {}
  }, []);

  // Timestamp-based reliable timer tick
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Persist timer state to survive tab close or reload
  useEffect(() => {
    try {
      const targetEndTime = isRunning ? Date.now() + remainingSeconds * 1000 : null;
      localStorage.setItem(
        STORAGE_KEY_TIMER,
        JSON.stringify({
          selectedMinutes,
          remainingSeconds,
          isRunning,
          targetEndTime,
          linkedTaskId,
          linkedProjectId,
          sessionNotes,
        })
      );
    } catch (_) {}
  }, [isRunning, remainingSeconds, selectedMinutes, linkedTaskId, linkedProjectId, sessionNotes]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(selectedMinutes * 60);
  };

  const handleSelectPreset = (mins) => {
    setIsRunning(false);
    setSelectedMinutes(mins);
    setRemainingSeconds(mins * 60);
  };

  const handleComplete = useCallback(async () => {
    setIsRunning(false);
    playChime();
    triggerConfetti();
    setRecentLogged(true);

    try {
      if (selectedMinutes >= 5) {
        await onLogSession({
          minutes: selectedMinutes,
          task_id: linkedTaskId || null,
          project_id: linkedProjectId || null,
          notes: sessionNotes || 'Completed deep work focus sprint',
        });
      }
    } catch (err) {
      console.warn('Could not log focus session:', err);
    }

    setTimeout(() => setRecentLogged(false), 5000);
  }, [selectedMinutes, linkedTaskId, linkedProjectId, sessionNotes, onLogSession]);

  const handleToggleSound = () => {
    const active = toggleAmbientNoise();
    setAmbientActive(active);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Format MM:SS
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // SVG circular progress calculation
  const totalSeconds = selectedMinutes * 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const strokeDashoffset = 754 - 754 * progressRatio; // radius 120 -> circumference ~754

  return (
    <div
      style={{
        padding: isFullscreen ? '40px' : '24px 28px 60px',
        maxWidth: isFullscreen ? '100%' : '1240px',
        margin: '0 auto',
        width: '100%',
        minHeight: isFullscreen ? '100vh' : 'auto',
        backgroundColor: isFullscreen ? 'var(--bg-base)' : 'transparent',
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 120 : 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Bar in Studio */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Focus Studio 2.0</h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            High-velocity deep work engine with persistent recovery and ambient soundscapes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleToggleSound}
            className="btn-ghost"
            title="Toggle Ambient Audio"
            style={{
              color: ambientActive ? 'var(--accent-violet)' : 'var(--text-muted)',
              border: ambientActive ? '1px solid var(--accent-violet)' : '1px solid var(--border-subtle)',
            }}
          >
            {ambientActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{ambientActive ? 'Ambient Playing' : 'Ambient Off'}</span>
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="btn-ghost"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Distraction Free'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Distraction-Free'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workstation */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isFullscreen ? '1fr' : 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'center',
        }}
      >
        {/* Left: Circular Countdown Timer Display */}
        <div
          className="glass-panel"
          style={{
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {/* Preset Buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
              marginBottom: '32px',
            }}
          >
            {PRESETS.map((p) => {
              const isActive = selectedMinutes === p.minutes;
              return (
                <button
                  key={p.minutes}
                  onClick={() => handleSelectPreset(p.minutes)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    backgroundColor: isActive ? 'var(--primary-accent)' : 'var(--bg-surface)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    border: isActive ? '1px solid var(--primary-accent)' : '1px solid var(--border-subtle)',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {p.label} ({p.minutes}m)
                </button>
              );
            })}
          </div>

          {/* SVG Circular Gauge */}
          <div style={{ position: 'relative', width: '280px', height: '280px', margin: '0 auto 32px' }}>
            <svg width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background track circle */}
              <circle
                cx="140"
                cy="140"
                r="120"
                fill="none"
                stroke="oklch(0.2 0.02 250 / 0.5)"
                strokeWidth="10"
              />
              {/* Progress active circle */}
              <circle
                cx="140"
                cy="140"
                r="120"
                fill="none"
                stroke="url(#timerGradient)"
                strokeWidth="10"
                strokeDasharray="754"
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

            {/* Inner Clock Face */}
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
              <div
                style={{
                  fontSize: '3.6rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '-0.04em',
                  color: 'var(--text-main)',
                  lineHeight: 1,
                }}
              >
                {timeFormatted}
              </div>
              <div
                style={{
                  fontSize: '0.82rem',
                  color: isRunning ? 'var(--accent-emerald)' : 'var(--text-muted)',
                  marginTop: '8px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isRunning && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-emerald)',
                      boxShadow: '0 0 8px var(--accent-emerald)',
                    }}
                  />
                )}
                {isRunning ? 'DEEP WORK IN PROGRESS' : 'READY TO SPRINT'}
              </div>
            </div>
          </div>

          {/* Controls: Play, Pause, Reset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={handleReset}
              className="btn-ghost"
              title="Reset Timer"
              style={{ width: '44px', height: '44px', borderRadius: '50%', padding: 0, justifyContent: 'center' }}
            >
              <RotateCcw size={18} />
            </button>

            {isRunning ? (
              <button
                onClick={handlePause}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '2px solid var(--accent-amber)',
                  color: 'var(--accent-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px oklch(0.78 0.18 75 / 0.25)',
                }}
              >
                <Pause size={26} />
              </button>
            ) : (
              <button
                onClick={handleStart}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-cyan) 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 24px var(--primary-accent-glow)',
                }}
              >
                <Play size={26} style={{ marginLeft: '3px' }} />
              </button>
            )}

            <button
              onClick={handleComplete}
              className="btn-ghost"
              title="Finish Early & Log Session"
              style={{ width: '44px', height: '44px', borderRadius: '50%', padding: 0, justifyContent: 'center' }}
            >
              <Check size={18} color="var(--accent-emerald)" />
            </button>
          </div>

          {recentLogged && (
            <div
              style={{
                marginTop: '16px',
                color: 'var(--accent-emerald)',
                fontSize: '0.84rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={16} />
              <span>Session saved! Confetti celebratory burst fired.</span>
            </div>
          )}
        </div>

        {/* Right: Session Context & Task Linking */}
        {!isFullscreen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
                Session Alignment
              </h3>

              {/* Link to Task */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  LINK TO TASK
                </label>
                <select
                  value={linkedTaskId}
                  onChange={(e) => setLinkedTaskId(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">No specific task (General Deep Work)</option>
                  {tasks
                    .filter((t) => t.status !== 'done')
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.priority})
                      </option>
                    ))}
                </select>
              </div>

              {/* Link to Project */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  LINK TO PROJECT
                </label>
                <select
                  value={linkedProjectId}
                  onChange={(e) => setLinkedProjectId(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">No specific project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      📁 {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Objective / Note */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  INTENTION & NOTES
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={3}
                  placeholder="What is your single focus objective for this sprint?"
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Today's Total Focus</span>
                <span style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>
                  {todayFocusMinutes} minutes
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
