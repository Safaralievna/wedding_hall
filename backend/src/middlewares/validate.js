const ApiError = require("../utils/ApiError");

const validate = (validator) => (req, res, next) => {
  const errors = validator(req.body || {});
  if (errors.length) {
    return next(new ApiError(400, errors.join(", ")));
  }

  next();
};

module.exports = validate;