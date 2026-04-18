const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    applicantRole: { type: String, enum: ["teacher", "student"], required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    type: { type: String, enum: ["casual", "medical", "emergency", "study", "maternity", "duty"], required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    totalDays: { type: Number },
    reason: { type: String, required: true, trim: true },
    document: { type: String },
    documentPublicId: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected", "cancelled"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewRemarks: { type: String },
    reviewedAt: { type: Date },
    notifiedAt: { type: Date },
  },
  { timestamps: true },
);

leaveRequestSchema.index({ applicant: 1, status: 1 });
leaveRequestSchema.index({ department: 1, status: 1 });

leaveRequestSchema.pre("save", function () {
  if (this.fromDate && this.toDate) {
    const diff = Math.ceil((this.toDate - this.fromDate) / (1000 * 60 * 60 * 24)) + 1;
    this.totalDays = diff;
  }
});

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
