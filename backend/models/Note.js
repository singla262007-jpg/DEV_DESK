const mongoose = require("mongoose");
const { toJSON } = require("../config/db");

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, default: "" },
    folder: { type: String, default: "General", trim: true },
    tags: { type: [String], default: [] },
    pinned: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false, index: true },
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, toJSON }
);

module.exports = mongoose.model("Note", noteSchema);
