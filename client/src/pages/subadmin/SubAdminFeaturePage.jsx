import { useLocation } from "react-router-dom";
import SubAdminDashboardPage from "./SubAdminDashboardPage";

const tabByPath = {
  "/subadmin/dashboard": "teachers",
  "/subadmin/teachers": "teachers",
  "/subadmin/students": "students",
  "/subadmin/subjects": "subjects",
  "/subadmin/leaves": "leaves",
  "/subadmin/attendance": "attendance",
  "/subadmin/timetable": "timetable",
};

const SubAdminFeaturePage = () => {
  const { pathname } = useLocation();
  return <SubAdminDashboardPage initialTab={tabByPath[pathname] || "teachers"} showTabs={false} />;
};

export default SubAdminFeaturePage;
