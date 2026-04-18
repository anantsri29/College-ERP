import { Navigate, Route, Routes } from "react-router-dom";
import RoleLayout from "./layouts/RoleLayout";
import LoginPage from "./pages/auth/LoginPage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminDepartmentsPage from "./pages/admin/AdminDepartmentsPage";
import AdminAcademicYearsPage from "./pages/admin/AdminAcademicYearsPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import SubAdminOverviewPage from "./pages/subadmin/SubAdminOverviewPage";
import SubAdminTeachersPage from "./pages/subadmin/SubAdminTeachersPage";
import SubAdminStudentsPage from "./pages/subadmin/SubAdminStudentsPage";
import SubAdminSubjectsPage from "./pages/subadmin/SubAdminSubjectsPage";
import SubAdminLeavesPage from "./pages/subadmin/SubAdminLeavesPage";
import SubAdminAttendancePage from "./pages/subadmin/SubAdminAttendancePage";
import SubAdminTimetablePage from "./pages/subadmin/SubAdminTimetablePage";
import TeacherOverviewPage from "./pages/teacher/TeacherOverviewPage";
import TeacherAttendancePage from "./pages/teacher/TeacherAttendancePage";
import TeacherAssignmentsPage from "./pages/teacher/TeacherAssignmentsPage";
import TeacherAnnouncementsPage from "./pages/teacher/TeacherAnnouncementsPage";
import TeacherResultsPage from "./pages/teacher/TeacherResultsPage";
import StudentOverviewPage from "./pages/student/StudentOverviewPage";
import StudentAttendancePage from "./pages/student/StudentAttendancePage";
import StudentAssignmentsPage from "./pages/student/StudentAssignmentsPage";
import StudentResultsPage from "./pages/student/StudentResultsPage";
import StudentTimetablePage from "./pages/student/StudentTimetablePage";
import StudentNotificationsPage from "./pages/student/StudentNotificationsPage";
import StudentLeavePage from "./pages/student/StudentLeavePage";
import ProtectedRoute from "./routes/ProtectedRoute";
import MyProfilePage from "./pages/shared/MyProfilePage";
import ChangePasswordPage from "./pages/shared/ChangePasswordPage";

const Unauthorized = () => <div className="p-6">You are not authorized for this page.</div>;

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        element={
          <ProtectedRoute allowedRoles={["admin", "subadmin", "teacher", "student"]}>
            <RoleLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDepartmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/academic-years"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAcademicYearsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subadmin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["subadmin"]}>
              <SubAdminOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route path="/subadmin/teachers" element={<ProtectedRoute allowedRoles={["subadmin"]}><SubAdminTeachersPage /></ProtectedRoute>} />
        <Route path="/subadmin/students" element={<ProtectedRoute allowedRoles={["subadmin"]}><SubAdminStudentsPage /></ProtectedRoute>} />
        <Route path="/subadmin/subjects" element={<ProtectedRoute allowedRoles={["subadmin"]}><SubAdminSubjectsPage /></ProtectedRoute>} />
        <Route path="/subadmin/leaves" element={<ProtectedRoute allowedRoles={["subadmin"]}><SubAdminLeavesPage /></ProtectedRoute>} />
        <Route path="/subadmin/attendance" element={<ProtectedRoute allowedRoles={["subadmin"]}><SubAdminAttendancePage /></ProtectedRoute>} />
        <Route path="/subadmin/timetable" element={<ProtectedRoute allowedRoles={["subadmin"]}><SubAdminTimetablePage /></ProtectedRoute>} />
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route path="/teacher/attendance" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherAttendancePage /></ProtectedRoute>} />
        <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherAssignmentsPage /></ProtectedRoute>} />
        <Route path="/teacher/announcements" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherAnnouncementsPage /></ProtectedRoute>} />
        <Route path="/teacher/results" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherResultsPage /></ProtectedRoute>} />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={["student"]}><StudentAttendancePage /></ProtectedRoute>} />
        <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={["student"]}><StudentAssignmentsPage /></ProtectedRoute>} />
        <Route path="/student/results" element={<ProtectedRoute allowedRoles={["student"]}><StudentResultsPage /></ProtectedRoute>} />
        <Route path="/student/timetable" element={<ProtectedRoute allowedRoles={["student"]}><StudentTimetablePage /></ProtectedRoute>} />
        <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={["student"]}><StudentNotificationsPage /></ProtectedRoute>} />
        <Route path="/student/leave" element={<ProtectedRoute allowedRoles={["student"]}><StudentLeavePage /></ProtectedRoute>} />

        <Route path="/profile" element={<MyProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
