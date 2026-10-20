const express = require("express");
const router = express.Router();
const { wrap } = require("../middleware/errorHandler");
const { getActivity } = require("../controllers/activityController");

router.get("/", wrap(getActivity));

module.exports = router;
