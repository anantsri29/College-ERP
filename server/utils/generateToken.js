const jwt = require("jsonwebtoken");

exports.generateAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

exports.generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
};

exports.sendTokenResponse = (user, statusCode, res, message = "Success") => {
  const accessToken = exports.generateAccessToken(user._id, user.role);
  const refreshToken = exports.generateRefreshToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie("accessToken", accessToken, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    },
  });
};
