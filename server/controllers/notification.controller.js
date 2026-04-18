const Notification = require("../models/Notification");

exports.getMyNotifications = async (req, res, next) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const query = {
      isActive: true,
      $or: [
        { recipients: user._id },
        { recipientRole: "all" },
        { recipientRole: `${user.role}s`, department: null },
        { recipientRole: "department", department: user.department },
      ],
    };
    if (req.query.type) query.type = req.query.type;
    const [notifications, total] = await Promise.all([
      Notification.find(query).populate("sender", "name role profileImage").sort("-createdAt").skip(skip).limit(limit),
      Notification.countDocuments(query),
    ]);
    const withReadStatus = notifications.map((n) => ({ ...n.toObject(), isRead: n.isReadBy(user._id) }));
    const unreadCount = withReadStatus.filter((n) => !n.isRead).length;
    res.status(200).json({ success: true, data: { notifications: withReadStatus, unreadCount, pagination: { page, limit, total } } });
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: { user: req.user._id } } });
    res.status(200).json({ success: true, message: "Marked as read." });
  } catch (err) {
    next(err);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      isActive: true,
      $or: [{ recipients: req.user._id }, { recipientRole: { $in: ["all", `${req.user.role}s`] } }],
      "readBy.user": { $ne: req.user._id },
    });
    await Promise.all(notifications.map((n) => Notification.findByIdAndUpdate(n._id, { $addToSet: { readBy: { user: req.user._id } } })));
    res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (err) {
    next(err);
  }
};

exports.createNotification = async (req, res, next) => {
  try {
    const { title, message, type, recipientRole, recipients, department, semester, priority, expiresAt } = req.body;
    const notification = await Notification.create({ title, message, type, sender: req.user._id, recipientRole, recipients, department, semester, priority, expiresAt });
    res.status(201).json({ success: true, message: "Notification sent.", data: notification });
  } catch (err) {
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: "Notification removed." });
  } catch (err) {
    next(err);
  }
};
