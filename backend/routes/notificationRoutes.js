const express = require("express");
const router = express.Router();
const { wrap } = require("../middleware/errorHandler");
const {
  getNotifications,
  markRead,
  markAllRead,
  clearAll,
} = require("../controllers/notificationController");

router.get("/", wrap(getNotifications));
router.patch("/:id/read", wrap(markRead));
router.post("/mark-all-read", wrap(markAllRead));
router.delete("/", wrap(clearAll));

module.exports = router;
