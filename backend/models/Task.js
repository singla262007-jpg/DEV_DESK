const mongoose = require("mongoose");
const { toJSON } = require("../config/db");

const subtaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, default: "", maxlength: 2000 },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium", index: true },
    status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo", index: true },
    due_date: { type: String, default: null, index: true }, // YYYY-MM-DD
    due_time: { type: String, default: null }, // HH:mm
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null, index: true },
    tags: { type: [String], default: [] },
    estimated_minutes: { type: Number, default: 0, min: 0 },
    subtasks: { type: [subtaskSchema], default: [] },
    completed_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, toJSON }
);

module.exports = mongoose.model("Task", taskSchema);
