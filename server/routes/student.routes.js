const express = require("express");
const student = require("../controllers/student.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const leave = require("../controllers/leave.controller");
const notification = require("../controllers/notification.controller");
const { uploadAssignmentFiles, uploadDocument } = require("../middleware/upload");

const router = express.Router();
router.use(authenticate, authorize("student"));

router.get("/dashboard", student.getDashboard);
router.get("/attendance", student.getMyAttendance);
router.get("/assignments", student.getMyAssignments);
router.post("/assignments/:id/submit", uploadAssignmentFiles, student.submitAssignment);
router.get("/results", student.getMyResults);
router.get("/timetable", student.getMyTimetable);
router.get("/leave", leave.getMyLeaveRequests);
router.post("/leave", uploadDocument, leave.createLeaveRequest);
router.put("/leave/:id/cancel", leave.cancelLeaveRequest);
router.get("/notifications", notification.getMyNotifications);
router.put("/notifications/:id/read", notification.markAsRead);
router.put("/notifications/read-all", notification.markAllAsRead);

module.exports = router;
