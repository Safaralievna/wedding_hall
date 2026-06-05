const crypto = require("crypto");

const generateOtp = () => String(crypto.randomInt(100000, 999999));

module.exports = { generateOtp };