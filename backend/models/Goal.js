const mongoose = require("mongoose");
const { toJSON } = require("../config/db");

const goalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    type: {
      type: String,
      enum: ["daily_focus", "weekly_focus", "daily_tasks", "weekly_tasks", "custom"],
      default: "daily_focus",
    },
    target_value: { type: Number, required: true, min: 1 },
    unit: { type: String, default: "minutes" }, // "minutes", "tasks", "sessions"
    period: { type: String, enum: ["daily", "weekly", "monthly"], default: "daily" },
    active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, toJSON }
);

module.exports = mongoose.model("Goal", goalSchema);
