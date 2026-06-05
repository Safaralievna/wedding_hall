const express = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const { getOwnerVenues } = require("../controllers/venue.controller");
const { getOwnerStats } = require("../controllers/dashboard.controller");

const router = express.Router();

router.use(authenticate, authorize("owner"));

router.get("/stats", getOwnerStats);
router.get("/venues", getOwnerVenues);

module.exports = router;