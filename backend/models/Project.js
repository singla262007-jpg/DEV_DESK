const mongoose = require("mongoose");
const { toJSON } = require("../config/db");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, default: "", maxlength: 500 },
    color: { type: String, default: "#8b5cf6" }, // hex or curated oklch accent
    status: { type: String, enum: ["active", "completed", "archived"], default: "active", index: true },
    deadline: { type: String, default: null }, // YYYY-MM-DD
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, toJSON }
);

module.exports = mongoose.model("Project", projectSchema);
