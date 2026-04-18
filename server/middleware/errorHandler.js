const AppError = require("../utils/AppError");

const handleCastError = (err) => new AppError(`Invalid ${err.path}: ${err.value}`, 400);
const handleDuplicateFields = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists: "${err.keyValue[field]}"`, 400);
};
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${errors.join(". ")}`, 400);
};
const handleJWTError = () => new AppError("Invalid token. Please log in again.", 401);
const handleJWTExpiredError = () => new AppError("Token expired. Please log in again.", 401);

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err, message: err.message, name: err.name };

  if (error.name === "CastError") error = handleCastError(error);
  if (error.code === 11000) error = handleDuplicateFields(error);
  if (error.name === "ValidationError") error = handleValidationError(error);
  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

  if (process.env.NODE_ENV === "development") {
    return res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.message,
      stack: err.stack,
      error: err,
    });
  }

  if (error.isOperational) {
    return res.status(error.statusCode).json({ success: false, status: error.status, message: error.message });
  }

  // eslint-disable-next-line no-console
  console.error("UNEXPECTED ERROR:", err);
  return res.status(500).json({ success: false, status: "error", message: "Something went wrong. Please try again." });
};

module.exports = errorHandler;
