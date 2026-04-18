const express = require("express");
const subadmin = require("../controllers/subadmin.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const router = express.Router();
router.use(authenticate, authorize("subadmin", "admin"));

router.get("/dashboard", subadmin.getDashboard);
router.get("/teachers", subadmin.getTeachers);
router.post("/teachers", subadmin.createTeacher);
router.put("/teachers/:id", subadmin.updateTeacher);
router.delete("/teachers/:id", subadmin.deleteTeacher);
router.get("/students", subadmin.getStudents);
router.post("/students", subadmin.createStudent);
router.put("/students/:id", subadmin.updateStudent);
router.delete("/students/:id", subadmin.deleteStudent);
router.get("/subjects", subadmin.getSubjects);
router.post("/subjects", subadmin.createSubject);
router.put("/subjects/:id", subadmin.updateSubject);
router.delete("/subjects/:id", subadmin.deleteSubject);
router.get("/timetable", subadmin.getTimetable);
router.post("/timetable", subadmin.upsertTimetable);
router.get("/attendance/report", subadmin.getAttendanceReport);
router.get("/leave-requests", subadmin.getLeaveRequests);
router.put("/leave-requests/:id/review", subadmin.reviewLeaveRequest);

module.exports = router;
