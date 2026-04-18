const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    room: { type: String, trim: true },
    type: { type: String, enum: ["lecture", "lab", "tutorial", "break", "free"], default: "lecture" },
    isBreak: { type: Boolean, default: false },
    breakLabel: { type: String },
  },
  { _id: true },
);

const dayScheduleSchema = new mongoose.Schema(
  {
    day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], required: true },
    slots: [slotSchema],
  },
  { _id: false },
);

const timetableSchema = new mongoose.Schema(
  {
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    academicYear: { type: String, required: true },
    section: { type: String, default: "A" },
    schedule: [dayScheduleSchema],
    effectiveFrom: { type: Date },
    effectiveTo: { type: Date },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

timetableSchema.index({ department: 1, semester: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model("Timetable", timetableSchema);
