const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  profileImage: user.profileImage,
  isActive: user.isActive,
});

const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password +refreshToken");

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
  if (!user.isActive) return res.status(403).json({ success: false, message: "Account is inactive" });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 14 * 24 * 60 * 60 * 1000 });

  return res.json({
    success: true,
    message: "Login successful",
    data: { token: accessToken, user: sanitizeUser(user) },
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password -refreshToken");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  return res.json({ success: true, data: sanitizeUser(user) });
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: "Refresh token missing" });

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== token) {
    return res.status(401).json({ success: false, message: "Invalid refresh token" });
  }

  const newAccessToken = generateAccessToken(user);
  return res.json({ success: true, data: { token: newAccessToken } });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (token) {
    const decoded = jwt.decode(token);
    if (decoded?.id) {
      const user = await User.findById(decoded.id).select("+refreshToken");
      if (user) {
        user.refreshToken = "";
        await user.save();
      }
    }
  }
  res.clearCookie("refreshToken", cookieOptions);
  return res.json({ success: true, message: "Logged out" });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const isValid = await user.matchPassword(currentPassword);
  if (!isValid) return res.status(400).json({ success: false, message: "Current password is incorrect" });

  user.password = newPassword;
  await user.save();
  return res.json({ success: true, message: "Password changed successfully" });
});

module.exports = { login, me, refreshToken, logout, changePassword };
