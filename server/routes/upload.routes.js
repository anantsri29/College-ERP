const express = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { uploadProfileImage, uploadDocument, uploadAssignmentFiles } = require("../middleware/upload");
const uploadController = require("../controllers/upload.controller");

const router = express.Router();
router.use(authenticate, authorize("admin", "subadmin", "teacher", "student"));
router.post("/profile-image", uploadProfileImage, uploadController.uploadSingle);
router.post("/document", uploadDocument, uploadController.uploadSingle);
router.post("/assignment-files", uploadAssignmentFiles, uploadController.uploadMultiple);

module.exports = router;
