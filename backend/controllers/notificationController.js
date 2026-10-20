const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const Task = require("../models/Task");

const pad = (n) => String(n).padStart(2, "0");
const dayString = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// GET /api/notifications
const getNotifications = async (_req, res) => {
  const today = dayString(new Date());

  // Check for upcoming or overdue tasks to alert the user
  const [overdueTasks, dueTodayTasks] = await Promise.all([
    Task.find({ status: "todo", due_date: { $lt: today } }).limit(3).lean(),
    Task.find({ status: "todo", due_date: today }).limit(3).lean(),
  ]);

  // Persist notifications if not already created today
  for (const t of overdueTasks) {
    const exists = await Notification.findOne({
      title: "Overdue Task",
      message: { $regex: t.title },
    });
    if (!exists) {
      await Notification.create({
        title: "Overdue Task",
        message: `Task "${t.title}" is overdue (due ${t.due_date})`,
        type: "warning",
        link: `/tasks`,
      }).catch(() => {});
    }
  }

  for (const t of dueTodayTasks) {
    const exists = await Notification.findOne({
      title: "Task Due Today",
      message: { $regex: t.title },
    });
    if (!exists) {
      await Notification.create({
        title: "Task Due Today",
        message: `"${t.title}" is scheduled for completion today`,
        type: "deadline",
        link: `/tasks`,
      }).catch(() => {});
    }
  }

  const notifications = await Notification.find().sort({ read: 1, created_at: -1 }).limit(50).lean();

  const transformed = notifications.map((n) => {
    n.id = String(n._id);
    delete n._id;
    delete n.__v;
    return n;
  });

  const unreadCount = transformed.filter((n) => !n.read).length;

  res.json({ notifications: transformed, unreadCount });
};

// PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Notification not found" });
  const n = await Notification.findByIdAndUpdate(req.params.id, { $set: { read: true } }, { new: true });
  if (!n) return res.status(404).json({ error: "Notification not found" });
  res.json(n);
};

// POST /api/notifications/mark-all-read
const markAllRead = async (_req, res) => {
  await Notification.updateMany({ read: false }, { $set: { read: true } });
  res.json({ success: true });
};

// DELETE /api/notifications
const clearAll = async (_req, res) => {
  await Notification.deleteMany({ read: true });
  res.status(204).end();
};

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
  clearAll,
};
