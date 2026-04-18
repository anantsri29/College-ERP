const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    submittedAt: { type: Date, default: Date.now },
    files: [{ name: String, url: String, publicId: String, size: Number }],
    marks: { type: Number, default: null },
    feedback: { type: String },
    status: { type: String, enum: ["submitted", "late", "graded", "resubmit"], default: "submitted" },
    gradedAt: { type: Date },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    semester: { type: Number, required: true },
    academicYear: { type: String },
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, required: true, default: 10 },
    instructions: { type: String },
    attachments: [{ name: String, url: String, publicId: String }],
    allowedFileTypes: { type: [String], default: ["pdf", "doc", "docx", "zip", "jpg", "png"] },
    maxFileSizeMB: { type: Number, default: 10 },
    isPublished: { type: Boolean, default: true },
    submissions: [submissionSchema],
    totalSubmissions: { type: Number, default: 0 },
  },
  { timestamps: true },
);

assignmentSchema.index({ subject: 1, dueDate: 1 });
assignmentSchema.index({ department: 1, semester: 1 });
assignmentSchema.index({ "submissions.student": 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
