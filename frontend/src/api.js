// DevDesk 2.0 Unified API Client with Offline Resilience

const STORAGE_KEY_TASKS = 'devdesk_tasks_cache';
const STORAGE_KEY_PROJECTS = 'devdesk_projects_cache';
const STORAGE_KEY_SESSIONS = 'devdesk_sessions_cache';
const STORAGE_KEY_NOTES = 'devdesk_notes_cache';
const STORAGE_KEY_GOALS = 'devdesk_goals_cache';

export let isBackendConnected = true;

async function request(path, options = {}) {
  try {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (!res.ok) {
      if (res.status === 204) return null;
      throw new Error(`HTTP ${res.status}`);
    }
    isBackendConnected = true;
    return res.status === 204 ? null : await res.json();
  } catch (err) {
    isBackendConnected = false;
    throw err;
  }
}

// Local cache helper
function getCache(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (_) {}
}

export const api = {
  // TASKS
  async getTasks(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.status && params.status !== 'all') query.set('status', params.status);
      if (params.priority) query.set('priority', params.priority);
      if (params.projectId) query.set('projectId', params.projectId);
      if (params.search) query.set('search', params.search);

      const qs = query.toString();
      const remote = await request(`/api/tasks${qs ? `?${qs}` : ''}`);
      setCache(STORAGE_KEY_TASKS, remote);
      return remote;
    } catch {
      let cached = getCache(STORAGE_KEY_TASKS, []);
      if (params.status && params.status !== 'all') {
        cached = cached.filter((t) => t.status === params.status);
      }
      if (params.projectId) {
        cached = cached.filter((t) => t.project_id === params.projectId);
      }
      return cached;
    }
  },

  async createTask(data) {
    try {
      return await request('/api/tasks', { method: 'POST', body: data });
    } catch {
      const all = getCache(STORAGE_KEY_TASKS, []);
      const newTask = {
        id: `offline-${Date.now()}`,
        title: data.title.trim(),
        description: data.description || '',
        priority: data.priority || 'medium',
        status: data.status || 'todo',
        due_date: data.due_date || null,
        due_time: data.due_time || null,
        project_id: data.project_id || null,
        tags: data.tags || [],
        estimated_minutes: data.estimated_minutes || 0,
        subtasks: data.subtasks || [],
        created_at: new Date().toISOString(),
      };
      all.unshift(newTask);
      setCache(STORAGE_KEY_TASKS, all);
      return newTask;
    }
  },

  async updateTask(id, updates) {
    try {
      return await request(`/api/tasks/${id}`, { method: 'PUT', body: updates });
    } catch {
      const all = getCache(STORAGE_KEY_TASKS, []);
      const idx = all.findIndex((t) => t.id === id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...updates, updated_at: new Date().toISOString() };
        setCache(STORAGE_KEY_TASKS, all);
        return all[idx];
      }
      return updates;
    }
  },

  async deleteTask(id) {
    try {
      return await request(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch {
      const all = getCache(STORAGE_KEY_TASKS, []);
      const filtered = all.filter((t) => t.id !== id);
      setCache(STORAGE_KEY_TASKS, filtered);
      return null;
    }
  },

  async bulkUpdateStatus(ids, status) {
    try {
      return await request('/api/tasks/bulk-status', { method: 'PATCH', body: { ids, status } });
    } catch {
      return { success: true };
    }
  },

  // PROJECTS
  async getProjects(status) {
    try {
      const url = status ? `/api/projects?status=${status}` : '/api/projects';
      const remote = await request(url);
      setCache(STORAGE_KEY_PROJECTS, remote);
      return remote;
    } catch {
      return getCache(STORAGE_KEY_PROJECTS, []);
    }
  },

  async getProjectById(id) {
    return await request(`/api/projects/${id}`);
  },

  async createProject(data) {
    try {
      return await request('/api/projects', { method: 'POST', body: data });
    } catch {
      const all = getCache(STORAGE_KEY_PROJECTS, []);
      const newProj = {
        id: `proj-${Date.now()}`,
        name: data.name,
        description: data.description || '',
        color: data.color || '#8b5cf6',
        status: 'active',
        deadline: data.deadline || null,
        totalTasks: 0,
        completedTasks: 0,
        progress: 0,
        focusMinutes: 0,
        created_at: new Date().toISOString(),
      };
      all.unshift(newProj);
      setCache(STORAGE_KEY_PROJECTS, all);
      return newProj;
    }
  },

  async updateProject(id, updates) {
    return await request(`/api/projects/${id}`, { method: 'PUT', body: updates });
  },

  async deleteProject(id) {
    return await request(`/api/projects/${id}`, { method: 'DELETE' });
  },

  // FOCUS SESSIONS
  async logFocusSession(data) {
    try {
      return await request('/api/focus', { method: 'POST', body: data });
    } catch {
      const all = getCache(STORAGE_KEY_SESSIONS, []);
      const newSession = {
        id: `focus-${Date.now()}`,
        minutes: data.minutes,
        task_id: data.task_id || null,
        project_id: data.project_id || null,
        notes: data.notes || '',
        created_at: new Date().toISOString(),
      };
      all.unshift(newSession);
      setCache(STORAGE_KEY_SESSIONS, all);
      return newSession;
    }
  },

  async getFocusSessions(limit = 30) {
    try {
      return await request(`/api/focus?limit=${limit}`);
    } catch {
      return getCache(STORAGE_KEY_SESSIONS, []);
    }
  },

  // STATS & ANALYTICS
  async getStats() {
    try {
      return await request('/api/stats');
    } catch {
      const tasks = getCache(STORAGE_KEY_TASKS, []);
      const sessions = getCache(STORAGE_KEY_SESSIONS, []);
      const done = tasks.filter((t) => t.status === 'done').length;
      return {
        total: tasks.length,
        done,
        inProgress: tasks.filter((t) => t.status === 'in-progress').length,
        pending: tasks.length - done,
        overdue: 0,
        dueToday: 0,
        completionRate: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
        focusToday: sessions.reduce((acc, s) => acc + (s.minutes || 0), 0),
        focusThisWeek: 0,
        focusThisMonth: 0,
        last7: [],
        last30: [],
        heatmap: [],
        projectFocusDistribution: [],
      };
    }
  },

  // NOTES
  async getNotes(params = {}) {
    try {
      const q = new URLSearchParams();
      if (params.folder && params.folder !== 'All') q.set('folder', params.folder);
      if (params.search) q.set('search', params.search);
      if (params.archived) q.set('archived', 'true');
      const qs = q.toString();
      const remote = await request(`/api/notes${qs ? `?${qs}` : ''}`);
      setCache(STORAGE_KEY_NOTES, remote);
      return remote;
    } catch {
      return getCache(STORAGE_KEY_NOTES, []);
    }
  },

  async createNote(data) {
    try {
      return await request('/api/notes', { method: 'POST', body: data });
    } catch {
      const all = getCache(STORAGE_KEY_NOTES, []);
      const newNote = {
        id: `note-${Date.now()}`,
        title: data.title,
        content: data.content || '',
        folder: data.folder || 'General',
        tags: data.tags || [],
        pinned: Boolean(data.pinned),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      all.unshift(newNote);
      setCache(STORAGE_KEY_NOTES, all);
      return newNote;
    }
  },

  async updateNote(id, updates) {
    return await request(`/api/notes/${id}`, { method: 'PUT', body: updates });
  },

  async deleteNote(id) {
    return await request(`/api/notes/${id}`, { method: 'DELETE' });
  },

  // GOALS
  async getGoals() {
    try {
      return await request('/api/goals');
    } catch {
      return {
        goals: getCache(STORAGE_KEY_GOALS, []),
        streak: 0,
        todayFocusMinutes: 0,
        weekFocusMinutes: 0,
        todayTasksDone: 0,
        weekTasksDone: 0,
      };
    }
  },

  async createGoal(data) {
    return await request('/api/goals', { method: 'POST', body: data });
  },

  async updateGoal(id, updates) {
    return await request(`/api/goals/${id}`, { method: 'PUT', body: updates });
  },

  async deleteGoal(id) {
    return await request(`/api/goals/${id}`, { method: 'DELETE' });
  },

  // NOTIFICATIONS
  async getNotifications() {
    return await request('/api/notifications');
  },

  async markNotificationRead(id) {
    return await request(`/api/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllNotificationsRead() {
    return await request('/api/notifications/mark-all-read', { method: 'POST' });
  },

  async clearNotifications() {
    return await request('/api/notifications', { method: 'DELETE' });
  },

  // ACTIVITY
  async getActivity(limit = 40) {
    return await request(`/api/activity?limit=${limit}`);
  },

  // ASSISTANT
  async getAssistantStatus() {
    return await request('/api/assistant/status');
  },

  async breakdownTask(title) {
    return await request('/api/assistant/breakdown', { method: 'POST', body: { title } });
  },

  async generateDailyPlan() {
    return await request('/api/assistant/daily-plan', { method: 'POST' });
  },
};
