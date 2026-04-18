const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["announcement", "assignment", "result", "attendance", "leave", "system", "event", "fee"],
      default: "announcement",
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    recipientRole: { type: String, enum: ["all", "students", "teachers", "subadmins", "department", null], default: null },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    semester: { type: Number, default: null },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null },
    readBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, readAt: { type: Date, default: Date.now } }],
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    attachments: [{ name: String, url: String, publicId: String }],
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    relatedEntity: { type: String },
    relatedEntityId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
);

notificationSchema.index({ recipients: 1, createdAt: -1 });
notificationSchema.index({ department: 1, recipientRole: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

notificationSchema.methods.isReadBy = function (userId) {
  return this.readBy.some((r) => r.user.toString() === userId.toString());
};

module.exports = mongoose.model("Notification", notificationSchema);
