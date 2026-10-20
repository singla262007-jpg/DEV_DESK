const mongoose = require("mongoose");
const FocusSession = require("../models/FocusSession");
const ActivityLog = require("../models/ActivityLog");
const Task = require("../models/Task");

// POST /api/focus
const createFocusSession = async (req, res) => {
  const minutes = Math.round(Number(req.body.minutes));
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 240) {
    return res.status(400).json({ error: "minutes must be between 1 and 240" });
  }

  const task_id = mongoose.isValidObjectId(req.body.task_id) ? req.body.task_id : null;
  const project_id = mongoose.isValidObjectId(req.body.project_id) ? req.body.project_id : null;
  const notes = typeof req.body.notes === "string" ? req.body.notes.trim().slice(0, 500) : "";

  const session = await FocusSession.create({
    minutes,
    task_id,
    project_id,
    notes,
  });

  // Fetch task title if linked for activity log
  let taskTitle = "";
  if (task_id) {
    const t = await Task.findById(task_id).select("title").lean();
    if (t) taskTitle = ` on "${t.title}"`;
  }

  ActivityLog.create({
    action: "focus_logged",
    description: `Logged ${minutes}m deep work session${taskTitle}`,
    entity_type: "focus",
    entity_id: String(session._id),
  }).catch(() => {});

  res.status(201).json(session);
};

// GET /api/focus
const getSessions = async (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));
  const sessions = await FocusSession.find()
    .sort({ created_at: -1 })
    .limit(limit)
    .populate("task_id", "title priority status")
    .populate("project_id", "name color")
    .lean();

  const transformed = sessions.map((s) => {
    s.id = String(s._id);
    delete s._id;
    delete s.__v;
    return s;
  });

  res.json(transformed);
};

module.exports = {
  createFocusSession,
  getSessions,
};
