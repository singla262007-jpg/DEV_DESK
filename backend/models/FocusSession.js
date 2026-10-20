const mongoose = require("mongoose");
const { toJSON } = require("../config/db");

const focusSchema = new mongoose.Schema(
  {
    minutes: { type: Number, required: true, min: 1, max: 240 },
    task_id: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null, index: true },
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null, index: true },
    notes: { type: String, trim: true, default: "", maxlength: 500 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false }, toJSON }
);

module.exports = mongoose.model("FocusSession", focusSchema);
