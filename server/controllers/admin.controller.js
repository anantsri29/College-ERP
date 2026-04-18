const mongoose = require("mongoose");
const User = require("../models/User");
const Department = require("../models/Department");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const AcademicYear = require("../models/AcademicYear");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/apiFeatures");

exports.getDashboard = async (req, res, next) => {
  try {
    const [totalStudents, totalTeachers, totalDepartments, totalSubjects, recentUsers, deptStats] = await Promise.all([
      User.countDocuments({ role: "student", isActive: true }),
      User.countDocuments({ role: "teacher", isActive: true }),
      Department.countDocuments({ isActive: true }),
      Subject.countDocuments({ isActive: true }),
      User.find({ isActive: true }).sort("-createdAt").limit(10).populate("department", "name"),
      Department.aggregate([
        { $match: { isActive: true } },
        { $lookup: { from: "users", localField: "_id", foreignField: "department", as: "users" } },
        {
          $project: {
            name: 1,
            code: 1,
            studentCount: { $size: { $filter: { input: "$users", as: "u", cond: { $eq: ["$$u.role", "student"] } } } },
            teacherCount: { $size: { $filter: { input: "$users", as: "u", cond: { $eq: ["$$u.role", "teacher"] } } } },
          },
        },
      ]),
    ]);
    res.status(200).json({
      success: true,
      data: { stats: { totalStudents, totalTeachers, totalDepartments, totalSubjects }, recentUsers, deptStats },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const features = new APIFeatures(User.find().populate("department", "name code"), req.query)
      .filter()
      .search(["name", "email", "rollNumber", "employeeId"])
      .sort()
      .limitFields()
      .paginate();
    const users = await features.query;
    const total = await User.countDocuments(features.query._conditions);
    res.status(200).json({ success: true, data: users, pagination: { ...features.pagination, total } });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate("department", "name code");
    if (!user) return next(new AppError("User not found.", 404));
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, rollNumber, employeeId, semester, phone, dateOfBirth, gender } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return next(new AppError("Email already registered.", 400));
    const user = await User.create({
      name,
      email,
      password: password || "College@123",
      role,
      department,
      rollNumber,
      employeeId,
      semester,
      phone,
      dateOfBirth,
      gender,
      createdBy: req.user._id,
    });
    await user.populate("department", "name code");
    res.status(201).json({ success: true, message: "User created successfully.", data: user });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const allowed = ["name", "phone", "address", "dateOfBirth", "gender", "department", "semester", "designation", "qualification", "isActive", "rollNumber", "employeeId"];
    const updates = {};
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate("department", "name code");
    if (!user) return next(new AppError("User not found.", 404));
    res.status(200).json({ success: true, message: "User updated.", data: user });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError("User not found.", 404));
    if (user.role === "admin") return next(new AppError("Cannot delete admin account.", 403));
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: "User deactivated." });
  } catch (err) {
    next(err);
  }
};

exports.bulkCreateUsers = async (req, res, next) => {
  try {
    const users = req.body.users;
    if (!Array.isArray(users) || !users.length) return next(new AppError("Users array is required.", 400));
    const results = { created: [], failed: [] };
    for (const u of users) {
      try {
        const created = await User.create({ ...u, password: u.password || "College@123", createdBy: req.user._id });
        results.created.push(created.email);
      } catch (e) {
        results.failed.push({ email: u.email, error: e.message });
      }
    }
    res.status(201).json({ success: true, message: `${results.created.length} users created.`, data: results });
  } catch (err) {
    next(err);
  }
};

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate("hod", "name email").populate("subAdmin", "name email").sort("name");
    res.status(200).json({ success: true, data: departments });
  } catch (err) {
    next(err);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const dept = await Department.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: "Department created.", data: dept });
  } catch (err) {
    next(err);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dept) return next(new AppError("Department not found.", 404));
    res.status(200).json({ success: true, message: "Department updated.", data: dept });
  } catch (err) {
    next(err);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const hasUsers = await User.exists({ department: req.params.id, isActive: true });
    if (hasUsers) return next(new AppError("Cannot delete department with active users.", 400));
    await Department.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: "Department deactivated." });
  } catch (err) {
    next(err);
  }
};

exports.getAcademicYears = async (req, res, next) => {
  try {
    const years = await AcademicYear.find().sort("-createdAt");
    res.status(200).json({ success: true, data: years });
  } catch (err) {
    next(err);
  }
};

exports.createAcademicYear = async (req, res, next) => {
  try {
    const year = await AcademicYear.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: "Academic year created.", data: year });
  } catch (err) {
    next(err);
  }
};

exports.updateAcademicYear = async (req, res, next) => {
  try {
    const year = await AcademicYear.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!year) return next(new AppError("Academic year not found.", 404));
    res.status(200).json({ success: true, data: year });
  } catch (err) {
    next(err);
  }
};

exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { department, subject, startDate, endDate, semester } = req.query;
    const match = {};
    if (department) match.department = new mongoose.Types.ObjectId(department);
    if (subject) match.subject = new mongoose.Types.ObjectId(subject);
    if (semester) match.semester = Number(semester);
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }
    const report = await Attendance.aggregate([
      { $match: match },
      { $unwind: "$records" },
      { $group: { _id: "$records.student", totalClasses: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ["$records.status", ["present", "late"]] }, 1, 0] } } } },
      { $addFields: { percentage: { $multiply: [{ $divide: ["$present", "$totalClasses"] }, 100] } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "student" } },
      { $unwind: "$student" },
      { $project: { "student.name": 1, "student.rollNumber": 1, "student.email": 1, totalClasses: 1, present: 1, percentage: { $round: ["$percentage", 2] } } },
      { $sort: { percentage: 1 } },
    ]);
    res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

exports.getPerformanceReport = async (req, res, next) => {
  try {
    const { department, semester, academicYear } = req.query;
    const match = { isPublished: true };
    if (department) match.department = new mongoose.Types.ObjectId(department);
    if (semester) match.semester = Number(semester);
    if (academicYear) match.academicYear = academicYear;

    const report = await Result.aggregate([
      { $match: match },
      { $group: { _id: "$grade", count: { $sum: 1 }, avgPercentage: { $avg: "$percentage" } } },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};
