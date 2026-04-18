const express = require("express");
const admin = require("../controllers/admin.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const router = express.Router();
router.use(authenticate, authorize("admin"));

router.get("/dashboard", admin.getDashboard);
router.get("/users", admin.getUsers);
router.post("/users", admin.createUser);
router.post("/users/bulk", admin.bulkCreateUsers);
router.get("/users/:id", admin.getUserById);
router.put("/users/:id", admin.updateUser);
router.delete("/users/:id", admin.deleteUser);
router.get("/departments", admin.getDepartments);
router.post("/departments", admin.createDepartment);
router.put("/departments/:id", admin.updateDepartment);
router.delete("/departments/:id", admin.deleteDepartment);
router.get("/academic-years", admin.getAcademicYears);
router.post("/academic-years", admin.createAcademicYear);
router.put("/academic-years/:id", admin.updateAcademicYear);
router.get("/reports/attendance", admin.getAttendanceReport);
router.get("/reports/performance", admin.getPerformanceReport);

module.exports = router;
