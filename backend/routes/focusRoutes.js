const express = require("express");
const router = express.Router();
const { wrap } = require("../middleware/errorHandler");
const { createFocusSession, getSessions } = require("../controllers/focusController");

router.get("/", wrap(getSessions));
router.post("/", wrap(createFocusSession));

module.exports = router;
