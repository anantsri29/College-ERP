const AppError = require("../utils/AppError");

const departmentAccess = (req, res, next) => {
  if (req.user.role === "admin") return next();

  const requestedDeptId = req.params.departmentId || req.body.department || req.query.department;
  if (requestedDeptId && req.user.department) {
    if (requestedDeptId.toString() !== req.user.department._id.toString()) {
      return next(new AppError("Access denied to this department.", 403));
    }
  }

  if (req.user.role === "subadmin" && req.user.department) {
    req.departmentId = req.user.department._id;
  }
  next();
};

module.exports = departmentAccess;
