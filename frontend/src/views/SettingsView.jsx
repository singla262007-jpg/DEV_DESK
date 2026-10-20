import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  Palette,
  Timer,
  Keyboard,
  Download,
  Moon,
  Sun,
  Volume2,
  Check,
  Shield,
  Sparkles,
} from 'lucide-react';

const ACCENTS = [
  { id: 'violet', label: 'Obsidian Violet', color: 'oklch(0.65 0.26 285)', glow: 'oklch(0.65 0.26 285 / 0.25)' },
  { id: 'cyan', label: 'Electric Cyan', color: 'oklch(0.74 0.17 195)', glow: 'oklch(0.74 0.17 195 / 0.25)' },
  { id: 'emerald', label: 'Neon Emerald', color: 'oklch(0.72 0.18 155)', glow: 'oklch(0.72 0.18 155 / 0.25)' },
  { id: 'amber', label: 'Amber Flame', color: 'oklch(0.78 0.18 75)', glow: 'oklch(0.78 0.18 75 / 0.25)' },
  { id: 'rose', label: 'Sunset Rose', color: 'oklch(0.68 0.22 25)', glow: 'oklch(0.68 0.22 25 / 0.25)' },
];

export default function SettingsView({
  theme,
  onThemeChange,
  activeAccent,
  onAccentChange,
  tasks = [],
  projects = [],
}) {
  const [pomodoroMins, setPomodoroMins] = useState(25);
  const [shortBreakMins, setShortBreakMins] = useState(5);
  const [longBreakMins, setLongBreakMins] = useState(15);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const p = localStorage.getItem('devdesk_timer_settings');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.pomodoro) setPomodoroMins(parsed.pomodoro);
        if (parsed.shortBreak) setShortBreakMins(parsed.shortBreak);
        if (parsed.longBreak) setLongBreakMins(parsed.longBreak);
      }
    } catch (_) {}
  }, []);

  const handleSaveTimerDefaults = () => {
    try {
      localStorage.setItem(
        'devdesk_timer_settings',
        JSON.stringify({ pomodoro: pomodoroMins, shortBreak: shortBreakMins, longBreak: longBreakMins })
      );
      alert('Timer defaults saved!');
    } catch (_) {}
  };

  const handleExportAll = () => {
    const data = {
      exportTimestamp: new Date().toISOString(),
      tasks,
      projects,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devdesk-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: '1040px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '26px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Preferences & Personalization</h1>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Tailor appearance, timer presets, keyboard shortcuts, and export personal developer data.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Appearance & Color Themes */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Palette size={18} color="var(--primary-accent)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Appearance & Themes</h3>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              COLOR MODE
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => onThemeChange('dark')}
                className={theme === 'dark' ? 'btn-primary' : 'btn-ghost'}
                style={{ padding: '8px 16px' }}
              >
                <Moon size={15} />
                <span>Obsidian Dark (Recommended)</span>
              </button>
              <button
                onClick={() => onThemeChange('light')}
                className={theme === 'light' ? 'btn-primary' : 'btn-ghost'}
                style={{ padding: '8px 16px' }}
              >
                <Sun size={15} />
                <span>Modern Light</span>
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              ACCENT PALETTE
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {ACCENTS.map((acc) => {
                const isSelected = activeAccent === acc.id;
                return (
                  <button
                    key={acc.id}
                    onClick={() => onAccentChange(acc.id, acc.color, acc.glow)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? 'var(--bg-surface-active)' : 'var(--bg-surface)',
                      border: isSelected ? `2px solid ${acc.color}` : '1px solid var(--border-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: acc.color,
                        boxShadow: `0 0 8px ${acc.color}`,
                      }}
                    />
                    <span>{acc.label}</span>
                    {isSelected && <Check size={14} color={acc.color} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Timer Defaults */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Timer size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Focus Timer Defaults</h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '18px',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                POMODORO SPRINT (MINS)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={pomodoroMins}
                onChange={(e) => setPomodoroMins(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                SHORT BREAK (MINS)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={shortBreakMins}
                onChange={(e) => setShortBreakMins(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                LONG BREAK (MINS)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={longBreakMins}
                onChange={(e) => setLongBreakMins(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <button onClick={handleSaveTimerDefaults} className="btn-ghost" style={{ padding: '8px 16px' }}>
            Save Timer Presets
          </button>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Keyboard size={18} color="var(--accent-amber)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Keyboard Navigation</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { key: 'Cmd + K / Ctrl + K', action: 'Open Global Command Palette' },
              { key: 'Escape', action: 'Dismiss modal, drawer, or palette' },
              { key: 'Enter', action: 'Submit quick-add task or select command' },
              { key: 'Arrow Up / Down', action: 'Navigate command palette search results' },
            ].map((shortcut, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>{shortcut.action}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    padding: '3px 7px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-base)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                  }}
                >
                  {shortcut.key}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Backup & Privacy */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Shield size={18} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Data Sovereignty & Local Backup</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
            All task lifecycles, focus sessions, and projects are securely stored in your personal MongoDB Atlas database. You can export a snapshot backup at any time.
          </p>
          <button onClick={handleExportAll} className="btn-primary">
            <Download size={15} />
            <span>Export Complete Workspace Backup (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
