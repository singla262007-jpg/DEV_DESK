const mongoose = require("mongoose");
const Project = require("../models/Project");
const Task = require("../models/Task");
const FocusSession = require("../models/FocusSession");
const ActivityLog = require("../models/ActivityLog");

// GET /api/projects
const getProjects = async (req, res) => {
  const query = {};
  if (req.query.status && ["active", "completed", "archived"].includes(req.query.status)) {
    query.status = req.query.status;
  }

  const projects = await Project.find(query).sort({ created_at: -1 }).lean();

  // Aggregate stats per project
  const projectIds = projects.map((p) => p._id);

  const [taskStats, focusStats] = await Promise.all([
    Task.aggregate([
      { $match: { project_id: { $in: projectIds } } },
      {
        $group: {
          _id: "$project_id",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
          },
        },
      },
    ]),
    FocusSession.aggregate([
      { $match: { project_id: { $in: projectIds } } },
      {
        $group: {
          _id: "$project_id",
          totalMinutes: { $sum: "$minutes" },
        },
      },
    ]),
  ]);

  const taskStatsMap = Object.fromEntries(
    taskStats.map((ts) => [String(ts._id), { total: ts.total, completed: ts.completed }])
  );
  const focusStatsMap = Object.fromEntries(
    focusStats.map((fs) => [String(fs._id), fs.totalMinutes])
  );

  const enriched = projects.map((p) => {
    const id = String(p._id);
    const ts = taskStatsMap[id] || { total: 0, completed: 0 };
    const focusMinutes = focusStatsMap[id] || 0;
    const progress = ts.total > 0 ? Math.round((ts.completed / ts.total) * 100) : 0;

    delete p._id;
    delete p.__v;
    return {
      ...p,
      id,
      totalTasks: ts.total,
      completedTasks: ts.completed,
      progress,
      focusMinutes,
    };
  });

  res.json(enriched);
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: "Project not found" });
  }

  const project = await Project.findById(req.params.id).lean();
  if (!project) return res.status(404).json({ error: "Project not found" });

  const [tasks, focusSessions] = await Promise.all([
    Task.find({ project_id: project._id }).sort({ status: 1, priority: 1, created_at: -1 }).lean(),
    FocusSession.find({ project_id: project._id }).sort({ created_at: -1 }).limit(20).lean(),
  ]);

  const transformedTasks = tasks.map((t) => {
    t.id = String(t._id);
    delete t._id;
    delete t.__v;
    return t;
  });

  const totalTasks = transformedTasks.length;
  const completedTasks = transformedTasks.filter((t) => t.status === "done").length;
  const focusMinutes = focusSessions.reduce((acc, curr) => acc + (curr.minutes || 0), 0);
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  project.id = String(project._id);
  delete project._id;
  delete project.__v;

  res.json({
    ...project,
    totalTasks,
    completedTasks,
    progress,
    focusMinutes,
    tasks: transformedTasks,
    recentFocus: focusSessions,
  });
};

// POST /api/projects
const createProject = async (req, res) => {
  const name = String(req.body.name || "").trim();
  if (!name) return res.status(400).json({ error: "Project name is required" });

  const project = await Project.create({
    name: name.slice(0, 120),
    description: typeof req.body.description === "string" ? req.body.description.trim() : "",
    color: req.body.color || "#8b5cf6",
    deadline: /^\d{4}-\d{2}-\d{2}$/.test(req.body.deadline || "") ? req.body.deadline : null,
  });

  ActivityLog.create({
    action: "project_created",
    description: `Created project "${project.name}"`,
    entity_type: "project",
    entity_id: String(project._id),
  }).catch(() => {});

  res.status(201).json(project);
};

// PUT /api/projects/:id
const updateProject = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: "Project not found" });
  }

  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });

  if (req.body.name !== undefined) {
    const n = String(req.body.name).trim();
    if (n) project.name = n.slice(0, 120);
  }
  if (req.body.description !== undefined) {
    project.description = String(req.body.description).trim();
  }
  if (req.body.color !== undefined) {
    project.color = req.body.color;
  }
  if (["active", "completed", "archived"].includes(req.body.status)) {
    project.status = req.body.status;
  }
  if (req.body.deadline !== undefined) {
    project.deadline = /^\d{4}-\d{2}-\d{2}$/.test(req.body.deadline || "") ? req.body.deadline : null;
  }

  await project.save();
  res.json(project);
};

// DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: "Project not found" });
  }

  const deleted = await Project.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Project not found" });

  // Unassign tasks from this project so tasks are never orphaned or lost
  await Task.updateMany({ project_id: req.params.id }, { $set: { project_id: null } });

  ActivityLog.create({
    action: "project_deleted",
    description: `Deleted project "${deleted.name}"`,
    entity_type: "project",
    entity_id: String(deleted._id),
  }).catch(() => {});

  res.status(204).end();
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
