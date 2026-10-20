const express = require("express");
const router = express.Router();

const taskRoutes = require("./taskRoutes");
const focusRoutes = require("./focusRoutes");
const statsRoutes = require("./statsRoutes");
const projectRoutes = require("./projectRoutes");
const noteRoutes = require("./noteRoutes");
const goalRoutes = require("./goalRoutes");
const notificationRoutes = require("./notificationRoutes");
const activityRoutes = require("./activityRoutes");
const assistantRoutes = require("./assistantRoutes");

router.use("/tasks", taskRoutes);
router.use("/focus", focusRoutes);
router.use("/stats", statsRoutes);
router.use("/projects", projectRoutes);
router.use("/notes", noteRoutes);
router.use("/goals", goalRoutes);
router.use("/notifications", notificationRoutes);
router.use("/activity", activityRoutes);
router.use("/assistant", assistantRoutes);

module.exports = router;
