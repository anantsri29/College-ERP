const AppError = require("../utils/AppError");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Access denied. Required role: ${roles.join(" or ")}.`, 403));
    }
    next();
  };
};

module.exports = authorize;
