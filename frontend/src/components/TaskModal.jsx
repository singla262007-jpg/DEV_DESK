import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Tag,
  FolderGit2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../api';

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  taskToEdit = null,
  projects = [],
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [projectId, setProjectId] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'medium');
      setStatus(taskToEdit.status || 'todo');
      setDueDate(taskToEdit.due_date || '');
      setDueTime(taskToEdit.due_time || '');
      setProjectId(taskToEdit.project_id || '');
      setEstimatedMinutes(taskToEdit.estimated_minutes || 25);
      setTags(taskToEdit.tags || []);
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setDueDate(new Date().toISOString().slice(0, 10));
      setDueTime('');
      setProjectId('');
      setEstimatedMinutes(25);
      setTags([]);
      setSubtasks([]);
    }
    setError('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    const stTitle = newSubtaskTitle.trim();
    if (stTitle) {
      setSubtasks([
        ...subtasks,
        { id: `st-${Date.now()}-${subtasks.length}`, title: stTitle, completed: false },
      ]);
      setNewSubtaskTitle('');
    }
  };

  const handleToggleSubtask = (id) => {
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  // Smart AI / Heuristic subtask breakdown
  const handleAIBreakdown = async () => {
    if (!title.trim()) {
      setError('Please provide a task title first to generate subtasks.');
      return;
    }
    setIsBreakingDown(true);
    try {
      const res = await api.breakdownTask(title);
      if (res && res.subtasks) {
        setSubtasks((prev) => [...prev, ...res.subtasks]);
      }
    } catch {
      // Fallback local breakdown
      setSubtasks((prev) => [
        ...prev,
        { id: `st-${Date.now()}-1`, title: 'Define scope and dependencies', completed: false },
        { id: `st-${Date.now()}-2`, title: 'Implement functional logic', completed: false },
        { id: `st-${Date.now()}-3`, title: 'Verification and testing', completed: false },
      ]);
    } finally {
      setIsBreakingDown(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        due_date: dueDate || null,
        due_time: dueTime || null,
        project_id: projectId || null,
        estimated_minutes: Number(estimatedMinutes) || 0,
        tags,
        subtasks,
      };

      await onSave(payload, taskToEdit ? taskToEdit.id : null);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 64px oklch(0 0 0 / 0.5)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'oklch(0.65 0.26 285 / 0.15)',
                color: 'var(--primary-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {taskToEdit ? 'Edit Task' : 'Create New Task'}
              </h2>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Configure priorities, subtasks, project tags, and estimates
              </div>
            </div>
          </div>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'oklch(0.68 0.22 25 / 0.15)',
                border: '1px solid oklch(0.68 0.22 25 / 0.3)',
                color: 'var(--accent-rose)',
                fontSize: '0.84rem',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Title input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              TASK TITLE *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Refactor database indexing & connection pooling"
              style={{ width: '100%', fontSize: '0.94rem' }}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              DESCRIPTION & NOTES
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add key context, acceptance criteria, or code links..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Row: Priority, Status, Project */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '14px',
              marginBottom: '18px',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                PRIORITY
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="high">🔥 High Priority</option>
                <option value="medium">⚡ Medium Priority</option>
                <option value="low">🌱 Low Priority</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                STATUS
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="todo">📋 To Do</option>
                <option value="in-progress">⚙️ In Progress</option>
                <option value="done">✅ Done</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                PROJECT
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">No Project (Standalone)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    📁 {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Due Date, Due Time, Estimated Minutes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '14px',
              marginBottom: '20px',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                DUE DATE
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                TIME (OPTIONAL)
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                ESTIMATED TIME (MINS)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Subtasks Section with AI Assistant breakdown trigger */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                SUBTASKS & CHECKLIST ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
              </label>
              <button
                type="button"
                onClick={handleAIBreakdown}
                disabled={isBreakingDown}
                style={{
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: 'var(--accent-cyan)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid oklch(0.74 0.17 195 / 0.3)',
                  backgroundColor: 'oklch(0.74 0.17 195 / 0.1)',
                }}
              >
                <Sparkles size={12} />
                <span>{isBreakingDown ? 'Decomposing...' : 'Smart Breakdown'}</span>
              </button>
            </div>

            {/* List of subtasks */}
            {subtasks.length > 0 && (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                  marginBottom: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 6px',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(st.id)}
                        style={{ accentColor: 'var(--primary-accent)', cursor: 'pointer' }}
                      />
                      <span
                        style={{
                          fontSize: '0.84rem',
                          color: st.completed ? 'var(--text-faint)' : 'var(--text-main)',
                          textDecoration: st.completed ? 'line-through' : 'none',
                        }}
                      >
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      style={{ color: 'var(--text-faint)', padding: '2px 6px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add subtask input */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add actionable subtask..."
                style={{ flex: 1, fontSize: '0.84rem', padding: '8px 12px' }}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="btn-ghost"
                style={{ padding: '8px 14px' }}
              >
                <Plus size={15} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              TAGS & LABELS
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {tags.map((t) => (
                <span
                  key={t}
                  className="badge badge-violet"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px' }}
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    style={{ color: 'inherit', display: 'flex', alignItems: 'center' }}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="e.g. backend, bug, api, ui"
                style={{ flex: 1, fontSize: '0.84rem', padding: '7px 12px' }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn-ghost"
                style={{ padding: '7px 12px' }}
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div
            style={{
              paddingTop: '18px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
