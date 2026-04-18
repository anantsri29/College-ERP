const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["present", "absent", "late", "excused"], default: "absent" },
    remarks: { type: String, trim: true },
  },
  { _id: false },
);

const attendanceSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    academicYear: { type: String, required: true },
    semester: { type: Number, required: true },
    date: { type: Date, required: true },
    lectureType: { type: String, enum: ["lecture", "lab", "tutorial"], default: "lecture" },
    lectureNumber: { type: Number },
    topic: { type: String, trim: true },
    records: [attendanceRecordSchema],
    totalPresent: { type: Number, default: 0 },
    totalAbsent: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    lockedAt: { type: Date },
  },
  { timestamps: true },
);

attendanceSchema.index({ subject: 1, date: 1 }, { unique: true });
attendanceSchema.index({ department: 1, date: 1 });
attendanceSchema.index({ "records.student": 1 });

attendanceSchema.pre("save", function () {
  this.totalPresent = this.records.filter((r) => r.status === "present" || r.status === "late").length;
  this.totalAbsent = this.records.filter((r) => r.status === "absent").length;
});

module.exports = mongoose.model("Attendance", attendanceSchema);
