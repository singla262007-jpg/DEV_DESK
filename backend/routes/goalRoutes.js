const express = require("express");
const router = express.Router();
const { wrap } = require("../middleware/errorHandler");
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} = require("../controllers/goalController");

router.get("/", wrap(getGoals));
router.post("/", wrap(createGoal));
router.put("/:id", wrap(updateGoal));
router.delete("/:id", wrap(deleteGoal));

module.exports = router;
