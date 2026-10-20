import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Calendar,
  Filter,
  Columns,
  List as ListIcon,
  CalendarDays,
  Tag,
  AlertCircle,
  FolderGit2,
  ArrowRight,
  MoreVertical,
} from 'lucide-react';
import { playTaskPop } from '../utils/audio';

export default function TasksView({
  tasks = [],
  projects = [],
  onOpenTaskModal,
  onEditTask,
  onToggleStatus,
  onDeleteTask,
  onBulkUpdateStatus,
}) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban', 'list', 'calendar'
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState('medium');

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (projectFilter !== 'all') {
      if (projectFilter === 'none' && t.project_id) return false;
      if (projectFilter !== 'none' && t.project_id !== projectFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }
    return true;
  });

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onOpenTaskModal({
      title: quickTitle.trim(),
      priority: quickPriority,
    });
    setQuickTitle('');
  };

  const handleStatusChange = (task, newStatus) => {
    if (newStatus === 'done' && task.status !== 'done') {
      playTaskPop();
    }
    onToggleStatus(task, newStatus);
  };

  const kanbanColumns = [
    { id: 'todo', title: 'To Do', color: 'var(--accent-violet)', count: filteredTasks.filter((t) => t.status === 'todo').length },
    { id: 'in-progress', title: 'In Progress', color: 'var(--accent-cyan)', count: filteredTasks.filter((t) => t.status === 'in-progress').length },
    { id: 'done', title: 'Done', color: 'var(--accent-emerald)', count: filteredTasks.filter((t) => t.status === 'done').length },
  ];

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Top Header & View Mode Switcher */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>My Tasks Workspace</h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Organize, prioritize, and execute across Kanban, List, and Deadline views.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              padding: '3px',
            }}
          >
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.82rem',
                fontWeight: 600,
                backgroundColor: viewMode === 'kanban' ? 'var(--primary-accent)' : 'transparent',
                color: viewMode === 'kanban' ? '#ffffff' : 'var(--text-muted)',
              }}
            >
              <Columns size={15} />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.82rem',
                fontWeight: 600,
                backgroundColor: viewMode === 'list' ? 'var(--primary-accent)' : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : 'var(--text-muted)',
              }}
            >
              <ListIcon size={15} />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.82rem',
                fontWeight: 600,
                backgroundColor: viewMode === 'calendar' ? 'var(--primary-accent)' : 'transparent',
                color: viewMode === 'calendar' ? '#ffffff' : 'var(--text-muted)',
              }}
            >
              <CalendarDays size={15} />
              <span>Calendar</span>
            </button>
          </div>

          <button onClick={() => onOpenTaskModal()} className="btn-primary">
            <Plus size={16} strokeWidth={2.4} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', flex: 1 }}>
          {/* Search box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-base)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              minWidth: '220px',
            }}
          >
            <Search size={15} color="var(--text-faint)" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks or tags..."
              style={{ background: 'transparent', border: 'none', padding: 0, fontSize: '0.84rem' }}
            />
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Project filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
          >
            <option value="all">All Projects</option>
            <option value="none">Standalone (No Project)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredTasks.length}</strong> of {tasks.length} tasks
        </div>
      </div>

      {/* Quick Add Inline Bar */}
      <form
        onSubmit={handleQuickAdd}
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '24px',
        }}
      >
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="+ Quick add a task to your backlog (Press Enter to detail)..."
          style={{ flex: 1, padding: '10px 16px', fontSize: '0.9rem' }}
        />
        <select
          value={quickPriority}
          onChange={(e) => setQuickPriority(e.target.value)}
          style={{ padding: '0 12px' }}
        >
          <option value="high">🔥 High</option>
          <option value="medium">⚡ Medium</option>
          <option value="low">🌱 Low</option>
        </select>
        <button type="submit" className="btn-ghost">
          <Plus size={16} />
          <span>Add</span>
        </button>
      </form>

      {/* VIEW: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '18px',
            alignItems: 'start',
          }}
        >
          {kanbanColumns.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="glass-panel"
                style={{
                  padding: '16px',
                  minHeight: '480px',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '12px',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: col.color,
                        boxShadow: `0 0 8px ${col.color}`,
                      }}
                    />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{col.title}</h3>
                  </div>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-base)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {col.count}
                  </span>
                </div>

                {/* Task Cards in Column */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {columnTasks.length === 0 ? (
                    <div
                      style={{
                        padding: '36px 12px',
                        textAlign: 'center',
                        color: 'var(--text-faint)',
                        fontSize: '0.8rem',
                        border: '1px dashed var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      No tasks in {col.title.toLowerCase()}
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const priorityColor =
                        task.priority === 'high'
                          ? 'var(--accent-rose)'
                          : task.priority === 'medium'
                          ? 'var(--accent-amber)'
                          : 'var(--accent-emerald)';

                      const project = projects.find((p) => p.id === task.project_id);

                      return (
                        <motion.div
                          key={task.id}
                          layout
                          whileHover={{ y: -2 }}
                          style={{
                            padding: '14px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-subtle)',
                            boxShadow: '0 4px 14px oklch(0 0 0 / 0.15)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.35 }}>
                              {task.title}
                            </div>
                            <button
                              onClick={() => onEditTask(task)}
                              title="Edit task"
                              style={{ color: 'var(--text-faint)', padding: '2px' }}
                            >
                              <Edit2 size={13} />
                            </button>
                          </div>

                          {task.description && (
                            <p
                              style={{
                                fontSize: '0.78rem',
                                color: 'var(--text-muted)',
                                margin: 0,
                                lineClamp: 2,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {task.description}
                            </p>
                          )}

                          {/* Subtasks Progress */}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={12} color="var(--primary-accent)" />
                              <span>
                                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
                              </span>
                            </div>
                          )}

                          {/* Footer: Tags, Project, Due Date, Move Buttons */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingTop: '8px',
                              borderTop: '1px solid var(--border-subtle)',
                              marginTop: '2px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '2px 6px',
                                  borderRadius: 'var(--radius-full)',
                                  backgroundColor: 'var(--bg-base)',
                                  color: priorityColor,
                                  border: `1px solid ${priorityColor}`,
                                  textTransform: 'capitalize',
                                  fontWeight: 600,
                                }}
                              >
                                {task.priority}
                              </span>

                              {project && (
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    padding: '2px 6px',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: 'var(--bg-base)',
                                    color: project.color || 'var(--accent-violet)',
                                    border: '1px solid var(--border-subtle)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                  }}
                                >
                                  <FolderGit2 size={10} />
                                  {project.name}
                                </span>
                              )}

                              {task.due_date && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <Clock size={10} />
                                  {task.due_date}
                                </span>
                              )}
                            </div>

                            {/* Move status buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {col.id !== 'todo' && (
                                <button
                                  onClick={() => handleStatusChange(task, col.id === 'done' ? 'in-progress' : 'todo')}
                                  title="Move backwards"
                                  style={{ fontSize: '0.7rem', color: 'var(--text-faint)', padding: '2px 4px' }}
                                >
                                  ←
                                </button>
                              )}
                              {col.id !== 'done' && (
                                <button
                                  onClick={() => handleStatusChange(task, col.id === 'todo' ? 'in-progress' : 'done')}
                                  title="Advance status"
                                  style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--primary-accent)',
                                    fontWeight: 700,
                                    padding: '2px 4px',
                                  }}
                                >
                                  →
                                </button>
                              )}
                              <button
                                onClick={() => onDeleteTask(task.id)}
                                title="Delete task"
                                style={{ color: 'var(--text-faint)', padding: '2px 4px' }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: DETAILED LIST */}
      {viewMode === 'list' && (
        <div className="glass-panel" style={{ padding: '8px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 14px', width: '40px' }}>Done</th>
                <th style={{ padding: '12px 14px' }}>Title & Description</th>
                <th style={{ padding: '12px 14px' }}>Priority</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px' }}>Project</th>
                <th style={{ padding: '12px 14px' }}>Due Date</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No matching tasks found.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const project = projects.find((p) => p.id === t.project_id);
                  const isDone = t.status === 'done';
                  return (
                    <tr
                      key={t.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: isDone ? 'oklch(0.12 0.01 250 / 0.4)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <button
                          onClick={() => handleStatusChange(t, isDone ? 'todo' : 'done')}
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '5px',
                            border: '2px solid var(--border-medium)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isDone && <CheckCircle2 size={14} color="var(--accent-emerald)" />}
                        </button>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: isDone ? 'var(--text-faint)' : 'var(--text-main)',
                            textDecoration: isDone ? 'line-through' : 'none',
                          }}
                        >
                          {t.title}
                        </div>
                        {t.description && (
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                            {t.description}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          className={
                            t.priority === 'high' ? 'badge-rose' : t.priority === 'medium' ? 'badge-amber' : 'badge-emerald'
                          }
                          style={{ textTransform: 'capitalize', fontSize: '0.72rem', padding: '2px 6px' }}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t, e.target.value)}
                          style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                        {project ? project.name : '—'}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                        {t.due_date || '—'}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button onClick={() => onEditTask(t)} style={{ color: 'var(--text-muted)' }}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => onDeleteTask(t.id)} style={{ color: 'var(--accent-rose)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW: CALENDAR / DEADLINE VIEW */}
      {viewMode === 'calendar' && (
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Calendar size={18} color="var(--primary-accent)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Upcoming Scheduled Deadlines</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredTasks
              .filter((t) => t.due_date)
              .sort((a, b) => a.due_date.localeCompare(b.due_date))
              .map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--bg-base)',
                        border: '1px solid var(--border-medium)',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', color: 'var(--primary-accent)', fontWeight: 700 }}>
                        DUE
                      </div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800 }}>{task.due_date}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{task.title}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Status: {task.status} · Priority: {task.priority}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => onEditTask(task)} className="btn-ghost" style={{ padding: '6px 12px' }}>
                    View Details
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
