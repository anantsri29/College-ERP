const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const authenticate = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) return next(new AppError("Not authenticated. Please log in.", 401));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate("department", "name code");

    if (!user) return next(new AppError("User no longer exists.", 401));
    if (!user.isActive) return next(new AppError("Account is deactivated. Contact admin.", 401));
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError("Password was changed recently. Please log in again.", 401));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") return next(new AppError("Invalid token.", 401));
    if (err.name === "TokenExpiredError") return next(new AppError("Token expired. Please log in again.", 401));
    next(err);
  }
};

module.exports = authenticate;
