const express = require("express");
const router = express.Router();
const { wrap } = require("../middleware/errorHandler");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  bulkUpdateStatus,
} = require("../controllers/taskController");

router.get("/", wrap(getTasks));
router.post("/", wrap(createTask));
router.patch("/bulk-status", wrap(bulkUpdateStatus));
router.put("/:id", wrap(updateTask));
router.delete("/:id", wrap(deleteTask));

module.exports = router;
