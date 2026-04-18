const jwt = require("jsonwebtoken");
const User = require("../models/User");

const connectedUsers = new Map();

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).populate("department", "_id name");
      if (!user || !user.isActive) return next(new Error("User not found"));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    connectedUsers.set(userId, socket.id);
    socket.join(`role:${socket.user.role}`);
    if (socket.user.department) socket.join(`dept:${socket.user.department._id}`);
    socket.join(`user:${userId}`);

    socket.on("disconnect", () => {
      connectedUsers.delete(userId);
    });

    socket.on("notification:markRead", (notificationId) => {
      socket.emit("notification:readConfirmed", { notificationId });
    });
  });

  io.emitToUser = (userId, event, data) => {
    io.to(`user:${userId.toString()}`).emit(event, data);
  };
  io.emitToRole = (role, event, data) => {
    io.to(`role:${role}`).emit(event, data);
  };
  io.emitToDepartment = (deptId, event, data) => {
    io.to(`dept:${deptId.toString()}`).emit(event, data);
  };
};
