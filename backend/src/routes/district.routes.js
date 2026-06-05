const express = require("express");
const { getAllDistricts } = require("../controllers/district.controller");

const router = express.Router();

router.get("/", getAllDistricts);

module.exports = router;