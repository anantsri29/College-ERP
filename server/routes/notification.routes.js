const express = require("express");
const notification = require("../controllers/notification.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const router = express.Router();
router.use(authenticate);
router.get("/", notification.getMyNotifications);
router.put("/read-all", notification.markAllAsRead);
router.put("/:id/read", notification.markAsRead);
router.post("/", authorize("admin", "subadmin"), notification.createNotification);
router.delete("/:id", authorize("admin", "subadmin"), notification.deleteNotification);

module.exports = router;
