const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Token topilmadi"));
  }

  try {
    const token = header.split(" ")[1];
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is required in .env");
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    next(new ApiError(401, "Token noto'g'ri yoki muddati tugagan"));
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Avval login qiling"));
  }

  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "Ruxsat yo'q"));
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
};