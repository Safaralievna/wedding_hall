const express = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const { getAdminVenues } = require("../controllers/venue.controller");
const { getBookings } = require("../controllers/booking.controller");
const { getAdminStats } = require("../controllers/dashboard.controller");

const router = express.Router();

router.use(authenticate, authorize("admin"));

router.get("/stats", getAdminStats);
router.get("/venues", getAdminVenues);
router.get("/bookings", getBookings);

module.exports = router;