const ActivityLog = require("../models/ActivityLog");

// GET /api/activity
const getActivity = async (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 40));
  const logs = await ActivityLog.find().sort({ created_at: -1 }).limit(limit).lean();

  const transformed = logs.map((l) => {
    l.id = String(l._id);
    delete l._id;
    delete l.__v;
    return l;
  });

  res.json(transformed);
};

module.exports = {
  getActivity,
};
