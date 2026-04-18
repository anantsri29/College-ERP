const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { sendTokenResponse, generateAccessToken } = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(new AppError("Email and password are required.", 400));
    const user = await User.findOne({ email }).select("+password").populate("department", "name code");
    if (!user || !(await user.comparePassword(password))) return next(new AppError("Incorrect email or password.", 401));
    if (!user.isActive) return next(new AppError("Account is deactivated. Contact admin.", 401));
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    sendTokenResponse(user, 200, res, "Login successful");
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.clearCookie("accessToken");
    res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("department", "name code");
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const allowed = ["name", "phone", "address", "dateOfBirth", "gender", "qualification", "specialization"];
    const updates = {};
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    if (req.file) {
      updates.profileImage = req.file.path;
      updates.profileImagePublicId = req.file.filename;
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).populate(
      "department",
      "name code",
    );
    res.status(200).json({ success: true, message: "Profile updated.", data: user });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return next(new AppError("Current and new password required.", 400));
    if (newPassword.length < 6) return next(new AppError("Password must be at least 6 characters.", 400));
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword))) return next(new AppError("Current password is incorrect.", 401));
    user.password = newPassword;
    await user.save();
    sendTokenResponse(user, 200, res, "Password changed successfully.");
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new AppError("No user found with that email.", 404));
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "Password Reset - College ERP",
      html: `<p>Click <a href="${resetURL}">here</a> to reset your password. Link expires in 10 minutes.</p>`,
    });
    res.status(200).json({ success: true, message: "Reset link sent to email." });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
    if (!user) return next(new AppError("Token is invalid or has expired.", 400));
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    sendTokenResponse(user, 200, res, "Password reset successful.");
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(new AppError("Refresh token required.", 401));
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return next(new AppError("Invalid refresh token.", 401));
    const accessToken = generateAccessToken(user._id, user.role);
    res.status(200).json({ success: true, data: { accessToken } });
  } catch (err) {
    next(new AppError("Invalid or expired refresh token.", 401));
  }
};
