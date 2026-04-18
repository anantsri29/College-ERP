const express = require("express");
const auth = require("../controllers/auth.controller");
const authenticate = require("../middleware/authenticate");
const { uploadProfileImage } = require("../middleware/upload");

const router = express.Router();

router.post("/login", auth.login);
router.post("/logout", authenticate, auth.logout);
router.post("/refresh-token", auth.refreshToken);
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password/:token", auth.resetPassword);

router.use(authenticate);
router.get("/me", auth.getMe);
router.put("/me", uploadProfileImage, auth.updateMe);
router.put("/change-password", auth.changePassword);

module.exports = router;
