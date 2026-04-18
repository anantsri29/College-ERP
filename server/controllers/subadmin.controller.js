const mongoose = require("mongoose");
const User = require("../models/User");
const Subject = require("../models/Subject");
const Timetable = require("../models/Timetable");
const Attendance = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/apiFeatures");

const getDeptId = (req) => req.user.department._id;

exports.getDashboard = async (req, res, next) => {
  try {
    const deptId = getDeptId(req);
    const [students, teachers, subjects, pendingLeaves] = await Promise.all([
      User.countDocuments({ department: deptId, role: "student", isActive: true }),
      User.countDocuments({ department: deptId, role: "teacher", isActive: true }),
      Subject.countDocuments({ department: deptId }),
      LeaveRequest.countDocuments({ department: deptId, status: "pending" }),
    ]);
    res.status(200).json({ success: true, data: { stats: { students, teachers, subjects, pendingLeaves } } });
  } catch (err) {
    next(err);
  }
};

exports.getTeachers = async (req, res, next) => {
  try {
    const features = new APIFeatures(User.find({ role: "teacher", department: getDeptId(req) }), req.query)
      .search(["name", "email", "employeeId"])
      .sort()
      .paginate();
    const teachers = await features.query;
    res.status(200).json({ success: true, data: teachers });
  } catch (err) {
    next(err);
  }
};

exports.createTeacher = async (req, res, next) => {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) return next(new AppError("Email already registered.", 400));
    const teacher = await User.create({ ...req.body, role: "teacher", department: getDeptId(req), createdBy: req.user._id });
    res.status(201).json({ success: true, message: "Teacher created.", data: teacher });
  } catch (err) {
    next(err);
  }
};

exports.updateTeacher = async (req, res, next) => {
  try {
    const allowed = ["name", "phone", "designation", "qualification", "specialization", "isActive", "employeeId"];
    const updates = {};
    allowed.forEach((f) => req.body[f] !== undefined && (updates[f] = req.body[f]));
    const teacher = await User.findOneAndUpdate({ _id: req.params.id, role: "teacher", department: getDeptId(req) }, updates, { new: true });
    if (!teacher) return next(new AppError("Teacher not found.", 404));
    res.status(200).json({ success: true, data: teacher });
  } catch (err) {
    next(err);
  }
};

exports.deleteTeacher = async (req, res, next) => {
  try {
    await User.findOneAndUpdate({ _id: req.params.id, role: "teacher", department: getDeptId(req) }, { isActive: false });
    res.status(200).json({ success: true, message: "Teacher deactivated." });
  } catch (err) {
    next(err);
  }
};

exports.getStudents = async (req, res, next) => {
  try {
    const filter = { role: "student", department: getDeptId(req), isActive: true };
    if (req.query.semester) filter.semester = Number(req.query.semester);
    const features = new APIFeatures(User.find(filter), req.query).search(["name", "email", "rollNumber"]).sort().paginate();
    const students = await features.query;
    res.status(200).json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
};

exports.createStudent = async (req, res, next) => {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) return next(new AppError("Email already registered.", 400));
    const student = await User.create({ ...req.body, role: "student", department: getDeptId(req), createdBy: req.user._id });
    res.status(201).json({ success: true, message: "Student created.", data: student });
  } catch (err) {
    next(err);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const allowed = ["name", "phone", "rollNumber", "semester", "isActive", "address"];
    const updates = {};
    allowed.forEach((f) => req.body[f] !== undefined && (updates[f] = req.body[f]));
    const student = await User.findOneAndUpdate({ _id: req.params.id, role: "student", department: getDeptId(req) }, updates, { new: true });
    if (!student) return next(new AppError("Student not found.", 404));
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    await User.findOneAndUpdate({ _id: req.params.id, role: "student", department: getDeptId(req) }, { isActive: false });
    res.status(200).json({ success: true, message: "Student deactivated." });
  } catch (err) {
    next(err);
  }
};

