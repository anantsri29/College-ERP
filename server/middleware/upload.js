const multer = require("multer");
const AppError = require("../utils/AppError");
const { profileStorage, documentStorage, assignmentStorage } = require("../config/cloudinary");

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.test(file.mimetype)) cb(null, true);
  else cb(new AppError(`Only ${allowedTypes} files are allowed.`, 400), false);
};

exports.uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter(/image\/(jpeg|jpg|png|webp)/),
}).single("profileImage");

exports.uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(/application\/(pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document)/),
}).single("document");

exports.uploadAssignmentFiles = multer({
  storage: assignmentStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
}).array("files", 5);
