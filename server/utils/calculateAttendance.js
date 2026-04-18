exports.calculateAttendancePercentage = (present, total) => {
  if (!total) return 0;
  return parseFloat(((present / total) * 100).toFixed(2));
};

exports.getAttendanceStatus = (percentage) => {
  if (percentage >= 75) return { status: "good", label: "Good", color: "green" };
  if (percentage >= 60) return { status: "warning", label: "Low", color: "yellow" };
  return { status: "danger", label: "Critical", color: "red" };
};

exports.getLecturesNeeded = (present, total, targetPct = 75) => {
  const target = targetPct / 100;
  if (total > 0 && present / total >= target) return 0;
  const needed = Math.ceil((target * total - present) / (1 - target));
  return needed > 0 ? needed : 0;
};

exports.getStudentSubjectAttendance = async (studentId, subjectId) => {
  const Attendance = require("../models/Attendance");
  const records = await Attendance.find({
    subject: subjectId,
    "records.student": studentId,
  });
  let present = 0;
  const total = records.length;
  records.forEach((a) => {
    const r = a.records.find((item) => item.student.toString() === studentId.toString());
    if (r && (r.status === "present" || r.status === "late")) present++;
  });
  return { present, total, percentage: exports.calculateAttendancePercentage(present, total) };
};
