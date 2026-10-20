import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  CheckCircle2,
  Clock,
  FolderGit2,
  Target,
  FileText,
  Sparkles,
} from 'lucide-react';
import { api } from '../api';

export default function ActivityView() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const data = await api.getActivity(50);
        if (data) setActivities(data);
      } catch (err) {
        console.warn('Failed to load activity:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchActivity();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'task':
        return <CheckCircle2 size={16} color="var(--accent-emerald)" />;
      case 'focus':
        return <Clock size={16} color="var(--accent-cyan)" />;
      case 'project':
        return <FolderGit2 size={16} color="var(--accent-violet)" />;
      case 'goal':
        return <Target size={16} color="var(--accent-amber)" />;
      case 'note':
        return <FileText size={16} color="var(--accent-rose)" />;
      default:
        return <Activity size={16} color="var(--primary-accent)" />;
    }
  };

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '26px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Activity Timeline</h1>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Chronological audit trail of all developer actions, task achievements, and deep work blocks.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading timeline...
          </div>
        ) : activities.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Sparkles size={32} color="var(--text-faint)" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>No recorded activity yet</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '4px' }}>
              Your task completions and focus sessions will automatically populate this timeline.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activities.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-base)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getIcon(item.entity_type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {item.description}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                    {new Date(item.created_at || Date.now()).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <span className="badge badge-violet" style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
                  {item.entity_type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
