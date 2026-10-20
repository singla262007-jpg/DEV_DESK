const mongoose = require("mongoose");
const Task = require("../models/Task");
const ActivityLog = require("../models/ActivityLog");

const PRIORITIES = ["low", "medium", "high"];
const STATUSES = ["todo", "in-progress", "done"];
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

// GET /api/tasks
const getTasks = async (req, res) => {
  const query = {};

  if (req.query.status && req.query.status !== "all") {
    if (STATUSES.includes(req.query.status)) {
      query.status = req.query.status;
    }
  }

  if (req.query.priority && PRIORITIES.includes(req.query.priority)) {
    query.priority = req.query.priority;
  }

  if (req.query.projectId) {
    if (mongoose.isValidObjectId(req.query.projectId)) {
      query.project_id = req.query.projectId;
    } else if (req.query.projectId === "none") {
      query.project_id = null;
    }
  }

  if (req.query.search) {
    const s = String(req.query.search).trim();
    if (s) {
      query.$or = [
        { title: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } },
        { tags: { $in: [new RegExp(s, "i")] } },
      ];
    }
  }

  const tasks = await Task.find(query).sort({ _id: -1 }).lean();

  // Clean serialization
  const transformed = tasks.map((t) => {
    t.id = String(t._id);
    delete t._id;
    delete t.__v;
    return t;
  });

  // Sort: todo & in-progress first, then high priority, then nearest due date
  transformed.sort((a, b) => {
    if ((a.status === "done") !== (b.status === "done")) return a.status === "done" ? 1 : -1;
    if (a.priority !== b.priority) return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (!!a.due_date !== !!b.due_date) return a.due_date ? -1 : 1;
    if (a.due_date && b.due_date && a.due_date !== b.due_date) return a.due_date < b.due_date ? -1 : 1;
    return 0;
  });

  res.json(transformed);
};

// POST /api/tasks
const createTask = async (req, res) => {
  const title = String(req.body.title || "").trim();
  if (!title) return res.status(400).json({ error: "Title is required" });

  const project_id = mongoose.isValidObjectId(req.body.project_id) ? req.body.project_id : null;
  const status = STATUSES.includes(req.body.status) ? req.body.status : "todo";
  const priority = PRIORITIES.includes(req.body.priority) ? req.body.priority : "medium";
  const due_date = /^\d{4}-\d{2}-\d{2}$/.test(req.body.due_date || "") ? req.body.due_date : null;
  const due_time = typeof req.body.due_time === "string" ? req.body.due_time : null;
  const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
  const estimated_minutes = Math.max(0, Number(req.body.estimated_minutes) || 0);
  const tags = Array.isArray(req.body.tags) ? req.body.tags.map((t) => String(t).trim()).filter(Boolean) : [];
  const subtasks = Array.isArray(req.body.subtasks)
    ? req.body.subtasks.map((st, i) => ({
        id: st.id || `st-${Date.now()}-${i}`,
        title: String(st.title || "").trim(),
        completed: Boolean(st.completed),
      })).filter((st) => st.title)
    : [];

  const task = await Task.create({
    title: title.slice(0, 200),
    description,
    priority,
    status,
    due_date,
    due_time,
    project_id,
    tags,
    estimated_minutes,
    subtasks,
    completed_at: status === "done" ? new Date() : null,
  });

  // Log activity in background
  ActivityLog.create({
    action: "task_created",
    description: `Created task "${task.title}"`,
    entity_type: "task",
    entity_id: String(task._id),
  }).catch(() => {});

  res.status(201).json(task);
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Task not found" });
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  let wasStatusChangedToDone = false;

  if (req.body.title !== undefined) {
    const t = String(req.body.title).trim();
    if (t) task.title = t.slice(0, 200);
  }
  if (req.body.description !== undefined) {
    task.description = String(req.body.description).trim();
  }
  if (PRIORITIES.includes(req.body.priority)) task.priority = req.body.priority;
  if (req.body.due_date !== undefined) {
    task.due_date = /^\d{4}-\d{2}-\d{2}$/.test(req.body.due_date || "") ? req.body.due_date : null;
  }
  if (req.body.due_time !== undefined) {
    task.due_time = typeof req.body.due_time === "string" ? req.body.due_time : null;
  }
  if (req.body.project_id !== undefined) {
    task.project_id = mongoose.isValidObjectId(req.body.project_id) ? req.body.project_id : null;
  }
  if (Array.isArray(req.body.tags)) {
    task.tags = req.body.tags.map((t) => String(t).trim()).filter(Boolean);
  }
  if (req.body.estimated_minutes !== undefined) {
    task.estimated_minutes = Math.max(0, Number(req.body.estimated_minutes) || 0);
  }
  if (Array.isArray(req.body.subtasks)) {
    task.subtasks = req.body.subtasks
      .map((st, i) => ({
        id: st.id || `st-${Date.now()}-${i}`,
        title: String(st.title || "").trim(),
        completed: Boolean(st.completed),
      }))
      .filter((st) => st.title);
  }

  if (STATUSES.includes(req.body.status) && req.body.status !== task.status) {
    task.status = req.body.status;
    if (task.status === "done") {
      task.completed_at = new Date();
      wasStatusChangedToDone = true;
    } else {
      task.completed_at = null;
    }
  }

  await task.save();

  if (wasStatusChangedToDone) {
    ActivityLog.create({
      action: "task_completed",
      description: `Completed task "${task.title}"`,
      entity_type: "task",
      entity_id: String(task._id),
    }).catch(() => {});
  }

  res.json(task);
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Task not found" });
  const deleted = await Task.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Task not found" });

  ActivityLog.create({
    action: "task_deleted",
    description: `Deleted task "${deleted.title}"`,
    entity_type: "task",
    entity_id: String(deleted._id),
  }).catch(() => {});

  res.status(204).end();
};

// POST /api/tasks/bulk-status
const bulkUpdateStatus = async (req, res) => {
  const { ids, status } = req.body;
  if (!Array.isArray(ids) || !STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid ids or status" });
  }

  const validIds = ids.filter((id) => mongoose.isValidObjectId(id));
  const updateData = {
    status,
    completed_at: status === "done" ? new Date() : null,
  };

  await Task.updateMany({ _id: { $in: validIds } }, { $set: updateData });
  res.json({ success: true, count: validIds.length });
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  bulkUpdateStatus,
};
