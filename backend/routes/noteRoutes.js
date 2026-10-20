const express = require("express");
const router = express.Router();
const { wrap } = require("../middleware/errorHandler");
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

router.get("/", wrap(getNotes));
router.post("/", wrap(createNote));
router.put("/:id", wrap(updateNote));
router.delete("/:id", wrap(deleteNote));

module.exports = router;
