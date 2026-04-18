const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    semester: { type: Number, required: true },
    academicYear: { type: String, required: true },
    internalMarks: { type: Number, default: 0 },
    externalMarks: { type: Number, default: 0 },
    practicalMarks: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    maxInternalMarks: { type: Number, default: 30 },
    maxExternalMarks: { type: Number, default: 70 },
    maxTotalMarks: { type: Number, default: 100 },
    percentage: { type: Number, default: 0 },
    grade: { type: String },
    gradePoints: { type: Number, default: 0 },
    credits: { type: Number, default: 3 },
    creditPoints: { type: Number, default: 0 },
    status: { type: String, enum: ["pass", "fail", "pending", "absent", "withheld"], default: "pending" },
    remarks: { type: String },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

resultSchema.index({ student: 1, subject: 1, academicYear: 1 }, { unique: true });
resultSchema.index({ department: 1, semester: 1, academicYear: 1 });

resultSchema.pre("save", function () {
  this.totalMarks = (this.internalMarks || 0) + (this.externalMarks || 0) + (this.practicalMarks || 0);
  this.percentage = this.maxTotalMarks > 0 ? parseFloat(((this.totalMarks / this.maxTotalMarks) * 100).toFixed(2)) : 0;
  const g = calculateGradeFromPercentage(this.percentage);
  this.grade = g.grade;
  this.gradePoints = g.gradePoints;
  this.creditPoints = parseFloat((this.gradePoints * this.credits).toFixed(2));
  this.status = this.percentage >= 40 ? "pass" : this.status === "pending" ? "pending" : "fail";
});

function calculateGradeFromPercentage(pct) {
  if (pct >= 90) return { grade: "O", gradePoints: 10 };
  if (pct >= 80) return { grade: "A+", gradePoints: 9 };
  if (pct >= 70) return { grade: "A", gradePoints: 8 };
  if (pct >= 60) return { grade: "B+", gradePoints: 7 };
  if (pct >= 50) return { grade: "B", gradePoints: 6 };
  if (pct >= 40) return { grade: "C", gradePoints: 5 };
  return { grade: "F", gradePoints: 0 };
}

module.exports = mongoose.model("Result", resultSchema);
