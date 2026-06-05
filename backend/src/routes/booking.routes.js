const express = require("express");
const { getBookings, getBookingById, createBooking, cancelBooking } = require("../controllers/booking.controller");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { validators } = require("../utils/validators");

const router = express.Router();

router.get("/", authenticate, authorize("admin", "owner", "user"), getBookings);
router.get("/:id", authenticate, authorize("admin", "owner", "user"), getBookingById);
router.post("/", authenticate, authorize("user"), validate(validators.createBooking), createBooking);
router.patch("/:id/cancel", authenticate, authorize("admin", "owner", "user"), cancelBooking);

module.exports = router;