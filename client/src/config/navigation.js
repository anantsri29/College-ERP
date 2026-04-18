export const ROLE_NAV = {
  admin: [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Users", to: "/admin/users" },
    { label: "Departments", to: "/admin/departments" },
    { label: "Academic Year", to: "/admin/academic-years" },
    { label: "Reports", to: "/admin/reports" },
  ],
  subadmin: [
    { label: "Dashboard", to: "/subadmin/dashboard" },
    { label: "Teachers", to: "/subadmin/teachers" },
    { label: "Students", to: "/subadmin/students" },
    { label: "Subjects", to: "/subadmin/subjects" },
    { label: "Timetable", to: "/subadmin/timetable" },
    { label: "Leaves", to: "/subadmin/leaves" },
  ],
  teacher: [
    { label: "Dashboard", to: "/teacher/dashboard" },
    { label: "Attendance", to: "/teacher/attendance" },
    { label: "Assignments", to: "/teacher/assignments" },
    { label: "Results", to: "/teacher/results" },
    { label: "Announcements", to: "/teacher/announcements" },
    { label: "Leaves", to: "/teacher/leaves" },
  ],
  student: [
    { label: "Dashboard", to: "/student/dashboard" },
    { label: "Attendance", to: "/student/attendance" },
    { label: "Assignments", to: "/student/assignments" },
    { label: "Results", to: "/student/results" },
    { label: "Timetable", to: "/student/timetable" },
    { label: "Leaves", to: "/student/leave" },
  ],
};

