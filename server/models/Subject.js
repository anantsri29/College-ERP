const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    semester: { type: Number, required: true, min: 1, max: 8 },
    credits: { type: Number, required: true, min: 1, max: 6 },
    type: { type: String, enum: ["theory", "practical", "elective", "project"], default: "theory" },
    maxInternalMarks: { type: Number, default: 30 },
    maxExternalMarks: { type: Number, default: 70 },
    maxMarks: { type: Number, default: 100 },
    syllabus: { type: String },
    syllabusPublicId: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    academicYear: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

subjectSchema.index({ department: 1, semester: 1 });
subjectSchema.index({ teacher: 1 });

module.exports = mongoose.model("Subject", subjectSchema);
