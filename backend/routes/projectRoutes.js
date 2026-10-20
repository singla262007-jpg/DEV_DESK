const express = require("express");
const router = express.Router();
const { wrap } = require("../middleware/errorHandler");
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

router.get("/", wrap(getProjects));
router.get("/:id", wrap(getProjectById));
router.post("/", wrap(createProject));
router.put("/:id", wrap(updateProject));
router.delete("/:id", wrap(deleteProject));

module.exports = router;
