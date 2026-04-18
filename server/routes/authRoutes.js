const express = require("express");
const { body } = require("express-validator");
const { login, me, refreshToken, logout, changePassword } = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

router.post("/login", [body("email").isEmail(), body("password").isLength({ min: 6 })], login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.get("/me", authenticate, me);
router.put(
  "/change-password",
  authenticate,
  [body("currentPassword").isLength({ min: 6 }), body("newPassword").isLength({ min: 6 })],
  changePassword,
);

module.exports = router;
