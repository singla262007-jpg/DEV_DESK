const express = require("express");
const router = express.Router();
const { wrap } = require("../middleware/errorHandler");
const {
  breakdownTask,
  generateDailyPlan,
  getAssistantStatus,
} = require("../controllers/assistantController");

router.get("/status", wrap(getAssistantStatus));
router.post("/breakdown", wrap(breakdownTask));
router.post("/daily-plan", wrap(generateDailyPlan));

module.exports = router;
