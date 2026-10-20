import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications = [],
  onMarkRead,
  onMarkAllRead,
  onClearAll,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 90,
            }}
          />

          {/* Slide-over panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '380px',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderLeft: '1px solid var(--border-medium)',
              boxShadow: '-10px 0 40px oklch(0 0 0 / 0.5)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} color="var(--primary-accent)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Notifications</h3>
                {notifications.some((n) => !n.read) && (
                  <span className="badge badge-rose" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                    {notifications.filter((n) => !n.read).length} new
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={onMarkAllRead}
                      title="Mark all as read"
                      style={{
                        padding: '6px',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <CheckCheck size={16} />
                    </button>
                    <button
                      onClick={onClearAll}
                      title="Clear read notifications"
                      style={{
                        padding: '6px',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  style={{
                    padding: '6px',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Sparkles size={32} color="var(--text-faint)" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>All caught up!</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '4px' }}>
                    No alerts or upcoming task deadline warnings at this time.
                  </div>
                </div>
              ) : (
                notifications.map((n) => {
                  const isUnread = !n.read;
                  return (
                    <div
                      key={n.id}
                      onClick={() => onMarkRead(n.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isUnread ? 'var(--bg-surface-active)' : 'transparent',
                        border: isUnread ? '1px solid var(--border-medium)' : '1px solid var(--border-subtle)',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ marginTop: '2px' }}>
                          {n.type === 'warning' || n.type === 'deadline' ? (
                            <AlertTriangle size={16} color="var(--accent-amber)" />
                          ) : n.type === 'success' ? (
                            <Check size={16} color="var(--accent-emerald)" />
                          ) : (
                            <Info size={16} color="var(--accent-cyan)" />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.84rem',
                              fontWeight: 600,
                              color: 'var(--text-main)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>{n.title}</span>
                            {isUnread && (
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: 'var(--primary-accent)',
                                }}
                              />
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--text-muted)',
                              marginTop: '3px',
                              lineHeight: 1.4,
                            }}
                          >
                            {n.message}
                          </div>
                          <div
                            style={{
                              fontSize: '0.7rem',
                              color: 'var(--text-faint)',
                              marginTop: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Clock size={11} />
                            {new Date(n.created_at || Date.now()).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
