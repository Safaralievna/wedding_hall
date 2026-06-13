const express = require("express");
const { getInvitationBySlug } = require("../controllers/invitation.controller");

const router = express.Router();

router.get("/:slug", getInvitationBySlug);

module.exports = router;
