const express = require("express");
const router = express.Router();
const { wrap } = require("../middleware/errorHandler");
const { getStats } = require("../controllers/statsController");

router.get("/", wrap(getStats));

module.exports = router;
