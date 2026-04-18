const express = require("express");
const leave = require("../controllers/leave.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { uploadDocument } = require("../middleware/upload");

const router = express.Router();
router.use(authenticate, authorize("teacher", "student"));
router.get("/", leave.getMyLeaveRequests);
router.post("/", uploadDocument, leave.createLeaveRequest);
router.put("/:id/cancel", leave.cancelLeaveRequest);

module.exports = router;
