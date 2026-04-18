const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true },
    hod: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    subAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    totalSeats: { type: Number, default: 60 },
    establishedYear: { type: Number },
    building: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

departmentSchema.virtual("studentCount", {
  ref: "User",
  localField: "_id",
  foreignField: "department",
  count: true,
  match: { role: "student", isActive: true },
});
departmentSchema.virtual("teacherCount", {
  ref: "User",
  localField: "_id",
  foreignField: "department",
  count: true,
  match: { role: "teacher", isActive: true },
});
departmentSchema.virtual("subjectCount", {
  ref: "Subject",
  localField: "_id",
  foreignField: "department",
  count: true,
});

module.exports = mongoose.model("Department", departmentSchema);
