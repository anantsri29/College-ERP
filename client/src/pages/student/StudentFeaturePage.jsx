import { useLocation } from "react-router-dom";
import StudentDashboardPage from "./StudentDashboardPage";

const tabByPath = {
  "/student/dashboard": "overview",
  "/student/attendance": "attendance",
  "/student/assignments": "assignments",
  "/student/results": "results",
  "/student/timetable": "timetable",
  "/student/notifications": "notifications",
  "/student/leave": "leave",
};

const StudentFeaturePage = () => {
  const { pathname } = useLocation();
  return <StudentDashboardPage initialTab={tabByPath[pathname] || "overview"} showTabs={false} />;
};

export default StudentFeaturePage;
