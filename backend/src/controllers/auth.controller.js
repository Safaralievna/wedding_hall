const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { hashPassword, comparePassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");
const { generateOtp } = require("../utils/otp");
const { sendOtpEmail } = require("../utils/email");
const { validatePasswordStrength } = require("../utils/validators");
const { normalizeLogin, findUserByLogin } = require("../utils/loginIdentifier");

const safeUser = (user) => ({
  id: user.id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  username: user.username,
  phone: user.phone,
  role: user.role,
  is_verified: user.is_verified,
});

const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, password } = req.body;

  if (!firstName || !lastName || !phone || !password) {
    throw new ApiError(400, "Majburiy maydonlar to'liq emas");
  }

  if (!validatePasswordStrength(password)) {
    throw new ApiError(400, "Parol kamida 8 belgi, katta/kichik harf va raqamdan iborat bo'lishi kerak");
  }

  const existing = await pool.query("SELECT id FROM users WHERE phone = $1", [phone]);
  if (existing.rows.length) {
    throw new ApiError(409, "Bu telefon allaqachon ro'yxatdan o'tgan");
  }

  const hashedPassword = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (first_name, last_name, phone, password, role, is_verified)
     VALUES ($1, $2, $3, $4, 'user', TRUE)
     RETURNING id, first_name, last_name, email, username, phone, role, is_verified`,
    [firstName, lastName, phone, hashedPassword]
  );

  const token = signToken({ id: result.rows[0].id, role: "user" });

  res.status(201).json({
    message: "Foydalanuvchi yaratildi",
    token,
    user: result.rows[0],
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const identifier = normalizeLogin(req.body.login || req.body.phone);
  const { password } = req.body;

  if (!identifier || !password) {
    throw new ApiError(400, "Login va password majburiy");
  }

  const user = await findUserByLogin(pool, identifier);

  if (!user) {
    throw new ApiError(401, "Login yoki parol noto'g'ri");
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Login yoki parol noto'g'ri");
  }

  if (!user.is_verified) {
    throw new ApiError(403, "Account tasdiqlanmagan");
  }

  const token = signToken({ id: user.id, role: user.role });

  res.json({
    message: "Kirish muvaffaqiyatli",
    token,
    user: safeUser(user),
  });
});

const createOwner = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;

  if (!firstName || !lastName || !email || !username || !password) {
    throw new ApiError(400, "Majburiy maydonlar to'liq emas");
  }

  if (!validatePasswordStrength(password)) {
    throw new ApiError(400, "Parol kamida 8 belgi, katta/kichik harf va raqamdan iborat bo'lishi kerak");
  }

  const already = await pool.query(
    "SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1",
    [email, username]
  );

  if (already.rows.length) {
    throw new ApiError(409, "Email yoki username band");
  }

  const hashedPassword = await hashPassword(password);
  const otp = generateOtp();

  const userResult = await pool.query(
    `INSERT INTO users (first_name, last_name, email, username, password, role, is_verified)
     VALUES ($1, $2, $3, $4, $5, 'owner', FALSE)
     RETURNING id, first_name, last_name, email, username, phone, role, is_verified`,
    [firstName, lastName, email, username, hashedPassword]
  );

  await pool.query(
    `INSERT INTO otps (user_id, code, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
    [userResult.rows[0].id, otp]
  );

  await sendOtpEmail({
    to: email,
    otp,
    name: `${firstName} ${lastName}`,
  });

  res.status(201).json({
    message: "Owner yaratildi. OTP yuborildi",
    user: userResult.rows[0],
    devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
  });
});

const resendOwnerOtp = asyncHandler(async (req, res) => {
  const { username } = req.body;

  if (!username) {
    throw new ApiError(400, "username majburiy");
  }

  const userResult = await pool.query("SELECT * FROM users WHERE username = $1 AND role = 'owner' LIMIT 1", [username]);
  const user = userResult.rows[0];

  if (!user) {
    throw new ApiError(404, "Owner topilmadi");
  }

  if (user.is_verified) {
    throw new ApiError(400, "Owner allaqachon tasdiqlangan");
  }

  const otp = generateOtp();

  await pool.query("DELETE FROM otps WHERE user_id = $1", [user.id]);
  await pool.query(
    `INSERT INTO otps (user_id, code, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
    [user.id, otp]
  );

  await sendOtpEmail({
    to: user.email,
    otp,
    name: `${user.first_name} ${user.last_name}`,
  });

  res.json({
    message: "OTP qayta yuborildi",
    devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
  });
});

const verifyOwnerOtp = asyncHandler(async (req, res) => {
  const { username, otp } = req.body;

  if (!username || !otp) {
    throw new ApiError(400, "Username va OTP majburiy");
  }

  const userResult = await pool.query("SELECT * FROM users WHERE username = $1 AND role = 'owner' LIMIT 1", [username]);
  const user = userResult.rows[0];

  if (!user) {
    throw new ApiError(404, "Owner topilmadi");
  }

  const otpResult = await pool.query(
    `SELECT * FROM otps
     WHERE user_id = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [user.id, otp]
  );

  const record = otpResult.rows[0];
  if (!record) {
    throw new ApiError(400, "OTP noto'g'ri yoki eskirgan");
  }

  await pool.query("UPDATE otps SET used = TRUE WHERE id = $1", [record.id]);
  await pool.query("UPDATE users SET is_verified = TRUE WHERE id = $1", [user.id]);

  const token = signToken({ id: user.id, role: user.role });

  res.json({
    message: "OTP tasdiqlandi",
    token,
    user: safeUser({ ...user, is_verified: true }),
  });
});

const getOwners = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, username, phone, role, is_verified, created_at
     FROM users
     WHERE role = 'owner'
     ORDER BY created_at DESC`
  );

  res.json(result.rows);
});

module.exports = {
  registerUser,
  loginUser,
  createOwner,
  verifyOwnerOtp,
  resendOwnerOtp,
  getOwners,
};