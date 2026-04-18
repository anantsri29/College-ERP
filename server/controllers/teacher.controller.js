const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const Assignment = require("../models/Assignment");
const Result = require("../models/Result");
const Subject = require("../models/Subject");
const User = require("../models/User");
const Notification = require("../models/Notification");
const AppError = require("../utils/AppError");

exports.getDashboard = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ teacher: req.user._id, isActive: true }).populate("department", "name");
    const [assignmentCount, pendingGrading] = await Promise.all([
      Assignment.countDocuments({ teacher: req.user._id }),
      Assignment.countDocuments({ teacher: req.user._id, "submissions.status": "submitted" }),
    ]);
    res.status(200).json({ success: true, data: { subjects, stats: { assignmentCount, pendingGrading } } });
  } catch (err) {
    next(err);
  }
};

exports.getMySubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ teacher: req.user._id, isActive: true }).populate("department", "name");
    res.status(200).json({ success: true, data: subjects });
  } catch (err) {
    next(err);
  }
};

exports.getSubjectStudents = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.subjectId, teacher: req.user._id });
    if (!subject) return next(new AppError("Subject not found or not assigned to you.", 404));
    const students = await User.find({ department: subject.department, semester: subject.semester, role: "student", isActive: true }).sort("rollNumber");
    res.status(200).json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
};

exports.markAttendance = async (req, res, next) => {
  try {
    const { subject, date, records, lectureType, topic, semester, academicYear } = req.body;
    const subjectDoc = await Subject.findOne({ _id: subject, teacher: req.user._id });
    if (!subjectDoc) return next(new AppError("Subject not assigned to you.", 403));
    const existing = await Attendance.findOne({ subject, date: new Date(date) });
    if (existing) return next(new AppError("Attendance already marked for this date.", 400));
    const attendance = await Attendance.create({
      subject,
      teacher: req.user._id,
      department: subjectDoc.department,
      date: new Date(date),
      records,
      lectureType,
      topic,
      semester,
      academicYear,
    });
    res.status(201).json({ success: true, message: "Attendance marked.", data: attendance });
  } catch (err) {
    next(err);
  }
};

exports.updateAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!attendance) return next(new AppError("Attendance not found.", 404));
    if (attendance.isLocked) return next(new AppError("Attendance is locked.", 403));
    attendance.records = req.body.records || attendance.records;
    attendance.topic = req.body.topic || attendance.topic;
    await attendance.save();
    res.status(200).json({ success: true, message: "Attendance updated.", data: attendance });
  } catch (err) {
    next(err);
  }
};

exports.getAttendanceBySubject = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { subject: new mongoose.Types.ObjectId(req.params.subjectId), teacher: req.user._id };
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }
    const records = await Attendance.find(match).sort("-date").populate("records.student", "name rollNumber");
    res.status(200).json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

exports.getAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ teacher: req.user._id }).populate("subject", "name code").sort("-createdAt");
    res.status(200).json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
};

exports.createAssignment = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.body.subject, teacher: req.user._id });
    if (!subject) return next(new AppError("Subject not assigned to you.", 403));
    const attachments = req.files ? req.files.map((f) => ({ name: f.originalname, url: f.path, publicId: f.filename })) : [];
    const assignment = await Assignment.create({ ...req.body, teacher: req.user._id, department: subject.department, semester: subject.semester, attachments });
    res.status(201).json({ success: true, message: "Assignment created.", data: assignment });
  } catch (err) {
    next(err);
  }
};

exports.updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOneAndUpdate({ _id: req.params.id, teacher: req.user._id }, req.body, { new: true, runValidators: true });
    if (!assignment) return next(new AppError("Assignment not found.", 404));
    res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    await Assignment.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
    res.status(200).json({ success: true, message: "Assignment deleted." });
  } catch (err) {
    next(err);
  }
};

exports.getAssignmentSubmissions = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, teacher: req.user._id }).populate("submissions.student", "name rollNumber email");
    if (!assignment) return next(new AppError("Assignment not found.", 404));
    res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};

exports.gradeSubmission = async (req, res, next) => {
  try {
    const { marks, feedback } = req.body;
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user._id, "submissions.student": req.params.studentId },
      {
        $set: {
          "submissions.$.marks": marks,
          "submissions.$.feedback": feedback,
          "submissions.$.status": "graded",
          "submissions.$.gradedAt": new Date(),
          "submissions.$.gradedBy": req.user._id,
        },
      },
      { new: true },
    );
    if (!assignment) return next(new AppError("Submission not found.", 404));
    res.status(200).json({ success: true, message: "Submission graded.", data: assignment });
  } catch (err) {
    next(err);
  }
};

exports.getResults = async (req, res, next) => {
  try {
    const { subject, semester, academicYear } = req.query;
    const filter = { enteredBy: req.user._id };
    if (subject) filter.subject = subject;
    if (semester) filter.semester = Number(semester);
    if (academicYear) filter.academicYear = academicYear;
    const results = await Result.find(filter).populate("student", "name rollNumber").populate("subject", "name code");
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

exports.createOrUpdateResult = async (req, res, next) => {
  try {
    const subjectDoc = await Subject.findOne({ _id: req.body.subject, teacher: req.user._id });
    if (!subjectDoc) return next(new AppError("Subject not assigned to you.", 403));
    const result = await Result.findOneAndUpdate(
      { student: req.body.student, subject: req.body.subject, academicYear: req.body.academicYear },
      { ...req.body, department: subjectDoc.department, enteredBy: req.user._id, updatedBy: req.user._id },
      { new: true, upsert: true, runValidators: true },
    )
      .populate("student", "name rollNumber")
      .populate("subject", "name code");
    res.status(200).json({ success: true, message: "Result saved.", data: result });
  } catch (err) {
    next(err);
  }
};

exports.bulkCreateResults = async (req, res, next) => {
  try {
    const { results } = req.body;
    const saved = [];
    for (const r of results) {
      const subjectDoc = await Subject.findOne({ _id: r.subject, teacher: req.user._id });
      if (!subjectDoc) continue;
      const result = await Result.findOneAndUpdate(
        { student: r.student, subject: r.subject, academicYear: r.academicYear },
        { ...r, department: subjectDoc.department, enteredBy: req.user._id, updatedBy: req.user._id },
        { new: true, upsert: true },
      );
      saved.push(result);
    }
    res.status(200).json({ success: true, message: `${saved.length} results saved.`, data: saved });
  } catch (err) {
    next(err);
  }
};

exports.publishResults = async (req, res, next) => {
  try {
    const { subject, semester, academicYear } = req.body;
    await Result.updateMany({ subject, semester, academicYear, enteredBy: req.user._id }, { isPublished: true, publishedAt: new Date() });
    res.status(200).json({ success: true, message: "Results published." });
  } catch (err) {
    next(err);
  }
};

exports.sendAnnouncement = async (req, res, next) => {
  try {
    const { title, message, subject, priority } = req.body;
    const subjectDoc = await Subject.findOne({ _id: subject, teacher: req.user._id });
    if (!subjectDoc) return next(new AppError("Subject not assigned to you.", 403));
    const students = await User.find({ department: subjectDoc.department, semester: subjectDoc.semester, role: "student", isActive: true }, "_id");
    const notification = await Notification.create({
      title,
      message,
      type: "announcement",
      sender: req.user._id,
      recipients: students.map((s) => s._id),
      subject,
      department: subjectDoc.department,
      priority: priority || "medium",
    });
    res.status(201).json({ success: true, message: "Announcement sent.", data: notification });
  } catch (err) {
    next(err);
  }
};
