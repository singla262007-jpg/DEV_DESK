const mongoose = require("mongoose");
const { toJSON } = require("../config/db");

const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // e.g., "task_created", "task_completed", "focus_logged", "project_created", "note_saved"
    description: { type: String, required: true },
    entity_type: { type: String, enum: ["task", "project", "focus", "note", "goal"], required: true },
    entity_id: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false }, toJSON }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
