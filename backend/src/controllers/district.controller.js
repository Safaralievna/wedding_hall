const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

const getAllDistricts = asyncHandler(async (req, res) => {
  const result = await pool.query("SELECT id, name FROM districts ORDER BY name ASC");
  res.json(result.rows);
});

module.exports = {
  getAllDistricts,
};