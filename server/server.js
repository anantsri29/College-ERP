const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const AppError = require("./utils/AppError");
const socketHandler = require("./socket/socketHandler");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const subadminRoutes = require("./routes/subadmin.routes");
const teacherRoutes = require("./routes/teacher.routes");
const studentRoutes = require("./routes/student.routes");
const notificationRoutes = require("./routes/notification.routes");
const leaveRoutes = require("./routes/leave.routes");
const uploadRoutes = require("./routes/upload.routes");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "https://college-erp-fr.onrender.com",
  "https://college-erp.onrender.com",
];

// ================= SOCKET =================
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

socketHandler(io);
app.set("io", io);

// ================= DB =================
connectDB();

// ================= SECURITY MIDDLEWARE =================
app.use(helmet());
app.use(mongoSanitize());

// ================= CORS =================
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// ================= OTHER MIDDLEWARE =================
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login attempts. Try again later.",
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ================= HEALTH CHECK =================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subadmin", subadminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/upload", uploadRoutes);

// ================= ROOT =================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "College ERP API Running",
  });
});

// ================= 404 HANDLER =================
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
});

// ================= ERROR HANDLER =================
app.use(errorHandler);

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = { app, server, io };
