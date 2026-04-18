const AppError = require("../utils/AppError");

exports.uploadSingle = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError("No file uploaded.", 400));
    res.status(200).json({
      success: true,
      message: "File uploaded successfully.",
      data: {
        name: req.file.originalname,
        url: req.file.path,
        publicId: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return next(new AppError("No files uploaded.", 400));
    res.status(200).json({
      success: true,
      message: "Files uploaded successfully.",
      data: req.files.map((f) => ({
        name: f.originalname,
        url: f.path,
        publicId: f.filename,
        mimetype: f.mimetype,
        size: f.size,
      })),
    });
  } catch (err) {
    next(err);
  }
};
