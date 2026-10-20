const mongoose = require("mongoose");
const { toJSON } = require("../config/db");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ["info", "warning", "success", "deadline"], default: "info" },
    read: { type: Boolean, default: false, index: true },
    link: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false }, toJSON }
);

module.exports = mongoose.model("Notification", notificationSchema);
