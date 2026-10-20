const mongoose = require("mongoose");
const Goal = require("../models/Goal");
const Task = require("../models/Task");
const FocusSession = require("../models/FocusSession");
const ActivityLog = require("../models/ActivityLog");

const pad = (n) => String(n).padStart(2, "0");
const dayString = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// GET /api/goals
const getGoals = async (req, res) => {
  const now = new Date();
  const today = dayString(now);
  const todayStart = startOfDay(now);

  // Week start (Monday-based or 7 days prior)
  const dayOfWeek = now.getDay() || 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1);

  // Fetch actual data
  const [goals, tasksToday, tasksThisWeek, focusToday, focusThisWeek, allRecentFocus] = await Promise.all([
    Goal.find({ active: true }).sort({ created_at: 1 }).lean(),
    Task.countDocuments({ status: "done", completed_at: { $gte: todayStart } }),
    Task.countDocuments({ status: "done", completed_at: { $gte: monday } }),
    FocusSession.aggregate([
      { $match: { created_at: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: "$minutes" } } },
    ]),
    FocusSession.aggregate([
      { $match: { created_at: { $gte: monday } } },
      { $group: { _id: null, total: { $sum: "$minutes" } } },
    ]),
    FocusSession.find({ created_at: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30) } })
      .select("minutes created_at")
      .lean(),
  ]);

  const focusMinutesToday = focusToday[0]?.total || 0;
  const focusMinutesThisWeek = focusThisWeek[0]?.total || 0;

  // Calculate streak based on daily focus activity
  const focusDays = new Set(allRecentFocus.map((f) => dayString(new Date(f.created_at))));
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const ds = dayString(d);
    if (focusDays.has(ds)) {
      streak++;
    } else if (i > 0) {
      break; // broken streak
    }
  }

  const enriched = goals.map((g) => {
    let current = 0;
    if (g.type === "daily_focus") current = focusMinutesToday;
    else if (g.type === "weekly_focus") current = focusMinutesThisWeek;
    else if (g.type === "daily_tasks") current = tasksToday;
    else if (g.type === "weekly_tasks") current = tasksThisWeek;

    const progress = Math.min(100, Math.round((current / (g.target_value || 1)) * 100));

    g.id = String(g._id);
    delete g._id;
    delete g.__v;

    return {
      ...g,
      current,
      progress,
      isCompleted: current >= g.target_value,
    };
  });

  res.json({
    goals: enriched,
    streak,
    todayFocusMinutes: focusMinutesToday,
    weekFocusMinutes: focusMinutesThisWeek,
    todayTasksDone: tasksToday,
    weekTasksDone: tasksThisWeek,
  });
};

// POST /api/goals
const createGoal = async (req, res) => {
  const title = String(req.body.title || "").trim();
  if (!title) return res.status(400).json({ error: "Goal title is required" });

  const target_value = Math.max(1, Number(req.body.target_value) || 25);
  const type = ["daily_focus", "weekly_focus", "daily_tasks", "weekly_tasks", "custom"].includes(req.body.type)
    ? req.body.type
    : "daily_focus";
  const period = ["daily", "weekly", "monthly"].includes(req.body.period) ? req.body.period : "daily";
  const unit = req.body.unit || (type.includes("focus") ? "minutes" : "tasks");

  const goal = await Goal.create({
    title,
    type,
    target_value,
    unit,
    period,
    active: true,
  });

  ActivityLog.create({
    action: "goal_created",
    description: `Created goal "${goal.title}" (${target_value} ${unit})`,
    entity_type: "goal",
    entity_id: String(goal._id),
  }).catch(() => {});

  res.status(201).json(goal);
};

// PUT /api/goals/:id
const updateGoal = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Goal not found" });
  const goal = await Goal.findById(req.params.id);
  if (!goal) return res.status(404).json({ error: "Goal not found" });

  if (req.body.title !== undefined) {
    const t = String(req.body.title).trim();
    if (t) goal.title = t.slice(0, 150);
  }
  if (req.body.target_value !== undefined) {
    goal.target_value = Math.max(1, Number(req.body.target_value) || 1);
  }
  if (req.body.active !== undefined) {
    goal.active = Boolean(req.body.active);
  }

  await goal.save();
  res.json(goal);
};

// DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Goal not found" });
  const deleted = await Goal.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Goal not found" });
  res.status(204).end();
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
};
