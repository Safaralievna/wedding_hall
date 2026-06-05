const express = require("express");
const {
  registerUser,
  loginUser,
  createOwner,
  verifyOwnerOtp,
  resendOwnerOtp,
  getOwners,
} = require("../controllers/auth.controller");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { validators } = require("../utils/validators");

const router = express.Router();

router.post("/register", validate(validators.registerUser), registerUser);
router.post("/login", validate(validators.loginUser), loginUser);
router.post("/owners", validate(validators.createOwner), createOwner);
router.post("/owners/verify-otp", validate(validators.verifyOwnerOtp), verifyOwnerOtp);
router.post("/owners/resend-otp", resendOwnerOtp);
router.get("/owners", authenticate, authorize("admin"), getOwners);

module.exports = router;