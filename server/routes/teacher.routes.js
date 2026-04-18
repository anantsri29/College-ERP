const express = require("express");
const teacher = require("../controllers/teacher.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { uploadAssignmentFiles, uploadDocument } = require("../middleware/upload");
const leave = require("../controllers/leave.controller");
const notification = require("../controllers/notification.controller");

const router = express.Router();
router.use(authenticate, authorize("teacher"));

router.get("/dashboard", teacher.getDashboard);
router.get("/subjects", teacher.getMySubjects);
router.get("/subjects/:subjectId/students", teacher.getSubjectStudents);
router.post("/attendance", teacher.markAttendance);
router.put("/attendance/:id", teacher.updateAttendance);
router.get("/attendance/subject/:subjectId", teacher.getAttendanceBySubject);
router.get("/assignments", teacher.getAssignments);
router.post("/assignments", uploadAssignmentFiles, teacher.createAssignment);
router.put("/assignments/:id", teacher.updateAssignment);
router.delete("/assignments/:id", teacher.deleteAssignment);
router.get("/assignments/:id/submissions", teacher.getAssignmentSubmissions);
router.put("/assignments/:id/grade/:studentId", teacher.gradeSubmission);
router.get("/results", teacher.getResults);
router.post("/results", teacher.createOrUpdateResult);
router.post("/results/bulk", teacher.bulkCreateResults);
router.post("/results/publish", teacher.publishResults);
router.post("/announcements", teacher.sendAnnouncement);
router.get("/leave", leave.getMyLeaveRequests);
router.post("/leave", uploadDocument, leave.createLeaveRequest);
router.put("/leave/:id/cancel", leave.cancelLeaveRequest);
router.get("/notifications", notification.getMyNotifications);
router.put("/notifications/:id/read", notification.markAsRead);
router.put("/notifications/read-all", notification.markAllAsRead);

module.exports = router;
