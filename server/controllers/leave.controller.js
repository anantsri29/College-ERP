const LeaveRequest = require("../models/LeaveRequest");
const AppError = require("../utils/AppError");

exports.createLeaveRequest = async (req, res, next) => {
  try {
    const { type, fromDate, toDate, reason } = req.body;
    const document = req.file ? req.file.path : null;
    const documentPublicId = req.file ? req.file.filename : null;
    const leave = await LeaveRequest.create({
      applicant: req.user._id,
      applicantRole: req.user.role,
      department: req.user.department,
      type,
      fromDate,
      toDate,
      reason,
      document,
      documentPublicId,
    });
    res.status(201).json({ success: true, message: "Leave request submitted.", data: leave });
  } catch (err) {
    next(err);
  }
};

exports.getMyLeaveRequests = async (req, res, next) => {
  try {
    const filter = { applicant: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const leaves = await LeaveRequest.find(filter).populate("reviewedBy", "name").sort("-createdAt");
    res.status(200).json({ success: true, data: leaves });
  } catch (err) {
    next(err);
  }
};

exports.cancelLeaveRequest = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findOneAndUpdate({ _id: req.params.id, applicant: req.user._id, status: "pending" }, { status: "cancelled" }, { new: true });
    if (!leave) return next(new AppError("Leave request not found or cannot be cancelled.", 404));
    res.status(200).json({ success: true, message: "Leave request cancelled.", data: leave });
  } catch (err) {
    next(err);
  }
};
