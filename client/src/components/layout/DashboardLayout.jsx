import { Link, Outlet, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { FaUserGraduate, FaUsers, FaChalkboardTeacher, FaBookOpen, FaBell, FaClipboardList, FaCalendarAlt, FaChartBar, FaBars } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";
import { useState } from "react";

const DashboardLayout = () => {
  const [openMobileNav, setOpenMobileNav] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { notifications } = useSocket();

  const menuByRole = {
    admin: [
      { to: "/admin/dashboard", label: "Overview", icon: <FaChartBar /> },
      { to: "/admin/users", label: "Users", icon: <FaUsers /> },
      { to: "/admin/departments", label: "Departments", icon: <FaBookOpen /> },
      { to: "/admin/academic-years", label: "Academic Years", icon: <FaCalendarAlt /> },
      { to: "/admin/reports", label: "Reports", icon: <FaClipboardList /> },
    ],
    subadmin: [
      { to: "/subadmin/dashboard", label: "Overview", icon: <FaChartBar /> },
      { to: "/subadmin/teachers", label: "Teachers", icon: <FaChalkboardTeacher /> },
      { to: "/subadmin/students", label: "Students", icon: <FaUserGraduate /> },
      { to: "/subadmin/subjects", label: "Subjects", icon: <FaBookOpen /> },
      { to: "/subadmin/leaves", label: "Leaves", icon: <FaClipboardList /> },
      { to: "/subadmin/attendance", label: "Attendance", icon: <FaClipboardList /> },
      { to: "/subadmin/timetable", label: "Timetable", icon: <FaCalendarAlt /> },
    ],
    teacher: [
      { to: "/teacher/dashboard", label: "Overview", icon: <FaChartBar /> },
      { to: "/teacher/attendance", label: "Attendance", icon: <FaClipboardList /> },
      { to: "/teacher/assignments", label: "Assignments", icon: <FaBookOpen /> },
      { to: "/teacher/announcements", label: "Announcements", icon: <FaBell /> },
      { to: "/teacher/results", label: "Results", icon: <FaChartBar /> },
    ],
    student: [
      { to: "/student/dashboard", label: "Overview", icon: <FaChartBar /> },
      { to: "/student/attendance", label: "Attendance", icon: <FaClipboardList /> },
      { to: "/student/assignments", label: "Assignments", icon: <FaBookOpen /> },
      { to: "/student/results", label: "Results", icon: <FaChartBar /> },
      { to: "/student/timetable", label: "Timetable", icon: <FaCalendarAlt /> },
      { to: "/student/notifications", label: "Notifications", icon: <FaBell /> },
      { to: "/student/leave", label: "Leave", icon: <FaClipboardList /> },
    ],
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
  };

  return (
    <div className="app-shell md:grid md:grid-cols-[260px_1fr]">
      {openMobileNav && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setOpenMobileNav(false)}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[260px] bg-slate-900 text-white p-4 transform transition-transform duration-200 md:translate-x-0 ${openMobileNav ? "translate-x-0" : "-translate-x-full"} md:static`}>
        <div className="mb-6">
          <h2 className="text-xl font-bold">College ERP</h2>
          <p className="text-xs text-slate-400">{user?.role?.toUpperCase()} PORTAL</p>
        </div>
        <div className="space-y-1">
          {(menuByRole[user?.role] || []).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpenMobileNav(false)}
              className={`flex items-center gap-3 text-sm rounded-xl px-3 py-2.5 transition ${
                location.pathname === item.to ? "bg-indigo-600 text-white" : "text-slate-200 hover:bg-slate-800"
              }`}
            >
              <span className="text-slate-300">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 md:px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Toggle navigation"
                className="md:hidden text-slate-600"
                onClick={() => setOpenMobileNav((p) => !p)}
              >
                <FaBars />
              </button>
              <div>
                <h1 className="font-semibold text-slate-900 text-lg">College ERP</h1>
                <p className="text-xs text-slate-500">Smart Campus Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaBell className="text-slate-500" />
                {notifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 text-[10px] bg-indigo-600 text-white rounded-full px-1.5 py-0.5">
                    {notifications.length}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-700">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs btn-secondary rounded-lg px-3 py-1.5"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <div className="max-w-[1440px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
