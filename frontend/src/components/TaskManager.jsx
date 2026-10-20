import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Check, Trash2, Calendar, Tag, AlertCircle, Sparkles } from 'lucide-react';
import { playTaskPop } from '../utils/audio';
import { api } from '../api';

const PRIORITIES = [
  { id: 'high', label: 'High', color: 'var(--accent-rose)', bg: 'oklch(0.68 0.22 25 / 0.15)' },
  { id: 'medium', label: 'Medium', color: 'var(--accent-amber)', bg: 'oklch(0.78 0.18 75 / 0.15)' },
  { id: 'low', label: 'Low', color: 'var(--accent-cyan)', bg: 'oklch(0.74 0.17 195 / 0.15)' },
];

const CATEGORIES = ['Work', 'Study', 'Health', 'Personal', 'General'];

export default function TaskManager({ tasks, onTasksChanged }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Work');
  const [dueDate, setDueDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Quick submission
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.createTask({
        title,
        priority,
        category,
        due_date: dueDate || null,
      });
      setTitle('');
      setDueDate('');
      if (onTasksChanged) onTasksChanged();
    } catch (err) {
      alert('Could not save task: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    if (nextStatus === 'done') {
      playTaskPop();
    }
    await api.updateTask(task.id, { status: nextStatus });
    if (onTasksChanged) onTasksChanged();
  };

  // Delete
  const handleDeleteTask = async (id) => {
    await api.deleteTask(id);
    if (onTasksChanged) onTasksChanged();
  };

  // Filter & Search
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Status Filter
      if (activeFilter === 'todo') return t.status === 'todo';
      if (activeFilter === 'done') return t.status === 'done';
      if (activeFilter === 'high') return t.priority === 'high';
      if (activeFilter === 'overdue') return t.status === 'todo' && t.due_date && t.due_date < todayStr;
      return true;
    });
  }, [tasks, searchQuery, activeFilter, todayStr]);

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--accent-violet)" />
          Task Backlog & Flow
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* Task Creation Form */}
      <form onSubmit={handleAddTask} style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            background: 'oklch(0.15 0.02 250 / 0.8)',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add new task... (e.g. Finish feature specs)"
            maxLength={200}
            required
            style={{
              flex: '1 1 200px',
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.9rem',
              color: 'var(--text-main)',
            }}
          />

          {/* Priority selector */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{
              padding: '8px 10px',
              background: 'oklch(0.18 0.02 250)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: 'var(--text-main)',
              outline: 'none',
            }}
          >
            {PRIORITIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} Priority
              </option>
            ))}
          </select>

          {/* Category selector */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: '8px 10px',
              background: 'oklch(0.18 0.02 250)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: 'var(--text-main)',
              outline: 'none',
            }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                #{cat}
              </option>
            ))}
          </select>

          {/* Due date */}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{
              padding: '8px 10px',
              background: 'oklch(0.18 0.02 250)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: 'var(--text-main)',
              outline: 'none',
            }}
          />

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))',
              color: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            <Plus size={16} />
            <span>Add</span>
          </motion.button>
        </div>
      </form>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '16px',
        }}
      >
        {/* Search */}
        <div
          style={{
            position: 'relative',
            flex: '1 1 200px',
            maxWidth: '300px',
          }}
        >
          <Search
            size={14}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks or tags..."
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              background: 'oklch(0.16 0.02 250 / 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'todo', label: 'To Do' },
            { id: 'done', label: 'Completed' },
            { id: 'high', label: 'High Priority' },
            { id: 'overdue', label: 'Overdue' },
          ].map((f) => {
            const active = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  background: active ? 'var(--accent-violet)' : 'transparent',
                  color: active ? '#ffffff' : 'var(--text-muted)',
                  border: `1px solid ${active ? 'var(--accent-violet)' : 'var(--border-subtle)'}`,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List with AnimatePresence */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.li
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                padding: '36px 16px',
                textAlign: 'center',
                color: 'var(--text-faint)',
                fontSize: '0.88rem',
              }}
            >
              No tasks found in this view. Add one above to build momentum!
            </motion.li>
          ) : (
            filteredTasks.map((task) => {
              const isDone = task.status === 'done';
              const isOverdue = !isDone && task.due_date && task.due_date < todayStr;
              const priorityConfig = PRIORITIES.find((p) => p.id === task.priority) || PRIORITIES[1];

              return (
                <motion.li
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    marginBottom: '8px',
                    borderRadius: 'var(--radius-md)',
                    background: isDone ? 'oklch(0.13 0.01 250 / 0.4)' : 'oklch(0.16 0.02 250 / 0.6)',
                    border: `1px solid ${isOverdue ? 'oklch(0.68 0.22 25 / 0.4)' : 'var(--border-subtle)'}`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Custom Checkbox */}
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleToggleStatus(task)}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isDone ? 'var(--accent-emerald)' : 'transparent',
                      border: `2px solid ${isDone ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                      flexShrink: 0,
                    }}
                  >
                    {isDone && <Check size={14} color="#ffffff" strokeWidth={3} />}
                  </motion.button>

                  {/* Title & Tag */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: isDone ? 'var(--text-faint)' : 'var(--text-main)',
                        textDecoration: isDone ? 'line-through' : 'none',
                        wordBreak: 'break-word',
                      }}
                    >
                      {task.title}
                    </div>
                  </div>

                  {/* Category Pill */}
                  {task.category && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'oklch(0.2 0.02 250 / 0.5)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)',
                        flexShrink: 0,
                      }}
                    >
                      #{task.category}
                    </span>
                  )}

                  {/* Priority Tag */}
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      color: priorityConfig.color,
                      background: priorityConfig.bg,
                      border: `1px solid ${priorityConfig.color}`,
                      flexShrink: 0,
                    }}
                  >
                    {priorityConfig.label}
                  </span>

                  {/* Due Date Indicator */}
                  {task.due_date && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        color: isOverdue ? 'var(--accent-rose)' : 'var(--text-muted)',
                        fontWeight: isOverdue ? 700 : 400,
                        flexShrink: 0,
                      }}
                    >
                      {isOverdue && <AlertCircle size={12} />}
                      <Calendar size={12} />
                      {task.due_date === todayStr ? 'Today' : task.due_date}
                    </span>
                  )}

                  {/* Delete Button */}
                  <motion.button
                    whileHover={{ scale: 1.15, color: 'var(--accent-rose)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteTask(task.id)}
                    style={{
                      color: 'var(--text-faint)',
                      padding: '4px',
                      flexShrink: 0,
                    }}
                    title="Delete task"
                  >
                    <Trash2 size={15} />
                  </motion.button>
                </motion.li>
              );
            })
          )}
        </AnimatePresence>
      </ul>
    </div>
  );
}