exports.getSubjects = async (req, res, next) => {
  try {
    const filter = { department: getDeptId(req) };
    if (req.query.semester) filter.semester = Number(req.query.semester);
    const subjects = await Subject.find(filter).populate("teacher", "name email").sort("semester name");
    res.status(200).json({ success: true, data: subjects });
  } catch (err) {
    next(err);
  }
};

exports.createSubject = async (req, res, next) => {
  try {
    const subject = await Subject.create({ ...req.body, department: getDeptId(req), createdBy: req.user._id });
    res.status(201).json({ success: true, message: "Subject created.", data: subject });
  } catch (err) {
    next(err);
  }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndUpdate({ _id: req.params.id, department: getDeptId(req) }, req.body, { new: true, runValidators: true });
    if (!subject) return next(new AppError("Subject not found.", 404));
    res.status(200).json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
};

exports.deleteSubject = async (req, res, next) => {
  try {
    await Subject.findOneAndUpdate({ _id: req.params.id, department: getDeptId(req) }, { isActive: false });
    res.status(200).json({ success: true, message: "Subject removed." });
  } catch (err) {
    next(err);
  }
};

exports.getTimetable = async (req, res, next) => {
  try {
    const filter = { department: getDeptId(req) };
    if (req.query.semester) filter.semester = Number(req.query.semester);
    const timetable = await Timetable.findOne({ ...filter, isActive: true }).populate("schedule.slots.subject", "name code").populate("schedule.slots.teacher", "name");
    res.status(200).json({ success: true, data: timetable });
  } catch (err) {
    next(err);
  }
};

exports.upsertTimetable = async (req, res, next) => {
  try {
    const { semester, academicYear, schedule, section } = req.body;
    const timetable = await Timetable.findOneAndUpdate(
      { department: getDeptId(req), semester, academicYear },
      { schedule, section, isActive: true, updatedBy: req.user._id },
      { new: true, upsert: true, runValidators: true },
    );
    res.status(200).json({ success: true, message: "Timetable saved.", data: timetable });
  } catch (err) {
    next(err);
  }
};

exports.getLeaveRequests = async (req, res, next) => {
  try {
    const filter = { department: getDeptId(req) };
    if (req.query.status) filter.status = req.query.status;
    const leaves = await LeaveRequest.find(filter).populate("applicant", "name email role rollNumber").sort("-createdAt");
    res.status(200).json({ success: true, data: leaves });
  } catch (err) {
    next(err);
  }
};

exports.reviewLeaveRequest = async (req, res, next) => {
  try {
    const { status, reviewRemarks } = req.body;
    if (!["approved", "rejected"].includes(status)) return next(new AppError("Invalid status.", 400));
    const leave = await LeaveRequest.findOneAndUpdate(
      { _id: req.params.id, department: getDeptId(req), status: "pending" },
      { status, reviewRemarks, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true },
    ).populate("applicant", "name email");
    if (!leave) return next(new AppError("Leave request not found or already reviewed.", 404));
    res.status(200).json({ success: true, message: `Leave request ${status}.`, data: leave });
  } catch (err) {
    next(err);
  }
};

exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { semester, subject, startDate, endDate } = req.query;
    const match = { department: getDeptId(req) };
    if (semester) match.semester = Number(semester);
    if (subject) match.subject = new mongoose.Types.ObjectId(subject);
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }
    const report = await Attendance.aggregate([
      { $match: match },
      { $unwind: "$records" },
      { $group: { _id: { student: "$records.student", subject: "$subject" }, total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ["$records.status", ["present", "late"]] }, 1, 0] } } } },
      { $addFields: { percentage: { $round: [{ $multiply: [{ $divide: ["$present", "$total"] }, 100] }, 2] } } },
      { $lookup: { from: "users", localField: "_id.student", foreignField: "_id", as: "student" } },
      { $lookup: { from: "subjects", localField: "_id.subject", foreignField: "_id", as: "subject" } },
      { $unwind: "$student" },
      { $unwind: "$subject" },
      { $sort: { percentage: 1 } },
    ]);
    res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};
