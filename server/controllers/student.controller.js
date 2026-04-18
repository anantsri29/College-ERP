const Attendance = require("../models/Attendance");
const Assignment = require("../models/Assignment");
const Result = require("../models/Result");
const Timetable = require("../models/Timetable");
const Notification = require("../models/Notification");
const Subject = require("../models/Subject");
const AppError = require("../utils/AppError");
const { calculateAttendancePercentage, getAttendanceStatus } = require("../utils/calculateAttendance");
const { calculateCGPA } = require("../utils/calculateGrade");

exports.getDashboard = async (req, res, next) => {
  try {
    const student = req.user;
    const [assignments, notifications] = await Promise.all([
      Assignment.find({ department: student.department, semester: student.semester, isPublished: true, dueDate: { $gte: new Date() } }).populate("subject", "name").sort("dueDate").limit(5),
      Notification.find({ recipients: student._id, isActive: true }).sort("-createdAt").limit(5),
    ]);
    const subjects = await Subject.find({ department: student.department, semester: student.semester, isActive: true });
    const attendanceSummary = await Promise.all(
      subjects.map(async (sub) => {
        const records = await Attendance.find({ subject: sub._id, "records.student": student._id });
        let present = 0;
        records.forEach((a) => {
          const r = a.records.find((item) => item.student.toString() === student._id.toString());
          if (r && ["present", "late"].includes(r.status)) present++;
        });
        const pct = calculateAttendancePercentage(present, records.length);
        return { subject: { _id: sub._id, name: sub.name, code: sub.code }, total: records.length, present, percentage: pct, ...getAttendanceStatus(pct) };
      }),
    );
    res.status(200).json({ success: true, data: { assignments, notifications, attendanceSummary } });
  } catch (err) {
    next(err);
  }
};

exports.getMyAttendance = async (req, res, next) => {
  try {
    const student = req.user;
    const subjects = await Subject.find({ department: student.department, semester: student.semester, isActive: true }).populate("teacher", "name");
    const attendance = await Promise.all(
      subjects.map(async (sub) => {
        const records = await Attendance.find({ subject: sub._id, "records.student": student._id }).sort("-date");
        let present = 0;
        const detailedRecords = records.map((a) => {
          const r = a.records.find((item) => item.student.toString() === student._id.toString());
          if (r && ["present", "late"].includes(r.status)) present++;
          return { date: a.date, status: r?.status || "absent", remarks: r?.remarks, topic: a.topic };
        });
        const pct = calculateAttendancePercentage(present, records.length);
        return {
          subject: sub,
          total: records.length,
          present,
          absent: records.length - present,
          percentage: pct,
          ...getAttendanceStatus(pct),
          records: detailedRecords,
        };
      }),
    );
    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    next(err);
  }
};

exports.getMyAssignments = async (req, res, next) => {
  try {
    const student = req.user;
    const assignments = await Assignment.find({ department: student.department, semester: student.semester, isPublished: true }).populate("subject", "name code").populate("teacher", "name").sort("-dueDate");
    const withStatus = assignments.map((a) => {
      const submission = a.submissions.find((s) => s.student.toString() === student._id.toString());
      return {
        ...a.toObject(),
        mySubmission: submission || null,
        submissionStatus: submission ? submission.status : "not_submitted",
        isOverdue: !submission && new Date(a.dueDate) < new Date(),
      };
    });
    res.status(200).json({ success: true, data: withStatus });
  } catch (err) {
    next(err);
  }
};

exports.submitAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, department: req.user.department, semester: req.user.semester });
    if (!assignment) return next(new AppError("Assignment not found.", 404));
    const alreadySubmitted = assignment.submissions.find((s) => s.student.toString() === req.user._id.toString());
    if (alreadySubmitted) return next(new AppError("Already submitted.", 400));
    const files = req.files ? req.files.map((f) => ({ name: f.originalname, url: f.path, publicId: f.filename })) : [];
    const isLate = new Date() > new Date(assignment.dueDate);
    assignment.submissions.push({ student: req.user._id, files, status: isLate ? "late" : "submitted" });
    assignment.totalSubmissions = assignment.submissions.length;
    await assignment.save();
    res.status(200).json({ success: true, message: isLate ? "Assignment submitted (late)." : "Assignment submitted.", data: assignment });
  } catch (err) {
    next(err);
  }
};

exports.getMyResults = async (req, res, next) => {
  try {
    const filter = { student: req.user._id, isPublished: true };
    if (req.query.semester) filter.semester = Number(req.query.semester);
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    const results = await Result.find(filter).populate("subject", "name code credits type").sort("semester");
    const bySemester = results.reduce((acc, r) => {
      const sem = r.semester;
      if (!acc[sem]) acc[sem] = [];
      acc[sem].push(r);
      return acc;
    }, {});
    const semesterSummaries = Object.entries(bySemester).map(([sem, semResults]) => ({
      semester: Number(sem),
      sgpa: calculateCGPA(semResults),
      results: semResults,
    }));
    const cgpa = calculateCGPA(results);
    res.status(200).json({ success: true, data: { semesterSummaries, cgpa, totalSubjects: results.length } });
  } catch (err) {
    next(err);
  }
};

exports.getMyTimetable = async (req, res, next) => {
  try {
    const timetable = await Timetable.findOne({ department: req.user.department, semester: req.user.semester, isActive: true }).populate("schedule.slots.subject", "name code").populate("schedule.slots.teacher", "name");
    res.status(200).json({ success: true, data: timetable });
  } catch (err) {
    next(err);
  }
};
