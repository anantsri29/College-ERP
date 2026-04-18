const mongoose = require("mongoose");

const semesterInfoSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    name: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    examStartDate: { type: Date },
    examEndDate: { type: Date },
    isActive: { type: Boolean, default: false },
    resultPublished: { type: Boolean, default: false },
  },
  { _id: false },
);

const academicYearSchema = new mongoose.Schema(
  {
    year: { type: String, required: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    semesters: [semesterInfoSchema],
    isCurrent: { type: Boolean, default: false },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

academicYearSchema.pre("save", async function () {
  if (this.isCurrent && this.isModified("isCurrent")) {
    await this.constructor.updateMany({ _id: { $ne: this._id } }, { isCurrent: false });
  }
});

module.exports = mongoose.model("AcademicYear", academicYearSchema);
