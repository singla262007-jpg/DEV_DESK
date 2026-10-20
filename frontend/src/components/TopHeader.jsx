import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Menu,
  Search,
  Volume2,
  VolumeX,
  Bell,
  Database,
  Plus,
  Command,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { toggleAmbientNoise } from '../utils/audio';

export default function TopHeader({
  currentViewTitle,
  onOpenCommandPalette,
  onOpenNotifications,
  unreadNotifications = 0,
  isConnected = true,
  onQuickAddTask,
  onToggleMobileMenu,
}) {
  const [ambientActive, setAmbientActive] = useState(false);
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSound = () => {
    const active = toggleAmbientNoise();
    setAmbientActive(active);
  };

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return (
    <header
      style={{
        height: '64px',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleMobileMenu}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            color: 'var(--text-muted)',
            padding: '6px',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-faint)' }}>DevDesk</span>
          <span style={{ color: 'var(--border-subtle)' }}>/</span>
          <span style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {currentViewTitle}
          </span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div style={{ flex: 1, maxWidth: '420px', margin: '0 20px' }}>
        <button
          onClick={onOpenCommandPalette}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            fontSize: '0.84rem',
            transition: 'border-color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={15} color="var(--text-faint)" />
            <span>Search tasks, projects, actions...</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '0.72rem',
              backgroundColor: 'var(--bg-surface-elevated)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Command size={11} />
            <span>{isMac ? 'K' : 'Ctrl+K'}</span>
          </div>
        </button>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Quick Add Task Button */}
        <button
          onClick={onQuickAddTask}
          className="btn-primary"
          style={{ padding: '7px 12px', fontSize: '0.82rem' }}
          title="Create New Task (or press Cmd+K)"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span className="hide-mobile">New Task</span>
        </button>

        {/* Ambient Audio Generator */}
        <button
          onClick={handleToggleSound}
          title={ambientActive ? 'Mute Ambient Soundscape' : 'Enable Focus Ambient Noise (Brown Noise)'}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: ambientActive ? 'oklch(0.65 0.26 285 / 0.15)' : 'var(--bg-surface)',
            color: ambientActive ? 'var(--accent-violet)' : 'var(--text-muted)',
            border: ambientActive ? '1px solid var(--accent-violet)' : '1px solid var(--border-subtle)',
          }}
        >
          {ambientActive ? <Volume2 size={17} /> : <VolumeX size={17} />}
        </button>

        {/* Notifications Center Trigger */}
        <button
          onClick={onOpenNotifications}
          title="Notification Center"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
            position: 'relative',
          }}
        >
          <Bell size={17} />
          {unreadNotifications > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-rose)',
                boxShadow: '0 0 8px var(--accent-rose)',
              }}
            />
          )}
        </button>

        {/* Live Clock (Desktop only) */}
        <div
          className="hide-mobile"
          style={{
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* MongoDB Connectivity Badge */}
        <div
          title={isConnected ? 'Connected to MongoDB Atlas' : 'Offline Mode (Local Storage Synced)'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isConnected ? 'oklch(0.72 0.18 155 / 0.1)' : 'oklch(0.78 0.18 75 / 0.1)',
            border: isConnected ? '1px solid oklch(0.72 0.18 155 / 0.3)' : '1px solid oklch(0.78 0.18 75 / 0.3)',
            fontSize: '0.72rem',
            color: isConnected ? 'var(--accent-emerald)' : 'var(--accent-amber)',
          }}
        >
          <Database size={12} />
          <span className="hide-mobile">{isConnected ? 'Atlas Online' : 'Local Mode'}</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex !important;
          }
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
