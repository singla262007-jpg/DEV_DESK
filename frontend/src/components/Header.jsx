import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame, Sparkles, Volume2, VolumeX, Database, RefreshCw, Zap } from 'lucide-react';
import { toggleAmbientNoise } from '../utils/audio';

export default function Header({ stats, onRefresh, isConnected }) {
  const [ambientActive, setAmbientActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAmbientToggle = () => {
    const nextState = !ambientActive;
    toggleAmbientNoise(nextState);
    setAmbientActive(nextState);
  };

  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Calculate flow momentum score
  const momentumScore = Math.min(100, (stats.completionRate || 0) + Math.min(50, (stats.focusToday || 0)));

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass-panel"
      style={{
        padding: '16px 24px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      {/* Brand & Date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px var(--accent-violet-glow)',
          }}
        >
          <Zap size={24} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Productivity Pulse</h1>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'oklch(0.65 0.26 285 / 0.18)',
                color: 'var(--accent-violet)',
                border: '1px solid oklch(0.65 0.26 285 / 0.3)',
              }}
            >
              Pro Studio
            </span>
          </div>
          <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {formattedDate} · <span style={{ color: 'var(--text-main)', fontVariantNumeric: 'tabular-nums' }}>{formattedTime}</span>
          </p>
        </div>
      </div>

      {/* Action Controls & Momentum Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Momentum Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'oklch(0.18 0.03 250 / 0.6)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
          }}
          title="Daily Momentum Score: Combines task completions and focus minutes"
        >
          <Flame size={16} color="oklch(0.78 0.18 75)" />
          <span style={{ color: 'var(--text-muted)' }}>Flow Momentum:</span>
          <strong style={{ color: 'var(--accent-amber)' }}>{momentumScore}%</strong>
        </div>

        {/* Ambient Soundscape Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAmbientToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-full)',
            background: ambientActive ? 'oklch(0.74 0.17 195 / 0.2)' : 'oklch(0.18 0.03 250 / 0.6)',
            color: ambientActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
            border: `1px solid ${ambientActive ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
          title="Toggle ambient rain soundscape for deep focus"
        >
          {ambientActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>{ambientActive ? 'Rain Focus On' : 'Ambient Noise'}</span>
        </motion.button>

        {/* Refresh Button */}
        <motion.button
          whileHover={{ scale: 1.08, rotate: 90 }}
          whileTap={{ scale: 0.92 }}
          onClick={onRefresh}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'oklch(0.18 0.03 250 / 0.6)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
          }}
          title="Sync latest data"
        >
          <RefreshCw size={16} />
        </motion.button>

        {/* Database indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.74rem',
            background: isConnected ? 'oklch(0.72 0.18 155 / 0.12)' : 'oklch(0.78 0.18 75 / 0.12)',
            color: isConnected ? 'var(--accent-emerald)' : 'var(--accent-amber)',
            border: `1px solid ${isConnected ? 'oklch(0.72 0.18 155 / 0.3)' : 'oklch(0.78 0.18 75 / 0.3)'}`,
          }}
          title={isConnected ? 'Connected to backend server' : 'Running in local reactive mode'}
        >
          <Database size={13} />
          <span>{isConnected ? 'Live Sync' : 'Local State'}</span>
        </div>
      </div>
    </motion.header>
  );
}
