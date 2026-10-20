const Task = require("../models/Task");
const FocusSession = require("../models/FocusSession");
const Project = require("../models/Project");

const pad = (n) => String(n).padStart(2, "0");
const dayString = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// GET /api/stats
const getStats = async (req, res) => {
  const now = new Date();
  const today = dayString(now);
  const weekStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
  const monthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29));
  const heatmapStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 89));
  const todayStart = startOfDay(now);

  const [
    total,
    done,
    inProgress,
    overdue,
    dueToday,
    recentDone,
    recentFocus,
    heatmapFocus,
    heatmapDone,
    projectBreakdown,
  ] = await Promise.all([
    Task.countDocuments(),
    Task.countDocuments({ status: "done" }),
    Task.countDocuments({ status: "in-progress" }),
    Task.countDocuments({ status: "todo", due_date: { $lt: today } }),
    Task.countDocuments({ status: "todo", due_date: today }),
    Task.find({ completed_at: { $gte: monthStart } }, "completed_at").lean(),
    FocusSession.find({ created_at: { $gte: monthStart } }, "minutes created_at project_id").lean(),
    FocusSession.find({ created_at: { $gte: heatmapStart } }, "minutes created_at").lean(),
    Task.find({ completed_at: { $gte: heatmapStart } }, "completed_at").lean(),
    FocusSession.aggregate([
      { $match: { project_id: { $ne: null } } },
      { $group: { _id: "$project_id", totalMinutes: { $sum: "$minutes" } } },
      { $sort: { totalMinutes: -1 } },
      { $limit: 6 },
    ]),
  ]);

  // 7-day breakdown
  const days7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    days7.push({ date: dayString(d), completed: 0, focusMinutes: 0 });
  }
  const byDate7 = Object.fromEntries(days7.map((d) => [d.date, d]));

  // 30-day breakdown
  const days30 = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    days30.push({ date: dayString(d), completed: 0, focusMinutes: 0 });
  }
  const byDate30 = Object.fromEntries(days30.map((d) => [d.date, d]));

  for (const t of recentDone) {
    const ds = dayString(new Date(t.completed_at));
    if (byDate7[ds]) byDate7[ds].completed += 1;
    if (byDate30[ds]) byDate30[ds].completed += 1;
  }

  let focusToday = 0;
  let focusThisWeek = 0;
  let focusThisMonth = 0;

  for (const s of recentFocus) {
    const when = new Date(s.created_at);
    const ds = dayString(when);
    if (byDate7[ds]) byDate7[ds].focusMinutes += s.minutes;
    if (byDate30[ds]) byDate30[ds].focusMinutes += s.minutes;

    if (when >= todayStart) focusToday += s.minutes;
    if (when >= weekStart) focusThisWeek += s.minutes;
    focusThisMonth += s.minutes;
  }

  // 90-day heatmap array
  const heatmapMap = {};
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const ds = dayString(d);
    heatmapMap[ds] = { date: ds, count: 0, focusMinutes: 0, level: 0 };
  }

  for (const t of heatmapDone) {
    const ds = dayString(new Date(t.completed_at));
    if (heatmapMap[ds]) heatmapMap[ds].count += 1;
  }
  for (const s of heatmapFocus) {
    const ds = dayString(new Date(s.created_at));
    if (heatmapMap[ds]) heatmapMap[ds].focusMinutes += s.minutes;
  }

  // Calculate activity score level (0 to 4) for GitHub-style heatmap
  const heatmap = Object.values(heatmapMap).map((item) => {
    const score = item.count * 2 + Math.floor(item.focusMinutes / 25);
    let level = 0;
    if (score >= 6) level = 4;
    else if (score >= 4) level = 3;
    else if (score >= 2) level = 2;
    else if (score >= 1) level = 1;
    return { ...item, level, score };
  });

  // Enrich project focus breakdown with project details
  const populatedProjects = await Promise.all(
    projectBreakdown.map(async (pb) => {
      const p = await Project.findById(pb._id).select("name color").lean();
      return {
        id: String(pb._id),
        name: p ? p.name : "Unassigned",
        color: p ? p.color : "#8b5cf6",
        minutes: pb.totalMinutes,
      };
    })
  );

  res.json({
    total,
    done,
    inProgress,
    pending: total - done,
    overdue,
    dueToday,
    completionRate: total ? Math.round((done / total) * 100) : 0,
    focusToday,
    focusThisWeek,
    focusThisMonth,
    last7: days7,
    last30: days30,
    heatmap,
    projectFocusDistribution: populatedProjects,
  });
};

module.exports = {
  getStats,
};
