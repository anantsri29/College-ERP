import { useLocation } from "react-router-dom";
import TeacherDashboardPage from "./TeacherDashboardPage";

const tabByPath = {
  "/teacher/dashboard": "overview",
  "/teacher/attendance": "attendance",
  "/teacher/assignments": "assignments",
  "/teacher/announcements": "announcements",
  "/teacher/results": "results",
};

const TeacherFeaturePage = () => {
  const { pathname } = useLocation();
  return <TeacherDashboardPage initialTab={tabByPath[pathname] || "overview"} showTabs={false} />;
};

export default TeacherFeaturePage;
